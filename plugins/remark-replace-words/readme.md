# remark-replace-words

Plugin Remark/MDX qui remplace certains mots par des composants MDX (ou texte) selon le contexte (blog / pages / docs) défini dans `replacements.json`.

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

## Debug

Le flag `DEBUG` dans `index.js` affiche un rapport des occurrences remplacées par type.

## Idées d'amélioration
- Option utilisateur pour ajouter une liste custom de nœuds interdits.
- Cache des regex compilées.
- Toggle DEBUG via `process.env.REPLACE_WORDS_DEBUG`.

---

Auteur : génération automatique (adapté à partir de votre implémentation actuelle).
