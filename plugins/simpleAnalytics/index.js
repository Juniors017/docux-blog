function simpleAnalyticsPlugin(context, options) {
  return {
    name: "docusaurus-plugin-simple-analytics",
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              src: 'https://scripts.simpleanalyticscdn.com/latest.js',
              async: true,
              'data-hostname': 'docuxlab.com',
            },
          },
          {
            tagName: 'noscript',
            innerHTML: '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;" />',
          },
        ],
      };
    },
  };
}

module.exports = simpleAnalyticsPlugin;