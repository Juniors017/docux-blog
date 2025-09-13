# Docusaurus – Plugin Simple Analytics

Ce plugin ajoute [Simple Analytics](https://simpleanalytics.com/) à un site Docusaurus,  
avec la possibilité de désactiver le tracking **page par page** via le frontmatter.

---

## ⚙️ Installation

Le plugin est déjà inclus dans le dossier `plugins/simple-analytics`.  
Il suffit de l’activer dans `docusaurus.config.js` :

```js
// docusaurus.config.js
module.exports = {
  // ...
  plugins: [require.resolve("./plugins/simple-analytics")],
};
