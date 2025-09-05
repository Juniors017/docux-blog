import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

import Card from '../components/Card';
import CardBody from '../components/Card/CardBody';
import Contributor from '../components/Contributor';
import Columns from '../components/Columns';
import Column from '../components/Column';

import styles from './thanks.module.css';

export default function Thanks() {
  return (
    <Layout
  title="Thanks"
  description="Thanks to the developers of the components used on this site"
    >
      <header className={clsx('hero hero--primary', styles.thanksHero)}>
        <div className="container">
          <h1 className="hero__title">Thanks</h1>
          <p className="hero__subtitle">
            A big thank you to everyone who contributed to the development of the components used on this site
          </p>
        </div>
      </header>
      <main className="container margin-vert--lg">
        <div className="row">
          <Column className="col--8 col--offset-2">
            <p className={styles.introText}>
              This site would not have been possible without the contribution of many talented developers.
              This page is dedicated to recognizing their work and contributions.
            </p>
          </Column>
        </div>
        
        <Columns>
          <Column className="col--4">
            <Contributor>
              name: 'Christophe Avonture',
              github: 'cavo789',
              website: 'https://www.avonture.be',
              avatarUrl: 'https://avatars.githubusercontent.com/u/355999?s=200&v=4',
              components: ['GithubProjects', 'MyRepositories', 'Hero', 'BlueSky'],
              description: "Developed the GitHub project visualization components, allowing dynamic display of repositories with filtering and sorting."
            </Contributor>
          </Column>
          
          <Column className="">
            <Contributor>
              name: 'Docusaurus Team',
              github: 'facebook/docusaurus',
              website: 'https://docusaurus.io',
              avatarUrl: 'https://docusaurus.io/img/docusaurus_keytar.svg',
              components: ['Docusaurus Framework', 'Blog Plugin', 'MDX Support', 'Theming System'],
              description: "The Docusaurus team at Meta who developed the framework and its main components."
            </Contributor>
          </Column>
          
          <Column className="">
            <Contributor>
              name: 'Sébastien Lorber',
              github: 'slorber',
              website: 'https://sebastienlorber.com',
              avatarUrl: 'https://avatars.githubusercontent.com/u/749374?s=200&v=4',
              components: ['maintainer of Docusaurus'],
              description: "Main maintainer of Docusaurus, created many essential features and actively contributes to the development of the project."
            </Contributor>
          </Column>
        </Columns>
        
        <Columns>
          <Column className="col--8 col--offset-2">
            <Card className={styles.addYourself} shadow="lw">
              <CardBody>
                <h3>Are you a contributor?</h3>
                <p>
                  If you have developed a component used on this site and you are not listed here,
                  feel free to contact me so I can add your name to this page.
                </p>
                <Link
                  className="button button--outline button--primary"
                  href="https://github.com/facebook/docusaurus/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact me
                </Link>
              </CardBody>
            </Card>
          </Column>
        </Columns>
      </main>
    </Layout>
  );
}
