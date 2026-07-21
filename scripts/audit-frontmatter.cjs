const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.mdx?$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

const counts = {};
for (const file of walk("blog")) {
  const match = fs
    .readFileSync(file, "utf8")
    .match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) continue;
  for (const line of match[1].split(/\r?\n/)) {
    const key = line.match(/^([A-Za-z_][A-Za-z0-9_]*):/);
    if (key) counts[key[1]] = (counts[key[1]] || 0) + 1;
  }
}

Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(String(v).padStart(3), k));
