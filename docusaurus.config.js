// @ts-check `@type` JSDoc annotations allow editor autocompletion and type
// checking (when paired with `@ts-check`). There are various equivalent ways to
// declare your Docusaurus config. See:
// https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import path from "path";
import { fileURLToPath } from "url";
import pluginSeriesRoute from "./plugins/docusaurus-plugin-series-route/index.cjs";
import pluginBlogMetadata from "./plugins/docusaurus-plugin-blog-metadata/index.cjs";
import pluginImageOptimizer from "./plugins/docusaurus-plugin-image-optimizer/index.cjs";
import simpleAnalytics from "./plugins/simpleAnalytics/index.js";
import remarkReplaceWords from "./plugins/remark-replace-words/index.js";
import remarkSnippetLoader from "./plugins/remark-snippet-loader/index.cjs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Single source of truth for the site description, reused across the tagline,
// meta tags (description, Open Graph, Twitter) and structured data.
const SITE_DESCRIPTION =
  "Explore Docusaurus with me. Find here my developments, research, and notes about Docusaurus";

// Single source of truth for the site name, reused by the page titles, the
// navbar, the social cards and the structured data. These used to be seven
// separate literals spelling the name four different ways (DOCUX, Docux,
// DOCUXLAB, DocuxLab), so search engines and social cards were given
// conflicting names for one site. Not to be confused with the author name in
// the `author` meta tag: the site is DocuxLab, the person is Docux.
const SITE_NAME = "DocuxLab";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: SITE_NAME,
  tagline: SITE_DESCRIPTION,
  favicon: "img/docux.webp",
  organizationName: "DocuxLab", // Usually your GitHub org/user name.
  projectName: "docux-blog", // Usually your repo name.
  url: "https://docuxlab.com",

  baseUrl: "/",
  scripts: [
    {
      async: true,
      src: "https://gc.zgo.at/count.js",
      "data-goatcounter": "https://docuxlab.goatcounter.com/count",
      crossOrigin: "anonymous",
    },
  ],

  // Track SPA navigations with GoatCounter via a client module
  clientModules: [
    // Resolve path in ESM context
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "./src/utils/goatcounter.js"
    ),
  ],

  plugins: [
    [pluginBlogMetadata, {}],
    [pluginSeriesRoute, {}],
    [pluginImageOptimizer, { quality: 80, maxWidth: 1920 }],
    [simpleAnalytics, {}],
    [
      "@docusaurus/plugin-client-redirects",
      {
        // The place to declare a redirect when a published article's slug
        // changes — the one case where this plugin earns its keep, since a
        // slug that has been indexed cannot simply move.
        //
        // Example: { from: "/blog/old-slug/", to: "/blog/new-slug/" }
        redirects: [],

        // `createRedirects` used to mirror every /blog/ URL under /articles/
        // and /posts/. That generated 220 of the build's 344 pages — 64 % of
        // what was deployed — to redirect from paths this blog never served.
        // GoatCounter records no traffic on either prefix, so they were
        // aliases for a past that did not happen. Removed 2026-08-22.
        //
        // Worth remembering if it is ever reinstated: the plugin emits
        // client-side stubs that answer HTTP 200 with a meta refresh, not 301s.
      },
    ],
  ],
  // Themes (UI) must be declared in "themes" and not "plugins"
  themes: [
    "@docusaurus/theme-live-codeblock",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexBlog: true,
        indexDocs: false,
        indexPages: true,
        blogRouteBasePath: "/blog",
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        docsRouteBasePath: ["/"],
      },
    ],
  ],
  trailingSlash: true, // Ensures URL consistency with trailing slashes
  customFields: {
    blueSky: {
      // This is the BlueSky handle as displayed in your BlueSky profile page
      handle: "docuxlab.com",
    },
  },
  // Canonical URL configuration and broken links/markdown handling
  onBrokenLinks: "warn",
  // Migration: the onBrokenMarkdownLinks option is now handled via markdown.hooks
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  onDuplicateRoutes: "throw",
  // Storage configuration
  storage: {
    type: "localStorage",
    namespace: true,
  },
  // Future flags to prepare for Docusaurus v4
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
    },
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you may
  // want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    // Structured data for the website
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      // The `@id` values are what let the two blocks below reference each
      // other, and what the per-page structured data points back to, instead
      // of three unrelated descriptions of the same site.
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://docuxlab.com/#website",
        name: SITE_NAME,
        url: "https://docuxlab.com/",
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": "https://docuxlab.com/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://docuxlab.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    },
    // Structured data for the organization
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://docuxlab.com/#organization",
        name: SITE_NAME,
        url: "https://docuxlab.com/",
        description: SITE_DESCRIPTION,
        // Dimensions given because `docux.webp` really is 737×689; an
        // ImageObject without them says less than a bare URL.
        logo: {
          "@type": "ImageObject",
          url: "https://docuxlab.com/img/docux.webp",
          width: 737,
          height: 689,
        },
        sameAs: [
          "https://github.com/Juniors017/docux-blog",
          "https://bsky.app/profile/docuxlab.com",
        ],
      }),
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          showReadingTime: true,
          // Feeds `dateModified` in the BlogPosting structured data, which
          // Google lists as recommended for articles. Without it Docusaurus
          // drops the property — and ignores the `last_update` front matter
          // entirely, whatever an article declares.
          //
          // The date comes from git by default. A `last_update` in front
          // matter takes precedence over it, article by article, and spares
          // the git call for that file.
          showLastUpdateTime: true,
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          // Please change this to your repo. Remove this to remove the "edit this page"
          // links. editUrl: '
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,

            /**
             * Summaries in the feed, not whole articles.
             *
             * `defaultCreateFeedItems` puts the article's full rendered HTML in
             * `content`. On this blog that meant 2.91 MB per feed, and both
             * feeds are generated: 5.8 MB of the build. The weight is the
             * articles themselves — the component tutorials reach 506, 350 and
             * 326 KB on their own, mostly Prism's syntax-highlighting markup,
             * one span per token. Inlined base64 images accounted for 0.10 MB
             * of the 2.91, so they were never the problem.
             *
             * Feed readers strip or mangle that markup anyway, and a reader
             * polling the feed re-downloads all of it every cycle. So the item
             * keeps its description and a link back, and the article is read on
             * the site where its code blocks actually work.
             *
             * To go back to full-text feeds, drop this function: everything
             * else here is Docusaurus' own default.
             */
            createFeedItems: async ({ defaultCreateFeedItems, ...params }) => {
              const escape = (text) =>
                String(text ?? "")
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");

              const items = await defaultCreateFeedItems(params);

              return items.map((item) => ({
                ...item,
                content:
                  `<p>${escape(item.description)}</p>` +
                  `<p><a href="${item.link}">Read the full article on ${SITE_NAME}</a></p>`,
              }));
            },
          },
          remarkPlugins: [remarkSnippetLoader, [remarkReplaceWords, "blog"]],
          // Custom admonition types swizzled in src/theme/Admonition/Types.js.
          // Registering the keywords here is what turns `:::docu` into an
          // admonition node; the swizzle only handles how it is rendered.
          admonitions: {
            keywords: [
              "jira",
              "bug",
              "docu",
              "info",
              "success",
              "danger",
              "note",
              "tip",
              "warning",
              "important",
              "caution",
              "security",
            ],
          },

          editUrl: "https://github.com/Juniors017/docux-blog/tree/main/",
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "ignore",
        },
        pages: {
          remarkPlugins: [remarkSnippetLoader, [remarkReplaceWords, "pages"]],
          admonitions: {
            keywords: [
              "jira",
              "bug",
              "docu",
              "info",
              "success",
              "danger",
              "note",
              "tip",
              "warning",
              "important",
              "caution",
              "security",
            ],
          },
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          // `/blog/tags/**` and not `/tags/**`: the blog lives under `/blog/`,
          // so the shorter pattern matched nothing and the sitemap advertised
          // 79 tag pages — two thirds of its 122 URLs — for 23 articles.
          ignorePatterns: [
            "/blog/tags/**",
            "/blog/authors/**",
            "/search/**",
            "/404",
            "/404.html",
          ],
          filename: "sitemap.xml",

          // The plugin defaults to `lastmod: null`, so the sitemap carried no
          // freshness signal at all — 39 URLs, not one `<lastmod>`. Upstream
          // intends to flip this default in v4; the TODO sits right above the
          // option in its own source.
          //
          // It is worth turning on now because the dates behind it became
          // trustworthy: `showLastUpdateTime` reads git, and the CI checks out
          // the full history. `date` rather than `datetime` — the day is the
          // useful granularity here, and it avoids advertising a new timestamp
          // on every rebuild.
          lastmod: "date",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docux.webp",
      metadata: [
        // General metadata
        {
          name: "keywords",
          content:
            "docusaurus, blog, documentation, cms, react, content management, markdown",
        },
        {
          name: "description",
          content: SITE_DESCRIPTION,
        },
        {
          name: "author",
          content: "Docux",
        },
        {
          name: "robots",
          content: "index, follow",
        },

        // Twitter Card data
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: SITE_NAME,
        },
        {
          name: "twitter:description",
          content: SITE_DESCRIPTION,
        },
        {
          name: "twitter:image",
          content: "https://docuxlab.com/img/docux.webp",
        },
        {
          property: "og:title",
          content: SITE_NAME,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:url",
          content: "https://docuxlab.com/",
        },
        {
          property: "og:image",
          content: "https://docuxlab.com/img/docux.webp",
        },
        {
          property: "og:description",
          content: SITE_DESCRIPTION,
        },
        {
          property: "og:site_name",
          content: SITE_NAME,
        },
        {
          property: "og:locale",
          content: "en",
        },
      ],

      liveCodeBlock: {
        /**
         * The position of the live playground, above or below the editor
         * Possible values: "top" | "bottom"
         */
        playgroundPosition: "bottom",
      },

      navbar: {
        title: SITE_NAME,
        style: "dark",
        logo: {
          // A logo that links home is named after the site, not after itself:
          // "Logo" adds nothing for someone listening to the page.
          alt: SITE_NAME,
          src: "img/docux.webp",
        },
        items: [
          {
            to: "/blog",
            label: "Blog",
            position: "left",
          },
          {
            to: "/series",
            label: "Series",
            position: "left",
          },
          {
            to: "https://forum.docuxlab.com",
            label: "Forum",
            position: "left",
          },
          {
            to: "/thanks",
            label: "Thanks",
            position: "right",
          },
          {
            to: "/repository",
            label: "Repository",
            position: "left",
          },
          {
            type: "search",
            position: "right",
          },
          {
            to: "https://github.com/Juniors017/docux-blog",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/Juniors017/docux-blog",
              },
              {
                label: "Thanks",
                to: "/thanks",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${SITE_NAME}. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
