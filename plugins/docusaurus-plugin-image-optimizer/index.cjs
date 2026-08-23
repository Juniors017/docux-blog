/**
 * Docusaurus Plugin: image-optimizer
 *
 * Compresses and resizes the raster images in the production build output
 * (`build/`) so the deployed site ships lighter images — without ever touching
 * your source files.
 *
 * How it stays fast and incremental:
 * - It runs in the `postBuild` lifecycle, i.e. only during `docusaurus build`
 *   (never during `docusaurus start`).
 * - Every image is keyed by a hash of its bytes + the optimization settings.
 *   The chosen (optimized) result is stored in a persistent cache
 *   (`node_modules/.cache/docusaurus-plugin-image-optimizer/`).
 * - On the next build, an image whose hash is already in the cache is restored
 *   from it instead of being re-encoded. So the first build processes every
 *   image; later builds only process the new or changed ones. In CI, caching
 *   that folder (see the GitHub Actions workflow) turns the already-optimized
 *   images into a build artifact reused across runs.
 *
 * Transform: each image is resized down to `maxWidth` (never enlarged) and
 * re-encoded at `quality`, keeping its original format (WebP → WebP, PNG → PNG,
 * JPEG → JPEG) so every existing reference keeps working. If optimizing doesn't
 * actually shrink the file, the original is kept.
 *
 * Width variants (`widths`): alongside each image, the plugin writes
 * `<name>-400w.<ext>`, `-800w` and so on, for use in a `srcset`. Three rules
 * make them safe to reference, and cheap to keep:
 *
 * 1. **Deterministic naming.** This runs in `postBuild`, so the HTML is already
 *    written by the time the variants appear. A component can therefore emit a
 *    `srcset` pointing at files that do not exist yet — they land moments later,
 *    in the same build, at exactly the expected paths.
 * 2. **A variant is written only when it is genuinely narrower than the source.**
 *    Nothing is written otherwise, so the obligation sits with the consumer:
 *    only reference a rung narrower than the image. See
 *    `src/theme/MDXComponents.js`, which knows each image's real width and
 *    derives its rungs from it, and `src/pages/index.jsx`, which has no such
 *    metadata and names rungs by hand — checked against 1760px+ card covers
 *    and the 1621px hero.
 *
 * 3. **A rung nothing references is never made** (`pruneUnreferenced`). A full
 *    ladder for every image is only worth it where something consumes it;
 *    elsewhere it is deployment weight nobody fetches. The HTML already exists
 *    when `postBuild` starts — rule 1's premise, read the other way — so the
 *    plugin asks the built site which rungs it names *before* encoding any,
 *    and skips the rest. Nothing is written, so nothing has to be cleaned up.
 *
 *    The scan covers HTML, JS and CSS. A rung referenced only from a JSON file,
 *    or through a URL assembled at runtime, would be skipped — set
 *    `pruneUnreferenced: false` if you build URLs that way.
 *
 * Animated images get no variants at all: resizing frames is the one thing this
 * plugin has always refused to risk.
 *
 * Options (all optional):
 * - quality     {number}   Encoder quality, 1–100. Default 80.
 * - maxWidth    {number}   Max width in px; wider images are downscaled. Default 1920.
 * - widths      {number[]} Widths to emit as `srcset` candidates. Default [400,800,1200,1600]; `[]` disables.
 * - extensions  {string[]} File extensions to process. Default [".png",".jpg",".jpeg",".webp"].
 * - cacheDir    {string}   Cache location. Default node_modules/.cache/docusaurus-plugin-image-optimizer.
 * - concurrency {number}   Parallel workers. Default 8.
 * - pruneUnreferenced {boolean} Skip rungs no page references. Default true.
 * - pruneCache  {boolean}  Delete cache entries this build did not use. Default true.
 *
 * Environment: `IMAGE_OPTIMIZER_FORCE=1 npm run build` re-encodes everything,
 * ignoring the cache for one run without deleting it.
 *
 * Written up in full, with the measurements and the mistakes, at
 * https://docuxlab.com/blog/image-optimizer-docusaurus-plugin/
 */

const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_OPTIONS = {
  quality: 80,
  maxWidth: 1920,
  widths: [400, 800, 1200, 1600],
  extensions: [".png", ".jpg", ".jpeg", ".webp"],
  cacheDir: null,
  concurrency: 8,
  pruneUnreferenced: true,
  pruneCache: true,
};

/** Files that can carry a URL a browser will actually fetch. */
const REFERENCING_EXTENSIONS = [".html", ".js", ".css"];

/** Matches a variant URL as it appears in `src`, `srcset` or `url()`. */
const VARIANT_REFERENCE = /[\w./@-]+-\d+w\.(?:webp|png|jpe?g)/gi;

/** `photo.webp` + 400 → `photo-400w.webp`. Deterministic, and that matters. */
function variantPath(file, width) {
  const ext = path.extname(file);
  return `${file.slice(0, -ext.length)}-${width}w${ext}`;
}

/** True for a file this plugin generated, so a rerun never treats one as a source. */
function isVariant(file) {
  return /-\d+w\.[a-z]+$/i.test(file);
}

// Bump when the optimization logic changes, to invalidate stale cache entries.
const CACHE_VERSION = "v1";

/**
 * Set `IMAGE_OPTIMIZER_FORCE=1` to re-encode everything, ignoring the cache.
 *
 * Useful when the encoding code changed but `CACHE_VERSION` did not, or simply
 * to confirm from scratch what the cache has been replaying. Results are still
 * written back, so the next build is incremental again.
 */
const FORCE_ENV = "IMAGE_OPTIMIZER_FORCE";

/** Read a file, or `null` when it isn't there. */
async function readIfExists(file) {
  try {
    return await fsp.readFile(file);
  } catch {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Recursively collect files whose extension is in `extensions`. */
async function collectImages(dir, extensions) {
  const found = [];
  async function walk(current) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (
        extensions.includes(path.extname(entry.name).toLowerCase()) &&
        !isVariant(entry.name)
      ) {
        found.push(full);
      }
    }
  }
  await walk(dir);
  return found;
}

/** Resize + re-encode a single image buffer, keeping its format. */
async function optimizeBuffer(sharp, buffer, ext, { quality, maxWidth }) {
  const animated = ext === ".webp" || ext === ".gif";
  let pipeline = sharp(buffer, { animated });
  const meta = await pipeline.metadata();

  // Only downscale still images; leave animated frames untouched to stay safe.
  if (maxWidth && meta.width && meta.width > maxWidth && !meta.pages) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  switch (ext) {
    case ".webp":
      pipeline = pipeline.webp({ quality });
      break;
    case ".png":
      pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality });
      break;
    case ".jpg":
    case ".jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    default:
      return null;
  }
  return pipeline.toBuffer();
}

/**
 * Re-encode a buffer at a given width, for a `srcset` candidate.
 *
 * Returns `null` — writing nothing — in two cases: an animated image, since
 * resizing frames is the one thing this plugin refuses to risk, and a source
 * already narrower than the target, since a copy under the candidate's name
 * would only add weight.
 *
 * The second case is why a caller must reference only rungs narrower than the
 * image. See the header for who holds to that.
 */
async function resizeBuffer(sharp, buffer, ext, width, { quality }) {
  const pipeline = sharp(buffer);
  const meta = await pipeline.metadata();
  if (meta.pages) return null;
  if (!meta.width || meta.width <= width) return null;

  let out = pipeline.resize({ width, withoutEnlargement: true });

  switch (ext) {
    case ".webp":
      out = out.webp({ quality });
      break;
    case ".png":
      out = out.png({ compressionLevel: 9, palette: true, quality });
      break;
    case ".jpg":
    case ".jpeg":
      out = out.jpeg({ quality, mozjpeg: true });
      break;
    default:
      return null;
  }
  return out.toBuffer();
}

/** Run `worker` over `items` with at most `limit` in flight at once. */
async function mapLimit(items, limit, worker) {
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const current = cursor++;
        await worker(items[current]);
      }
    }
  );
  await Promise.all(runners);
}

/**
 * Every variant URL the built site actually references.
 *
 * This is only knowable in `postBuild`, once the HTML exists — the same quirk
 * of timing that lets a component name a variant before it is written. Scans
 * HTML, JS and CSS, the three places a URL a browser fetches can live.
 */
async function collectReferences(dir) {
  const refs = new Set();
  async function walk(current) {
    for (const entry of await fsp.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (
        REFERENCING_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
      ) {
        const text = await fsp.readFile(full, "utf8");
        for (const match of text.match(VARIANT_REFERENCE) || []) {
          refs.add(match);
        }
      }
    }
  }
  await walk(dir);
  return refs;
}

/**
 * Does the built site point at this variant?
 *
 * A reference counts when it ends with the variant's path relative to the build
 * root, which tolerates a `baseUrl` prefix without matching a same-named file
 * in another folder. Bare filenames — a name quoted inside a code block, say —
 * do not match, since they carry no leading slash.
 */
function isReferenced(outDir, file, refs) {
  const rel = path.relative(outDir, file).split(path.sep).join("/");
  const suffix = `/${rel}`;
  for (const ref of refs) {
    if (ref === rel || ref.endsWith(suffix)) return true;
  }
  return false;
}

/**
 * Delete cache entries this run did not use.
 *
 * Without it the cache only ever grows: a bumped `CACHE_VERSION`, a changed
 * `quality`, or an image removed from the site all leave their old entries
 * behind under names nothing will ask for again. Since a full build touches
 * every entry that still matters, whatever it did not touch is dead.
 *
 * Losing an entry that turns out to be needed costs one re-encode, never
 * correctness — which is why this can be left on by default.
 */
async function pruneCacheDir(cacheDir, used) {
  const result = { removed: 0, bytes: 0 };
  for (const entry of await fsp.readdir(cacheDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = path.join(cacheDir, entry.name);
    if (used.has(full)) continue;
    try {
      const { size } = await fsp.stat(full);
      await fsp.unlink(full);
      result.removed++;
      result.bytes += size;
    } catch {
      // Already gone; nothing to account for.
    }
  }
  return result;
}

module.exports = function pluginImageOptimizer(context, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cacheDir =
    opts.cacheDir ||
    path.join(
      context.siteDir,
      "node_modules/.cache/docusaurus-plugin-image-optimizer"
    );
  const paramsSignature = `q${opts.quality}-w${opts.maxWidth}-${CACHE_VERSION}`;

  return {
    name: "docusaurus-plugin-image-optimizer",

    async postBuild({ outDir }) {
      let sharp;
      try {
        sharp = require("sharp");
      } catch {
        console.warn(
          "[image-optimizer] `sharp` is not installed — skipping image optimization."
        );
        return;
      }

      const force = Boolean(process.env[FORCE_ENV]);
      if (force) {
        console.log(`[image-optimizer] ${FORCE_ENV} set — ignoring the cache.`);
      }

      await fsp.mkdir(cacheDir, { recursive: true });
      const images = await collectImages(outDir, opts.extensions);

      // Collected before a single byte is encoded. The HTML is already written
      // when `postBuild` starts — the same fact deterministic naming rests on —
      // so the site can be asked which rungs it wants before we make any.
      const refs = opts.pruneUnreferenced
        ? await collectReferences(outDir)
        : null;

      const stats = {
        optimized: 0,
        fromCache: 0,
        noGain: 0,
        failed: 0,
        before: 0,
        after: 0,
        variantsMade: 0,
        variantsFromCache: 0,
        variantBytes: 0,
        variantsSkipped: 0,
        cacheRemoved: 0,
        cacheBytes: 0,
      };

      // Cache entries this run relied on. Anything else in the folder is dead.
      const usedCacheFiles = new Set();

      await mapLimit(images, opts.concurrency, async (file) => {
        try {
          const original = await fsp.readFile(file);
          stats.before += original.length;

          const hash = crypto
            .createHash("sha256")
            .update(original)
            .digest("hex");
          const ext = path.extname(file).toLowerCase();
          const cacheFile = path.join(
            cacheDir,
            `${hash}-${paramsSignature}${ext}`
          );

          // The cache stores the "best" bytes we decided to keep for this
          // source image (either the optimized version or the original).
          let best = force ? null : await readIfExists(cacheFile);
          if (best) {
            stats.fromCache++;
          } else {
            const optimized = await optimizeBuffer(sharp, original, ext, opts);
            best =
              optimized && optimized.length < original.length
                ? optimized
                : original;
            await fsp.writeFile(cacheFile, best);
            if (best.length < original.length) stats.optimized++;
            else stats.noGain++;
          }
          usedCacheFiles.add(cacheFile);

          if (best.length < original.length) {
            await fsp.writeFile(file, best);
            stats.after += best.length;
          } else {
            stats.after += original.length;
          }

          // Width variants, so a card of 360px stops downloading a 1760px file.
          // Derived from `best` rather than from the original: the ladder then
          // inherits the same resize and quality decisions.
          for (const width of opts.widths) {
            const target = variantPath(file, width);

            // Nothing on the site asks for this rung: skip it before spending
            // an encode on it. `continue`, not `break` — a wider rung further
            // up the ladder may well be referenced.
            if (refs && !isReferenced(outDir, target, refs)) {
              stats.variantsSkipped++;
              continue;
            }

            const variantCache = path.join(
              cacheDir,
              `${hash}-${paramsSignature}-${width}w${ext}`
            );

            let bytes = force ? null : await readIfExists(variantCache);
            if (bytes) {
              stats.variantsFromCache++;
            } else {
              bytes = await resizeBuffer(sharp, best, ext, width, opts);
              // Animated, or already narrower than this rung: nothing to write,
              // and nothing wider up the ladder either.
              if (!bytes) break;
              await fsp.writeFile(variantCache, bytes);
              stats.variantsMade++;
            }
            // After the `break` above, so a rung that writes nothing is not
            // counted as a live cache entry.
            usedCacheFiles.add(variantCache);

            await fsp.writeFile(target, bytes);
            stats.variantBytes += bytes.length;
          }
        } catch (err) {
          stats.failed++;
          console.warn(
            `[image-optimizer] Skipped ${path.basename(file)}: ${err.message}`
          );
        }
      });

      if (opts.pruneCache && !stats.failed) {
        const swept = await pruneCacheDir(cacheDir, usedCacheFiles);
        stats.cacheRemoved = swept.removed;
        stats.cacheBytes = swept.bytes;
      }

      const saved = stats.before - stats.after;
      const percent = stats.before
        ? ((saved / stats.before) * 100).toFixed(1)
        : "0.0";

      console.log("\n=== Image optimizer ===");
      console.log(
        `Images: ${images.length}  (optimized: ${stats.optimized}, from cache: ${stats.fromCache}, no gain: ${stats.noGain}, failed: ${stats.failed})`
      );
      console.log(
        `Total: ${formatBytes(stats.before)} → ${formatBytes(stats.after)}  (saved ${formatBytes(saved)}, -${percent}%)`
      );
      if (opts.widths.length) {
        const built = stats.variantsMade + stats.variantsFromCache;
        console.log(
          `Variants: ${built} of ${built + stats.variantsSkipped} rungs  (made: ${stats.variantsMade}, from cache: ${stats.variantsFromCache}, ${formatBytes(stats.variantBytes)} added)`
        );
      }
      if (stats.cacheRemoved) {
        console.log(
          `Cache: ${stats.cacheRemoved} stale entries removed  (${formatBytes(stats.cacheBytes)} freed)`
        );
      }
      console.log("=======================\n");
    },
  };
};
