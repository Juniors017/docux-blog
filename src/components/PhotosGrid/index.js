import React, { useEffect, useState } from 'react';

// Path to the static JSON file generated at build time.
const STATIC_URL = '/json/photos-data.json';
// Fallback remote API used in development when the static file is missing.
const API_URL = 'https://api.slingacademy.com/v1/sample-data/photos?offset=5&limit=20';

export default function PhotosGrid({ limit = 8 }) {
  // Local component state for the photo list, loading state, and any error.
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load the pre-generated static JSON file first.
    fetch(STATIC_URL)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        // If the static file does not exist, fallback to the remote API.
        if (response.status === 404) {
          return fetch(API_URL).then((fallback) => {
            if (!fallback.ok) {
              throw new Error(`API fallback error ${fallback.status}`);
            }
            return fallback.json();
          });
        }
        throw new Error(`Error ${response.status}`);
      })
      .then((json) => {
        // The API response is expected to include a `photos` array.
        const allPhotos = (json.photos || json) ?? [];
        setPhotos(allPhotos.slice(0, limit)); // Limit the number of photos displayed
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  if (loading) {
    return <p>Loading photos...</p>;
  }

  if (error) {
    return (
      <div className="alert alert--danger">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return <p>No photos found.</p>;
  }

  return (
    <div className="row">
      {photos.map((photo) => (
        <div key={photo.id} className="col col--4 margin-bottom--lg">
          <div className="card padding--sm">
            <div className="card__image">
              <img
                src={photo.url}
                alt={photo.title || photo.description || `Photo ${photo.id}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div className="card__body padding-top--sm">
              <h4>{photo.title}</h4>
              <p style={{ fontSize: '0.9em', color: 'var(--ifm-color-emphasis-700)' }}>
                {photo.description.length > 100
                  ? `${photo.description.substring(0, 100)}...`
                  : photo.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}