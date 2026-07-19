/**
 * Docusaurus Plugin: series-route
 *
 * Purpose:
 * Registers one route per blog "series" under the `/series/<slug>` URL pattern,
 * each pointing to the `SeriesArticlesPage` React component.
 *
 * Why concrete routes (and not a single `/series/:slug` dynamic route)?
 * A `:slug` route is pre-rendered by Docusaurus as the literal path
 * `build/series/:slug/index.html`. The `:` character is illegal in Windows
 * file names, so the static build crashed locally (EINVAL) even though it
 * worked on Linux CI. Enumerating the real series names at build time yields
 * filesystem-safe paths on every OS and gives each series a properly
 * pre-rendered, SEO-friendly page.
 *
 * How:
 * - `loadContent` globs the blog markdown files and collects the unique
 *   `series` values from their front matter.
 * - `contentLoaded` registers a route for each series slug.
 *
 * See readme.md for more details.
 */

const fs = require("fs/promises");
const path = require("path");
const {
  Globby,
  parseMarkdownFile,
  DEFAULT_PARSE_FRONT_MATTER,
} = require("@docusaurus/utils");

/**
 * Slugify a series name. This MUST stay in sync with
 * `src/components/Blog/utils/slug.js`, which the client component uses to match
 * the current URL against each post's series.
 * @param {string} text
 * @returns {string}
 */
function createSlug(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase → kebab-case
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[̀-ͯ]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

module.exports = function pluginSeriesRoute(context) {
  return {
    name: "docusaurus-plugin-series-route",

    async loadContent() {
      const blogDir = path.join(context.siteDir, "blog");
      // Globby ignores dot-folders (e.g. `blog/.draft`) by default, so drafts
      // kept there do not get a public series route.
      const files = await Globby("**/*.{md,mdx}", {
        cwd: blogDir,
        absolute: true,
      });

      const seriesNames = new Set();
      await Promise.all(
        files.map(async (filePath) => {
          try {
            const fileContent = await fs.readFile(filePath, "utf-8");
            const { frontMatter } = await parseMarkdownFile({
              filePath,
              fileContent,
              parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
              removeContentTitle: true,
            });
            // Drafts are excluded from production builds, so their series must
            // not create an empty route either.
            const isDraft =
              process.env.NODE_ENV === "production" &&
              frontMatter &&
              frontMatter.draft;
            if (frontMatter && frontMatter.series && !isDraft) {
              seriesNames.add(String(frontMatter.series));
            }
          } catch {
            // Skip files whose front matter can't be parsed rather than
            // failing the whole build.
          }
        })
      );

      return [...seriesNames];
    },

    async contentLoaded({ content, actions }) {
      const seriesNames = content || [];
      // Dedupe by slug so two series that slugify identically don't register
      // a duplicate route (which would trip `onDuplicateRoutes: "throw"`).
      const seenSlugs = new Set();
      for (const seriesName of seriesNames) {
        const slug = createSlug(seriesName);
        if (!slug || seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);
        actions.addRoute({
          path: `/series/${slug}`,
          component: "@site/src/components/Blog/Series/SeriesArticlesPage",
          exact: true,
        });
      }
    },
  };
};
