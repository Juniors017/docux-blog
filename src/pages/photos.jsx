import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';

// Path to the static JSON file generated at build time.
const STATIC_URL = '/json/photos-data.json';
// Fallback remote API used in development when the static file is missing.
const API_URL = 'https://api.slingacademy.com/v1/sample-data/photos?offset=5&limit=20';

export default function PhotosPage() {
  // Local component state for the photo list, loading state, and any error.
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load the pre-generated static JSON file first.
    fetch(STATIC_URL)
      .then((response) => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        
        if (response.ok && isJson) {
          return response.json();
        }

        // If the static file does not exist (404) or is HTML, fallback to the remote API.
        if (response.status === 404 || !isJson) {
          return fetch(API_URL).then((fallback) => {
            const isFallbackJson = fallback.headers.get('content-type')?.includes('application/json');
            if (!fallback.ok || !isFallbackJson) {
              throw new Error(`API fallback error (Status: ${fallback.status}, JSON: ${isFallbackJson})`);
            }
            return fallback.json();
          });
        }
        throw new Error(`Error ${response.status}`);
      })
      .then((json) => {
        // The API response is expected to include a `photos` array.
        setPhotos((json.photos || json) ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Layout title="Photos API" description="Display photos from the Sling Academy API">
      <main className="container margin-vert--lg">
        <h1>Photos from the Test API</h1>
        <p>
          Images are served from the static file <code>/json/photos-data.json</code>,
          generated at build time by the <strong>GitHub Actions Workflow</strong>.
        </p>
        <p>
          In development mode, if this file doesn't exist yet, the page falls back
          to direct API fetching to still display images.
        </p>

        {loading && <p>Loading photos...</p>}

        {error && (
          <div className="alert alert--danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <p>No photos found.</p>
        )}

        <div className="row">
          {photos.map((photo) => (
            <div key={photo.id} className="col col--3 margin-bottom--lg">
              <div className="card padding--sm">
                <div className="card__image">
                  <img
                    src={photo.url}
                    alt={photo.title || photo.description || `Photo ${photo.id}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <div className="card__body padding-top--sm">
                  <h3>{photo.title}</h3>
                  <p>{photo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Each card renders one photo from the JSON response.
            The API returns objects with `url`, `title`, `description`, and `id`. */}
      </main>
    </Layout>
  );
}
