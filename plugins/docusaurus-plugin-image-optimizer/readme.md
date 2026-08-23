# docusaurus-plugin-image-optimizer

A tiny local Docusaurus plugin that compresses and resizes the raster images of
the **production build output** (`build/`) using [`sharp`](https://sharp.pixelplumbing.com/) —
without ever modifying your source images.

## Why

Source images tend to be heavier than they need to be (over-sized dimensions,
default encoder quality). This plugin makes the _deployed_ site lighter while
keeping your originals intact and every reference/URL unchanged (formats are
preserved: WebP → WebP, PNG → PNG, JPEG → JPEG).

It also writes **width variants** next to each image, so a card 360px wide stops
downloading a 1760px file.

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
- For each width in `widths`, a variant is written alongside the image as
  `<name>-<width>w.<ext>` — see below.

## Width variants and `srcset`

Variants are derived from the already-optimized bytes, so they inherit the same
resize and quality decisions. Two rules govern them, and both matter to whoever
writes the `srcset`.

**1. Naming is deterministic.** `photo.webp` becomes `photo-400w.webp`. Because
this runs in `postBuild`, the HTML is already written by the time the variants
appear — so a component can emit a `srcset` pointing at files that do not exist
yet. They land moments later, in the same build, at exactly the expected paths.
This avoids rewriting the generated HTML from the outside.

**2. A variant is written only when it is genuinely narrower than the source.**
An earlier version wrote one regardless, re-encoding the source under the
candidate's name so that no `srcset` entry could ever 404. It produced 297
redundant copies out of 644, and 24 MB of build. So the obligation moved to the
consumer instead:

> Only reference a candidate narrower than the image itself.

Two consumers hold to that in this repository. `src/theme/MDXComponents.js`
knows each image's real width, because Docusaurus forwards it, and lists only
the narrower rungs. `src/pages/index.jsx` asks for 400w and 800w only, its
covers being at least 1760px wide.

**Animated images get no variants at all**, since resizing frames is the one
thing this plugin refuses to risk.

### ⚠️ `srcset` must be emitted in production builds only

The variants exist **only in `build/`**. Under `docusaurus start` they are never
generated, and the dev server answers those URLs with its SPA fallback —
`Content-Type: text/html` — so the browser receives a page where it expected an
image and displays nothing at all.

Guard every `srcset` accordingly:

```jsx
const HAS_VARIANTS = process.env.NODE_ENV === "production";
```

Docusaurus sets that itself: `bin/docusaurus.mjs` defaults every command to
`development`, and the `build` command forces `production`.

`sizes` cannot come from this plugin either — it describes layout, which only
the component knows. Write it where the layout is known.

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

| Option        | Type       | Default                                                 | Description                                             |
| ------------- | ---------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `quality`     | `number`   | `80`                                                    | Encoder quality (1–100).                                |
| `maxWidth`    | `number`   | `1920`                                                  | Max width in px; wider images are downscaled.           |
| `widths`      | `number[]` | `[400, 800, 1200, 1600]`                                | Widths emitted as `srcset` candidates. `[]` to disable. |
| `extensions`  | `string[]` | `[".png", ".jpg", ".jpeg", ".webp"]`                    | Extensions to process.                                  |
| `cacheDir`    | `string`   | `node_modules/.cache/docusaurus-plugin-image-optimizer` | Persistent cache location.                              |
| `concurrency` | `number`   | `8`                                                     | Parallel workers.                                       |

## Report

The plugin prints what it did at the end of a build:

```text
=== Image optimizer ===
Images: 161  (optimized: 102, from cache: 59, no gain: 0, failed: 0)
Total: 24.69 MB → 12.22 MB  (saved 12.47 MB, -50.5%)
Variants: 346  (made: 198, from cache: 148, 18.03 MB added)
=======================
```

Variants add weight to the **deployment**, not to what a reader downloads: they
exist so the browser can fetch a smaller file. On this blog, they take the build
from 25 MB to 42 MB, and cut what a phone loads on the homepage from 672 KB to
234 KB.

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
