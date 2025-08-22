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
      <div className="" > <img src="./img/docux4.png" style={{borderRadius:'50%'}} className="item shadow--tl"></img></div>
   
    </div> 
    <div className="col col--6 text--center  ">
      <div className=" padding-vert--md"><h1 className="hero__title ">@Docux Blog</h1>
            <p className="hero__subtitle">This space is dedicated to my exploration of Docusaurus </p>
            <p className="">Here you will find all information on development and research as well as my notes </p></div>
            
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
      <main>
        <div className={`${styles.homebody} padding-vert--lg`}>
      <div className="container margin-top--lg">
  <div className="row">
    
   
    <div className="col  text--justify ">
    
            <p className="hero__subtitle">
            Docusaurus is a modern static website generator developed by Facebook (Meta). Built with React, it excels at creating documentation websites with features like versioning, search, and internationalization.
            </p>
            <p className="">
            Its plugin architecture allows for easy customization and extension, while the MDX support combines the simplicity of Markdown with the power of React components. With its theme system, responsive design, and built-in SEO optimization, Docusaurus makes it simple to create beautiful, functional, and fast-loading websites that work across all devices. Perfect for documentation, blogs, and project showcase sites.
            </p>
            <p>@Docux</p>
            </div>
            
   
  
  </div>

    
    </div></div>
      </main>

    </Layout>
  );
}
