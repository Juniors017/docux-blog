/**
 * Utilitaires pour la gestion des langues dans les schémas SEO
 * Gère la détection et normalisation des codes de langue
 */

/**
 * Récupère la langue pour un schéma avec système de priorité
 * Correspond exactement au code que vous aviez sélectionné dans le composant SEO
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {string} Code de langue au format BCP 47 (ex: 'fr-FR', 'en-US')
 */
export function getSchemaLanguage(blogPostData, pageMetadata, siteConfig) {
  return blogPostData?.frontMatter?.inLanguage ||   // 1. Langue définie dans frontMatter blog
         pageMetadata?.frontMatter?.inLanguage ||   // 2. Langue définie dans frontMatter page
         blogPostData?.frontMatter?.lang ||         // 3. Propriété 'lang' alternative blog
         pageMetadata?.frontMatter?.lang ||         // 4. Propriété 'lang' alternative page
         siteConfig.i18n?.defaultLocale ||          // 5. Langue par défaut Docusaurus
         'fr-FR';                                   // 6. Fallback final
}

/**
 * Normalise un code de langue au format BCP 47
 * @param {string} languageCode - Code de langue à normaliser
 * @returns {string} Code de langue normalisé
 */
export function normalizeLanguageCode(languageCode) {
  if (!languageCode) return 'fr-FR';
  
  // Conversion des codes simples vers format BCP 47
  const languageMap = {
    'fr': 'fr-FR',
    'en': 'en-US',
    'es': 'es-ES',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
    'ko': 'ko-KR',
    'ru': 'ru-RU',
    'ar': 'ar-SA'
  };
  
  // Si le code est déjà au bon format, le retourner tel quel
  if (languageCode.includes('-')) {
    return languageCode;
  }
  
  // Sinon, utiliser la correspondance ou retourner tel quel
  return languageMap[languageCode.toLowerCase()] || languageCode;
}

/**
 * Récupère la langue normalisée pour un schéma
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {string} Code de langue normalisé au format BCP 47
 */
export function getNormalizedSchemaLanguage(blogPostData, pageMetadata, siteConfig) {
  const rawLanguage = getSchemaLanguage(blogPostData, pageMetadata, siteConfig);
  return normalizeLanguageCode(rawLanguage);
}

/**
 * Récupère les données de langue complètes pour les schémas internationaux
 * @param {Object} blogPostData - Données d'article de blog
 * @param {Object} pageMetadata - Métadonnées de page
 * @param {Object} siteConfig - Configuration Docusaurus
 * @returns {Object} Données de langue complètes
 */
export function getSchemaLanguageData(blogPostData, pageMetadata, siteConfig) {
  const language = getSchemaLanguage(blogPostData, pageMetadata, siteConfig);
  const normalizedLanguage = normalizeLanguageCode(language);
  
  // Extraction de la langue et du pays
  const [languageCode, countryCode] = normalizedLanguage.split('-');
  
  return {
    inLanguage: normalizedLanguage,
    language: languageCode,
    country: countryCode,
    raw: language
  };
}
