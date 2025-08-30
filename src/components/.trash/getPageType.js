import { detectPageType } from './detectPageType';

const schemaTypeMapping = {
  HomePage: 'WebSite',
  blogPostPage: 'BlogPosting',
  blogListPage: 'CollectionPage',
  seriesPage: 'CollectionPage',
  specificSeriesPage: 'CollectionPage',
  thanksPage: 'WebPage',
  repositoryPage: 'CollectionPage',
  other: 'WebPage',
};

/**
 * Fonction de mapping type de page → Schema.org
 * Priorité :
 * 1. frontMatter.schemaType/schemaTypes
 * 2. Détection par URL/contexte (detectPageType.js)
 */
export function getPageType({ location, blogPostData, pageMetadata }) {
  // 1. Priorité au frontMatter
  const customSchemaType = blogPostData?.frontMatter?.schemaType || pageMetadata?.frontMatter?.schemaType;
  const customSchemaTypes = blogPostData?.frontMatter?.schemaTypes || pageMetadata?.frontMatter?.schemaTypes;

  if (Array.isArray(customSchemaTypes) && customSchemaTypes.length > 0) {
    return { type: customSchemaTypes[0], category: `${customSchemaTypes[0]} (schémas multiples configurés)` };
  }
  if (customSchemaType) {
    return { type: customSchemaType, category: `${customSchemaType} (configuré)` };
  }

  // 2. Fallback contextuel
  const pageType = detectPageType(location.pathname, location.search);
  const schemaType = schemaTypeMapping[pageType] || 'WebPage';

  return { type: schemaType, category: `${schemaType} (contexte)` };
}