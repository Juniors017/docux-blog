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
  const data = usePluginData(PLUGIN);

  if (!data || !src || !sizes) return {};

  const width = data.images?.[src];
  if (!width) return {};

  const rungs = (data.widths ?? []).filter((rung) => rung < width);
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
