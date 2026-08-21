import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation, matchPath } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import PostCard from "@site/src/components/Blog/PostCard";

/**
 * Structured data for a series page.
 *
 * Docusaurus emits a `BlogPosting` on every article and a `Blog` on the post
 * list, but a series route is a page it knows nothing about: until now these
 * carried only the site-wide `WebSite` and `Organization` blocks, and nothing
 * said that the page is a collection nor which articles it holds.
 *
 * `CollectionPage` + `ItemList` is the pairing schema.org defines for exactly
 * that. Each entry points at the article's canonical URL rather than repeating
 * its content, so nothing here can contradict the `BlogPosting` already
 * published on the article itself.
 */
function SeriesStructuredData({ seriesName, slug, posts, siteUrl }) {
  if (posts.length === 0) {
    return null;
  }

  // The site runs with `trailingSlash: true`, so every `<link rel="canonical">`
  // it emits ends with a slash. These URLs are written in the same form: a
  // structured-data URL that redirects to the canonical one says less than one
  // that already is it.
  const canonical = (path) => `${siteUrl}${path.replace(/\/?$/, "/")}`;

  const pageUrl = canonical(`/series/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    url: pageUrl,
    name: `Series articles: ${seriesName}`,
    description: `The ${posts.length} articles of the ${seriesName} series, in reading order.`,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: canonical(post.permalink),
        name: post.title,
      })),
    },
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  );
}

export default function SeriesArticlesPage() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const match = matchPath(location.pathname, {
    path: "/series/:slug",
    exact: true,
  });
  const slug = match?.params?.slug;

  if (!slug) {
    return (
      <Layout>
        <div className="container">
          <p>No series specified.</p>
          <Link href="/series">Go back to all series</Link>
        </div>
      </Layout>
    );
  }

  const posts = getBlogMetadata();
  const seriesPosts = posts.filter((post) => {
    if (!post.series) return false;
    return createSlug(post.series) === slug;
  });

  const originalSeriesName =
    seriesPosts.length > 0 ? seriesPosts[0].series : slug;

  const sortedPosts = [...seriesPosts].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <Layout title={`Series articles: ${originalSeriesName}`}>
      <SeriesStructuredData
        seriesName={originalSeriesName}
        slug={slug}
        posts={sortedPosts}
        siteUrl={siteConfig.url}
      />
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Series articles: {originalSeriesName}</h1>
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map((post) => (
              <PostCard key={post.permalink} post={post} />
            ))}
          </div>
        ) : (
          <div className="text--center margin-vert--xl">
            <h2>No articles found for this series</h2>
            <p>
              Oops, it looks like that series doesn't exist. Please check the
              name in the URL to make sure it's correct.
            </p>
            <Link href="/series">
              Click here to browse all available series from our homepage.
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
