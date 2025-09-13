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
            },
          },
          {
            tagName: 'noscript',
            innerHTML: '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />',
          },
        ],
      };
    },
    getClientModules() {
      // Permet d'exposer un module client utilisable dans Layout
      return [require.resolve("./sa-client.js")];
    },
  };
}

module.exports = simpleAnalyticsPlugin;

