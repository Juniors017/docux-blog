/**
 * Utilitaires pour la normalisation des URLs et la cohérence des schémas JSON-LD
 * 
 * Résout les problèmes d'URLs incohérentes dans les schémas JSON-LD multiples
 * en garantissant des IDs et URLs identiques pour tous les schémas d'une même ressource.
 */

/**
 * Normalise les URLs pour éviter les doubles slashes et garantir la cohérence
 * @param {string} baseUrl - URL de base du site
 * @param {string} pathname - Chemin de la page
 * @returns {string} URL normalisée sans doubles slashes
 */
export function normalizeUrl(baseUrl, pathname) {
  if (!baseUrl || !pathname) {
    console.warn('normalizeUrl: baseUrl ou pathname manquant', { baseUrl, pathname });
    return baseUrl || pathname || '';
  }

  // Supprime les slashes multiples en fin d'URL de base
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  
  // Supprime les slashes multiples au début du pathname
  const cleanPathname = pathname.replace(/^\/+/, '');
  
  // Reconstruit l'URL proprement
  let normalizedUrl = `${cleanBaseUrl}/${cleanPathname}`;
  
  // Supprime les doubles slashes internes (sauf après le protocole)
  normalizedUrl = normalizedUrl.replace(/([^:]\/)\/+/g, '$1');
  
  return normalizedUrl;
}

/**
 * Génère un ID canonique pour les schémas JSON-LD
 * Les IDs de schémas ne doivent pas avoir de slash final
 * @param {object} siteConfig - Configuration Docusaurus
 * @param {string} pathname - Chemin de la page
 * @returns {string} ID canonique sans slash final
 */
export function generateCanonicalId(siteConfig, pathname) {
  const baseUrl = siteConfig?.url || '';
  const normalizedUrl = normalizeUrl(baseUrl, pathname);
  
  // Assure une URL sans slash final pour les IDs de schémas
  return normalizedUrl.replace(/\/$/, '');
}

/**
 * Génère une URL canonique publique
 * Les URLs publiques doivent avoir un slash final pour la cohérence
 * @param {object} siteConfig - Configuration Docusaurus
 * @param {string} pathname - Chemin de la page
 * @returns {string} URL canonique avec slash final
 */
export function generateCanonicalUrl(siteConfig, pathname) {
  const canonicalId = generateCanonicalId(siteConfig, pathname);
  
  // Ajoute un slash final pour les URLs publiques (sauf pour les fichiers)
  if (!pathname.match(/\.[a-z]+$/i)) {
    return `${canonicalId}/`;
  }
  
  return canonicalId;
}

/**
 * Valide la cohérence des URLs dans les schémas JSON-LD
 * @param {array} schemas - Liste des schémas JSON-LD
 * @returns {object} Résultat de validation avec erreurs détaillées
 */
export function validateSchemaUrls(schemas) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const urls = new Set();
  const mainEntityUrls = new Set();

  if (!Array.isArray(schemas) || schemas.length === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: ['Aucun schéma à valider'],
      summary: 'Aucun schéma JSON-LD présent'
    };
  }

  schemas.forEach((schema, index) => {
    if (!schema || typeof schema !== 'object') {
      errors.push(`Schéma ${index}: Structure invalide`);
      return;
    }

    // Vérifie les doubles slashes dans @id
    if (schema['@id']) {
      if (schema['@id'].includes('//') && !schema['@id'].startsWith('http')) {
        errors.push(`Schéma ${index} (@type: ${schema['@type']}): Double slash détecté dans @id: ${schema['@id']}`);
      }
      ids.add(schema['@id']);
    }

    // Vérifie les doubles slashes dans url
    if (schema.url) {
      if (schema.url.includes('//') && !schema.url.startsWith('http')) {
        errors.push(`Schéma ${index} (@type: ${schema['@type']}): Double slash détecté dans url: ${schema.url}`);
      }
      urls.add(schema.url);
    }

    // Vérifie les doubles slashes dans mainEntityOfPage
    if (schema.mainEntityOfPage) {
      const mainEntityUrl = typeof schema.mainEntityOfPage === 'string' 
        ? schema.mainEntityOfPage 
        : schema.mainEntityOfPage['@id'] || schema.mainEntityOfPage.url;
      
      if (mainEntityUrl) {
        if (mainEntityUrl.includes('//') && !mainEntityUrl.startsWith('http')) {
          errors.push(`Schéma ${index} (@type: ${schema['@type']}): Double slash détecté dans mainEntityOfPage: ${mainEntityUrl}`);
        }
        mainEntityUrls.add(mainEntityUrl);
      }
    }

    // Vérifie la cohérence entre @id et url pour le même schéma
    if (schema['@id'] && schema.url) {
      const idWithoutSlash = schema['@id'].replace(/\/$/, '');
      const urlWithoutSlash = schema.url.replace(/\/$/, '');
      
      if (idWithoutSlash !== urlWithoutSlash) {
        warnings.push(`Schéma ${index} (@type: ${schema['@type']}): Incohérence entre @id et url - @id: ${schema['@id']}, url: ${schema.url}`);
      }
    }
  });

  // Vérifie que tous les schémas pointent vers la même ressource de base
  // ✅ Nouvelle logique : accepter les fragments pour les schémas multiples
  if (ids.size > 1) {
    // Extraire les URLs de base (sans fragments) pour comparaison
    const baseIds = new Set();
    ids.forEach(id => {
      const baseId = id.split('#')[0]; // Supprimer le fragment s'il existe
      baseIds.add(baseId);
    });
    
    // Erreur seulement si les URLs de base sont différentes
    if (baseIds.size > 1) {
      errors.push(`Incohérence d'IDs de base détectée entre schémas multiples: ${Array.from(baseIds).join(', ')}`);
    } else {
      // Les schémas pointent vers la même ressource mais avec des fragments différents → OK
      console.log('✅ Schémas multiples détectés avec fragments différents (comportement normal):', Array.from(ids));
    }
  }

  if (urls.size > 1) {
    errors.push(`Incohérence d'URLs détectée entre schémas multiples: ${Array.from(urls).join(', ')}`);
  }

  if (mainEntityUrls.size > 1) {
    warnings.push(`Incohérence de mainEntityOfPage détectée: ${Array.from(mainEntityUrls).join(', ')}`);
  }

  // Génère un résumé de validation
  const summary = errors.length === 0 
    ? `✅ ${schemas.length} schéma(s) validé(s) - URLs cohérentes`
    : `❌ ${errors.length} erreur(s) détectée(s) sur ${schemas.length} schéma(s)`;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
    stats: {
      totalSchemas: schemas.length,
      uniqueIds: ids.size,
      uniqueUrls: urls.size,
      uniqueMainEntityUrls: mainEntityUrls.size
    }
  };
}

/**
 * Corrige automatiquement les URLs dans un schéma JSON-LD
 * @param {object} schema - Schéma JSON-LD à corriger
 * @param {string} canonicalId - ID canonique à utiliser
 * @param {string} canonicalUrl - URL canonique à utiliser
 * @returns {object} Schéma corrigé
 */
export function fixSchemaUrls(schema, canonicalId, canonicalUrl) {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const fixedSchema = { ...schema };

  // Corrige @id
  if (fixedSchema['@id']) {
    fixedSchema['@id'] = canonicalId;
  }

  // Corrige url
  if (fixedSchema.url) {
    fixedSchema.url = canonicalUrl;
  }

  // Corrige mainEntityOfPage
  if (fixedSchema.mainEntityOfPage) {
    if (typeof fixedSchema.mainEntityOfPage === 'string') {
      fixedSchema.mainEntityOfPage = canonicalUrl;
    } else if (typeof fixedSchema.mainEntityOfPage === 'object') {
      fixedSchema.mainEntityOfPage = {
        ...fixedSchema.mainEntityOfPage,
        '@id': canonicalUrl
      };
    }
  }

  return fixedSchema;
}

/**
 * Applique des corrections automatiques à tous les schémas
 * @param {array} schemas - Liste des schémas à corriger
 * @param {string} canonicalId - ID canonique de référence
 * @param {string} canonicalUrl - URL canonique de référence
 * @returns {array} Schémas corrigés
 */
export function fixAllSchemaUrls(schemas, canonicalId, canonicalUrl) {
  if (!Array.isArray(schemas)) {
    return schemas;
  }

  return schemas.map(schema => fixSchemaUrls(schema, canonicalId, canonicalUrl));
}

/**
 * Debug helper: affiche les URLs d'un schéma
 * @param {object} schema - Schéma à analyser
 * @returns {object} Informations d'URLs extraites
 */
export function extractSchemaUrls(schema) {
  if (!schema || typeof schema !== 'object') {
    return null;
  }

  return {
    type: schema['@type'],
    id: schema['@id'],
    url: schema.url,
    mainEntityOfPage: typeof schema.mainEntityOfPage === 'string' 
      ? schema.mainEntityOfPage 
      : schema.mainEntityOfPage?.['@id'] || schema.mainEntityOfPage?.url
  };
}
