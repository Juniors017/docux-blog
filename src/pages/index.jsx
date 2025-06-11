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
        <div className="container">
          <h1 className={styles.title}>🎃 NeonBlog</h1>
          <p className={styles.subtitle}>
            Des articles tech, design & pop culture aux couleurs qui piquent les yeux !
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/blog">
              Voir les articles
            </Link>
          </div>
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
