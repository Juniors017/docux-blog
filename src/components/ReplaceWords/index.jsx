import React from "react";
import replacements from "../../../plugins/remark-replace-words/replacements.json";

function getMergedMapping(type = "pages") {
  const allMapping = replacements.all || {};
  const typeMapping = replacements[type] || {};
  return { ...allMapping, ...typeMapping };
}

function replaceTextWithComponents(text, type = "pages") {
  const mapping = getMergedMapping(type);
  // On trie les mots par longueur décroissante pour éviter les collisions
  const words = Object.keys(mapping).sort((a, b) => b.length - a.length);
  if (words.length === 0) return text;

  // Découpe le texte en fragments (mot ou autre)
  let fragments = [text];
  words.forEach((word) => {
    const conf = mapping[word];
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    fragments = fragments.flatMap((frag) => {
      if (typeof frag !== "string") return [frag];
      const parts = frag.split(regex);
      const matches = frag.match(regex);
      if (!matches) return [frag];
      const newFrags = [];
      parts.forEach((part, i) => {
        if (part) newFrags.push(part);
        if (i < parts.length - 1) {
          newFrags.push(
            React.createElement(
              conf.component,
              conf.props || {},
              conf.children || word
            )
          );
        }
      });
      return newFrags;
    });
  });
  return fragments;
}

/**
 * Composant React pour remplacer dynamiquement les mots dans un texte
 * @param {string} text - Le texte à traiter
 * @param {string} type - Le type de page (blog, pages, docs)
 */
export default function ReplaceWords({ text, type = "pages" }) {
  const result = replaceTextWithComponents(text, type);
  return <>{result}</>;
}
