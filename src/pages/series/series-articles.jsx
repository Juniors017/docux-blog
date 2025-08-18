import React from "react";
import Layout from "@theme/Layout";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import Link from "@docusaurus/Link";
import Card from "@site/src/components/Card";
import CardImage from '@site/src/components/Card/CardImage';
import CardBody from '@site/src/components/Card/CardBody';
import { useLocation } from "@docusaurus/router";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SeriesArticlesPage() {
  const query = useQuery();
  const seriesName = query.get("name") || "";
  const blogPosts = getBlogMetadata();
  const seriesPosts = blogPosts.filter(post => post.serie === seriesName);
  const sortedPosts = seriesPosts.sort((a, b) => new Date(a.date) - new Date(b.date)); // du plus ancien au plus récent

  return (
    <Layout title={`Articles de la série: ${seriesName}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Articles de la série : {seriesName}</h1>
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map(post => (
              <div key={post.permalink} className="col col--4 margin-bottom--lg">
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
