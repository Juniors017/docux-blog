// Front Matter custom action: runs a full Docusaurus build and answers
// OK / KO, flagging any SSG warnings along the way.
// Careful: the build takes a minute or two.
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
  const out = execFileSync(process.execPath, [docusaurus, "build"], {
    cwd: workspacePath,
    encoding: "utf8",
    stdio: "pipe",
  });
  const warnings = (out.match(/\[WARNING\]/g) || []).length;
  ContentScript.done(
    warnings
      ? `OK — build succeeded, but ${warnings} warning(s)`
      : "OK — build succeeded, 0 warnings"
  );
} catch (err) {
  const log = `${err.stdout || ""}${err.stderr || ""}${err.message || ""}`;
  const cause =
    log
      .split("\n")
      .find((l) => /error/i.test(l))
      ?.trim()
      .slice(0, 120) || "see the terminal";
  ContentScript.done(`KO — build failed: ${cause}`);
}
