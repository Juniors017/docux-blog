/**
 * Utilitaires pour les URLs et liens dans les schémas SEO
 * Complète les fonctionnalités du fichier urlNormalizer.js existant
 */

/**
 * Génère les URLs de référence pour un schéma
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} URLs de référence pour le schéma
 */
export function getSchemaReferenceUrls(blogPostData, pageMetadata, siteConfig) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  
  return {
    // URL du dépôt/source si disponible
    codeRepository: frontMatter.repository || 
                   frontMatter.github || 
                   frontMatter.sourceCode || 
                   siteConfig.url,
    
    // URL de documentation liée
    documentation: frontMatter.documentation || 
                  frontMatter.docs || 
                  frontMatter.reference,
    
    // URL de démonstration
    demo: frontMatter.demo || 
          frontMatter.preview || 
          frontMatter.live,
    
    // URLs des prérequis/dépendances
    dependencies: Array.isArray(frontMatter.dependencies) 
      ? frontMatter.dependencies.filter(dep => typeof dep === 'string' && dep.startsWith('http'))
      : [],
    
    // Liens vers des articles connexes
    relatedArticles: frontMatter.relatedLinks || 
                    frontMatter.seeAlso || 
                    []
  };
}

/**
 * Génère la liste sameAs pour les schémas (réseaux sociaux, autres plateformes)
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Array<string>} URLs sameAs pour le schéma
 */
export function getSchemaSameAs(blogPostData, pageMetadata, siteConfig) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  const sameAsUrls = [];
  
  // URLs depuis le frontMatter
  if (frontMatter.sameAs) {
    const urls = Array.isArray(frontMatter.sameAs) ? frontMatter.sameAs : [frontMatter.sameAs];
    sameAsUrls.push(...urls.filter(url => typeof url === 'string' && url.startsWith('http')));
  }
  
  // URLs des réseaux sociaux depuis le frontMatter
  if (frontMatter.socialMedia) {
    const socialUrls = Object.values(frontMatter.socialMedia).filter(Boolean);
    sameAsUrls.push(...socialUrls);
  }
  
  // URLs depuis la configuration globale du site
  if (siteConfig.socials) {
    const siteUrls = Object.values(siteConfig.socials).filter(Boolean);
    sameAsUrls.push(...siteUrls);
  }
  
  // Déduplication et validation
  return [...new Set(sameAsUrls)].filter(url => 
    typeof url === 'string' && 
    url.startsWith('http') && 
    url.length > 10
  );
}

/**
 * Génère les URLs de navigation (précédent/suivant) pour les schémas
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} URLs de navigation
 */
export function getSchemaNavigationUrls(blogPostData, pageMetadata, siteConfig) {
  const navigation = {};
  
  // URLs depuis les métadonnées Docusaurus (si disponibles)
  if (blogPostData?.metadata?.prevItem) {
    navigation.previousArticle = {
      '@type': 'WebPage',
      name: blogPostData.metadata.prevItem.title,
      url: siteConfig.url + blogPostData.metadata.prevItem.permalink
    };
  }
  
  if (blogPostData?.metadata?.nextItem) {
    navigation.nextArticle = {
      '@type': 'WebPage', 
      name: blogPostData.metadata.nextItem.title,
      url: siteConfig.url + blogPostData.metadata.nextItem.permalink
    };
  }
  
  // URLs depuis le frontMatter (surchargent les métadonnées)
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  
  if (frontMatter.previousArticle) {
    navigation.previousArticle = {
      '@type': 'WebPage',
      name: frontMatter.previousArticle.title || 'Article précédent',
      url: frontMatter.previousArticle.url || frontMatter.previousArticle
    };
  }
  
  if (frontMatter.nextArticle) {
    navigation.nextArticle = {
      '@type': 'WebPage',
      name: frontMatter.nextArticle.title || 'Article suivant', 
      url: frontMatter.nextArticle.url || frontMatter.nextArticle
    };
  }
  
  return navigation;
}

/**
 * Génère les mentions et citations pour un schéma
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {Object} Mentions et citations formatées
 */
export function getSchemaCitations(blogPostData, pageMetadata) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  const citations = {};
  
  // Citations académiques/références
  if (frontMatter.citations || frontMatter.references) {
    const refs = frontMatter.citations || frontMatter.references;
    citations.citation = Array.isArray(refs) ? refs : [refs];
  }
  
  // Mentions d'autres créateurs/sites
  if (frontMatter.mentions) {
    citations.mentions = Array.isArray(frontMatter.mentions) 
      ? frontMatter.mentions.map(mention => ({
          '@type': 'Thing',
          name: mention.name || mention,
          url: mention.url || mention.link
        }))
      : [{
          '@type': 'Thing', 
          name: frontMatter.mentions
        }];
  }
  
  // Sources d'inspiration
  if (frontMatter.inspiration || frontMatter.basedOn) {
    const sources = frontMatter.inspiration || frontMatter.basedOn;
    citations.isBasedOn = Array.isArray(sources) ? sources : [sources];
  }
  
  return citations;
}

/**
 * Valide toutes les URLs d'un schéma
 * @param {Object} schemaUrls - Objet contenant toutes les URLs du schéma
 * @returns {Object} Résultat de validation
 */
export function validateAllSchemaUrls(schemaUrls) {
  const errors = [];
  const warnings = [];
  
  // Validation des URLs de base
  Object.entries(schemaUrls).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('http')) {
      try {
        new URL(value);
      } catch {
        errors.push(`URL invalide pour ${key}: ${value}`);
      }
    } else if (Array.isArray(value)) {
      value.forEach((url, index) => {
        if (typeof url === 'string' && url.startsWith('http')) {
          try {
            new URL(url);
          } catch {
            errors.push(`URL invalide pour ${key}[${index}]: ${url}`);
          }
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    urlCount: Object.values(schemaUrls).flat().filter(Boolean).length
  };
}
