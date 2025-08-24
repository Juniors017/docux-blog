import React from 'react';

/**
 * Panel de debug SEO avancé
 * Composant dédié pour la validation et le monitoring SEO en développement
 */
export default function SeoDebugPanel({ 
  jsonLd, 
  pageInfo, 
  location, 
  blogPostData, 
  pageMetadata, 
  siteConfig,
  detections 
}) {
  const [debugVisible, setDebugVisible] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showReport, setShowReport] = React.useState(false);
  const [currentReport, setCurrentReport] = React.useState(null);

  // Fonctions de validation SEO
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
    const validation = validateJsonLd(jsonLd);
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
      url: window.location.href,
      pageType: pageInfo.type,
      timestamp: new Date().toISOString(),
      validation: validateJsonLd(jsonLd),
      jsonLd: jsonLd,
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
    if (detections.isBlogPost && !blogPostData?.frontMatter?.image) {
      report.recommendations.push('🖼️ Ajouter une image à l\'article pour les Rich Results');
    }
    if (!jsonLd.keywords || jsonLd.keywords.length === 0) {
      report.recommendations.push('🏷️ Ajouter des mots-clés pour améliorer la catégorisation');
    }

    return report;
  };

  // Ne pas afficher en production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Bouton toggle debug */}
      <button
        onClick={() => setDebugVisible(!debugVisible)}
        style={{
          position: 'fixed',
          bottom: debugVisible ? '260px' : '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: '#00ff88',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          fontSize: '18px',
          cursor: 'pointer',
          zIndex: 10000,
          fontFamily: 'monospace',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
        title={debugVisible ? 'Masquer le SEO Panel Pro' : 'Afficher le SEO Panel Pro'}
      >
        {debugVisible ? '🔍' : '👁️'}
      </button>

      {/* Panel de debug avancé */}
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
                  {Object.entries(detections).map(([key, value]) => (
                    <div key={key} style={{ color: value ? '#00ff88' : '#555' }}>
                      {value ? '✅' : '❌'} {key}
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
