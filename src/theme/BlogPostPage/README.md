# BlogPostPage - Wrapper de page d'article de blog

![Docusaurus](https://img.shields.io/badge/Docusaurus-Theme-blue)
![React](https://img.shields.io/badge/React-Component-61DAFB)
![Swizzle](https://img.shields.io/badge/Swizzle-Wrapper-green)

> **Composant thématique personnalisé** qui encapsule la page complète d'article de blog de Docusaurus. Actuellement configuré comme wrapper transparent, prêt pour des extensions futures.

## 🎯 Vue d'ensemble

Ce composant est un **wrapper transparent** autour du composant `BlogPostPage` original de Docusaurus. Il conserve toutes les fonctionnalités originales tout en permettant l'ajout facile de fonctionnalités personnalisées dans le futur.

### ✨ État actuel

- 🔗 **Wrapper transparent** - Passe toutes les props au composant original
- 🎯 **Aucune modification** du comportement par défaut
- 🚀 **Prêt pour extensions** - Structure en place pour ajouts futurs
- ⚡ **Performance identique** au composant original

## 🛠️ Architecture technique

### Structure du composant

```
BlogPostPage/
├── index.js          # Wrapper personnalisé (ce fichier)
└── README.md         # Documentation
```

### Swizzling Docusaurus

Ce composant utilise le **swizzling** de Docusaurus en mode **wrapper** :

```javascript
// Importation du composant original
import BlogPostPage from '@theme-original/BlogPostPage';

// Wrapper transparent qui conserve le comportement original
export default function BlogPostPageWrapper(props) {
  return <BlogPostPage {...props} />;
}
```

## 📝 Code détaillé

### Imports et dépendances

```javascript
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
```

**Dépendances :**
- `@theme-original/BlogPostPage` : Composant Docusaurus original
- `React` : Framework JavaScript

### Logique actuelle

```javascript
export default function BlogPostPageWrapper(props) {
  // Actuellement : passage transparent des props
  return <BlogPostPage {...props} />;
}
```

**Comportement :**
1. Reçoit toutes les props de Docusaurus
2. Les transmet intégralement au composant original
3. Retourne le rendu du composant original

## 🔧 Utilisation et intégration

### 1. Déclenchement automatique

Ce composant s'active automatiquement pour :

- ✅ **Pages d'articles individuelles** : `/blog/mon-article`
- ✅ **Articles avec slug personnalisé** : `/blog/custom-slug`
- ✅ **Articles de séries** : `/blog/serie-partie-1`
- ❌ **Liste des articles** : `/blog` (utilise d'autres composants)
- ❌ **Archives** : `/blog/tags/*` ou `/blog/authors/*`

### 2. Props reçues

Le composant reçoit automatiquement de Docusaurus :

```javascript
props = {
  content: {
    metadata: {
      title: "Titre de l'article",
      date: "2025-08-29T00:00:00.000Z",
      authors: [{...}],
      tags: [{...}],
      frontMatter: {
        // Tous les champs du frontMatter
      }
    },
    contentTitle: "Titre de l'article",
    // ... autres métadonnées
  },
  sidebar: {
    // Configuration de la sidebar si applicable
  },
  toc: [
    // Table des matières générée automatiquement
  ]
}
```

### 3. Structure HTML générée

```html
<!-- Structure générée par BlogPostPage original -->
<main>
  <div class="container margin-vert--lg">
    <div class="row">
      <div class="col col--8 col--offset-2">
        <article>
          <!-- Header avec titre, date, auteurs -->
          <header>
            <h1>Titre de l'article</h1>
            <div>Métadonnées</div>
          </header>
          
          <!-- Contenu de l'article -->
          <div>
            <!-- SerieBanner (si applicable, via BlogPostItem) -->
            <!-- Contenu Markdown transformé en HTML -->
          </div>
          
          <!-- Footer avec tags, navigation -->
          <footer>
            <div>Tags</div>
            <nav>Article précédent/suivant</nav>
          </footer>
        </article>
      </div>
      
      <!-- Sidebar (TOC, etc.) -->
      <div class="col col--2">
        <!-- Table des matières -->
      </div>
    </div>
  </div>
</main>
```

## 🚀 Extensions possibles

### 1. Ajout de composants personnalisés

```javascript
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import RelatedPosts from '@site/src/components/RelatedPosts';
import ShareButtons from '@site/src/components/ShareButtons';

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <BlogPostPage {...props} />
      {/* Composants ajoutés après l'article */}
      <RelatedPosts metadata={props.content.metadata} />
      <ShareButtons 
        title={props.content.metadata.title}
        url={window.location.href}
      />
    </>
  );
}
```

### 2. Modification du layout

```javascript
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import CustomBreadcrumb from '@site/src/components/CustomBreadcrumb';

export default function BlogPostPageWrapper(props) {
  return (
    <div className="custom-blog-page">
      <CustomBreadcrumb metadata={props.content.metadata} />
      <BlogPostPage {...props} />
    </div>
  );
}
```

### 3. Analytics et tracking

```javascript
import React, { useEffect } from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';

export default function BlogPostPageWrapper(props) {
  const { metadata } = props.content;
  
  useEffect(() => {
    // Tracking de lecture d'article
    if (typeof gtag !== 'undefined') {
      gtag('event', 'blog_post_view', {
        post_title: metadata.title,
        post_date: metadata.date,
        post_tags: metadata.tags.map(tag => tag.label).join(',')
      });
    }
  }, [metadata]);

  return <BlogPostPage {...props} />;
}
```

### 4. Personnalisation conditionnelle

```javascript
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import PremiumBanner from '@site/src/components/PremiumBanner';

export default function BlogPostPageWrapper(props) {
  const { frontMatter } = props.content.metadata;
  const isPremium = frontMatter.premium === true;

  return (
    <>
      {isPremium && <PremiumBanner />}
      <BlogPostPage {...props} />
    </>
  );
}
```

## 🔍 Intégration avec l'écosystème

### Composants liés

1. **BlogPostItem/Content** : Gère le contenu de l'article avec les bannières de série
2. **Layout** : Wrapper global avec SEO et structure de base
3. **SerieBanner** : Bannière de série (si applicable)

### Flux de données

```
URL: /blog/mon-article
    ↓
Layout (SEO global)
    ↓
BlogPostPage (cette page)
    ↓
BlogPostItem/Content (contenu + série)
    ↓
Contenu Markdown final
```

### Hooks Docusaurus disponibles

```javascript
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { useDocsVersion } from '@docusaurus/theme-common/internal';

export default function BlogPostPageWrapper(props) {
  // Accès aux métadonnées de l'article
  const { metadata, isBlogPostPage } = useBlogPost();
  
  // Exemple d'utilisation
  console.log('Article title:', metadata.title);
  console.log('Is blog post page:', isBlogPostPage); // toujours true ici
  
  return <BlogPostPage {...props} />;
}
```

## 🎨 Personnalisation avancée

### 1. Modification du layout de colonnes

```javascript
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';

export default function BlogPostPageWrapper(props) {
  const { metadata } = useBlogPost();
  const hideTableOfContents = metadata.frontMatter.hideTableOfContents;

  // Personnalisation basée sur le frontMatter
  if (hideTableOfContents) {
    // Rendu sans TOC pour articles spéciaux
    return (
      <div className="blog-post-full-width">
        <BlogPostPage {...props} />
      </div>
    );
  }

  return <BlogPostPage {...props} />;
}
```

### 2. Ajout de métadonnées dynamiques

```javascript
import React from 'react';
import Head from '@docusaurus/Head';
import BlogPostPage from '@theme-original/BlogPostPage';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';

export default function BlogPostPageWrapper(props) {
  const { metadata } = useBlogPost();
  
  return (
    <>
      <Head>
        {/* Métadonnées JSON-LD personnalisées */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": metadata.title,
            "datePublished": metadata.date,
            "readingTime": `${metadata.readingTime} minutes`
          })}
        </script>
      </Head>
      <BlogPostPage {...props} />
    </>
  );
}
```

## 🔧 Configuration

### 1. FrontMatter supporté

Tous les champs standard de Docusaurus sont supportés :

```yaml
---
title: "Titre de l'article"
description: "Description SEO"
slug: custom-slug
date: 2025-08-29
authors: [docux]
tags: [react, tutorial]
keywords: [react, docusaurus, tutorial]
image: /img/article-banner.jpg

# Champs personnalisés (pour extensions futures)
premium: true
hideTableOfContents: false
serie: "Guide React"
---
```

### 2. Intégration CSS

```css
/* styles.css */
.custom-blog-page {
  /* Styles personnalisés pour le wrapper */
}

.blog-post-full-width {
  max-width: 100%;
  /* Layout sans sidebar */
}
```

## 🐛 Dépannage

### Problèmes courants

1. **Props undefined** :
   ```javascript
   // ✅ Vérification défensive
   export default function BlogPostPageWrapper(props) {
     if (!props || !props.content) {
       return <div>Erreur : données d'article manquantes</div>;
     }
     return <BlogPostPage {...props} />;
   }
   ```

2. **Hooks dans le mauvais contexte** :
   ```javascript
   // ✅ useBlogPost() fonctionne dans ce composant
   const { metadata } = useBlogPost();
   
   // ❌ Certains hooks peuvent ne pas être disponibles
   // Vérifiez la documentation Docusaurus
   ```

3. **Modifications CSS non appliquées** :
   - Vérifiez que les classes CSS sont correctement importées
   - Utilisez les outils développeur pour vérifier la spécificité

## 📚 Roadmap et évolutions

### Version actuelle (1.0.0)
- ✅ Wrapper transparent fonctionnel
- ✅ Compatibilité totale avec Docusaurus
- ✅ Structure prête pour extensions

### Évolutions prévues

1. **Articles liés automatiques** basés sur les tags
2. **Boutons de partage social** intégrés
3. **Système de commentaires** (Giscus, Utterances)
4. **Reading progress bar** en haut de page
5. **Time to read amélioré** avec statistiques détaillées

### Propositions d'amélioration

Vous pouvez proposer des améliorations en créant une issue avec :
- Description de la fonctionnalité souhaitée
- Cas d'usage concrets
- Mockups ou exemples si applicable

## 📚 Ressources

### Documentation Docusaurus

- [Swizzling Guide](https://docusaurus.io/docs/swizzling)
- [Blog Plugin](https://docusaurus.io/docs/blog)
- [Customizing Pages](https://docusaurus.io/docs/creating-pages)

### Composants liés

- `/src/theme/BlogPostItem/` : Contenu d'article avec séries
- `/src/theme/Layout/` : Layout global avec SEO
- `/src/components/SerieBanner/` : Bannières de séries

---

**Développé par l'équipe Docux**  
*Extension transparente du système de blog Docusaurus*
