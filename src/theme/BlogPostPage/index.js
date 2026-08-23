import React from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import BlogPostPage from "@theme-original/BlogPostPage";

/**
 * Declares the article's own `og:url`.
 *
 * Docusaurus emits `og:title`, `og:description` and `og:image` per page but no
 * `og:url` at all. The site config used to fill that gap with a single static
 * value — the homepage — so every article announced the homepage as the
 * identity of the shared object. That static tag is gone; this puts the right
 * one back, per article.
 *
 * The metadata is read from `props.content`, not from `useBlogPost()`: that
 * hook only works inside the `BlogPostProvider`, which the original component
 * sets up itself, so calling it from a wrapper fails the static build on every
 * article page.
 *
 * The URL is built the way the canonical link is: site URL + permalink with
 * the trailing slash the site actually serves (`trailingSlash: true`), so the
 * two agree rather than pointing at two spellings of the same page.
 */
function BlogPostCanonicalUrl({ content }) {
  const { siteConfig } = useDocusaurusContext();
  const permalink = content?.metadata?.permalink;

  if (!permalink) {
    return null;
  }

  return (
    <Head>
      <meta
        property="og:url"
        content={`${siteConfig.url}${permalink.replace(/\/?$/, "/")}`}
      />
    </Head>
  );
}

export default function BlogPostPageWrapper(props) {
  return (
    <>
      <BlogPostCanonicalUrl content={props.content} />
      <BlogPostPage {...props} />
    </>
  );
}
