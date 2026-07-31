// Front Matter custom action: clears the global npm cache.
// Useful the day a dependency refuses to install cleanly.
// Declared in the config under frontMatter.custom.scripts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ContentScript } from "@frontmatter/extensibility";

const { workspacePath } = ContentScript.getArguments();

// npm is a Node script: call its JS entry point, sitting next to the current
// node executable. No shell, no PATH.
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
  ContentScript.done("npm cache cleared.");
} catch (err) {
  ContentScript.done(`Failed: ${err.message.split("\n")[0]}`);
}
