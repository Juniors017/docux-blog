/**
 * Composant SEO Principal - Développé par Docux avec GitHub Copilot
 * 
 * Ce composant gère intelligemment toutes les métadonnées SEO de votre site Docusaurus :
 * - Détection automatique du type de page (blog, statique, accueil...)
 * - Génération des balises meta HTML, Open Graph et Twitter Cards
 * - Création du Schema.org JSON-LD pour les Rich Results Google
 * - Système de fallback robuste pour éviter les erreurs
 * - Panel de debug intégré pour le développement
 */

import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import authorsData from '@site/src/data/authors';
import SeoDebugPanel from '../SeoDebugPanel';

export default function Seo() {
  // Récupération du contexte Docusaurus et de la localisation
  const location = useLocation(); // URL et chemin actuels
  const { siteConfig } = useDocusaurusContext(); // Configuration globale du site
  
  // Variables pour stocker les métadonnées selon le type de page
  let blogPostData = null;  // Données spécifiques aux articles de blog
  let pageMetadata = null;  // Métadonnées génériques des pages statiques
  
  /**
   * ÉTAPE 1 : Récupération des métadonnées des articles de blog
   * 
   * Utilisation d'un try-catch car le hook useBlogPost n'est disponible
   * que sur les pages d'articles. Sur les autres pages, il génère une erreur
   * que nous interceptons gracieusement.
   */
  try {
    // Import dynamique du hook blog - seulement si on est sur une page de blog
    const { useBlogPost } = require('@docusaurus/plugin-content-blog/client');
    if (typeof useBlogPost === 'function') {
      const blogPost = useBlogPost?.();
      if (blogPost?.metadata) {
        blogPostData = blogPost.metadata; // Stockage des métadonnées de l'article
      }
    }
  } catch (error) {
    // Hook useBlogPost non disponible sur cette page (normal pour les pages non-blog)
    // Le composant SEO continue de fonctionner avec des métadonnées génériques
    console.debug('Hook useBlogPost non disponible - Page non-blog détectée');
  }

  /**
   * ÉTAPE 2 : Récupération des métadonnées des pages de documentation
   * 
   * Tentative de récupération des métadonnées pour les pages docs.
   * Même principe avec try-catch pour éviter les erreurs.
   */
  try {
    const { useDoc } = require('@docusaurus/plugin-content-docs/client');
    if (typeof useDoc === 'function') {
      const doc = useDoc?.();
      if (doc?.metadata) {
        pageMetadata = doc.metadata; // Stockage des métadonnées de documentation
      }
    }
  } catch (error) {
    // Hook useDoc non disponible ou pas sur une page docs
    console.debug('Hook useDoc non disponible - Page non-docs détectée');
  }

  /**
   * ÉTAPE 3 : Récupération alternative via les métadonnées globales
   * 
   * Si aucun hook spécialisé n'a fonctionné, on essaie de récupérer
   * les métadonnées depuis le contexte global de Docusaurus.
   */
  try {
    // Essayer avec @docusaurus/theme-common pour plus de compatibilité
    const { useThemeConfig } = require('@docusaurus/theme-common');
    const themeConfig = useThemeConfig?.();
    
    /**
     * Récupération depuis le DOM si aucun hook n'a fonctionné
     * Utile pour les pages statiques générées côté client
     */
    if (!pageMetadata && typeof window !== 'undefined' && window.docusaurus) {
      // Récupérer les métadonnées depuis le contexte global si disponible
      const globalData = window.docusaurus.globalData;
      if (globalData && !pageMetadata) {
        // Construire des métadonnées basiques pour les pages statiques
        pageMetadata = {
          title: document.title || siteConfig.title,
          description: document.querySelector('meta[name="description"]')?.content || siteConfig.tagline,
          frontMatter: {
            // Pas de frontMatter pour les pages générées dynamiquement
          }
        };
      }
    }
  } catch (error) {
    // Hooks alternatifs non disponibles - situation normale
    console.debug('Hooks alternatifs non disponibles');
  }

  /**
   * ÉTAPE 4 : Fallback de sécurité
   * 
   * Si aucune métadonnée n'a été trouvée, on crée des métadonnées
   * basiques basées sur la configuration du site.
   */
  if (!pageMetadata && !blogPostData) {
    pageMetadata = {
      title: siteConfig.title,
      description: siteConfig.tagline,
      frontMatter: {} // Objet vide pour éviter les erreurs d'accès
    };
  }
  
  /**
   * ÉTAPE 5 : Détection intelligente du type de page
   * 
   * Analyse de l'URL pour déterminer le type de contenu.
   * Cette détection influence les métadonnées Schema.org générées.
   */
  
  // Article de blog individuel (pas les pages d'index)
  const isBlogPost = location.pathname.includes('/blog/') && 
                    !location.pathname.endsWith('/blog/') &&
                    !location.pathname.includes('/blog/tags/') &&
                    !location.pathname.includes('/blog/authors/');

  // Pages d'index et de listing des articles
  const isBlogListPage = location.pathname.endsWith('/blog/') || 
                        location.pathname.includes('/blog/tags/') ||
                        location.pathname.includes('/blog/authors/');

  // Pages de séries d'articles
  const isSeriesPage = location.pathname.includes('/series/');

  // Page d'accueil principale
  const isHomePage = location.pathname === '/' || location.pathname === '/docux-blog/';

  // Page de remerciements
  const isThanksPage = location.pathname.includes('/thanks/');

  // Page repository/projets
  const isRepositoryPage = location.pathname.includes('/repository/');

  /**
   * Fonction de mapping type de page → Schema.org
   * 
   * Retourne le type Schema.org approprié et une catégorie lisible
   * pour le debug panel.
   */
  const getPageType = () => {
    if (isBlogPost) return { type: 'BlogPosting', category: 'Article de blog' };
    if (isBlogListPage) return { type: 'CollectionPage', category: 'Index des articles' };
    if (isSeriesPage) return { type: 'Series', category: 'Série d\'articles' };
    if (isRepositoryPage) return { type: 'WebPage', category: 'Page repository' };
    if (isHomePage) return { type: 'WebSite', category: 'Page d\'accueil' };
    if (isThanksPage) return { type: 'WebPage', category: 'Page de remerciements' };
    return { type: 'WebPage', category: 'Page générale' }; // Fallback par défaut
  };

  const pageInfo = getPageType();

  /**
   * ÉTAPE 6 : Construction des métadonnées avec système de fallback
   * 
   * Priorité : métadonnées spécifiques → métadonnées génériques → configuration site
   */
  
  // Titre de la page avec cascade de fallbacks
  const title = blogPostData?.title ||           // 1. Titre de l'article
                pageMetadata?.title ||           // 2. Titre de la page
                'Page';                          // 3. Fallback par défaut

  // Description avec cascade de fallbacks  
  const description = blogPostData?.description ||     // 1. Description de l'article
                     pageMetadata?.description ||       // 2. Description de la page
                     siteConfig?.tagline ||             // 3. Tagline du site
                     'Documentation et tutoriels sur Docusaurus'; // 4. Fallback par défaut

  /**
   * ÉTAPE 7 : Génération de l'URL canonique
   * 
   * Construction d'une URL canonique propre pour éviter le contenu dupliqué.
   * Supprime les slashes en double et assure la cohérence.
   */
  const getCanonicalUrl = () => {
    const baseUrl = siteConfig.url + siteConfig.baseUrl;
    // Supprimer le slash final s'il existe, puis toujours en ajouter un
    const cleanPath = location.pathname.replace(/\/$/, '') || '';
    return `${baseUrl}${cleanPath}/`;
  };

  const canonicalUrl = getCanonicalUrl();

  /**
   * ÉTAPE 8 : Gestion intelligente des images
   * 
   * Priorité des images :
   * 1. Image spécifiée dans le frontMatter de l'article/page
   * 2. Image sociale par défaut du site
   * 3. Image de fallback (logo du site)
   */
  let imageUrl;
  
  if (blogPostData?.frontMatter?.image) {
    // Image spécifiée dans l'article - gestion URL relative/absolue
    imageUrl = blogPostData.frontMatter.image.startsWith('http') 
      ? blogPostData.frontMatter.image 
      : siteConfig.url + useBaseUrl(blogPostData.frontMatter.image);
  } else if (pageMetadata?.frontMatter?.image) {
    // Image spécifiée dans une page docs/personnalisée - gestion URL relative/absolue
    imageUrl = pageMetadata.frontMatter.image.startsWith('http')
      ? pageMetadata.frontMatter.image
      : siteConfig.url + useBaseUrl(pageMetadata.frontMatter.image);
  } else if (siteConfig.themeConfig?.image) {
    // Image sociale du site (pour page d'accueil et fallback général)
    imageUrl = siteConfig.themeConfig.image.startsWith('http')
      ? siteConfig.themeConfig.image
      : siteConfig.url + useBaseUrl(siteConfig.themeConfig.image);
  } else {
    // Image par défaut du site - fallback de sécurité
    imageUrl = siteConfig.url + useBaseUrl('/img/docux.png');
  }

  /**
   * ÉTAPE 9 : Gestion des auteurs avec normalisation
   * 
   * Récupération et normalisation des informations d'auteurs depuis
   * la base de données centralisée dans src/data/authors.js
   */
  
  // Fonction pour normaliser les noms d'auteurs (première lettre majuscule)
  const normalizeAuthorName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Récupérer l'auteur principal du blog post si disponible
  let primaryAuthor = null;
  
  if (blogPostData?.frontMatter?.authors) {
    // Gérer les différents formats d'auteurs (array ou string)
    let authorKey;
    if (Array.isArray(blogPostData.frontMatter.authors)) {
      authorKey = blogPostData.frontMatter.authors[0]; // Premier auteur si plusieurs
    } else if (typeof blogPostData.frontMatter.authors === 'string') {
      authorKey = blogPostData.frontMatter.authors; // Auteur unique
    }
    
    // Récupération des données complètes de l'auteur depuis la base centralisée
    if (authorKey && authorsData[authorKey]) {
      primaryAuthor = authorsData[authorKey];
    }
  }

  /**
   * ÉTAPE 10 : Fallback pour les auteurs sans données complètes
   * 
   * Si aucun auteur n'est trouvé dans les métadonnées du blog,
   * on vérifie les métadonnées génériques de la page.
   */
  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    const authorKey = pageMetadata.frontMatter.author;
    if (authorsData[authorKey]) {
      primaryAuthor = authorsData[authorKey];
    }
  }

  /**
   * ÉTAPE 11 : Construction du JSON-LD Schema.org
   * 
   * Création de la structure de données structurées selon le type de page.
   * Cette structure est cruciale pour les Rich Results Google.
   */
  const additionalJsonLd = (() => {
    // Structure de base commune à tous les types de pages
    const baseStructure = {
      '@context': 'https://schema.org',           // Contexte Schema.org obligatoire
      '@type': pageInfo.type,                     // Type déterminé par l'analyse de l'URL
      name: title,                                // Nom/titre de la page
      headline: title,                            // Titre principal (alias de name)
      description: description,                   // Description SEO
      url: canonicalUrl,                          // URL canonique propre
      image: {                                    // Image structurée pour Rich Results
        '@type': 'ImageObject',
        url: imageUrl,
        caption: `Image pour: ${title}`
      },
      inLanguage: 'fr-FR',                       // Langue du contenu
      isPartOf: {                                // Relation avec le site parent
        '@type': 'WebSite',
        name: siteConfig.title,
        url: siteConfig.url
      }
    };

    /**
     * Enrichissement spécifique pour les articles de blog (BlogPosting)
     * 
     * Ajoute toutes les métadonnées requises pour les Rich Results d'articles
     */
    if (pageInfo.type === 'BlogPosting' && blogPostData) {
      return {
        ...baseStructure,
        '@type': 'BlogPosting',
        
        // Informations sur l'auteur (structurées selon Schema.org)
        author: primaryAuthor ? {
          '@type': 'Person',
          name: normalizeAuthorName(primaryAuthor.name),
          url: primaryAuthor.url || primaryAuthor.github,
          description: primaryAuthor.title || 'Contributeur Docux',
          image: primaryAuthor.imageUrl
        } : {
          '@type': 'Person',
          name: 'Équipe Docux',
          url: siteConfig.url
        },
        
        // Dates de publication et modification (format ISO)
        datePublished: blogPostData.date || new Date().toISOString(),
        dateModified: blogPostData.lastUpdatedAt || blogPostData.date || new Date().toISOString(),
        
        // Informations sur l'éditeur (organisation)
        publisher: {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig.url + useBaseUrl('/img/docux.png')
          }
        },
        
        // Page principale de l'article
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        
        // Mots-clés et catégorisation
        keywords: blogPostData.frontMatter?.keywords?.join(', ') || 
                 blogPostData.frontMatter?.tags?.join(', ') || 
                 'docusaurus, documentation, tutoriel',
        articleSection: blogPostData.frontMatter?.category || 'Tutoriels',
        
        // Métriques de contenu
        wordCount: blogPostData.readingTime?.words || blogPostData.frontMatter?.wordCount || 500,
        timeRequired: blogPostData.readingTime?.minutes ? 
                     `PT${Math.ceil(blogPostData.readingTime.minutes)}M` : 'PT5M',
        
        // Sujet de l'article (si catégorie définie)
        about: blogPostData.frontMatter?.category ? {
          '@type': 'Thing',
          name: blogPostData.frontMatter.category
        } : undefined,
        
        // Métriques d'interaction enrichies pour Google
        interactionStatistic: blogPostData.readingTime ? {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/ReadAction',
          name: 'Temps de lecture estimé',
          result: {
            '@type': 'QuantitativeValue',
            value: blogPostData.readingTime.minutes,
            unitText: 'minutes'
          }
        } : undefined
      };
    }

    /**
     * Enrichissement pour les pages de collection/listing (index blog, tags, etc.)
     */
    if (pageInfo.type === 'CollectionPage' && isBlogListPage) {
      return {
        ...baseStructure,
        '@type': 'CollectionPage',
        about: {
          '@type': 'Blog',
          name: `Blog - ${siteConfig.title}`,
          description: 'Collection d\'articles et tutoriels sur Docusaurus'
        },
        
        // Fil d'Ariane structuré pour les pages de collection
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: siteConfig.title,
              item: siteConfig.url
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: canonicalUrl
            }
          ]
        },
        
        // Entité principale de la collection
        mainEntity: {
          '@type': 'Blog',
          name: `Blog - ${siteConfig.title}`,
          url: canonicalUrl,
          description: 'Articles et tutoriels sur Docusaurus et le développement web'
        }
      };
    }

    /**
     * Enrichissement pour la page d'accueil (WebSite)
     * 
     * Ajoute les fonctionnalités de recherche et les liens sociaux
     */
    if (pageInfo.type === 'WebSite' && isHomePage) {
      return {
        ...baseStructure,
        '@type': 'WebSite',
        
        // Action de recherche structurée (si fonctionnalité de recherche disponible)
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        
        // Liens vers les profils sociaux du site
        sameAs: [
          'https://github.com/Juniors017/docux-blog',
          // Ajoutez ici d'autres liens de réseaux sociaux si disponibles
          // 'https://twitter.com/docux',
          // 'https://linkedin.com/in/docux'
        ]
      };
    }

    // Retour de la structure de base pour tous les autres types de pages
    return baseStructure;
  })();

  /**
   * ÉTAPE 12 : Préparation des données pour le panel de debug
   * 
   * Collecte toutes les détections et métadonnées pour alimenter
   * le composant SeoDebugPanel en mode développement.
   */
  const detections = {
    isBlogPost,                    // Page d'article individuel
    isBlogListPage,               // Page d'index/listing
    isSeriesPage,                 // Page de série d'articles
    isHomePage,                   // Page d'accueil
    isThanksPage,                 // Page de remerciements
    isRepositoryPage,             // Page repository/projets
    hasAuthor: !!primaryAuthor,   // Auteur détecté
    hasBlogData: !!blogPostData,  // Métadonnées blog disponibles
    hasPageData: !!pageMetadata,  // Métadonnées page disponibles
    hasImage: !!(blogPostData?.frontMatter?.image || 
                 pageMetadata?.frontMatter?.image || 
                 siteConfig.themeConfig?.image) // Image détectée
  };

  /**
   * ÉTAPE 13 : Rendu du composant avec toutes les métadonnées
   * 
   * Génération de toutes les balises HTML nécessaires pour le SEO :
   * - Balises meta de base (title, description, canonical)
   * - Open Graph pour les réseaux sociaux
   * - Twitter Cards pour Twitter
   * - Métadonnées spécifiques aux articles
   * - JSON-LD structuré pour Google Rich Results
   * - Panel de debug en mode développement
   */
  return (
    <>
      <Head>
        {/* ===== BALISES META DE BASE ===== */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* ===== OPEN GRAPH (Facebook, LinkedIn, etc.) ===== */}
        <meta property="og:type" content={pageInfo.type === 'BlogPosting' ? 'article' : 'website'} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={`Image pour: ${title}`} />
        <meta property="og:site_name" content={siteConfig.title} />
        <meta property="og:locale" content="fr_FR" />
        
        {/* ===== TWITTER CARDS ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={`Image pour: ${title}`} />
        
        {/* ===== MÉTADONNÉES SPÉCIFIQUES AUX ARTICLES ===== */}
        {pageInfo.type === 'BlogPosting' && blogPostData && (
          <>
            <meta property="article:published_time" content={blogPostData.date} />
            <meta property="article:modified_time" content={blogPostData.lastUpdatedAt || blogPostData.date} />
            {primaryAuthor && <meta property="article:author" content={normalizeAuthorName(primaryAuthor.name)} />}
            {/* Catégorie de l'article */}
            {blogPostData.frontMatter?.category && (
              <meta property="article:section" content={blogPostData.frontMatter.category} />
            )}
            
            {/* Tags/mots-clés de l'article (un meta tag par mot-clé) */}
            {blogPostData.frontMatter?.keywords?.map((keyword) => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
          </>
        )}
        
        {/* ===== MÉTADONNÉES SUPPLÉMENTAIRES ===== */}
        <meta name="robots" content="index, follow" />      {/* Autoriser l'indexation */}
        <meta name="googlebot" content="index, follow" />   {/* Spécifique à Googlebot */}
        
        {/* ===== JSON-LD POUR LES RICH RESULTS GOOGLE ===== */}
        <script type="application/ld+json">
          {JSON.stringify(additionalJsonLd)}
        </script>
      </Head>
      
      {/* 
        ===== PANEL DE DEBUG SEO ===== 
        
        Composant développé par Docux pour faciliter le développement.
        Affiche un panel flottant avec :
        - Vue d'ensemble des détections de page
        - Validation SEO en temps réel avec score
        - Métriques de performance
        - Actions rapides (export, test Google, etc.)
        
        Le panel ne s'affiche qu'en mode développement (NODE_ENV !== 'production')
      */}
      <SeoDebugPanel 
        jsonLd={additionalJsonLd}          // Structure JSON-LD générée
        pageInfo={pageInfo}                // Type et catégorie de page
        location={location}                // Informations URL/navigation
        blogPostData={blogPostData}        // Métadonnées d'article (si applicable)
        pageMetadata={pageMetadata}        // Métadonnées de page (si applicable)
        siteConfig={siteConfig}           // Configuration globale Docusaurus
        detections={detections}           // Résultats de toutes les détections
      />
    </>
  );
}
