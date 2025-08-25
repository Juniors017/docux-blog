# Composant SEO - Système de Référencement Intelligent

## 🎯 Description

Le composant SEO est un système avancé de gestion des métadonnées pour sites Docusaurus, développé par Docux avec l'assistance de l'Intelligence Artificielle. Il optimise automatiquement le référencement naturel (SEO) en générant les balises appropriées selon le type de contenu détecté.

## ✨ Fonctionnalités

### 🔍 Détection Automatique du Type de Page
- **Articles de blog** : Génération de métadonnées `BlogPosting` Schema.org
- **Pages d'accueil** : Structure `WebSite` avec actions de recherche
- **Pages de collection** : Type `CollectionPage` pour les index et listings
- **Pages générales** : Structure `WebPage` générique avec fallbacks intelligents

### 📊 Génération de Métadonnées Complètes
- **Balises HTML de base** : `title`, `description`, `canonical`
- **Open Graph** : Optimisation pour Facebook, LinkedIn et autres réseaux
- **Twitter Cards** : Cartes enrichies pour Twitter
- **Schema.org JSON-LD** : Données structurées pour Google Rich Results
- **Métadonnées d'articles** : Dates, auteurs, catégories pour les blogs

### 🛡️ Système de Fallback Robuste
- Cascade de priorités pour éviter les erreurs
- Récupération gracieuse des métadonnées indisponibles
- Métadonnées par défaut si aucune donnée spécifique n'est trouvée

### 👥 Gestion Centralisée des Auteurs
- Base de données d'auteurs dans `src/data/authors.js`
- Normalisation automatique des noms
- Support des auteurs multiples et uniques

## 🚀 Installation

### 1. Copier le composant
```bash
# Copier le fichier principal
cp src/components/Seo/index.jsx votre-projet/src/components/Seo/

# Copier la base de données d'auteurs
cp src/data/authors.js votre-projet/src/data/
```

### 2. Installer les dépendances
```bash
npm install @docusaurus/router @docusaurus/useDocusaurusContext @docusaurus/Head @docusaurus/useBaseUrl
```

### 3. Intégrer dans votre layout
```jsx
// Dans votre composant Layout ou thème personnalisé
import Seo from '@site/src/components/Seo';

export default function Layout({ children }) {
  return (
    <>
      <Seo />
      {children}
    </>
  );
}
```

### 4. Configurer la base d'auteurs
```javascript
// src/data/authors.js
export default {
  votre_nom: {
    name: 'Votre Nom',
    title: 'Votre Titre',
    url: 'https://votre-site.com',
    imageUrl: '/img/votre-photo.jpg',
    github: 'https://github.com/votre-username'
  }
};
```

## ⚙️ Configuration

### Configuration Docusaurus
```javascript
// docusaurus.config.js
module.exports = {
  title: 'Nom de votre site',
  tagline: 'Description par défaut',
  url: 'https://votre-domaine.com',
  baseUrl: '/',
  themeConfig: {
    image: '/img/image-sociale-par-defaut.jpg',
    // ... autres configurations
  }
};
```

### FrontMatter des articles
```markdown
---
title: "Titre de votre article"
description: "Description SEO de l'article"
authors: [votre_nom]
image: "/img/image-article.jpg"
keywords: ["mot-clé1", "mot-clé2"]
category: "Catégorie"
---
```

## 📈 Fonctionnement Technique

### Architecture du Composant

1. **Détection du contexte** : Utilisation des hooks Docusaurus pour identifier le type de page
2. **Récupération des métadonnées** : Extraction depuis le frontMatter ou les configurations
3. **Construction des métadonnées** : Génération des structures optimisées pour chaque plateforme
4. **Rendu des balises** : Injection dans le `<head>` via le composant `Head` de Docusaurus

### Système de Priorité des Métadonnées

```
1. Métadonnées spécifiques (frontMatter de l'article/page)
2. Métadonnées génériques (configuration de la page)
3. Configuration du site (docusaurus.config.js)
4. Valeurs par défaut (fallback de sécurité)
```

### Types Schema.org Supportés

- `BlogPosting` : Articles de blog avec auteur, dates, publisher
- `WebSite` : Page d'accueil avec actions de recherche
- `CollectionPage` : Pages d'index avec breadcrumbs
- `WebPage` : Pages générales avec structure de base

## 🧪 Debug et Développement

Le composant inclut un panel de debug avancé (`SeoDebugPanel`) qui s'affiche automatiquement en mode développement pour :

- Visualiser les métadonnées générées
- Valider la structure Schema.org
- Calculer un score SEO
- Tester les Rich Results Google

## 🔧 Personnalisation

### Ajouter un nouveau type de page

```jsx
// Dans le composant Seo
const isCustomPage = location.pathname.includes('/custom/');

const getPageType = () => {
  if (isCustomPage) return { type: 'CustomType', category: 'Page personnalisée' };
  // ... autres types
};
```

### Modifier les métadonnées Schema.org

```jsx
// Enrichir la structure JSON-LD
if (pageInfo.type === 'CustomType') {
  return {
    ...baseStructure,
    '@type': 'CustomType',
    customProperty: 'valeur personnalisée'
  };
}
```

## 🤝 Contribution au Projet

### Prérequis
- Node.js 16+ et npm
- Connaissance de React et Docusaurus
- Familiarité avec les standards SEO et Schema.org

### Processus de Contribution

1. **Fork** le repository principal
2. **Créer** une branche pour votre fonctionnalité
   ```bash
   git checkout -b feature/amelioration-seo
   ```
3. **Développer** vos modifications avec tests
4. **Tester** avec le panel de debug
5. **Documenter** les changements dans ce README
6. **Soumettre** une Pull Request détaillée

### Guidelines de Développement

- Respecter les standards Schema.org
- Maintenir la compatibilité avec toutes les versions de Docusaurus
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les nouvelles options de configuration

### Structure des Commits
```
type(scope): description

feat(seo): ajout support pour les événements Schema.org
fix(seo): correction fallback pour les images manquantes
docs(seo): mise à jour documentation installation
```

## 📄 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

```
MIT License

Copyright (c) 2025 Docux

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤖 Développement Assisté par IA

Ce composant a été développé avec l'assistance de l'Intelligence Artificielle (GitHub Copilot) pour :

- **Optimisation des algorithmes** de détection de type de page
- **Génération automatique** des structures Schema.org complexes
- **Validation en temps réel** des métadonnées SEO
- **Création de la documentation** technique et utilisateur

L'IA a permis d'accélérer le développement tout en maintenant des standards de qualité élevés et une compatibilité maximale avec l'écosystème Docusaurus.

## 🔗 Ressources Utiles

- [Documentation Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Documentation Docusaurus](https://docusaurus.io/)

---

**Développé avec ❤️ par l'équipe Docux**
