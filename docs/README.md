# 📚 Documentation Docux Blog

Bienvenue dans la documentation complète du système de blog Docux. Cette documentation couvre tous les aspects techniques, les outils d'automatisation et les guides d'utilisation.

## 🚀 Guide de Démarrage Rapide

### Installation
```bash
git clone https://github.com/Juniors017/docux-blog.git
cd docux-blog
npm install
npm start
```

### Première Utilisation
```bash
# Créer votre premier article automatiquement
node scripts/create-article.js

# Ou en mode rapide
node scripts/quick-article.js blog "Mon Premier Article"
```

## 📖 Documentation par Catégorie

### 🛠️ Scripts d'Automatisation
- **[README Scripts](../scripts/README.md)** - Documentation technique complète des scripts
- **[Workflow de Création](./CREATION-WORKFLOW.md)** - Guide d'utilisation pratique
- **[Article Blog : Scripts d'Automatisation](../blog/2025/08/29/scripts-automatisation-articles-seo/index.mdx)** - Guide utilisateur détaillé

### 🔍 SEO et Métadonnées
- **[Component SEO](../src/components/Seo/README.md)** - Documentation technique du composant
- **[Article Blog : Architecture SEO](../blog/2025/08/29/seotools/index.mdx)** - Guide complet de l'architecture SEO
- **[Article Blog : Guide Complet](../blog/2025/08/29/architecture-seo-docusaurus-guide-complet/index.mdx)** - Documentation utilisateur

### 🎨 Développement et Customisation
- **[Snippets VS Code](../.vscode/docusaurus-snippets.json)** - Templates pour VS Code
- **[Configuration VS Code](../.vscode/settings.json)** - Paramètres optimisés
- **[Thème personnalisé](../src/theme/)** - Composants React personnalisés

## 🎯 Guides par Objectif

### Je veux créer du contenu rapidement
1. **[Scripts d'automatisation](../scripts/README.md)** - Outils automatisés
2. **[Snippets VS Code](./CREATION-WORKFLOW.md#création-avec-snippets)** - Templates intégrés
3. **[Workflow recommandé](./CREATION-WORKFLOW.md#workflow-recommandé)** - Processus optimisé

### Je veux optimiser le SEO
1. **[Architecture SEO](../blog/2025/08/29/architecture-seo-docusaurus-guide-complet/index.mdx)** - Vue d'ensemble
2. **[Component SEO](../src/components/Seo/README.md)** - Documentation technique
3. **[Schémas supportés](../blog/2025/08/29/seotools/index.mdx#schemas-supportés)** - Types de contenu

### Je veux personnaliser le blog
1. **[Configuration Docusaurus](../docusaurus.config.js)** - Paramètres principaux
2. **[Thème personnalisé](../src/theme/)** - Composants React
3. **[CSS custom](../src/css/custom.css)** - Styles personnalisés

## 🔧 Référence Technique

### Scripts Node.js
| Script | Fonction | Usage |
|--------|----------|--------|
| `create-article.js` | Création interactive | Mode guidé complet |
| `quick-article.js` | Création rapide | Ligne de commande |

### Composants React
| Composant | Localisation | Description |
|-----------|--------------|-------------|
| `Seo` | `src/components/Seo/` | Métadonnées et schémas JSON-LD |
| `Hero` | `src/components/Hero/` | Bannière d'accueil |
| `Timeline` | `src/components/Timeline/` | Affichage chronologique |

### Configuration
| Fichier | Description |
|---------|-------------|
| `docusaurus.config.js` | Configuration principale |
| `sidebars.js` | Navigation documentation |
| `package.json` | Dépendances et scripts |

## 📊 Métriques et Performance

### Scripts d'Automatisation
- **98% de temps économisé** sur la création d'articles
- **100% de conformité SEO** par défaut
- **7 types d'articles** supportés
- **0 erreur** de configuration

### SEO et Rich Results
- **9 schémas JSON-LD** supportés
- **100% validation Google** Search Console
- **Métadonnées multilingues** (fr-FR)
- **Breadcrumbs structurés** automatiques

## 🤝 Contribution

### Structure du Projet
```
docux-blog/
├── scripts/          # Scripts d'automatisation
├── src/
│   ├── components/   # Composants React
│   ├── theme/        # Surcharges de thème
│   └── css/          # Styles personnalisés
├── blog/             # Articles de blog
├── docs/             # Documentation
└── static/           # Ressources statiques
```

### Standards de Code
- **ESLint** et **Prettier** pour la cohérence
- **TypeScript** pour la sécurité de types (où applicable)
- **Documentation** inline obligatoire
- **Tests** pour les fonctionnalités critiques

### Workflow Git
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
npm test

# Commit avec convention
git commit -m "feat: nouvelle fonctionnalité"

# Pull Request vers main
```

## 🐛 Dépannage

### Erreurs Communes

**"Directory already exists"**
```bash
# Solution
rm -rf blog/YYYY/MM/DD/article-existant/
```

**"Schema validation failed"**
```bash
# Vérifier le frontmatter et les schémas supportés
node scripts/create-article.js --validate
```

**"Build failed"**
```bash
# Nettoyer et rebuilder
npm run clear && npm run build
```

### Support
- 📧 **Issues GitHub** : [Créer un ticket](https://github.com/Juniors017/docux-blog/issues)
- 💬 **Discussions** : [Participer aux discussions](https://github.com/Juniors017/docux-blog/discussions)
- 📖 **Wiki** : [Consulter le wiki](https://github.com/Juniors017/docux-blog/wiki)

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir [LICENSE](../LICENSE) pour plus de détails.

---

*Documentation maintenue par l'équipe **Docux** - Dernière mise à jour : 29 août 2025*

*🔗 Contribuez à cette documentation en créant une Pull Request !*
