# BlogPostItem - Wrapper personnalisé pour articles de blog

![Docusaurus](https://img.shields.io/badge/Docusaurus-Theme-blue)
![React](https://img.shields.io/badge/React-Component-61DAFB)
![Swizzle](https://img.shields.io/badge/Swizzle-Wrapper-green)

> **Composant thématique personnalisé** qui étend le composant BlogPostItem original de Docusaurus pour ajouter la fonctionnalité de bannières de séries.

## 🎯 Vue d'ensemble

Ce composant est un **wrapper** (enveloppe) autour du composant `BlogPostItem/Content` original de Docusaurus. Il ajoute une fonctionnalité personnalisée : l'affichage automatique d'une bannière de série pour les articles qui font partie d'une série.

### ✨ Fonctionnalités

- 🔗 **Intégration transparente** avec le système de blog Docusaurus
- 📚 **Bannière de série automatique** basée sur le frontMatter
- 🎨 **Affichage conditionnel** uniquement sur les pages d'articles complets
- ⚡ **Performance optimisée** avec rendu conditionnel

## 🛠️ Architecture technique

### Structure du composant

```
BlogPostItem/
├── Content/
│   ├── index.js          # Wrapper personnalisé (ce fichier)
│   └── README.md         # Documentation
```

### Swizzling Docusaurus

Ce composant utilise le **swizzling** de Docusaurus :

```javascript
// Importation du composant original
import BlogPostItemContent from '@theme-original/BlogPostItem/Content';

// Wrapper personnalisé qui ajoute des fonctionnalités
export default function BlogPostItemContentWrapper(props) {
  // Logique personnalisée
  return (
    <>
      {/* Fonctionnalité ajoutée */}
      <BlogPostItemContent {...props} /> {/* Composant original */}
    </>
  );
}
```

## 📝 Code détaillé

### Imports et dépendances

```javascript
import React from 'react';
import BlogPostItemContent from '@theme-original/BlogPostItem/Content';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import SerieBanner from '@site/src/components/SerieBanner';
```

**Dépendances :**
- `@theme-original/BlogPostItem/Content` : Composant Docusaurus original
- `@docusaurus/plugin-content-blog/client` : Hook pour accéder aux métadonnées
- `@site/src/components/SerieBanner` : Composant personnalisé de bannière

### Logique principale

```javascript
export default function BlogPostItemContentWrapper(props) {
  // 1. Récupération des métadonnées de l'article
  const { metadata, isBlogPostPage } = useBlogPost();
  
  // 2. Extraction du nom de série depuis le frontMatter
  const serieName = metadata?.frontMatter?.serie;

  // 3. Rendu conditionnel
  return (
    <>
      {serieName && isBlogPostPage && (
        <SerieBanner serieName={serieName} />
      )}
      <BlogPostItemContent {...props} />
    </>
  );
}
```

## 🔧 Configuration et utilisation

### 1. FrontMatter requis

Pour qu'un article affiche une bannière de série, ajoutez le champ `serie` dans le frontMatter :

```yaml
---
title: "Mon article de série"
serie: "Guide Docusaurus"  # ← Déclenche l'affichage de la bannière
---

# Contenu de l'article
```

### 2. Conditions d'affichage

La bannière s'affiche **uniquement si** :

- ✅ `serieName` est défini dans le frontMatter
- ✅ `isBlogPostPage` est `true` (page d'article complète, pas liste)

**Où la bannière apparaît :**
- ✅ Page d'article individuelle (`/blog/mon-article`)
- ❌ Liste des articles (`/blog`)
- ❌ Archive par tag (`/blog/tags/react`)
- ❌ Archive par auteur (`/blog/authors/docux`)

### 3. Position dans la page

```html
<!-- Structure HTML générée -->
<article class="blog-post">
  <!-- 🔥 SerieBanner s'affiche ici (si conditions remplies) -->
  <SerieBanner serieName="Guide Docusaurus" />
  
  <!-- Contenu original de l'article -->
  <BlogPostItemContent>
    <header>
      <h1>Titre de l'article</h1>
      <div>Métadonnées (date, auteur, tags)</div>
    </header>
    <main>
      <!-- Contenu Markdown de l'article -->
    </main>
  </BlogPostItemContent>
</article>
```

## 🎨 Intégration avec SerieBanner

### Données transmises

```javascript
<SerieBanner serieName={serieName} />
```

Le composant `SerieBanner` reçoit :
- **serieName** : Nom de la série (ex: "Guide Docusaurus")

### Exemple d'utilisation

```yaml
---
title: "Partie 1 : Installation"
serie: "Maîtriser React"
---

# Installation de React

Cet article fait partie de la série "Maîtriser React"...
```

**Résultat :** Une bannière "📚 Série : Maîtriser React" s'affichera en haut de l'article.

## 🔍 Hook useBlogPost()

### Données disponibles

```javascript
const { metadata, isBlogPostPage } = useBlogPost();

// metadata.frontMatter contient :
{
  title: "Titre de l'article",
  serie: "Nom de la série",  // ← Notre champ personnalisé
  tags: ["react", "tutoriel"],
  authors: ["docux"],
  date: "2025-08-29",
  // ... autres champs du frontMatter
}

// isBlogPostPage : boolean
// true sur /blog/mon-article
// false sur /blog ou /blog/tags/react
```

### Sécurité des données

```javascript
// Accès sécurisé avec optional chaining
const serieName = metadata?.frontMatter?.serie;

// Équivalent à :
const serieName = metadata && 
                  metadata.frontMatter && 
                  metadata.frontMatter.serie;
```

## 🚀 Bonnes pratiques

### 1. Nommage des séries

```yaml
# ✅ Recommandé
serie: "Guide Docusaurus"
serie: "React Avancé"  
serie: "SEO & Performance"

# ❌ À éviter
serie: "guide-docusaurus"  # Pas user-friendly
serie: ""                  # Vide
```

### 2. Organisation des articles

```
blog/
├── 2025/
│   ├── guide-docusaurus-1-installation.md     # serie: "Guide Docusaurus"
│   ├── guide-docusaurus-2-configuration.md    # serie: "Guide Docusaurus"  
│   ├── guide-docusaurus-3-themes.md           # serie: "Guide Docusaurus"
│   └── article-independant.md                 # pas de serie
```

### 3. Performance

```javascript
// ✅ Rendu conditionnel efficace
{serieName && isBlogPostPage && (
  <SerieBanner serieName={serieName} />
)}

// ❌ Rendu toujours (moins efficace)
<SerieBanner 
  serieName={serieName} 
  show={serieName && isBlogPostPage} 
/>
```

## 🐛 Dépannage

### La bannière ne s'affiche pas

1. **Vérifiez le frontMatter** :
   ```yaml
   ---
   serie: "Nom de la série"  # ← Bien présent et non vide
   ---
   ```

2. **Vérifiez le contexte** :
   - Vous êtes sur une page d'article (`/blog/mon-article`)
   - Pas sur la liste des articles (`/blog`)

3. **Vérifiez la console** :
   ```javascript
   // Dans les outils développeur
   console.log('metadata:', metadata);
   console.log('isBlogPostPage:', isBlogPostPage);
   console.log('serieName:', serieName);
   ```

### Erreur "Cannot read property"

Si vous voyez une erreur comme `Cannot read property 'frontMatter' of undefined` :

```javascript
// ✅ Utilisation sécurisée (actuelle)
const serieName = metadata?.frontMatter?.serie;

// ❌ Utilisation dangereuse
const serieName = metadata.frontMatter.serie;
```

## 🔄 Évolutions possibles

### Fonctionnalités futures

1. **Navigation inter-articles** :
   ```javascript
   // Ajouter des liens vers article précédent/suivant de la série
   <SerieBanner 
     serieName={serieName}
     previousArticle={previousInSerie}
     nextArticle={nextInSerie}
   />
   ```

2. **Indicateur de progression** :
   ```yaml
   ---
   serie: "Guide Docusaurus"
   serieIndex: 2    # Article 2 de la série
   serieTotal: 5    # 5 articles au total
   ---
   ```

3. **Séries avec descriptions** :
   ```yaml
   ---
   serie: 
     name: "Guide Docusaurus"
     description: "Apprenez à maîtriser Docusaurus étape par étape"
     index: 1
   ---
   ```

## 📚 Ressources

### Documentation Docusaurus

- [Swizzling Components](https://docusaurus.io/docs/swizzling)
- [Blog Plugin API](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog)
- [useBlogPost Hook](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog#useblogpost)

### Composants liés

- `/src/components/SerieBanner/` : Composant de bannière de série
- `/src/theme/BlogPostPage/` : Page complète d'article de blog
- `/src/theme/Layout/` : Layout global avec SEO

---

**Développé par l'équipe Docux**  
*Extension du système de blog Docusaurus pour les séries d'articles*
