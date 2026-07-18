/**
 * Swizzled BlogTagsPostsPage (eject).
 *
 * Replaces the default vertical post list on `/blog/tags/<tag>/` with the
 * site's own PostCard grid (the same design used on the series pages and the
 * RelatedPosts component), while keeping the theme's wrapper: SEO metadata,
 * BlogLayout with the blog sidebar, and the "View All Tags" link.
 *
 * Posts are read from the shared blog metadata and filtered by the current tag
 * slug, so drafts/unlisted posts are excluded and images resolve exactly like
 * everywhere else on the site.
 */

import React from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import { useBlogTagsPostsPageTitle } from "@docusaurus/theme-common/internal";
import Link from "@docusaurus/Link";
import BlogLayout from "@theme/BlogLayout";
import SearchMetadata from "@theme/SearchMetadata";
import Heading from "@theme/Heading";
import Unlisted from "@theme/ContentVisibility/Unlisted";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import PostCard from "@site/src/components/Blog/PostCard";

function BlogTagsPostsPageMetadata({ tag }) {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
    </>
  );
}

function BlogTagsPostsPageContent({ tag, sidebar }) {
  const title = useBlogTagsPostsPageTitle(tag);

  const tagSlug = createSlug(tag.label);
  const taggedPosts = getBlogMetadata()
    .filter((post) => !post.draft && !post.unlisted)
    .filter((post) => (post.tags || []).some((t) => createSlug(t) === tagSlug))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <BlogLayout sidebar={sidebar}>
      {tag.unlisted && <Unlisted />}
      <header className="margin-bottom--xl">
        <Heading as="h1">{title}</Heading>
        {tag.description && <p>{tag.description}</p>}
        <Link href={tag.allTagsPath}>
          <Translate
            id="theme.tags.tagsPageLink"
            description="The label of the link targeting the tag list page"
          >
            View All Tags
          </Translate>
        </Link>
      </header>
      {taggedPosts.length > 0 ? (
        <div className="row">
          {taggedPosts.map((post) => (
            <PostCard key={post.permalink} post={post} />
          ))}
        </div>
      ) : (
        <p>No articles found for this tag.</p>
      )}
    </BlogLayout>
  );
}

export default function BlogTagsPostsPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage
      )}
    >
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
