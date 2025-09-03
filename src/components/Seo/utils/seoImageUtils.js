/**
 * Utilitaires pour la gestion des images SEO et Schémas JSON-LD
 * 
 * FONCTIONNALITÉS :
 * - Récupération intelligente d'images avec système de priorité
 * - Formatage pour schémas JSON-LD (schema.org)
 * - Validation et optimisation d'URLs d'images
 * - Support des données brutes et priorisées
 * 
 * PRIORITÉ DES IMAGES :
 *   1. Image spécifique frontMatter article
 *   2. Image spécifique frontMatter page
 *   3. Image sociale par défaut dans la config
 *   4. Logo du site (fallback)
 */

// ===============================================
// SECTION 1: FONCTIONS SEO GÉNÉRALES
// ===============================================

/**
 * Récupère l'URL d'image SEO avec données brutes (usage général dans le composant SEO)
 * @param {Object} blogPostData - Données d'article blog (optionnel)
 * @param {Object} pageMetadata - Données metadata page (optionnel)
 * @param {Object} siteConfig - Configuration Docusaurus (obligatoire)
 * @param {Function} useBaseUrl - Helper Docusaurus pour URLs relatives (obligatoire)
 * @returns {string} URL finale de l'image à utiliser
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

  // Normalisation de l'URL (pour éviter les doubles slashes)
  imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');

  return imageUrl;
}

// ===============================================
// SECTION 2: FONCTIONS POUR SCHÉMAS JSON-LD
// ===============================================

/**
 * Récupère l'URL d'image avec données déjà priorisées (usage dans les utilitaires de schémas)
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
    // Dimensions par défaut (peuvent être surchargées par le frontMatter)
    width: prioritizedData?.frontMatter?.imageWidth || 1200,
    height: prioritizedData?.frontMatter?.imageHeight || 630,
    // Format et qualité
    encodingFormat: getImageFormat(imageUrl),
    // URL alternative si disponible
    ...(prioritizedData?.frontMatter?.imageAlt && {
      alternateName: prioritizedData.frontMatter.imageAlt
    })
  };
}

/**
 * Récupère plusieurs images pour un schéma (image principale + alternatives)
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Array<Object>} Tableau d'objets ImageObject
 */
export function getSchemaImages(prioritizedData, siteConfig, useBaseUrl) {
  const images = [];
  
  // Image principale
  const primaryImage = getSchemaImageObject(prioritizedData, siteConfig, useBaseUrl);
  images.push(primaryImage);
  
  // Images additionnelles si définies dans le frontMatter
  const additionalImages = prioritizedData?.frontMatter?.additionalImages || [];
  
  additionalImages.forEach((imageUrl, index) => {
    const fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : siteConfig.url + useBaseUrl(imageUrl);
    
    images.push({
      '@type': 'ImageObject',
      url: fullUrl,
      caption: `Image additionnelle ${index + 1}`,
      encodingFormat: getImageFormat(fullUrl)
    });
  });
  
  return images;
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
    
    // Vérifications de base
    const hasValidProtocol = ['http:', 'https:'].includes(url.protocol);
    const hasValidExtension = /\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(url.pathname);
    
    return hasValidProtocol && (hasValidExtension || url.pathname === '/');
  } catch {
    return false;
  }
}

/**
 * Optimise une URL d'image pour les performances
 * @param {string} imageUrl - URL de l'image originale
 * @param {Object} options - Options d'optimisation
 * @returns {string} URL d'image optimisée
 */
export function optimizeImageUrl(imageUrl, options = {}) {
  if (!imageUrl || !isValidImageUrl(imageUrl)) return imageUrl;
  
  const {
    width = 1200,
    height = 630,
    quality = 85,
    format = 'auto'
  } = options;
  
  // Si c'est une image locale, on peut ajouter des paramètres d'optimisation
  // Cette logique peut être étendue selon vos besoins d'optimisation
  
  return imageUrl;
}

/**
 * Récupère les dimensions d'image depuis le frontMatter ou applique des valeurs par défaut
 * @param {Object} frontMatter - FrontMatter de l'article
 * @param {string} imageType - Type d'image ('social', 'article', 'thumbnail')
 * @returns {Object} Dimensions width/height
 */
export function getImageDimensions(frontMatter, imageType = 'social') {
  const dimensionMap = {
    social: { width: 1200, height: 630 },      // Format Open Graph
    article: { width: 800, height: 400 },      // Format article
    thumbnail: { width: 300, height: 200 },    // Format miniature
    square: { width: 512, height: 512 }        // Format carré (logos)
  };
  
  const defaults = dimensionMap[imageType] || dimensionMap.social;
  
  return {
    width: frontMatter?.imageWidth || defaults.width,
    height: frontMatter?.imageHeight || defaults.height
  };
}

/**
 * Génère un objet ImageObject complet avec toutes les propriétés schema.org
 * @param {string} imageUrl - URL de l'image
 * @param {Object} metadata - Métadonnées additionnelles
 * @returns {Object} ImageObject schema.org complet
 */
export function createCompleteImageObject(imageUrl, metadata = {}) {
  const {
    caption,
    description,
    width,
    height,
    alt,
    title
  } = metadata;
  
  return {
    '@type': 'ImageObject',
    url: imageUrl,
    ...(caption && { caption }),
    ...(description && { description }),
    ...(alt && { alternateName: alt }),
    ...(title && { name: title }),
    ...(width && { width }),
    ...(height && { height }),
    encodingFormat: getImageFormat(imageUrl),
    // Propriétés de qualité pour schema.org
    representativeOfPage: true,
    contentUrl: imageUrl
  };
}