// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DOCUX',
  tagline: 'Content Management System for Docusaurus',
  favicon: 'img/docux.png',
  
  organizationName: 'DocuxLab', // Usually your GitHub org/user name.
  projectName: 'docux-blog', // Usually your repo name.
  url: 'https://docuxlab.com',
  baseUrl: '/',
  
  trailingSlash: true, // Assure la cohérence des URLs avec des barres obliques finales
  
  // Configuration des URLs canoniques
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  
  // Future flags pour préparer Docusaurus v4
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
    },
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
    },
    experimental_storage: {
      type: 'localStorage',
      namespace: true,
    },
  },


  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  
  headTags: [
    // Données structurées du site web
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'DOCUX',
        'url': 'https://docuxlab.com/',
        'description': 'Un système de gestion de contenu basé sur Docusaurus',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://docuxlab.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }),
    },
    // Données structurées pour l'organisation
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'DOCUX',
        'url': 'https://docuxlab.com/',
        'logo': 'https://docuxlab.com/img/docux.png',
        'sameAs': [
          'https://github.com/Juniors017/docux-blog'
        ]
      }),
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Juniors017/docux-blog/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**', '/search/**', '/404', '/404.html'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],
  
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Ajoutez vos redirections ici, par exemple:
          // {
          //   from: '/ancienne-page',
          //   to: '/nouvelle-page',
          // },
        ],
        // Redirections automatiques basées sur une taxonomie courante
        createRedirects: (existingPath) => {
          // Redirection des URLs anciennes vers nouvelles
          if (existingPath.includes('/blog/')) {
            return [
              existingPath.replace('/blog/', '/articles/'),
              existingPath.replace('/blog/', '/posts/')
            ].filter(redirect => redirect !== existingPath);
          }
          return undefined;
        }
      },
    ],

  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        // Métadonnées générales
        {name: 'keywords', content: 'docusaurus, blog, documentation, cms, react, gestion de contenu, markdown'},
        {name: 'description', content: 'Un système de gestion de contenu basé sur Docusaurus pour simplifier la création de blogs et de documentation technique'},
        {name: 'author', content: 'Docux'},
        {name: 'robots', content: 'index, follow'},
        
        // Google Search Console - Remplacez VOTRE_CODE_VERIFICATION_GOOGLE par votre code réel
        {name: 'google-site-verification', content: 'VOTRE_CODE_VERIFICATION_GOOGLE'},
        
        // Twitter Card data
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'twitter:site', content: '@votre_compte_twitter'},
        {name: 'twitter:title', content: 'DOCUX - CMS pour Docusaurus'},
        {name: 'twitter:description', content: 'Un système de gestion de contenu basé sur Docusaurus pour simplifier la création de blogs et de documentation technique'},
        {name: 'twitter:image', content: 'https://docuxlab.com/img/docusaurus-social-card.jpg'},
        
        // Open Graph data
        {property: 'og:title', content: 'DOCUX - CMS pour Docusaurus'},
        {property: 'og:type', content: 'website'},
        {property: 'og:url', content: 'https://docuxlab.com/'},
        {property: 'og:image', content: 'https://docuxlab.com/img/docusaurus-social-card.jpg'},
        {property: 'og:description', content: 'Un système de gestion de contenu basé sur Docusaurus pour simplifier la création de blogs et de documentation technique'},
        {property: 'og:site_name', content: 'DOCUX'},
        {property: 'og:locale', content: 'fr_FR'},
      ],
      navbar: {
        title: 'Docux',
        style: 'dark',
        logo: {
          alt: 'Docux Blog Logo',
          src: 'img/docux.png',
        },
        items: [
       

          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/series', label: 'Series', position: 'left'},
          {to: '/thanks', label: 'thanks', position: 'right'},
          {to:'/repository',label: 'Repository', position: 'left',},
          {
            to: 'https://github.com/Juniors017/docux-blog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
             
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Juniors017/docux-blog',
              },
              {
                label: 'Thanks',
                to: '/thanks',
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
