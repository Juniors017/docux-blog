#!/usr/bin/env node

/**
 * 🚀 Générateur d'Articles Rapide - Mode Non-Interactif
 * 
 * Créé rapidement des articles sans interaction utilisateur.
 * Utilise les mêmes templates que create-article.js avec des valeurs par défaut.
 * 
 * Usage: node scripts/quick-article.js [type] [title] [options]
 * Exemple: node scripts/quick-article.js TechArticle "Guide React Hooks"
 * 
 * Types supportés: BlogPosting, TechArticle, HowTo, FAQPage, 
 * CollectionPage, SoftwareApplication, Course, WebPage, AboutPage, ItemListPage
 * 
 * Développé par Docux - Version 2.1.4+
 */

const { SCHEMA_TEMPLATES, generateSlug, generateArticleContent } = require('./create-article.js');
const fs = require('fs');
const path = require('path');

function createQuickArticle(schemaType, title, options = {}) {
  if (!SCHEMA_TEMPLATES[schemaType]) {
    throw new Error(`Type de schéma invalide. Types disponibles: ${Object.keys(SCHEMA_TEMPLATES).join(', ')}`);
  }
  
  const template = SCHEMA_TEMPLATES[schemaType];
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const slug = options.slug || generateSlug(title);
  const articleDir = path.join(process.cwd(), 'blog', year.toString(), month, day, slug);
  
  // Créer le répertoire
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }
  
  // Frontmatter avec valeurs par défaut
  const frontmatter = {
    ...template.frontmatter,
    title,
    description: options.description || `Guide complet sur ${title}`,
    slug,
    authors: options.authors || ["docux"],
    tags: options.tags || [schemaType.toLowerCase()],
    category: options.category || "Tutorial",
    date: `${year}-${month}-${day}`,
    last_update: {
      date: `${year}-${month}-${day}`,
      author: options.authors?.[0] || "docux"
    },
    keywords: options.keywords || options.tags || [schemaType.toLowerCase()]
  };
  
  // Générer le contenu
  const content = generateArticleContent(schemaType, frontmatter);
  
  // Écrire le fichier
  const filePath = path.join(articleDir, 'index.mdx');
  fs.writeFileSync(filePath, content);
  
  return {
    path: filePath,
    url: `/blog/${slug}/`,
    directory: articleDir
  };
}

// Usage CLI
if (require.main === module) {
  const [,, schemaType, title, ...args] = process.argv;
  
  if (!schemaType || !title) {
    console.log(`
🚀 Générateur d'Articles Rapide
===============================

Usage: node scripts/quick-article.js [schemaType] [title] [options]

Types disponibles:
${Object.entries(SCHEMA_TEMPLATES).map(([key, template]) => `- ${key}: ${template.description}`).join('\n')}

Exemples:
  node scripts/quick-article.js TechArticle "Guide React Hooks"
  node scripts/quick-article.js HowTo "Comment créer une API REST"
  node scripts/quick-article.js BlogPosting "Mes réflexions sur React"
    `);
    process.exit(1);
  }
  
  try {
    const result = createQuickArticle(schemaType, title);
    console.log(`✅ Article "${title}" créé !`);
    console.log(`📁 ${result.path}`);
    console.log(`🔗 ${result.url}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { createQuickArticle };
