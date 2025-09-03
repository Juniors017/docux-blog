/**
 * Utilitaires pour les données d'organisation et d'éditeur dans les schémas SEO
 * Gère la génération des structures Organization, WebSite et Publisher
 */

/**
 * Récupère les données de l'éditeur/publisher pour les schémas d'articles
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Object} Structure Publisher pour schema.org
 */
export function getPublisherData(siteConfig, useBaseUrl) {
  return {
    '@type': 'Organization',
    name: siteConfig.title || 'Docux Blog',
    url: siteConfig.url || 'https://docux.fr',
    logo: {
      '@type': 'ImageObject',
      url: (siteConfig.url || 'https://docux.fr') + useBaseUrl('/img/docux.png'),
      width: 512,
      height: 512
    },
    description: siteConfig.tagline || 'Documentation et tutoriels Docusaurus',
    // Données de contact optionnelles
    ...(siteConfig.organizationSchema && {
      ...siteConfig.organizationSchema
    })
  };
}

/**
 * Récupère les données du site web pour la propriété isPartOf
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} Structure WebSite pour schema.org
 */
export function getWebSiteData(siteConfig) {
  return {
    '@type': 'WebSite',
    '@id': (siteConfig.url || 'https://docux.fr') + '/#website',
    name: siteConfig.title || 'Docux Blog',
    url: siteConfig.url || 'https://docux.fr',
    description: siteConfig.tagline || 'Documentation et tutoriels Docusaurus',
    inLanguage: siteConfig.i18n?.defaultLocale || 'fr-FR',
    // Données de recherche si disponibles
    ...(siteConfig.searchEnabled && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: (siteConfig.url || 'https://docux.fr') + '/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    })
  };
}

/**
 * Récupère les données complètes de l'organisation
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Object} Structure Organization complète
 */
export function getOrganizationData(siteConfig, useBaseUrl) {
  const baseUrl = siteConfig.url || 'https://docux.fr';
  
  return {
    '@type': 'Organization',
    '@id': baseUrl + '/#organization',
    name: siteConfig.title || 'Docux',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: baseUrl + useBaseUrl('/img/docux.png'),
      width: 512,
      height: 512,
      caption: `Logo ${siteConfig.title || 'Docux'}`
    },
    description: siteConfig.tagline || 'Documentation et tutoriels Docusaurus',
    foundingDate: siteConfig.foundingDate || '2024-01-01',
    
    // Réseaux sociaux si définis dans la config
    ...(siteConfig.socials && {
      sameAs: Object.values(siteConfig.socials).filter(Boolean)
    }),
    
    // Contact info si défini
    ...(siteConfig.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...siteConfig.contactPoint
      }
    })
  };
}

/**
 * Récupère les données de l'auteur principal du site
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Object} Structure Person pour l'auteur principal
 */
export function getSiteAuthorData(siteConfig, useBaseUrl) {
  const baseUrl = siteConfig.url || 'https://docux.fr';
  
  // Données par défaut si pas d'auteur défini
  const defaultAuthor = {
    '@type': 'Person',
    name: 'Équipe Docux',
    url: baseUrl,
    description: 'Équipe de développement et rédaction Docux',
    image: baseUrl + useBaseUrl('/img/docusaurus-social-card.jpg')
  };
  
  // Si un auteur principal est défini dans la config
  if (siteConfig.author) {
    return {
      '@type': 'Person',
      name: siteConfig.author.name || 'Équipe Docux',
      url: siteConfig.author.url || baseUrl,
      description: siteConfig.author.description || 'Créateur de contenu Docux',
      image: siteConfig.author.image 
        ? (siteConfig.author.image.startsWith('http') 
           ? siteConfig.author.image 
           : baseUrl + useBaseUrl(siteConfig.author.image))
        : baseUrl + useBaseUrl('/img/docusaurus-social-card.jpg'),
      
      // Données supplémentaires si disponibles
      ...(siteConfig.author.jobTitle && { jobTitle: siteConfig.author.jobTitle }),
      ...(siteConfig.author.worksFor && { worksFor: siteConfig.author.worksFor }),
      ...(siteConfig.author.sameAs && { sameAs: siteConfig.author.sameAs })
    };
  }
  
  return defaultAuthor;
}

/**
 * Récupère toutes les données d'organisation pour un schéma
 * @param {Object} siteConfig - Configuration Docusaurus
 * @param {Function} useBaseUrl - Hook Docusaurus pour les URLs de base
 * @returns {Object} Données d'organisation complètes
 */
export function getCompleteOrganizationData(siteConfig, useBaseUrl) {
  return {
    publisher: getPublisherData(siteConfig, useBaseUrl),
    website: getWebSiteData(siteConfig),
    organization: getOrganizationData(siteConfig, useBaseUrl),
    siteAuthor: getSiteAuthorData(siteConfig, useBaseUrl)
  };
}

/**
 * Valide les données d'organisation
 * @param {Object} organizationData - Données d'organisation à valider
 * @returns {Object} Résultat de validation
 */
export function validateOrganizationData(organizationData) {
  const errors = [];
  const warnings = [];
  
  if (!organizationData?.publisher?.name) {
    errors.push('Nom du publisher manquant');
  }
  
  if (!organizationData?.publisher?.url) {
    errors.push('URL du publisher manquante');
  }
  
  if (!organizationData?.publisher?.logo?.url) {
    warnings.push('Logo du publisher manquant');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 5))
  };
}
