/**
 * Gestion intelligente de l'image SEO/OG de la page courante dans Docusaurus
 * Priorité :
 *   1. Image spécifique frontMatter article
 *   2. Image spécifique frontMatter page
 *   3. Image sociale par défaut dans la config
 *   4. Logo du site (fallback)
 * 
 * @param {object} blogPostData - Données d'article blog (optionnel)
 * @param {object} pageMetadata - Données metadata page (optionnel)
 * @param {object} siteConfig - Configuration Docusaurus (obligatoire)
 * @param {function} useBaseUrl - Helper Docusaurus pour URLs relatives (obligatoire)
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

  // Optionnel : normalisation de l'URL (pour éviter les doubles slashes)
  imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');

  return imageUrl;
}