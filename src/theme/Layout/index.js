import React from 'react';
import Layout from '@theme-original/Layout';
import Seo from '@site/src/components/Seo';

export default function LayoutWrapper(props) {
  return (
    <>
      <Seo />
      <Layout {...props} />
    </>
  );
}
