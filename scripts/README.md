# 🚀 Scripts de Création d'Articles - Docux Blog

Un système complet d'outils automatisés pour créer des articles de blog optimisés SEO avec des métadonnées structurées et des schémas Rich Results.

## 📋 Vue d'Ensemble

Ce dossier contient des scripts Node.js qui automatisent la création d'articles pour Docusaurus avec :
- ✅ **Frontmatter SEO optimisé** avec schémas JSON-LD
- ✅ **Support de 7 types d'articles** (BlogPosting, TechArticle, HowTo, etc.)
- ✅ **Templates personnalisables** selon le type de contenu
- ✅ **Validation Google Rich Results** intégrée
- ✅ **Métadonnées multilingues** (fr-FR par défaut)

## 🛠️ Scripts Disponibles

### 1. `create-article.js` - Mode Interactif Complet

**Usage** :
```bash
node scripts/create-article.js
```

**Fonctionnalités** :
- Interface interactive en ligne de commande
- Sélection du type de schéma avec descriptions
- Configuration automatique du frontmatter optimisé
- Génération de contenu de base selon le type
- Validation des entrées utilisateur

**Types de schémas supportés** :
| Type | Description | Usage Typique |
|------|-------------|---------------|
| `BlogPosting` | Article de blog standard | Actualités, opinions, récits |
| `TechArticle` | Article technique approfondi | Tutoriels, guides techniques |
| `HowTo` | Guide étape par étape | Instructions, procédures |
| `FAQPage` | Page de questions/réponses | Support, documentation |
| `CollectionPage` | Page de collection | Listes, catalogues |
| `SoftwareApplication` | Documentation logiciel | Apps, outils, plugins |
| `Course` | Contenu de formation | Cours, formations |

### 2. `quick-article.js` - Génération Rapide

**Usage** :
```bash
node scripts/quick-article.js [type] [titre]
```

**Exemples** :
```bash
# Article de blog standard
node scripts/quick-article.js blog "Les Tendances Web 2025"

# Guide technique
node scripts/quick-article.js tech "Optimisation React Performance"

# Tutorial étape par étape
node scripts/quick-article.js howto "Déployer avec Docker"

# Page FAQ
node scripts/quick-article.js faq "Questions Fréquentes API"
```

**Fonctionnalités** :
- Création instantanée sans questions interactives
- Arguments en ligne de commande
- Configuration par défaut intelligente
- Parfait pour l'automatisation et les scripts

## 📁 Structure Générée

Les articles sont créés dans `blog/YYYY/MM/DD/slug/index.mdx` avec :

```
blog/
└── 2025/
    └── 08/
        └── 29/
            └── mon-article/
                └── index.mdx
```

## 🎯 Templates de Frontmatter

### BlogPosting
```yaml
---
title: "Titre de l'article"
description: "Description SEO"
schemaTypes: ["BlogPosting"]
slug: article-slug
image: "/img/article.png"
authors: ["docux"]
tags: ["blog", "actualités"]
date: 2025-08-29
genre: "Technology Blog"
audience: "Développeurs web"
inLanguage: "fr-FR"
isAccessibleForFree: true
readingTime: "5 min"
articleSection: "Blog"
category: "Blog"
keywords: ["tech", "web"]
---
```

### TechArticle
```yaml
---
title: "Guide Technique"
description: "Guide technique détaillé"
schemaTypes: ["TechArticle", "BlogPosting"]
proficiencyLevel: "Intermediate"
programmingLanguage: ["JavaScript", "React"]
timeRequired: "PT30M"
learningResourceType: "Tutorial"
educationalLevel: "Intermediate"
applicationCategory: "DeveloperApplication"
operatingSystem: ["Windows", "macOS", "Linux"]
browserRequirements: "Navigateur moderne ES2020+"
---
```

### HowTo
```yaml
---
title: "Comment faire X"
description: "Guide étape par étape"
schemaTypes: ["HowTo", "TechArticle"]
difficulty: "Beginner"
totalTime: "PT1H"
prepTime: "PT15M"
performTime: "PT45M"
estimatedCost: "Gratuit"
tool: ["Ordinateur", "Éditeur de code"]
supply: ["Node.js", "npm"]
yield: "Application fonctionnelle"
---
```

## ⚙️ Configuration

### Variables d'Environnement
Les scripts utilisent des valeurs par défaut configurables :

```javascript
const DEFAULT_CONFIG = {
  author: "docux",
  baseImagePath: "/img/",
  defaultTags: ["blog"],
  language: "fr-FR",
  copyright: "Docux"
};
```

### Personnalisation des Templates
Modifiez l'objet `SCHEMA_TEMPLATES` dans `create-article.js` pour :
- Ajouter de nouveaux types de schémas
- Modifier les champs par défaut
- Personnaliser le contenu généré

## 🔧 Installation et Prérequis

### Prérequis
- Node.js 16+ 
- Workspace Docusaurus configuré
- Component SEO installé (voir [documentation SEO](../blog/2025/08/29/seotools/index.mdx))

### Installation
```bash
# Les scripts utilisent uniquement les modules Node.js natifs
# Aucune installation supplémentaire requise
```

### Permissions
```bash
# Rendre les scripts exécutables (Linux/macOS)
chmod +x scripts/*.js
```

## 📚 Intégration avec l'Écosystème

### Avec les Snippets VS Code
1. **Scripts** → Génération automatique du fichier
2. **Snippets** → Création manuelle avec templates
3. **Complémentarité** : Scripts pour la rapidité, snippets pour la personnalisation

### Avec le Component SEO
- ✅ Frontmatter compatible avec `src/components/Seo/index.jsx`
- ✅ Support des `schemaTypes` multiples
- ✅ Validation Google Rich Results automatique
- ✅ Hiérarchie de priorité respectée

### Workflow Recommandé
1. **Prototypage rapide** : `quick-article.js`
2. **Configuration détaillée** : `create-article.js`
3. **Personnalisation avancée** : Snippets VS Code
4. **Édition finale** : Éditeur avec suggestions intelligentes

## 🐛 Dépannage

### Erreurs Communes

**"Directory already exists"**
```bash
# Solution : Utiliser un slug différent ou supprimer le dossier existant
rm -rf blog/2025/08/29/mon-article/
```

**"Invalid schema type"**
```bash
# Types valides : blog, tech, howto, faq, collection, software, course
node scripts/quick-article.js tech "Mon Guide"
```

**"Permission denied"**
```bash
# Solution : Vérifier les permissions d'écriture
chmod 755 blog/
```

### Debug Mode
Décommentez les lignes `console.log` dans les scripts pour activer le mode debug détaillé.

## 🤝 Contribution

### Ajouter un Nouveau Type de Schéma

1. **Modifier `SCHEMA_TEMPLATES`** dans `create-article.js` :
```javascript
SCHEMA_TEMPLATES.nouveauType = {
  title: "Nouveau Type",
  description: "Description du nouveau type",
  schemaTypes: ["NouveauSchema"],
  // ... autres champs
};
```

2. **Tester** :
```bash
node scripts/create-article.js
# Vérifier que le nouveau type apparaît dans la liste
```

3. **Documenter** : Ajouter dans ce README et l'article de blog

### Standards de Code
- Utiliser `const` pour les constantes
- Validation des entrées utilisateur
- Messages d'erreur clairs et actionnables
- Support des chemins Windows et Unix

## 📖 Documentation Complémentaire

- [Guide SEO Complet](../blog/2025/08/29/seotools/index.mdx)
- [Documentation Component SEO](../src/components/Seo/README.md)
- [Workflow de Création](../docs/CREATION-WORKFLOW.md)
- [Snippets VS Code](../.vscode/docusaurus-snippets.json)

## 📄 Licence

Ces scripts sont distribués sous la même licence que le projet Docux Blog.

---

*Scripts développés par **Docux** - Dernière mise à jour : 29 août 2025*
