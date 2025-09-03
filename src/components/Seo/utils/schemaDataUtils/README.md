# 📚 SchemaDataUtils - Documentation Complète

Utilitaires pour la gestion des données structurées Schema.org dans le composant SEO de Docux Blog.

## 🎯 Architecture et Philosophie

Ce dossier contient tous les utilitaires nécessaires pour générer des schémas JSON-LD optimisés pour Google Rich Results. L'architecture suit le principe **"Une seule source de priorisation"** :

1. **`usePageMetadata`** → Priorise et structure les données **UNE SEULE FOIS**
2. **Utilitaires schemaDataUtils** → Formatent les données **déjà priorisées**
3. **Aucune duplication** de logique de priorité

## 📁 Structure des Fichiers

```
schemaDataUtils/
├── index.js                 # 📦 Export centralisé de tous les utilitaires
├── metadataUtils.js         # 🏷️ Gestion des titres, descriptions et noms
├── languageUtils.js         # 🌍 Gestion des langues et localisation
├── dateUtils.js             # 📅 Gestion des dates de publication et modification
├── keywordUtils.js          # 🏷️ Gestion des mots-clés, tags et catégories
├── organizationUtils.js     # 🏢 Données d'organisation et éditeur
├── techArticleUtils.js      # 🔧 Propriétés spécifiques aux articles techniques
├── urlUtils.js              # 🔗 Gestion des URLs et liens de référence
├── validationUtils.js       # ✅ Validation et qualité des schémas
└── README.md                # 📖 Cette documentation
```

## 🏗️ Pattern de Design Unifié

**TOUS les fichiers suivent la même architecture à 2 sections :**

### **Section 1 : Fonctions pour données brutes**
- Usage : Composant SEO principal
- Paramètres : `(blogPostData, pageMetadata, siteConfig, ...)`
- But : Compatibilité avec l'ancien système

### **Section 2 : Fonctions pour données priorisées** ⭐
- Usage : Utilitaires de schémas (recommandé)
- Paramètres : `(prioritizedData, siteConfig, ...)`
- But : Architecture moderne et optimisée

---

## 📄 Documentation par Fichier

### 🏷️ `metadataUtils.js` - Métadonnées de base

Gère l'extraction et le formatage des titres, descriptions et noms pour les schémas.

#### **Fonctions principales (données priorisées) :**

```javascript
import { getSchemaTitle, getSchemaDescription, getSchemaName } from './schemaDataUtils';

// Récupération du titre optimal
const title = getSchemaTitle(prioritizedData, siteConfig);
// Résultat : "Mon Article | Docux Blog"

// Récupération de la description optimale  
const description = getSchemaDescription(prioritizedData, siteConfig);
// Résultat : "Guide complet pour..."

// Nom pour schémas (peut différer du titre)
const name = getSchemaName(prioritizedData);
// Résultat : "Mon Article"
```

#### **Système de priorité :**
1. `prioritizedData.title` (déjà priorisé par usePageMetadata)
2. `prioritizedData.frontMatter.title`
3. `siteConfig.title` (fallback)

---

### 🌍 `languageUtils.js` - Langues et localisation

Gère la détection et normalisation des langues pour les propriétés `inLanguage` des schémas.

#### **Fonction principale :**

```javascript
import { getSchemaLanguage } from './schemaDataUtils';

const language = getSchemaLanguage(prioritizedData, siteConfig);
// Résultat : "fr-FR"
```

#### **Système de priorité :**
1. `prioritizedData.frontMatter.inLanguage`
2. `prioritizedData.frontMatter.lang`  
3. `siteConfig.i18n.defaultLocale`
4. `'fr-FR'` (fallback final)

#### **Normalisation automatique :**
- `"fr"` → `"fr-FR"`
- `"en"` → `"en-US"`
- `"es"` → `"es-ES"`

---

### 📅 `dateUtils.js` - Dates de publication et modification

Gère l'extraction et formatage des dates pour les schémas d'articles.

#### **Fonctions principales (données priorisées) :**

```javascript
import { 
  getSchemaPublishedDate, 
  getSchemaModifiedDate, 
  getSchemaArticleDateData 
} from './schemaDataUtils';

// Date de publication
const publishedDate = getSchemaPublishedDate(prioritizedData);
// Résultat : "2025-01-15T10:30:00.000Z"

// Date de modification
const modifiedDate = getSchemaModifiedDate(prioritizedData);
// Résultat : "2025-01-16T14:20:00.000Z"

// Données complètes avec métadonnées
const dateData = getSchemaArticleDateData(prioritizedData);
// Résultat : 
// {
//   datePublished: "2025-01-15T10:30:00.000Z",
//   dateModified: "2025-01-16T14:20:00.000Z", 
//   isRecent: true,
//   daysSincePublication: 2,
//   wasModified: true
// }
```

#### **Système de priorité :**
1. `prioritizedData.metadata.date`
2. `prioritizedData.date`
3. `prioritizedData.frontMatter.date`
4. `new Date().toISOString()` (fallback)

#### **Fonctions utilitaires :**
- `formatSchemaDate(date)` - Formatage ISO 8601
- `isRecentArticle(date)` - Vérifie si < 30 jours
- `getDaysSincePublication(date)` - Calcule les jours écoulés
- `isValidSchemaDate(date)` - Validation de format

---

### 🏷️ `keywordUtils.js` - Mots-clés et catégorisation

Gère l'extraction et formatage des mots-clés, tags et catégories d'articles.

#### **Fonctions principales (données priorisées) :**

```javascript
import { 
  getSchemaKeywords, 
  getSchemaArticleSection, 
  getSchemaArticleTags 
} from './schemaDataUtils';

// Mots-clés formatés en chaîne
const keywords = getSchemaKeywords(prioritizedData);
// Résultat : "react, docusaurus, seo, json-ld"

// Section/catégorie de l'article
const section = getSchemaArticleSection(prioritizedData);
// Résultat : "Tutoriels"

// Tags sous forme de tableau
const tags = getSchemaArticleTags(prioritizedData);
// Résultat : ["react", "docusaurus", "seo"]
```

#### **Sources de données :**
- `prioritizedData.frontMatter.keywords`
- `prioritizedData.frontMatter.tags`
- `prioritizedData.frontMatter.category`

#### **Fonctions utilitaires (données brutes) :**
- `normalizeKeywords(keywords)` - Normalise et déduplique
- `validateKeywords(keywords)` - Validation des mots-clés
- `generateKeywordSuggestions(content)` - Suggestions automatiques

---

### 🏢 `organizationUtils.js` - Données d'organisation

Gère les données de l'organisation/éditeur pour les propriétés `publisher` et `isPartOf` des schémas.

#### **Fonctions principales :**

```javascript
import { getPublisherData, getWebSiteData } from './schemaDataUtils';

// Données de l'éditeur
const publisher = getPublisherData(siteConfig, useBaseUrl);
// Résultat :
// {
//   '@type': 'Organization',
//   name: 'Docux Blog',
//   url: 'https://docux.fr',
//   logo: {
//     '@type': 'ImageObject',
//     url: 'https://docux.fr/img/docux.png'
//   }
// }

// Données du site web
const website = getWebSiteData(siteConfig);
// Résultat :
// {
//   '@type': 'WebSite', 
//   name: 'Docux Blog',
//   url: 'https://docux.fr'
// }
```

#### **Sources de données :**
- `siteConfig.title` - Nom de l'organisation
- `siteConfig.url` - URL du site
- `siteConfig.favicon` ou `/img/docux.png` - Logo

---

### 🔧 `techArticleUtils.js` - Articles techniques

Gère les propriétés spécifiques aux schémas `TechArticle` selon schema.org.

#### **Fonctions principales (données priorisées) :**

```javascript
import { 
  getSchemaTechArticleProperties,
  getSchemaTechnologies,
  getSchemaPrerequisites,
  getCompleteSchemaTechArticleData
} from './schemaDataUtils';

// Propriétés TechArticle complètes
const techProps = getSchemaTechArticleProperties(prioritizedData);
// Résultat :
// {
//   proficiencyLevel: 'Beginner',
//   programmingLanguage: ['JavaScript', 'React'],
//   timeRequired: 'PT30M',
//   tool: [
//     { '@type': 'HowToTool', name: 'VS Code' },
//     { '@type': 'HowToTool', name: 'Node.js' }
//   ],
//   estimatedCost: {
//     '@type': 'MonetaryAmount',
//     currency: 'EUR',
//     value: 0
//   }
// }

// Technologies utilisées
const technologies = getSchemaTechnologies(prioritizedData);
// Résultat : ['JavaScript', 'React', 'Docusaurus']

// Prérequis
const prerequisites = getSchemaPrerequisites(prioritizedData);
// Résultat : ['Connaissances HTML/CSS de base', 'Node.js installé']
```

#### **Propriétés FrontMatter supportées :**

```yaml
---
difficulty: 'Beginner'              # ou proficiencyLevel
programmingLanguage: ['JavaScript', 'React']
framework: ['React', 'Docusaurus']
totalTime: '30 minutes'            # Converti en PT30M
tool: ['VS Code', 'Node.js']
supply: ['Ordinateur', 'Internet']
estimatedCost: 0
prerequisites: ['HTML/CSS', 'Node.js']
yield: 'Site web fonctionnel'
prepTime: '5 minutes'
performTime: '25 minutes'
---
```

#### **Normalisation automatique :**
- Niveaux de difficulté : `'facile'` → `'Beginner'`
- Durées : `'30 minutes'` → `'PT30M'` (format ISO 8601)
- Technologies : Dédoublonnage et normalisation

---

### 🔗 `urlUtils.js` - URLs et liens

Gère l'extraction des URLs de référence, liens externes et navigation.

#### **Fonctions principales :**

```javascript
import { 
  getSchemaReferenceUrls,
  getSchemaSameAs,
  getSchemaNavigationUrls
} from './schemaDataUtils';

// URLs de référence (repo, demo, docs)
const refUrls = getSchemaReferenceUrls(prioritizedData, siteConfig);
// Résultat :
// {
//   repositoryUrl: 'https://github.com/user/project',
//   demoUrl: 'https://demo.example.com',
//   documentationUrl: 'https://docs.example.com'
// }

// Réseaux sociaux et liens externes (sameAs)
const sameAs = getSchemaSameAs(prioritizedData, siteConfig);
// Résultat : [
//   'https://github.com/user/project',
//   'https://twitter.com/user',
//   'https://linkedin.com/in/user'
// ]

// Navigation (précédent/suivant)
const navigation = getSchemaNavigationUrls(prioritizedData);
// Résultat :
// {
//   previousUrl: '/blog/article-precedent',
//   nextUrl: '/blog/article-suivant'
// }
```

#### **Propriétés FrontMatter supportées :**

```yaml
---
repositoryUrl: 'https://github.com/user/repo'
demoUrl: 'https://demo.site.com'
documentationUrl: 'https://docs.site.com'
socialLinks:
  - 'https://twitter.com/user'
  - 'https://linkedin.com/in/user'
relatedArticles:
  - '/blog/article-1'
  - '/blog/article-2'
---
```

---

### ✅ `validationUtils.js` - Validation et qualité

Fonctions de validation et génération de rapports de qualité SEO.

#### **Fonctions principales :**

```javascript
import { 
  validateCompleteSchema,
  generateSeoQualityReport,
  detectOptimalSchemaType,
  SCHEMA_TYPES
} from './schemaDataUtils';

// Validation complète d'un schéma
const validation = validateCompleteSchema(schemaObject);
// Résultat :
// {
//   isValid: true,
//   errors: [],
//   warnings: ['Image dimensions not specified'],
//   score: 95
// }

// Rapport de qualité SEO
const report = generateSeoQualityReport(prioritizedData, finalSchemas);
// Résultat :
// {
//   score: 87,
//   details: {
//     title: { score: 95, issues: [] },
//     description: { score: 85, issues: ['Too short'] },
//     images: { score: 90, issues: [] },
//     schema: { score: 95, issues: [] }
//   },
//   recommendations: [
//     'Increase description length to 150-160 characters',
//     'Add image alt text for better accessibility'
//   ]
// }

// Détection automatique du type de schéma optimal
const optimalType = detectOptimalSchemaType(prioritizedData);
// Résultat : 'TechArticle' (au lieu de 'BlogPosting')
```

#### **Types de schémas supportés :**

```javascript
export const SCHEMA_TYPES = {
  BLOG_POSTING: 'BlogPosting',
  TECH_ARTICLE: 'TechArticle', 
  WEB_PAGE: 'WebPage',
  ARTICLE: 'Article',
  HOW_TO: 'HowTo',
  BREADCRUMB_LIST: 'BreadcrumbList'
};
```

---

## 🚀 Utilisation Pratique

### **Dans le composant SEO principal :**

```javascript
import { 
  getSchemaTitle,
  getSchemaDescription, 
  getSchemaImageUrl,
  getSchemaPrimaryAuthor,
  getSchemaLanguage,
  getSchemaPublishedDate,
  getSchemaKeywords,
  getSchemaTechArticleProperties
} from './utils/schemaDataUtils';

export default function Seo({ pageData, frontMatter }) {
  // 1. Priorisation centralisée
  const { pageMetadata } = usePageMetadata(pageData, frontMatter);
  
  // 2. Utilisation des utilitaires avec données priorisées
  const title = getSchemaTitle(pageMetadata, siteConfig);
  const description = getSchemaDescription(pageMetadata, siteConfig);
  const imageUrl = getSchemaImageUrl(pageMetadata, siteConfig, useBaseUrl);
  const author = getSchemaPrimaryAuthor(pageMetadata, siteConfig);
  const language = getSchemaLanguage(pageMetadata, siteConfig);
  const publishedDate = getSchemaPublishedDate(pageMetadata);
  const keywords = getSchemaKeywords(pageMetadata);
  
  // 3. Pour TechArticle
  const techProps = getSchemaTechArticleProperties(pageMetadata);
  
  // 4. Construction du schéma final
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: title,
    description: description,
    image: { '@type': 'ImageObject', url: imageUrl },
    author: author,
    inLanguage: language,
    datePublished: publishedDate,
    keywords: keywords,
    ...techProps
  };
}
```

### **Récupération groupée avec getAllSchemaData :**

```javascript
import { getAllSchemaData } from './utils/schemaDataUtils';

// Récupérer toutes les données d'un coup
const allData = getAllSchemaData({
  prioritizedData: pageMetadata,
  siteConfig,
  canonicalId,
  canonicalUrl,
  useBaseUrl
});

const schema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  ...allData.metadata,     // title, description, name
  ...allData.dates,        // datePublished, dateModified
  image: allData.image,    // ImageObject complet
  author: allData.author,  // Person object
  publisher: allData.organization.publisher,
  keywords: allData.keywords
};
```

---

## 🎯 Avantages de cette Architecture

### ✅ **Performance optimisée**
- **Calcul unique** de priorité dans `usePageMetadata`
- **Réutilisation** des données priorisées
- **Pas de duplication** de logique coûteuse

### ✅ **Maintenabilité excellente**
- **Une seule source de vérité** pour la priorisation
- **Fonctions spécialisées** et testables individuellement
- **Architecture modulaire** et extensible

### ✅ **Cohérence garantie**
- **Pattern uniforme** dans tous les fichiers
- **Signatures simples** et prévisibles
- **Logique centralisée** de fallback

### ✅ **Extensibilité facile**
- **Ajout simple** de nouveaux types de données
- **Compatibilité** avec l'ancien système
- **Tests unitaires** ciblés et efficaces

---

## 🧪 Tests et Debug

### **Tests unitaires simplifiés :**

```javascript
// Test d'un utilitaire
test('getSchemaTitle returns prioritized title', () => {
  const prioritizedData = { 
    title: 'Mon Titre Prioritaire',
    frontMatter: { title: 'Titre FrontMatter' }
  };
  
  const result = getSchemaTitle(prioritizedData, mockSiteConfig);
  expect(result).toBe('Mon Titre Prioritaire');
});
```

### **Debug en développement :**

Tous les utilitaires incluent des logs de debug automatiques :

```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('🎯 Schema title result:', title);
  console.log('📅 Schema dates:', { publishedDate, modifiedDate });
  console.log('🔧 Tech properties:', techProps);
}
```

---

## 📈 Migration depuis l'Ancien Système

### **Avant (logique dupliquée) :**
```javascript
// ❌ Dans le composant SEO
const title = blogPostData?.frontMatter?.title ||
             pageMetadata?.frontMatter?.title ||
             blogPostData?.metadata?.title ||
             siteConfig.title;

// ❌ Dans un utilitaire (duplication !)
const title = blogPostData?.frontMatter?.title ||
             pageMetadata?.frontMatter?.title ||
             'Default';
```
### **Maintenant (logique centralisée) :**
```javascript
// ✅ Une seule fois dans usePageMetadata
const { pageMetadata } = usePageMetadata(pageData, frontMatter);

// ✅ Partout ailleurs : données déjà priorisées
const title = getSchemaTitle(pageMetadata, siteConfig);
const description = getSchemaDescription(pageMetadata, siteConfig);
const keywords = getSchemaKeywords(pageMetadata);
```

---

## 🎁 Fonctions Bonus

### **Export centralisé :**
Toutes les fonctions sont disponibles via l'import centralisé :

```javascript
import { 
  // Métadonnées de base
  getSchemaTitle, getSchemaDescription, getSchemaName,
  
  // Dates et temps
  getSchemaPublishedDate, getSchemaModifiedDate, getSchemaArticleDateData,
  
  // Mots-clés et catégories  
  getSchemaKeywords, getSchemaArticleSection, getSchemaArticleTags,
  
  // Contenu technique
  getSchemaTechArticleProperties, getSchemaTechnologies, getSchemaPrerequisites,
  
  // Organisation et structure
  getPublisherData, getWebSiteData,
  
  // URLs et liens
  getSchemaReferenceUrls, get