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
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import authorsData from '@site/src/data/authors';
import SeoDebugPanel from '../SeoDebugPanel';
import usePageMetadata from './utils/usePageMetadata';

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
console.log('🟣 Résultat usePageMetadata dans Seo:', { blogPostData, pageMetadata });



  
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
  
  // Page de série spécifique (avec paramètre ?name=)
  const isSpecificSeriesPage = isSeriesPage && location.search.includes('name=');

  // Page d'accueil principale
  const isHomePage = location.pathname === '/' || location.pathname === '/docux-blog/';

  // Page de remerciements
  const isThanksPage = location.pathname.includes('/thanks/');

  // Page repository/projets
  const isRepositoryPage = location.pathname.includes('/repository/');

  /**
   * Fonction de mapping type de page → Schema.org
   * 
   * Ordre de priorité :
   * 1. frontMatter.schemaType (explicite - priorité absolue)
   * 2. Détection intelligente par contenu
   * 3. Détection par URL/contexte (fallback)
   */
  const getPageType = () => {
    // 🎯 PRIORITÉ 1: Configuration explicite via frontMatter
    const customSchemaType = (blogPostData?.frontMatter?.schemaType || pageMetadata?.frontMatter?.schemaType);
    const customSchemaTypes = (blogPostData?.frontMatter?.schemaTypes || pageMetadata?.frontMatter?.schemaTypes);
    
    // 🆕 Si schemaTypes est défini, priorité absolue (nouvelle approche)
    if (Array.isArray(customSchemaTypes) && customSchemaTypes.length > 0) {
      return { type: customSchemaTypes[0], category: `${customSchemaTypes[0]} (schémas multiples configurés)` };
    }
    
    // Ancienne approche avec schemaType (singulier)
    if (customSchemaType) {
      return { type: customSchemaType, category: `${customSchemaType} (configuré)` };
    }

    // 🧠 PRIORITÉ 2: Détection intelligente par contenu
    const title = (blogPostData?.title || pageMetadata?.title || '').toLowerCase();
    const tags = blogPostData?.tags || pageMetadata?.tags || pageMetadata?.frontMatter?.tags || blogPostData?.frontMatter?.tags || [];
    const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};

    // Détection de tutoriels/guides
    if (title.includes('comment ') || title.includes('guide ') || title.includes('tutorial') || title.includes('tuto') || frontMatter.estimatedTime) {
      return { type: 'HowTo', category: 'Tutoriel (auto-détecté)' };
    }

    // Détection d'articles techniques
    const techTags = ['react', 'javascript', 'typescript', 'node', 'api', 'code', 'programming'];
    if (tags.some(tag => techTags.includes(tag.label?.toLowerCase() || tag.toLowerCase() || tag)) || frontMatter.dependencies || frontMatter.programmingLanguage) {
      return { type: 'TechArticle', category: 'Article technique (auto-détecté)' };
    }

    // Détection d'applications/projets
    if (frontMatter.applicationCategory || frontMatter.operatingSystem || frontMatter.downloadUrl) {
      return { type: 'SoftwareApplication', category: 'Application (auto-détectée)' };
    }

    // Détection de formations/cours
    if (frontMatter.provider || frontMatter.courseMode || frontMatter.teaches) {
      return { type: 'Course', category: 'Formation (auto-détectée)' };
    }

    // Détection de profils/personnes
    if (frontMatter.jobTitle || frontMatter.worksFor || frontMatter.knowsAbout) {
      return { type: 'Person', category: 'Profil (auto-détecté)' };
    }

    // Détection FAQ
    if (frontMatter.mainEntity || title.includes('faq') || title.includes('questions')) {
      return { type: 'FAQPage', category: 'FAQ (auto-détectée)' };
    }

    // 🔧 PRIORITÉ 3: Détection par contexte/URL (fallback minimal)
    if (isBlogPost) return { type: 'BlogPosting', category: 'Article de blog (contexte)' };
    if (isBlogListPage) return { type: 'CollectionPage', category: 'Index des articles (contexte)' };
    if (isSpecificSeriesPage) return { type: 'CollectionPage', category: 'Série spécifique (contexte)' };
    if (isSeriesPage) return { type: 'CollectionPage', category: 'Collection de séries (contexte)' };
    if (isHomePage) return { type: 'WebSite', category: 'Page d\'accueil (contexte)' };
    
    // 📄 Fallback ultime pour toutes les autres pages
    return { type: 'WebPage', category: 'Page générale (fallback)' };
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
   * ÉTAPE 7 : Génération de l'URL canonique avec normalisation avancée
   * 
   * Utilise les utilitaires de normalisation pour garantir des URLs cohérentes
   * et éviter les problèmes de doubles slashes dans les schémas JSON-LD.
   */
  const canonicalId = generateCanonicalId(siteConfig, location.pathname);
  const canonicalUrl = generateCanonicalUrl(siteConfig, location.pathname);

  /**
   * Fonction utilitaire pour créer des BreadcrumbList optimisés Google
   * 
   * Applique les bonnes pratiques :
   * - URLs normalisées en minuscules
   * - Items typés en WebPage
   * - Nom global du BreadcrumbList
   */
  const createOptimizedBreadcrumb = (items, listName) => {
    return {
      '@type': 'BreadcrumbList',
      name: listName,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: {
          '@type': 'WebPage',
          '@id': item.url.toLowerCase(),
          name: item.name,
          url: item.url.toLowerCase()
        }
      }))
    };
  };

  /**
   * Fonction utilitaire pour générer des BreadcrumbList optimisés Google
   * 
   * @param {string} pathname - Le chemin de la page courante
   * @param {string} pageTitle - Le titre de la page courante
   * @param {Object} siteConfig - Configuration du site Docusaurus
   * @returns {Object} Objet BreadcrumbList Schema.org optimisé
   */
  const generateGenericBreadcrumb = (pathname, pageTitle, siteConfig) => {
    const items = [];
    
    // 1. Toujours commencer par l'accueil
    items.push({
      name: siteConfig.title,
      url: siteConfig.url
    });

    // 2. Analyser le chemin pour construire la hiérarchie
    const pathSegments = pathname
      .replace('/docux-blog/', '/') // Normaliser le base path
      .split('/')
      .filter(segment => segment.length > 0);

    let currentPath = siteConfig.url;
    
    // 3. Ajouter chaque segment du chemin
    pathSegments.forEach((segment, index) => {
      currentPath += `/docux-blog/${segment}`;
      
      // Ne pas ajouter la page courante comme dernier élément si c'est une page finale
      const isLastSegment = index === pathSegments.length - 1;
      
      let segmentName = segment;
      
      // 4. Personnaliser les noms des segments selon les sections
      switch(segment) {
        case 'blog':
          segmentName = 'Blog';
          break;
        case 'series':
          segmentName = 'Séries d\'articles';
          break;
        case 'repository':
          segmentName = 'Repositories';
          break;
        case 'thanks':
          segmentName = 'Remerciements';
          break;
        case 'tags':
          segmentName = 'Tags';
          break;
        case 'authors':
          segmentName = 'Auteurs';
          break;
        default:
          // Pour les segments dynamiques (dates, slugs), utiliser le titre de la page si c'est le dernier
          if (isLastSegment && pageTitle && pageTitle !== siteConfig.title) {
            segmentName = pageTitle.replace(` | ${siteConfig.title}`, '');
          } else {
            // Capitaliser et remplacer les tirets par des espaces
            segmentName = segment
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
      }
      
      // Ajouter le segment au fil d'Ariane (sauf si c'est la page courante et qu'on a déjà le titre)
      if (!isLastSegment || !pageTitle || pageTitle === siteConfig.title) {
        items.push({
          name: segmentName,
          url: currentPath.endsWith('/') ? currentPath : currentPath + '/'
        });
      }
    });

    // 5. Générer le nom du BreadcrumbList
    const listName = `Navigation - ${pageTitle ? pageTitle.replace(` | ${siteConfig.title}`, '') : 'Page'}`;

    return createOptimizedBreadcrumb(items, listName);
  };

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
  if (!primaryAuthor && pageMetadata?.frontMatter?.authors) {
    // Vérifie d'abord authors (au pluriel) dans pageMetadata
    let authorKey;
    if (Array.isArray(pageMetadata.frontMatter.authors)) {
      authorKey = pageMetadata.frontMatter.authors[0]; // Premier auteur si plusieurs
    } else if (typeof pageMetadata.frontMatter.authors === 'string') {
      authorKey = pageMetadata.frontMatter.authors; // Auteur unique
    }
    
    if (authorKey && authorsData[authorKey]) {
      primaryAuthor = authorsData[authorKey];
    }
  }
  
  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    // Fallback sur author (au singulier)
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
   * 
   * 🆕 Version 2.1.4 : Support des schémas multiples via frontmatter
   */

  /**
   * 🆕 NOUVELLE APPROCHE : Schémas multiples via frontmatter
   * 
   * Permet de spécifier explicitement plusieurs types de schémas dans le frontmatter :
   * 
   * ---
   * title: "Mon Article"
   * schemaTypes: ["TechArticle", "BlogPosting"]
   * proficiencyLevel: "Advanced"  # Pour TechArticle
   * programmingLanguage: "JavaScript"  # Pour TechArticle
   * ---
   */
  
  // Récupération des types de schémas depuis le frontmatter
  const schemaTypes = blogPostData?.frontMatter?.schemaTypes || 
                     pageMetadata?.frontMatter?.schemaTypes;
  
  let allSchemas = [];
  
  if (Array.isArray(schemaTypes) && schemaTypes.length > 0) {
    // ✅ APPROCHE EXPLICITE : Générer tous les types demandés
    console.log('🎯 Mode schémas multiples activé:', schemaTypes);
    
    schemaTypes.forEach((schemaType, index) => {
      // Génération d'IDs différenciés pour éviter les conflits
      const schemaId = index === 0 ? canonicalId : `${canonicalId}#${schemaType.toLowerCase()}`;
      
      let schemaStructure = {
        '@context': 'https://schema.org',
        '@id': schemaId,
        '@type': schemaType,
        url: canonicalUrl,
        name: title,
        headline: title,
        description: description,
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
      
      // Ajout des métadonnées d'auteur si disponibles
      if (primaryAuthor) {
        schemaStructure.author = {
          '@type': 'Person',
          name: primaryAuthor.name,
          url: primaryAuthor.url
        };
      } else {
        schemaStructure.author = {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url
        };
      }
      
      // Ajout des dates si disponibles (pour articles de blog)
      if (blogPostData?.metadata?.date || pageMetadata?.date) {
        schemaStructure.datePublished = blogPostData?.metadata?.date || pageMetadata?.date;
        schemaStructure.dateModified = blogPostData?.metadata?.lastUpdatedAt || 
                                      pageMetadata?.lastUpdatedAt || 
                                      blogPostData?.metadata?.date || 
                                      pageMetadata?.date;
      }
      
      // Ajout de l'éditeur (pour articles de blog)
      if (schemaType === 'BlogPosting' || schemaType === 'TechArticle') {
        schemaStructure.publisher = {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig.url + useBaseUrl('/img/docux.png')
          }
        };
        
        schemaStructure.mainEntityOfPage = {
          '@type': 'WebPage',
          '@id': canonicalId
        };
      }
      
      // Ajout de propriétés spécifiques selon le type
      if (schemaType === 'TechArticle') {
        schemaStructure.proficiencyLevel = blogPostData?.frontMatter?.proficiencyLevel || 
                                          pageMetadata?.frontMatter?.proficiencyLevel || 
                                          'Beginner';
        schemaStructure.programmingLanguage = blogPostData?.frontMatter?.programmingLanguage || 
                                             pageMetadata?.frontMatter?.programmingLanguage || 
                                             'JavaScript';
      }
      
      // Ajout des mots-clés si disponibles
      const keywords = blogPostData?.frontMatter?.keywords || 
                      pageMetadata?.frontMatter?.keywords ||
                      blogPostData?.frontMatter?.tags ||
                      pageMetadata?.frontMatter?.tags;
      
      if (keywords && keywords.length > 0) {
        schemaStructure.keywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      }
      
      allSchemas.push(schemaStructure);
    });
    
    // Ajout du breadcrumb comme schéma séparé
    const breadcrumbJsonLd = generateGenericBreadcrumb(location.pathname, title, siteConfig);
    if (breadcrumbJsonLd) {
      allSchemas.push(breadcrumbJsonLd);
    }
    
  } else {
    // ✅ APPROCHE CLASSIQUE : Un seul schéma basé sur la détection automatique
    console.log('📍 Mode schéma unique activé:', pageInfo.type);
  }

  /**
   * ⚠️ Logique classique maintenue pour compatibilité
   * Cette section sera utilisée seulement si schemaTypes n'est pas défini dans le frontmatter
   */

  /**
   * Utilitaire pour créer des BreadcrumbList optimisés Google
   * 
   * Applique les bonnes pratiques :
   * - URLs normalisées en minuscules
   * - Items typés en WebPage
   * - Nom global du BreadcrumbList
   * 
   * Exemple généré pour /repository/ :
   * {
   *   "@type": "BreadcrumbList",
   *   "name": "Navigation - Repositories Publics",
   *   "itemListElement": [
   *     {
   *       "@type": "ListItem",
   *       "position": 1,
   *       "name": "DOCUX",
   *       "item": {
   *         "@type": "WebPage",
   *         "@id": "https://docuxlab.com",
   *         "name": "DOCUX",
   *         "url": "https://docuxlab.com"
   *       }
   *     },
   *     {
   *       "@type": "ListItem", 
   *       "position": 2,
   *       "name": "Repositories Publics",
   *       "item": {
   *         "@type": "WebPage",
   *         "@id": "https://docuxlab.com/repository/",
   *         "name": "Repositories Publics",
   *         "url": "https://docuxlab.com/repository/"
   *       }
   *     }
   *   ]
   * }
   */

  /**
   * Fonction utilitaire pour extraire le nom de série depuis les paramètres URL
   * 
   * @param {string} search - La query string de l'URL (ex: "?name=seo-docusaurus")
   * @returns {string|null} Le nom décodé de la série ou null
   */
  const getSeriesNameFromUrl = (search) => {
    if (!search) return null;
    const params = new URLSearchParams(search);
    const seriesSlug = params.get('name');
    if (!seriesSlug) return null;
    
    // Essayer de retrouver le nom original de la série depuis les métadonnées
    try {
      if (ExecutionEnvironment.canUseDOM && window.docusaurus) {
        const globalData = window.docusaurus.globalData;
        if (globalData && globalData['docusaurus-plugin-content-blog']) {
          const blogData = globalData['docusaurus-plugin-content-blog'];
          if (blogData && blogData.default && blogData.default.blogPosts) {
            // Chercher une correspondance entre le slug et le nom original
            for (const post of blogData.default.blogPosts) {
              if (post.metadata?.frontMatter?.serie) {
                const originalName = post.metadata.frontMatter.serie;
                const postSlug = originalName
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim('-');
                
                if (postSlug === seriesSlug) {
                  return originalName;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du nom de série:', error);
    }
    
    // Fallback : décoder et formater le slug
    return decodeURIComponent(seriesSlug)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const additionalJsonLd = (() => {
    // Structure de base commune à tous les types de pages
    const baseStructure = {
      '@context': 'https://schema.org',           // Contexte Schema.org obligatoire
      '@id': canonicalId,                         // ID canonique sans slash final
      '@type': pageInfo.type,                     // Type déterminé par l'analyse de l'URL
      name: title,                                // Nom/titre de la page
      headline: title,                            // Titre principal (alias de name)
      description: description,                   // Description SEO
      url: canonicalUrl,                          // URL canonique avec slash final
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
      },
      // 🆕 BreadcrumbList générique pour toutes les pages
      breadcrumb: generateGenericBreadcrumb(location.pathname, title, siteConfig)
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
          '@id': canonicalId
        },
        
        // Mots-clés et catégorisation
        keywords: blogPostData.frontMatter?.keywords?.join(', ') || 
                 blogPostData.frontMatter?.tags?.join(', ') || 
                 pageMetadata?.frontMatter?.keywords?.join(', ') ||
                 pageMetadata?.frontMatter?.tags?.join(', ') ||
                 'docusaurus, documentation, tutoriel',
        articleSection: blogPostData.frontMatter?.category || pageMetadata?.frontMatter?.category || 'Tutoriels',
        
        // Métriques de contenu
        wordCount: blogPostData.readingTime?.words || blogPostData.frontMatter?.wordCount || 500,
        timeRequired: blogPostData.readingTime?.minutes ? 
                     `PT${Math.ceil(blogPostData.readingTime.minutes)}M` : 
                     (blogPostData.frontMatter?.readingTime || 'PT5M'),
        
        // 🆕 v2.1.4 - Améliorations BlogPosting
        
        // Genre de blog
        ...(blogPostData.frontMatter?.genre && {
          genre: blogPostData.frontMatter.genre
        }),
        
        // Audience cible
        ...(blogPostData.frontMatter?.audience && {
          audience: {
            '@type': 'Audience',
            audienceType: blogPostData.frontMatter.audience
          }
        }),
        
        // Langue du contenu
        inLanguage: blogPostData.frontMatter?.inLanguage || 'fr-FR',
        
        // Accès gratuit
        isAccessibleForFree: blogPostData.frontMatter?.isAccessibleForFree !== false,
        
        // Corps de l'article
        ...(blogPostData.frontMatter?.articleBody && {
          articleBody: blogPostData.frontMatter.articleBody
        }),
        
        // URL de discussion
        ...(blogPostData.frontMatter?.discussionUrl && {
          discussionUrl: blogPostData.frontMatter.discussionUrl
        }),
        
        // Nombre de commentaires
        ...(blogPostData.frontMatter?.commentCount !== undefined && {
          commentCount: blogPostData.frontMatter.commentCount
        }),
        
        // Copyright
        ...(blogPostData.frontMatter?.copyrightYear && {
          copyrightYear: blogPostData.frontMatter.copyrightYear
        }),
        
        ...(blogPostData.frontMatter?.copyrightHolder && {
          copyrightHolder: {
            '@type': 'Person',
            name: blogPostData.frontMatter.copyrightHolder
          }
        }),
        
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
     * Enrichissement pour les pages de collection/listing
     * 
     * Gère deux cas :
     * 1. Pages de blog (index, tags, auteurs)
     * 2. Pages de collection personnalisées (comme /repository/)
     */
    if (pageInfo.type === 'CollectionPage') {
      // Configuration spécifique pour les pages de blog
      if (isBlogListPage) {
        return {
          ...baseStructure,
          '@type': 'CollectionPage',
          about: {
            '@type': 'Blog',
            name: `Blog - ${siteConfig.title}`,
            description: 'Collection d\'articles et tutoriels sur Docusaurus'
          },
          
          // Fil d'Ariane optimisé pour les pages de collection blog
          breadcrumb: createOptimizedBreadcrumb([
            {
              name: siteConfig.title,
              url: siteConfig.url
            },
            {
              name: 'Blog',
              url: canonicalUrl
            }
          ], `Navigation - Blog ${siteConfig.title}`),
          
          // Entité principale de la collection blog
          mainEntity: {
            '@type': 'Blog',
            name: `Blog - ${siteConfig.title}`,
            url: canonicalUrl,
            description: 'Articles et tutoriels sur Docusaurus et le développement web'
          }
        };
      }

      // Configuration spécifique pour les pages de série individuelle (avec ?name=)
      if (isSpecificSeriesPage) {
        const seriesName = getSeriesNameFromUrl(location.search);
        let seriesArticles = [];
        let seriesDescription = '';
        
        if (seriesName) {
          try {
            // Récupérer les articles de cette série spécifique
            if (ExecutionEnvironment.canUseDOM && window.docusaurus) {
              const globalData = window.docusaurus.globalData;
              if (globalData && globalData['docusaurus-plugin-content-blog']) {
                const blogData = globalData['docusaurus-plugin-content-blog'];
                if (blogData && blogData.default && blogData.default.blogPosts) {
                  seriesArticles = blogData.default.blogPosts
                    .filter(post => post.metadata?.frontMatter?.serie === seriesName)
                    .map((post, index) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      name: post.metadata.title,
                      url: `${siteConfig.url}${post.metadata.permalink}`,
                      description: post.metadata.description || post.metadata.frontMatter?.description,
                      item: {
                        '@type': 'BlogPosting',
                        headline: post.metadata.title,
                        url: `${siteConfig.url}${post.metadata.permalink}`,
                        datePublished: post.metadata.date,
                        inLanguage: 'fr-FR'
                      }
                    }));
                  
                  seriesDescription = `Série de ${seriesArticles.length} article(s) sur ${seriesName}. Découvrez un parcours d'apprentissage progressif pour maîtriser ce domaine.`;
                }
              }
            }
          } catch (error) {
            console.warn('Erreur lors de la récupération des articles de série:', error);
            seriesDescription = `Articles de la série ${seriesName}`;
          }
        }

        return {
          ...baseStructure,
          '@type': 'CollectionPage',
          
          // Titre et description spécifiques à la série
          name: seriesName ? `${seriesName} - Série d'articles` : 'Série d\'articles',
          headline: seriesName ? `Articles de la série : ${seriesName}` : 'Articles de série',
          description: seriesDescription || `Découvrez tous les articles de la série ${seriesName || 'sélectionnée'}`,
          
          // Schema spécifique pour cette série
          about: {
            '@type': 'CreativeWorkSeries',
            name: seriesName || 'Série d\'articles',
            description: seriesDescription,
            genre: 'Educational Content',
            inLanguage: 'fr-FR',
            numberOfEpisodes: seriesArticles.length,
            publisher: {
              '@type': 'Organization',
              name: siteConfig.title,
              url: siteConfig.url,
              logo: {
                '@type': 'ImageObject',
                url: siteConfig.url + useBaseUrl('/img/docux.png')
              }
            }
          },
          
          // Fil d'Ariane à 3 niveaux pour la série spécifique
          breadcrumb: createOptimizedBreadcrumb([
            {
              name: siteConfig.title,
              url: siteConfig.url
            },
            {
              name: 'Séries d\'articles',
              url: `${siteConfig.url}/series/`
            },
            {
              name: seriesName || 'Série',
              url: canonicalUrl
            }
          ], `Navigation - ${seriesName || 'Série'}`),
          
          // Liste des articles de la série
          mainEntity: {
            '@type': 'ItemList',
            name: `Articles de la série : ${seriesName || 'Série'}`,
            description: seriesDescription,
            url: canonicalUrl,
            numberOfItems: seriesArticles.length,
            itemListOrder: 'ItemListOrderAscending', // Articles triés chronologiquement
            itemListElement: seriesArticles.length > 0 ? seriesArticles : undefined,
            
            // Métadonnées éducatives
            genre: 'Educational Content',
            audience: {
              '@type': 'Audience',
              audienceType: 'Developers and Web Enthusiasts',
              geographicArea: {
                '@type': 'Country',
                name: 'France'
              }
            },
            inLanguage: 'fr-FR'
          },
          
          // Informations de publication
          publisher: {
            '@type': 'Organization',
            name: siteConfig.title,
            url: siteConfig.url,
            logo: {
              '@type': 'ImageObject',
              url: siteConfig.url + useBaseUrl('/img/docux.png')
            }
          }
        };
      }

      // Configuration spécifique pour les pages de séries
      if (isSeriesPage) {
        // Calculer le nombre de séries disponibles pour enrichir les métadonnées
        let seriesCount = 0;
        let seriesItems = [];
        
        try {
          // Tentative de récupération des séries depuis les métadonnées du blog
          if (ExecutionEnvironment.canUseDOM && window.docusaurus) {
            const globalData = window.docusaurus.globalData;
            if (globalData && globalData['docusaurus-plugin-content-blog']) {
              const blogData = globalData['docusaurus-plugin-content-blog'];
              if (blogData && blogData.default && blogData.default.blogPosts) {
                const seriesSet = new Set();
                const seriesInfo = new Map();
                
                // Collecter toutes les séries et leurs informations
                blogData.default.blogPosts.forEach(post => {
                  if (post.metadata?.frontMatter?.serie) {
                    const serieName = post.metadata.frontMatter.serie;
                    seriesSet.add(serieName);
                    
                    if (!seriesInfo.has(serieName)) {
                      seriesInfo.set(serieName, {
                        name: serieName,
                        articles: [],
                        url: `${siteConfig.url}/series/series-articles/?name=${encodeURIComponent(serieName)}`
                      });
                    }
                    
                    seriesInfo.get(serieName).articles.push({
                      title: post.metadata.title,
                      url: `${siteConfig.url}${post.metadata.permalink}`,
                      date: post.metadata.date
                    });
                  }
                });
                
                seriesCount = seriesSet.size;
                
                // Créer les éléments de liste pour le Schema.org
                seriesItems = Array.from(seriesInfo.values()).map((serie, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: serie.name,
                  description: `Série de ${serie.articles.length} article(s) sur ${serie.name}`,
                  url: serie.url,
                  item: {
                    '@type': 'CreativeWorkSeries',
                    name: serie.name,
                    url: serie.url,
                    numberOfEpisodes: serie.articles.length,
                    genre: 'Educational Content',
                    inLanguage: 'fr-FR',
                    publisher: {
                      '@type': 'Organization',
                      name: siteConfig.title,
                      url: siteConfig.url
                    }
                  }
                }));
              }
            }
          }
        } catch (error) {
          // En cas d'erreur, on utilise des valeurs par défaut
          seriesCount = 2; // Valeur par défaut basée sur les séries existantes
          seriesItems = [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Genèse Docux',
              description: 'Série sur la création et l\'évolution du blog Docux',
              url: `${siteConfig.url}/series/series-articles/?name=genese-docux`,
              item: {
                '@type': 'CreativeWorkSeries',
                name: 'Genèse Docux',
                url: `${siteConfig.url}/series/series-articles/?name=genese-docux`,
                numberOfEpisodes: 1,
                genre: 'Educational Content',
                inLanguage: 'fr-FR',
                publisher: {
                  '@type': 'Organization',
                  name: siteConfig.title,
                  url: siteConfig.url
                }
              }
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'SEO Docusaurus',
              description: 'Série sur l\'optimisation SEO avec Docusaurus',
              url: `${siteConfig.url}/series/series-articles/?name=seo-docusaurus`,
              item: {
                '@type': 'CreativeWorkSeries',
                name: 'SEO Docusaurus',
                url: `${siteConfig.url}/series/series-articles/?name=seo-docusaurus`,
                numberOfEpisodes: 1,
                genre: 'Educational Content',
                inLanguage: 'fr-FR',
                publisher: {
                  '@type': 'Organization',
                  name: siteConfig.title,
                  url: siteConfig.url
                }
              }
            }
          ];
        }

        return {
          ...baseStructure,
          '@type': 'CollectionPage',
          
          // Enrichir la description avec le nombre de séries
          description: `Découvrez nos ${seriesCount} séries d'articles organisées par thématique : développement web, Docusaurus, React, SEO et bien plus. Collections d'articles approfondis pour progresser étape par étape.`,
          
          // Sujet principal de la collection
          about: {
            '@type': 'CreativeWorkSeries',
            name: `Séries d'articles - ${siteConfig.title}`,
            description: 'Collection de séries d\'articles organisées par thématique',
            genre: 'Educational Content',
            inLanguage: 'fr-FR',
            numberOfSeries: seriesCount,
            publisher: {
              '@type': 'Organization',
              name: siteConfig.title,
              url: siteConfig.url,
              logo: {
                '@type': 'ImageObject',
                url: siteConfig.url + useBaseUrl('/img/docux.png')
              }
            }
          },
          
          // Fil d'Ariane optimisé pour les pages de séries
          breadcrumb: createOptimizedBreadcrumb([
            {
              name: siteConfig.title,
              url: siteConfig.url
            },
            {
              name: 'Séries d\'articles',
              url: canonicalUrl
            }
          ], `Navigation - Séries ${siteConfig.title}`),
          
          // Entité principale de la collection de séries avec éléments détaillés
          mainEntity: {
            '@type': 'ItemList',
            name: 'Séries d\'articles',
            description: 'Collection de séries d\'articles organisées par thématique et domaine d\'expertise',
            url: canonicalUrl,
            numberOfItems: seriesCount,
            itemListOrder: 'Unordered',
            itemListElement: seriesItems.length > 0 ? seriesItems : undefined,
            
            // Métadonnées supplémentaires pour améliorer la compréhension par Google
            genre: 'Educational Content',
            audience: {
              '@type': 'Audience',
              audienceType: 'Developers and Web Enthusiasts',
              geographicArea: {
                '@type': 'Country',
                name: 'France'
              }
            },
            
            // Catégorisation thématique
            keywords: [
              'séries d\'articles',
              'collections thématiques',
              'tutoriels progressifs',
              'développement web',
              'docusaurus',
              'react',
              'javascript',
              'apprentissage',
              'formation'
            ].join(', '),
            
            // Informations sur l'organisation
            provider: {
              '@type': 'Organization',
              name: siteConfig.title,
              url: siteConfig.url,
              logo: {
                '@type': 'ImageObject',
                url: siteConfig.url + useBaseUrl('/img/docux.png')
              },
              sameAs: [
                'https://github.com/Juniors017/docux-blog'
              ]
            }
          },
          
          // Informations supplémentaires pour le contexte éducatif
          educationalUse: 'Professional Development',
          learningResourceType: 'Article Series',
          typicalAgeRange: '18-99',
          
          // Éditeur de la collection
          publisher: {
            '@type': 'Organization',
            name: siteConfig.title,
            url: siteConfig.url,
            logo: {
              '@type': 'ImageObject',
              url: siteConfig.url + useBaseUrl('/img/docux.png')
            }
          },
          
          // Date de création/mise à jour
          datePublished: pageMetadata?.frontMatter?.date || '2025-08-29',
          dateModified: new Date().toISOString().split('T')[0],
          
          // Mots-clés enrichis
          keywords: [
            'séries d\'articles',
            'collections thématiques',
            'tutoriels progressifs',
            'développement web',
            'docusaurus',
            'react',
            'javascript',
            'apprentissage',
            'formation',
            'éducation',
            'programmation'
          ].join(', ')
        };
      }
      
      // Configuration pour les pages de collection personnalisées (repository, etc.)
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'CollectionPage',
        
        // Informations sur l'auteur si disponible
        ...(primaryAuthor && {
          author: {
            '@type': 'Person',
            name: normalizeAuthorName(primaryAuthor.name),
            url: primaryAuthor.url || primaryAuthor.github,
            description: primaryAuthor.title || 'Contributeur Docux',
            image: primaryAuthor.imageUrl
          }
        }),
        
        // Date de publication/mise à jour si disponible
        ...(frontMatter.date && {
          datePublished: frontMatter.date
        }),
        ...(frontMatter.last_update?.date && {
          dateModified: frontMatter.last_update.date
        }),
        
        // Catégorie de la collection
        ...(frontMatter.category && {
          about: {
            '@type': 'Thing',
            name: frontMatter.category,
            description: `Collection de contenus sur le thème : ${frontMatter.category}`
          }
        }),
        
        // Mots-clés spécifiques à la collection
        ...(frontMatter.keywords && {
          keywords: Array.isArray(frontMatter.keywords) 
            ? frontMatter.keywords.join(', ')
            : frontMatter.keywords
        }),
        
        // Entité principale de la collection personnalisée
        mainEntity: {
          '@type': 'ItemList',
          name: title,
          description: description,
          numberOfItems: frontMatter.numberOfItems || undefined,
          ...(frontMatter.category && {
            about: frontMatter.category
          })
        },
        
        // Fil d'Ariane optimisé pour les collections personnalisées
        breadcrumb: createOptimizedBreadcrumb([
          {
            name: siteConfig.title,
            url: siteConfig.url
          },
          {
            name: title,
            url: canonicalUrl
          }
        ], `Navigation - ${title}`),
        
        // Informations spécifiques aux projets/repositories si c'est une page repository
        ...(isRepositoryPage && {
          specialty: 'Open Source Projects',
          additionalType: 'SoftwareSourceCode',
          programmingLanguage: frontMatter.programmingLanguage || ['JavaScript', 'TypeScript', 'React'],
          codeRepository: 'https://github.com/Juniors017'
        })
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

    /**
     * 🆕 Enrichissement pour les tutoriels (HowTo)
     * 
     * Structure adaptée aux guides étape par étape
     */
    if (pageInfo.type === 'HowTo' && (blogPostData || pageMetadata)) {
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'HowTo',
        
        // 🆕 v2.1.4 - Métadonnées enrichies HowTo
        
        // Temps total et estimations détaillées
        totalTime: frontMatter.totalTime || frontMatter.timeRequired || 'PT30M',
        
        // Temps de préparation spécifique
        ...(frontMatter.prepTime && {
          prepTime: frontMatter.prepTime
        }),
        
        // Temps d'exécution
        ...(frontMatter.performTime && {
          performTime: frontMatter.performTime
        }),
        
        // Niveau de difficulté
        difficulty: frontMatter.difficulty || 'Beginner',
        
        // Coût estimé
        ...(frontMatter.estimatedCost && {
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'EUR',
            value: frontMatter.estimatedCost
          }
        }),
        
        // Résultat attendu
        ...(frontMatter.yield && {
          yield: frontMatter.yield
        }),
        
        // Outils nécessaires (support array depuis frontmatter)
        ...(frontMatter.tool && {
          tool: Array.isArray(frontMatter.tool) 
            ? frontMatter.tool.map(tool => ({
                '@type': 'HowToTool',
                name: tool
              }))
            : [{ '@type': 'HowToTool', name: frontMatter.tool }]
        }),
        
        // Matériaux/fournitures requis
        ...(frontMatter.supply && {
          supply: Array.isArray(frontMatter.supply)
            ? frontMatter.supply.map(item => ({
                '@type': 'HowToSupply',
                name: item
              }))
            : [{ '@type': 'HowToSupply', name: frontMatter.supply }]
        }),
        
        // Audience et niveau requis
        ...(frontMatter.audience && {
          audience: {
            '@type': 'Audience',
            audienceType: frontMatter.audience
          }
        }),
        
        // Compétences requises
        ...(frontMatter.proficiencyLevel && {
          proficiencyLevel: frontMatter.proficiencyLevel
        }),
        
        // Instructions (si définies dans le frontMatter)
        ...(frontMatter.steps && {
          step: Array.isArray(frontMatter.steps)
            ? frontMatter.steps.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                name: step.name || `Étape ${index + 1}`,
                text: step.text,
                ...(step.image && { image: step.image }),
                ...(step.url && { url: step.url })
              }))
            : [{ 
                '@type': 'HowToStep',
                position: 1,
                name: 'Instructions',
                text: frontMatter.steps
              }]
        })
      };
    }

    /**
     * 🆕 Enrichissement pour les articles techniques (TechArticle)
     * 
     * Structure optimisée pour le contenu technique
     */
    if (pageInfo.type === 'TechArticle' && (blogPostData || pageMetadata)) {
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'TechArticle',
        
        // Informations sur l'auteur (même logique que BlogPosting)
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
        
        // Dates de publication si disponibles
        ...(blogPostData?.date && {
          datePublished: blogPostData.date || new Date().toISOString()
        }),
        ...(blogPostData?.lastUpdatedAt && {
          dateModified: blogPostData.lastUpdatedAt || new Date().toISOString()
        }),
        
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
        
        // Niveau de compétence requis
        proficiencyLevel: frontMatter.proficiencyLevel || frontMatter.difficulty || 'Beginner',
        
        // Dépendances techniques
        ...(frontMatter.dependencies && {
          dependencies: Array.isArray(frontMatter.dependencies) 
            ? frontMatter.dependencies.join(', ')
            : frontMatter.dependencies
        }),
        
        // Version du logiciel/framework
        ...(frontMatter.version && {
          softwareVersion: frontMatter.version
        }),
        
        // Langage de programmation principal
        ...(frontMatter.programmingLanguage && {
          programmingLanguage: Array.isArray(frontMatter.programmingLanguage)
            ? frontMatter.programmingLanguage
            : [frontMatter.programmingLanguage]
        }),
        
        // 🆕 Améliorations v2.1.4 - Métadonnées enrichies
        
        // Temps requis pour suivre le tutoriel
        ...(frontMatter.timeRequired && {
          timeRequired: frontMatter.timeRequired
        }),
        
        // Catégorie d'application
        ...(frontMatter.applicationCategory && {
          applicationCategory: frontMatter.applicationCategory
        }),
        
        // Systèmes d'exploitation supportés
        ...(frontMatter.operatingSystem && {
          operatingSystem: Array.isArray(frontMatter.operatingSystem)
            ? frontMatter.operatingSystem
            : [frontMatter.operatingSystem]
        }),
        
        // Exigences navigateur
        ...(frontMatter.browserRequirements && {
          browserRequirements: frontMatter.browserRequirements
        }),
        
        // Audience cible
        ...(frontMatter.audience && {
          audience: {
            '@type': 'Audience',
            audienceType: frontMatter.audience
          }
        }),
        
        // Type de ressource d'apprentissage
        ...(frontMatter.learningResourceType && {
          learningResourceType: frontMatter.learningResourceType
        }),
        
        // Niveau éducationnel
        ...(frontMatter.educationalLevel && {
          educationalLevel: frontMatter.educationalLevel
        }),
        
        // Usage éducationnel
        ...(frontMatter.educationalUse && {
          educationalUse: frontMatter.educationalUse
        }),
        
        // Repository de code source
        ...(frontMatter.codeRepository && {
          codeRepository: {
            '@type': 'SoftwareSourceCode',
            codeRepository: frontMatter.codeRepository,
            programmingLanguage: frontMatter.programmingLanguage
          }
        }),
        
        // Compatibilité et prérequis
        ...(frontMatter.softwareRequirements && {
          softwareRequirements: frontMatter.softwareRequirements
        }),
        
        // Code source associé
        ...(frontMatter.codeRepository && {
          codeRepository: frontMatter.codeRepository
        })
      };
    }

    /**
     * 🆕 Enrichissement pour les pages FAQ (FAQPage)
     * 
     * Structure optimisée pour les questions/réponses
     */
    if (pageInfo.type === 'FAQPage' && (blogPostData || pageMetadata)) {
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'FAQPage',
        
        // Entité principale : FAQ
        mainEntity: frontMatter.faq && Array.isArray(frontMatter.faq) 
          ? frontMatter.faq.map((item, index) => ({
              '@type': 'Question',
              '@id': `${canonicalId}#faq-${index + 1}`,
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
                ...(item.answerUrl && { url: item.answerUrl })
              }
            }))
          : [],
        
        // Informations sur l'auteur
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
        
        // Dates de publication si disponibles
        ...(blogPostData?.date && {
          datePublished: blogPostData.date || new Date().toISOString()
        }),
        ...(blogPostData?.lastUpdatedAt && {
          dateModified: blogPostData.lastUpdatedAt || new Date().toISOString()
        }),
        
        // Informations sur l'éditeur
        publisher: {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig.url + useBaseUrl('/img/docux.png')
          }
        },
        
        // Audience et langue
        ...(frontMatter.audience && {
          audience: {
            '@type': 'Audience',
            audienceType: frontMatter.audience
          }
        }),
        
        inLanguage: frontMatter.inLanguage || 'fr-FR',
        isAccessibleForFree: frontMatter.isAccessibleForFree !== false,
        
        // Genre de contenu
        ...(frontMatter.genre && {
          genre: frontMatter.genre
        }),
        
        // Sujet principal
        ...(frontMatter.category && {
          about: {
            '@type': 'Thing',
            name: frontMatter.category
          }
        })
      };
    }

    /**
     * 🆕 Enrichissement pour les applications logicielles (SoftwareApplication)
     * 
     * Structure pour présenter des projets/applications
     */
    if (pageInfo.type === 'SoftwareApplication' && (blogPostData || pageMetadata)) {
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'SoftwareApplication',
        
        // Catégorie d'application
        applicationCategory: frontMatter.applicationCategory || 'WebApplication',
        
        // Systèmes d'exploitation supportés
        operatingSystem: frontMatter.operatingSystem || 'Web Browser',
        
        // Langages de programmation
        programmingLanguage: frontMatter.programmingLanguage || 'JavaScript',
        
        // Version du logiciel
        softwareVersion: frontMatter.version || '1.0.0',
        
        // Licence
        ...(frontMatter.license && {
          license: frontMatter.license
        }),
        
        // URL de téléchargement/démo
        ...(frontMatter.downloadUrl && {
          downloadUrl: frontMatter.downloadUrl
        }),
        
        // Code source
        ...(frontMatter.codeRepository && {
          codeRepository: frontMatter.codeRepository
        }),
        
        // Captures d'écran
        ...(frontMatter.screenshots && {
          screenshot: frontMatter.screenshots.map(url => ({
            '@type': 'ImageObject',
            url: url,
            contentUrl: url
          }))
        })
      };
    }

    /**
     * 🆕 Enrichissement pour les cours/formations (Course)
     * 
     * Structure pour le contenu éducatif
     */
    if (pageInfo.type === 'Course' && (blogPostData || pageMetadata)) {
      const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
      
      return {
        ...baseStructure,
        '@type': 'Course',
        
        // Fournisseur du cours
        provider: {
          '@type': 'Organization',
          name: frontMatter.provider || siteConfig.title,
          url: siteConfig.url
        },
        
        // Mode de diffusion
        courseMode: frontMatter.courseMode || 'online',
        
        // Prérequis
        ...(frontMatter.coursePrerequisites && {
          coursePrerequisites: frontMatter.coursePrerequisites
        }),
        
        // Durée
        ...(frontMatter.timeRequired && {
          timeRequired: frontMatter.timeRequired
        }),
        
        // Niveau
        educationalLevel: frontMatter.educationalLevel || 'Beginner',
        
        // Compétences acquises
        ...(frontMatter.teaches && {
          teaches: frontMatter.teaches
        })
      };
    }

    // Retour de la structure de base pour tous les autres types de pages
    return baseStructure;
  })();

  /**
   * ÉTAPE 11.5 : Gestion des schémas (approche classique ou nouvelle)
   * 
   * La nouvelle approche frontmatter a déjà construit les schémas.
   * Cette section s'exécute seulement pour l'approche classique.
   */
  
  // Si on n'utilise pas la nouvelle approche frontmatter, utiliser l'ancienne logique
  if (!Array.isArray(schemaTypes) || schemaTypes.length === 0) {
    
    // Ajoute le schéma principal
    if (additionalJsonLd) {
      allSchemas.push(additionalJsonLd);
    }
  
  // Ajoute un TechArticle si c'est un article de blog technique
  if (pageInfo.type === 'BlogPosting' && blogPostData?.frontMatter?.keywords) {
    const keywords = blogPostData.frontMatter.keywords;
    const isTechnical = keywords.some(keyword => 
      keyword.includes('technique') || 
      keyword.includes('code') || 
      keyword.includes('développement') ||
      keyword.includes('programmation') ||
      keyword.includes('api') ||
      keyword.includes('framework')
    );
    
    if (isTechnical) {
      const techArticleSchema = {
        '@context': 'https://schema.org',
        '@id': `${canonicalId}#techarticle`, // ID unique pour TechArticle
        '@type': 'TechArticle',
        url: canonicalUrl,
        name: title,
        headline: title,
        description: description,
        image: {
          '@type': 'ImageObject',
          url: imageUrl,
          caption: `Image pour: ${title}`
        },
        author: primaryAuthor
          ? {
              '@type': 'Person',
              name: normalizeAuthorName(primaryAuthor.name),
              url: primaryAuthor.url || primaryAuthor.github,
            }
          : {
              '@type': 'Organization',
              name: siteConfig.title,
              url: siteConfig.url,
            },
        datePublished: blogPostData?.date || new Date().toISOString(),
        dateModified: blogPostData?.lastUpdatedAt || blogPostData?.date || new Date().toISOString(),
        publisher: {
          '@type': 'Organization',
          name: siteConfig.title,
          url: siteConfig.url,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig.url + useBaseUrl('/img/docux.png'),
          },
        },
        proficiencyLevel: blogPostData?.frontMatter?.proficiencyLevel || 'Beginner',
        programmingLanguage: blogPostData?.frontMatter?.programmingLanguage || 'JavaScript',
        keywords: keywords.join(', '),
      };
      
      allSchemas.push(techArticleSchema);
    }
  }  // Fin de l'approche classique
  
  } // Fermeture du if pour l'approche classique
  
  // Validation et correction automatique des URLs
  const urlValidation = validateSchemaUrls(allSchemas);
  const finalSchemas = urlValidation.isValid 
    ? allSchemas 
    : fixAllSchemaUrls(allSchemas, canonicalId, canonicalUrl);
  
  // Sélectionne le schéma primaire pour l'affichage (le premier)
  const primarySchema = finalSchemas[0] || additionalJsonLd;

  /**
   * ÉTAPE 12 : Préparation des données pour le panel de debug
   * 
   * Collecte toutes les détections et métadonnées pour alimenter
   * le composant SeoDebugPanel en mode développement.
   * Inclut maintenant les informations de validation des URLs.
   */
  const detections = {
    isBlogPost,                    // Page d'article individuel
    isBlogListPage,               // Page d'index/listing
    isSeriesPage,                 // Page de série d'articles
    isSpecificSeriesPage,         // Page de série spécifique (avec ?name=)
    isHomePage,                   // Page d'accueil
    isThanksPage,                 // Page de remerciements
    isRepositoryPage,             // Page repository/projets
    hasAuthor: !!primaryAuthor,   // Auteur détecté
    hasBlogData: !!blogPostData,  // Métadonnées blog disponibles
    hasPageData: !!pageMetadata,  // Métadonnées de page disponibles
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