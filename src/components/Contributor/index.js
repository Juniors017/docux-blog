import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';

import Card from '../Card';
import CardHeader from '../Card/CardHeader';
import CardBody from '../Card/CardBody';

import styles from './styles.module.css';

/**
 * Composant Contributor - Affiche une carte pour un contributeur
 * Accepte à la fois les props traditionnelles et le contenu entre balises (style MDX)
 * 
 * @param {Object} props
 * @param {string} props.name - Nom du contributeur
 * @param {string} props.github - Identifiant GitHub du contributeur
 * @param {string} props.website - Site web du contributeur (optionnel)
 * @param {string} props.avatarUrl - URL de l'avatar du contributeur
 * @param {Array<string>} props.components - Liste des composants développés
 * @param {string} props.description - Description de la contribution
 * @param {React.ReactNode} props.children - Contenu MDX/YAML pour une utilisation type <Contributor>contenu</Contributor>
 * @returns {JSX.Element}
 */
export default function Contributor({ 
  name, 
  github, 
  website, 
  avatarUrl, 
  components, 
  description, 
  children 
}) {
  // Si les props sont fournies directement, on les utilise
  // Sinon on va parser le contenu fourni entre les balises
  const [contributorData, setContributorData] = useState({
    name: name || '',
    github: github || '',
    website: website || '',
    avatarUrl: avatarUrl || '',
    components: components || [],
    description: description || ''
  });

  // Si children est présent, on essaye de parser le contenu
  useEffect(() => {
    if (children && (!name || !github)) {
      try {
        // On extrait le contenu texte des children si c'est une chaîne
        const content = typeof children === 'string' 
          ? children 
          : Array.isArray(children) 
            ? children.map(child => typeof child === 'string' ? child : '').join('\n')
            : '';
        
        // Regex pour extraire les propriétés du format texte
        const nameMatch = content.match(/name\s*:\s*['"]?([^'",\n]*)/);
        const githubMatch = content.match(/github\s*:\s*['"]?([^'",\n]*)/);
        const websiteMatch = content.match(/website\s*:\s*['"]?([^'",\n]*)/);
        const avatarMatch = content.match(/avatarUrl\s*:\s*['"]?([^'",\n]*)/);
        
        // Nouvelle regex améliorée pour la description qui gère mieux les guillemets et le texte multi-ligne
        const descriptionMatch = content.match(/description\s*:\s*['"](.+?)['"](?:,|\n|$)/s);

        // Extraction des composants
        let componentsMatch = content.match(/components\s*:\s*\[\s*(['"][^'"]*['"](?:\s*,\s*['"][^'"]*['"])*)\s*\]/);
        let componentsList = [];
        if (componentsMatch && componentsMatch[1]) {
          componentsList = componentsMatch[1]
            .split(',')
            .map(comp => comp.trim().replace(/^['"]|['"]$/g, ''));
        }

        setContributorData({
          name: nameMatch ? nameMatch[1].trim() : contributorData.name,
          github: githubMatch ? githubMatch[1].trim() : contributorData.github,
          website: websiteMatch ? websiteMatch[1].trim() : contributorData.website,
          avatarUrl: avatarMatch ? avatarMatch[1].trim() : contributorData.avatarUrl,
          components: componentsList.length > 0 ? componentsList : contributorData.components,
          description: descriptionMatch ? descriptionMatch[1].trim() : contributorData.description
        });
      } catch (error) {
        console.error('Erreur de parsing du contenu Contributor:', error);
      }
    }
  }, [children, name, github, website, avatarUrl, components, description]);

  // Si les données ne sont pas encore extraites ou non valides, ne rien afficher
  if (!contributorData.name || !contributorData.github) {
    return null;
  }

  return (
    <Card className={styles.contributorCard} shadow="md">
      <CardHeader className={styles.contributorHeader}>
        <div className={styles.avatarContainer}>
          <img 
            src={contributorData.avatarUrl} 
            alt={`${contributorData.name} avatar`} 
            className={styles.avatar} 
          />
        </div>
        <div className={styles.nameAndLinks}>
          <h3 className={styles.contributorName}>{contributorData.name}</h3>
          <div className={styles.contributorLinks}>
            <Link 
              to={`https://github.com/${contributorData.github}`}
              className={styles.plainLink}
              target="_blank"
              rel="noopener noreferrer"
              title={`Profil GitHub: ${contributorData.github}`}
            >
              <img 
                src="/img/icon/github-logo.svg" 
                alt="GitHub" 
                className={styles.socialIcon} 
              />
            </Link>
            {contributorData.website && (
              <Link 
                to={contributorData.website}
                className={styles.plainLink}
                target="_blank"
                rel="noopener noreferrer"
                title={`Site web: ${contributorData.website}`}
              >
                <img 
                  src="/img/icon/website-icon.svg" 
                  alt="Site web" 
                  className={styles.socialIcon} 
                />
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className={styles.contributorBody}>
        <p>{contributorData.description}</p>
        
        {contributorData.components && contributorData.components.length > 0 && (
          <div className={styles.componentsList}>
            <h4>Composants:</h4>
            <ul>
              {contributorData.components.map((component, idx) => (
                <li key={idx} className={styles.componentItem}>{component}</li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
