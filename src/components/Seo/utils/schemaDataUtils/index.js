/**
 * Export centralisé pour tous les utilitaires de données de sch  getSchemaImageUrl,
  getImageFormat,
  getSchemaImages,
  isValidImageUrl,
  optimizeImageUrl,
  getImageDimensions,
  createCompleteImageObject
} from '../seoImageUtils.js';
 * Ce fichier permet d'importer facilement tous les utilitaires depuis un seul endroit
 */

// ===== MÉTADONNÉES DE BASE =====
export {
  getSchemaTitle,
  getSchemaDescription,
  getSchemaName,
  getMainEntityOfPage,
  getBaseSchemaMetadata
} from './metadataUtils.js';

// ===== GESTION DES LANGUES =====
export {
  getSchemaLanguage,
  normalizeLanguageCode,
  getNormalizedSchemaLanguage,
  getSchemaLanguageData
} from './languageUtils.js';

// ===== GESTION DES DATES =====
export {
  getPublishedDate,
  getModifiedDate,
  formatSchemaDate,
  getArticleDateData,
  isRecentArticle,
  getDaysSincePublication,
  isValidSchemaDate
} from './dateUtils.js';

// ===== MOTS-CLÉS ET CLASSIFICATION =====
export {
  getSchemaKeywords,
  getSchemaKeywordsArray,
  getArticleSection,
  getArticleTags,
  getMainTopics,
  normalizeTag,
  filterValidKeywords,
  getClassificationData
} from './keywordUtils.js';

// ===== DONNÉES D'ORGANISATION =====
export {
  getPublisherData,
  getWebSiteData,
  getOrganizationData,
  getSiteAuthorData,
  getCompleteOrganizationData,
  validateOrganizationData
} from './organizationUtils.js';

// ===== PROPRIÉTÉS TECHARTICLE =====
export {
  getTechArticleProperties,
  normalizeDifficultyLevel,
  formatDuration,
  getTechnologies,
  getPrerequisites,
  getCompleteTechArticleData,
  validateTechArticleProperties
} from './techArticleUtils.js';

// ===== GESTION DES IMAGES =====
export {
  getSchemaImageObject,
  getSchemaImageUrl,
  getImageFormat,
  getSchemaImages,
  isValidImageUrl,
  optimizeImageUrl,
  getImageDimensions,
  createCompleteImageObject
} from './seoImageUtils.js';

// ===== GESTION DES URLS ET LIENS =====
export {
  getSchemaReferenceUrls,
  getSchemaSameAs,
  getSchemaNavigationUrls,
  getSchemaCitations,
  validateAllSchemaUrls
} from './urlUtils.js';

// ===== VALIDATION ET TYPES =====
export {
  validateCompleteSchema,
  generateSeoQualityReport,
  SCHEMA_TYPES,
  detectOptimalSchemaType
} from './validationUtils.js';

// ===== UTILITAIRES EXISTANTS (ré-exports) =====
// Ces imports proviennent des fichiers utilitaires déjà existants
// On les ré-exporte ici pour centraliser tous les imports

// Depuis authorUtils.js (déjà existant)
export {
  normalizeAuthorName,
  getPrimaryAuthor
} from '../authorUtils.js';

// Depuis urlNormalizer.js (déjà existant)
export {
  normalizeUrl,
  generateCanonicalId,
  generateCanonicalUrl,
  validateSchemaUrls,
  fixAllSchemaUrls
} from '../urlNormalizer.js';

// ========== NOUVELLES FONCTIONS AVEC DONNÉES PRIORISÉES ==========

// Dates avec données priorisées
export { 
  getSchemaPublishedDate,
  getSchemaModifiedDate,
  getSchemaArticleDateData
} from './dateUtils';

// Mots-clés avec données priorisées
export { 
  getSchemaKeywords,
  getSchemaArticleSection,
  getSchemaArticleTags
} from './keywordUtils';

// TechArticle avec données priorisées
export { 
  getSchemaTechArticleProperties,
  getSchemaTechnologies,
  getSchemaPrerequisites,
  getCompleteSchemaTechArticleData
} from './techArticleUtils';

// ===== UTILITAIRES DE COMMODITÉ =====

/**
 * Récupère toutes les données communes nécessaires pour générer n'importe quel schéma
 * @param {Object} params - Tous les paramètres nécessaires
 * @returns {Object} Données complètes pour la génération de schémas
 */
export function getAllSchemaData({
  blogPostData,
  pageMetadata,
  siteConfig,
  canonicalId,
  canonicalUrl,
  useBaseUrl
}) {
  return {
    // Métadonnées de base
    ...getBaseSchemaMetadata({ blogPostData, pageMetadata, siteConfig, canonicalId, canonicalUrl }),
    
    // Langue
    language: getSchemaLanguageData(blogPostData, pageMetadata, siteConfig),
    
    // Dates (si applicable - pour les articles)
    ...(blogPostData && {
      dates: getArticleDateData(blogPostData, pageMetadata)
    }),
    
    // Classification
    classification: getClassificationData(blogPostData, pageMetadata),
    
    // Images
    image: getSchemaImageObject(blogPostData, pageMetadata, siteConfig, useBaseUrl),
    images: getSchemaImages(blogPostData, pageMetadata, siteConfig, useBaseUrl),
    
    // Organisation
    organization: getCompleteOrganizationData(siteConfig, useBaseUrl),
    
    // Propriétés techniques (si applicable - pour TechArticle)
    ...(blogPostData?.frontMatter || pageMetadata?.frontMatter ? {
      techProperties: getCompleteTechArticleData(blogPostData, pageMetadata)
    } : {}),
    
    // URLs et liens
    referenceUrls: getSchemaReferenceUrls(blogPostData, pageMetadata, siteConfig),
    sameAs: getSchemaSameAs(blogPostData, pageMetadata, siteConfig),
    navigation: getSchemaNavigationUrls(blogPostData, pageMetadata, siteConfig),
    citations: getSchemaCitations(blogPostData, pageMetadata),
    
    // Auteur principal
    primaryAuthor: getPrimaryAuthor(blogPostData, pageMetadata, siteConfig)
  };
}

/**
 * Valide toutes les données de schéma
 * @param {Object} schemaData - Données de schéma à valider
 * @returns {Object} Résultat de validation complet
 */
export function validateAllSchemaData(schemaData) {
  const validations = {
    organization: validateOrganizationData(schemaData.organization),
    techProperties: validateTechArticleProperties(schemaData.techProperties || {}),
    urls: validateAllSchemaUrls(schemaData.referenceUrls || {})
  };
  
  const allErrors = Object.values(validations).flatMap(v => v.errors || []);
  const allWarnings = Object.values(validations).flatMap(v => v.warnings || []);
  
  const averageScore = Object.values(validations)
    .reduce((sum, v) => sum + (v.score || 0), 0) / Object.keys(validations).length;
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    score: Math.round(averageScore),
    validations,
    // Ajout de nouvelles métriques
    recommendedSchemaType: detectOptimalSchemaType(
      schemaData.blogPostData, 
      schemaData.pageMetadata
    )
  };
}
