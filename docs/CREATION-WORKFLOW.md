# 🚀 Guide d'Utilisation - Outils de Création d'Articles

## 📋 Scripts Disponibles

### 1. Script Interactif Complet
```bash
node scripts/create-article.js
```

**Utilisation** : Mode interactif avec questions détaillées
- Sélection du type de schéma
- Configuration automatique du frontmatter
- Génération du contenu de base
- Support de tous les types d'articles

### 2. Script Rapide
```bash
node scripts/quick-article.js [type] [titre]
```

**Exemples** :
```bash
node scripts/quick-article.js blog "Mon Nouvel Article"
node scripts/quick-article.js tech "Guide React Avancé"
node scripts/quick-article.js howto "Comment Installer Docker"
```

## 🎯 Snippets VS Code

### Activation
1. Ouvrir un fichier `.mdx` 
2. Taper le préfixe :
   - `doc-blog` → Article de blog
   - `doc-tech` → Article technique
   - `doc-howto` → Guide pas à pas

### Navigation
- `Tab` pour naviguer entre les champs
- Variables automatiques : date, année, etc.
- Suggestions intelligentes activées

## 📚 Types de Contenu Supportés

| Type | Script | Snippet | Description |
|------|--------|---------|-------------|
| **BlogPosting** | `blog` | `doc-blog` | Articles de blog standards |
| **TechArticle** | `tech` | `doc-tech` | Guides techniques approfondis |
| **HowTo** | `howto` | `doc-howto` | Tutoriels étape par étape |
| **FAQPage** | `faq` | - | Pages de questions/réponses |
| **CollectionPage** | `collection` | - | Pages de collection |
| **SoftwareApplication** | `software` | - | Documentation logiciel |
| **Course** | `course` | - | Cours et formations |

## ⚡ Workflow Recommandé

### Création Rapide
1. `node scripts/quick-article.js tech "Mon Guide"`
2. Ouvrir le fichier généré
3. Compléter le contenu

### Création Détaillée
1. `node scripts/create-article.js`
2. Suivre les questions interactives
3. Peaufiner le frontmatter si nécessaire

### Création avec Snippets
1. Créer un nouveau fichier `.mdx`
2. Taper `doc-` + `Tab`
3. Choisir le template
4. Compléter les champs

## 🔧 Personnalisation

### Modifier les Templates
- **Scripts** : Éditer `SCHEMA_TEMPLATES` dans `create-article.js`
- **Snippets** : Éditer `.vscode/docusaurus-snippets.json`

### Ajouter des Champs
- Frontmatter : Ajouter dans les templates
- Schémas : Référencer la documentation SEO

## 📖 Aide Contextuelle

### Frontmatter Intelligent
Chaque template inclut :
- ✅ Tous les champs requis pour le type de schéma
- ✅ Métadonnées SEO optimisées
- ✅ Configuration Google Rich Results
- ✅ Support multilingue (fr-FR)

### Validation Automatique
- Structure du frontmatter vérifiée
- Types de schémas valides
- Métadonnées complètes

---

*Pour plus d'informations, consultez la [documentation SEO complète](./blog/2025/08/29/seotools/index.mdx).*
