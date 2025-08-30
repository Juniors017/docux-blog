/**
 * Détecte le type de page à partir du pathname et des paramètres de recherche.
 * Chaque valeur de retour est documentée ci-dessous.
 */

export function detectPageType(pathname, search) {
  // HomePage : page d'accueil principale du site
  if (pathname === '/') return 'HomePage';

  // blogPostPage : page d'article de blog individuel
  if (
    pathname.includes('/blog/') &&
    !pathname.endsWith('/blog/') &&
    !pathname.includes('/blog/tags/') &&
    !pathname.includes('/blog/authors/')
  ) return 'blogPostPage';

  // blogListPage : page d’index du blog, de tags ou d’auteurs
  if (
    pathname.endsWith('/blog/') ||
    pathname.includes('/blog/tags/') ||
    pathname.includes('/blog/authors/')
  ) return 'blogListPage';

  // specificSeriesPage : page d’une série spécifique (avec paramètre ?name=)
  if (pathname.includes('/series/')) {
    if (search.includes('name=')) {
      // specificSeriesPage : page d'une série précise
      return 'specificSeriesPage';
    }
    // seriesPage : page de listing de séries
    return 'seriesPage';
  }

  // thanksPage : page de remerciements
  if (pathname.includes('/thanks/')) return 'thanksPage';

  // repositoryPage : page liée aux repositories ou aux projets
  if (pathname.includes('/repository/')) return 'repositoryPage';

  // other : fallback pour toutes les autres pages
  return 'other';
}