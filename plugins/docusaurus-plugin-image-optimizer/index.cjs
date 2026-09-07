/**
 * Docusaurus plugin: image-optimizer
 *
 * Compresses the raster images of the production build (`build/`) with sharp
 * and writes the `srcset` width variants the site actually references, without
 * ever touching a source file. Runs in `postBuild`, so never under
 * `docusaurus start` — no variant exists in development, and any `srcset` must
 * be guarded accordingly.
 *
 * Options: quality (80), maxWidth (1920), widths ([400, 800, 1200, 1600]),
 * extensions (.png/.jpg/.jpeg/.webp), cacheDir, concurrency (8),
 * pruneUnreferenced (true), pruneCache (true).
 *
 * `IMAGE_OPTIMIZER_FORCE=1 npm run build` ignores the cache for one run.
 * Bump CACHE_VERSION whenever the encoding changes: nothing else invalidates
 * entries when the code changes, and it travels with the commit, so CI too.
 *
 * Written up in full at
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

const CACHE_VERSION = "v2";
const FORCE_ENV = "IMAGE_OPTIMIZER_FORCE";
const REFERENCING_EXTENSIONS = [".html", ".js", ".css"];
const VARIANT_REFERENCE = /[\w./@-]+-\d+w\.(?:webp|png|jpe?g)/gi;

function variantPath(file, width) {
  const ext = path.extname(file);
  return `${file.slice(0, -ext.length)}-${width}w${ext}`;
}

function isVariant(file) {
  return /-\d+w\.[a-z]+$/i.test(file);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function readIfExists(file) {
  try {
    return await fsp.readFile(file);
  } catch {
    return null;
  }
}

/** Write via a temp file + rename, so an interrupted build never truncates one. */
async function writeAtomic(file, bytes) {
  const tmp = `${file}.tmp${process.pid}-${crypto.randomBytes(4).toString("hex")}`;
  try {
    await fsp.writeFile(tmp, bytes);
    await fsp.rename(tmp, file);
  } catch (err) {
    await fsp.unlink(tmp).catch(() => {});
    throw err;
  }
}

/**
 * Files to process, plus those skipped for looking like our own output.
 *
 * `build/` is fresh at this point, so no variant exists yet: whatever the name
 * check rejects is a source file, which is why the caller reports it.
 */
async function collectImages(dir, extensions) {
  const found = [];
  const excluded = [];
  async function walk(current) {
    for (const entry of await fsp.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
        if (isVariant(entry.name)) excluded.push(full);
        else found.push(full);
      }
    }
  }
  await walk(dir);
  return { found, excluded };
}

async function optimizeBuffer(sharp, buffer, ext, { quality, maxWidth }) {
  const meta = await sharp(buffer).metadata();
  const animated = (meta.pages || 1) > 1;
  let pipeline = animated ? sharp(buffer, { animated: true }) : sharp(buffer);

  if (maxWidth && meta.width && meta.width > maxWidth && !animated) {
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
 * A `srcset` candidate, or `null` for an animated image or a source already
 * narrower than the rung — which is why a consumer must only reference rungs
 * narrower than the image.
 */
async function resizeBuffer(sharp, buffer, ext, width, { quality }) {
  const pipeline = sharp(buffer);
  const meta = await pipeline.metadata();
  if ((meta.pages || 1) > 1) return null;
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

/** Every variant URL the built site names. Only knowable once the HTML exists. */
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
        for (const match of text.match(VARIANT_REFERENCE) || [])
          refs.add(match);
      }
    }
  }
  await walk(dir);
  return refs;
}

/**
 * Matches on the path relative to the build root, so a `baseUrl` prefix is
 * tolerated while a bare filename — one quoted in a code block — is not.
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
 * Group by bytes, so a distinct image is encoded once and written to every path
 * that carries it. Docusaurus re-emits post images under a hashed name beside
 * the original, so a large share of the build is duplicates.
 */
async function groupByContent(files) {
  const groups = new Map();
  for (const file of files) {
    const buffer = await fsp.readFile(file);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const existing = groups.get(hash);
    if (existing) existing.paths.push(file);
    else {
      groups.set(hash, {
        hash,
        buffer,
        ext: path.extname(file).toLowerCase(),
        paths: [file],
      });
    }
  }
  return [...groups.values()];
}

/**
 * Drop cache entries this run did not use: a full build touches everything that
 * still matters. Losing one costs a re-encode, never correctness.
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
      // Already gone.
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

    /**
     * Publish each static image's real width, so a component can ask instead of
     * hard-coding rungs. `contentLoaded` runs before the HTML is generated.
     *
     * The map stays empty outside a production build — variants are written in
     * `postBuild`, which `docusaurus start` never reaches — which keeps that
     * guard here rather than in every component.
     */
    async contentLoaded({ actions }) {
      const payload = { widths: opts.widths, images: {} };
      if (process.env.NODE_ENV !== "production" || !opts.widths.length) {
        actions.setGlobalData(payload);
        return;
      }

      let sharp;
      try {
        sharp = require("sharp");
      } catch {
        actions.setGlobalData(payload);
        return;
      }

      const staticDir = path.join(context.siteDir, "static");
      let files;
      try {
        files = (await collectImages(staticDir, opts.extensions)).found;
      } catch {
        actions.setGlobalData(payload);
        return;
      }

      await mapLimit(files, opts.concurrency, async (file) => {
        try {
          const { width } = await sharp(file).metadata();
          if (!width) return;
          const rel = path.relative(staticDir, file).split(path.sep).join("/");
          payload.images[`${context.baseUrl}${rel}`] = width;
        } catch {
          // Unreadable: simply absent from the map, so no `srcset` is emitted.
        }
      });

      actions.setGlobalData(payload);
    },

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
      const { found: images, excluded } = await collectImages(
        outDir,
        opts.extensions
      );

      for (const file of excluded) {
        console.warn(
          `[image-optimizer] Left alone, its name matches a generated variant: ${path.relative(outDir, file)}`
        );
      }

      // Asked before anything is encoded: the HTML already exists here.
      const refs = opts.pruneUnreferenced
        ? await collectReferences(outDir)
        : null;

      const groups = await groupByContent(images);

      const stats = {
        optimized: 0,
        fromCache: 0,
        noGain: 0,
        failed: 0,
        before: 0,
        after: 0,
        variantsEncoded: 0,
        variantsFromCache: 0,
        variantsWritten: 0,
        variantBytes: 0,
        cacheRemoved: 0,
        cacheBytes: 0,
      };

      const usedCacheFiles = new Set();

      await mapLimit(groups, opts.concurrency, async (group) => {
        const { hash, buffer: original, ext, paths } = group;
        try {
          stats.before += original.length * paths.length;

          const cacheFile = path.join(
            cacheDir,
            `${hash}-${paramsSignature}${ext}`
          );

          let best = force ? null : await readIfExists(cacheFile);
          if (best) {
            stats.fromCache++;
          } else {
            const optimized = await optimizeBuffer(sharp, original, ext, opts);
            best =
              optimized && optimized.length < original.length
                ? optimized
                : original;
            await writeAtomic(cacheFile, best);
            if (best.length < original.length) stats.optimized++;
            else stats.noGain++;
          }
          usedCacheFiles.add(cacheFile);

          const keep = best.length < original.length;
          if (keep) {
            for (const file of paths) await writeAtomic(file, best);
          }
          stats.after += (keep ? best.length : original.length) * paths.length;

          // Derived from `best`: the ladder inherits its resize and quality.
          for (const width of opts.widths) {
            // Decided per path: a copy under `img/` can go unreferenced
            // while its twin under `assets/images/` is wanted.
            const targets = paths
              .map((file) => variantPath(file, width))
              .filter((target) => !refs || isReferenced(outDir, target, refs));

            // `continue`, not `break`: a wider rung may still be referenced.
            if (!targets.length) continue;

            const variantCache = path.join(
              cacheDir,
              `${hash}-${paramsSignature}-${width}w${ext}`
            );

            let bytes = force ? null : await readIfExists(variantCache);
            if (bytes) {
              stats.variantsFromCache++;
            } else {
              bytes = await resizeBuffer(sharp, best, ext, width, opts);
              if (!bytes) break;
              await writeAtomic(variantCache, bytes);
              stats.variantsEncoded++;
            }
            usedCacheFiles.add(variantCache);

            for (const target of targets) {
              await writeAtomic(target, bytes);
              stats.variantsWritten++;
              stats.variantBytes += bytes.length;
            }
          }
        } catch (err) {
          stats.failed += paths.length;
          console.warn(
            `[image-optimizer] Skipped ${path.basename(paths[0])}: ${err.message}`
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
        `Images: ${images.length} files, ${groups.length} distinct  (optimized: ${stats.optimized}, from cache: ${stats.fromCache}, no gain: ${stats.noGain}, failed: ${stats.failed})`
      );
      console.log(
        `Total: ${formatBytes(stats.before)} → ${formatBytes(stats.after)}  (saved ${formatBytes(saved)}, -${percent}%)`
      );
      if (opts.widths.length) {
        const rungs = images.length * opts.widths.length;
        console.log(
          `Variants: ${stats.variantsWritten} of ${rungs} rungs  (encoded: ${stats.variantsEncoded}, from cache: ${stats.variantsFromCache}, ${formatBytes(stats.variantBytes)} added)`
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
