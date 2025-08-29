#!/usr/bin/env node

/**
 * 📝 Générateur d'Articles Docusaurus avec Frontmatter SEO
 * 
 * Outil CLI pour créer automatiquement des articles avec frontmatter
 * optimisé selon le type de schéma souhaité.
 * 
 * Usage: node scripts/create-article.js
 * 
 * Développé par Docux - Architecture SEO v2.1.4
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration des templates par schemaType
const SCHEMA_TEMPLATES = {
  BlogPosting: {
    name: "Article de Blog",
    description: "Article personnel ou actualité",
    frontmatter: {
      schemaTypes: ["BlogPosting"],
      genre: "Technology Blog",
      audience: "Développeurs web",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      readingTime: "5 min",
      articleSection: "Blog",
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: "Docux"
    },
    template: "blog-post"
  },
  
  TechArticle: {
    name: "Article Technique",
    description: "Tutoriel ou guide technique",
    frontmatter: {
      schemaTypes: ["TechArticle", "BlogPosting"],
      proficiencyLevel: "Intermediate",
      programmingLanguage: ["JavaScript"],
      timeRequired: "PT30M",
      audience: "Développeurs web",
      learningResourceType: "Tutorial",
      educationalLevel: "Intermediate",
      educationalUse: "Professional Development",
      applicationCategory: "DeveloperApplication",
      operatingSystem: ["Windows", "macOS", "Linux"],
      browserRequirements: "Navigateur moderne avec support ES2020+"
    },
    template: "tech-article"
  },
  
  HowTo: {
    name: "Guide Pratique",
    description: "Guide étape par étape",
    frontmatter: {
      schemaTypes: ["HowTo", "TechArticle"],
      difficulty: "Beginner",
      totalTime: "PT1H",
      prepTime: "PT15M", 
      performTime: "PT45M",
      estimatedCost: "Gratuit",
      tool: ["Ordinateur", "Éditeur de code"],
      supply: ["Node.js", "npm"],
      yield: "Application fonctionnelle",
      audience: "Développeurs débutants",
      proficiencyLevel: "Beginner"
    },
    template: "howto-guide"
  },
  
  FAQPage: {
    name: "Page FAQ",
    description: "Questions/Réponses fréquentes",
    frontmatter: {
      schemaTypes: ["FAQPage", "BlogPosting"],
      genre: "FAQ Technology",
      audience: "Utilisateurs, Développeurs",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      articleSection: "Support",
      faq: [
        {
          question: "Question exemple ?",
          answer: "Réponse détaillée ici."
        }
      ]
    },
    template: "faq-page"
  },
  
  CollectionPage: {
    name: "Page Collection",
    description: "Liste de projets ou ressources",
    frontmatter: {
      schemaTypes: ["CollectionPage"],
      numberOfItems: 10,
      collectionSize: 10,
      genre: "Educational Content",
      license: "MIT",
      programmingLanguage: ["JavaScript", "TypeScript"],
      applicationCategory: "DeveloperApplication",
      specialty: "Web Development",
      audience: "Développeurs web",
      learningResourceType: "Code Examples",
      educationalUse: "Study and Practice",
      isAccessibleForFree: true
    },
    template: "collection-page"
  },
  
  SoftwareApplication: {
    name: "Application/Logiciel",
    description: "Présentation d'une application",
    frontmatter: {
      schemaTypes: ["SoftwareApplication", "TechArticle"],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform",
      programmingLanguage: ["JavaScript"],
      softwareVersion: "1.0.0",
      license: "MIT",
      downloadUrl: "https://github.com/user/repo",
      codeRepository: "https://github.com/user/repo"
    },
    template: "software-app"
  },
  
  Course: {
    name: "Cours/Formation",
    description: "Contenu éducatif structuré",
    frontmatter: {
      schemaTypes: ["Course", "TechArticle"],
      courseMode: "online",
      educationalLevel: "Intermediate",
      instructor: "Docux",
      timeRequired: "PT4H",
      coursePrerequisites: "Connaissances de base JavaScript",
      audience: "Développeurs web",
      learningResourceType: "Course",
      educationalUse: "Professional Development"
    },
    template: "course"
  },
  
  WebPage: {
    name: "Page Web Statique",
    description: "Page d'accueil ou page informative",
    frontmatter: {
      schemaTypes: ["WebPage"],
      genre: "Informational Content",
      audience: "Visiteurs web",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: "Docux",
      mainContentOfPage: true,
      significantLink: []
    },
    template: "webpage"
  },
  
  AboutPage: {
    name: "Page À Propos",
    description: "Page de présentation ou remerciements",
    frontmatter: {
      schemaTypes: ["AboutPage", "WebPage"],
      genre: "About Content",
      audience: "Visiteurs web",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      subject: "À propos de Docux",
      copyrightYear: new Date().getFullYear(),
      copyrightHolder: "Docux"
    },
    template: "about-page"
  },
  
  ItemListPage: {
    name: "Page Liste d'Éléments",
    description: "Page listant des articles de série ou catégorie",
    frontmatter: {
      schemaTypes: ["ItemListPage", "CollectionPage"],
      numberOfItems: 0,
      itemListOrder: "ItemListOrderAscending",
      genre: "Educational Content",
      audience: "Développeurs web",
      inLanguage: "fr-FR",
      isAccessibleForFree: true,
      specialty: "Web Development"
    },
    template: "itemlist-page"
  }
};

// Interface CLI - Créée seulement quand nécessaire
let rl = null;

function question(prompt) {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log(`
🚀 Générateur d'Articles Docusaurus - SEO v2.1.4
===============================================

Créez automatiquement des articles avec frontmatter optimisé !
`);

  try {
    // 1. Sélection du type de schéma
    console.log("📋 Types de schémas disponibles :");
    Object.entries(SCHEMA_TEMPLATES).forEach(([key, template], index) => {
      console.log(`${index + 1}. ${template.name} - ${template.description}`);
    });
    
    const schemaChoice = await question("\n🎯 Choisissez un type (1-11) : ");
    const schemaKeys = Object.keys(SCHEMA_TEMPLATES);
    const selectedSchema = schemaKeys[parseInt(schemaChoice) - 1];
    
    if (!selectedSchema) {
      throw new Error("Choix invalide");
    }
    
    const template = SCHEMA_TEMPLATES[selectedSchema];
    console.log(`\n✅ Sélectionné : ${template.name}`);
    
    // 2. Informations de base
    const title = await question("\n📝 Titre de l'article : ");
    const description = await question("📄 Description : ");
    const slug = await question("🔗 Slug (optionnel, sera généré automatiquement si vide) : ");
    const authors = await question("👤 Auteur(s) (séparés par des virgules) [docux] : ") || "docux";
    const tags = await question("🏷️  Tags (séparés par des virgules) : ");
    const category = await question("📂 Catégorie : ");
    
    // 3. Questions spécifiques selon le schéma
    const customFrontmatter = await askSchemaSpecificQuestions(selectedSchema, template);
    
    // 4. Génération du fichier
    const articleData = {
      title,
      description,
      slug: slug || generateSlug(title),
      authors: authors.split(',').map(a => a.trim()),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category,
      schemaType: selectedSchema,
      template: template.frontmatter,
      custom: customFrontmatter
    };
    
    await createArticle(articleData);
    
  } catch (error) {
    console.error("❌ Erreur :", error.message);
  } finally {
    if (rl) {
      rl.close();
      rl = null;
    }
  }
}

async function askSchemaSpecificQuestions(schemaType, template) {
  const custom = {};
  
  console.log(`\n🔧 Configuration spécifique pour ${template.name} :`);
  
  switch (schemaType) {
    case 'TechArticle':
      const level = await question("📊 Niveau de difficulté (Beginner/Intermediate/Advanced) [Intermediate] : ") || "Intermediate";
      const languages = await question("💻 Langages de programmation (séparés par des virgules) [JavaScript] : ") || "JavaScript";
      const timeReq = await question("⏱️  Temps requis (format PT30M pour 30 min) [PT30M] : ") || "PT30M";
      
      custom.proficiencyLevel = level;
      custom.programmingLanguage = languages.split(',').map(l => l.trim());
      custom.timeRequired = timeReq;
      break;
      
    case 'HowTo':
      const difficulty = await question("📊 Difficulté (Beginner/Intermediate/Advanced) [Beginner] : ") || "Beginner";
      const totalTime = await question("⏱️  Temps total (PT1H pour 1 heure) [PT1H] : ") || "PT1H";
      const tools = await question("🛠️  Outils nécessaires (séparés par des virgules) : ");
      const result = await question("🎯 Résultat attendu : ");
      
      custom.difficulty = difficulty;
      custom.totalTime = totalTime;
      if (tools) custom.tool = tools.split(',').map(t => t.trim());
      if (result) custom.yield = result;
      break;
      
    case 'CollectionPage':
      const numItems = await question("📊 Nombre d'éléments dans la collection [10] : ") || "10";
      const license = await question("📜 Licence des projets [MIT] : ") || "MIT";
      
      custom.numberOfItems = parseInt(numItems);
      custom.license = license;
      break;
      
    case 'SoftwareApplication':
      const version = await question("🔢 Version du logiciel [1.0.0] : ") || "1.0.0";
      const repoUrl = await question("🔗 URL du repository GitHub : ");
      
      custom.softwareVersion = version;
      if (repoUrl) {
        custom.codeRepository = repoUrl;
        custom.downloadUrl = repoUrl;
      }
      break;
      
    case 'WebPage':
      const pageType = await question("🏷️ Type de page (informative/landing/contact) [informative] : ") || "informative";
      const significantLinks = await question("🔗 Liens importants (séparés par des virgules) : ");
      
      custom.mainContentOfPage = true;
      if (significantLinks) custom.significantLink = significantLinks.split(',').map(l => l.trim());
      break;
      
    case 'AboutPage':
      const subject = await question("📋 Sujet principal de la page : ");
      const organization = await question("🏢 Organisation/Projet [Docux] : ") || "Docux";
      
      if (subject) custom.subject = subject;
      custom.about = organization;
      break;
      
    case 'ItemListPage':
      const itemCount = await question("📊 Nombre d'éléments dans la liste : ");
      const listOrder = await question("📋 Ordre de tri (ascending/descending) [ascending] : ") || "ascending";
      
      if (itemCount) custom.numberOfItems = parseInt(itemCount);
      custom.itemListOrder = listOrder === "descending" ? "ItemListOrderDescending" : "ItemListOrderAscending";
      break;
  }
  
  return custom;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function createArticle(data) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Chemin du répertoire
  const articleDir = path.join(process.cwd(), 'blog', year.toString(), month, day, data.slug);
  
  // Créer le répertoire
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }
  
  // Fusionner frontmatter
  const frontmatter = {
    ...data.template,
    ...data.custom,
    title: data.title,
    description: data.description,
    slug: data.slug,
    authors: data.authors,
    tags: data.tags,
    category: data.category,
    date: `${year}-${month}-${day}`,
    last_update: {
      date: `${year}-${month}-${day}`,
      author: data.authors[0]
    },
    keywords: data.tags
  };
  
  // Générer le contenu
  const content = generateArticleContent(data.schemaType, frontmatter);
  
  // Écrire le fichier
  const filePath = path.join(articleDir, 'index.mdx');
  fs.writeFileSync(filePath, content);
  
  console.log(`\n🎉 Article créé avec succès !`);
  console.log(`📁 Répertoire : ${articleDir}`);
  console.log(`📄 Fichier : ${filePath}`);
  console.log(`🔗 URL future : /blog/${data.slug}/`);
}

function generateArticleContent(schemaType, frontmatter) {
  // Formatage YAML du frontmatter
  const yamlContent = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'faq') {
          return `${key}:\n${value.map(item => `  - question: "${item.question}"\n    answer: "${item.answer}"`).join('\n')}`;
        }
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      } else if (typeof value === 'object' && value !== null) {
        return `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${typeof v === 'string' ? `"${v}"` : v}`).join('\n')}`;
      } else if (typeof value === 'string') {
        return `${key}: "${value}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
  
  // Template de contenu selon le type
  const templates = {
    BlogPosting: `# ${frontmatter.title}

:::info À propos
Cet article fait partie du blog Docux sur le développement web moderne.
:::

## Introduction

Votre contenu ici...

## Développement

### Section 1

Détaillez votre sujet...

### Section 2

Continuez votre développement...

## Conclusion

Résumez les points clés...

---

*Article publié par **${frontmatter.authors[0]}** - ${frontmatter.date}*`,

    TechArticle: `# ${frontmatter.title}

:::tip Prérequis
- ✅ Connaissances : ${frontmatter.programmingLanguage?.join(', ')}
- ✅ Niveau : ${frontmatter.proficiencyLevel}
- ✅ Temps estimé : ${frontmatter.timeRequired?.replace('PT', '').replace('M', ' minutes').replace('H', ' heures')}
:::

## 🎯 Objectif

À la fin de ce tutoriel, vous saurez...

## 📋 Étape 1 : Préparation

### 1.1 Installation

\`\`\`bash
npm install package-example
\`\`\`

### 1.2 Configuration

\`\`\`javascript
// Configuration de base
const config = {
  // Votre config ici
};
\`\`\`

## 📋 Étape 2 : Implémentation

### 2.1 Code Principal

\`\`\`javascript
// Votre code ici
\`\`\`

## ✅ Résultat Final

Vous avez maintenant...

## 📚 Ressources Complémentaires

- [Documentation officielle]()
- [Repository GitHub]()

---

*Guide technique par **${frontmatter.authors[0]}** - Niveau ${frontmatter.proficiencyLevel}*`,

    HowTo: `# ${frontmatter.title}

:::info Informations du Guide
- ⏱️ **Temps total** : ${frontmatter.totalTime?.replace('PT', '').replace('M', ' minutes').replace('H', ' heures')}
- 📊 **Difficulté** : ${frontmatter.difficulty}
- 🎯 **Résultat** : ${frontmatter.yield}
:::

## 🛠️ Matériel Nécessaire

${frontmatter.tool?.map(tool => `- ${tool}`).join('\n') || '- À définir'}

## 📋 Étapes Détaillées

### Étape 1 : Préparation

Instructions détaillées...

### Étape 2 : Configuration

Instructions détaillées...

### Étape 3 : Exécution

Instructions détaillées...

## ✅ Vérification

Comment vérifier que tout fonctionne...

## 🎉 Félicitations !

Vous avez réussi à ${frontmatter.yield?.toLowerCase() || 'terminer le guide'} !

---

*Guide pratique par **${frontmatter.authors[0]}** - Difficulté ${frontmatter.difficulty}*`,

    FAQPage: `# ${frontmatter.title}

:::info À propos de cette FAQ
Cette page répond aux questions les plus fréquentes sur ${frontmatter.title.toLowerCase()}.
:::

## ❓ Questions Fréquentes

${frontmatter.faq?.map((item, index) => `### ${item.question}

**Réponse :** ${item.answer}

`).join('') || '### Question exemple ?\n\n**Réponse :** Réponse détaillée.\n'}

## 🆘 Besoin d'aide supplémentaire ?

Si votre question n'est pas dans cette FAQ :
- 📚 Consultez la documentation
- 💬 Posez votre question sur GitHub Discussions  
- 🐛 Signalez un bug via GitHub Issues

---

*FAQ mise à jour par **${frontmatter.authors[0]}** - ${frontmatter.date}*`,

    WebPage: `# ${frontmatter.title}

:::tip Navigation
Vous êtes sur une page principale du site Docux.
:::

## 🏠 Accueil

Contenu principal de la page...

## 📋 Sections

### Section 1

Détails importants...

### Section 2

Informations complémentaires...

## 🔗 Liens Utiles

- [Blog](/blog)
- [Séries d'articles](/series)
- [Projets Repository](/repository)

---

*Page mise à jour par **${frontmatter.authors[0]}** - ${frontmatter.date}*`,

    AboutPage: `# ${frontmatter.title}

:::info À propos
${frontmatter.description || 'Page de présentation du projet Docux'}
:::

## 👋 Présentation

Votre contenu de présentation...

## 🎯 Mission

Notre objectif...

## 🤝 Remerciements

Nous tenons à remercier...

## 📞 Contact

Pour nous contacter :
- 📧 Email : [contact@docux.com](mailto:contact@docux.com)
- 🐙 GitHub : [Docux Project](https://github.com/Juniors017/docux-blog)

---

*Page **${frontmatter.authors[0]}** - Dernière mise à jour : ${frontmatter.date}*`,

    ItemListPage: `# ${frontmatter.title}

:::tip Collection
Cette page présente une collection organisée d'articles sur ${frontmatter.title.toLowerCase()}.
:::

## 📋 Liste des Articles

### Vue d'ensemble

Découvrez tous les articles de cette collection...

### Articles Disponibles

1. **Article 1** - Description courte
2. **Article 2** - Description courte
3. **Article 3** - Description courte

## 🔍 Navigation

- ⬅️ [Retour aux collections](/series)
- 📝 [Tous les articles](/blog)

---

*Collection gérée par **${frontmatter.authors[0]}** - ${frontmatter.numberOfItems || 'Plusieurs'} articles*`
  };
  
  const template = templates[schemaType] || templates.BlogPosting;
  
  return `---
${yamlContent}
---

${template}`;
}

// Lancement du script
if (require.main === module) {
  main();
}

module.exports = { SCHEMA_TEMPLATES, generateSlug, generateArticleContent };
