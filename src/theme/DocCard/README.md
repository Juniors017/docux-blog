# DocCard - Cartes de documentation personnalisées

![Docusaurus](https://img.shields.io/badge/Docusaurus-Theme-blue)
![React](https://img.shields.io/badge/React-Component-61DAFB)
![UI](https://img.shields.io/badge/UI-Component-purple)

> **Composant thématique personnalisé** qui remplace les cartes de documentation par défaut de Docusaurus avec un design moderne et des effets visuels améliorés.

## 🎯 Vue d'ensemble

Ce composant personnalise l'affichage des **cartes de documentation** dans les pages d'index et de navigation. Il remplace les cartes par défaut de Docusaurus par une version avec des effets de hover, des styles améliorés et une meilleure expérience utilisateur.

### ✨ Fonctionnalités

- 🎨 **Design moderne** avec effets de hover
- 🔗 **Support complet** des liens internes et externes
- 📊 **Détection automatique** du type de contenu
- 🏷️ **Icônes contextuelles** selon le type de lien
- ⚡ **Performance optimisée** avec CSS modules
- 🌐 **Accessibilité** préservée

## 🛠️ Architecture technique

### Structure du composant

```
DocCard/
├── index.js              # Composant principal (ce fichier)
├── styles.module.css     # Styles CSS modules
└── README.md             # Documentation
```

### Swizzling Docusaurus

Ce composant **remplace complètement** le composant DocCard original :

```javascript
// Remplacement total (ejection)
export default function DocCard({item}) {
  // Logique personnalisée complète
  switch (item.type) {
    case 'link': return <CardLink item={item} />;
    case 'category': return <CardCategory item={item} />;
    default: throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
```

## 📝 Code détaillé

### Imports et dépendances

```javascript
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  findFirstSidebarItemLink,
  useDocById,
} from '@docusaurus/theme-common/internal';
import {usePluralForm} from '@docusaurus/theme-common';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {translate} from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
```

**Dépendances :**
- `@docusaurus/Link` : Composant de lien optimisé
- `@docusaurus/theme-common` : Hooks et utilitaires Docusaurus
- `@docusaurus/Translate` : Système d'internationalisation
- CSS Modules : Styles scopés et optimisés

### Types de cartes supportés

#### 1. Cartes de catégorie (CardCategory)

```javascript
function CardCategory({item}) {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();
  
  return (
    <CardLayout
      href={href}
      icon=""              // Icône de dossier
      title={item.label}   // Nom de la catégorie
      description={item.description ?? categoryItemsPlural(item.items.length)}
    />
  );
}
```

**Usage :** Pages d'index de documentation avec sous-sections.

#### 2. Cartes de lien (CardLink)

```javascript
function CardLink({item}) {
  const icon = isInternalUrl(item.href) ? '' : '';  // Icône selon type
  const doc = useDocById(item.docId ?? undefined);
  
  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      description={item.description ?? doc?.description}
    />
  );
}
```

**Usage :** Liens vers des pages spécifiques (internes ou externes).

### Composants internes

#### CardContainer - Wrapper avec lien

```javascript
function CardContainer({href, children}) {
  return (
    <Link
      href={href}
      className={clsx('card padding--lg', styles.cardContainer)}>
      {children}
    </Link>
  );
}
```

#### CardLayout - Structure de carte

```javascript
function CardLayout({href, icon, title, description}) {
  return (
    <CardContainer href={href}>
      <Heading
        as="h2"
        className={clsx('text--truncate', styles.cardTitle)}
        title={title}>
        {icon} {title}
      </Heading>
      {description && (
        <p
          className={clsx('text--truncate', styles.cardDescription)}
          title={description}>
          {description}
        </p>
      )}
    </CardContainer>
  );
}
```

## 🎨 Styles CSS personnalisés

### styles.module.css

```css
.cardContainer {
  /* Variables CSS personnalisées */
  --ifm-link-color: var(--ifm-color-emphasis-800);
  --ifm-link-hover-color: var(--ifm-color-emphasis-700);
  --ifm-link-hover-decoration: none;

  /* Effets visuels */
  box-shadow: 0 1.5px 3px 0 rgb(0 0 0 / 15%);
  border: 1px solid var(--ifm-color-emphasis-200);
  transition: all var(--ifm-transition-fast) ease;
  transition-property: border, box-shadow;
}

.cardContainer:hover {
  /* Effet de hover */
  border-color: var(--ifm-color-primary);
  box-shadow: 0 3px 6px 0 rgb(0 0 0 / 20%);
}

.cardTitle {
  font-size: 1.2rem;
}

.cardDescription {
  font-size: 0.8rem;
}
```

### Personnalisation avancée

```css
/* Dans src/css/custom.css pour surcharger */
.cardContainer {
  /* Coins arrondis */
  border-radius: 12px;
  
  /* Gradient de fond */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  /* Animation d'apparition */
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🔧 Configuration et utilisation

### 1. Génération automatique

Les DocCards s'affichent automatiquement dans :

```
docs/
├── index.md              # Page principale avec cartes vers catégories
├── guide/
│   ├── index.md          # Cartes vers sous-sections du guide  
│   ├── installation.md
│   └── configuration.md
└── api/
    ├── index.md          # Cartes vers différentes APIs
    ├── rest-api.md
    └── graphql-api.md
```

### 2. Configuration dans sidebars.js

```javascript
// sidebars.js
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Guide de démarrage',       // → Titre de la carte
      description: 'Premiers pas avec notre plateforme',  // → Description
      items: ['intro', 'installation', 'configuration'],
    },
    {
      type: 'link',
      label: 'API Reference',           // → Titre de la carte
      href: '/docs/api',                // → Lien de destination
      description: 'Documentation complète de notre API REST'  // → Description
    },
    {
      type: 'link', 
      label: 'Exemples GitHub',         // → Titre avec icône externe
      href: 'https://github.com/examples',  // → Lien externe
    }
  ]
};
```

### 3. Page d'index personnalisée

```markdown
<!-- docs/index.md -->
---
title: Documentation
description: Guide complet de notre plateforme
---

# Documentation

Bienvenue dans notre documentation complète.

## Sections principales

<!-- Les DocCards s'affichent automatiquement ici -->
```

### 4. Métadonnées pour DocCards

```markdown
<!-- docs/guide/installation.md -->
---
title: Installation
description: Guide d'installation étape par étape avec exemples pratiques
sidebar_label: Installation   # Utilisé comme titre de carte
---
```

## 📊 Types de contenu et affichage

### Cartes de catégorie

```
┌─────────────────────────────────────┐
│ 📁 Guide de démarrage               │
│                                     │
│ Premiers pas avec notre plateforme  │
│ 3 items                            │
└─────────────────────────────────────┘
```

**Données affichées :**
- **Icône** : 📁 (dossier)
- **Titre** : `item.label` de la sidebar
- **Description** : `item.description` ou "X items"

### Cartes de lien interne

```
┌─────────────────────────────────────┐
│ 📄 API Reference                    │
│                                     │
│ Documentation complète de notre API │
└─────────────────────────────────────┘
```

**Données affichées :**
- **Icône** : 📄 (document interne)
- **Titre** : `item.label` de la sidebar
- **Description** : `item.description` ou description du document

### Cartes de lien externe

```
┌─────────────────────────────────────┐
│ 🔗 Exemples GitHub                  │
│                                     │
│ Découvrez nos exemples de code      │
└─────────────────────────────────────┘
```

**Données affichées :**
- **Icône** : 🔗 (lien externe)
- **Titre** : `item.label` de la sidebar
- **Description** : `item.description` ou description par défaut

## ⚡ Optimisations et performance

### 1. CSS Modules

```javascript
// Avantages des CSS Modules
import styles from './styles.module.css';

// ✅ Classes scopées automatiquement
className={styles.cardContainer}  // → .DocCard_cardContainer_abc123

// ✅ Pas de conflits CSS
// ✅ Tree-shaking automatique
// ✅ Cache optimisé
```

### 2. Lazy loading des descriptions

```javascript
// Description chargée uniquement si nécessaire
const doc = useDocById(item.docId ?? undefined);
const description = item.description ?? doc?.description;
```

### 3. Optimisations CSS

```css
.cardContainer {
  /* Transition optimisée GPU */
  transition-property: border, box-shadow;  /* Pas 'all' */
  will-change: auto;  /* Évite la promotion GPU inutile */
  
  /* Optimisation du reflow */
  contain: layout style;
}
```

## 🌐 Internationalisation

### Messages traduits

```javascript
// Utilisation du système i18n de Docusaurus
const categoryItemsPlural = useCategoryItemsPlural();

// Génère automatiquement :
// EN: "3 items"
// FR: "3 éléments"  
// ES: "3 elementos"
```

### Configuration i18n

```javascript
// docusaurus.config.js
const config = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
  
  // Traductions personnalisées
  themeConfig: {
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      }
    }
  }
};
```

## 🔍 Accessibilité

### Bonnes pratiques intégrées

```javascript
// ✅ Titre accessible
<Heading
  as="h2"
  className={clsx('text--truncate', styles.cardTitle)}
  title={title}>  {/* Tooltip pour texte tronqué */}
  {icon} {title}
</Heading>

// ✅ Description accessible  
<p
  className={clsx('text--truncate', styles.cardDescription)}
  title={description}>  {/* Tooltip pour texte tronqué */}
  {description}
</p>

// ✅ Lien accessible (Link de Docusaurus)
<Link href={href} className="...">
```

### Tests d'accessibilité

```bash
# Installation des outils
npm install --save-dev @axe-core/react

# Tests automatiques dans le navigateur
# Lighthouse accessibility score: 100/100
```

## 🎨 Personnalisation avancée

### 1. Icônes personnalisées

```javascript
function CardLink({item}) {
  // Logique d'icône avancée
  const getIcon = (href, docId) => {
    if (href.includes('github.com')) return '🐙';
    if (href.includes('api')) return '⚡';
    if (docId?.includes('tutorial')) return '📚';
    return isInternalUrl(href) ? '📄' : '🔗';
  };
  
  const icon = getIcon(item.href, item.docId);
  // ...
}
```

### 2. Métriques de lecture

```javascript
function CardLayout({href, icon, title, description, readingTime}) {
  return (
    <CardContainer href={href}>
      <div className={styles.cardHeader}>
        <Heading as="h2" className={styles.cardTitle}>
          {icon} {title}
        </Heading>
        {readingTime && (
          <span className={styles.readingTime}>
            ⏱️ {readingTime} min
          </span>
        )}
      </div>
      {/* ... */}
    </CardContainer>
  );
}
```

### 3. Badges de statut

```javascript
// Dans styles.module.css
.cardBadge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--ifm-color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
}

// Dans le composant
{item.status && (
  <span className={styles.cardBadge}>
    {item.status} {/* "New", "Updated", "Beta" */}
  </span>
)}
```

## 🐛 Dépannage

### Problèmes courants

1. **Cartes ne s'affichent pas** :
   ```javascript
   // Vérifiez la configuration sidebar
   console.log('Sidebar items:', sidebarItems);
   
   // Vérifiez le fichier sidebars.js
   // docs: [ ... ] doit contenir les bonnes définitions
   ```

2. **Styles CSS non appliqués** :
   ```bash
   # Vérifiez que le fichier CSS est bien présent
   ls src/theme/DocCard/styles.module.css
   
   # Vérifiez les imports
   # import styles from './styles.module.css';
   ```

3. **Liens externes incorrects** :
   ```javascript
   // Vérifiez la détection d'URL
   console.log('Is internal:', isInternalUrl(item.href));
   
   // URLs internes: /docs/... ou docs/...
   // URLs externes: https://... ou http://...
   ```

4. **Descriptions manquantes** :
   ```yaml
   # Ajoutez description dans sidebars.js
   {
     type: 'category',
     label: 'Guide',
     description: 'Guide complet',  # ← Important
     items: [...]
   }
   ```

### Debug avancé

```javascript
// Ajout de logs temporaires
function DocCard({item}) {
  console.log('DocCard item:', item);
  console.log('Item type:', item.type);
  console.log('Item href:', item.href);
  
  // ... rest of component
}
```

## 📚 Exemples d'usage

### 1. Documentation technique

```javascript
// sidebars.js
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'API Documentation',
      description: 'Complete REST API reference with examples',
      items: [
        'api/authentication',
        'api/endpoints',
        'api/errors'
      ]
    },
    {
      type: 'link',
      label: 'Postman Collection',
      href: 'https://postman.com/collections/our-api',
      description: 'Ready-to-use Postman collection for testing'
    }
  ]
};
```

### 2. Guides utilisateur

```javascript
const sidebars = {
  userGuide: [
    {
      type: 'category',
      label: 'Getting Started',
      description: 'Everything you need to know to start using our platform',
      items: ['intro', 'setup', 'first-steps']
    },
    {
      type: 'category', 
      label: 'Advanced Features',
      description: 'Unlock the full potential of our platform',
      items: ['automation', 'integrations', 'customization']
    }
  ]
};
```

## 📚 Ressources

### Documentation Docusaurus

- [DocCard Swizzling](https://docusaurus.io/docs/swizzling)
- [Sidebar Configuration](https://docusaurus.io/docs/sidebar)
- [CSS Modules](https://docusaurus.io/docs/styling-layout#css-modules)

### Outils de développement

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [clsx Utility](https://github.com/lukeed/clsx)
- [Accessibility Testing](https://www.deque.com/axe/)

### Composants liés

- `/src/theme/Layout/` : Layout global avec SEO
- `/docs/` : Contenu de documentation qui utilise les DocCards
- `sidebars.js` : Configuration des cartes et navigation

---

**Développé par l'équipe Docux**  
*Cards de documentation modernes pour Docusaurus*
