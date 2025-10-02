# remark-replace-words

Plugin Remark/MDX qui remplace certains mots par des composants MDX (ou texte) selon le contexte (blog / pages / docs) défini dans `replacements.json`.

> Depuis la migration de toutes les pages en **MDX**, le plugin couvre désormais toutes les pages de contenu au build (pages + blog). Les pages React `.jsx` ne sont plus utilisées.

## Fonctionnement

1. Détection du type de contenu via le chemin du fichier (`/blog/`, `/docs/`, sinon `pages`).
2. Fusion du mapping global `all` + mapping spécifique (ex: `blog`).
3. Traversée de l'AST : seuls les nœuds `text` qui ne sont pas descendants de zones interdites sont modifiés.
4. Les remplacements respectent les limites de mots (`\b`). Les termes sont triés par longueur décroissante pour éviter qu'un mot court ne capture une sous-partie d'un mot plus long.
5. Chaque occurrence est remplacée soit par :
   - Un composant MDX (`mdxJsxTextElement` / `mdxJsxFlowElement`), si `component` est défini
   - Du texte simple si seulement `children` est défini (sans `component`)

## Zones ignorées

Le plugin n'altère pas le texte situé dans :

- Liens Markdown : `[label](url)` (`link`, `linkReference`, `definition`)
- Blocs de code : ``` ``` (`code`)
- Code inline : `` `code` `` (`inlineCode`)
- Titres (`heading`)
- Images (`image`, `imageReference`)
- Balises MDX `<a>`
- Composants déjà insérés par un remplacement précédent (même `component`)

| Type ignoré | Raison |
|--------------|--------|
| `link`, `linkReference`, `definition` | Ne pas altérer l’ancre visible des liens / références |
| `code`, `inlineCode` | Préserver le code source exact |
| `heading` | Éviter de modifier des titres (stabilité potentielle des ancres) |
| `image`, `imageReference` | Ne pas toucher aux légendes/alt ou urls |
| Balise MDX `<a>` | Comportement équivalent aux liens Markdown |
| Composant injecté | Évite double wrapping / récursion |

## Fichier de configuration

`replacements.json` :

```json
{
  "all": {
    "example": {
      "component": "Tooltip",
      "props": { "text": "Info" },
      "children": "Exemple"
    }
  },
  "blog": {
    "mot": { "children": "mot remplacé" }
  }
}
```

Champs par entrée :

- `component` (string) : nom du composant MDX à insérer (facultatif)
- `props` (objet) : props du composant
- `children` (string) : texte enfant du composant ou texte brut si pas de `component`

## Exemple MDX de test manuel

Créer un fichier `./blog/2025-01-01-test.mdx` :

```mdx
---
slug: test-remplacements
title: Test Remplacements
---

# Heading avec Giti (ne doit pas changer ici)

Paragraphe avec Giti et kikinou.

Lien : [Giti dans un lien](https://example.com/Giti) — ne doit pas être modifié.

Inline code : `const Giti = 1` — ignoré.

Bloc de code :

```js
// Giti ne change pas
const kikinou = "kikinou";
```

Image : ![Giti alt](./giti.png)

Texte final avec doculab.

```text
Attendu :
- `Giti` dans le heading : PAS de remplacement
- `Giti` et `kikinou` dans le paragraphe : remplacés selon `replacements.json`
- `Giti` dans le lien / code / image : PAS touché
- `doculab` dans le dernier paragraphe : remplacé (car dans `all`)
```

## État du projet

Pages en `.mdx` (dans `src/pages/`) + articles de blog : le plugin applique les remplacements au build. Les *docs* ne sont pas encore activées (`docs: false` dans `docusaurus.config.js`), mais la détection automatique fonctionnera si tu ajoutes `/docs/`.

Pour activer les docs :

```js
// docusaurus.config.js (extrait)
docs: {
  path: 'docs',
  routeBasePath: 'docs',
  remarkPlugins: [
    [remarkReplaceWords, 'docs'] // argument actuellement ignoré (voir section suivante)
  ]
}
```

## Argument passé à `remarkPlugins`

Dans la config :
```js
remarkPlugins: [[remarkReplaceWords, 'blog']]
```
Le plugin ignore aujourd’hui ce second argument et détermine le type via `file.path` :

```js
if (filePath.includes('/blog/')) type = 'blog';
else if (filePath.includes('/docs/')) type = 'docs';
else if (filePath.includes('/pages/')) type = 'pages';
```

Pour donner la priorité à un type explicite, tu pourrais modifier la signature et ne détecter le chemin qu’en fallback.

## Ajouter / modifier un remplacement

`replacements.json` fusionne `all` + le bloc spécifique (`pages`, `blog`, `docs`). Exemple :

```json
{
  "all": {
    "doculab": {
      "component": "Tooltip",
      "props": { "text": "dokidoki" },
      "children": "Remplacement global"
    }
  },
  "pages": {
    "roki": { "component": "LogoIcon", "props": { "name": "docusaurus", "size": "124" } },
    "simple": { "children": "Texte remplacé" }
  }
}
```

Règles de base :

- `component` absent ⇒ remplacement texte brut
- `children` absent ⇒ composant sans enfant (ex: icône seule)
- Les clés sont comparées avec `\b` (frontières de mots)

## Désactivation / Debug

Par défaut : `DEBUG` (dans `index.js`). Pour l’environnement de production :

```js
const DEBUG = process.env.REPLACE_WORDS_DEBUG === '1';
```

Build avec rapport :

```bash
REPLACE_WORDS_DEBUG=1 npm run build
```

## Limitations connues

| Limitation | Détail |
|------------|--------|
| Limites de mots (`\b`) | Peut ne pas couvrir des langues sans séparateurs |
| Attributs ignorés | Pas de remplacement dans alt/title/href/etc. |
| Ordre de priorité | Tri longueur décroissante évite sous‑remplacements |
| Casse | Recherche insensible (`gi`) |
| Composants réinjectés | Skippés pour éviter double traitement |

## Roadmap suggérée

- Support explicite de l’argument passé dans `remarkPlugins`
- Cache de regex précompilées
- Rapport CLI dédié
- Lint sémantique (forcer certains remplacements)

----

Auteur : génération automatique (adapté / mis à jour après migration MDX).
