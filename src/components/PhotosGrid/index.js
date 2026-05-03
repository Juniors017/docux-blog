import React, { useEffect, useState } from 'react';
import Admonition from '@theme/Admonition';

// API directe pour le développement
const API_URL = 'https://picsum.photos/v2/list?limit=20';
// Fichier statique pour la production (généré par GitHub Actions)
const STATIC_JSON_URL = '/json/photos-data.json';

export default function PhotoGrid({ limit = 8 }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Choix de l'URL selon l'environnement
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev ? API_URL : STATIC_JSON_URL;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Gère le format : tableau direct (Picsum) ou bien { photos: [...] }
        let allPhotos = Array.isArray(data) ? data : data.photos;
        if (!allPhotos || !Array.isArray(allPhotos)) {
          throw new Error('Format de données inattendu');
        }
        setPhotos(allPhotos.slice(0, limit));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  if (loading) return <div className="text--center margin-vert--lg">Chargement des photos...</div>;

  if (error) {
    return (
      <Admonition type="warning" title="Erreur de chargement">
        <p>{error}</p>
      </Admonition>
    );
  }

  if (!photos.length) {
    return <Admonition type="info" title="Aucune photo">Aucune photo à afficher.</Admonition>;
  }

  return (
    <div className="row">
      {photos.map((photo) => (
        <div key={photo.id} className="col col--4 margin-bottom--lg">
          <div className="card shadow--md">
            <div className="card__image">
              <img
                src={`https://picsum.photos/id/${photo.id}/400/300`}
                alt={photo.author}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div className="card__body">
              <h4>{photo.author}</h4>
              <p className="text--small">
                <a href={photo.download_url} target="_blank" rel="noopener noreferrer">
                  Voir l'original
                </a>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}