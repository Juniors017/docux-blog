// Action Front Matter maison : vide le cache npm global.
// Utile quand une dépendance refuse de s'installer proprement.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

// npm est un script Node : on l'appelle par son entrée JS, à côté de
// l'exécutable node courant. Aucun shell, aucun PATH.
const npmCli = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js"
);

try {
  execFileSync(process.execPath, [npmCli, "cache", "clean", "--force"], {
    cwd: workspacePath,
    stdio: "pipe",
  });
  ContentScript.done("Cache npm vidé.");
} catch (err) {
  ContentScript.done(`Échec : ${err.message.split("\n")[0]}`);
}
