import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// Fonction pour créer un slug à partir du nom de série
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .trim('-'); // Supprime les tirets en début/fin
}

export default function SerieBanner({ serieName }) {
  if (!serieName) return null;

  const seriesSlug = createSlug(serieName);

  return (
    <div className={styles.serieBanner}>
      <div className={styles.serieContent}>
        <span className={styles.serieIcon}>📚</span>
        <span className={styles.serieText}>
          This article is part of the series: 
          <Link 
            href={`/series/series-articles?name=${seriesSlug}`}
            className={styles.serieLink}
          >
            {serieName}
          </Link>
        </span>
      </div>
    </div>
  );
}
