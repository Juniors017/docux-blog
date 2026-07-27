// Action Front Matter maison : compte les mots de l'article courant et estime
// son temps de lecture, puis l'affiche en notification.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { readFileSync } from "node:fs";
import { ContentScript } from "@frontmatter/extensibility";

const { filePath } = ContentScript.getArguments();

const text = readFileSync(filePath, "utf8")
  .replace(/^---\r?\n[\s\S]*?\r?\n---/, " ") // frontmatter
  .replace(/```[\s\S]*?```/g, " ") // blocs de code
  .replace(/`[^`]*`/g, " ") // code en ligne
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ") // commentaires MDX
  .replace(/<[^>]+>/g, " ") // balises JSX/HTML
  .replace(/[#>*_~|[\]()!-]/g, " "); // ponctuation Markdown

const words = (text.match(/\p{L}[\p{L}\p{N}'’-]*/gu) || []).length;
const minutes = Math.max(1, Math.round(words / 200)); // ~200 mots/min

ContentScript.done(`${words} mots · ~${minutes} min de lecture`);
