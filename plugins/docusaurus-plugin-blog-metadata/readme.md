# docusaurus-plugin-blog-metadata

Reads the front matter of every blog post **at build time (in Node)** and writes
it to a generated JSON file consumed by
[`getBlogMetadata()`](../../src/components/Blog/utils/posts.js).

## Why

The previous implementation used Webpack's `require.context` on the `blog/`
folder. It worked, but had two real drawbacks:

1. **It bundled every blog post.** `require.context` *imports* each post as a
   module just to read its front matter, so all posts ended up in the client
   bundle of any page calling `getBlogMetadata()` — series pages, tag pages and
   the `RelatedPosts` component (rendered on every article).
2. **It broke Docusaurus' native `draft: true`.** Drafts are removed from the
   blog plugin's post list, but `require.context` still forced Webpack to
   compile them, and the blog MDX loader then failed the build with:

   ```
   Error: Blog post not found for filePath=.../blog/2026/07/19/my-draft/index.mdx
   ```

Reading the front matter in Node fixes both: nothing extra is bundled, and
`draft: true` works natively again — anywhere in `blog/`.

## How it works

- `loadContent` globs `blog/**/*.{md,mdx}` and parses each front matter with
  `@docusaurus/utils`.
- `contentLoaded` writes the result with `createData`, producing
  `.docusaurus/docusaurus-plugin-blog-metadata/default/blog-metadata.json`.
- `getBlogMetadata()` simply imports that JSON — so it stays a **plain
  function**, and no calling component had to change.

## Draft handling

Drafts follow Docusaurus' own semantics:

| Environment | `draft: true` posts |
| ----------- | ------------------- |
| `start` (dev) | included |
| `build` (prod) | excluded |

Without this, a draft would still be listed on series/tag pages while its own
page is never generated — a guaranteed 404.

> Posts kept in `blog/.draft/` are always excluded: Globby ignores dot-folders,
> exactly like `require.context` did.

## Usage

`docusaurus.config.js`:

```js
import pluginBlogMetadata from "./plugins/docusaurus-plugin-blog-metadata/index.cjs";

const config = {
  plugins: [
    [pluginBlogMetadata, {}],
    // ...other plugins
  ],
};
```

## Options

| Option    | Type     | Default  | Description                        |
| --------- | -------- | -------- | ---------------------------------- |
| `blogDir` | `string` | `"blog"` | Blog folder, relative to `siteDir`. |

## Returned fields

`title`, `description`, `image`, `draft`, `unlisted`, `permalink`, `tags`,
`mainTag`, `authors`, `date` (ISO string), `series`.
