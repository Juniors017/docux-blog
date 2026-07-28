// Action Front Matter maison : vide le cache de build Docusaurus (.docusaurus,
// build, node_modules/.cache) sans quitter l'éditeur.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execSync } from "node:child_process";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

try {
  execSync("npm run clear", { cwd: workspacePath, stdio: "pipe" });
  ContentScript.done("Cache Docusaurus vidé — relancez le serveur de dev.");
} catch (err) {
  ContentScript.done(`Échec : ${err.message.split("\n")[0]}`);
}
