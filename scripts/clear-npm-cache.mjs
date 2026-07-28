// Action Front Matter maison : vide le cache npm global.
// Utile quand une dépendance refuse de s'installer proprement.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execSync } from "node:child_process";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

try {
  execSync("npm cache clean --force", { cwd: workspacePath, stdio: "pipe" });
  ContentScript.done("Cache npm vidé.");
} catch (err) {
  ContentScript.done(`Échec : ${err.message.split("\n")[0]}`);
}
