function simpleAnalyticsPlugin() {
  return {
    name: "docusaurus-plugin-simple-analytics",
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "script",
            attributes: {
              src: "https://scripts.simpleanalyticscdn.com/latest.js",
              async: true,
              "data-hostname": "docuxlab.com",
            },
          },
        ],
        // The <noscript><img> fallback pixel must live at the end of <body>:
        // an <img> is invalid inside <head>, which makes the HTML parser close
        // the head early and emit "stray tag" / duplicate <body> diagnostics.
        postBodyTags: [
          {
            tagName: "noscript",
            innerHTML:
              '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;" />',
          },
        ],
      };
    },
  };
}

module.exports = simpleAnalyticsPlugin;
