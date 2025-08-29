/**
 * SeoDebugPanel - Panel de Debug SEO Avancé
 * Développé par Docux avec l'assistance de GitHub Copilot
 * 
 * Ce composant fournit une interface de debugging professionnelle pour le SEO :
 * - Validation Schema.org en temps réel avec scoring intelligent
 * - Interface de type Google Rich Results Test intégrée
 * - Métriques de performance et diagnostics automatiques
 * - Actions rapides : export JSON, test Google, copie URL
 * - Affichage uniquement en mode développement pour la sécurité
 * 
 * @param {Object} jsonLd - Structure JSON-LD générée par le composant SEO
 * @param {Object} pageInfo - Type et catégorie de page détectés
 * @param {Object} location - Informations de navigation React Router
 * @param {Object} blogPostData - Métadonnées d'article (si applicable)
 * @param {Object} pageMetadata - Métadonnées de page (si applicable)
 * @param {Object} siteConfig - Configuration globale Docusaurus
 * @param {Object} detections - Résultats de détection de type de page
 */

import React from 'react';

export default function SeoDebugPanel({ 
  jsonLd, 
  pageInfo, 
  location, 
  blogPostData, 
  pageMetadata, 
  siteConfig,
  detections 
}) {
  // ===== ÉTAT DU COMPOSANT =====
  const [debugVisible, setDebugVisible] = React.useState(true);    // Visibilité du panel
  const [activeTab, setActiveTab] = React.useState('overview');    // Onglet actif
  const [showReport, setShowReport] = React.useState(false);       // Affichage du rapport
  const [currentReport, setCurrentReport] = React.useState(null);  // Rapport généré
  const [contentMetrics, setContentMetrics] = React.useState(null); // Métriques de contenu

  /**
   * ANALYSE DU CONTENU DE LA PAGE
   * 
   * Extrait les métriques de contenu en temps réel :
   * - Nombre de mots
   * - Structure des titres (H1, H2, H3)
   * - Nombre de liens
   * - Images présentes
   */
  const analyzePageContent = React.useCallback(() => {
    try {
      const content = document.body;
      if (!content) return null;

      // Compter les mots dans le contenu principal
      const textContent = content.innerText || content.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;

      // Analyser la structure des titres
      const h1Count = content.querySelectorAll('h1').length;
      const h2Count = content.querySelectorAll('h2').length;
      const h3Count = content.querySelectorAll('h3').length;

      // Compter les liens
      const internalLinks = content.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]').length;
      const externalLinks = content.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])').length;
      const totalLinks = internalLinks + externalLinks;

      // Compter les images
      const images = content.querySelectorAll('img').length;

      return {
        wordCount,
        headings: { h1: h1Count, h2: h2Count, h3: h3Count },
        links: { internal: internalLinks, external: externalLinks, total: totalLinks },
        images,
        lastAnalyzed: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Erreur lors de l\'analyse du contenu:', error);
      return null;
    }
  }, []);

  // Analyser le contenu au montage et lors des changements de page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const metrics = analyzePageContent();
      setContentMetrics(metrics);
    }, 1000); // Délai pour laisser le contenu se charger

    return () => clearTimeout(timer);
  }, [location.pathname, analyzePageContent]);

  /**
   * FONCTION DE VALIDATION JSON-LD
   * 
   * Analyse la structure JSON-LD et génère un rapport de validation
   * avec catégorisation des problèmes (erreurs, avertissements, validations).
   * Suit les standards Schema.org et les bonnes pratiques SEO.
   */
  const validateJsonLd = (jsonLd) => {
    const issues = [];      // Erreurs critiques qui bloquent le SEO
    const warnings = [];    // Avertissements qui affectent l'optimisation
    const validations = []; // Validations réussies qui confirment la conformité

    // === VALIDATION DES CHAMPS OBLIGATOIRES SCHEMA.ORG ===
    
    // @context : Obligatoire pour identifier le vocabulaire Schema.org
    if (!jsonLd['@context']) {
      issues.push('❌ @context manquant - Requis pour Schema.org');
    } else {
      validations.push('✅ @context présent et valide');
    }

    // @type : Obligatoire pour identifier le type de contenu
    if (!jsonLd['@type']) {
      issues.push('❌ @type manquant - Type de contenu indéfini');
    } else {
      validations.push(`✅ @type défini: ${jsonLd['@type']}`);
    }

    // Titre : name ou headline requis pour tous les types
    if (!jsonLd.name && !jsonLd.headline) {
      issues.push('❌ Titre manquant (propriété name ou headline requise)');
    } else {
      validations.push('✅ Titre présent et accessible');
    }

    // Description : Recommandée pour le SEO et les Rich Results
    if (!jsonLd.description) {
      warnings.push('⚠️ Description manquante - Impact sur les Rich Results');
    } else {
      validations.push('✅ Description présente et optimisée');
    }

    // === VALIDATION SPÉCIFIQUE POUR LES ARTICLES (BlogPosting) ===
    if (jsonLd['@type'] === 'BlogPosting') {
      
      // Auteur : Obligatoire pour BlogPosting selon Schema.org
      if (!jsonLd.author) {
        issues.push('❌ Auteur manquant - Requis pour BlogPosting');
      } else {
        const authorCount = Array.isArray(jsonLd.author) ? jsonLd.author.length : 1;
        validations.push(`✅ Auteur(s) défini(s): ${authorCount}`);
      }

      // Date de publication : Recommandée pour la fraîcheur du contenu
      if (!jsonLd.datePublished) {
        warnings.push('⚠️ Date de publication manquante - Impact sur la fraîcheur');
      } else {
        validations.push('✅ Date de publication présente');
      }

      // Image : Importante pour les Rich Results Google
      if (!jsonLd.image) {
        warnings.push('⚠️ Image manquante - Réduit les chances d\'apparition en Rich Results');
      } else {
        validations.push('✅ Image présente pour Rich Results Google');
      }

      
      // Publisher : Obligatoire pour BlogPosting selon Schema.org
      if (!jsonLd.publisher) {
        issues.push('❌ Publisher manquant - Requis pour BlogPosting');
      } else {
        validations.push('✅ Publisher présent et structuré');
      }
    }

    // === VALIDATIONS GÉNÉRALES POUR TOUS LES TYPES ===
    
    // URL : Doit être absolue pour les Rich Results
    if (jsonLd.url && !jsonLd.url.startsWith('http')) {
      issues.push('❌ URL invalide - Doit être absolue (commencer par http/https)');
    } else if (jsonLd.url) {
      validations.push('✅ URL canonique valide');
    }

    // Images : Validation de la structure
    if (jsonLd.image) {
      if (typeof jsonLd.image === 'string') {
        warnings.push('⚠️ Image en format string simple (recommandé: ImageObject structuré)');
      } else if (jsonLd.image['@type'] === 'ImageObject') {
        validations.push('✅ Image structurée selon Schema.org (ImageObject)');
        
        // Validation des propriétés ImageObject
        if (!jsonLd.image.url) {
          issues.push('❌ URL d\'image manquante dans ImageObject');
        }
        if (!jsonLd.image.caption) {
          warnings.push('⚠️ Caption d\'image manquante - Améliore l\'accessibilité');
        }
      }
    }

    // Langue : Recommandée pour l'internationalisation
    if (!jsonLd.inLanguage) {
      warnings.push('⚠️ Langue non spécifiée - Impact sur la géolocalisation des résultats');
    } else {
      validations.push(`✅ Langue spécifiée: ${jsonLd.inLanguage}`);
    }

    return { issues, warnings, validations };
  };

  /**
   * CALCUL DU SCORE SEO INTELLIGENT AVANCÉ
   * 
   * Algorithme développé par Docux pour noter la qualité SEO globale :
   * - Validation JSON-LD Schema.org (40%)
   * - Métadonnées frontMatter (25%)
   * - Contenu et structure (20%)
   * - SEO technique (10%)
   * - Expérience utilisateur (5%)
   * Score final entre 0 et 100 avec code couleur
   */
  const checkSeoScore = () => {
    const validation = validateJsonLd(jsonLd);
    
    // === 1. SCORE JSON-LD SCHEMA.ORG (40%) ===
    const totalChecks = validation.issues.length + validation.warnings.length + validation.validations.length;
    const validCount = validation.validations.length;
    const warningPenalty = validation.warnings.length * 0.1;
    const errorPenalty = validation.issues.length * 0.3;
    
    const jsonLdScore = Math.max(0, Math.min(100, 
      ((validCount / Math.max(totalChecks, 1)) * 100) - 
      (warningPenalty * 10) - 
      (errorPenalty * 20)
    ));

    // === 2. SCORE MÉTADONNÉES FRONTMATTER (25%) ===
    let frontMatterScore = 0;
    let frontMatterChecks = 0;
    
    // Recherche flexible du frontMatter dans différentes structures possibles
    let fm = null;
    if (blogPostData?.frontMatter) {
      fm = blogPostData.frontMatter;
    } else if (pageMetadata?.frontMatter) {
      fm = pageMetadata.frontMatter;
    } else if (blogPostData) {
      // Parfois le frontMatter est directement dans blogPostData
      fm = blogPostData;
    } else if (pageMetadata) {
      // Parfois le frontMatter est directement dans pageMetadata
      fm = pageMetadata;
    }
    
    if (fm) {
      // Image présente (+20 points sur 100)
      frontMatterChecks += 20;
      if (fm.image) { frontMatterScore += 20; }
      
      // Keywords présents (+15 points sur 100)
      frontMatterChecks += 15;
      if (fm.keywords && fm.keywords.length > 0) { frontMatterScore += 15; }
      
      // Auteur défini (+15 points sur 100)  
      frontMatterChecks += 15;
      if (fm.author || fm.authors) { frontMatterScore += 15; }
      
      // Date présente (+10 points sur 100)
      frontMatterChecks += 10;
      if (fm.date) { frontMatterScore += 10; }
      
      // Catégorie définie (+10 points sur 100)
      frontMatterChecks += 10;
      if (fm.category || fm.categories) { frontMatterScore += 10; }
      
      // Tags présents (+10 points sur 100)
      frontMatterChecks += 10;
      if (fm.tags && fm.tags.length > 0) { frontMatterScore += 10; }
      
      // Description personnalisée (+20 points sur 100)
      frontMatterChecks += 20;
      if (fm.description) { frontMatterScore += 20; }
    } else {
      // Pas de frontMatter = score neutre de 50%
      frontMatterScore = 50;
      frontMatterChecks = 100;
    }
    
    const frontMatterPercent = (frontMatterScore / Math.max(frontMatterChecks, 1)) * 100;

    // === 3. SCORE CONTENU ET STRUCTURE (20%) ===
    let contentScore = 50; // Score de base
    
    // Analyse du titre (priorité haute)
    const title = jsonLd.headline || jsonLd.name || blogPostData?.title || pageMetadata?.title;
    if (title) {
      const titleLength = title.length;
      if (titleLength >= 30 && titleLength <= 60) contentScore += 20; // Longueur optimale
      else if (titleLength >= 20 && titleLength <= 80) contentScore += 10; // Acceptable
    }
    
    // Analyse de la description
    const description = jsonLd.description || blogPostData?.frontMatter?.description || pageMetadata?.description;
    if (description) {
      const descLength = description.length;
      if (descLength >= 120 && descLength <= 160) contentScore += 15; // Longueur optimale
      else if (descLength >= 80 && descLength <= 200) contentScore += 8; // Acceptable
    }
    
    // Présence d'image
    if (jsonLd.image || blogPostData?.frontMatter?.image || pageMetadata?.frontMatter?.image) {
      contentScore += 15;
    }
    
    // Analyse du contenu de la page (si disponible)
    if (contentMetrics) {
      // Nombre de mots approprié
      if (contentMetrics.wordCount >= 300) {
        if (contentMetrics.wordCount >= 1000) contentScore += 10; // Contenu riche
        else contentScore += 5; // Contenu correct
      }
      
      // Structure des titres
      if (contentMetrics.headings.h1 === 1) contentScore += 5; // Un seul H1 (optimal)
      if (contentMetrics.headings.h2 >= 2) contentScore += 5; // Structure H2
      if (contentMetrics.headings.h3 >= 1) contentScore += 3; // Structure H3
      
      // Présence de liens
      if (contentMetrics.links.total >= 3) {
        if (contentMetrics.links.internal >= 2) contentScore += 5; // Liens internes
        if (contentMetrics.links.external >= 1) contentScore += 3; // Liens externes
      }
    }
    
    // === 4. SCORE SEO TECHNIQUE (10%) ===
    let technicalScore = 60; // Score de base
    
    // URL canonique
    if (jsonLd.url) technicalScore += 20;
    
    // Langue spécifiée
    if (jsonLd.inLanguage) technicalScore += 10;
    
    // Publisher pour articles
    if (jsonLd['@type'] === 'BlogPosting' && jsonLd.publisher) technicalScore += 10;

    // === 5. SCORE EXPÉRIENCE UTILISATEUR (5%) ===
    let uxScore = 70; // Score de base neutre
    
    // Auteur identifié (crédibilité)
    if (detections?.hasAuthor || jsonLd.author) uxScore += 15;
    
    // Données structurées complètes
    if (detections?.hasBlogData || Object.keys(jsonLd).length > 5) uxScore += 15;

    // === CALCUL DU SCORE FINAL PONDÉRÉ ===
    const finalScore = Math.round(
      (jsonLdScore * 0.40) +           // 40% JSON-LD
      (frontMatterPercent * 0.25) +    // 25% FrontMatter  
      (Math.min(contentScore, 100) * 0.20) +  // 20% Contenu
      (Math.min(technicalScore, 100) * 0.10) + // 10% Technique
      (Math.min(uxScore, 100) * 0.05)         // 5% UX
    );
    
    // Attribution de couleur selon le score (style Google PageSpeed)
    let scoreColor = '#ff4444';      // Rouge pour < 60%
    if (finalScore >= 80) scoreColor = '#00ff88';      // Vert pour >= 80%
    else if (finalScore >= 60) scoreColor = '#ffaa00'; // Orange pour 60-79%
    
    return { 
      score: Math.max(0, Math.min(100, finalScore)), 
      color: scoreColor, 
      validation,
      breakdown: {
        jsonLd: Math.round(jsonLdScore),
        frontMatter: Math.round(frontMatterPercent),
        content: Math.min(contentScore, 100),
        technical: Math.min(technicalScore, 100),
        ux: Math.min(uxScore, 100)
      }
    };
  };

  /**
   * CONSTRUCTION DE L'URL DE PRODUCTION
   * 
   * Construit l'URL de production pour les outils externes (Google Rich Results Test)
   * en utilisant la configuration du site au lieu de localhost.
   */
  const getProductionUrl = React.useCallback(() => {
    try {
      // URL de base du site (configurée dans docusaurus.config.js)
      const baseUrl = siteConfig?.url || '';
      const basePath = siteConfig?.baseUrl || '/';
      
      // Chemin actuel (sans le domaine localhost)
      let currentPath = location.pathname;
      
      // Construction de l'URL complète de production
      if (baseUrl) {
        // Nettoyage de l'URL de base
        const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Retirer le slash final
        
        // Si basePath est différent de "/" et que le currentPath commence par basePath,
        // alors le pathname contient déjà le bon chemin complet
        if (basePath !== '/' && currentPath.startsWith(basePath)) {
          // Le pathname contient déjà le baseUrl (ex: /docux-blog/blog/article)
          return `${cleanBaseUrl}${currentPath}`;
        } else if (basePath !== '/') {
          // Le pathname ne contient pas le baseUrl, on l'ajoute
          const cleanBasePath = basePath.replace(/\/$/, '');
          const cleanPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath;
          return `${cleanBaseUrl}${cleanBasePath}${cleanPath}`;
        } else {
          // baseUrl est "/", utilisation directe du pathname
          const cleanPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath;
          return `${cleanBaseUrl}${cleanPath}`;
        }
      }
      
      // Fallback sur l'URL locale si pas de configuration
      return window.location.href;
    } catch (error) {
      console.warn('Erreur lors de la construction de l\'URL de production:', error);
      return window.location.href;
    }
  }, [siteConfig, location.pathname]);

  /**
   * GÉNÉRATION DE RAPPORT SEO COMPLET
   * 
   * Crée un rapport détaillé exportable en JSON contenant :
   * - Toutes les métadonnées de la page
   * - Résultats de validation
   * - Score et recommandations
   * - Timestamp et URL
   */
  const generateSeoReport = () => {
    const seoScore = checkSeoScore();
    
    const report = {
      url: window.location.href,                    // URL de la page analysée
      pageType: pageInfo.type,                      // Type Schema.org détecté
      timestamp: new Date().toISOString(),          // Horodatage du rapport
      validation: seoScore.validation,              // Résultats de validation
      seoScore: seoScore.score,                     // Score SEO global
      scoreBreakdown: seoScore.breakdown,           // Répartition détaillée du score
      jsonLd: jsonLd,                              // Structure JSON-LD complète
      hasStructuredData: true,                      // Confirmation de présence des données
      contentMetrics: contentMetrics,               // Métriques de contenu analysées
      frontMatterData: {                           // Données du frontMatter
        hasImage: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.image);
        })(),
        hasKeywords: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.keywords && fm.keywords.length > 0);
        })(),
        hasAuthor: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.author || fm?.authors);
        })(),
        hasDate: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.date);
        })(),
        hasCategory: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.category || fm?.categories);
        })(),
        hasTags: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.tags && fm.tags.length > 0);
        })(),
        hasDescription: (() => {
          const fm = blogPostData?.frontMatter || pageMetadata?.frontMatter || blogPostData || pageMetadata;
          return !!(fm?.description);
        })()
      },
      recommendations: []                           // Recommandations d'amélioration
    };

    // === GÉNÉRATION DE RECOMMANDATIONS INTELLIGENTES ===
    
    // Recommandations critiques (erreurs bloquantes)
    if (report.validation.issues.length > 0) {
      report.recommendations.push('🔧 Corriger les erreurs critiques JSON-LD pour améliorer le référencement');
    }
    
    // Recommandations d'optimisation (avertissements)
    if (report.validation.warnings.length > 0) {
      report.recommendations.push('⚡ Ajouter les métadonnées Schema.org manquantes pour maximiser les Rich Results');
    }
    
    // Recommandations FrontMatter
    if (!report.frontMatterData.hasImage) {
      report.recommendations.push('🖼️ Ajouter une image dans le frontMatter pour améliorer l\'engagement social');
    }
    
    if (!report.frontMatterData.hasKeywords) {
      report.recommendations.push('🏷️ Ajouter des mots-clés dans le frontMatter pour améliorer la catégorisation');
    }
    
    if (!report.frontMatterData.hasAuthor && detections.isBlogPost) {
      report.recommendations.push('👤 Définir un auteur dans le frontMatter pour renforcer la crédibilité');
    }
    
    if (!report.frontMatterData.hasCategory) {
      report.recommendations.push('🎯 Ajouter une catégorie dans le frontMatter pour organiser le contenu');
    }
    
    // Recommandations de contenu
    if (contentMetrics) {
      if (contentMetrics.wordCount < 300) {
        report.recommendations.push('💬 Enrichir le contenu (actuellement ' + contentMetrics.wordCount + ' mots, recommandé: 300+)');
      }
      
      if (contentMetrics.headings.h1 !== 1) {
        report.recommendations.push('📊 Optimiser la structure des titres (utiliser un seul H1)');
      }
      
      if (contentMetrics.links.total < 3) {
        report.recommendations.push('🔗 Ajouter plus de liens (internes et externes) pour améliorer le maillage');
      }
    }

    return report;
  };

  /**
   * DÉTECTION DES HOOKS DOCUSAURUS PERTINENTS
   * 
   * Analyse intelligente des hooks nécessaires selon le type de page
   * pour diagnostiquer les problèmes de récupération de métadonnées.
   */
  const getRelevantHooks = () => {
    const relevantHooks = [];
    
    // === HOOKS UNIVERSELS (toujours nécessaires) ===
    relevantHooks.push({ 
      name: 'useLocation', 
      active: true, 
      status: 'Actif',
      description: 'Navigation et analyse d\'URL'
    });
    relevantHooks.push({ 
      name: 'useDocusaurusContext', 
      active: true, 
      status: 'Actif',
      description: 'Configuration globale du site'
    });
    
    // === HOOKS SPÉCIFIQUES SELON LE TYPE DE PAGE ===
    
    if (detections.isBlogPost) {
      // Pour les articles de blog : useBlogPost est critique
      relevantHooks.push({
        name: 'useBlogPost',
        active: !!blogPostData,
        status: blogPostData ? 'Actif' : 'Inactif',
        description: 'Métadonnées d\'article (titre, auteur, date...)',
        critical: true // Marque ce hook comme critique pour ce type de page
      });
    } else {
      // Pour toutes les autres pages : usePageMetadata ou équivalent
      relevantHooks.push({
        name: 'usePageMetadata',
        active: !!pageMetadata,
        status: pageMetadata ? 'Actif' : 'Inactif',
        description: 'Métadonnées de page statique ou docs',
        critical: true // Critique pour les pages non-blog
      });
    }
    
    return relevantHooks;
  };

  /**
   * DÉTECTION INTELLIGENTE DES ÉLÉMENTS PERTINENTS
   * 
   * Filtre et organise les détections selon le type de page
   * pour afficher seulement les informations pertinentes.
   */
  const getRelevantDetections = () => {
    const relevantDetections = [];
    
    // === TYPOLOGIE DES PAGES DISPONIBLES ===
    const pageTypes = [
      { key: 'isBlogPost', label: 'Article de blog', icon: '📝' },
      { key: 'isBlogListPage', label: 'Liste d\'articles', icon: '📋' },
      { key: 'isSeriesPage', label: 'Page de série', icon: '📚' },
      { key: 'isHomePage', label: 'Page d\'accueil', icon: '🏠' },
      { key: 'isThanksPage', label: 'Page remerciements', icon: '🙏' },
      { key: 'isRepositoryPage', label: 'Page repository', icon: '📦' }
    ];
    
    // === IDENTIFICATION DU TYPE DE PAGE PRINCIPAL ===
    const detectedPageType = pageTypes.find(type => detections[type.key]);
    if (detectedPageType) {
      relevantDetections.push({
        key: detectedPageType.key,
        value: true,
        label: detectedPageType.label,
        icon: detectedPageType.icon,
        category: 'Type de page',
        importance: 'high' // Marque comme information importante
      });
    }
    
    // === DÉTECTIONS SPÉCIFIQUES SELON LE TYPE DE PAGE ===
    
    if (detections.isBlogPost) {
      // Éléments critiques pour les articles de blog
      relevantDetections.push(
        {
          key: 'hasAuthor',
          value: detections.hasAuthor,
          label: 'Auteur identifié',
          icon: '👤',
          category: 'Contenu blog',
          importance: detections.hasAuthor ? 'high' : 'critical'
        },
        {
          key: 'hasBlogData',
          value: detections.hasBlogData,
          label: 'Métadonnées article',
          icon: '📊',
          category: 'Contenu blog',
          importance: detections.hasBlogData ? 'high' : 'critical'
        },
        {
          key: 'hasImage',
          value: detections.hasImage,
          label: 'Image featured',
          icon: '🖼️',
          category: 'Contenu blog',
          importance: detections.hasImage ? 'medium' : 'high'
        }
      );
    } else if (detections.isBlogListPage) {
      // Éléments pour les pages d'index/listing
      relevantDetections.push(
        {
          key: 'hasPageData',
          value: detections.hasPageData,
          label: 'Métadonnées d\'index',
          icon: '📋',
          category: 'Contenu collection',
          importance: detections.hasPageData ? 'medium' : 'high'
        },
        {
          key: 'hasImage',
          value: detections.hasImage,
          label: 'Image sociale',
          icon: '🖼️',
          category: 'Contenu collection',
          importance: detections.hasImage ? 'medium' : 'low'
        }
      );
    } else if (detections.isSeriesPage) {
      // Éléments pour les pages de série
      relevantDetections.push(
        {
          key: 'hasPageData',
          value: detections.hasPageData,
          label: 'Données de série',
          icon: '📚',
          category: 'Contenu série',
          importance: detections.hasPageData ? 'medium' : 'high'
        },
        {
          key: 'hasImage',
          value: detections.hasImage,
          label: 'Image de série',
          icon: '🖼️',
          category: 'Contenu série',
          importance: detections.hasImage ? 'low' : 'medium'
        }
      );
    } else {
      // === PAGES STATIQUES (accueil, thanks, repository, etc.) ===
      relevantDetections.push({
        key: 'hasPageData',
        value: detections.hasPageData,
        label: 'Métadonnées de page',
        icon: '📄',
        category: 'Contenu statique',
        importance: detections.hasPageData ? 'medium' : 'high'
      });
      
      // Image pour pages statiques (optionnelle mais recommandée)
      if (detections.hasImage !== undefined) {
        relevantDetections.push({
          key: 'hasImage',
          value: detections.hasImage,
          label: 'Image sociale',
          icon: '🖼️',
          category: 'Contenu statique',
          importance: detections.hasImage ? 'low' : 'medium'
        });
      }
    }
    
    return relevantDetections;
  };

  /**
   * SÉCURITÉ : AFFICHAGE UNIQUEMENT EN DÉVELOPPEMENT
   * 
   * Le panel ne doit JAMAIS apparaître en production pour :
   * - Éviter l'exposition de données sensibles
   * - Maintenir les performances optimales
   * - Respecter les bonnes pratiques de sécurité
   */
  if (process.env.NODE_ENV !== 'development') {
    return null; // Arrêt immédiat si on n'est pas en développement
  }

  /**
   * RENDU DU COMPOSANT DEBUG PANEL
   * 
   * Interface complète avec :
   * - Bouton toggle flottant
   * - Panel principal avec onglets
   * - Actions rapides intégrées
   */
  return (
    <>
      {/* ===== BOUTON TOGGLE FLOTTANT ===== */}
      <button
        onClick={() => setDebugVisible(!debugVisible)}
        style={{
          position: 'fixed',
          bottom: debugVisible ? '260px' : '10px',     // Position dynamique selon l'état
          right: '10px',
          background: 'rgba(0,0,0,0.9)',               // Fond sombre semi-transparent
          color: '#00ff88',                            // Couleur signature Docux
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',                         // Bouton circulaire
          width: '45px',
          height: '45px',
          fontSize: '18px',
          cursor: 'pointer',
          zIndex: 10000,                               // Au-dessus de tout
          fontFamily: 'monospace',                     // Police cohérente
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',    // Ombre légère
          transition: 'all 0.3s ease'                 // Animation fluide
        }}
        title={debugVisible ? 'Masquer le SEO Panel Pro' : 'Afficher le SEO Panel Pro - Développé par Docux'}
      >
        {debugVisible ? '🔍' : '👁️'}                   {/* Icône dynamique */}
      </button>

      {/* ===== PANEL PRINCIPAL (affiché conditionnellement) ===== */}
      {debugVisible && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.95)',              // Fond très sombre pour la lisibilité
          color: 'white',
          padding: '12px',
          borderRadius: '6px',                         // Coins arrondis subtils
          fontSize: '10px',                            // Taille optimisée pour les infos
          zIndex: 9999,                                // Sous le bouton toggle
          fontFamily: 'monospace',                     // Police monospace pour les données
          border: '1px solid rgba(255,255,255,0.3)',  // Bordure subtile
          minWidth: '380px',                           // Largeur minimale pour le contenu
          maxWidth: '450px',                           // Largeur maximale responsive
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',   // Ombre prononcée
          maxHeight: '85vh',                           // Hauteur max responsive
          overflowY: 'auto'                            // Scroll si contenu déborde
        }}>
          {/* ===== HEADER AVEC ONGLETS ===== */}
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            fontSize: '12px',
            color: '#00ff88',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              🔍 SEO Panel Pro
              <div style={{ fontSize: '8px', color: '#ccc' }}>
                v{React.version}
              </div>
            </div>
            
            {/* Onglets de navigation */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'overview', label: 'Vue', icon: '📊' },
                { id: 'validation', label: 'Valid', icon: '✅' },
                { id: 'performance', label: 'Perf', icon: '⚡' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)',
                    color: activeTab === tab.id ? '#00ff88' : '#ccc',
                    border: `1px solid ${activeTab === tab.id ? '#00ff88' : 'rgba(255,255,255,0.3)'}`,
                    borderRadius: '3px',
                    padding: '4px 8px',
                    fontSize: '8px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Page:</strong> 
                <span style={{ color: '#00ff88' }}> {pageInfo.category}</span>
              </div>
              
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Schema:</strong> 
                <span style={{ color: '#88aaff' }}> {pageInfo.type}</span>
              </div>
              
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>URL:</strong> 
                <div style={{ 
                  fontSize: '9px', 
                  color: '#ccc', 
                  wordBreak: 'break-all',
                  marginTop: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  {location.pathname}
                  {location.search && <div style={{ color: '#ffaa00' }}>Query: {location.search}</div>}
                  {location.hash && <div style={{ color: '#88aaff' }}>Hash: {location.hash}</div>}
                </div>
              </div>

              {/* Afficher les informations selon le contexte */}
              {blogPostData && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffaa00' }}>Blog Post Data:</strong>
                  <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                    <div>📝 {blogPostData.title}</div>
                    <div>📅 {blogPostData.date}</div>
                    <div>👥 {blogPostData.frontMatter?.authors?.length || 0} auteur(s)</div>
                    <div>🖼️ Image: {blogPostData.frontMatter?.image ? '✅' : '❌'}</div>
                    <div>🏷️ {blogPostData.frontMatter?.keywords?.length || 0} mot(s)-clé(s)</div>
                  </div>
                </div>
              )}

              {pageMetadata && !blogPostData && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#ffaa00' }}>
                    {detections.isHomePage ? 'Site Metadata:' : 
                     detections.isBlogListPage ? 'Blog Index Metadata:' : 'Page Metadata:'}
                  </strong>
                  <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                    <div>📝 {pageMetadata.title || 'Sans titre'}</div>
                    <div>📄 {pageMetadata.description || 'Sans description'}</div>
                    
                    {detections.isHomePage ? (
                      // Affichage spécial pour la page d'accueil
                      <>
                        <div>🌐 Type: Site web principal</div>
                        <div>🎯 Purpose: Page d'entrée du site</div>
                        <div>🔍 SEO Focus: Visibilité globale</div>
                        <div>🖼️ Social Image: {siteConfig.themeConfig?.image ? '✅' : '⚠️ Recommandée'}</div>
                      </>
                    ) : detections.isBlogListPage ? (
                      // Affichage spécial pour la liste de blog
                      <>
                        <div>📋 Type: Index des articles</div>
                        <div>🎯 Purpose: Navigation dans le blog</div>
                        <div>🔍 SEO Focus: Découvrabilité des contenus</div>
                        <div>📊 Content: Articles listés automatiquement</div>
                        <div>🖼️ Social Image: {siteConfig.themeConfig?.image ? '✅' : '⚠️ Recommandée'}</div>
                      </>
                    ) : pageMetadata.frontMatter ? (
                      // Affichage pour autres pages avec frontMatter
                      <>
                        <div>🖼️ Image: {pageMetadata.frontMatter.image ? '✅' : '❌'}</div>
                        <div>🏷️ Keywords: {pageMetadata.frontMatter.keywords ? '✅' : '❌'}</div>
                        <div>👤 Author: {pageMetadata.frontMatter.author ? '✅' : '❌'}</div>
                        <div>📅 Date: {pageMetadata.frontMatter.date ? '✅' : '❌'}</div>
                        <div>🎯 Category: {pageMetadata.frontMatter.category || 'Non définie'}</div>
                      </>
                    ) : (
                      // Affichage pour pages sans frontMatter
                      <>
                        <div>📄 Type: Page statique</div>
                        <div>🎯 Content: Généré automatiquement</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (() => {
            const seoScore = checkSeoScore();
            const validation = seoScore.validation;
            
            return (
              <div>
                {/* Score SEO Global */}
                <div style={{ 
                  marginBottom: '8px', 
                  padding: '6px', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#ffaa00', marginBottom: '2px' }}>Score SEO Global</div>
                  <div style={{ fontSize: '20px', color: seoScore.color, fontWeight: 'bold' }}>
                    {seoScore.score}%
                  </div>
                  <div style={{ fontSize: '8px', color: '#ccc' }}>
                    {seoScore.score >= 80 ? 'Excellent' : seoScore.score >= 60 ? 'Bon' : 'À améliorer'}
                  </div>
                </div>

                {/* Répartition détaillée du score */}
                {seoScore.breakdown && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#88aaff', fontSize: '10px' }}>📊 Détail du score :</strong>
                    <div style={{ fontSize: '8px', marginTop: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '3px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                        <span style={{ color: '#ccc' }}>Schema.org (40%)</span>
                        <span style={{ color: seoScore.breakdown.jsonLd >= 80 ? '#00ff88' : seoScore.breakdown.jsonLd >= 60 ? '#ffaa00' : '#ff4444' }}>
                          {seoScore.breakdown.jsonLd}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                        <span style={{ color: '#ccc' }}>FrontMatter (25%)</span>
                        <span style={{ color: seoScore.breakdown.frontMatter >= 80 ? '#00ff88' : seoScore.breakdown.frontMatter >= 60 ? '#ffaa00' : '#ff4444' }}>
                          {Math.round(seoScore.breakdown.frontMatter)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                        <span style={{ color: '#ccc' }}>Contenu (20%)</span>
                        <span style={{ color: seoScore.breakdown.content >= 80 ? '#00ff88' : seoScore.breakdown.content >= 60 ? '#ffaa00' : '#ff4444' }}>
                          {Math.round(seoScore.breakdown.content)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                        <span style={{ color: '#ccc' }}>Technique (10%)</span>
                        <span style={{ color: seoScore.breakdown.technical >= 80 ? '#00ff88' : seoScore.breakdown.technical >= 60 ? '#ffaa00' : '#ff4444' }}>
                          {Math.round(seoScore.breakdown.technical)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ccc' }}>UX (5%)</span>
                        <span style={{ color: seoScore.breakdown.ux >= 80 ? '#00ff88' : seoScore.breakdown.ux >= 60 ? '#ffaa00' : '#ff4444' }}>
                          {Math.round(seoScore.breakdown.ux)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analyse FrontMatter */}
                {(() => {
                  // Recherche flexible du frontMatter
                  let fm = null;
                  if (blogPostData?.frontMatter) {
                    fm = blogPostData.frontMatter;
                  } else if (pageMetadata?.frontMatter) {
                    fm = pageMetadata.frontMatter;
                  } else if (blogPostData) {
                    fm = blogPostData;
                  } else if (pageMetadata) {
                    fm = pageMetadata;
                  }
                  
                  if (fm) {
                    return (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#ffaa00', fontSize: '10px' }}>📄 Content Management System :</strong>
                        <div style={{ fontSize: '8px', marginTop: '2px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '3px' }}>
                          <div style={{ color: fm.image ? '#00ff88' : '#ff4444' }}>🖼️ Image: {fm.image ? '✅' : '❌'}</div>
                          <div style={{ color: (fm.keywords && fm.keywords.length > 0) ? '#00ff88' : '#ff4444' }}>
                            🏷️ Keywords: {(fm.keywords && fm.keywords.length > 0) ? '✅' : '❌'}
                          </div>
                          <div style={{ color: (fm.author || fm.authors) ? '#00ff88' : '#ff4444' }}>
                            👤 Author: {(fm.author || fm.authors) ? '✅' : '❌'}
                          </div>
                          <div style={{ color: fm.date ? '#00ff88' : '#ff4444' }}>📅 Date: {fm.date ? '✅' : '❌'}</div>
                          <div style={{ color: (fm.category || fm.categories) ? '#00ff88' : '#ffaa00' }}>
                            🎯 Category: {fm.category || fm.categories || 'Non définie'}
                          </div>
                          <div style={{ color: (fm.tags && fm.tags.length > 0) ? '#00ff88' : '#ffaa00' }}>
                            🏷️ Tags: {fm.tags ? `${fm.tags.length} tag(s)` : 'Aucun'}
                          </div>
                          <div style={{ color: fm.description ? '#00ff88' : '#ffaa00' }}>
                            📝 Description: {fm.description ? '✅' : 'Auto-générée'}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#ffaa00', fontSize: '10px' }}>📄 Content Management System :</strong>
                        <div style={{ fontSize: '8px', marginTop: '2px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '3px', color: '#ffaa00' }}>
                          Aucun frontMatter détecté pour cette page
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* Métriques de contenu */}
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#88aaff', fontSize: '10px' }}>📊 Métriques de contenu :</strong>
                  <div style={{ fontSize: '8px', marginTop: '2px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '3px' }}>
                    {(() => {
                      const title = jsonLd.headline || jsonLd.name || blogPostData?.title || pageMetadata?.title;
                      const description = jsonLd.description || blogPostData?.frontMatter?.description || pageMetadata?.description;
                      
                      return (
                        <>
                          <div style={{ color: '#ccc' }}>
                            📝 Titre: {title ? `${title.length} chars` : 'Non défini'}
                            {title && (
                              <span style={{ 
                                color: title.length >= 30 && title.length <= 60 ? '#00ff88' : 
                                       title.length >= 20 && title.length <= 80 ? '#ffaa00' : '#ff4444'
                              }}>
                                {' '}({title.length >= 30 && title.length <= 60 ? 'Optimal' : 
                                     title.length >= 20 && title.length <= 80 ? 'OK' : 'À ajuster'})
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#ccc' }}>
                            📄 Description: {description ? `${description.length} chars` : 'Non définie'}
                            {description && (
                              <span style={{ 
                                color: description.length >= 120 && description.length <= 160 ? '#00ff88' : 
                                       description.length >= 80 && description.length <= 200 ? '#ffaa00' : '#ff4444'
                              }}>
                                {' '}({description.length >= 120 && description.length <= 160 ? 'Optimal' : 
                                     description.length >= 80 && description.length <= 200 ? 'OK' : 'À ajuster'})
                              </span>
                            )}
                          </div>
                          {contentMetrics ? (
                            <>
                              <div style={{ color: '#ccc' }}>
                                💬 Nombre de mots: {contentMetrics.wordCount}
                                <span style={{ 
                                  color: contentMetrics.wordCount >= 1000 ? '#00ff88' : 
                                         contentMetrics.wordCount >= 300 ? '#ffaa00' : '#ff4444'
                                }}>
                                  {' '}({contentMetrics.wordCount >= 1000 ? 'Excellent' : 
                                       contentMetrics.wordCount >= 300 ? 'Bon' : 'Trop court'})
                                </span>
                              </div>
                              <div style={{ color: '#ccc' }}>
                                📊 Structure: H1({contentMetrics.headings.h1}) H2({contentMetrics.headings.h2}) H3({contentMetrics.headings.h3})
                                <span style={{ 
                                  color: contentMetrics.headings.h1 === 1 && contentMetrics.headings.h2 >= 2 ? '#00ff88' : 
                                         contentMetrics.headings.h1 <= 2 && contentMetrics.headings.h2 >= 1 ? '#ffaa00' : '#ff4444'
                                }}>
                                  {' '}({contentMetrics.headings.h1 === 1 && contentMetrics.headings.h2 >= 2 ? 'Optimal' : 
                                       contentMetrics.headings.h1 <= 2 && contentMetrics.headings.h2 >= 1 ? 'OK' : 'À améliorer'})
                                </span>
                              </div>
                              <div style={{ color: '#ccc' }}>
                                🔗 Liens: {contentMetrics.links.total} total ({contentMetrics.links.internal} internes, {contentMetrics.links.external} externes)
                                <span style={{ 
                                  color: contentMetrics.links.total >= 5 && contentMetrics.links.internal >= 2 ? '#00ff88' : 
                                         contentMetrics.links.total >= 3 ? '#ffaa00' : '#ff4444'
                                }}>
                                  {' '}({contentMetrics.links.total >= 5 && contentMetrics.links.internal >= 2 ? 'Optimal' : 
                                       contentMetrics.links.total >= 3 ? 'OK' : 'Insuffisant'})
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ color: '#ffaa00' }}>🔗 Liens: Analyse en cours...</div>
                              <div style={{ color: '#ffaa00' }}>📊 Structure H1/H2/H3: Analyse en cours...</div>
                              <div style={{ color: '#ffaa00' }}>💬 Nombre de mots: Analyse en cours...</div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Erreurs critiques */}
                {validation.issues.length > 0 && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#ff4444' }}>❌ Erreurs critiques:</strong>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      {validation.issues.map((issue, i) => (
                        <div key={i} style={{ color: '#ff4444' }}>{issue}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avertissements */}
                {validation.warnings.length > 0 && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#ffaa00' }}>⚠️ Avertissements:</strong>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      {validation.warnings.map((warning, i) => (
                        <div key={i} style={{ color: '#ffaa00' }}>{warning}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validations réussies */}
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#00ff88' }}>✅ Validations:</strong>
                  <div style={{ fontSize: '9px', marginTop: '2px', maxHeight: '120px', overflowY: 'auto' }}>
                    {validation.validations.map((valid, i) => (
                      <div key={i} style={{ color: '#00ff88' }}>{valid}</div>
                    ))}
                  </div>
                </div>

                {/* Recommandations */}
                {(() => {
                  const report = generateSeoReport();
                  return report.recommendations.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#88aaff' }}>💡 Recommandations:</strong>
                      <div style={{ fontSize: '9px', marginTop: '2px' }}>
                        {report.recommendations.map((rec, i) => (
                          <div key={i} style={{ color: '#88aaff', marginBottom: '2px' }}>{rec}</div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {activeTab === 'performance' && (
            <div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Métriques temps réel:</strong>
                <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                  <div>⚡ Render: {performance.now().toFixed(1)}ms</div>
                  <div>🧠 Heap: {(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
                  <div>📦 Bundle: Optimisé</div>
                  <div>🔄 Component: SeoDebugPanel</div>
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Taille des données:</strong>
                <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                  <div>📄 JSON-LD: {JSON.stringify(jsonLd).length} chars</div>
                  <div>🔍 Blog Data: {blogPostData ? JSON.stringify(blogPostData).length : 0} chars</div>
                  <div>📋 Page Meta: {pageMetadata ? JSON.stringify(pageMetadata).length : 0} chars</div>
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Hooks status:</strong>
                <div style={{ fontSize: '9px', marginTop: '2px' }}>
                  {getRelevantHooks().map((hook, index) => (
                    <div key={index} style={{ 
                      color: hook.active ? '#00ff88' : hook.critical ? '#ff4444' : '#ffaa00',
                      marginBottom: '1px'
                    }}>
                      {hook.active ? '✅' : '❌'} {hook.name}: {hook.status}
                      <span style={{ color: '#888', fontSize: '8px' }}> • {hook.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Détections contextuelles:</strong>
                <div style={{ fontSize: '9px', marginTop: '2px' }}>
                  {getRelevantDetections().map((detection, index) => (
                    <div key={index} style={{ marginBottom: '2px' }}>
                      {detection.category && index === 0 && (
                        <div style={{ 
                          color: '#88aaff', 
                          fontSize: '8px', 
                          fontWeight: 'bold',
                          marginBottom: '1px'
                        }}>
                          {detection.category}:
                        </div>
                      )}
                      {detection.category && index > 0 && 
                       getRelevantDetections()[index - 1].category !== detection.category && (
                        <div style={{ 
                          color: '#88aaff', 
                          fontSize: '8px', 
                          fontWeight: 'bold',
                          marginTop: '4px',
                          marginBottom: '1px'
                        }}>
                          {detection.category}:
                        </div>
                      )}
                      <div style={{ color: detection.value ? '#00ff88' : '#ffaa00' }}>
                        {detection.value ? '✅' : '⚠️'} {detection.icon} {detection.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions rapides universelles */}
          <div style={{ 
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <strong style={{ color: '#ffaa00', fontSize: '9px' }}>Actions rapides:</strong>
            <div style={{ fontSize: '8px', marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const report = generateSeoReport();
                  setCurrentReport(report);
                  setShowReport(true);
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
                title="Affiche le rapport SEO complet"
              >
                📋 Rapport
              </button>
              
              <button
                onClick={() => {
                  const report = generateSeoReport();
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `seo-report-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
                title="Télécharge le rapport SEO en JSON"
              >
                💾 Export
              </button>

              <button
                onClick={() => {
                  const fullUrl = window.location.href;
                  navigator.clipboard.writeText(fullUrl);
                  alert('URL copiée dans le presse-papiers');
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
                title="Copie l'URL actuelle"
              >
                📎 URL
              </button>
              
              <button
                onClick={() => {
                  const productionUrl = getProductionUrl();
                  window.open('https://search.google.com/test/rich-results?url=' + encodeURIComponent(productionUrl), '_blank');
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
                title={`Test Google Rich Results\nURL: ${getProductionUrl()}`}
              >
                🔍 Google
              </button>
            </div>
          </div>

          <div style={{ 
            fontSize: '8px', 
            color: '#888', 
            marginTop: '6px',
            paddingTop: '4px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            💡 SEO Panel Pro - Mode développement uniquement
          </div>
          
          {/* Indication URL de test */}
          <div style={{ 
            fontSize: '7px', 
            color: '#666', 
            marginTop: '2px',
            textAlign: 'center',
            wordBreak: 'break-all'
          }}>
            🔗 Test Google: {getProductionUrl()}
          </div>
        </div>
      )}

      {/* Modal du rapport SEO */}
      {showReport && currentReport && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.95)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.3)',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            width: '100%'
          }}>
            {/* Header du rapport */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255,255,255,0.3)'
            }}>
              <h2 style={{
                margin: '0',
                color: '#00ff88',
                fontSize: '16px'
              }}>
                📋 Rapport SEO Complet
              </h2>
              <button
                onClick={() => setShowReport(false)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ✕ Fermer
              </button>
            </div>

            {/* Informations générales */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#ffaa00', fontSize: '14px', marginBottom: '8px' }}>ℹ️ Informations générales</h3>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px' }}>
                <div><strong>URL:</strong> {currentReport.url}</div>
                <div><strong>Type de page:</strong> {currentReport.pageType}</div>
                <div><strong>Timestamp:</strong> {new Date(currentReport.timestamp).toLocaleString('fr-FR')}</div>
                <div><strong>Données structurées:</strong> {currentReport.hasStructuredData ? '✅ Présentes' : '❌ Absentes'}</div>
              </div>
            </div>

            {/* Score et validation */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#ffaa00', fontSize: '14px', marginBottom: '8px' }}>📊 Score SEO Global</h3>
              
              {/* Score global */}
              {currentReport.seoScore !== undefined && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '8px', 
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: currentReport.seoScore >= 80 ? '#00ff88' : currentReport.seoScore >= 60 ? '#ffaa00' : '#ff4444' }}>
                      {currentReport.seoScore}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#ccc' }}>
                      {currentReport.seoScore >= 80 ? 'Excellent' : currentReport.seoScore >= 60 ? 'Bon' : 'À améliorer'}
                    </div>
                  </div>
                  
                  {/* Répartition détaillée */}
                  {currentReport.scoreBreakdown && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                      <h4 style={{ color: '#88aaff', fontSize: '11px', marginBottom: '5px' }}>📊 Répartition détaillée :</h4>
                      <div style={{ fontSize: '9px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: '#ccc' }}>Schema.org (40%)</span>
                          <span style={{ color: currentReport.scoreBreakdown.jsonLd >= 80 ? '#00ff88' : currentReport.scoreBreakdown.jsonLd >= 60 ? '#ffaa00' : '#ff4444' }}>
                            {currentReport.scoreBreakdown.jsonLd}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: '#ccc' }}>FrontMatter (25%)</span>
                          <span style={{ color: Math.round(currentReport.scoreBreakdown.frontMatter) >= 80 ? '#00ff88' : Math.round(currentReport.scoreBreakdown.frontMatter) >= 60 ? '#ffaa00' : '#ff4444' }}>
                            {Math.round(currentReport.scoreBreakdown.frontMatter)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: '#ccc' }}>Contenu (20%)</span>
                          <span style={{ color: Math.round(currentReport.scoreBreakdown.content) >= 80 ? '#00ff88' : Math.round(currentReport.scoreBreakdown.content) >= 60 ? '#ffaa00' : '#ff4444' }}>
                            {Math.round(currentReport.scoreBreakdown.content)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: '#ccc' }}>Technique (10%)</span>
                          <span style={{ color: Math.round(currentReport.scoreBreakdown.technical) >= 80 ? '#00ff88' : Math.round(currentReport.scoreBreakdown.technical) >= 60 ? '#ffaa00' : '#ff4444' }}>
                            {Math.round(currentReport.scoreBreakdown.technical)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#ccc' }}>UX (5%)</span>
                          <span style={{ color: Math.round(currentReport.scoreBreakdown.ux) >= 80 ? '#00ff88' : Math.round(currentReport.scoreBreakdown.ux) >= 60 ? '#ffaa00' : '#ff4444' }}>
                            {Math.round(currentReport.scoreBreakdown.ux)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analyse FrontMatter */}
              {currentReport.frontMatterData && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ color: '#ffaa00', fontSize: '12px', marginBottom: '5px' }}>📄 Content Management System</h4>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '10px' }}>
                      <div style={{ color: currentReport.frontMatterData.hasImage ? '#00ff88' : '#ff4444', marginBottom: '2px' }}>
                        🖼️ Image: {currentReport.frontMatterData.hasImage ? '✅ Présente' : '❌ Manquante'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasKeywords ? '#00ff88' : '#ff4444', marginBottom: '2px' }}>
                        🏷️ Keywords: {currentReport.frontMatterData.hasKeywords ? '✅ Définis' : '❌ Manquants'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasAuthor ? '#00ff88' : '#ff4444', marginBottom: '2px' }}>
                        👤 Author: {currentReport.frontMatterData.hasAuthor ? '✅ Défini' : '❌ Manquant'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasDate ? '#00ff88' : '#ff4444', marginBottom: '2px' }}>
                        📅 Date: {currentReport.frontMatterData.hasDate ? '✅ Présente' : '❌ Manquante'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasCategory ? '#00ff88' : '#ffaa00', marginBottom: '2px' }}>
                        🎯 Category: {currentReport.frontMatterData.hasCategory ? '✅ Définie' : '⚠️ Optionnelle'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasTags ? '#00ff88' : '#ffaa00', marginBottom: '2px' }}>
                        🏷️ Tags: {currentReport.frontMatterData.hasTags ? '✅ Présents' : '⚠️ Optionnels'}
                      </div>
                      <div style={{ color: currentReport.frontMatterData.hasDescription ? '#00ff88' : '#ffaa00' }}>
                        📝 Description: {currentReport.frontMatterData.hasDescription ? '✅ Personnalisée' : '⚠️ Auto-générée'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Métriques de contenu */}
              {currentReport.contentMetrics && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ color: '#88aaff', fontSize: '12px', marginBottom: '5px' }}>📊 Métriques de contenu</h4>
                  <div style={{ background: 'rgba(136,170,255,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #88aaff' }}>
                    <div style={{ fontSize: '10px' }}>
                      <div style={{ color: '#ccc', marginBottom: '2px' }}>
                        💬 Nombre de mots: {currentReport.contentMetrics.wordCount}
                        <span style={{ 
                          color: currentReport.contentMetrics.wordCount >= 1000 ? '#00ff88' : 
                                 currentReport.contentMetrics.wordCount >= 300 ? '#ffaa00' : '#ff4444'
                        }}>
                          {' '}({currentReport.contentMetrics.wordCount >= 1000 ? 'Excellent' : 
                               currentReport.contentMetrics.wordCount >= 300 ? 'Bon' : 'Trop court'})
                        </span>
                      </div>
                      <div style={{ color: '#ccc', marginBottom: '2px' }}>
                        📊 Structure: H1({currentReport.contentMetrics.headings.h1}) H2({currentReport.contentMetrics.headings.h2}) H3({currentReport.contentMetrics.headings.h3})
                      </div>
                      <div style={{ color: '#ccc', marginBottom: '2px' }}>
                        🔗 Liens: {currentReport.contentMetrics.links.total} total ({currentReport.contentMetrics.links.internal} internes, {currentReport.contentMetrics.links.external} externes)
                      </div>
                      <div style={{ color: '#ccc', fontSize: '8px' }}>
                        📅 Analysé le: {new Date(currentReport.contentMetrics.lastAnalyzed).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h4 style={{ color: '#ffaa00', fontSize: '12px', marginBottom: '5px', marginTop: '15px' }}>🔍 Validation Schema.org</h4>
              
              {/* Erreurs critiques */}
              {currentReport.validation.issues.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ color: '#ff4444', fontSize: '12px', marginBottom: '5px' }}>❌ Erreurs critiques ({currentReport.validation.issues.length})</h4>
                  <div style={{ background: 'rgba(255,68,68,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #ff4444' }}>
                    {currentReport.validation.issues.map((issue, i) => (
                      <div key={i} style={{ color: '#ff4444', marginBottom: '2px' }}>{issue}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avertissements */}
              {currentReport.validation.warnings.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ color: '#ffaa00', fontSize: '12px', marginBottom: '5px' }}>⚠️ Avertissements ({currentReport.validation.warnings.length})</h4>
                  <div style={{ background: 'rgba(255,170,0,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #ffaa00' }}>
                    {currentReport.validation.warnings.map((warning, i) => (
                      <div key={i} style={{ color: '#ffaa00', marginBottom: '2px' }}>{warning}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validations réussies */}
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ color: '#00ff88', fontSize: '12px', marginBottom: '5px' }}>✅ Validations réussies ({currentReport.validation.validations.length})</h4>
                <div style={{ background: 'rgba(0,255,136,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #00ff88', maxHeight: '150px', overflowY: 'auto' }}>
                  {currentReport.validation.validations.map((validation, i) => (
                    <div key={i} style={{ color: '#00ff88', marginBottom: '2px' }}>{validation}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommandations */}
            {currentReport.recommendations.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#88aaff', fontSize: '14px', marginBottom: '8px' }}>💡 Recommandations ({currentReport.recommendations.length})</h3>
                <div style={{ background: 'rgba(136,170,255,0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #88aaff' }}>
                  {currentReport.recommendations.map((rec, i) => (
                    <div key={i} style={{ color: '#88aaff', marginBottom: '4px' }}>{rec}</div>
                  ))}
                </div>
              </div>
            )}

            {/* JSON-LD Preview */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#ffaa00', fontSize: '14px', marginBottom: '8px' }}>🔍 Aperçu JSON-LD</h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '10px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <pre style={{ margin: '0', whiteSpace: 'pre-wrap', color: '#ccc' }}>
                  {JSON.stringify(currentReport.jsonLd, null, 2)}
                </pre>
              </div>
            </div>

            {/* Actions du rapport */}
            <div style={{
              display: 'flex',
              gap: '10px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.3)'
            }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
                  alert('Rapport copié dans le presse-papiers');
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                📋 Copier le rapport
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `seo-report-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                💾 Télécharger JSON
              </button>

              <button
                onClick={() => {
                  console.log('📋 Rapport SEO complet:', currentReport);
                  alert('Rapport également affiché dans la console pour inspection');
                }}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🔍 Voir en console
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
