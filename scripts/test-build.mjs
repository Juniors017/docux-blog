// Action Front Matter maison : lance un build Docusaurus complet et renvoie
// OK / KO, en signalant au passage les avertissements SSG.
// Attention : le build prend une à deux minutes.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

// On appelle le binaire Docusaurus avec le node courant : pas de shell, donc
// pas de dépendance au PATH ni à cmd.exe — indispensable quand l'extension
// lance le script hors d'un terminal.
const docusaurus = path.join(
  workspacePath,
  "node_modules",
  "@docusaurus",
  "core",
  "bin",
  "docusaurus.mjs"
);

try {
  const out = execFileSync(process.execPath, [docusaurus, "build"], {
    cwd: workspacePath,
    encoding: "utf8",
    stdio: "pipe",
  });
  const warnings = (out.match(/\[WARNING\]/g) || []).length;
  ContentScript.done(
    warnings
      ? `OK — build réussi, mais ${warnings} avertissement(s)`
      : "OK — build réussi, 0 avertissement"
  );
} catch (err) {
  const log = `${err.stdout || ""}${err.stderr || ""}${err.message || ""}`;
  const cause =
    log
      .split("\n")
      .find((l) => /error/i.test(l))
      ?.trim()
      .slice(0, 120) || "voir le terminal";
  ContentScript.done(`KO — build en échec : ${cause}`);
}
