/**
 * Utilitaires pour la gestion et la normalisation des auteurs
 * 
 * - Récupère l'auteur principal d'une page (blog, doc, custom)
 * - Normalise la présentation du nom
 * - Utilise les données natives de Docusaurus (blog/authors.yml)
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
 * Récupère les données d'auteur depuis les métadonnées Docusaurus natives
 * 
 * @param {string} authorKey - Clé de l'auteur (ex: "docux")
 * @param {object} globalData - Données globales Docusaurus (window.docusaurus.globalData)
 * @returns {object|null} Données de l'auteur ou null
 */
function getAuthorFromDocusaurus(authorKey, globalData) {
  try {
    // Chercher dans les données du plugin blog
    if (globalData && globalData['docusaurus-plugin-content-blog']) {
      const blogData = globalData['docusaurus-plugin-content-blog'];
      if (blogData && blogData.default && blogData.default.authors) {
        const author = blogData.default.authors[authorKey];
        if (author) {
          return {
            name: author.name,
            title: author.title,
            url: author.url,
            imageUrl: author.image_url, // Docusaurus utilise image_url
            github: author.socials?.github,
            bio: author.bio
          };
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors de la récupération des données d\'auteur Docusaurus:', error);
  }
  return null;
}

/**
 * Récupère l'auteur principal selon la priorité :
 * 1. Auteur du blogPostData.frontMatter.authors (depuis Docusaurus natives)
 * 2. Auteur du pageMetadata.frontMatter.authors ou author (depuis Docusaurus natives)
 * 3. Fallback vers authorsData statique (legacy)
 * 4. Fallback final : nom et logo du site
 * 
 * @param {object} blogPostData - Données d'article blog (optionnel)
 * @param {object} pageMetadata - Données metadata page (optionnel)
 * @param {object} authorsData - Base de données statique des auteurs (fallback legacy)
 * @param {object} siteConfig - Configuration Docusaurus
 * @returns {object} Auteur principal
 */
export function getPrimaryAuthor(blogPostData, pageMetadata, authorsData, siteConfig) {
  let primaryAuthor = null;

  // Accès aux données globales Docusaurus (côté client seulement)
  let globalData = null;
  if (typeof window !== 'undefined' && window.docusaurus) {
    globalData = window.docusaurus.globalData;
  }

  // 1. Recherche dans le frontMatter du blog post (données Docusaurus natives)
  if (blogPostData?.frontMatter?.authors) {
    let authorKey;
    if (Array.isArray(blogPostData.frontMatter.authors)) {
      authorKey = blogPostData.frontMatter.authors[0];
    } else if (typeof blogPostData.frontMatter.authors === 'string') {
      authorKey = blogPostData.frontMatter.authors;
    }
    
    if (authorKey) {
      // Essayer d'abord les données Docusaurus natives
      primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
      
      // Fallback sur les données statiques
      if (!primaryAuthor && authorsData[authorKey]) {
        primaryAuthor = { ...authorsData[authorKey] };
      }
      
      if (primaryAuthor) {
        primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
      }
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
    
    if (authorKey) {
      // Essayer d'abord les données Docusaurus natives
      primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
      
      // Fallback sur les données statiques
      if (!primaryAuthor && authorsData[authorKey]) {
        primaryAuthor = { ...authorsData[authorKey] };
      }
      
      if (primaryAuthor) {
        primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
      }
    }
  }

  // 3. Fallback sur author (singulier)
  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    const authorKey = pageMetadata.frontMatter.author;
    
    // Essayer d'abord les données Docusaurus natives
    primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
    
    // Fallback sur les données statiques
    if (!primaryAuthor && authorsData[authorKey]) {
      primaryAuthor = { ...authorsData[authorKey] };
    }
    
    if (primaryAuthor) {
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  // 4. Fallback générique : nom et logo du site
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
      imageUrl: siteLogo         // Logo officiel du site ou fallback local
    };
  }

  return primaryAuthor;
}
