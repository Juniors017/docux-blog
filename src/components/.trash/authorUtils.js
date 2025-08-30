/**
 * Utilitaires pour la gestion et la normalisation des auteurs
 * 
 * - Récupère l'auteur principal d'une page (blog, doc, custom)
 * - Normalise la présentation du nom
 * - Utilise le nom et logo du site en fallback si aucun auteur trouvé
 */

/**
 * Met la première lettre en majuscule, le reste en minuscule
 * @param {string} name - Nom à normaliser
 * @returns {string}
 */
export function normalizeAuthorName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Récupère l'auteur principal selon la priorité :
 * 1. Auteur du blogPostData.frontMatter.authors
 * 2. Auteur du pageMetadata.frontMatter.authors ou author
 * 3. Fallback : nom et logo du site
 * 
 * @param {object} blogPostData - Données d'article blog (optionnel)
 * @param {object} pageMetadata - Données metadata page (optionnel)
 * @param {object} authorsData - Base de données centralisée des auteurs (clé → objet auteur)
 * @param {object} siteConfig - Configuration Docusaurus
 * @returns {object} Auteur principal
 */
export function getPrimaryAuthor(blogPostData, pageMetadata, authorsData, siteConfig) {
  let primaryAuthor = null;

  // 1. Recherche dans le frontMatter du blog post
  if (blogPostData?.frontMatter?.authors) {
    let authorKey;
    if (Array.isArray(blogPostData.frontMatter.authors)) {
      authorKey = blogPostData.frontMatter.authors[0];
    } else if (typeof blogPostData.frontMatter.authors === 'string') {
      authorKey = blogPostData.frontMatter.authors;
    }
    if (authorKey && authorsData[authorKey]) {
      primaryAuthor = { ...authorsData[authorKey] };
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  // 2. Fallback sur les métadonnées de la page courante
  if (!primaryAuthor && pageMetadata?.frontMatter?.authors) {
    let authorKey;
    if (Array.isArray(pageMetadata.frontMatter.authors)) {
      authorKey = pageMetadata.frontMatter.authors[0];
    } else if (typeof pageMetadata.frontMatter.authors === 'string') {
      authorKey = pageMetadata.frontMatter.authors;
    }
    if (authorKey && authorsData[authorKey]) {
      primaryAuthor = { ...authorsData[authorKey] };
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    const authorKey = pageMetadata.frontMatter.author;
    if (authorsData[authorKey]) {
      primaryAuthor = { ...authorsData[authorKey] };
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  // 3. Fallback générique : nom et logo du site
  if (!primaryAuthor) {
    // Récupère l'image du site depuis themeConfig.image ou fallback sur /img/docux.png
    let siteLogo =
      siteConfig.themeConfig?.image
        ? (siteConfig.themeConfig.image.startsWith('http')
            ? siteConfig.themeConfig.image
            : siteConfig.url + siteConfig.themeConfig.image)
        : siteConfig.url + '/img/docux.png';

    primaryAuthor = {
      name: siteConfig.title,    // Nom du site comme auteur générique
      url: siteConfig.url,       // URL racine du site
      image: siteLogo            // Logo officiel du site ou fallback local
    };
  }

  return primaryAuthor;
}