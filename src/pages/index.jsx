import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="NeonBlog"
      description="Un blog flashy et décalé !"
    >
      <header className={styles.heroBanner}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <img
  src={require('@site/static/img/docux.png').default}
  alt="Docux Blog Logo"
  style={{
    width: 220,
    height: 220,
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 0 16px rgb(118, 255, 5)',
    border: '10px solid rgba(74, 8, 94, 0.88)',
    transition: 'transform 0.3s ease',
  }}
/>
          <h1 className={styles.title}>Docux Blog</h1>
        </div>
        <p className={styles.subtitle}>
          Des articles tech, design & pop culture aux couleurs qui piquent les yeux !
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/blog">
            Voir les articles
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className="container">
            <h2>Derniers articles</h2>
            <div className={styles.cards}>
              <ArticleCard title="Créer un blog Docusaurus stylé" link="/blog/tuto-docusaurus" />
              <ArticleCard title="Le pouvoir des couleurs flashy en UI" link="/blog/couleurs-ui" />
              <ArticleCard title="Halloween et le design : inspirations" link="/blog/halloween-design" />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ArticleCard({ title, link }) {
  return (
    <Link to={link} className={styles.card}>
      <h3>{title}</h3>
      <p>Lire l'article →</p>
    </Link>
  );
}
