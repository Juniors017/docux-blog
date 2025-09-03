/**
 * Utilitaires pour les métadonnées communes des schémas SEO
 * Gère l'extraction des titres, descriptions et noms avec système de fallback
 */

/**
 * Récupère le titre pour un schéma avec système de priorité
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {string} Titre optimisé pour le schéma
 */
export function getSchemaTitle(blogPostData, pageMetadata, siteConfig) {
  return blogPostData?.frontMatter?.title ||     // 1. Titre du frontMatter de blog (le plus riche)
         pageMetadata?.frontMatter?.title ||     // 2. Titre du frontMatter de page
         blogPostData?.metadata?.title ||        // 3. Titre des métadonnées de blog
         pageMetadata?.title ||                  // 4. Titre des métadonnées de page
         siteConfig.title;                       // 5. Titre du site (fallback)
}

/**
 * Récupère la description pour un schéma avec système de priorité
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {string} Description optimisée pour le schéma
 */
export function getSchemaDescription(blogPostData, pageMetadata, siteConfig) {
  return blogPostData?.frontMatter?.description ||    // 1. Description frontMatter blog (la plus riche)
         pageMetadata?.frontMatter?.description ||    // 2. Description frontMatter page
         blogPostData?.metadata?.description ||       // 3. Description métadonnées blog
         pageMetadata?.description ||                 // 4. Description métadonnées page
         siteConfig.tagline ||                        // 5. Tagline du site
         'Documentation et tutoriels sur Docusaurus'; // 6. Description par défaut
}

/**
 * Récupère le nom pour un schéma (propriété 'name' du schema.org)
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {string} fallbackTitle - Titre de fallback
 * @returns {string} Nom optimisé pour le schéma
 */
export function getSchemaName(blogPostData, pageMetadata, fallbackTitle) {
  return blogPostData?.frontMatter?.name ||        // 1. Nom explicite dans frontMatter blog
         pageMetadata?.frontMatter?.name ||        // 2. Nom explicite dans frontMatter page
         blogPostData?.frontMatter?.title ||       // 3. Titre frontMatter blog
         pageMetadata?.frontMatter?.title ||       // 4. Titre frontMatter page
         fallbackTitle;                            // 5. Titre calculé précédemment
}

/**
 * Récupère l'URL canonique pour la propriété mainEntityOfPage
 * @param {string} canonicalId - ID canonique de la page
 * @returns {Object} Structure pour mainEntityOfPage
 */
export function getMainEntityOfPage(canonicalId) {
  return {
    '@type': 'WebPage',
    '@id': canonicalId
  };
}

/**
 * Récupère les métadonnées de base communes à tous les schémas
 * @param {Object} params - Paramètres contenant toutes les données nécessaires
 * @returns {Object} Métadonnées de base pour les schémas
 */
export function getBaseSchemaMetadata({
  blogPostData,
  pageMetadata,
  siteConfig,
  canonicalId,
  canonicalUrl
}) {
  const title = getSchemaTitle(blogPostData, pageMetadata, siteConfig);
  const description = getSchemaDescription(blogPostData, pageMetadata, siteConfig);
  const name = getSchemaName(blogPostData, pageMetadata, title);

  return {
    title,
    description,
    name,
    canonicalId,
    canonicalUrl,
    mainEntityOfPage: getMainEntityOfPage(canonicalId)
  };
}
