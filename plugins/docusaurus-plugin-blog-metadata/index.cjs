/**
 * Docusaurus Plugin: blog-metadata
 *
 * Reads the front matter of every blog post at build time (in Node) and writes
 * it to a generated JSON file consumed by `getBlogMetadata()`.
 *
 * Why this exists:
 * The previous implementation used Webpack's `require.context` on the `blog/`
 * folder. That had two drawbacks:
 *
 * 1. It *imported* every post as a module just to read its front matter, so all
 *    blog posts ended up bundled into any page calling `getBlogMetadata()`
 *    (series pages, tag pages, RelatedPosts…).
 * 2. It broke Docusaurus' native `draft: true`. Drafts are removed from the
 *    blog plugin's post list, but `require.context` still forced Webpack to
 *    compile them, and the blog MDX loader then failed with
 *    "Blog post not found".
 *
 * Reading the front matter in Node solves both: nothing extra is bundled, and
 * `draft: true` works natively again.
 *
 * Note: Globby ignores dot-folders by default, so `blog/.draft/` stays excluded
 * exactly as it was with `require.context`.
 *
 * See readme.md for more details.
 */

const fsp = require("fs/promises");
const path = require("path");
const {
  Globby,
  parseMarkdownFile,
  DEFAULT_PARSE_FRONT_MATTER,
} = require("@docusaurus/utils");

module.exports = function pluginBlogMetadata(context, options = {}) {
  const blogDir = path.join(context.siteDir, options.blogDir || "blog");
  // Same semantics as Docusaurus itself: drafts show up while developing, but
  // never in a production build. Without this they would still be listed on
  // series/tag pages while their own page is not generated (404 on click).
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: "docusaurus-plugin-blog-metadata",

    async loadContent() {
      const files = await Globby("**/*.{md,mdx}", { cwd: blogDir });
      const posts = [];

      await Promise.all(
        files.map(async (relFile) => {
          const absolutePath = path.join(blogDir, relFile);
          try {
            const fileContent = await fsp.readFile(absolutePath, "utf-8");
            const { frontMatter } = await parseMarkdownFile({
              filePath: absolutePath,
              fileContent,
              parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
              removeContentTitle: true,
            });
            if (!frontMatter) return;
            if (isProduction && frontMatter.draft) return;

            // e.g. "2026/07/19/my-article" — same shape as the former
            // require.context key, so permalinks stay identical.
            const dir = relFile.replace(/\/index\.mdx?$/, "");

            let permalink;
            if (frontMatter.slug) {
              const slug = String(frontMatter.slug);
              permalink = slug.startsWith("/")
                ? slug
                : `/blog/${slug.replace(/^\//, "")}`;
            } else {
              permalink = `/blog/${dir}/`;
            }

            let imageUrl = frontMatter.image;
            if (imageUrl && String(imageUrl).startsWith("./")) {
              imageUrl = `/blog/${dir}/${String(imageUrl).replace("./", "")}`;
            }

            posts.push({
              title: frontMatter.title,
              description: frontMatter.description,
              image: imageUrl,
              draft: frontMatter.draft || false,
              unlisted: frontMatter.unlisted || false,
              permalink,
              tags: frontMatter.tags || [],
              mainTag: frontMatter.mainTag || null,
              authors: frontMatter.authors || [],
              // YAML gives a Date object; serialise it so the client gets the
              // same string shape it used to receive.
              date:
                frontMatter.date instanceof Date
                  ? frontMatter.date.toISOString()
                  : frontMatter.date,
              series: frontMatter.series || null,
            });
          } catch (err) {
            console.warn(`[blog-metadata] Skipped ${relFile}: ${err.message}`);
          }
        })
      );

      return posts;
    },

    async contentLoaded({ content, actions }) {
      await actions.createData(
        "blog-metadata.json",
        JSON.stringify(content ?? [], null, 2)
      );
    },
  };
};
