// GoatCounter SPA tracking for Docusaurus
// Counts a pageview on each client-side route change.

let lastCountedPath;

export function onRouteDidUpdate({ location, previousLocation }) {
  if (typeof window === 'undefined') return;

  // Avoid double-counting the initial load: only count when there's a previous location
  if (!previousLocation) return;

  const gc = window.goatcounter;
  if (!gc || typeof gc.count !== 'function') return;

  const path = `${location.pathname}${location.search}${location.hash}`;
  const prevPath = `${previousLocation.pathname}${previousLocation.search}${previousLocation.hash}`;

  if (path === prevPath || path === lastCountedPath) return;

  lastCountedPath = path;

  // Count pageview. Title is optional, but useful.
  try {
    gc.count({ path, title: document.title });
  } catch (e) {
    // Swallow errors: analytics must never break navigation
    // Optionally, retry once shortly after script load
    setTimeout(() => {
      try {
        window.goatcounter?.count?.({ path, title: document.title });
      } catch {}
    }, 500);
  }
}
