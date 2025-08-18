/**
 * Page d’affichage des articles d’une série.
 * Récupère le nom de la série via la query string (?name=NomDeLaSerie).
 * Affiche une carte pour chaque article de la série, triés du plus ancien au plus récent.
 * Chaque carte redirige vers l’article correspondant.
 */
import React from "react";
import Layout from "@theme/Layout";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import Link from "@docusaurus/Link";
import Card from "@site/src/components/Card";
import CardImage from '@site/src/components/Card/CardImage';
import CardBody from '@site/src/components/Card/CardBody';
// Permet d'accéder à l'objet location (URL courante) dans une page React Docusaurus
import { useLocation } from "@docusaurus/router";

function useQuery() {
  // Permet de lire les paramètres de la query string
  return new URLSearchParams(useLocation().search);
}

export default function SeriesArticlesPage() {
  // Récupère le nom de la série depuis la query string
  const query = useQuery();
  const seriesName = query.get("name") || "";
  // Filtre les articles du blog pour ne garder que ceux de la série
  const blogPosts = getBlogMetadata();
  const seriesPosts = blogPosts.filter(post => post.serie === seriesName);
  // Trie les articles du plus ancien au plus récent
  const sortedPosts = seriesPosts.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Layout title={`Articles de la série: ${seriesName}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Articles de la série : {seriesName}</h1>
        {/* Affiche les cartes d’articles si la série contient des articles */}
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map(post => (
              <div key={post.permalink} className="col col--4 margin-bottom--lg">
                {/* Lien vers l’article */}
                <Link href={post.permalink}>
                  <Card>
                    <CardImage cardImageUrl={post.image || "default.jpg"} />
                    <CardBody className="padding-vert--md text--center" textAlign="center">
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                    </CardBody>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun article trouvé pour cette série.</p>
        )}
      </div>
    </Layout>
  );
}
