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
              'data-hostname': 'docuxlab.com', // Configuration pour localhost
            },
          },
          {
            tagName: 'noscript',
            innerHTML: '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />',
          },
        ],
      };
    },
  };
}

module.exports = simpleAnalyticsPlugin;