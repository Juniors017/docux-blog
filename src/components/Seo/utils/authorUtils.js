/**
 * Utilitaires pour la gestion et la normalisation des auteurs
 * 
 * - Récupère l'auteur principal d'une page (blog, doc, custom)
 * - Normalise la présentation du nom
 * - Utilise les données natives de Docusaurus (blog/authors.yml)
 * - Utilise le nom et logo du site en fallback si aucun auteur trouvé
 * 
 * IMPORTANT : Les données d'auteurs depuis authors.yml ne sont disponibles 
 * qu'après un build (npm run build + npm run serve).
 * En mode développement (npm start), les données Docusaurus natives ne sont pas
 * chargées dans window.docusaurus.globalData et le fallback sera utilisé.
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
 * NOTE: Cette fonction ne fonctionne qu'après un build complet (npm run build).
 * En mode développement (npm start), globalData.authors sera undefined.
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
    // En mode dev, c'est normal que les données ne soient pas disponibles
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DEV] Données auteur "${authorKey}" disponibles après build (npm run build)`);
    } else {
      console.warn('Erreur lors de la récupération des données d\'auteur Docusaurus:', error);
    }
  }
  return null;
}

/* ============================================================================
 * SECTION 1 : FONCTIONS POUR DONNÉES BRUTES (Usage composant SEO principal)
 * ============================================================================ */

/**
 * Récupère l'auteur principal selon la priorité (VERSION DONNÉES BRUTES)
 * 1. Auteur du blogPostData.frontMatter.authors (depuis Docusaurus natives)
 * 2. Auteur du pageMetadata.frontMatter.authors ou author (depuis Docusaurus natives)
 * 3. Fallback final : nom et logo du site
 * 
 * COMPORTEMENT EN MODE DEV vs PROD :
 * - Mode dev (npm start) : Seul le fallback (site) fonctionne
 * - Mode prod (npm run build + serve) : Toutes les sources de données fonctionnent
 * 
 * @param {object} blogPostData - Données d'article blog (optionnel)
 * @param {object} pageMetadata - Données metadata page (optionnel)
 * @param {object} siteConfig - Configuration Docusaurus
 * @returns {object} Auteur principal
 */
export function getPrimaryAuthor(blogPostData, pageMetadata, siteConfig) {
  let primaryAuthor = null;

  // Accès aux données globales Docusaurus (côté client seulement)
  // NOTE: globalData.authors n'est disponible qu'après npm run build
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
      primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
      
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
      primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
      
      if (primaryAuthor) {
        primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
      }
    }
  }

  // 3. Fallback sur author (singulier)
  if (!primaryAuthor && pageMetadata?.frontMatter?.author) {
    const authorKey = pageMetadata.frontMatter.author;
    
    primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
    
    if (primaryAuthor) {
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  // 4. Fallback final : nom et logo du site
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

/* ============================================================================
 * SECTION 2 : FONCTIONS POUR DONNÉES PRIORISÉES (Usage utilitaires schémas)
 * ============================================================================ */

/**
 * Récupère l'auteur principal depuis les données déjà priorisées par usePageMetadata
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} Auteur principal
 */
export function getSchemaPrimaryAuthor(prioritizedData, siteConfig) {
  let primaryAuthor = null;

  // Accès aux données globales Docusaurus
  let globalData = null;
  if (typeof window !== 'undefined' && window.docusaurus) {
    globalData = window.docusaurus.globalData;
  }

  // 1. Recherche dans le frontMatter priorisé
  if (prioritizedData?.frontMatter?.authors) {
    let authorKey;
    if (Array.isArray(prioritizedData.frontMatter.authors)) {
      authorKey = prioritizedData.frontMatter.authors[0];
    } else if (typeof prioritizedData.frontMatter.authors === 'string') {
      authorKey = prioritizedData.frontMatter.authors;
    }
    
    if (authorKey) {
      primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
      
      if (primaryAuthor) {
        primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
      }
    }
  }

  // 2. Fallback sur author (singulier)
  if (!primaryAuthor && prioritizedData?.frontMatter?.author) {
    const authorKey = prioritizedData.frontMatter.author;
    
    primaryAuthor = getAuthorFromDocusaurus(authorKey, globalData);
    
    if (primaryAuthor) {
      primaryAuthor.name = normalizeAuthorName(primaryAuthor.name);
    }
  }

  // 3. Fallback final : nom et logo du site
  if (!primaryAuthor) {
    let siteLogo =
      siteConfig.themeConfig?.image
        ? (siteConfig.themeConfig.image.startsWith('http')
            ? siteConfig.themeConfig.image
            : siteConfig.url + siteConfig.themeConfig.image)
        : siteConfig.url + '/img/docux.png';

    primaryAuthor = {
      name: siteConfig.title,
      url: siteConfig.url,
      imageUrl: siteLogo
    };
  }

  return primaryAuthor;
}

/**
 * Récupère un objet auteur complet pour les schémas JSON-LD
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} Objet auteur formaté pour schema.org
 */
export function getSchemaAuthorObject(prioritizedData, siteConfig) {
  const author = getSchemaPrimaryAuthor(prioritizedData, siteConfig);
  
  if (!author) return null;
  
  return {
    '@type': 'Person',
    name: author.name,
    url: author.url || author.github || siteConfig.url,
    description: author.title || author.bio || 'Contributeur',
    image: author.imageUrl?.startsWith('http') 
      ? author.imageUrl 
      : `${siteConfig.url}${author.imageUrl || '/img/docusaurus-social-card.jpg'}`,
    ...(author.github && { sameAs: [author.github] }),
    ...(author.bio && { description: author.bio })
  };
}

/**
 * Récupère les auteurs multiples pour les schémas (si plusieurs auteurs)
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Array<Object>} Tableau d'objets auteurs formatés pour schema.org
 */
export function getSchemaAuthors(prioritizedData, siteConfig) {
  const authors = [];
  let globalData = null;
  
  if (typeof window !== 'undefined' && window.docusaurus) {
    globalData = window.docusaurus.globalData;
  }

  // Récupérer tous les auteurs si c'est un tableau
  const authorKeys = prioritizedData?.frontMatter?.authors || [];
  
  if (Array.isArray(authorKeys) && authorKeys.length > 0) {
    authorKeys.forEach(authorKey => {
      const authorData = getAuthorFromDocusaurus(authorKey, globalData);
      if (authorData) {
        authors.push({
          '@type': 'Person',
          name: normalizeAuthorName(authorData.name),
          url: authorData.url || authorData.github || siteConfig.url,
          description: authorData.title || authorData.bio || 'Contributeur',
          image: authorData.imageUrl?.startsWith('http') 
            ? authorData.imageUrl 
            : `${siteConfig.url}${authorData.imageUrl || '/img/docusaurus-social-card.jpg'}`,
          ...(authorData.github && { sameAs: [authorData.github] })
        });
      }
    });
  }
  
  // Si aucun auteur trouvé, utiliser l'auteur principal
  if (authors.length === 0) {
    const primaryAuthor = getSchemaAuthorObject(prioritizedData, siteConfig);
    if (primaryAuthor) {
      authors.push(primaryAuthor);
    }
  }
  
  return authors;
}

/* ============================================================================
 * SECTION 3 : UTILITAIRES COMMUNS
 * ============================================================================ */

/**
 * Valide qu'un objet auteur a les propriétés minimales requises
 * @param {Object} author - Objet auteur à valider
 * @returns {boolean} True si l'auteur est valide
 */
export function isValidAuthor(author) {
  return author && 
         typeof author === 'object' && 
         author.name && 
         typeof author.name === 'string' && 
         author.name.trim().length > 0;
}

/**
 * Formate le nom d'auteur pour l'affichage
 * @param {Object} author - Objet auteur
 * @returns {string} Nom formaté pour l'affichage
 */
export function formatAuthorDisplayName(author) {
  if (!isValidAuthor(author)) return 'Auteur inconnu';
  
  if (author.title) {
    return `${author.name} - ${author.title}`;
  }
  
  return author.name;
}
