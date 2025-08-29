import React from 'react';
import BlogPostItemContent from '@theme-original/BlogPostItem/Content';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import SerieBanner from '@site/src/components/SerieBanner';

export default function BlogPostItemContentWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const serieName = metadata?.frontMatter?.serie;

  return (
    <>
      {serieName && isBlogPostPage && (
        <SerieBanner serieName={serieName} />
      )}
      <BlogPostItemContent {...props} />
    </>
  );
}
