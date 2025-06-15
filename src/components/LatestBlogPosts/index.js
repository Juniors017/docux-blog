import React from 'react';
import Link from '@docusaurus/Link';
import styles from '../../pages/index.module.css';

// Récupère tous les fichiers markdown du blog
const blogPosts = require.context(
  '../../../blog', // chemin relatif au dossier blog
  true,
  /\.mdx?$/
);

function getBlogMetadata() {
  return blogPosts
    .keys()
    .map((key) => {
      const post = blogPosts(key);
      // Utilise le slug du frontmatter si présent, sinon construit le chemin Docusaurus par défaut
      let permalink;
      if (post.frontMatter.slug) {
        permalink = post.frontMatter.slug.startsWith('/')
          ? post.frontMatter.slug
          : `/blog/${post.frontMatter.slug.replace(/^\//, '')}`;
      } else {
        // Extrait la date et le nom du fichier pour suivre la convention Docusaurus
        const match = key.match(/\.\/(\d{4})-(\d{2})-(\d{2})-(.+)\/index.mdx?$/);
        if (match) {
          const [, year, month, day, slug] = match;
          permalink = `/blog/${year}/${month}/${day}/${slug}/`;
        } else {
          // fallback : structure de dossier classique
          permalink = '/blog' + key.replace('./', '/').replace(/\.mdx?$/, '/');
        }
      }
      return {
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        permalink,
        tags: post.frontMatter.tags || [],
        authors: post.frontMatter.authors || [],
        date: post.frontMatter.date,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function LatestBlogPosts({ tag, author, count = 3 }) {
  const posts = getBlogMetadata();
  let filtered = posts;

  if (tag) {
    filtered = filtered.filter((post) =>
      post.tags.some((t) => t === tag || (t.label && t.label === tag))
    );
  }

  if (author) {
    filtered = filtered.filter((post) =>
      Array.isArray(post.authors)
        ? post.authors.includes(author)
        : post.authors === author
    );
  }

  const latest = filtered.slice(0, count);

  if (!latest.length) return <p>Aucun article trouvé.</p>;

  return (
    <div className={styles.cards}>
      {latest.map((post) => (
        <Link key={post.permalink} to={post.permalink} className={styles.card}>
          <h3>{post.title}</h3>
          <p>{post.description || post.title}</p>
          <span>Lire l'article →</span>
        </Link>
      ))}
    </div>
  );
}