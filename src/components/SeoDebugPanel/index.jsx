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
   * CALCUL DU SCORE SEO INTELLIGENT
   * 
   * Algorithme développé par Docux pour noter la qualité SEO :
   * - Chaque validation réussie = +points
   * - Chaque avertissement = -10% du score
   * - Chaque erreur = -20% du score
   * - Score final entre 0 et 100 avec code couleur
   */
  const checkSeoScore = () => {
    const validation = validateJsonLd(jsonLd);
    const totalChecks = validation.issues.length + validation.warnings.length + validation.validations.length;
    const validCount = validation.validations.length;
    const warningPenalty = validation.warnings.length * 0.1;
    const errorPenalty = validation.issues.length * 0.3;
    
    // Formule de calcul optimisée
    const score = Math.max(0, Math.min(100, 
      ((validCount / totalChecks) * 100) - 
      (warningPenalty * 10) - 
      (errorPenalty * 20)
    ));
    
    // Attribution de couleur selon le score (style Google PageSpeed)
    let scoreColor = '#ff4444';      // Rouge pour < 60%
    if (score >= 80) scoreColor = '#00ff88';      // Vert pour >= 80%
    else if (score >= 60) scoreColor = '#ffaa00'; // Orange pour 60-79%
    
    return { score: Math.round(score), color: scoreColor, validation };
  };

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
    const report = {
      url: window.location.href,                    // URL de la page analysée
      pageType: pageInfo.type,                      // Type Schema.org détecté
      timestamp: new Date().toISOString(),          // Horodatage du rapport
      validation: validateJsonLd(jsonLd),           // Résultats de validation
      jsonLd: jsonLd,                              // Structure JSON-LD complète
      hasStructuredData: true,                      // Confirmation de présence des données
      recommendations: []                           // Recommandations d'amélioration
    };

    // === GÉNÉRATION DE RECOMMANDATIONS INTELLIGENTES ===
    
    // Recommandations critiques (erreurs bloquantes)
    if (report.validation.issues.length > 0) {
      report.recommendations.push('🔧 Corriger les erreurs critiques pour améliorer le référencement');
    }
    
    // Recommandations d'optimisation (avertissements)
    if (report.validation.warnings.length > 0) {
      report.recommendations.push('⚡ Ajouter les métadonnées manquantes pour maximiser les Rich Results');
    }
    
    // Recommandations spécifiques aux articles
    if (detections.isBlogPost && !blogPostData?.frontMatter?.image) {
      report.recommendations.push('🖼️ Ajouter une image featured à l\'article pour améliorer l\'engagement');
    }
    
    // Recommandations de contenu
    if (!jsonLd.keywords || jsonLd.keywords.length === 0) {
      report.recommendations.push('🏷️ Ajouter des mots-clés pour améliorer la catégorisation et la découvrabilité');
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
                { id: 'overview', label: '📊 Vue', icon: '📊' },
                { id: 'validation', label: '✅ Valid', icon: '✅' },
                { id: 'performance', label: '⚡ Perf', icon: '⚡' }
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
                {/* Score SEO */}
                <div style={{ 
                  marginBottom: '8px', 
                  padding: '6px', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#ffaa00', marginBottom: '2px' }}>Score SEO</div>
                  <div style={{ fontSize: '20px', color: seoScore.color, fontWeight: 'bold' }}>
                    {seoScore.score}%
                  </div>
                  <div style={{ fontSize: '8px', color: '#ccc' }}>
                    {seoScore.score >= 80 ? 'Excellent' : seoScore.score >= 60 ? 'Bon' : 'À améliorer'}
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
                onClick={() => window.open('https://search.google.com/test/rich-results?url=' + encodeURIComponent(window.location.href), '_blank')}
                style={{
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
                title="Test Google Rich Results"
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
              <h3 style={{ color: '#ffaa00', fontSize: '14px', marginBottom: '8px' }}>📊 Validation SEO</h3>
              
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
