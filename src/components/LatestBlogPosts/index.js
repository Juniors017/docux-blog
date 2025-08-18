import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

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
      // On tente de récupérer le contenu brut du post
      let content = '';
      if (post.default && typeof post.default === 'string') {
        content = post.default;
      } else if (post.default && post.default.props && post.default.props.children) {
        // Pour les .mdx, on peut essayer d'extraire le texte
        const extractText = (children) =>
          Array.isArray(children)
            ? children.map(extractText).join(' ')
            : typeof children === 'string'
            ? children
            : '';
        content = extractText(post.default.props.children);
      }
      return {
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        image: post.frontMatter.image,
        permalink: post.frontMatter.slug
          ? (post.frontMatter.slug.startsWith('/')
              ? post.frontMatter.slug
              : `/blog/${post.frontMatter.slug.replace(/^\//, '')}`)
          : '/blog' + key.replace('./', '/').replace(/\/index\.mdx?$/, '/').replace(/\.mdx?$/, '/'),
        tags: post.frontMatter.tags || [],
        authors: post.frontMatter.authors || [],
        date: post.frontMatter.date,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function LatestBlogPosts({
  tag,
  author,
  count = 3,
  description = false,
}) {
  const posts = getBlogMetadata();

  let filtered = posts;

  // Filtrage par tag(s) uniquement si tag est défini
  if (tag && tag.length > 0) {
    const tagList = Array.isArray(tag) ? tag : [tag];
    filtered = filtered.filter((post) =>
      post.tags.some((t) =>
        typeof t === 'string'
          ? tagList.includes(t)
          : tagList.includes(t.label || t.value)
      )
    );
  }

  // Filtrage par auteur(s) uniquement si author est défini
  if (author && author.length > 0) {
    const authorList = Array.isArray(author) ? author : [author];
    filtered = filtered.filter((post) =>
      Array.isArray(post.authors)
        ? post.authors.some((a) =>
            typeof a === 'object'
              ? authorList.includes(a.name)
              : authorList.includes(a)
          )
        : false
    );
  }

  // Limite la quantité
  const latest = filtered.slice(0, count);

  if (!latest.length) return <p>Aucun article trouvé.</p>;

  return (
    <div className="row">
      {latest.map((post) => {
        const mainAuthor =
          post.authors && post.authors.length > 0 && typeof post.authors[0] === 'object'
            ? post.authors[0]
            : null;
        return (
          <div className="col col--4" key={post.permalink} style={{ marginBottom: '2rem', display: 'flex' }}>
            <div className="" style={{ width: '100%' }}>
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header avec avatar Infima */}
                <div className="card__header">
                  {mainAuthor && (
                    <div className="avatar">
                      <img
                        className="avatar__photo"
                        src={useBaseUrl(mainAuthor.image_url || '/img/default-avatar.png')}
                        alt={mainAuthor.name}
                      />
                      <div className="avatar__intro">
                        <div className="avatar__name">{mainAuthor.name}</div>
                        <small className="avatar__subtitle">
                          {mainAuthor.title}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
                {/* Image principale de la carte */}
                {post.image && (
                  <div className="card__image">
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
                  </div>
                )}
                {/* Corps de la carte */}
                <div className="card__body" style={{ flex: 1 }}>
                  <h3>{post.title}</h3>
                  {description && post.description && (
                    <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: 6 }}>
                      {post.description}
                    </div>
                  )}
                  <p style={{ color: '#888', fontSize: '0.95em', marginBottom: 8 }}>
                    {post.formattedDate}
                    {/* Temps de lecture retiré */}
                  </p>
                </div>
                {/* Footer avec un seul bouton */}
                <div className="card__footer">
                  <Link className="button button--primary button--block" to={post.permalink}>
                    Lire plus
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}