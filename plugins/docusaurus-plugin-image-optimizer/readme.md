# docusaurus-plugin-image-optimizer

A tiny local Docusaurus plugin that compresses and resizes the raster images of
the **production build output** (`build/`) using [`sharp`](https://sharp.pixelplumbing.com/) —
without ever modifying your source images.

## Why

Source images tend to be heavier than they need to be (over-sized dimensions,
default encoder quality). This plugin makes the _deployed_ site lighter while
keeping your originals intact and every reference/URL unchanged (formats are
preserved: WebP → WebP, PNG → PNG, JPEG → JPEG).

## How it works

- Runs in the `postBuild` lifecycle, so **only during `docusaurus build`** —
  never during `docusaurus start`.
- Each image is keyed by `sha256(bytes) + settings`. The chosen result is stored
  in a persistent cache (`node_modules/.cache/docusaurus-plugin-image-optimizer/`).
- Next build: an image already in the cache is **restored from it** instead of
  being re-encoded. First build = all images; later builds = only new/changed
  ones. Cache that folder in CI and the optimized images become a reusable
  build artifact.
- Each image is downscaled to `maxWidth` (never enlarged) and re-encoded at
  `quality`. If that doesn't shrink the file, the original is kept.

## Usage

`docusaurus.config.js`:

```js
import pluginImageOptimizer from "./plugins/docusaurus-plugin-image-optimizer/index.cjs";

const config = {
  plugins: [
    [pluginImageOptimizer, { quality: 80, maxWidth: 1920 }],
    // ...
  ],
};
```

Requires `sharp` as a dependency (`npm install sharp`).

## Options

| Option        | Type       | Default                                                 | Description                                   |
| ------------- | ---------- | ------------------------------------------------------- | --------------------------------------------- |
| `quality`     | `number`   | `80`                                                    | Encoder quality (1–100).                      |
| `maxWidth`    | `number`   | `1920`                                                  | Max width in px; wider images are downscaled. |
| `extensions`  | `string[]` | `[".png", ".jpg", ".jpeg", ".webp"]`                    | Extensions to process.                        |
| `cacheDir`    | `string`   | `node_modules/.cache/docusaurus-plugin-image-optimizer` | Persistent cache location.                    |
| `concurrency` | `number`   | `8`                                                     | Parallel workers.                             |

## CI caching

To reuse already-optimized images across CI runs, cache the plugin folder before
building:

```yaml
- name: Cache optimized images
  uses: actions/cache@v4
  with:
    path: node_modules/.cache/docusaurus-plugin-image-optimizer
    key: image-optimizer-${{ github.run_id }}
    restore-keys: |
      image-optimizer-
```
