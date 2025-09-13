export function loadSimpleAnalytics() {
  if (typeof window === "undefined") return;
  if (document.querySelector("script[src*='simpleanalyticscdn.com']")) return;

  const script = document.createElement("script");
  script.src = "https://scripts.simpleanalyticscdn.com/latest.js";
  script.async = true;
  document.body.appendChild(script);

  const noscript = document.createElement("noscript");
  noscript.innerHTML =
    '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />';
  document.body.appendChild(noscript);

  return () => {
    script.remove();
    noscript.remove();
  };
}

// Auto-exécution du script
if (typeof window !== "undefined") {
  // Attendre que le DOM soit prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSimpleAnalytics);
  } else {
    loadSimpleAnalytics();
  }
}
