import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import authorsData from "@site/src/components/utils/authors";
import styles from './styles.module.css';

export default function LatestBlogPosts({ tag, author, count = 3, description = false }) {
  const posts = getBlogMetadata();
  let filtered = posts;

  // Filtrage par tag(s)
  if (tag && tag.length > 0) {
    const tagList = Array.isArray(tag) ? tag : [tag];
    filtered = filtered.filter((post) =>
      post.tags.some((t) =>
        typeof t === "string" ? tagList.includes(t) : tagList.includes(t.label || t.value)
      )
    );
  }

  // Filtrage par auteur(s)
  if (author && author.length > 0) {
    const authorList = Array.isArray(author) ? author : [author];
    filtered = filtered.filter((post) =>
      Array.isArray(post.authors)
        ? post.authors.some((a) =>
            typeof a === "object" ? authorList.includes(a.name) : authorList.includes(a)
          )
        : false
    );
  }

  // Limite la quantité
  const latest = filtered.slice(0, count);

  if (!latest.length) return <p>Aucun article trouvé.</p>;

  return (
    <>
      <h3>Derniers articles</h3>
      <div className="row">
        {latest.map((post) => (
          <div
            className="col col--4"
            key={post.permalink}
            style={{ marginBottom: "2rem", display: "flex" }}
          >
            <div
              className="card"
              style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Link to={post.permalink}>
                <div className="card__image">
                  {post.image && (
                    <img
                      src={useBaseUrl(post.image)}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  )}
                </div>
              </Link>
              <div className={styles.cardBody}>
                {/* Titre cliquable */}
                <h3 className={styles.cardTitle}>
                  <Link to={post.permalink} className={styles.cardTitleLink}>
                    {post.title}
                  </Link>
                </h3>
                {/* Avatar et nom de l'auteur principal */}
                {post.authors && post.authors.length > 0 && (
                  <div className={styles.cardAuthorBlock}>
                    {(() => {
                      // Récupère l'objet auteur principal à partir des données centralisées
                      const authorKey = typeof post.authors[0] === "object" ? post.authors[0].name.toLowerCase() : post.authors[0].toLowerCase();
                      const authorObj = authorsData[authorKey];
                      return (
                        <>
                          {/* Bloc auteur vertical Infima */}
                          <div className={styles.cardAuthorRow + " avatar avatar--vertical"}>
                            {/* Avatar de l'auteur */}
                            <img
                              className={"avatar__photo " + styles.cardAvatar}
                              src={useBaseUrl(authorObj && authorObj.image_url ? authorObj.image_url : "/img/docux.png")}
                              alt={authorObj && authorObj.name ? authorObj.name : post.authors[0]}
                              title={authorObj && authorObj.name ? authorObj.name : post.authors[0]}
                            />
                            <div className={"avatar__intro " + styles.cardAuthorMeta}>
                              {/* Nom de l'auteur, cliquable si URL présente */}
                              {authorObj && authorObj.url ? (
                                <a href={authorObj.url} className={"avatar__name " + styles.cardAuthor} target="_blank" rel="noopener noreferrer">{authorObj.name}</a>
                              ) : (
                                <span className={"avatar__name " + styles.cardAuthor}>{authorObj && authorObj.name ? authorObj.name : post.authors[0]}</span>
                              )}
                              {/* Titre de l'auteur */}
                              {authorObj && authorObj.title && (
                                <span className={"avatar__subtitle " + styles.cardAuthorSubtitle}>{authorObj.title}</span>
                              )}
                              {/* Icône GitHub si présente dans les réseaux sociaux */}
                              {authorObj && authorObj.socials && authorObj.socials.github && (
                                <a href={authorObj.socials.github} className={"avatar__social " + styles.cardAuthorGithub} target="_blank" rel="noopener noreferrer" title="GitHub">
                                  <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" style={{verticalAlign: 'middle', marginTop: '6px'}}>
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                {description && post.description && (
                  <div className={styles.cardDescription}>
                    {post.description}
                  </div>
                )}
                <p className={styles.cardDate}>
                 Publié le  : {post.date && <span>{new Date(post.date).toLocaleDateString()}</span>}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <Link className="button button--primary button--sm" to={post.permalink}>
                  Lire plus
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}