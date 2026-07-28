// Action Front Matter maison : lance un build Docusaurus complet et renvoie
// OK / KO, en signalant au passage les avertissements SSG.
// Attention : le build prend une à deux minutes.
// Déclarée dans frontmatter.json sous frontMatter.custom.scripts.
import { execSync } from "node:child_process";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

try {
  const out = execSync("npm run build", {
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
  const log = `${err.stdout || ""}${err.stderr || ""}`;
  const cause =
    log
      .split("\n")
      .find((l) => /error|Error/.test(l))
      ?.trim()
      .slice(0, 120) || "voir le terminal";
  ContentScript.done(`KO — build en échec : ${cause}`);
}
