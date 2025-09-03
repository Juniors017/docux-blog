/**
 * Utilitaires pour les propriétés spécifiques aux schémas TechArticle
 * Gère l'extraction des métadonnées techniques et pédagogiques
 */

/**
 * Récupère les propriétés spécifiques à TechArticle depuis le frontMatter
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {Object} Propriétés TechArticle formatées pour schema.org
 */
export function getTechArticleProperties(blogPostData, pageMetadata = null) {
  // Système de priorité pour le frontMatter
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  if (!frontMatter || Object.keys(frontMatter).length === 0) return {};
  
  const properties = {};
  
  // Niveau de difficulté/compétence
  if (frontMatter.difficulty || frontMatter.proficiencyLevel) {
    properties.proficiencyLevel = normalizeDifficultyLevel(
      frontMatter.difficulty || frontMatter.proficiencyLevel
    );
  }
  
  // Langages de programmation
  if (frontMatter.programmingLanguage) {
    properties.programmingLanguage = Array.isArray(frontMatter.programmingLanguage)
      ? frontMatter.programmingLanguage
      : [frontMatter.programmingLanguage];
  }
  
  // Temps requis
  if (frontMatter.totalTime || frontMatter.timeRequired) {
    properties.timeRequired = formatDuration(
      frontMatter.totalTime || frontMatter.timeRequired
    );
  }
  
  // Outils nécessaires
  if (frontMatter.tool || frontMatter.tools) {
    const tools = frontMatter.tool || frontMatter.tools;
    properties.tool = Array.isArray(tools) 
      ? tools.map(tool => ({ '@type': 'HowToTool', name: tool }))
      : [{ '@type': 'HowToTool', name: tools }];
  }
  
  // Matériel/fournitures nécessaires
  if (frontMatter.supply || frontMatter.supplies) {
    const supplies = frontMatter.supply || frontMatter.supplies;
    properties.supply = Array.isArray(supplies)
      ? supplies.map(item => ({ '@type': 'HowToSupply', name: item }))
      : [{ '@type': 'HowToSupply', name: supplies }];
  }
  
  // Coût estimé
  if (frontMatter.estimatedCost) {
    properties.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: frontMatter.currency || 'EUR',
      value: frontMatter.estimatedCost
    };
  }
  
  // Résultat attendu
  if (frontMatter.yield || frontMatter.expectedResult) {
    properties.yield = frontMatter.yield || frontMatter.expectedResult;
  }
  
  // Temps de préparation
  if (frontMatter.prepTime || frontMatter.preparationTime) {
    properties.prepTime = formatDuration(
      frontMatter.prepTime || frontMatter.preparationTime
    );
  }
  
  // Temps d'exécution
  if (frontMatter.performTime || frontMatter.executionTime) {
    properties.performTime = formatDuration(
      frontMatter.performTime || frontMatter.executionTime
    );
  }
  
  return properties;
}

/**
 * Normalise le niveau de difficulté selon les standards schema.org
 * @param {string} difficulty - Niveau de difficulté brut
 * @returns {string} Niveau normalisé
 */
export function normalizeDifficultyLevel(difficulty) {
  if (!difficulty) return 'Beginner';
  
  const difficultyMap = {
    // Français
    'débutant': 'Beginner',
    'facile': 'Beginner',
    'novice': 'Beginner',
    'intermédiaire': 'Intermediate',
    'moyen': 'Intermediate',
    'avancé': 'Advanced',
    'expert': 'Expert',
    'difficile': 'Advanced',
    
    // Anglais
    'beginner': 'Beginner',
    'easy': 'Beginner',
    'novice': 'Beginner',
    'intermediate': 'Intermediate',
    'medium': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert',
    'hard': 'Advanced',
    'difficult': 'Advanced',
    
    // Niveaux numériques
    '1': 'Beginner',
    '2': 'Intermediate',
    '3': 'Advanced',
    '4': 'Expert',
    '5': 'Expert'
  };
  
  const normalized = difficultyMap[difficulty.toLowerCase()] || difficulty;
  
  // Validation finale
  const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  return validLevels.includes(normalized) ? normalized : 'Beginner';
}

/**
 * Formate une durée pour schema.org (format ISO 8601)
 * @param {string|number} duration - Durée à formater
 * @returns {string} Durée au format ISO 8601 (PT...)
 */
export function formatDuration(duration) {
  if (!duration) return 'PT30M'; // 30 minutes par défaut
  
  // Si c'est déjà au format ISO 8601
  if (typeof duration === 'string' && duration.startsWith('PT')) {
    return duration;
  }
  
  // Si c'est un nombre (minutes)
  if (typeof duration === 'number') {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `PT${hours}H${minutes}M` : `PT${hours}H`;
    }
    return `PT${duration}M`;
  }
  
  // Si c'est une chaîne descriptive
  if (typeof duration === 'string') {
    const durationStr = duration.toLowerCase();
    
    // Extraction des heures et minutes
    const hoursMatch = durationStr.match(/(\d+)\s*h/);
    const minutesMatch = durationStr.match(/(\d+)\s*m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    if (hours > 0 || minutes > 0) {
      let result = 'PT';
      if (hours > 0) result += `${hours}H`;
      if (minutes > 0) result += `${minutes}M`;
      return result;
    }
    
    // Formats courants
    const durationPatterns = {
      '5 min': 'PT5M',
      '10 min': 'PT10M',
      '15 min': 'PT15M',
      '30 min': 'PT30M',
      '1 heure': 'PT1H',
      '2 heures': 'PT2H',
      'rapide': 'PT15M',
      'court': 'PT30M',
      'moyen': 'PT1H',
      'long': 'PT2H'
    };
    
    return durationPatterns[durationStr] || 'PT30M';
  }
  
  return 'PT30M';
}

/**
 * Récupère les technologies/frameworks mentionnés dans l'article
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {Array<string>} Liste des technologies
 */
export function getTechnologies(blogPostData, pageMetadata = null) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  if (!frontMatter) return [];
  
  const techSources = [
    frontMatter.technologies,
    frontMatter.frameworks,
    frontMatter.libraries,
    frontMatter.tools,
    frontMatter.stack
  ];
  
  return [...new Set(
    techSources
      .filter(Boolean)
      .flat()
      .filter(Boolean)
      .map(tech => tech.toString().trim())
  )];
}

/**
 * Récupère les prérequis techniques
 * @param {Object} blogPostData - Données d'article de blog (priorité haute)
 * @param {Object} pageMetadata - Métadonnées de page (priorité basse)
 * @returns {Array<string>} Liste des prérequis
 */
export function getPrerequisites(blogPostData, pageMetadata = null) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  if (!frontMatter) return [];
  
  const prereqSources = [
    frontMatter.prerequisites,
    frontMatter.requirements,
    frontMatter.prereq
  ];
  
  return prereqSources
    .filter(Boolean)
    .flat()
    .filter(Boolean)
    .map(req => req.toString().trim());
}

/**
 * Récupère toutes les données techniques pour un TechArticle
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @returns {Object} Données techniques complètes
 */
export function getCompleteTechArticleData(blogPostData, pageMetadata) {
  const frontMatter = blogPostData?.frontMatter || pageMetadata?.frontMatter || {};
  
  return {
    ...getTechArticleProperties(blogPostData, pageMetadata),
    technologies: getTechnologies(blogPostData, pageMetadata),
    prerequisites: getPrerequisites(blogPostData, pageMetadata),
    // Métadonnées enrichies
    isTutorial: frontMatter.type === 'tutorial' || frontMatter.tutorial === true,
    hasCode: frontMatter.hasCode !== false, // true par défaut pour TechArticle
    targetAudience: frontMatter.audience || frontMatter.targetAudience || 'Developers'
  };
}

/**
 * Valide les propriétés TechArticle
 * @param {Object} techProperties - Propriétés TechArticle à valider
 * @returns {Object} Résultat de validation
 */
export function validateTechArticleProperties(techProperties) {
  const warnings = [];
  let score = 100;
  
  if (!techProperties.proficiencyLevel) {
    warnings.push('Niveau de difficulté non spécifié');
    score -= 10;
  }
  
  if (!techProperties.programmingLanguage) {
    warnings.push('Langage de programmation non spécifié');
    score -= 15;
  }
  
  if (!techProperties.timeRequired) {
    warnings.push('Temps requis non spécifié');
    score -= 10;
  }
  
  if (!techProperties.tool && !techProperties.supply) {
    warnings.push('Outils ou matériel non spécifiés');
    score -= 10;
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    score: Math.max(0, score),
    completeness: (100 - warnings.length * 12.5) + '%'
  };
}

/**
 * SECTION 2: Fonctions pour données priorisées (usage utilitaires schémas)
 */

/**
 * Récupère les propriétés TechArticle depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Object} Propriétés TechArticle formatées
 */
export function getSchemaTechArticleProperties(prioritizedData) {
  const frontMatter = prioritizedData?.frontMatter || {};
  const properties = {};
  
  if (frontMatter.difficulty || frontMatter.proficiencyLevel) {
    properties.proficiencyLevel = normalizeDifficultyLevel(frontMatter.difficulty || frontMatter.proficiencyLevel);
  }
  
  if (frontMatter.programmingLanguage) {
    properties.programmingLanguage = Array.isArray(frontMatter.programmingLanguage)
      ? frontMatter.programmingLanguage
      : [frontMatter.programmingLanguage];
  }
  
  if (frontMatter.totalTime) {
    properties.timeRequired = formatDuration(frontMatter.totalTime);
  }
  
  if (frontMatter.tool) {
    properties.tool = Array.isArray(frontMatter.tool) 
      ? frontMatter.tool.map(tool => ({ '@type': 'HowToTool', name: tool }))
      : [{ '@type': 'HowToTool', name: frontMatter.tool }];
  }
  
  if (frontMatter.supply) {
    properties.supply = Array.isArray(frontMatter.supply)
      ? frontMatter.supply.map(item => ({ '@type': 'HowToSupply', name: item }))
      : [{ '@type': 'HowToSupply', name: frontMatter.supply }];
  }
  
  if (frontMatter.estimatedCost) {
    properties.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: frontMatter.estimatedCost
    };
  }
  
  if (frontMatter.yield) properties.yield = frontMatter.yield;
  if (frontMatter.prepTime) properties.prepTime = formatDuration(frontMatter.prepTime);
  if (frontMatter.performTime) properties.performTime = formatDuration(frontMatter.performTime);
  
  return properties;
}

/**
 * Récupère les technologies depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Array<string>} Liste des technologies
 */
export function getSchemaTechnologies(prioritizedData) {
  const frontMatter = prioritizedData?.frontMatter || {};
  const technologies = [
    ...(frontMatter.programmingLanguage ? (Array.isArray(frontMatter.programmingLanguage) ? frontMatter.programmingLanguage : [frontMatter.programmingLanguage]) : []),
    ...(frontMatter.framework ? (Array.isArray(frontMatter.framework) ? frontMatter.framework : [frontMatter.framework]) : []),
    ...(frontMatter.library ? (Array.isArray(frontMatter.library) ? frontMatter.library : [frontMatter.library]) : []),
    ...(frontMatter.technology ? (Array.isArray(frontMatter.technology) ? frontMatter.technology : [frontMatter.technology]) : [])
  ];
  
  return [...new Set(technologies)];
}

/**
 * Récupère les prérequis depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Array<string>} Liste des prérequis
 */
export function getSchemaPrerequisites(prioritizedData) {
  const frontMatter = prioritizedData?.frontMatter || {};
  return frontMatter.prerequisites ? 
    (Array.isArray(frontMatter.prerequisites) ? frontMatter.prerequisites : [frontMatter.prerequisites]) : 
    [];
}

/**
 * Récupère toutes les données TechArticle depuis les données priorisées
 * @param {Object} prioritizedData - Données déjà priorisées par usePageMetadata
 * @returns {Object} Données complètes pour TechArticle
 */
export function getCompleteSchemaTechArticleData(prioritizedData) {
  return {
    properties: getSchemaTechArticleProperties(prioritizedData),
    technologies: getSchemaTechnologies(prioritizedData),
    prerequisites: getSchemaPrerequisites(prioritizedData),
    audience: {
      '@type': 'Audience',
      audienceType: prioritizedData?.frontMatter?.audienceType || 'Developer'
    }
  };
}
