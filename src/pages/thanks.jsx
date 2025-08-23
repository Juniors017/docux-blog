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
      title="Remerciements"
      description="Remerciements aux développeurs des composants de ce site"
    >
      <header className={clsx('hero hero--primary', styles.thanksHero)}>
        <div className="container">
          <h1 className="hero__title">Remerciements</h1>
          <p className="hero__subtitle">
            Un grand merci aux personnes qui ont contribué au développement des composants utilisés sur ce site
          </p>
        </div>
      </header>
      <main className="container margin-vert--lg">
        <div className="row">
          <Column className="col--8 col--offset-2">
            <p className={styles.introText}>
              Ce site n'aurait pas été possible sans la contribution de nombreux développeurs talentueux.
              Cette page leur est dédiée pour reconnaître leur travail et leur contribution.
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
              components: ['GithubProjects', 'MyRepositories', 'Hero'],
              description: "A développé les composants de visualisation des projets GitHub, permettant d'afficher dynamiquement les dépôts avec filtrage et tri."
            </Contributor>
          </Column>
          
          <Column className="">
            <Contributor>
              name: 'Docusaurus Team',
              github: 'facebook/docusaurus',
              website: 'https://docusaurus.io',
              avatarUrl: 'https://docusaurus.io/img/docusaurus_keytar.svg',
              components: ['DocCard', 'Layout', 'Admonition'],
              description: "Team Docusaurus de Meta qui a développé le framework et ses composants principaux."
            </Contributor>
          </Column>
          
          <Column className="">
            <Contributor>
              name: 'Sébastien Lorber',
              github: 'slorber',
              website: 'https://sebastienlorber.com',
              avatarUrl: 'https://avatars.githubusercontent.com/u/749374?s=200&v=4',
              components: ['MDX Components', 'React Integration'],
              description: "Mainteneur principal de Docusaurus, a créé de nombreuses fonctionnalités essentielles et contribue activement au développement du projet."
            </Contributor>
          </Column>
        </Columns>
        
        <Columns>
          <Column className="col--8 col--offset-2">
            <Card className={styles.addYourself} shadow="lw">
              <CardBody>
                <h3>Vous êtes un contributeur ?</h3>
                <p>
                  Si vous avez développé un composant utilisé sur ce site et que vous n'êtes pas listé ici,
                  n'hésitez pas à me contacter pour que j'ajoute votre nom à cette page.
                </p>
                <Link
                  className="button button--outline button--primary"
                  href="https://github.com/facebook/docusaurus/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contactez-moi
                </Link>
              </CardBody>
            </Card>
          </Column>
        </Columns>
      </main>
    </Layout>
  );
}
