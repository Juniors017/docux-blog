import { usePluginData } from "@docusaurus/useGlobalData";

const PLUGIN = "docusaurus-plugin-image-optimizer";

/**
 * Build the `srcset` / `sizes` pair for a static image, when one is available.
 *
 * The widths come from the image-optimizer plugin, which measures the sources
 * and publishes them before anything renders. Two consequences worth knowing:
 *
 * - **Without the plugin, this returns `{}`.** `usePluginData` yields
 *   `undefined` for a plugin that is not installed, so a component spreading
 *   the result simply renders a plain `<img>`. Copy the component elsewhere and
 *   it keeps working, with no silent dependency.
 * - **Only rungs narrower than the image are listed.** The plugin never writes
 *   a variant wider than its source, so asking for one would 404.
 *
 * The map is empty outside a production build — variants are written in
 * `postBuild`, which `docusaurus start` never runs — which is what keeps the
 * dev server from requesting files that do not exist yet.
 *
 * @param {string} src Absolute site path, e.g. `/img/cover.webp`.
 * @param {string} sizes What the layout says the image will occupy.
 * @returns {{srcSet?: string, sizes?: string}} Spread onto an `<img>`.
 */
export default function useImageSrcSet(src, sizes) {
  return useSrcSetBuilder()(src, sizes);
}

/**
 * The same thing as a function, for when several images are handled at once.
 *
 * Hooks cannot be called inside a loop, so a component mapping over posts asks
 * for the builder once and calls it per image.
 *
 * @returns {(src: string, sizes: string) => {srcSet?: string, sizes?: string}}
 */
export function useSrcSetBuilder() {
  const data = usePluginData(PLUGIN);
  return (src, sizes) => build(data, src, sizes);
}

/**
 * The widest rung a layout can ever use, read from its own `sizes`.
 *
 * A card that occupies 380px never picks a 1600w candidate: the widest it can
 * ask for is its own width times the device pixel ratio, and 2 covers every
 * display worth serving. Listing wider rungs costs deployment weight for a file
 * no browser will choose.
 *
 * Every `px` length counts, media-query bounds included: `(max-width: 600px)
 * 100vw` means the image can span a 600px viewport, so 1200 is reachable on a
 * dense screen. That over-estimates when a bound is larger than the slot it
 * governs, which is the safe direction — a candidate too many, never one too
 * few. An unbounded `100vw` yields no length at all, and no ceiling.
 */
function usefulCeiling(sizes) {
  const lengths = [...sizes.matchAll(/(\d+(?:\.\d+)?)\s*px/g)].map((m) =>
    Number(m[1])
  );
  return lengths.length ? Math.max(...lengths) * 2 : Infinity;
}

function build(data, src, sizes) {
  if (!data || !src || !sizes) return {};

  const width = data.images?.[src];
  if (!width) return {};

  // Keep every rung below the ceiling, plus the first one at or above it, so a
  // high-density screen still has something to reach for.
  const ceiling = usefulCeiling(sizes);
  const rungs = [];
  for (const rung of (data.widths ?? []).filter((r) => r < width)) {
    rungs.push(rung);
    if (rung >= ceiling) break;
  }
  if (!rungs.length) return {};

  const dot = src.lastIndexOf(".");
  if (dot <= 0) return {};

  const base = src.slice(0, dot);
  const ext = src.slice(dot);

  return {
    srcSet: rungs.map((rung) => `${base}-${rung}w${ext} ${rung}w`).join(", "),
    sizes,
  };
}
