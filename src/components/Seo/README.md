# Composant SEO Docusaurus - Guide Complet

Ce composant SEO avancé optimise automatiquement les métadonnées de votre site Docusaurus avec détection intelligente du type de page et panel de debug intégré.

## 🚀 Fonctionnalités

### Détection Automatique Multi-Types
- **Articles de blog** (`/blog/`) → Schema Article/BlogPosting
- **Pages de série** (`/series/`) → Schema ItemList/CollectionPage  
- **Page repository** (`/repository`) → Schema SoftwareApplication
- **Page d'accueil** (`/`) → Schema WebSite/Organization
- **Page de remerciements** (`/thanks`) → Schema AboutPage
- **Pages générales** → Schema WebPage

### Optimisations SEO Complètes
- **Meta tags** : Title, description, keywords, author
- **Open Graph** : og:title, og:description, og:image, og:type
- **Twitter Cards** : twitter:card, twitter:title, twitter:description
- **Schema.org JSON-LD** : Données structurées adaptées au contenu
- **Canonical URLs** : URLs canoniques automatiques

### Panel de Debug Avancé (Mode Développement)
- � **Détection en temps réel** du type de page
- 📊 **Métriques de performance** (temps de génération)
- 🎯 **Métadonnées dynamiques** affichées en direct
- ⚡ **Actions rapides** : Console JSON-LD, copie URL, test Google
- 🎨 **Interface toggle** pour masquer/afficher le panel

## 📦 Installation & Intégration

### Étape 1 : Fichiers requis
```
src/
├── components/
│   └── Seo/
│       ├── index.jsx          # Composant principal
│       └── README.md          # Cette documentation
└── theme/
    └── Layout/
        └── index.js           # Wrapper global (RECOMMANDÉ)
```

### Étape 2 : Intégration Globale (Recommandée)

**Créez `src/theme/Layout/index.js` :**

```jsx
import React from 'react';
import Layout from '@theme-original/Layout';
import Seo from '@site/src/components/Seo';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <Seo />
    </>
  );
}
```

**✅ Avantages de l'intégration globale :**
- SEO actif sur **toutes les pages** du site
- Panel de debug disponible partout
- Configuration unique, maintenance simplifiée
- Compatible avec toutes les routes Docusaurus

### Alternative : Intégration Spécifique

**Si vous préférez cibler seulement les articles, créez `src/theme/BlogPostPage/index.js` :**

```jsx
import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import Seo from '@site/src/components/Seo';

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <BlogPostPage {...props} />
      <Seo />
    </>
  );
}
```

**⚠️ Limitations de l'intégration spécifique :**
- SEO limité aux articles de blog uniquement
- Pas de SEO sur les pages docs, home, etc.
- Panel de debug absent sur les autres pages

## ⚙️ Configuration

### Configuration Automatique (Aucune action requise)

Le composant fonctionne **immédiatement** après installation, en utilisant :

1. **`docusaurus.config.js`** → Métadonnées du site (title, tagline, url, favicon)
2. **URL actuelle** → Détection automatique du type de page
3. **Frontmatter** → Métadonnées spécifiques par page/article
4. **Contexte Docusaurus** → Données du site et de navigation

### Frontmatter Supporté

**Pour les articles de blog :**
```markdown
---
title: "Guide Complet Docusaurus"
description: "Apprenez à maîtriser Docusaurus pour créer des sites performants"
image: "/img/docusaurus-guide.jpg"
keywords: ["docusaurus", "react", "documentation", "ssg"]
authors: ["john-doe", "jane-smith"]
tags: ["tutorial", "web-development", "documentation"]
date: 2024-08-24
---
```

**Pour les pages générales :**
```markdown
---
title: "À Propos"
description: "Découvrez notre équipe et notre mission"
image: "/img/about-hero.jpg"
keywords: ["équipe", "mission", "valeurs"]
---
```

**Pour les pages de série :**
```markdown
---
title: "Série React Avancé"
description: "Collection d'articles sur React et ses concepts avancés"
image: "/img/react-series.jpg"
seriesTitle: "React Avancé"
articleCount: 12
---
```

## � Fonctionnement Interne

### 1. Détection du Type de Page

```javascript
// Logique de détection basée sur l'URL
const pageType = useMemo(() => {
  if (pathname.includes('/blog/') && !pathname.endsWith('/blog/')) return 'blog-post';
  if (pathname.includes('/series/')) return 'series';
  if (pathname === '/repository') return 'repository';
  if (pathname === '/') return 'home';
  if (pathname === '/thanks') return 'thanks';
  return 'general';
}, [pathname]);
```

### 2. Génération des Métadonnées

**Sources par priorité :**
1. **Frontmatter de la page** (priorité maximale)
2. **Configuration Docusaurus** (fallback)
3. **Valeurs par défaut** (sécurité)

### 3. Schema.org JSON-LD

**Exemple pour un article de blog :**
```json
{
  "@context": "https://schema.org",
  "@type": ["Article", "BlogPosting"],
  "headline": "Guide Complet Docusaurus",
  "description": "Apprenez à maîtriser Docusaurus...",
  "image": "https://monsite.com/img/docusaurus-guide.jpg",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Mon Site",
    "logo": "https://monsite.com/img/logo.svg"
  },
  "datePublished": "2024-08-24",
  "mainEntityOfPage": "https://monsite.com/blog/guide-docusaurus"
}
```

## 🐛 Panel de Debug

### Activation
- **Environnement** : Automatique en mode développement (`npm start`)
- **Position** : Coin inférieur droit, toggle pour masquer/afficher
- **Shortcut** : Clic sur l'icône pour basculer l'affichage

### Informations Affichées

1. **🎯 Type de page** : blog-post, series, repository, home, thanks, general
2. **⏱️ Performance** : Temps de génération des métadonnées (ms)
3. **📋 Métadonnées** : Title, description, image, URL canonique
4. **🔗 Actions rapides** :
   - **📋 JSON-LD** : Console.log des données structurées
   - **📎 URL** : Copie l'URL actuelle
   - **🔍 Test SEO** : Ouvre Google Rich Results Test

### Interface du Panel

```
┌─ 🐛 SEO Debug ──────────────── [×] ┐
│ 🎯 Type: blog-post (⏱️ 2ms)         │
│ 📋 Title: Guide Complet Docusaurus  │
│ 📝 Description: Apprenez à maîtr... │
│ 🖼️ Image: /img/guide.jpg           │
│ 🔗 Canonical: /blog/guide          │
│                                     │
│ Actions: [📋 JSON-LD] [📎 URL] [🔍] │
│ 💡 📋=Console 📎=Copie 🔍=Google   │
└─────────────────────────────────────┘
```

## 🔄 Relation Layout ↔ BlogPostPage

### Architecture Actuelle (Layout Global)

```
Layout (Wrapper Global)
├── SEO Component ✅
└── Page Content
    ├── HomePage
    ├── BlogPostPage
    ├── DocsPage
    └── Autres pages
```

**✅ Tous bénéficient du SEO automatiquement**

### Architecture Alternative (BlogPostPage Spécifique)

```
├── HomePage (pas de SEO) ❌
├── BlogPostPage
│   ├── SEO Component ✅
│   └── Article Content
├── DocsPage (pas de SEO) ❌
└── Autres pages (pas de SEO) ❌
```

**❌ Seuls les articles de blog ont le SEO**

### Pourquoi Layout est Recommandé

1. **Couverture complète** : SEO sur tout le site
2. **Maintenance** : Une seule intégration à gérer
3. **Performance** : Pas de duplication de code
4. **Debug** : Panel disponible partout
5. **Évolutivité** : Nouveau contenu = SEO automatique

### Comment Ça Fonctionne

#### 1. Layout (Wrapper Global)
- **Rôle** : Point d'entrée unique pour toutes les pages
- **Avantage** : Injection automatique du composant SEO
- **Portée** : 100% du site (home, blog, docs, pages custom)

#### 2. BlogPostPage (Wrapper Spécifique)
- **Rôle** : Uniquement pour les articles de blog
- **Avantage** : Contrôle précis sur les articles
- **Portée** : Seulement `/blog/*` routes

#### 3. Flux de Données
```
URL Change → useLocation Hook → Page Type Detection → SEO Generation
    ↓
docusaurus.config.js + Frontmatter → Metadata Merge → Head Injection
    ↓
Schema.org + Open Graph + Twitter Cards → SEO Complete
```
    {
      "@type": "Person",
      "name": "Kiki",
      "url": "/docux-blog/blog/authors/kiki/",
      "image": "/docux-blog/img/kiki.png",
      "jobTitle": "Docusaurus Contributor"
    }
  ],
  "datePublished": "2025-08-24",
  "keywords": "docusaurus, react, ssg"
}
```

### Balises Open Graph
```html
<meta property="og:title" content="Votre titre" />
<meta property="og:description" content="Votre description" />
<meta property="og:type" content="article" />
<meta property="og:image" content="/img/votre-image.png" />
<meta property="og:url" content="https://juniors017.github.io/docux-blog/blog/votre-slug/" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Votre titre" />
<meta name="twitter:description" content="Votre description" />
<meta name="twitter:image" content="/img/votre-image.png" />
```

## 🎨 Personnalisation des styles

### Modifier les styles des auteurs

```css
/* Dans votre CSS personnalisé */
.page-authors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  padding: 1rem;
  background: var(--ifm-background-surface-color);
  border-radius: 8px;
}

.author-card {
  text-align: center;
  padding: 1rem;
}

.author-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--ifm-color-primary);
}

.author-name {
  color: var(--ifm-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.author-role {
  color: var(--ifm-color-secondary);
  font-style: italic;
}
```

## 🔧 Configuration avancée

### Personnaliser les URLs d'auteurs

Modifiez la logique dans le composant :

```jsx
const authors = (meta.authors || []).map((name) => {
  const lower = name.toLowerCase();
  return {
    name,
    url: `/team/${lower}/`, // URL personnalisée
    image: `/img/team/${lower}.jpg`, // Dossier personnalisé
    jobTitle: getAuthorRole(lower), // Fonction personnalisée
  };
});
```

### Ajouter des métadonnées personnalisées

```jsx
const jsonLd = {
  // ... métadonnées existantes
  "publisher": {
    "@type": "Organization",
    "name": "Votre Organisation",
    "logo": {
      "@type": "ImageObject",
      "url": "https://votre-site.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": pageUrl
  }
};
```

## 🐛 Dépannage

### Erreur "useBlogPost is not a function"
```jsx
// Vérifiez l'import
import { useBlogPost, useDoc } from '@docusaurus/theme-common/internal';

// Ou utilisez la vérification conditionnelle
const blog = useBlogPost?.();
```

### Images d'auteurs non trouvées
- Vérifiez que les images sont dans `static/img/`
- Les noms de fichiers doivent correspondre aux noms d'auteurs en minuscules
- Formats supportés : `.png`, `.jpg`, `.jpeg`, `.webp`

### Données structurées non validées
- Testez avec [Google Rich Results Test](https://search.google.com/test/rich-results)
- Vérifiez la syntaxe JSON-LD dans la console du navigateur

## � Installation sur un Autre Site

### 📋 Checklist de Migration

#### ✅ **Étape 1 : Copier les Fichiers**
```bash
# Fichiers à copier vers votre nouveau site
src/components/Seo/
├── index.jsx          # Composant principal
└── README.md          # Documentation

src/theme/Layout/
└── index.js           # Intégration globale (recommandée)
```

#### ✅ **Étape 2 : Adapter la Configuration**

**Modifiez `docusaurus.config.js` avec vos valeurs :**

```javascript
module.exports = {
  title: 'Votre Nouveau Site',           // ← MODIFIER
  tagline: 'Votre tagline personnalisé', // ← MODIFIER
  url: 'https://votre-domaine.com',      // ← MODIFIER
  baseUrl: '/',                          // ← MODIFIER (si pas en sous-dossier)
  
  favicon: 'img/votre-favicon.ico',      // ← MODIFIER
  
  themeConfig: {
    metadata: [
      {name: 'keywords', content: 'vos, mots, clés'},     // ← MODIFIER
      {name: 'description', content: 'Votre description'}, // ← MODIFIER
      {name: 'author', content: 'Votre Nom'},            // ← MODIFIER
      {name: 'twitter:site', content: '@votre_compte'},   // ← MODIFIER
      {property: 'og:site_name', content: 'Votre Site'}, // ← MODIFIER
    ],
  },
};
```

#### ✅ **Étape 3 : Ajouter vos Assets**

**Créez vos images dans `static/img/` :**
```
static/img/
├── logo.svg              # Logo du site
├── favicon.ico           # Favicon
├── og-default.jpg        # Image Open Graph par défaut (1200x630px)
└── blog/                 # Images pour articles (optionnel)
    ├── article1.jpg
    └── article2.jpg
```

#### ✅ **Étape 4 : Adapter les Routes (Si Nécessaire)**

**Si votre site a des routes spécifiques, modifiez dans `src/components/Seo/index.jsx` :**

```javascript
const pageType = useMemo(() => {
  if (pathname.includes('/blog/')) return 'blog-post';
  if (pathname.includes('/docs/')) return 'documentation';  // ← NOUVEAU
  if (pathname.includes('/guides/')) return 'guide';        // ← NOUVEAU
  if (pathname.includes('/portfolio/')) return 'portfolio'; // ← NOUVEAU
  if (pathname === '/contact') return 'contact';            // ← NOUVEAU
  if (pathname === '/') return 'home';
  return 'general';
}, [pathname]);
```

#### ✅ **Étape 5 : Auteurs (Si Blog)**

**Modifiez `blog/authors.yml` avec vos auteurs :**
```yaml
votre-nom:
  name: Votre Nom
  title: Votre Titre
  url: https://github.com/votre-username
  image_url: /img/votre-photo.jpg

autre-auteur:
  name: Autre Auteur
  title: Son Titre
  url: https://github.com/autre-username
  image_url: /img/autre-photo.jpg
```

### 🔧 Variables à Personnaliser

#### **Automatiques (Aucune Modification)**
- URL actuelle (détectée par `useLocation`)
- Frontmatter des pages (lu automatiquement)
- Contexte Docusaurus (récupéré automatiquement)

#### **À Personnaliser Manuellement**
1. **Configuration site** → `docusaurus.config.js`
2. **Images** → `static/img/`
3. **Auteurs** → `blog/authors.yml`
4. **Types de pages** → Logique dans le composant (si routes custom)
5. **Schémas JSON-LD** → Selon vos besoins métier

### ⚠️ Points d'Attention

#### **Base URL Personnalisée**
```javascript
// Si votre site n'est pas à la racine du domaine
module.exports = {
  baseUrl: '/mon-sous-dossier/', // ← Important pour les URLs
};
```

#### **Image par Défaut**
```javascript
// Assurez-vous d'avoir une image Open Graph par défaut
const defaultImage = '/img/og-default.jpg'; // ← Créez cette image (1200x630px)
```

#### **Environnements**
- **Développement** : Panel de debug visible sur `localhost`
- **Production** : Seules les métadonnées SEO sont générées

### 🚀 Installation Express

```bash
# 1. Naviguer vers votre nouveau site
cd /chemin/vers/nouveau-site

# 2. Copier les fichiers SEO
mkdir -p src/components/Seo src/theme/Layout
# Copiez index.jsx et README.md dans src/components/Seo/
# Copiez index.js dans src/theme/Layout/

# 3. Modifier docusaurus.config.js (manuellement)
# Éditez avec vos valeurs (titre, URL, métadonnées)

# 4. Ajouter vos images
mkdir -p static/img
# Copiez logo.svg, favicon.ico, og-default.jpg

# 5. Tester l'installation
npm start
# → Vérifiez le panel de debug en bas à droite
# → Testez les actions rapides (📋 📎 🔍)
```

### ✅ Validation de l'Installation

Une fois installé, vous devriez voir :

1. **🐛 Panel de debug** en bas à droite (mode dev)
2. **🎯 Type de page** détecté correctement
3. **📋 Métadonnées** affichées dynamiquement
4. **⚡ Actions rapides** fonctionnelles
5. **🔍 Test Google** validant vos métadonnées

Le composant est **100% portable** - il s'adapte automatiquement à votre configuration Docusaurus ! 🎯

## �📚 Ressources

- [Documentation Docusaurus](https://docusaurus.io/docs)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Google SEO Guidelines](https://developers.google.com/search/docs)

## 🤝 Contribution

Pour contribuer à ce composant :

1. Fork le repository
2. Créez une branche feature (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Créez une Pull Request

## 📄 Licence

Ce composant est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour la communauté Docusaurus**
