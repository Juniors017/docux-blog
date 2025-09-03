/**
 * Composant SEO Principal - Développé par Docux avec GitHub Copilot
 * 
 * Ce composant gère intelligemment toutes les métadonnées SEO de votre site Docusaurus :
 * - Détection automatique du type de page (blog, statique, accueil...)
 * - Génération des balises meta HTML, Open Graph et Twitter Cards
 * - Création du Schema.org JSON-LD pour les Rich Results Google
 * - Système de fallback robuste pour éviter les erreurs
 * - Panel de debug intégré pour le développement
 * 
 * 🎯 ARCHITECTURE : Utilise SEULEMENT les données priorisées de usePageMetadata
 */

import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import SeoDebugPanel from '../SeoDebugPanel';
import usePageMetadata from './utils/usePageMetadata';
import  {getPageType}  from './utils/getPageType';
import { createOptimizedBreadcrumb, generateGenericBreadcrumb } from './utils/breadcrumbUtils';
import { getSchemaImageUrl } from './utils/seoImageUtils';
import { normalizeAuthorName, getSchemaPrimaryAuthor } from './utils/authorUtils';
import { 
  getSchemaLanguage, 
  getSchemaPublishedDate, 
  getSchemaModifiedDate, 
  getSchemaTitle, 
  getSchemaDescription,
  getSchemaKeywords,
  getSchemaArticleSection,
  getSchemaTechArticleProperties
} from './utils/schemaDataUtils';


import { 
  normalizeUrl, 
  generateCanonicalId, 
  generateCanonicalUrl, 
  validateSchemaUrls, 
  fixAllSchemaUrls 
} from './utils/urlNormalizer';

export default function Seo({ pageData, frontMatter: propsFrontMatter, forceRender = false } = {}) {
  // Récupération du contexte Docusaurus et de la localisation
  const location = useLocation(); // URL et chemin actuels
  const { siteConfig } = useDocusaurusContext(); // Configuration globale du site
  

 

// Récupère les métadonnées enrichies et priorisées directement depuis le hook
// blogPostData = source la plus riche (blog > page)
// pageMetadata = métadonnées prioritaires (page > blog)
const { blogPostData, pageMetadata } = usePageMetadata(pageData, propsFrontMatter);
  if (process.env.NODE_ENV === 'development') {
    console.log('🟣 Résultat usePageMetadata dans Seo:', { blogPostData, pageMetadata });
  }

   /* 
   * Analyse de l'URL pour déterminer le type de contenu.
   * Cette détection influence les métadonnées Schema.org générées.
   */

   
  /* ============================================================================
   * DÉTECTION ET GÉNÉRATION DES MÉTADONNÉES DE BASE
   * ============================================================================ */
  
  // 1.1 Détection du type de page pour Schema.org
  const pageInfo = getPageType({ location, blogPostData, pageMetadata });
  
  // 1.2 Génération des URLs canoniques (ordre des paramètres corrigé)
  const canonicalId = generateCanonicalId(siteConfig, location.pathname);
  const canonicalUrl = generateCanonicalUrl(siteConfig, location.pathname);
  
  // 1.3 Génération du titre avec utilitaire de données priorisées
  const title = getSchemaTitle(pageMetadata, siteConfig);
  
  // 1.4 Génération de la description avec utilitaire de données priorisées
  const description = getSchemaDescription(pageMetadata, siteConfig);
  
  // 1.5 Variables booléennes récupérées directement depuis la détection pageInfo
  // (évite la duplication avec detectPageType)
  const { 
    isBlogPost = false, 
    isBlogListPage = false, 
    isSeriesPage = false, 
    isSpecificSeriesPage = false, 
    isHomePage = false, 
    isThanksPage = false, 
    isRepositoryPage = false 
  } = pageInfo;
  
  
  /* ============================================================================
   * ÉTAPE 2 : FONCTION BREADCRUMB IMPORTÉE
   * ============================================================================ */
  
  // La fonction generateGenericBreadcrumb est maintenant importée depuis :
  // src/components/Seo/utils/breadcrumbUtils.js
  // Plus besoin de la redéfinir localement - plus efficace et réutilisable !

  /**
   * ÉTAPE 8 : Gestion intelligente des images avec données priorisées
   * 
   * Utilise les données déjà priorisées par usePageMetadata au lieu de refaire la logique
   */
  const imageUrl = getSchemaImageUrl(pageMetadata, siteConfig, useBaseUrl);
  if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Schema Image Url (données priorisées):', imageUrl);
    }
  /**
   * ÉTAPE 9 : Gestion des auteurs avec données priorisées
   * 
   * Utilise les données déjà priorisées par usePageMetadata au lieu de refaire la logique
   */
  const primaryAuthor = getSchemaPrimaryAuthor(pageMetadata, siteConfig);
if (process.env.NODE_ENV === 'development') {
      console.log('👥 Mode auteur activé (données priorisées):', primaryAuthor);
    }
  /**
   * ÉTAPE 11 : Construction du JSON-LD Schema.org
   * 
   * Création de la structure de données structurées selon le type de page.
   * Cette structure est cruciale pour les Rich Results Google.
   */
  
  // Récupération des types de schémas depuis le frontmatter
  const schemaTypes = blogPostData?.frontMatter?.schemaTypes || 
                     pageMetadata?.frontMatter?.schemaTypes;
  
  let allSchemas = [];
  
  if (Array.isArray(schemaTypes) && schemaTypes.length > 0) {
    // ✅ APPROCHE EXPLICITE : Générer tous les types demandés
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Mode schémas multiples activé:', schemaTypes);
    }
    
    schemaTypes.forEach((schemaType, index) => {
      // Génération d'IDs différenciés pour éviter les conflits
      const schemaId = index === 0 ? canonicalId : `${canonicalId}#${schemaType.toLowerCase()}`;
      
      const schemaName = blogPostData?.frontMatter?.name || 
                        pageMetadata?.frontMatter?.name || 
                        blogPostData?.frontMatter?.title || 
                        pageMetadata?.frontMatter?.title || 
                        title;
      
      let schemaStructure = {
        '@context': 'https://schema.org',
        '@id': schemaId,
        '@type': schemaType,
        url: canonicalUrl,
        name: schemaName, // ✅ Utilise la valeur du frontMatter
        headline: title,
        description: description,
        image: {
          '@type': 'ImageObject',
          url: imageUrl,
          caption: `Image pour: ${title}`
        },
        // ✅ UTILISE l'utilitaire pour inLanguage avec données priorisées
        inLanguage: getSchemaLanguage(pageMetadata, siteConfig),
        isPartOf: {
          '@type': 'WebSite',
          name: siteConfig.title,
          url: siteConfig.url
        }
      };
      
      // Enrichissement selon le type de schéma
      if (schemaType === 'BlogPosting' || schemaType === 'TechArticle') {
        schemaStructure = {
          ...schemaStructure,
          author: primaryAuthor ? {
            '@type': 'Person',
            name: normalizeAuthorName(primaryAuthor.name),
            url: primaryAuthor.url || primaryAuthor.github,
            description: primaryAuthor.title || 'Contributeur Docux',
            // ✅ CORRECTION : Correction de l'URL image auteur
            image: primaryAuthor.imageUrl?.startsWith('http') 
              ? primaryAuthor.imageUrl 
              : `${siteConfig.url}${primaryAuthor.imageUrl || '/img/docusaurus-social-card.jpg'}`
          } : {
            '@type': 'Person',
            name: 'Équipe Docux',
            url: siteConfig.url
          },
          datePublished: getSchemaPublishedDate(pageMetadata),
          dateModified: getSchemaModifiedDate(pageMetadata),
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
            '@id': canonicalId
          },
          keywords: getSchemaKeywords(pageMetadata),
          articleSection: getSchemaArticleSection(pageMetadata)
        };
        
        // Propriétés spécifiques à TechArticle
        if (schemaType === 'TechArticle') {
          const techProperties = getSchemaTechArticleProperties(pageMetadata);
          
          schemaStructure = {
            ...schemaStructure,
            ...techProperties
          };
        }
      }
      
      allSchemas.push(schemaStructure);
    });
    
    // Ajout du breadcrumb comme schéma séparé
    const breadcrumbJsonLd = generateGenericBreadcrumb(location.pathname, title, siteConfig);
    if (breadcrumbJsonLd && !allSchemas.some(schema => schema['@type'] === 'BreadcrumbList')) {
      allSchemas.push(breadcrumbJsonLd);
    }
    
  } else {
    // ✅ MODE FALLBACK SIMPLE : Si pas de schemaTypes défini
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Mode fallback activé - schéma WebPage par défaut');
    }
    
    const fallbackSchema = {
      '@context': 'https://schema.org',
      '@id': canonicalId,
      '@type': 'WebPage',
      url: canonicalUrl,
      name: title,
      description: description,
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        caption: `Image pour: ${title}`
      },
      inLanguage: getSchemaLanguage(pageMetadata, siteConfig),
      isPartOf: {
        '@type': 'WebSite',
        name: siteConfig.title,
        url: siteConfig.url
      }
    };
    
    allSchemas.push(fallbackSchema);
    
    // Breadcrumb pour fallback
    const breadcrumbJsonLd = generateGenericBreadcrumb(location.pathname, title, siteConfig);
    if (breadcrumbJsonLd) {
      allSchemas.push(breadcrumbJsonLd);
    }
  }

  // Validation et correction automatique des URLs
  const urlValidation = validateSchemaUrls(allSchemas);
  const finalSchemas = urlValidation.isValid 
    ? allSchemas 
    : fixAllSchemaUrls(allSchemas, canonicalId, canonicalUrl);

  // Sélectionne le schéma primaire pour l'affichage (le premier)
  const primarySchema = finalSchemas[0];

  // ✅ LOGIQUE DE DEBUG NETTOYÉE
  const detections = {
    isBlogPost,
    isBlogListPage,
    isSeriesPage,
    isSpecificSeriesPage,
    isHomePage,
    isThanksPage,
    isRepositoryPage,
    hasAuthor: !!primaryAuthor,
    hasBlogData: !!blogPostData,
    hasPageData: !!pageMetadata,
    hasImage: !!imageUrl,
    schemasCount: finalSchemas.length,
    schemaTypes: schemaTypes || ['WebPage']
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
            {(blogPostData.frontMatter?.category || pageMetadata?.frontMatter?.category) && (
              <meta property="article:section" content={blogPostData.frontMatter?.category || pageMetadata?.frontMatter?.category} />
            )}
            
            {/* Tags/mots-clés de l'article (un meta tag par mot-clé) */}
            {blogPostData.frontMatter?.keywords?.map((keyword) => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
            {pageMetadata?.frontMatter?.keywords?.map((keyword) => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
            {pageMetadata?.frontMatter?.tags?.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* ===== MÉTADONNÉES SUPPLÉMENTAIRES ===== */}
        <meta name="robots" content="index, follow" />      {/* Autoriser l'indexation */}
        <meta name="googlebot" content="index, follow" />   {/* Spécifique à Googlebot */}
        
        {/* ===== JSON-LD POUR LES RICH RESULTS GOOGLE ===== */}
        {finalSchemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
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
        jsonLd={primarySchema}             // Schéma JSON-LD principal
        allSchemas={finalSchemas}          // Tous les schémas générés
        urlValidation={urlValidation}      // Résultats de validation des URLs
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