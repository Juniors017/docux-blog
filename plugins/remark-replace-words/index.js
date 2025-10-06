import { visit } from 'unist-util-visit';
import mapping from './replacements.json' with { type: "json" };

const DEBUG = true;
const stats = {};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function isForbiddenParent(parent, replacementComponentNames) {
  if (!parent) return false;

  if (
    parent.type === 'link' ||
    parent.type === 'linkReference' ||
    parent.type === 'definition' ||
    parent.type === 'code' ||
    parent.type === 'inlineCode' ||
    parent.type === 'heading' || // # titre
    parent.type === 'image' ||
    parent.type === 'imageReference'
  ) {
    return true;
  }

  if (
    (parent.type === 'mdxJsxFlowElement' || parent.type === 'mdxJsxTextElement') && (
      parent.name === 'a' || // <a>
      replacementComponentNames.has(parent.name)  )
  ) {
    return true;
  }

  return false;
}

export default function remarkReplaceFromJson() {
  return (tree, file) => {
    const filePath = (file.path || '').replace(/\\/g, '/');
    let type = 'pages';
    if (filePath.includes('/blog/')) type = 'blog';
    else if (filePath.includes('/docs/')) type = 'docs';
    else if (filePath.includes('/pages/')) type = 'pages';

    const allMapping = mapping.all || {};
    const typeMapping = mapping[type] || {};
    const mergedMapping = { ...allMapping, ...typeMapping };

    const replacementComponentNames = new Set(
      Object.values(mergedMapping)
        .map((c) => c.component)
        .filter(Boolean)
    );

    const entries = Object.entries(mergedMapping).sort((a, b) => b[0].length - a[0].length);

    visit(tree, 'text', (node, index, parent) => {
      if (isForbiddenParent(parent, replacementComponentNames)) return;
      if (!node.value || typeof node.value !== 'string') return;

      node.value = node.value.normalize('NFC');

      let fragments = [{ type: 'text', value: node.value }];
      let replaced = false;

      for (const [word, conf] of entries) {
        if (!word) continue;
        const safe = escapeRegex(word);

        const regex = new RegExp(`(?<![\\p{L}\\p{N}_/"'’-])${safe}(?![\\p{L}\\p{N}_/"'’-])`, 'giu');

        fragments = fragments.flatMap((frag) => {
          if (frag.type !== 'text') return [frag];
          if (!regex.test(frag.value)) return [frag];
          regex.lastIndex = 0;

          const parts = frag.value.split(regex);
            const matches = frag.value.match(regex) || [];
          if (!matches.length) return [frag];

          replaced = true;
          if (DEBUG) {
            stats[filePath] = stats[filePath] || {};
            stats[filePath][word] = (stats[filePath][word] || 0) + matches.length;
          }

          const newNodes = [];
          parts.forEach((part, i) => {
            if (part) newNodes.push({ type: 'text', value: part });
            if (i < matches.length) {
              const compName = conf.component;
              const replacementLabel = conf.children || matches[i];

              if (compName) {
                const isInline =
                  parent.type === 'paragraph' ||
                  parent.type === 'mdxJsxFlowElement' ||
                  parent.type === 'emphasis' ||
                  parent.type === 'strong' ||
                  parent.type === 'delete' ||
                  parent.type === 'listItem';
                const nodeType = isInline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement';
                newNodes.push({
                  type: nodeType,
                  name: compName,
                  attributes: Object.entries(conf.props || {}).map(([key, value]) => ({
                    type: 'mdxJsxAttribute',
                    name: key,
                    value,
                  })),
                  children: replacementLabel ? [{ type: 'text', value: replacementLabel }] : [],
                });
              } else {

                newNodes.push({ type: 'text', value: replacementLabel });
              }
            }
          });
          return newNodes;
        });
      }

      if (replaced) {
        parent.children.splice(index, 1, ...fragments);
      }
    });

    if (DEBUG && Object.keys(stats).length > 0 && !global.__remarkReplaceWordsReported) {
      global.__remarkReplaceWordsReported = true;
      setTimeout(() => {
        global.__remarkReplaceWordsReported = false;
        const typeTotals = { blog: {}, pages: {}, docs: {}, all: {} };

        for (const [file, words] of Object.entries(stats)) {
          let type = 'pages';
          const normalized = file.replace(/\\/g, '/');
          if (normalized.includes('/blog/')) type = 'blog';
          else if (normalized.includes('/docs/')) type = 'docs';
          else if (normalized.includes('/pages/')) type = 'pages';

          for (const [word, count] of Object.entries(words)) {
            if (mapping.all && Object.prototype.hasOwnProperty.call(mapping.all, word)) {
              typeTotals.all[word] = (typeTotals.all[word] || 0) + count;
            } else {
              typeTotals[type][word] = (typeTotals[type][word] || 0) + count;
            }
          }
        }

        console.log("\n=== Rapport de remplacements Remark ===");
        for (const type of ['blog', 'pages', 'docs', 'all']) {
          const words = typeTotals[type];
          if (Object.keys(words).length > 0) {
            console.log(`[${type}]`);
            for (const [word, count] of Object.entries(words)) {
              console.log(`- \"${word}\" remplacé ${count} fois`);
            }
          }
        }
        console.log("======================================\n");
      }, 5000);
    }
  };
}

