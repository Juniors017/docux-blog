/**
 * Utilitaires pour la gestion des dates dans les schémas SEO
 * Gère l'extraction et formatage des dates de publication et modification
 */

/**
 * SECTION 1: Fonctions pour données brutes (compatibilité composant SEO)
 */

/**
 * Récupère la date de publication d'un article (VERSION DONNÉES BRUTES)
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {string} Date de publication au format ISO 8601
 */
export function getPublishedDate(blogPostData, pageMetadata = null) {
  return blogPostData?.metadata?.date ||     // 1. Date des métadonnées blog (priorité)
         blogPostData?.date ||               // 2. Date directe blog
         pageMetadata?.metadata?.date ||     // 3. Date des métadonnées page
         pageMetadata?.date ||               // 4. Date directe page
         new Date().toISOString();           // 5. Date actuelle (fallback)
}

/**
 * Récupère la date de dernière modification d'un article
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {string} Date de modification au format ISO 8601
 */
export function getModifiedDate(blogPostData, pageMetadata = null) {
  return blogPostData?.metadata?.lastUpdatedAt ||  // 1. Dernière mise à jour métadonnées blog
         blogPostData?.lastUpdatedAt ||            // 2. Dernière mise à jour directe blog
         pageMetadata?.metadata?.lastUpdatedAt ||  // 3. Dernière mise à jour métadonnées page
         pageMetadata?.lastUpdatedAt ||            // 4. Dernière mise à jour directe page
         blogPostData?.metadata?.date ||           // 5. Date de publication métadonnées blog
         blogPostData?.date ||                     // 6. Date de publication directe blog
         pageMetadata?.metadata?.date ||           // 7. Date de publication métadonnées page
         pageMetadata?.date ||                     // 8. Date de publication directe page
         new Date().toISOString();                 // 9. Date actuelle (fallback)
}

/**
 * Formate une date pour les schémas JSON-LD
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée ISO 8601
 */
export function formatSchemaDate(date) {
  if (!date) return new Date().toISOString();
  
  if (typeof date === 'string') {
    // Vérifier si c'est déjà au format ISO
    if (date.includes('T') && date.includes('Z')) {
      return date;
    }
    // Essayer de parser la date
    try {
      return new Date(date).toISOString();
    } catch (error) {
      console.warn('⚠️ Date invalide:', date);
      return new Date().toISOString();
    }
  }
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Récupère les données temporelles complètes pour un schéma d'article
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {Object} Données temporelles formatées
 */
export function getArticleDateData(blogPostData, pageMetadata = null) {
  const publishedDate = getPublishedDate(blogPostData, pageMetadata);
  const modifiedDate = getModifiedDate(blogPostData, pageMetadata);
  
  return {
    datePublished: formatSchemaDate(publishedDate),
    dateModified: formatSchemaDate(modifiedDate),
    // Propriétés additionnelles utiles
    isRecent: isRecentArticle(publishedDate),
    daysSincePublication: getDaysSincePublication(publishedDate),
    wasModified: publishedDate !== modifiedDate
  };
}

/**
 * Détermine si un article est récent (moins de 30 jours)
 * @param {string} publishedDate - Date de publication
 * @returns {boolean} True si l'article est récent
 */
export function isRecentArticle(publishedDate) {
  if (!publishedDate) return false;
  
  try {
    const pubDate = new Date(publishedDate);
    const now = new Date();
    const diffInDays = (now - pubDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 30;
  } catch {
    return false;
  }
}

/**
 * Calcule le nombre de jours depuis la publication
 * @param {string} publishedDate - Date de publication
 * @returns {number} Nombre de jours depuis la publication
 */
export function getDaysSincePublication(publishedDate) {
  if (!publishedDate) return 0;
  
  try {
    const pubDate = new Date(publishedDate);
    const now = new Date();
    return Math.floor((now - pubDate) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Valide qu'une date est correcte pour les schémas
 * @param {string} date - Date à valider
 * @returns {boolean} True si la date est valide
 */
export function isValidSchemaDate(date) {
  if (!date || typeof date !== 'string') return false;
  
  try {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate.getTime() > 0;
  } catch {
    return false;
  }
}

/**
 * SECTION 2: Fonctions pour données priorisées (usage utilitaires schémas)
 */

/**
 * Récupère la date de publication depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {string} Date de publication au format ISO 8601
 */
export function getSchemaPublishedDate(prioritizedData) {
  return prioritizedData?.metadata?.date ||
         prioritizedData?.date ||
         prioritizedData?.frontMatter?.date ||
         new Date().toISOString();
}

/**
 * Récupère la date de modification depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {string} Date de modification au format ISO 8601
 */
export function getSchemaModifiedDate(prioritizedData) {
  return prioritizedData?.metadata?.lastUpdatedAt ||
         prioritizedData?.lastUpdatedAt ||
         prioritizedData?.frontMatter?.lastUpdatedAt ||
         prioritizedData?.metadata?.date ||
         prioritizedData?.date ||
         prioritizedData?.frontMatter?.date ||
         new Date().toISOString();
}

/**
 * Récupère les données temporelles complètes depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Object} Données temporelles formatées pour schémas
 */
export function getSchemaArticleDateData(prioritizedData) {
  const publishedDate = getSchemaPublishedDate(prioritizedData);
  const modifiedDate = getSchemaModifiedDate(prioritizedData);
  
  return {
    datePublished: formatSchemaDate(publishedDate),
    dateModified: formatSchemaDate(modifiedDate),
    isRecent: isRecentArticle(publishedDate),
    daysSincePublication: getDaysSincePublication(publishedDate),
    wasModified: publishedDate !== modifiedDate
  };
}
