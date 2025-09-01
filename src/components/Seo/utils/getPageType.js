import { detectPageType } from './detectPageType';

const schemaTypeMapping = {
  isHomePage: 'WebSite',
  isBlogPost: 'BlogPosting',
  isBlogListPage: 'CollectionPage',
  isSeriesPage: 'CollectionPage',
  isSpecificSeriesPage: 'CollectionPage',
  isThanksPage: 'WebPage',
  isRepositoryPage: 'CollectionPage',
  other: 'WebPage',
};

/**
 * Fonction de mapping type de page → Schema.org
 * Priorité :
 * 1. frontMatter.schemaType/schemaTypes
 * 2. Détection par URL/contexte (detectPageType.js)
 */
export function getPageType({ location, blogPostData, pageMetadata }) {
  // D'abord faire la détection contextuelle pour avoir les variables booléennes
  const detectedPageType = detectPageType(location.pathname, location.search);
  const booleanFlags = {
    isBlogPost: detectedPageType === 'isBlogPost',
    isBlogListPage: detectedPageType === 'isBlogListPage',
    isSeriesPage: detectedPageType === 'isSeriesPage',
    isSpecificSeriesPage: detectedPageType === 'isSpecificSeriesPage',
    isHomePage: detectedPageType === 'isHomePage',
    isThanksPage: detectedPageType === 'isThanksPage',
    isRepositoryPage: detectedPageType === 'isRepositoryPage'
  };

  // 1. Priorité au frontMatter
  const customSchemaTypes = blogPostData?.frontMatter?.schemaTypes || pageMetadata?.frontMatter?.schemaTypes;
  if (Array.isArray(customSchemaTypes) && customSchemaTypes.length > 0) {
    return { 
      type: customSchemaTypes[0], 
      category: `${customSchemaTypes[0]} (schémas multiples configurés)`,
      detectedType: 'custom',
      ...booleanFlags // Toujours inclure les flags booléens
    };
  }

  // 2. Fallback contextuel pour les pages spécifiques
  const schemaType = schemaTypeMapping[detectedPageType] || 'WebPage';
  
  return { 
    type: schemaType, 
    category: `${schemaType} (contexte)`,
    detectedType: detectedPageType,
    ...booleanFlags
  };
}