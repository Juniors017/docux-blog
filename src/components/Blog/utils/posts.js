/**
 * 🧠 getBlogMetadata
 *
 * Returns the metadata of every blog post, read from the JSON file generated at
 * build time by the local `docusaurus-plugin-blog-metadata` plugin.
 *
 * 🔍 Behavior:
 * - Resolves permalinks based on `slug` or folder structure
 * - Normalizes image paths for static assets
 * - Drafts kept in `blog/.draft/` are excluded (dot-folders are ignored)
 *
 * 📦 Returned metadata includes:
 * - `title`: Post title
 * - `description`: Short summary
 * - `image`: Resolved image path
 * - `draft`: Boolean flag for unpublished posts
 * - `unlisted`: Boolean flag for hidden posts
 * - `permalink`: URL path to the post
 * - `tags`: Array of tags
 * - `mainTag`: Primary tag (optional); used by the RelatedBlogPost component
 * - `authors`: Array of author names
 * - `date`: Publication date (ISO string)
 * - `series`: Series name (optional); used by the SeriesBlogPost component
 *
 * 🛠️ Usage:
 * ```js
 * import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
 * const posts = getBlogMetadata();
 * ```
 *
 * ⚠️ Note:
 * The front matter is parsed in Node at build time rather than through
 * Webpack's `require.context`. That keeps blog posts out of the client bundle
 * and preserves Docusaurus' native `draft: true` support.
 */

import blogMetadata from "@generated/docusaurus-plugin-blog-metadata/default/blog-metadata.json";

export function getBlogMetadata() {
  // Return a shallow copy so callers can sort/mutate freely, as they could with
  // the previous implementation.
  return [...blogMetadata];
}
