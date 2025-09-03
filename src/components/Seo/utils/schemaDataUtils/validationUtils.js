/**
 * Utilitaires de validation et types pour les schémas SEO
 * Validation complète des données de schémas et détection des erreurs
 */

/**
 * Valide la structure complète d'un schéma JSON-LD
 * @param {Object} schema - Schéma à valider
 * @returns {Object} Résultat de validation détaillé
 */
export function validateCompleteSchema(schema) {
  const errors = [];
  const warnings = [];
  let score = 100;
  
  // Validation des propriétés obligatoires
  const requiredProps = ['@context', '@type', 'url', 'name'];
  requiredProps.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`Propriété obligatoire manquante: ${prop}`);
      score -= 20;
    }
  });
  
  // Validation du @context
  if (schema['@context'] !== 'https://schema.org') {
    warnings.push('Contexte schema.org non standard');
    score -= 5;
  }
  
  // Validation des URLs
  const urlProps = ['url', 'image', 'sameAs', 'mainEntityOfPage'];
  urlProps.forEach(prop => {
    if (schema[prop]) {
      const urls = Array.isArray(schema[prop]) ? schema[prop] : [schema[prop]];
      urls.forEach(url => {
        if (typeof url === 'string' && !isValidUrl(url)) {
          errors.push(`URL invalide pour ${prop}: ${url}`);
          score -= 10;
        } else if (typeof url === 'object' && url.url && !isValidUrl(url.url)) {
          errors.push(`URL invalide dans l'objet ${prop}: ${url.url}`);
          score -= 10;
        }
      });
    }
  });
  
  // Validation spécifique par type de schéma
  if (schema['@type'] === 'BlogPosting' || schema['@type'] === 'TechArticle') {
    validateArticleSchema(schema, errors, warnings);
  } else if (schema['@type'] === 'WebPage') {
    validateWebPageSchema(schema, errors, warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
    schemaType: schema['@type'],
    completeness: calculateCompleteness(schema)
  };
}

/**
 * Validation spécifique pour les schémas d'articles
 * @param {Object} schema - Schéma d'article
 * @param {Array} errors - Tableau des erreurs (modifié par référence)
 * @param {Array} warnings - Tableau des avertissements (modifié par référence)
 */
function validateArticleSchema(schema, errors, warnings) {
  // Propriétés recommandées pour les articles
  const recommendedProps = ['author', 'datePublished', 'headline', 'image'];
  recommendedProps.forEach(prop => {
    if (!schema[prop]) {
      warnings.push(`Propriété recommandée manquante pour article: ${prop}`);
    }
  });
  
  // Validation des dates
  if (schema.datePublished && !isValidDate(schema.datePublished)) {
    errors.push('Date de publication invalide');
  }
  
  if (schema.dateModified && !isValidDate(schema.dateModified)) {
    errors.push('Date de modification invalide');
  }
  
  // Validation de l'auteur
  if (schema.author && typeof schema.author === 'object') {
    if (!schema.author.name) {
      warnings.push('Nom de l\'auteur manquant');
    }
    if (schema.author.url && !isValidUrl(schema.author.url)) {
      errors.push('URL de l\'auteur invalide');
    }
  }
  
  // Validation TechArticle spécifique
  if (schema['@type'] === 'TechArticle') {
    if (!schema.proficiencyLevel) {
      warnings.push('Niveau de compétence manquant pour TechArticle');
    }
    if (!schema.programmingLanguage) {
      warnings.push('Langage de programmation manquant pour TechArticle');
    }
  }
}

/**
 * Validation spécifique pour les schémas WebPage
 * @param {Object} schema - Schéma WebPage
 * @param {Array} errors - Tableau des erreurs (modifié par référence)
 * @param {Array} warnings - Tableau des avertissements (modifié par référence)
 */
function validateWebPageSchema(schema, errors, warnings) {
  if (!schema.description) {
    warnings.push('Description manquante pour WebPage');
  }
  
  if (!schema.inLanguage) {
    warnings.push('Langue manquante pour WebPage');
  }
}

/**
 * Calcule le pourcentage de complétude d'un schéma
 * @param {Object} schema - Schéma à analyser
 * @returns {string} Pourcentage de complétude
 */
function calculateCompleteness(schema) {
  const allPossibleProps = [
    '@context', '@type', '@id', 'url', 'name', 'headline', 'description',
    'image', 'author', 'datePublished', 'dateModified', 'publisher',
    'mainEntityOfPage', 'keywords', 'inLanguage', 'articleSection',
    'isPartOf', 'sameAs'
  ];
  
  const presentProps = allPossibleProps.filter(prop => 
    schema.hasOwnProperty(prop) && 
    schema[prop] !== null && 
    schema[prop] !== undefined &&
    schema[prop] !== ''
  );
  
  return Math.round((presentProps.length / allPossibleProps.length) * 100) + '%';
}

/**
 * Valide qu'une URL est correcte
 * @param {string} url - URL à valider
 * @returns {boolean} True si l'URL est valide
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Valide qu'une date est au format ISO 8601
 * @param {string} date - Date à valider
 * @returns {boolean} True si la date est valide
 */
function isValidDate(date) {
  if (!date || typeof date !== 'string') return false;
  
  try {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && 
           date.includes('T') && 
           (date.includes('Z') || date.includes('+') || date.includes('-'));
  } catch {
    return false;
  }
}

/**
 * Génère un rapport de qualité SEO pour un schéma
 * @param {Object} schema - Schéma à analyser
 * @returns {Object} Rapport de qualité détaillé
 */
export function generateSeoQualityReport(schema) {
  const validation = validateCompleteSchema(schema);
  
  const report = {
    ...validation,
    recommendations: [],
    optimizations: []
  };
  
  // Recommandations basées sur le type de schéma
  if (schema['@type'] === 'TechArticle') {
    if (!schema.proficiencyLevel) {
      report.recommendations.push('Ajouter un niveau de difficulté');
    }
    if (!schema.timeRequired) {
      report.recommendations.push('Ajouter une estimation du temps requis');
    }
    if (!schema.tool) {
      report.recommendations.push('Lister les outils nécessaires');
    }
  }
  
  // Optimisations générales
  if (!schema.sameAs || schema.sameAs.length === 0) {
    report.optimizations.push('Ajouter des liens sameAs vers les réseaux sociaux');
  }
  
  if (!schema.keywords || schema.keywords.length < 3) {
    report.optimizations.push('Enrichir les mots-clés pour le SEO');
  }
  
  if (schema.description && schema.description.length < 120) {
    report.optimizations.push('Étendre la description (minimum 120 caractères)');
  }
  
  return report;
}

/**
 * Types de schémas supportés et leurs propriétés requises
 */
export const SCHEMA_TYPES = {
  'BlogPosting': {
    required: ['headline', 'author', 'datePublished'],
    recommended: ['image', 'dateModified', 'publisher', 'mainEntityOfPage']
  },
  'TechArticle': {
    required: ['headline', 'author', 'datePublished'],
    recommended: ['proficiencyLevel', 'programmingLanguage', 'timeRequired', 'tool']
  },
  'WebPage': {
    required: ['name', 'description'],
    recommended: ['image', 'inLanguage', 'isPartOf']
  },
  'BreadcrumbList': {
    required: ['itemListElement'],
    recommended: []
  }
};

/**
 * Détecte le meilleur type de schéma selon le contenu
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {string} Type de schéma recommandé
 */
export function detectOptimalSchemaType(blogPostData, pageMetadata) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  
  // Si des propriétés techniques sont présentes
  if (frontMatter.programmingLanguage || 
      frontMatter.difficulty || 
      frontMatter.tool || 
      frontMatter.timeRequired) {
    return 'TechArticle';
  }
  
  // Si c'est clairement un article de blog
  if (blogPostData && (frontMatter.author || blogPostData.metadata?.date)) {
    return 'BlogPosting';
  }
  
  // Par défaut
  return 'WebPage';
}
