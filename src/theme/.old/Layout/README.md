# Layout - Wrapper global avec SEO intégré

![Docusaurus](https://img.shields.io/badge/Docusaurus-Theme-blue)
![React](https://img.shields.io/badge/React-Component-61DAFB)
![SEO](https://img.shields.io/badge/SEO-Optimized-green)

> **Composant thématique fondamental** qui encapsule toutes les pages du site avec le système SEO avancé intégré. Point d'entrée global pour l'optimisation SEO et les métadonnées.

## 🎯 Vue d'ensemble

Ce composant est le **wrapper global** de l'application qui s'applique à **toutes les pages** du site Docusaurus. Il ajoute automatiquement le composant SEO avancé avant le rendu du layout original, garantissant une optimisation SEO cohérente sur l'ensemble du site.

### ✨ Fonctionnalités

- 🌍 **SEO global automatique** sur toutes les pages
- 📊 **Panel de debug SEO** en développement
- 🎯 **Métadonnées intelligentes** selon le type de page
- ⚡ **Performance optimisée** avec rendu conditionnel
- 🔍 **Schema.org automatique** pour toutes les pages

## 🛠️ Architecture technique

### Structure du composant

```
Layout/
├── index.js          # Wrapper personnalisé (ce fichier)
└── README.md         # Documentation
```

### Swizzling Docusaurus

Ce composant utilise le **swizzling** de Docusaurus au niveau le plus élevé :

```javascript
// Importation du layout original
import Layout from '@theme-original/Layout';
// Importation du composant SEO personnalisé
import Seo from '@site/src/components/Seo';

// Wrapper qui ajoute SEO à toutes les pages
export default function LayoutWrapper(props) {
  return (
    <>
      <Seo />                {/* SEO global ajouté */}
      <Layout {...props} />  {/* Layout original */}
    </>
  );
}
```

## 📝 Code détaillé

### Imports et dépendances

```javascript
import React from 'react';
import Layout from '@theme-original/Layout';
import Seo from '@site/src/components/Seo';
```

**Dépendances :**
- `@theme-original/Layout` : Layout Docusaurus original
- `@site/src/components/Seo` : Système SEO avancé personnalisé
- `React` : Framework JavaScript

### Logique principale

```javascript
export default function LayoutWrapper(props) {
  return (
    <>
      {/* 🎯 SEO s'applique à TOUTES les pages */}
      <Seo />
      
      {/* 🏗️ Layout original de Docusaurus */}
      <Layout {...props} />
    </>
  );
}
```

**Ordre d'exécution :**
1. **Seo** s'exécute en premier → génère métadonnées et JSON-LD
2. **Layout** s'exécute ensuite → structure HTML de la page

## 🌍 Portée d'application

### Pages concernées

Ce wrapper s'applique automatiquement à **TOUTES** les pages :

- ✅ **Page d'accueil** : `/`
- ✅ **Articles de blog** : `/blog/mon-article`
- ✅ **Liste des articles** : `/blog`
- ✅ **Archives** : `/blog/tags/react`, `/blog/authors/docux`
- ✅ **Pages de documentation** : `/docs/*`
- ✅ **Pages personnalisées** : `/thanks`, `/repository`
- ✅ **Pages 404** : `/404.html`

### Types de contenu supportés

```javascript
// Le composant SEO détecte automatiquement :
{
  "homePage": "/",
  "blogPost": "/blog/article-slug",
  "blogListPage": "/blog",
  "blogTagPage": "/blog/tags/react",
  "blogAuthorPage": "/blog/authors/docux",
  "docsPage": "/docs/intro",
  "customPage": "/thanks"
}
```

## 🎯 Intégration SEO

### Données générées automatiquement

Pour chaque page, le composant SEO génère :

#### 1. Métadonnées HTML

```html
<head>
  <!-- Titre dynamique -->
  <title>Titre de la page - Docux Blog</title>
  
  <!-- Description SEO -->
  <meta name="description" content="Description optimisée automatiquement" />
  
  <!-- Mots-clés (si disponibles) -->
  <meta name="keywords" content="react, docusaurus, seo" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Titre de la page" />
  <meta property="og:description" content="Description..." />
  <meta property="og:image" content="https://site.com/img/featured.jpg" />
  <meta property="og:type" content="article" />
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Titre de la page" />
  <meta name="twitter:description" content="Description..." />
  
  <!-- Métadonnées techniques -->
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://site.com/page-actuelle" />
</head>
```

#### 2. Données structurées JSON-LD

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting", // ou WebSite, CollectionPage, etc.
  "headline": "Titre de l'article",
  "description": "Description de l'article",
  "author": {
    "@type": "Person",
    "name": "Docux"
  },
  "datePublished": "2025-08-29",
  "image": "https://site.com/img/featured.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Docux Blog"
  }
}
</script>
```

### Panel de debug (développement)

En mode développement, un panel SEO s'affiche :

```
🔍 SEO Panel Pro - Mode développement uniquement

📊 Score SEO Global: 85% (Bon)
├── Schema.org (40%): 100% ✅
├── FrontMatter (25%): 80% 🟡  
├── Content (20%): 75% 🟡
├── Technical (10%): 90% ✅
└── UX (5%): 85% ✅

[📋 Rapport] [💾 Export] [📎 URL] [🔍 Google Test]
```

## 🔧 Configuration et personnalisation

### 1. Configuration du site

Dans `docusaurus.config.js` :

```javascript
const config = {
  // URLs de base pour SEO
  url: 'https://votre-site.github.io',
  baseUrl: '/votre-repo/',
  
  // Informations SEO globales
  title: 'Mon Blog Docusaurus',
  tagline: 'Un blog extraordinaire avec Docusaurus',
  
  // Configuration SEO
  metadata: [
    {name: 'keywords', content: 'blog, docusaurus, react'},
    {name: 'author', content: 'Votre Nom'},
  ],
  
  // Images par défaut
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg', // Image OpenGraph par défaut
  }
};
```

### 2. Personnalisation par page

#### Articles de blog

```yaml
---
title: "Mon Article"
description: "Description SEO personnalisée"
image: /img/article-specific.jpg
keywords: [react, tutorial, avancé]
authors: [docux]
tags: [react, docusaurus]
---
```

#### Pages personnalisées

```jsx
// Dans src/pages/ma-page.jsx
import Seo from '@site/src/components/Seo';

export default function MaPage() {
  return (
    <>
      {/* SEO automatique via Layout */}
      <div>
        <h1>Ma Page Personnalisée</h1>
        <p>Contenu...</p>
      </div>
    </>
  );
}
```

### 3. Surcharge SEO ponctuelle

```jsx
// Si besoin de surcharger le SEO automatique
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

export default function PageSpeciale() {
  return (
    <Layout>
      <Head>
        {/* Métadonnées spécifiques qui surchargent l'automatique */}
        <title>Titre très spécial</title>
        <meta name="description" content="Description ultra-spécifique" />
      </Head>
      
      <div>Contenu de la page</div>
    </Layout>
  );
}
```



### Documentation Docusaurus

- [Layout Swizzling](https://docusaurus.io/docs/swizzling#wrapper-your-site-with-root)
- [Head Management](https://docusaurus.io/docs/seo#global-metadata)
- [Plugin Configuration](https://docusaurus.io/docs/configuration)

### Outils SEO

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org Validator](https://validator.schema.org/)

### Composants liés

- `/src/components/Seo/` : Système SEO principal
- `/src/components/SeoDebugPanel/` : Panel de debug et scoring
- `/src/theme/BlogPostPage/` : Pages d'articles
- `/src/theme/BlogPostItem/` : Contenu d'articles

---

**Développé par l'équipe Docux**  
*Foundation SEO pour tous les sites Docusaurus*
