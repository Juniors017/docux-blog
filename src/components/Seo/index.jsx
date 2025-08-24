import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';

export default function Seo() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const [debugVisible, setDebugVisible] = React.useState(true);
  
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

  // Debug console en développement
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SEO Debug - ' + pageInfo.category);
      console.log('📍 URL:', location.pathname);
      console.log('🔍 Query params:', location.search);
      console.log('🏷️ Type de page:', pageInfo.category);
      console.log('📊 Schema.org:', pageInfo.type);
      console.log('📋 JSON-LD généré:', additionalJsonLd);
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
        isThanksPage
      });
      console.groupEnd();
    }
  }, [location.pathname]);

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

          {/* Panneau de debug */}
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
              minWidth: '320px',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                fontSize: '12px',
                color: '#00ff88',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                🔍 SEO Debug Panel
                <div style={{ fontSize: '8px', color: '#ccc' }}>
                  v{React.version}
                </div>
              </div>
              
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

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Site Info:</strong>
                <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                  <div>📄 {siteConfig.title}</div>
                  <div>🏷️ {siteConfig.tagline}</div>
                  <div>🌐 {siteConfig.url + siteConfig.baseUrl}</div>
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

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Métadonnées SEO détectées:</strong>
                <div style={{ fontSize: '9px', marginTop: '2px' }}>
                  <div style={{ color: '#00ff88' }}>✅ JSON-LD Schema.org ({pageInfo.type})</div>
                  <div style={{ color: '#00ff88' }}>✅ Publisher: DOCUX</div>
                  <div style={{ color: '#00ff88' }}>✅ Language: fr-FR</div>
                  <div style={{ color: '#00ff88' }}>✅ MainEntityOfPage</div>
                  
                  {isBlogPost && (
                    <>
                      <div style={{ color: '#88aaff' }}>📝 Article genre: Blog</div>
                      <div style={{ color: '#88aaff' }}>📝 Article section: Technology</div>
                      <div style={{ color: '#88aaff' }}>� Twitter label: Article de blog</div>
                    </>
                  )}
                  
                  {isSeriesPage && (
                    <>
                      <div style={{ color: '#88aaff' }}>📚 Series genre: Educational</div>
                      <div style={{ color: '#88aaff' }}>📚 Learning type: Tutorial series</div>
                      <div style={{ color: '#88aaff' }}>� Twitter label: Série d'articles</div>
                    </>
                  )}
                  
                  {isRepositoryPage && (
                    <>
                      <div style={{ color: '#88aaff' }}>💻 Repository genre: Code</div>
                      <div style={{ color: '#88aaff' }}>💻 About: Code repositories</div>
                      <div style={{ color: '#88aaff' }}>🐦 Twitter label: Repository</div>
                    </>
                  )}
                  
                  <div style={{ color: '#ffaa00' }}>🔒 Referrer: strict-origin-when-cross-origin</div>
                  <div style={{ color: '#ffaa00' }}>📱 Format detection: telephone=no</div>
                  
                  {!isBlogPost && !isSeriesPage && !isRepositoryPage && (
                    <div style={{ color: '#ccc' }}>ℹ️ Métadonnées génériques uniquement</div>
                  )}
                  
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#888', 
                    marginTop: '4px',
                    paddingTop: '4px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    💡 Sécurité & Format:
                    <br/>🔒 Referrer = Contrôle les infos envoyées aux liens externes
                    <br/>📱 Format = Désactive la détection auto des numéros de téléphone
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Performance:</strong>
                <div style={{ fontSize: '9px', color: '#ccc', marginTop: '2px' }}>
                  <div>⚡ Render: {performance.now().toFixed(1)}ms</div>
                  <div>🧠 Heap: {(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
                  <div>📦 Bundle: Optimisé</div>
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#ffaa00' }}>Actions rapides:</strong>
                <div style={{ fontSize: '9px', marginTop: '2px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      console.log('📋 JSON-LD complet:', additionalJsonLd);
                      alert('JSON-LD affiché dans la console');
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
                    title="Affiche le JSON-LD généré dans la console"
                  >
                    📋 JSON-LD
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
                    title="Copie l'URL actuelle dans le presse-papiers"
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
                    title="Ouvre Google Rich Results Test pour cette page"
                  >
                    🔍 Test SEO
                  </button>
                </div>
                
                <div style={{ 
                  fontSize: '8px', 
                  color: '#aaa', 
                  marginTop: '4px',
                  paddingTop: '4px',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  💡 Actions utiles:
                  <br/>📋 = Console log du JSON-LD pour debug
                  <br/>📎 = Copie URL pour partage/test
                  <br/>🔍 = Valide vos métadonnées avec Google
                </div>
              </div>

              <div style={{ 
                fontSize: '8px', 
                color: '#888', 
                marginTop: '8px',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                💡 Panel visible uniquement en développement
                <br/>
                🖥️ Ouvrez la console pour plus de détails
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
