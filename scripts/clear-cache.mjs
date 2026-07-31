// Front Matter custom action: clears the Docusaurus build cache
// (.docusaurus, build, node_modules/.cache) without leaving the editor.
// Declared in the config under frontMatter.custom.scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

// Call the Docusaurus binary with the current node: no shell, so no reliance
// on PATH or cmd.exe — essential when the extension launches the script
// outside a terminal.
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
  ContentScript.done("Docusaurus cache cleared — restart the dev server.");
} catch (err) {
  ContentScript.done(`Failed: ${err.message.split("\n")[0]}`);
}
