# Docux Blog

Site de blog construit avec Docusaurus v4, optimisé pour le SEO avec composant de métadonnées enrichies.

## 🚀 Installation et démarrage

```bash
npm install
npm start
```

## 🔍 Composant SEO avancé

Le site intègre un composant SEO intelligent qui s'adapte automatiquement au type de page visitée.

### 📊 Fonctionnement par type de page

| Type de page | Métadonnées générées | Schema.org | Détection |
|-------------|---------------------|------------|-----------|
| **Article de blog** | Titre, auteur, image, date, mots-clés | `BlogPosting` | `/blog/[slug]` |
| **Liste de blog** | Description, navigation | `Blog` | `/blog/` |
| **Page d'accueil** | Site info, organisation | `WebSite` | `/` |
| **Page repository** | Projets, code | `WebPage` | `/repository/` |
| **Page series** | Séries éducatives | `Series` | `/series/` |
| **Page thanks** | Remerciements | `WebPage` | `/thanks/` |

### ✅ Fonctionnalités SEO

#### Pour TOUTES les pages :
- ✅ JSON-LD Schema.org adapté au contexte
- ✅ Publisher et organisation (DOCUX)
- ✅ Langue (fr-FR)
- ✅ MainEntityOfPage
- ✅ Métadonnées de sécurité (referrer, format-detection)

#### Pour les articles de blog uniquement :
- ✅ **Titre et description** automatiques
- ✅ **Auteurs complets** (nom, titre, URL, image)
- ✅ **Image d'article** pour Rich Results
- ✅ **Date de publication**
- ✅ **Mots-clés** du frontmatter
- ✅ **isPartOf** (relation avec le blog)
- ✅ **Métadonnées Twitter** spécifiques

### 🛠️ Panel de debug (développement)

En mode développement, un panel interactif apparaît en bas à droite :

#### � Informations en temps réel :
- 🔍 **Détection automatique** du type de page
- 📊 **Visualisation des métadonnées** générées (blog/page/génériques)
- ⚡ **Métriques de performance** (temps de rendu, mémoire)
- 🔧 **Status des hooks** (useBlogPost, useDoc, usePageMetadata)

#### 🔧 Actions rapides intégrées :
- 📋 **Console log du JSON-LD** - Debug des métadonnées générées
- 📎 **Copie de l'URL** - Partage rapide pour tests
- 🔍 **Test Google Rich Results** - Validation SEO en un clic

#### 📄 Données affichées selon le contexte :
- **Blog Post Data** : Titre, date, auteurs, image, mots-clés (si article de blog)
- **Page Metadata** : Titre, description, frontmatter complet (si page avec métadonnées)
- **Détections** : Status de tous les types de pages avec indicateurs visuels
- **hasPageMetadata** : Confirmation de récupération des métadonnées

### 📁 Structure des fichiers

```
src/
├── components/
│   └── Seo/
│       └── index.jsx          # 🔍 Composant SEO principal
├── data/
│   └── authors.js            # 👥 Données centralisées des auteurs
└── theme/
    └── Layout/
        └── index.js          # 🎨 Layout global avec SEO
```

### 🎯 Gestion intelligente

Le composant utilise un système de `try/catch` multi-niveaux pour récupérer automatiquement les métadonnées :

#### 🔍 Récupération automatique des métadonnées :
- **Articles de blog** : Via `useBlogPost` hook (Docusaurus blog plugin)
- **Pages docs** : Via `useDoc` hook (Docusaurus docs plugin)  
- **Pages custom** : Via `usePageMetadata` hook (Docusaurus core)
- **Fallback gracieux** : Métadonnées génériques si aucune donnée disponible

#### 📝 Support du frontmatter pour toutes les pages :

Vous pouvez maintenant enrichir **n'importe quelle page** avec des métadonnées SEO via le frontmatter :

```markdown
---
title: "Page de remerciements"
description: "Merci à tous nos contributeurs"
image: "/img/thanks.png"
keywords: ["remerciements", "contributeurs", "communauté"]
author: "Equipe DOCUX"
category: "Appreciation"
about: "Page dédiée aux remerciements"
date: 2025-08-24
---
```

#### ✅ Métadonnées automatiquement détectées :
- ✅ **Titre** → `title` du frontmatter
- ✅ **Description** → `description` du frontmatter
- ✅ **Image** → `image` du frontmatter (pour Rich Results)
- ✅ **Mots-clés** → `keywords` du frontmatter (array ou string)
- ✅ **Auteur** → `author` du frontmatter
- ✅ **Date** → `date` du frontmatter
- ✅ **Catégorie** → `category` du frontmatter (pour genre Schema.org)
- ✅ **About** → `about` du frontmatter (description détaillée)

#### 🔄 Système de fallback intelligent :
- **Pages de blog** : Récupère automatiquement les métadonnées via `useBlogPost`
- **Pages avec frontmatter** : Utilise les métadonnées personnalisées
- **Pages sans métadonnées** : Génère des métadonnées optimisées génériques
- **Erreurs** : Fallback transparent sans interruption

### 🚀 Google Rich Results

Le composant génère automatiquement les métadonnées nécessaires pour :
- 📝 Articles de blog avec auteurs et images
- 🏢 Informations d'organisation
- 🔗 Relations entre contenus
- 🎯 Structured Data complète

Base site
Test hook pre-commit
Test hook blocage
Test osascript