import { visit } from 'unist-util-visit';
import mapping from './replacements.json' with { type: "json" };

const DEBUG = true;
const stats = {};

/**
 * Vérifie si le remplacement doit être interdit
 * - Liens Markdown (`link`, `linkReference`, `definition`)
 * - Blocs de code (`code`, `inlineCode`)
 * - Composant MDX `<a>` (équivalent HTML)
 */
function isForbiddenParent(parent) {
  if (!parent) return false;

  if (
    parent.type === 'link' ||                // [texte](url)
    parent.type === 'linkReference' ||       // [texte][ref]
    parent.type === 'definition' ||          // [ref]: url
    parent.type === 'code' ||                // ```bloc de code```
    parent.type === 'inlineCode'             // `inline code`
  ) {
    return true;
  }

  // Cas spécifique MDX : <a href="...">texte</a>
  if (parent.type === 'mdxJsxFlowElement' && parent.name === 'a') {
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

    // Fusionne le mapping global ("all") avec le mapping spécifique (blog/docs/pages)
    const allMapping = mapping.all || {};
    const typeMapping = mapping[type] || {};
    const mergedMapping = { ...allMapping, ...typeMapping };

    visit(tree, 'text', (node, index, parent) => {
      // Vérifie si on est dans un contexte interdit
      if (isForbiddenParent(parent)) return;

      let fragments = [{ type: 'text', value: node.value }];
      let replaced = false;

      // Boucle sur chaque mot à remplacer
      for (const [word, conf] of Object.entries(mergedMapping)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');

        fragments = fragments.flatMap((frag) => {
          if (frag.type !== 'text') return [frag];

          const parts = frag.value.split(regex);
          const matches = frag.value.match(regex);

          if (!matches) return [frag];

          replaced = true;

          // Statistiques debug
          if (DEBUG) {
            stats[filePath] = stats[filePath] || {};
            stats[filePath][word] = (stats[filePath][word] || 0) + matches.length;
          }

          const newNodes = [];
          parts.forEach((part, i) => {
            if (part) newNodes.push({ type: 'text', value: part });

            if (i < parts.length - 1) {
              // Détermine si le remplacement doit être inline (mdxJsxTextElement)
              // ou block (mdxJsxFlowElement)
              const isInline =
                parent.type === 'paragraph' ||
                parent.type === 'mdxJsxFlowElement' || // ex: <Hero>texte mot</Hero>
                parent.type === 'emphasis' ||
                parent.type === 'strong';

              const nodeType = isInline ? 'mdxJsxTextElement' : 'mdxJsxFlowElement';

              newNodes.push({
                type: nodeType,
                name: conf.component,
                attributes: Object.entries(conf.props || {}).map(([key, value]) => ({
                  type: 'mdxJsxAttribute',
                  name: key,
                  value,
                })),
                children: conf.children
                  ? [{ type: 'text', value: conf.children }]
                  : [],
              });
            }
          });

          return newNodes;
        });
      }

      // Si on a remplacé du texte → on met à jour les enfants du parent
      if (replaced) {
        parent.children.splice(index, 1, ...fragments);
      }
    });

    // Rapport en fin de build (affiché une seule fois)
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
