/**
 * Docusaurus Remark Plugin – remark-replace-words
 * Works for MDX content in blog/pages/docs.
 */
const { visit } = require("unist-util-visit");
const wordsJSON = require("./words.json");

function getWords(type) {
  let words = { ...(wordsJSON.all?.words || {}) };
  if (type && wordsJSON[type]?.words) {
    words = { ...words, ...wordsJSON[type].words };
  }
  return words;
}

function remarkReplaceWords(type = "pages") {
  return (tree) => {
    const words = getWords(type);

    visit(tree, "text", (node, index, parent) => {
      if (typeof node.value !== "string") return;
      const forbiddenParents = ["link", "image", "inlineCode", "code"];
      if (parent && forbiddenParents.includes(parent.type)) return;

      Object.entries(words).forEach(([search, replacement]) => {
        const regex = new RegExp(`\\b${search}\\b`, "gi");
        node.value = node.value.replace(regex, replacement);
      });
    });
  };
}

module.exports = remarkReplaceWords;
