import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import authorsData from '@site/src/data/authors';

export default function Seo() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const [debugVisible, setDebugVisible] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('overview'); // overview, validation, performance
  
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

  // Fonctions de validation SEO intégrées
  const validateJsonLd = (jsonLd) => {
    const issues = [];
    const warnings = [];
    const validations = [];

    // Validation des champs requis Schema.org
    if (!jsonLd['@context']) issues.push('❌ @context manquant');
    else validations.push('✅ @context présent');

    if (!jsonLd['@type']) issues.push('❌ @type manquant');
    else validations.push(`✅ @type: ${jsonLd['@type']}`);

    if (!jsonLd.name && !jsonLd.headline) issues.push('❌ Titre manquant (name/headline)');
    else validations.push('✅ Titre présent');

    if (!jsonLd.description) warnings.push('⚠️ Description manquante');
    else validations.push('✅ Description présente');

    // Validation spécifique BlogPosting
    if (jsonLd['@type'] === 'BlogPosting') {
      if (!jsonLd.author) issues.push('❌ Auteur manquant pour BlogPosting');
      else validations.push(`✅ Auteur(s): ${Array.isArray(jsonLd.author) ? jsonLd.author.length : 1}`);

      if (!jsonLd.datePublished) warnings.push('⚠️ Date de publication manquante');
      else validations.push('✅ Date de publication présente');

      if (!jsonLd.image) warnings.push('⚠️ Image manquante pour Rich Results');
      else validations.push('✅ Image présente pour Rich Results');

      if (!jsonLd.publisher) issues.push('❌ Publisher manquant pour BlogPosting');
      else validations.push('✅ Publisher présent');
    }

    // Validation des URLs
    if (jsonLd.url && !jsonLd.url.startsWith('http')) {
      issues.push('❌ URL invalide (doit être absolue)');
    } else if (jsonLd.url) {
      validations.push('✅ URL valide');
    }

    // Validation des images
    if (jsonLd.image) {
      if (typeof jsonLd.image === 'string') {
        warnings.push('⚠️ Image en string simple (recommandé: ImageObject)');
      } else if (jsonLd.image['@type'] === 'ImageObject') {
        validations.push('✅ Image structurée (ImageObject)');
        if (!jsonLd.image.url) issues.push('❌ URL d\'image manquante');
        if (!jsonLd.image.caption) warnings.push('⚠️ Caption d\'image manquante');
      }
    }

    // Validation de la langue
    if (!jsonLd.inLanguage) warnings.push('⚠️ Langue non spécifiée');
    else validations.push(`✅ Langue: ${jsonLd.inLanguage}`);

    return { issues, warnings, validations };
  };

  const checkSeoScore = () => {
    const validation = validateJsonLd(additionalJsonLd);
    const totalChecks = validation.issues.length + validation.warnings.length + validation.validations.length;
    const validCount = validation.validations.length;
    const warningPenalty = validation.warnings.length * 0.1;
    const errorPenalty = validation.issues.length * 0.3;
    
    const score = Math.max(0, Math.min(100, ((validCount / totalChecks) * 100) - (warningPenalty * 10) - (errorPenalty * 20)));
    
    let scoreColor = '#ff4444';
    if (score >= 80) scoreColor = '#00ff88';
    else if (score >= 60) scoreColor = '#ffaa00';
    
    return { score: Math.round(score), color: scoreColor, validation };
  };

  const generateSeoReport = () => {
    const report = {
      url: location.href,
      pageType: pageInfo.type,
      timestamp: new Date().toISOString(),
      validation: validateJsonLd(additionalJsonLd),
      jsonLd: additionalJsonLd,
      hasStructuredData: true,
      recommendations: []
    };

    // Générer des recommandations
    if (report.validation.issues.length > 0) {
      report.recommendations.push('🔧 Corriger les erreurs critiques pour améliorer le SEO');
    }
    if (report.validation.warnings.length > 0) {
      report.recommendations.push('⚡ Ajouter les métadonnées manquantes pour optimiser les Rich Results');
    }
    if (isBlogPost && !blogPostData?.frontMatter?.image) {
      report.recommendations.push('🖼️ Ajouter une image à l\'article pour les Rich Results');
    }
    if (!additionalJsonLd.keywords || additionalJsonLd.keywords.length === 0) {
      report.recommendations.push('🏷️ Ajouter des mots-clés pour améliorer la catégorisation');
    }

    return report;
  };

  // Données structurées additionnelles selon le type de page
  const additionalJsonLd = {
    "@context": "https://schema.org",
    "@type": pageInfo.type,
    "publisher": {
      "@type": "Organization", 
      "name": "DOCUX",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}${siteConfig.baseUrl}img/docux.png`
      }
    },
    "inLanguage": "fr-FR",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${location.pathname}`
    },
    // Métadonnées spécifiques selon le type
    ...(isBlogPost && {
      "genre": "Blog",
      "articleSection": "Technology"
    }),
    ...(isSeriesPage && {
      "genre": "Educational Series",
      "learningResourceType": "tutorial series"
    }),
    ...(isRepositoryPage && {
      "genre": "Repository",
      "about": "Code repositories and projects"
    })
  };

  // Enrichir le JSON-LD avec les données de blog post si disponibles
  if (isBlogPost && blogPostData) {
    // Ajouter le titre et la description
    if (blogPostData.title) {
      additionalJsonLd.headline = blogPostData.title;
      additionalJsonLd.name = blogPostData.title;
    }
    
    if (blogPostData.description) {
      additionalJsonLd.description = blogPostData.description;
    }

    // Ajouter la date de publication
    if (blogPostData.date) {
      additionalJsonLd.datePublished = blogPostData.date;
    }

    // Ajouter l'image si disponible
    if (blogPostData.frontMatter?.image) {
      const imageUrl = useBaseUrl(blogPostData.frontMatter.image);
      additionalJsonLd.image = {
        "@type": "ImageObject",
        "@id": `${siteConfig.url}${imageUrl}`,
        "url": `${siteConfig.url}${imageUrl}`,
        "contentUrl": `${siteConfig.url}${imageUrl}`,
        "caption": `title image for the blog post: ${blogPostData.title}`
      };
    }

    // Ajouter les mots-clés si disponibles
    if (blogPostData.frontMatter?.keywords) {
      additionalJsonLd.keywords = blogPostData.frontMatter.keywords;
    }

    // Ajouter les auteurs avec informations complètes
    if (blogPostData.frontMatter?.authors && Array.isArray(blogPostData.frontMatter.authors)) {
      additionalJsonLd.author = blogPostData.frontMatter.authors.map(authorKey => {
        const authorData = authorsData[authorKey];
        if (authorData) {
          return {
            "@type": "Person",
            "name": authorData.name,
            "description": authorData.title || "Contributor",
            "url": authorData.url || `${siteConfig.url}${siteConfig.baseUrl}blog/authors/${authorKey}/`,
            "image": authorData.image_url ? `${siteConfig.url}${siteConfig.baseUrl}${authorData.image_url.replace(/^\//, '')}` : `${siteConfig.url}${siteConfig.baseUrl}img/docux.png`
          };
        } else {
          // Fallback si les données de l'auteur ne sont pas trouvées
          return {
            "@type": "Person",
            "name": authorKey,
            "description": "Contributor",
            "url": `${siteConfig.url}${siteConfig.baseUrl}blog/authors/${authorKey}/`
          };
        }
      });
    }

    // Ajouter l'URL de l'article
    additionalJsonLd.url = `${siteConfig.url}${blogPostData.permalink}`;
    additionalJsonLd["@id"] = `${siteConfig.url}${blogPostData.permalink}`;
    additionalJsonLd.mainEntityOfPage = `${siteConfig.url}${blogPostData.permalink}`;

    // Ajouter isPartOf pour indiquer que c'est part du blog
    additionalJsonLd.isPartOf = {
      "@type": "Blog",
      "@id": `${siteConfig.url}${siteConfig.baseUrl}blog`,
      "name": "Blog"
    };
  }
  
  // Enrichir avec les métadonnées de page pour les pages non-blog
  else if (pageMetadata) {
    // Ajouter le titre de la page
    if (pageMetadata.title) {
      additionalJsonLd.name = pageMetadata.title;
      additionalJsonLd.headline = pageMetadata.title;
    }
    
    // Ajouter la description
    if (pageMetadata.description) {
      additionalJsonLd.description = pageMetadata.description;
    }
    
    // Ajouter les métadonnées du frontmatter si disponibles
    if (pageMetadata.frontMatter) {
      const frontMatter = pageMetadata.frontMatter;
      
      // Image de la page
      if (frontMatter.image) {
        const imageUrl = useBaseUrl(frontMatter.image);
        additionalJsonLd.image = {
          "@type": "ImageObject",
          "@id": `${siteConfig.url}${imageUrl}`,
          "url": `${siteConfig.url}${imageUrl}`,
          "contentUrl": `${siteConfig.url}${imageUrl}`,
          "caption": `Image for ${pageMetadata.title || 'page'}`
        };
      }
      
      // Mots-clés de la page
      if (frontMatter.keywords) {
        additionalJsonLd.keywords = Array.isArray(frontMatter.keywords) 
          ? frontMatter.keywords 
          : frontMatter.keywords.split(',').map(k => k.trim());
      }
      
      // Auteur de la page
      if (frontMatter.author) {
        additionalJsonLd.author = {
          "@type": "Person",
          "name": frontMatter.author
        };
      }
      
      // Date de création/modification
      if (frontMatter.date) {
        additionalJsonLd.datePublished = frontMatter.date;
      }
      
      // Catégorie personnalisée
      if (frontMatter.category) {
        additionalJsonLd.genre = frontMatter.category;
      }
      
      // About/description personnalisée
      if (frontMatter.about) {
        additionalJsonLd.about = frontMatter.about;
      }
    }
    
    // Ajouter l'URL de la page
    if (pageMetadata.permalink) {
      additionalJsonLd.url = `${siteConfig.url}${pageMetadata.permalink}`;
      additionalJsonLd["@id"] = `${siteConfig.url}${pageMetadata.permalink}`;
      additionalJsonLd.mainEntityOfPage = `${siteConfig.url}${pageMetadata.permalink}`;
    }
  }

  // Debug console en développement
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SEO Debug - ' + pageInfo.category);
      console.log('📍 URL:', location.pathname);
      console.log('🔍 Query params:', location.search);
      console.log('🏷️ Type de page:', pageInfo.category);
      console.log('📊 Schema.org:', pageInfo.type);
      console.log('📋 JSON-LD généré:', additionalJsonLd);
      if (blogPostData) {
        console.log('📰 Données du blog post:', {
          title: blogPostData.title,
          description: blogPostData.description,
          authors: blogPostData.frontMatter?.authors,
          image: blogPostData.frontMatter?.image,
          keywords: blogPostData.frontMatter?.keywords,
          date: blogPostData.date,
          permalink: blogPostData.permalink
        });
        console.log('👥 Données des auteurs:', authorsData);
      }
      if (pageMetadata) {
        console.log('📄 Métadonnées de page:', {
          title: pageMetadata.title,
          description: pageMetadata.description,
          frontMatter: pageMetadata.frontMatter,
          permalink: pageMetadata.permalink
        });
      }
      console.log('🌐 Site config:', {
        title: siteConfig.title,
        tagline: siteConfig.tagline,
        url: siteConfig.url,
        baseUrl: siteConfig.baseUrl
      });
      console.log('🔍 Détections:', {
        isBlogPost,
        isBlogListPage,
        isSeriesPage,
        isRepositoryPage,
        isHomePage,
        isThanksPage,
        hasBlogData: !!blogPostData,
        hasPageMetadata: !!pageMetadata
      });
      console.groupEnd();
    }
  }, [location.pathname, blogPostData, pageMetadata]);

  return (
    <>
      {/* Métadonnées supplémentaires selon le type de page */}
      <Head>
        <script type="application/ld+json">{JSON.stringify(additionalJsonLd)}</script>
        
        {/* Métadonnées spécifiques par type de page */}
        {isBlogPost && (
          <>
            <meta name="twitter:label1" content="Type" />
            <meta name="twitter:data1" content="Article de blog" />
            <meta name="article:section" content="Blog" />
          </>
        )}
        
        {isSeriesPage && (
          <>
            <meta name="twitter:label1" content="Type" />
            <meta name="twitter:data1" content="Série d'articles" />
            <meta name="article:section" content="Series" />
          </>
        )}

        {isRepositoryPage && (
          <>
            <meta name="twitter:label1" content="Type" />
            <meta name="twitter:data1" content="Repository" />
            <meta name="article:section" content="Code" />
          </>
        )}
        
        {/* Métadonnées génériques d'amélioration */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* Panneau de debug SEO avancé en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <>
          {/* Bouton toggle debug */}
          <button
            onClick={() => setDebugVisible(!debugVisible)}
            style={{
              position: 'fixed',
              bottom: debugVisible ? '240px' : '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.9)',
              color: '#00ff88',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '16px',
              cursor: 'pointer',
              zIndex: 10000,
              fontFamily: 'monospace'
            }}
            title={debugVisible ? 'Masquer le debug SEO' : 'Afficher le debug SEO'}
          >
            {debugVisible ? '🔍' : '👁️'}
          </button>

          {/* Panneau de debug avancé */}
          {debugVisible && (
            <div style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.95)',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '10px',
              zIndex: 9999,
              fontFamily: 'monospace',
              border: '1px solid rgba(255,255,255,0.3)',
              minWidth: '380px',
              maxWidth: '450px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}>
              {/* Header avec onglets */}
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                fontSize: '12px',
                color: '#00ff88',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  🔍 SEO Debug Panel Pro
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
                      <strong style={{ color: '#ffaa00' }}>Page Metadata:</strong>
                      <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                        <div>📝 {pageMetadata.title || 'Sans titre'}</div>
                        <div>📄 {pageMetadata.description || 'Sans description'}</div>
                        {pageMetadata.frontMatter && (
                          <>
                            <div>🖼️ Image: {pageMetadata.frontMatter.image ? '✅' : '❌'}</div>
                            <div>🏷️ Keywords: {pageMetadata.frontMatter.keywords ? '✅' : '❌'}</div>
                            <div>👤 Author: {pageMetadata.frontMatter.author ? '✅' : '❌'}</div>
                            <div>📅 Date: {pageMetadata.frontMatter.date ? '✅' : '❌'}</div>
                            <div>🎯 Category: {pageMetadata.frontMatter.category || 'Non définie'}</div>
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
                      <div>🔄 Re-renders: {React.useRef(0).current++}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#ffaa00' }}>Taille des données:</strong>
                    <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                      <div>📄 JSON-LD: {JSON.stringify(additionalJsonLd).length} chars</div>
                      <div>🔍 Blog Data: {blogPostData ? JSON.stringify(blogPostData).length : 0} chars</div>
                      <div>📋 Page Meta: {pageMetadata ? JSON.stringify(pageMetadata).length : 0} chars</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#ffaa00' }}>Hooks status:</strong>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      <div style={{ color: blogPostData ? '#00ff88' : '#555' }}>
                        {blogPostData ? '✅' : '❌'} useBlogPost: {blogPostData ? 'Actif' : 'Inactif'}
                      </div>
                      <div style={{ color: pageMetadata ? '#00ff88' : '#555' }}>
                        {pageMetadata ? '✅' : '❌'} usePageMetadata: {pageMetadata ? 'Actif' : 'Inactif'}
                      </div>
                      <div style={{ color: '#00ff88' }}>✅ useLocation: Actif</div>
                      <div style={{ color: '#00ff88' }}>✅ useDocusaurusContext: Actif</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ color: '#ffaa00' }}>Détections:</strong>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      <div style={{ color: isBlogPost ? '#00ff88' : '#555' }}>
                        {isBlogPost ? '✅' : '❌'} Article de blog
                      </div>
                      <div style={{ color: isBlogListPage ? '#00ff88' : '#555' }}>
                        {isBlogListPage ? '✅' : '❌'} Liste de blog
                      </div>
                      <div style={{ color: isSeriesPage ? '#00ff88' : '#555' }}>
                        {isSeriesPage ? '✅' : '❌'} Série d'articles
                      </div>
                      <div style={{ color: isRepositoryPage ? '#00ff88' : '#555' }}>
                        {isRepositoryPage ? '✅' : '❌'} Page repository
                      </div>
                      <div style={{ color: isHomePage ? '#00ff88' : '#555' }}>
                        {isHomePage ? '✅' : '❌'} Page d'accueil
                      </div>
                      <div style={{ color: isThanksPage ? '#00ff88' : '#555' }}>
                        {isThanksPage ? '✅' : '❌'} Page de remerciements
                      </div>
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
                      console.log('📋 Rapport SEO complet:', report);
                      alert('Rapport SEO affiché dans la console');
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
                    title="Génère un rapport SEO complet dans la console"
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
                      navigator.clipboard.writeText(location.href);
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
                    onClick={() => window.open('https://search.google.com/test/rich-results?url=' + encodeURIComponent(location.href), '_blank')}
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
                💡 Panel SEO Pro - Mode développement uniquement
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}