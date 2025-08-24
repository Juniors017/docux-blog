import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import authorsData from '@site/src/data/authors';
import SeoDebugPanel from '../SeoDebugPanel';

export default function Seo() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  
  // Hook pour récupérer les métadonnées du blog post (si disponible)
  let blogPostData = null;
  let pageMetadata = null;
  
  try {
    // Importer dynamiquement le hook useBlogPost seulement si on est sur une page de blog
    const { useBlogPost } = require('@docusaurus/plugin-content-blog/client');
    if (typeof useBlogPost === 'function') {
      const blogPost = useBlogPost?.();
      if (blogPost?.metadata) {
        blogPostData = blogPost.metadata;
      }
    }
  } catch (error) {
    // Hook useBlogPost non disponible sur cette page (normal pour les pages non-blog)
    // Le composant SEO continue de fonctionner avec des métadonnées génériques
  }

  // Essayer de récupérer les métadonnées génériques de page (docs, pages custom, etc.)
  try {
    const { useDoc } = require('@docusaurus/plugin-content-docs/client');
    if (typeof useDoc === 'function') {
      const doc = useDoc?.();
      if (doc?.metadata) {
        pageMetadata = doc.metadata;
      }
    }
  } catch (error) {
    // Hook useDoc non disponible ou pas sur une page docs
  }

  // Alternative: essayer de récupérer via le hook global de Docusaurus
  try {
    const { usePageMetadata } = require('@docusaurus/core/lib/client/exports/router');
    if (typeof usePageMetadata === 'function') {
      const metadata = usePageMetadata?.();
      if (metadata && !pageMetadata) {
        pageMetadata = metadata;
      }
    }
  } catch (error) {
    // Hook non disponible
  }
  
  // Détecter le type de page (adapté à votre site sans docs)
  const isBlogPost = location.pathname.includes('/blog/') && 
                    !location.pathname.endsWith('/blog/') &&
                    !location.pathname.includes('/blog/tags/') &&
                    !location.pathname.includes('/blog/authors/');

  const isBlogListPage = location.pathname.endsWith('/blog/') || 
                        location.pathname.includes('/blog/tags/') ||
                        location.pathname.includes('/blog/authors/');

  const isSeriesPage = location.pathname.includes('/series/');

  const isHomePage = location.pathname === '/' || location.pathname === '/docux-blog/';

  const isThanksPage = location.pathname.includes('/thanks/');

  const isRepositoryPage = location.pathname.includes('/repository/');

  // Détecter le type de contenu pour les métadonnées
  const getPageType = () => {
    if (isBlogPost) return { type: 'BlogPosting', category: 'Article de blog' };
    if (isBlogListPage) return { type: 'Blog', category: 'Liste de blog' };
    if (isSeriesPage) return { type: 'Series', category: 'Série d\'articles' };
    if (isRepositoryPage) return { type: 'WebPage', category: 'Page repository' };
    if (isHomePage) return { type: 'WebSite', category: 'Page d\'accueil' };
    if (isThanksPage) return { type: 'WebPage', category: 'Page de remerciements' };
    return { type: 'WebPage', category: 'Page générale' };
  };

  const pageInfo = getPageType();

  // Construire les métadonnées de base avec système de fallback
  const title = blogPostData?.title || 
                pageMetadata?.title || 
                'Page'; // Fallback par défaut

  const description = blogPostData?.description || 
                     pageMetadata?.description || 
                     siteConfig?.tagline || 
                     'Documentation et tutoriels sur Docusaurus';

  const canonicalUrl = siteConfig.url + useBaseUrl(location.pathname);

  // Image de base - priorité aux frontmatter puis au site
  let imageUrl;
  
  if (blogPostData?.frontMatter?.image) {
    // Image spécifiée dans l'article
    imageUrl = blogPostData.frontMatter.image.startsWith('http') 
      ? blogPostData.frontMatter.image 
      : siteConfig.url + useBaseUrl(blogPostData.frontMatter.image);
  } else if (pageMetadata?.frontMatter?.image) {
    // Image spécifiée dans une page docs/personnalisée
    imageUrl = pageMetadata.frontMatter.image.startsWith('http')
      ? pageMetadata.frontMatter.image
      : siteConfig.url + useBaseUrl(pageMetadata.frontMatter.image);
  } else {
    // Image par défaut du site
    imageUrl = siteConfig.url + useBaseUrl('/img/docux.png');
  }

  // Récupérer l'auteur principal du blog post si disponible
  let primaryAuthor = null;
  
  if (blogPostData?.frontMatter?.authors) {
    // Gérer les différents formats d'auteurs
    let authorKey;
    if (Array.isArray(blogPostData.frontMatter.authors)) {
      authorKey = blogPostData.frontMatter.authors[0];
    } else if (typeof blogPostData.frontMatter.authors === 'string') {
      authorKey = blogPostData.frontMatter.authors;
    }
    
    if (authorKey && authorsData[authorKey]) {
      primaryAuthor = authorsData[authorKey];
    }
  }

  // Si pas d'auteur dans le frontmatter, vérifier s'il y en a un générique
  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    const authorKey = pageMetadata.frontMatter.author;
    if (authorsData[authorKey]) {
      primaryAuthor = authorsData[authorKey];
    }
  }

  // Construire le JSON-LD structuré avec tous les champs pour Google Rich Results
  const additionalJsonLd = (() => {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': pageInfo.type,
      name: title,
      headline: title,
      description: description,
      url: canonicalUrl,
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        caption: `Image pour: ${title}`
      },
      inLanguage: 'fr-FR',
      isPartOf: {
        '@type': 'WebSite',
        name: siteConfig.title,
        url: siteConfig.url
      }
    };

    // Enrichir selon le type de page
    if (pageInfo.type === 'BlogPosting' && blogPostData) {
      return {
        ...baseStructure,
        '@type': 'BlogPosting',
        author: primaryAuthor ? {
          '@type': 'Person',
          name: primaryAuthor.name,
          url: primaryAuthor.url || primaryAuthor.github,
          description: primaryAuthor.title || 'Contributeur Docux',
          image: primaryAuthor.imageUrl
        } : {
          '@type': 'Person',
          name: 'Équipe Docux',
          url: siteConfig.url
        },
        datePublished: blogPostData.date || new Date().toISOString(),
        dateModified: blogPostData.lastUpdatedAt || blogPostData.date || new Date().toISOString(),
        publisher: {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig.url + useBaseUrl('/img/docux.png')
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        keywords: blogPostData.frontMatter?.keywords?.join(', ') || 
                 blogPostData.frontMatter?.tags?.join(', ') || 
                 'docusaurus, documentation, tutoriel',
        articleSection: blogPostData.frontMatter?.category || 'Tutoriels',
        wordCount: blogPostData.frontMatter?.wordCount || 500
      };
    }

    if (pageInfo.type === 'WebSite' && isHomePage) {
      return {
        ...baseStructure,
        '@type': 'WebSite',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        sameAs: [
          'https://github.com/Juniors017/docux-blog',
          // Ajoutez ici d'autres liens de réseaux sociaux si disponibles
        ]
      };
    }

    return baseStructure;
  })();

  // Détections pour le panel de debug
  const detections = {
    isBlogPost,
    isBlogListPage,
    isSeriesPage,
    isHomePage,
    isThanksPage,
    isRepositoryPage,
    hasAuthor: !!primaryAuthor,
    hasBlogData: !!blogPostData,
    hasPageData: !!pageMetadata,
    hasImage: !!imageUrl
  };

  return (
    <>
      <Head>
        {/* Balises META de base */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content={pageInfo.type === 'BlogPosting' ? 'article' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={`Image pour: ${title}`} />
        <meta property="og:site_name" content={siteConfig.title} />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={`Image pour: ${title}`} />
        
        {/* Métadonnées spécifiques aux articles */}
        {pageInfo.type === 'BlogPosting' && blogPostData && (
          <>
            <meta property="article:published_time" content={blogPostData.date} />
            <meta property="article:modified_time" content={blogPostData.lastUpdatedAt || blogPostData.date} />
            {primaryAuthor && <meta property="article:author" content={primaryAuthor.name} />}
            {blogPostData.frontMatter?.category && (
              <meta property="article:section" content={blogPostData.frontMatter.category} />
            )}
            {blogPostData.frontMatter?.keywords?.map((keyword) => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
          </>
        )}
        
        {/* Métadonnées supplémentaires */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* JSON-LD pour les Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify(additionalJsonLd)}
        </script>
      </Head>
      
      {/* Panel de debug SEO (uniquement en développement) */}
      <SeoDebugPanel 
        jsonLd={additionalJsonLd}
        pageInfo={pageInfo}
        location={location}
        blogPostData={blogPostData}
        pageMetadata={pageMetadata}
        siteConfig={siteConfig}
        detections={detections}
      />
    </>
  );
}
