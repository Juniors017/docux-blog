# SerieBanner Component

## 📚 Description

Le composant `SerieBanner` affiche une bannière discrète en début d'article pour indiquer qu'un article fait partie d'une série. Cette bannière comprend un lien vers la page listant tous les articles de la série.

## 🎯 Fonctionnalités

- **Affichage automatique** : Se montre uniquement sur les articles ayant une série définie
- **Design discret** : Bordure subtile et texte en italique pour ne pas distraire la lecture
- **Lien intelligent** : Génère automatiquement l'URL vers la page de la série
- **Responsive** : S'adapte aux thèmes clair et sombre
- **Slug automatique** : Convertit les noms de série en URLs propres

## 🚀 Utilisation

### Dans un article de blog

Ajoutez simplement le champ `serie` dans le frontmatter de votre article :

```mdx
---
title: "Mon Article"
authors: [docux]
date: 2025-08-28
description: "Description de l'article"
serie: "Genèse Docux"
---

Contenu de l'article...
```

### Rendu visuel

La bannière s'affichera comme :

```
📚 Cet article fait partie de la série : Genèse Docux
```

## 🔧 Architecture technique

### Structure des fichiers

```
src/components/SerieBanner/
├── index.jsx           # Composant principal
├── styles.module.css   # Styles CSS modules
└── README.md          # Documentation
```

### Intégration dans Docusaurus

Le composant est automatiquement intégré via un wrapper du composant `BlogPostItem/Content` :

```javascript
// src/theme/BlogPostItem/Content/index.js
import SerieBanner from '@site/src/components/SerieBanner';

export default function BlogPostItemContentWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const serieName = metadata?.frontMatter?.serie;

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

## 📋 Props

| Prop | Type | Description | Obligatoire |
|------|------|-------------|-------------|
| `serieName` | `string` | Nom de la série tel que défini dans le frontmatter | ✅ |

## 🎨 Personnalisation

### Modification du design

Éditez le fichier `styles.module.css` pour personnaliser l'apparence :

```css
.serieBanner {
  /* Personnalisez le conteneur */
  background: transparent;
  border-left: 3px solid var(--ifm-color-primary-lightest);
  padding: 0.5rem 0 0.5rem 1rem;
}

.serieText {
  /* Personnalisez le texte */
  color: #8892b0;
  font-style: italic;
}

.serieLink {
  /* Personnalisez le lien */
  color: var(--ifm-color-primary);
  text-decoration: none;
}
```

### Modification du texte

Dans `index.jsx`, modifiez le texte affiché :

```jsx
<span className={styles.serieText}>
  Cet article fait partie de la série : 
  <Link href={`/docux-blog/series/series-articles?name=${seriesSlug}`}>
    {serieName}
  </Link>
</span>
```

## 🔗 Génération des liens

### Fonction de slug

Les noms de série sont automatiquement convertis en slugs pour les URLs :

```javascript
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')                    // Décompose les accents
    .replace(/[\u0300-\u036f]/g, '')    // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '')       // Supprime caractères spéciaux
    .replace(/\s+/g, '-')               // Espaces → tirets
    .replace(/-+/g, '-')                // Supprime tirets multiples
    .trim('-');                         // Supprime tirets début/fin
}
```

### Exemples de conversion

| Nom de série | Slug généré | URL finale |
|--------------|-------------|------------|
| `"Genèse Docux"` | `genese-docux` | `/series/series-articles?name=genese-docux` |
| `"Creating Docusaurus components"` | `creating-docusaurus-components` | `/series/series-articles?name=creating-docusaurus-components` |
| `"Guide d'utilisation"` | `guide-dutilisation` | `/series/series-articles?name=guide-dutilisation` |

## 🔄 Conditions d'affichage

La bannière s'affiche uniquement si :

1. ✅ L'article a un champ `serie` dans son frontmatter
2. ✅ On est sur une page d'article individuel (`isBlogPostPage === true`)
3. ✅ Le nom de série n'est pas vide

Elle ne s'affiche **PAS** sur :
- ❌ Les pages de liste d'articles (`/blog/`)
- ❌ Les pages de tags (`/blog/tags/`)
- ❌ Les pages d'archives (`/blog/archive/`)

## 🌙 Support des thèmes

Le composant s'adapte automatiquement aux thèmes clair et sombre grâce aux CSS modules :

```css
/* Thème clair */
.serieText {
  color: #8892b0;
}

/* Thème sombre */
html[data-theme='dark'] .serieText {
  color: #94a3b8;
}
```

## 🛠️ Développement

### Installation

Le composant est intégré automatiquement. Aucune installation supplémentaire requise.

### Tests

Pour tester le composant :

1. Créez un article avec `serie: "Test Series"`
2. Démarrez le serveur : `npm start`
3. Visitez l'article : `http://localhost:3000/docux-blog/blog/votre-article`
4. Vérifiez que la bannière s'affiche

### Debugging

Si la bannière ne s'affiche pas :

1. Vérifiez le frontmatter de l'article
2. Vérifiez que vous êtes sur une page d'article individuel
3. Inspectez la console pour d'éventuelles erreurs
4. Vérifiez que le wrapper `BlogPostItem/Content` est bien en place

## 📦 Dépendances

- React
- `@docusaurus/Link` - Pour les liens internes
- `@docusaurus/plugin-content-blog/client` - Pour le hook `useBlogPost`

## 📄 Licence

Ce composant fait partie du projet Docux Blog et suit la même licence que le projet principal.

## 🤝 Contribution

Pour contribuer à ce composant :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Testez vos modifications
4. Soumettez une Pull Request

## 📚 Voir aussi

- [Documentation des Séries](../../../pages/series/README.md)
- [Composant SerieBlogPosts](../SerieBlogPosts/README.md)
- [Utilitaires Blog](../utils/README.md)
