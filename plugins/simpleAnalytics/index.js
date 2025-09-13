function simpleAnalyticsPlugin(context, options) {
  return {
    name: "docusaurus-plugin-simple-analytics",
    getClientModules() {
      // Permet d'exposer un module client utilisable dans Layout
      return [require.resolve("./sa-client.js")];
    },
  };
}

module.exports = simpleAnalyticsPlugin;

