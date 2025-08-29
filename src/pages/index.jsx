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
        <p className="hero__subtitle">Explorez Docusaurus avec moi</p>
        <p>Retrouvez ici mes développements, recherches et notes sur Docusaurus</p>
        <div className="margin-top--md">
          <Link
            className={`button button--lg margin-right--md ${styles.docsButton}`}
            to="/docs/base/">
            Documentation
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
                Découvrez mes projets GitHub
              </Link>
            </div>
      <main>
        <div className={`${styles.homebody} padding-vert--lg`}>
      <div className="container margin-top--lg">
  <div className="row">
    
   
    <div className="col text--justify">
            <p className={`hero__subtitle ${styles.animatedContent}`}>
            Docusaurus est un générateur de sites web statiques moderne développé par Facebook (Meta). Construit avec React, il excelle dans la création de sites de documentation avec des fonctionnalités comme le versionnement, la recherche et l'internationalisation.
            </p>
            <p className={styles.animatedContent}>
            Son architecture de plugins permet une personnalisation et une extension faciles, tandis que la prise en charge de MDX combine la simplicité de Markdown avec la puissance des composants React. Avec son système de thèmes, sa conception responsive et son optimisation SEO intégrée, Docusaurus permet de créer facilement des sites web beaux, fonctionnels et rapides qui fonctionnent sur tous les appareils. Parfait pour la documentation, les blogs et les sites vitrines de projets.
            </p>
           
            <p className="text--right margin-top--lg">@Docux</p>
            </div>
            
   
  
  </div>

    
    </div></div>
      </main>

    </Layout>
  );
}
