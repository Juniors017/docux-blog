import React from 'react';
import Link from '@docusaurus/Link';
import styles from '../../pages/index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl'; // Import the useBaseUrl function from Docusaurus
import Columns from '@site/src/components/Column';
import Column from '@site/src/components/Columns';

// Récupère tous les fichiers markdown du blog
const blogPosts = require.context(
  '../../../blog',
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
          // fallback : structure de dossier classique
          permalink = '/blog' + key.replace('./', '/').replace(/\.mdx?$/, '/');
        }
      }
      return {
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        image: post.frontMatter.image, // <-- Ajouté ici
        permalink,
        tags: post.frontMatter.tags || [],
        authors: post.frontMatter.authors || [],
        date: post.frontMatter.date,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getExcerptWords(text, wordCount = 20) {
  if (!text) return '';
  const words = text.split(/\s+/);
  return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '…' : '');
}

export default function LatestBlogPosts({
  tag,
  author, // string | array | undefined
  count = 3,
  description = false,
}) {
  const posts = getBlogMetadata();
  let filtered = posts;

  // Filtrage par tag (inchangé)
  if (tag) {
    filtered = filtered.filter((post) =>
      post.tags.some((t) => t === tag || (t.label && t.label === tag))
    );
  }

  // Filtrage par auteur (accepte string, array ou undefined)
  if (author && author.length > 0) {
    const authorList = Array.isArray(author) ? author : [author];
    filtered = filtered.filter((post) =>
      Array.isArray(post.authors)
        ? post.authors.some((a) => authorList.includes(a))
        : authorList.includes(post.authors)
    );
  }

  const latest = filtered.slice(0, count);

  if (!latest.length) return <p>Aucun article trouvé.</p>;

  return (
    <div className="row">
      {latest.map((post) => (
        <div className="col col--4" key={post.permalink} style={{ marginBottom: '2rem', display: 'flex' }}>
          <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card__image">
              {post.image && (
                <img
                  src={useBaseUrl(post.image)}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
              )}
            </div>
            <div className="card__body" style={{ flex: 1 }}>
              <h3>{post.title}</h3>
              {/* Affiche la description en haut si description={true} */}
              {description && post.description && (
                <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: 6 }}>
                  {post.description}
                </div>
              )}
              <p style={{ color: '#888', fontSize: '0.95em', marginBottom: 8 }}>
                {post.authors && post.authors.length > 0 && (
                  <>Par <b>{Array.isArray(post.authors) ? post.authors.join(', ') : post.authors}</b> – </>
                )}
                {post.date && (
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <div className="card__footer" style={{ textAlign: 'right' }}>
              <Link className="button button--primary button--sm" to={post.permalink}>
                Lire plus
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}