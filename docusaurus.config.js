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

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "DOCUX",
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
        redirects: [
          // Add your redirects here, for example: {   from: '/old-page',   to:
          // '/new-page', },
        ],
        // Automatic redirects based on common taxonomy
        /**
         * @param {string} existingPath
         */
        createRedirects: (existingPath) => {
          // Redirect old URLs to new ones
          if (existingPath.includes("/blog/")) {
            return [
              existingPath.replace("/blog/", "/articles/"),
              existingPath.replace("/blog/", "/posts/"),
            ].filter((redirect) => redirect !== existingPath);
          }
          return undefined;
        },
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
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "DOCUX",
        url: "https://docuxlab.com/",
        description: SITE_DESCRIPTION,
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
        name: "DOCUX",
        url: "https://docuxlab.com/",
        logo: "https://docuxlab.com/img/docux.webp",
        sameAs: ["https://github.com/Juniors017/docux-blog"],
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
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          // Please change this to your repo. Remove this to remove the "edit this page"
          // links. editUrl: '
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          remarkPlugins: [remarkSnippetLoader, [remarkReplaceWords, "blog"]],

          editUrl: "https://github.com/Juniors017/docux-blog/tree/main/",
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "ignore",
        },
        pages: {
          remarkPlugins: [remarkSnippetLoader, [remarkReplaceWords, "pages"]],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**", "/search/**", "/404", "/404.html"],
          filename: "sitemap.xml",
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
          content: "DOCUXLAB",
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
          content: "DOCUXLAB",
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
          content: "DOCUX",
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
        title: "Docux",
        style: "dark",
        logo: {
          alt: "Docux Blog Logo",
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
        copyright: `Copyright © ${new Date().getFullYear()} DocuxLab Blog, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
