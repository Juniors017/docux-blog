import React from 'react';
import { useBlogPost } from '@docusaurus/theme-common/internal';
import Head from '@docusaurus/Head';

export default function SeoBlogPostWithAuthors() {
  const { metadata } = useBlogPost();

  const authors = metadata.authors.map((name) => {
    const lowerName = name.toLowerCase();
    return {
      name,
      url: `/docux-blog/blog/authors/${lowerName}/`,
      image: `/docux-blog/img/${lowerName}.png`,
      jobTitle: lowerName === 'kiki' ? 'Docusaurus Contributor' : 'DOCUX Contributor',
    };
  });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": `https://Juniors017.github.io/docux-blog/blog/${metadata.slug}/`,
    "headline": metadata.title,
    "description": metadata.description,
    "image": { "@type": "ImageObject", "url": metadata.image },
    "author": authors.map(a => ({
      "@type": "Person",
      "name": a.name,
      "url": a.url,
      "image": a.image,
      "jobTitle": a.jobTitle,
    })),
    "datePublished": metadata.date,
    "dateModified": metadata.last_update?.date || metadata.date,
    "keywords": [...metadata.keywords, ...metadata.tags].join(', '),
    "isPartOf": { "@type": "Blog", "@id": "https://Juniors017.github.io/docux-blog/blog", "name": "DOCUX Blog" },
    "about": { "@type": "Thing", "name": metadata.mainTag },
    "isAccessibleForFree": true,
    "hasPart": metadata.serie
      ? { "@type": "BlogPosting", "headline": metadata.serie, "url": `/docux-blog/series/${metadata.serie.toLowerCase().replace(/\s+/g,'-')}/` }
      : undefined,
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>

      <div className="blog-authors">
        {authors.map((author) => (
          <div key={author.name} className="author-card">
            <a href={author.url}>
              <img src={author.image} alt={author.name} className="author-photo" />
            </a>
            <div className="author-info">
              <a href={author.url} className="author-name">{author.name}</a>
              <span className="author-role">{author.jobTitle}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .blog-authors {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .author-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .author-photo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }
        .author-name {
          font-weight: bold;
          margin-top: 0.3rem;
          display: block;
        }
        .author-role {
          font-size: 0.85rem;
          color: #666;
        }
      `}</style>
    </>
  );
}
