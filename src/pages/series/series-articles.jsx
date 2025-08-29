/**
 * Page d'affichage des articles d'une série.
 * Récupère le nom de la série via la query string (?name=NomDeLaSerie).
 * Affiche une carte pour chaque article de la série, triés du plus ancien au plus récent.
 * Chaque carte redirige vers l'article correspondant.
 */
import React from "react";
import Layout from "@theme/Layout";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import Card from "@site/src/components/Card";
import CardImage from "@site/src/components/Card/CardImage";
import CardBody from "@site/src/components/Card/CardBody";

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

function useQuery() {
  // Permet de lire les paramètres de la query string
  return new URLSearchParams(useLocation().search);
}

export default function SeriesArticlesPage() {
  // Récupère le slug de la série depuis la query string
  const query = useQuery();
  const seriesSlug = query.get("name") || "";
  
  // Récupère tous les articles et trouve ceux de la série correspondant au slug
  const blogPosts = getBlogMetadata();
  const seriesPosts = blogPosts.filter(post => {
    if (!post.serie) return false;
    return createSlug(post.serie) === seriesSlug;
  });
  
  // Trouve le nom original de la série (pour l'affichage)
  const originalSeriesName = seriesPosts.length > 0 ? seriesPosts[0].serie : seriesSlug;
  
  // Trie les articles du plus ancien au plus récent
  const sortedPosts = seriesPosts.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Layout title={`Articles de la série: ${originalSeriesName}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Articles de la série : {originalSeriesName}</h1>
        {/* Affiche les cartes d'articles si la série contient des articles */}
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map(post => (
              <div key={post.permalink} className="col col--4 margin-bottom--lg">
                {/* Lien vers l'article */}
                <Link href={post.permalink}>
                  <Card shadow="md">
                    <CardImage 
                      cardImageUrl={post.image || "/img/docux.png"} 
                      alt={post.title}
                      title={post.title}
                    />
                    <CardBody 
                      className="padding-vert--md text--center" 
                      textAlign="center"
                    >
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
