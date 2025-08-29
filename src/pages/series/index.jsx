/**
 * Page d’index des séries d’articles du blog.
 * Affiche une carte pour chaque série, avec le nombre d’articles et une image.
 * Chaque carte redirige vers la page des articles de la série correspondante.
 */
import Layout from "@theme/Layout";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import Link from "@docusaurus/Link";
import Card from "@site/src/components/Card";
import CardImage from '@site/src/components/Card/CardImage';
import CardBody from '@site/src/components/Card/CardBody';

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

export default function SeriesPage() {
  // Récupère les métadonnées de tous les articles du blog
  const blogPosts = getBlogMetadata();
  // Regroupe les articles par nom de série
  const seriesMap = {};
  blogPosts.forEach((post) => {
    const seriesName = post.serie;
    if (seriesName) {
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = [];
      }
      seriesMap[seriesName].push(post);
    }
  });
  // Trie les noms de séries par ordre alphabétique
  const sortedSeriesNames = Object.keys(seriesMap).sort();

  return (
    <Layout title="Article series">
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>All article series</h1>
        {/* Affiche les cartes de séries si au moins une série existe */}
        {sortedSeriesNames.length > 0 ? (
          <div className="row">
            {sortedSeriesNames.map((seriesName) => {
              const seriesPosts = seriesMap[seriesName];
              const sortedPosts = seriesPosts.sort(
                (a, b) => new Date(a.date) - new Date(b.date)
              );
              const firstPost = sortedPosts[0];
              const image = firstPost ? (firstPost.image || "default.jpg") : "default.jpg";
              // Compteur d’articles publiés et en cours de rédaction
              const publishedCount = seriesPosts.filter(post => !post.draft).length;
              const draftCount = seriesPosts.filter(post => post.draft).length;
              const description = `${publishedCount} article(s) publiés` + (draftCount > 0 ? ` • ${draftCount} en cours de rédaction` : "");
              const seriesSlug = createSlug(seriesName);

              return (
                <div key={seriesName} className="col col--4 margin-bottom--lg">
                  {/* Lien vers la page des articles de la série */}
                  <Link href={`/docux-blog/series/series-articles?name=${seriesSlug}`}>
                    <Card>
                      <CardImage cardImageUrl={`${image}`} />
                      <CardBody
                        className="padding-vert--md text--center"
                        textAlign="center"
                        transform="uppercase"
                      >
                        <h3>{seriesName}</h3>
                        <p>{description}&nbsp;→</p>
                      </CardBody>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No series of articles found.</p>
        )}
      </div>
    </Layout>
  );
}
