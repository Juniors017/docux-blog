// This script is executed before the Docusaurus build.
// It downloads sample photo data from the Sling Academy API and writes it to a JSON file
// in the `static/` directory so the site can serve it as a static asset.
const fs = require('fs/promises');
const path = require('path');

// The remote API endpoint providing sample photos.
const API_URL = 'https://api.slingacademy.com/v1/sample-data/photos?offset=5&limit=20';
// Output file path inside the Docusaurus static assets folder.
const OUTPUT_FILE = path.join(__dirname, '..', 'static', 'json', 'photos-data.json');

async function main() {
  console.log(`Fetch API data from ${API_URL}`);

  // Request the API and ensure the response is OK.
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API error ${response.status} ${response.statusText}`);
  }

  // Parse the JSON payload from the API.
  const data = await response.json();

  // Save the JSON to the static folder so Docusaurus can serve it directly.
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Saved photos data to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Failed to fetch photos data:');
  console.error(error);
  process.exit(1);
});
