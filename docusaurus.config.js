// @ts-check `@type` JSDoc annotations allow editor autocompletion and type
// checking (when paired with `@ts-check`). There are various equivalent ways to
// declare your Docusaurus config. See:
// https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import pluginTagRoute from "./plugins/docusaurus-plugin-tag-route/index.cjs"
import pluginSeriesRoute from "./plugins/docusaurus-plugin-series-route/index.cjs"
import simpleAnalytics from "./plugins/simpleAnalytics/index.js"
import remarkReplaceWords from "./plugins/remark-replace-words/index.js"
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'DOCUX',
    tagline: 'Explore Docusaurus with me. Find here my developments, research, and notes abo' +
            'ut Docusaurus',
    favicon: 'img/docux.png',
    organizationName: 'DocuxLab', // Usually your GitHub org/user name.
    projectName: 'docux-blog', // Usually your repo name.
    url: 'https://docuxlab.com',

    baseUrl: '/',

    plugins: [
        [
            pluginSeriesRoute, {}
        ],
        [
            pluginTagRoute, {}
        ],
        [
            simpleAnalytics, {}
        ],
        [
            '@docusaurus/plugin-client-redirects', {
                redirects: [
                    // Ajoutez vos redirections ici, par exemple: {   from: '/ancienne-page',   to:
                    // '/nouvelle-page', },
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
            }
        ]
    ],
    trailingSlash: true, // Assure la cohérence des URLs avec des barres obliques finales
    customFields: {
        blueSky: {
            // This is the BlueSky handle as displayed in your BlueSky profile page
            handle: "docuxlab.com"
        }
    },
    // Configuration des URLs canoniques
    onBrokenLinks: 'ignore',
    onBrokenMarkdownLinks: 'ignore',
    onDuplicateRoutes: "throw",
    // Future flags pour préparer Docusaurus v4
    future: {
        v4: {
            removeLegacyPostBuildHeadAttribute: true,
            useCssCascadeLayers: true
        },
        experimental_faster: {
            swcJsLoader: true,
            swcJsMinimizer: true,
            swcHtmlMinimizer: true,
            lightningCssMinimizer: true,
            mdxCrossCompilerCache: true
        },
        experimental_storage: {
            type: 'localStorage',
            namespace: true
        }
    },

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you may
    // want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en']
    },

    headTags: [
        // Données structurées du site web
        {
            tagName: 'script',
            attributes: {
                type: 'application/ld+json'
            },
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                'name': 'DOCUX',
                'url': 'https://docuxlab.com/',
                'description': 'Explore Docusaurus with me. Find here my developments, research, and notes abo' +
                        'ut Docusaurus',
                'potentialAction': {
                    '@type': 'SearchAction',
                    'target': 'https://docuxlab.com/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                }
            })
        },
        // Données structurées pour l'organisation
        {
            tagName: 'script',
            attributes: {
                type: 'application/ld+json'
            },
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                'name': 'DOCUX',
                'url': 'https://docuxlab.com/',
                'logo': 'https://docuxlab.com/img/docux.png',
                'sameAs': ['https://github.com/Juniors017/docux-blog']
            })
        }
    ],

    presets: [
        [
            'classic',
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
                        type: [
                            'rss', 'atom'
                        ],
                        xslt: true
                    },
                    remarkPlugins: [
                        [remarkReplaceWords, "blog"]
                    ],

                    editUrl: 'https://github.com/Juniors017/docux-blog/tree/main/',
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'ignore'
                },
                pages: {
                    remarkPlugins: [
                        [remarkReplaceWords, "pages"]
                    ]
                },
                theme: {
                    customCss: './src/css/custom.css'
                },
                sitemap: {
                    changefreq: 'weekly',
                    priority: 0.5,
                    ignorePatterns: [
                        '/tags/**', '/search/**', '/404', '/404.html'
                    ],
                    filename: 'sitemap.xml'
                }
            })
        ]
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
        // Replace with your project's social card
        image: 'img/docux.png',
        metadata: [
            // Métadonnées générales
            {
                name: 'keywords',
                content: 'docusaurus, blog, documentation, cms, react, gestion de contenu, markdown'
            }, {
                name: 'description',
                content: 'Explore Docusaurus with me. Find here my developments, research, and notes abo' +
                        'ut Docusaurus'
            }, {
                name: 'author',
                content: 'Docux'
            }, {
                name: 'robots',
                content: 'index, follow'
            },

            // Google Search Console - Remplacez VOTRE_CODE_VERIFICATION_GOOGLE par votre
            // code réel
            {
                name: 'google-site-verification',
                content: 'VOTRE_CODE_VERIFICATION_GOOGLE'
            },

            // Twitter Card data
            {
                name: 'twitter:card',
                content: 'summary_large_image'
            }, {
                name: 'twitter:site',
                content: '@votre_compte_twitter'
            }, {
                name: 'twitter:title',
                content: 'DOCUX - CMS pour Docusaurus'
            }, {
                name: 'twitter:description',
                content: 'Explore Docusaurus with me. Find here my developments, research, and notes abo' +
                        'ut Docusaurus'
            }, {
                name: 'twitter:image',
                content: 'https://docuxlab.com/img/docux.png'
            }, {
                property: 'og:title',
                content: 'DOCUX - CMS pour Docusaurus'
            }, {
                property: 'og:type',
                content: 'website'
            }, {
                property: 'og:url',
                content: 'https://docuxlab.com/'
            }, {
                property: 'og:image',
                content: 'https://docuxlab.com/img/docux.png'
            }, {
                property: 'og:description',
                content: 'Explore Docusaurus with me. Find here my developments, research, and notes abo' +
                        'ut Docusaurus'
            }, {
                property: 'og:site_name',
                content: 'DOCUX'
            }, {
                property: 'og:locale',
                content: 'en'
            }
        ],
        navbar: {
            title: 'Docux',
            style: 'dark',
            logo: {
                alt: 'Docux Blog Logo',
                src: 'img/docux.png'
            },
            items: [

                {
                    to: '/blog',
                    label: 'Blog',
                    position: 'left'
                }, {
                    to: '/series',
                    label: 'Series',
                    position: 'left'
                }, {
                    to: '/thanks',
                    label: 'Thanks',
                    position: 'right'
                }, {
                    to: '/repository',
                    label: 'Repository',
                    position: 'left'
                }, {
                    to: 'https://github.com/Juniors017/docux-blog',
                    label: 'GitHub',
                    position: 'right'
                }
            ]
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Discord',
                            href: 'https://discordapp.com/invite/docusaurus'
                        }
                    ]
                }, {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: '/blog'
                        }, {
                            label: 'GitHub',
                            href: 'https://github.com/Juniors017/docux-blog'
                        }, {
                            label: 'Thanks',
                            to: '/thanks'
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} DocuxLab Blog, Inc. Built with Docusaurus.`
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula
        },
         algolia: {
        // @see https://docusaurus.io/docs/search for documentation
        // @see https://dashboard.algolia.com/ for appId, apiKey and indexName

        // The application ID provided by Algolia
        appId: "L49WSUCG5E",

        // Public API key: it is safe to commit it
        apiKey: "a1eaa28984f5ff117427ec2805f2e976",

        indexName: "docuxlab",

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: "search",

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: false,
      },
    
    })
};

export default config;
