// Action Front Matter maison : vide le cache de build Docusaurus (.docusaurus,
// build, node_modules/.cache) sans quitter l'éditeur.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

// Appel direct du binaire Docusaurus avec le node courant : pas de shell,
// donc pas de dépendance au PATH ni à cmd.exe.
const docusaurus = path.join(
  workspacePath,
  "node_modules",
  "@docusaurus",
  "core",
  "bin",
  "docusaurus.mjs"
);

try {
  execFileSync(process.execPath, [docusaurus, "clear"], {
    cwd: workspacePath,
    stdio: "pipe",
  });
  ContentScript.done("Cache Docusaurus vidé — relancez le serveur de dev.");
} catch (err) {
  ContentScript.done(`Échec : ${err.message.split("\n")[0]}`);
}
