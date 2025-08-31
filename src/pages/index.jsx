import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Fourhomecards from '@site/src/components/Fourhomecards';


import styles from './index.module.css';


function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (


<div className={`${styles.homehero} padding-vert--lg`}>
  <div className="container margin-top--lg" >
  <div className="row ">
    
    <div className="col col--1">
      <div className=""></div>
    </div>
    <div className="col col--3 text--center padding-horiz--xs">
      <div className={styles.circleImage}>
        <img src="/img/docux4.png" alt="Docux Logo" />
      </div>
    </div> 
    <div className="col col--6 text--center">
      <div className="padding-vert--md">
  <h1 className="hero__title">@DocuxLab Blog</h1>
  <p className="hero__subtitle">Explore Docusaurus with me</p>
  <p>Find here my developments, research, and notes about Docusaurus</p>
        <div className="margin-top--md">
          <Link
            className={`button button--lg margin-right--md ${styles.docsButton}`}
            to="/blog/">
            Recent articles
          </Link>
          <Link
            className={`button button--lg ${styles.blogButton}`}
            to="/blog/">
            Blog
          </Link>
        </div>
      </div>
    </div>
    <div className="col col--1">
      <div className=""></div>
    </div>
  </div>

    
    </div>
    </div>
  );
}

export default function Home() {
  
  return (
    <Layout>
      <HomepageHeader />
       <div className="margin-top--lg text--center">
              <Link to="/repository" className={`${styles.featureButton} button button--outline button--secondary button--lg`}>
                Discover my GitHub projects
              </Link>
            </div>
      <main>
        <div className={`${styles.homebody} padding-vert--lg`}>
      <div className="container margin-top--lg">
  <div className="row">
    
   
    <div className="col text--justify">
            <p className={`hero__subtitle ${styles.animatedContent}`}>
            Docusaurus is a modern static website generator developed by Facebook (Meta). Built with React, it excels at creating documentation sites with features like versioning, search, and internationalization.
            </p>
            <p className={styles.animatedContent}>
            Its plugin architecture allows easy customization and extension, while MDX support combines the simplicity of Markdown with the power of React components. With its theme system, responsive design, and built-in SEO optimization, Docusaurus makes it easy to create beautiful, functional, and fast websites that work on any device. Perfect for documentation, blogs, and project showcase sites.
            </p>
           
            <p className="text--right margin-top--lg">@Docux</p>
            </div>
            
   
  
  </div>

    
    </div></div>
      </main>

    </Layout>
  );
}
