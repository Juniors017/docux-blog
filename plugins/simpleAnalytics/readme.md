# Plugin Simple Analytics

Ce plugin local permet d'intégrer [Simple Analytics](https://simpleanalytics.com/) à un site Docusaurus.

Il gère l'injection du script principal ainsi que le suivi des changements de page dans le contexte d'une application à page unique (SPA), ce qui est essentiel pour Docusaurus.

## Structure du plugin

```
plugins/
└── simpleAnalytics/
    ├── index.js      # Fichier principal du plugin Docusaurus
    └── sa-client.js  # Module client pour le suivi de la navigation SPA
```

## Installation

Ce plugin est un plugin local. Il n'y a pas besoin de l'installer via npm ou yarn. Il suffit de s'assurer que le dossier `simpleAnalytics` se trouve dans le répertoire `plugins` à la racine de votre projet.

## Configuration

Pour activer le plugin, ajoutez son chemin d'accès au tableau `plugins` dans votre fichier `docusaurus.config.js`.

````javascript
// filepath: docusaurus.config.js
// ...existing code...
const config = {
  // ...
  plugins: [
    // ... autres plugins
    './plugins/simpleAnalytics',
  ],
  // ...
};
// ...existing code...
````

## Fonctionnement détaillé : `index.js` vs `sa-client.js`

Le plugin sépare la logique en deux fichiers distincts, car ils s'exécutent dans des environnements différents et à des moments différents.

### `index.js` (Côté Serveur / Build)

Ce fichier est le cœur du plugin et s'exécute dans un environnement Node.js lors du démarrage du serveur de développement ou de la compilation du site (`docusaurus build`).

Son rôle est de s'intégrer au processus de construction de Docusaurus :

1.  **`injectHtmlTags()`** : Cette fonction injecte le script principal de Simple Analytics et la balise `<noscript>` directement dans le fichier HTML final. C'est ce qui permet de suivre la **première visite** d'un utilisateur sur le site.
2.  **`getClientModules()`** : Cette fonction indique à Docusaurus qu'il doit inclure un autre fichier JavaScript, `sa-client.js`, dans le code qui sera envoyé et exécuté par le navigateur de l'utilisateur.

En résumé, `index.js` s'occupe de la configuration initiale et statique.

### `sa-client.js` (Côté Client / Navigateur)

Ce fichier s'exécute **uniquement dans le navigateur de l'utilisateur**. Son existence est cruciale car Docusaurus fonctionne comme une Application à Page Unique (SPA).

Son rôle est de gérer le suivi de la navigation **après le chargement initial de la page** :

1.  **Écoute des changements de route** : Dans une SPA, changer de page ne recharge pas entièrement le HTML. Ce script écoute donc les événements de navigation internes de Docusaurus.
2.  **Déclenchement des vues de page** : Lorsqu'un utilisateur navigue vers une nouvelle page (par exemple, de `/accueil` à `/blog/mon-article`), ce script appelle la fonction de suivi de Simple Analytics (ex: `window.sa_pageview()`) pour signaler manuellement qu'une nouvelle "vue de page" a eu lieu.

Sans `sa-client.js`, seul le premier accès au site serait comptabilisé, et toutes les navigations ultérieures au sein du site seraient ignorées par Simple Analytics.

## Alternative : Pourquoi ne pas modifier le composant `Layout` ?

Une autre méthode pour suivre la navigation dans une application à page unique (SPA) comme Docusaurus consiste à personnaliser (swizzler) le composant `Layout` et à y insérer un `useEffect` de React qui écoute les changements d'URL.

Cependant, cette approche présente des inconvénients :

*   **Couplage fort** : Elle mélange la logique de suivi analytique avec la logique de présentation de votre thème.
*   **Moins de robustesse** : Toute modification majeure de votre thème ou du composant `Layout` pourrait casser le suivi.

L'approche de ce plugin, utilisant `getClientModules`, est la méthode recommandée par Docusaurus. Elle est plus propre et plus robuste car elle découple complètement la fonctionnalité de suivi du thème et des composants React. Votre suivi continue de fonctionner même si vous changez radicalement l'apparence de votre site.

