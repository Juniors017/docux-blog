/**
 * Utilitaires pour la gestion des mots-clés, tags et catégories dans les schémas SEO
 * Gère l'extraction et normalisation des métadonnées de classification
 */

/**
 * Récupère les mots-clés pour un schéma sous forme de chaîne
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {string} Mots-clés séparés par des virgules
 */
export function getSchemaKeywords(blogPostData, pageMetadata) {
  // Collecte tous les mots-clés possibles
  const keywordSources = [
    blogPostData?.frontMatter?.keywords,
    blogPostData?.frontMatter?.tags,
    pageMetadata?.frontMatter?.keywords,
    pageMetadata?.frontMatter?.tags
  ];
  
  // Fusion et déduplication
  const allKeywords = keywordSources
    .filter(Boolean)
    .flat()
    .filter(Boolean)
    .map(keyword => keyword.toString().trim())
    .filter(keyword => keyword.length > 0);
  
  // Déduplication (insensible à la casse)
  const uniqueKeywords = [...new Set(
    allKeywords.map(keyword => keyword.toLowerCase())
  )].map(lowercaseKeyword => 
    allKeywords.find(originalKeyword => 
      originalKeyword.toLowerCase() === lowercaseKeyword
    )
  );
  
  return uniqueKeywords.length > 0 
    ? uniqueKeywords.join(', ')
    : 'docusaurus, documentation, tutoriel'; // Fallback
}

/**
 * Récupère les mots-clés sous forme de tableau
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {Array<string>} Tableau de mots-clés uniques
 */
export function getSchemaKeywordsArray(blogPostData, pageMetadata) {
  const keywordsString = getSchemaKeywords(blogPostData, pageMetadata);
  return keywordsString.split(', ').filter(Boolean);
}

/**
 * Récupère la section/catégorie de l'article
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {string} Section de l'article
 */
export function getArticleSection(blogPostData, pageMetadata) {
  return blogPostData?.frontMatter?.category || 
         pageMetadata?.frontMatter?.category || 
         blogPostData?.frontMatter?.section ||
         pageMetadata?.frontMatter?.section ||
         'Tutoriels'; // Fallback
}

/**
 * Récupère tous les tags d'un article (pour Open Graph)
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {Array<string>} Tableau de tous les tags
 */
export function getArticleTags(blogPostData, pageMetadata) {
  const tagSources = [
    blogPostData?.frontMatter?.keywords || [],
    blogPostData?.frontMatter?.tags || [],
    pageMetadata?.frontMatter?.keywords || [],
    pageMetadata?.frontMatter?.tags || []
  ];
  
  return [...new Set(
    tagSources
      .flat()
      .filter(Boolean)
      .map(tag => tag.toString().trim())
      .filter(tag => tag.length > 0)
  )];
}

/**
 * Récupère les sujets principaux de l'article
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {Array<string>} Sujets principaux
 */
export function getMainTopics(blogPostData, pageMetadata) {
  const topics = [
    blogPostData?.frontMatter?.topics,
    pageMetadata?.frontMatter?.topics,
    blogPostData?.frontMatter?.subjects,
    pageMetadata?.frontMatter?.subjects
  ]
    .filter(Boolean)
    .flat()
    .filter(Boolean);
  
  return [...new Set(topics)];
}

/**
 * Normalise un tag ou mot-clé (supprime caractères spéciaux, normalise casse)
 * @param {string} tag - Tag à normaliser
 * @returns {string} Tag normalisé
 */
export function normalizeTag(tag) {
  if (!tag || typeof tag !== 'string') return '';
  
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Supprime caractères spéciaux sauf tirets
    .replace(/\s+/g, ' ')     // Normalise les espaces
    .trim();
}

/**
 * Filtre et valide les mots-clés selon des critères de qualité
 * @param {Array<string>} keywords - Mots-clés à filtrer
 * @returns {Array<string>} Mots-clés validés
 */
export function filterValidKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  
  return keywords
    .filter(keyword => keyword && typeof keyword === 'string')
    .map(keyword => keyword.trim())
    .filter(keyword => {
      // Critères de validation
      return keyword.length >= 2 &&           // Au moins 2 caractères
             keyword.length <= 50 &&          // Maximum 50 caractères
             !/^\d+$/.test(keyword) &&        // Pas que des chiffres
             /\w/.test(keyword);              // Contient au moins une lettre/chiffre
    })
    .slice(0, 20); // Maximum 20 mots-clés
}

/**
 * Récupère toutes les données de classification pour un schéma
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {Object} Données de classification complètes
 */
export function getClassificationData(blogPostData, pageMetadata) {
  const keywords = getSchemaKeywordsArray(blogPostData, pageMetadata);
  const tags = getArticleTags(blogPostData, pageMetadata);
  const topics = getMainTopics(blogPostData, pageMetadata);
  
  return {
    keywords: filterValidKeywords(keywords),
    keywordsString: getSchemaKeywords(blogPostData, pageMetadata),
    tags: filterValidKeywords(tags),
    topics: filterValidKeywords(topics),
    articleSection: getArticleSection(blogPostData, pageMetadata),
    primaryCategory: getArticleSection(blogPostData, pageMetadata),
    hasClassification: keywords.length > 0 || tags.length > 0
  };
}

/**
 * SECTION 2: Fonctions pour données priorisées (usage utilitaires schémas)
 */

/**
 * Récupère les mots-clés depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {string} Mots-clés formatés en chaîne
 */
export function getSchemaKeywords(prioritizedData) {
  const keywords = prioritizedData?.frontMatter?.keywords?.join(', ') || 
                  prioritizedData?.frontMatter?.tags?.join(', ') || 
                  'docusaurus, documentation, tutoriel';
  
  return keywords;
}

/**
 * Récupère la section d'article depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {string} Section de l'article
 */
export function getSchemaArticleSection(prioritizedData) {
  return prioritizedData?.frontMatter?.category || 'Tutoriels';
}

/**
 * Récupère les tags depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Array<string>} Tableau des tags
 */
export function getSchemaArticleTags(prioritizedData) {
  return [
    ...(prioritizedData?.frontMatter?.keywords || []),
    ...(prioritizedData?.frontMatter?.tags || [])
  ].filter(Boolean);
}
