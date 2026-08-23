import React from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import BlogPostPage from "@theme-original/BlogPostPage";
import { createSlug } from "@site/src/components/Blog/utils/slug";

/**
 * Builds an absolute URL in the form the site actually serves.
 *
 * `trailingSlash: true`, so every canonical link ends with a slash. Structured
 * data that points at the other spelling of the same page says less than data
 * that agrees with the canonical.
 */
function absolute(siteUrl, path) {
  return `${siteUrl}${path.replace(/\/?$/, "/")}`;
}

/**
 * Head tags an article needs and Docusaurus does not emit.
 *
 * The metadata comes from `props.content`, not from `useBlogPost()`: that hook
 * only works inside the `BlogPostProvider`, which the original component sets
 * up itself, so calling it from a wrapper fails the static build on every
 * article page. It did, before this was written this way.
 *
 * **og:url** — Docusaurus emits `og:title`, `og:description` and `og:image`
 * per page but no `og:url`. The site config used to fill that gap with one
 * static value, the homepage, so every article announced the homepage as the
 * identity of the shared object.
 *
 * **BreadcrumbList** — one of the 40 types Google still supports, and the site
 * had none. The trail follows the series rather than the URL, which is what
 * Google asks for: "We recommend providing breadcrumbs that represent a
 * typical user path to a page, instead of mirroring the URL structure."
 * Articles live at `/blog/<slug>` but a reader reaches them through a series,
 * so the series is the honest middle step. The series URL is built with the
 * same `createSlug` the series-route plugin uses to register the route, so a
 * breadcrumb can never point at a page that does not exist.
 */
function BlogPostHeadTags({ content }) {
  const { siteConfig } = useDocusaurusContext();
  const metadata = content?.metadata;

  if (!metadata?.permalink) {
    return null;
  }

  const url = absolute(siteConfig.url, metadata.permalink);

  const trail = [
    { name: siteConfig.title, url: absolute(siteConfig.url, "") },
    { name: "Blog", url: absolute(siteConfig.url, "/blog") },
  ];

  const series = metadata.frontMatter?.series;
  if (series) {
    const slug = createSlug(String(series));
    if (slug) {
      trail.push({
        name: String(series),
        url: absolute(siteConfig.url, `/series/${slug}`),
      });
    }
  }

  trail.push({ name: metadata.title, url });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: step.url,
    })),
  };

  return (
    <Head>
      <meta property="og:url" content={url} />
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
    </Head>
  );
}

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <BlogPostHeadTags content={props.content} />
      <BlogPostPage {...props} />
    </>
  );
}
