// This script is executed before the Docusaurus build.
// It downloads sample photo data from the Sling Academy API and writes it to a JSON file
// in the `static/` directory so the site can serve it as a static asset.
const fs = require('fs/promises');
const path = require('path');

// The remote API endpoint providing sample photos.
const API_URL = 'https://api.slingacademy.com/v1/sample-data/photos?offset=5&limit=20';
// Output file path inside the Docusaurus static assets folder.
const OUTPUT_FILE = path.join(__dirname, '..', 'static', 'json', 'photos-data.json');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`Fetch API data from ${API_URL}`);

  let data;
  let usedExistingFile = false;

  try {
    const response = await fetch(API_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
      },
    });

    if (!response.ok) {
      const statusText = `${response.status} ${response.statusText}`;
      if (await fileExists(OUTPUT_FILE)) {
        console.warn(`API returned ${statusText}. Using existing JSON file as fallback.`);
        data = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'));
        usedExistingFile = true;
      } else {
        throw new Error(`API error ${statusText} (HTML response)`);
      }
    } else if (!response.headers.get('content-type')?.includes('application/json')) {
       // Si l'API renvoie 200 mais du HTML (protection WAF)
       const text = await response.text();
       console.warn("⚠️ Received HTML instead of JSON. API might be protected.");
       throw new Error('Response is not JSON');
    } else {
      data = await response.json();
    }
  } catch (error) {
    if (await fileExists(OUTPUT_FILE)) {
      console.warn(`Fetch failed (${error.message}). Using existing JSON file as fallback.`);
      data = JSON.parse(await fs.readFile(OUTPUT_FILE, 'utf8'));
      usedExistingFile = true;
    } else {
      throw error;
    }
  }

  if (!usedExistingFile) {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved photos data to ${OUTPUT_FILE}`);
  } else {
    console.log(`Using existing JSON file ${OUTPUT_FILE} and continuing build.`);
  }
}

main().catch((error) => {
  console.error('Failed to fetch photos data:');
  console.error(error);
  process.exit(1);
});
