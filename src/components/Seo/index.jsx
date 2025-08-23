import React from 'react';
import { useBlogPost, useDoc } from '@docusaurus/theme-common/internal';
import Head from '@docusaurus/Head';

export default function Seo() {
  const blog = useBlogPost?.();
  const doc = useDoc?.();

  const meta = blog?.metadata || doc?.metadata || {};

  const authors = (meta.authors || []).map((name) => {
    const lower = name.toLowerCase();
    return {
      name,
      url: `/docux-blog/blog/authors/${lower}/`,
      image: `/docux-blog/img/${lower}.png`,
      jobTitle: lower === 'kiki' ? 'Docusaurus Contributor' : 'DOCUX Contributor',
    };
  });

  const mainImage = meta.image || '/docux-blog/img/default.png';
  const pageUrl = blog ? `https://Juniors017.github.io/docux-blog/blog/${meta.slug}/` : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": blog ? "BlogPosting" : doc ? "TechArticle" : "WebPage",
    "headline": meta.title || document.title,
    "description": meta.description || "",
    "image": mainImage,
    ...(blog && {
      "author": authors.map(a => ({
        "@type": "Person",
        "name": a.name,
        "url": a.url,
        "image": a.image,
        "jobTitle": a.jobTitle,
      })),
      "datePublished": meta.date,
      "dateModified": meta.last_update?.date || meta.date,
      "keywords": [...(meta.keywords || []), ...(meta.tags || [])].join(', '),
      "isPartOf": { "@type": "Blog", "@id": "https://Juniors017.github.io/docux-blog/blog", "name": "DOCUX Blog" },
      "about": { "@type": "Thing", "name": meta.mainTag },
    }),
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

        {/* Open Graph */}
        <meta property="og:title" content={meta.title || document.title} />
        <meta property="og:description" content={meta.description || ""} />
        <meta property="og:type" content={blog ? "article" : "website"} />
        <meta property="og:image" content={mainImage} />
        {pageUrl && <meta property="og:url" content={pageUrl} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title || document.title} />
        <meta name="twitter:description" content={meta.description || ""} />
        <meta name="twitter:image" content={mainImage} />
      </Head>

      {/* Affichage auteurs si existants */}
      {authors.length > 0 && (
        <div className="page-authors">
          {authors.map(a => (
            <div key={a.name} className="author-card">
              <a href={a.url}><img src={a.image} alt={a.name} className="author-photo" /></a>
              <div className="author-info">
                <a href={a.url} className="author-name">{a.name}</a>
                <span className="author-role">{a.jobTitle}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page-authors { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .author-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .author-photo { width: 60px; height: 60px; border-radius: 50%; }
        .author-name { font-weight: bold; margin-top: 0.3rem; display: block; }
        .author-role { font-size: 0.85rem; color: #666; }
      `}</style>
    </>
  );
}
