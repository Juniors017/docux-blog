/**
 * Tests pour les utilitaires de normalisation des URLs
 * 
 * Exécutez ces tests pour vérifier que la normalisation fonctionne correctement
 */

import { 
  normalizeUrl, 
  generateCanonicalId, 
  generateCanonicalUrl, 
  validateSchemaUrls, 
  fixAllSchemaUrls 
} from './urlNormalizer.js';

// Configuration de test similaire à Docusaurus
const testSiteConfig = {
  url: 'https://juniors017.github.io',
  baseUrl: '/docux-blog/',
  title: 'DOCUX'
};

console.log('🧪 Tests des Utilitaires de Normalisation des URLs\n');

// Test 1: Normalisation des URLs
console.log('1️⃣ Test normalizeUrl()');
const testCases = [
  {
    baseUrl: 'https://juniors017.github.io/',
    pathname: '/docux-blog/blog/article-slug',
    expected: 'https://juniors017.github.io/docux-blog/blog/article-slug'
  },
  {
    baseUrl: 'https://juniors017.github.io',
    pathname: '//docux-blog/blog/article-slug/',
    expected: 'https://juniors017.github.io/docux-blog/blog/article-slug'
  }
];

testCases.forEach((test, index) => {
  const result = normalizeUrl(test.baseUrl, test.pathname);
  const success = result === test.expected;
  console.log(`   Test ${index + 1}: ${success ? '✅' : '❌'}`);
  console.log(`     Input: ${test.baseUrl} + ${test.pathname}`);
  console.log(`     Expected: ${test.expected}`);
  console.log(`     Actual: ${result}\n`);
});

// Test 2: Génération des IDs canoniques
console.log('2️⃣ Test generateCanonicalId()');
const pathname = '/blog/welcome-genese-docux-blog';
const canonicalId = generateCanonicalId(testSiteConfig, pathname);
console.log(`   Pathname: ${pathname}`);
console.log(`   ID Canonique: ${canonicalId}`);
console.log(`   Sans slash final: ${!canonicalId.endsWith('/') ? '✅' : '❌'}\n`);

// Test 3: Génération des URLs canoniques
console.log('3️⃣ Test generateCanonicalUrl()');
const canonicalUrl = generateCanonicalUrl(testSiteConfig, pathname);
console.log(`   Pathname: ${pathname}`);
console.log(`   URL Canonique: ${canonicalUrl}`);
console.log(`   Avec slash final: ${canonicalUrl.endsWith('/') ? '✅' : '❌'}\n`);

// Test 4: Validation des schémas
console.log('4️⃣ Test validateSchemaUrls()');

// Schémas cohérents
const goodSchemas = [
  {
    '@type': 'BlogPosting',
    '@id': canonicalId,
    'url': canonicalUrl
  },
  {
    '@type': 'TechArticle',
    '@id': canonicalId,
    'url': canonicalUrl
  }
];

const goodValidation = validateSchemaUrls(goodSchemas);
console.log(`   Schémas cohérents: ${goodValidation.isValid ? '✅' : '❌'}`);
console.log(`   Summary: ${goodValidation.summary}\n`);

// Schémas incohérents
const badSchemas = [
  {
    '@type': 'BlogPosting',
    '@id': canonicalId,
    'url': canonicalUrl
  },
  {
    '@type': 'TechArticle',
    '@id': canonicalId + '-different',
    'url': canonicalUrl + 'different/'
  }
];

const badValidation = validateSchemaUrls(badSchemas);
console.log(`   Schémas incohérents: ${!badValidation.isValid ? '✅' : '❌'}`);
console.log(`   Erreurs détectées: ${badValidation.errors.length}`);
badValidation.errors.forEach(error => console.log(`     - ${error}`));
console.log('');

// Test 5: Correction automatique
console.log('5️⃣ Test fixAllSchemaUrls()');
const fixedSchemas = fixAllSchemaUrls(badSchemas, canonicalId, canonicalUrl);
const fixedValidation = validateSchemaUrls(fixedSchemas);
console.log(`   Correction automatique: ${fixedValidation.isValid ? '✅' : '❌'}`);
console.log(`   Summary après correction: ${fixedValidation.summary}\n`);

console.log('🎉 Tests terminés !');
console.log('Pour utiliser ces utilitaires dans le composant SEO, ils sont déjà intégrés automatiquement.');
