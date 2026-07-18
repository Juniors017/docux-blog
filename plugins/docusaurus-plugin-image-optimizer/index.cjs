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
 * Options (all optional):
 * - quality     {number}   Encoder quality, 1–100. Default 80.
 * - maxWidth    {number}   Max width in px; wider images are downscaled. Default 1920.
 * - extensions  {string[]} File extensions to process. Default [".png",".jpg",".jpeg",".webp"].
 * - cacheDir    {string}   Cache location. Default node_modules/.cache/docusaurus-plugin-image-optimizer.
 * - concurrency {number}   Parallel workers. Default 8.
 *
 * See readme.md for more details.
 */

const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_OPTIONS = {
  quality: 80,
  maxWidth: 1920,
  extensions: [".png", ".jpg", ".jpeg", ".webp"],
  cacheDir: null,
  concurrency: 8,
};

// Bump when the optimization logic changes, to invalidate stale cache entries.
const CACHE_VERSION = "v1";

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
      } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
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

      await fsp.mkdir(cacheDir, { recursive: true });
      const images = await collectImages(outDir, opts.extensions);

      const stats = {
        optimized: 0,
        fromCache: 0,
        noGain: 0,
        failed: 0,
        before: 0,
        after: 0,
      };

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
          let best;
          try {
            best = await fsp.readFile(cacheFile);
            stats.fromCache++;
          } catch {
            const optimized = await optimizeBuffer(sharp, original, ext, opts);
            best =
              optimized && optimized.length < original.length
                ? optimized
                : original;
            await fsp.writeFile(cacheFile, best);
            if (best.length < original.length) stats.optimized++;
            else stats.noGain++;
          }

          if (best.length < original.length) {
            await fsp.writeFile(file, best);
            stats.after += best.length;
          } else {
            stats.after += original.length;
          }
        } catch (err) {
          stats.failed++;
          console.warn(
            `[image-optimizer] Skipped ${path.basename(file)}: ${err.message}`
          );
        }
      });

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
      console.log("=======================\n");
    },
  };
};
