/**
 * ALTERNATIVE : Utilitaires d'images unifiés pour SEO et Schémas
 * Combine seoImageUtils.js et schemaDataUtils/imageUtils.js
 */

// ===============================================
// SECTION 1: LOGIQUE SEO GÉNÉRALE (ex-seoImageUtils)
// ===============================================

/**
 * Récupère l'URL d'image SEO avec données brutes (usage général)
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {string} URL de l'image optimisée
 */
export function getSeoImageUrl(blogPostData, pageMetadata, siteConfig, useBaseUrl) {
  let imageUrl;

  // 1. Image du frontMatter d'article
  if (blogPostData?.frontMatter?.image) {
    imageUrl = blogPostData.frontMatter.image.startsWith('http') 
      ? blogPostData.frontMatter.image 
      : siteConfig.url + useBaseUrl(blogPostData.frontMatter.image);

  // 2. Image du frontMatter de page
  } else if (pageMetadata?.frontMatter?.image) {
    imageUrl = pageMetadata.frontMatter.image.startsWith('http')
      ? pageMetadata.frontMatter.image
      : siteConfig.url + useBaseUrl(pageMetadata.frontMatter.image);

  // 3. Image sociale par défaut du site
  } else if (siteConfig.themeConfig?.image) {
    imageUrl = siteConfig.themeConfig.image.startsWith('http')
      ? siteConfig.themeConfig.image
      : siteConfig.url + useBaseUrl(siteConfig.themeConfig.image);

  // 4. Fallback : logo du site
  } else {
    imageUrl = siteConfig.url + useBaseUrl('/img/docux.png');
  }

  // Normalisation de l'URL
  imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');
  return imageUrl;
}

// ===============================================
// SECTION 2: LOGIQUE SCHÉMAS JSON-LD (ex-schemaDataUtils/imageUtils)
// ===============================================

/**
 * Récupère l'URL d'image avec données priorisées (usage schémas)
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {string} URL de l'image optimisée
 */
export function getSchemaImageUrl(prioritizedData, siteConfig, useBaseUrl) {
  // Adapte les données priorisées pour réutiliser getSeoImageUrl
  const blogPostData = { frontMatter: prioritizedData?.frontMatter };
  const pageMetadata = { frontMatter: prioritizedData?.frontMatter };
  
  return getSeoImageUrl(blogPostData, pageMetadata, siteConfig, useBaseUrl);
}

/**
 * Récupère l'objet ImageObject complet pour schémas JSON-LD
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Object} Structure ImageObject pour schema.org
 */
export function getSchemaImageObject(prioritizedData, siteConfig, useBaseUrl) {
  const imageUrl = getSchemaImageUrl(prioritizedData, siteConfig, useBaseUrl);
  const title = prioritizedData?.title || 'Image Docux';
  
  return {
    '@type': 'ImageObject',
    url: imageUrl,
    caption: `Image pour: ${title}`,
    description: `Image illustrative pour l'article "${title}"`,
    width: prioritizedData?.frontMatter?.imageWidth || 1200,
    height: prioritizedData?.frontMatter?.imageHeight || 630,
    encodingFormat: getImageFormat(imageUrl),
    ...(prioritizedData?.frontMatter?.imageAlt && {
      alternateName: prioritizedData.frontMatter.imageAlt
    })
  };
}

// ===============================================
// SECTION 3: UTILITAIRES COMMUNS
// ===============================================

/**
 * Détermine le format d'une image à partir de son URL
 * @param {string} imageUrl - URL de l'image
 * @returns {string} Format MIME de l'image
 */
export function getImageFormat(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return 'image/jpeg';
  
  const extension = imageUrl.split('.').pop()?.toLowerCase();
  
  const formatMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'svg': 'image/svg+xml',
    'gif': 'image/gif'
  };
  
  return formatMap[extension] || 'image/jpeg';
}

/**
 * Valide qu'une URL d'image est accessible et valide
 * @param {string} imageUrl - URL de l'image à valider
 * @returns {boolean} True si l'image semble valide
 */
export function isValidImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  
  try {
    const url = new URL(imageUrl);
    const hasValidProtocol = ['http:', 'https:'].includes(url.protocol);
    const hasValidExtension = /\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(url.pathname);
    
    return hasValidProtocol && (hasValidExtension || url.pathname === '/');
  } catch {
    return false;
  }
}
