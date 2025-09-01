/**
 * Crée un objet BreadcrumbList Schema.org optimisé pour Google
 * 
 * @param {Array} items - Tableau d'objets { name, url } représentant chaque niveau du fil d'Ariane
 * @param {string} listName - Nom global du fil d'Ariane (pour la propriété "name")
 * @returns {Object} Objet JSON-LD BreadcrumbList compatible Google/Schema.org
 */
export function createOptimizedBreadcrumb(items, listName) {
  return {
    '@type': 'BreadcrumbList',
    name: listName,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1, // Position du niveau dans le fil d'Ariane (1-based)
      name: item.name,
      item: {
        '@type': 'WebPage',
        '@id': item.url.toLowerCase(), // URL normalisée en minuscules
        name: item.name,
        url: item.url.toLowerCase()
      }
    }))
  };
}

// Cache pour éviter les recalculs identiques
const breadcrumbCache = new Map();

/**
 * Génère dynamiquement un objet BreadcrumbList optimisé pour Docusaurus
 * 
 * - Utilise la configuration du site (siteConfig) pour le nom et l'URL racine
 * - Normalise le chemin courant en retirant le baseUrl (si défini)
 * - Découpe le chemin en segments pour chaque niveau du fil d'Ariane
 * - Personnalise le nom de chaque segment selon les sections connues ou dynamiques
 * - Crée le nom global du fil d'Ariane en fonction du titre de la page
 * 
 * @param {string} pathname - Chemin de la page courante (ex: "/blog/article-slug")
 * @param {string} pageTitle - Titre affiché de la page courante
 * @param {Object} siteConfig - Configuration Docusaurus (doit contenir title, url, et baseUrl)
 * @returns {Object} Objet JSON-LD BreadcrumbList optimisé
 */
export function generateGenericBreadcrumb(pathname, pageTitle, siteConfig) {
  // Clé de cache basée sur les paramètres
  const cacheKey = `${pathname}|${pageTitle}|${siteConfig.url}`;
  
  // Vérifier le cache
  if (breadcrumbCache.has(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🍞 💾 Breadcrumb récupéré du cache:', { pathname, pageTitle });
    }
    return breadcrumbCache.get(cacheKey);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🍞 🔄 generateGenericBreadcrumb appelée (calcul):', {
      pathname,
      pageTitle,
      siteConfigUrl: siteConfig.url,
      siteConfigTitle: siteConfig.title,
      baseUrl: siteConfig.baseUrl
    });
  }

  const items = [];

  // 1. Ajout de la racine du site comme premier niveau du fil d'Ariane
  items.push({
    name: siteConfig.title, // Nom du site
    url: siteConfig.url     // URL racine du site
  });

  // 2. Normalisation du chemin : retire le baseUrl du début si présent
  const baseUrl = siteConfig.baseUrl || '/';
  let relativePath = pathname.startsWith(baseUrl)
    ? pathname.substring(baseUrl.length)
    : pathname;
  // Retire les slashs en début/fin et évite les segments vides
  relativePath = relativePath.replace(/^\/+|\/+$/g, '');

  // 3. Découpe le chemin en segments pour chaque niveau (ex: ["blog", "article-slug"])
  const pathSegments = relativePath.split('/').filter(Boolean);

  // 4. Construction de l'URL pour chaque niveau du fil d'Ariane
  let currentPath = siteConfig.url.replace(/\/+$/, ''); // Retire un slash final éventuel

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`; // Ajoute chaque segment au chemin courant

    const isLastSegment = index === pathSegments.length - 1;
    let segmentName = segment; // Nom par défaut du segment

    // 5. Personnalisation du nom pour les sections connues
    switch(segment) {
      case 'blog':        segmentName = 'Blog'; break;
      case 'docs':        segmentName = 'Docs'; break;
      case 'series':      segmentName = 'Séries d\'articles'; break;
      case 'repository':  segmentName = 'Repositories'; break;
      case 'thanks':      segmentName = 'Remerciements'; break;
      case 'tags':        segmentName = 'Tags'; break;
      case 'authors':     segmentName = 'Auteurs'; break;
      default:
        // Si le segment est le dernier et correspond à la page courante, utilise le titre de la page
        if (isLastSegment && pageTitle && pageTitle !== siteConfig.title) {
          segmentName = pageTitle.replace(` | ${siteConfig.title}`, '');
        } else {
          // Sinon, transforme le segment en nom lisible : tirets → espaces, première lettre en majuscule
          segmentName = segment.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
    }

    // 6. Ajoute le segment au fil d'Ariane
    // (Sauf si c'est la page courante ET qu'on affiche déjà le titre)
    if (!isLastSegment || !pageTitle || pageTitle === siteConfig.title) {
      items.push({
        name: segmentName,
        url: currentPath + '/' // Ajoute un slash final pour cohérence Docusaurus
      });
    }
  });

  // 7. Génère le nom global du fil d'Ariane pour Schema.org
  const listName = `Navigation - ${pageTitle ? pageTitle.replace(` | ${siteConfig.title}`, '') : 'Page'}`;

  // 8. Retourne l'objet BreadcrumbList final
  const breadcrumbResult = createOptimizedBreadcrumb(items, listName);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🍞 ✅ Breadcrumb généré et mis en cache:', {
      listName,
      itemsCount: items.length,
      items,
      cacheKey
    });
  }

  // Stocker en cache
  breadcrumbCache.set(cacheKey, breadcrumbResult);

  return breadcrumbResult;
}
