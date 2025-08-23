# Composant Contributor

Ce composant permet d'afficher des cartes de contributeurs dans un style cohérent et élégant, avec une mise en page soignée incluant avatar, liens sociaux et contributions.

![Aperçu du composant Contributor](/img/contributor-preview.png)

> Ce composant utilise les composants Card que j'ai créés personnellement. Vous pouvez consulter l'ensemble du projet sur [GitHub](https://github.com/Juniors017/Simple-Card).

## Fonctionnalités

- Avatar du contributeur avec bordure stylisée
- Liens vers GitHub et site web personnel
- Description de la contribution
- Liste des composants développés
- Compatible avec le mode sombre
- Deux styles d'utilisation (props ou contenu entre balises)
- Transition et animation au survol

## Installation

Le composant utilise le système de Card réutilisable que j'ai développé spécifiquement pour ce projet Docusaurus, ainsi que des styles CSS modulaires.

### Prérequis

- Un projet Docusaurus
- Les composants Card de base (disponibles dans le repository [Simple-Card](https://github.com/Juniors017/Simple-Card))

### Étapes d'installation

1. Copiez le dossier `Contributor` complet dans votre dossier `src/components/`
2. Assurez-vous que les composants Card sont disponibles dans `src/components/Card/`
3. Pour l'utilisation avec MDX, enregistrez le composant dans `src/theme/MDXComponents.js`:

```javascript
import Contributor from '@site/src/components/Contributor';

export default {
  // ...autres composants
  Contributor
};
```

## Utilisation

Ce composant peut être utilisé de deux façons différentes, selon vos préférences et votre contexte.

### Méthode 1: Avec props (approche traditionnelle React)

```jsx
import Contributor from '@site/src/components/Contributor';

<Contributor
  name="Nom du contributeur"
  github="username"
  website="https://site.com"
  avatarUrl="https://chemin/vers/avatar.jpg"
  components={['Composant1', 'Composant2']}
  description="Description de la contribution"
/>
```

### Méthode 2: Avec contenu entre balises (style MDX)

```jsx
import Contributor from '@site/src/components/Contributor';

<Contributor>
  name: 'Nom du contributeur',
  github: 'username',
  website: 'https://site.com',
  avatarUrl: 'https://chemin/vers/avatar.jpg',
  components: ['Composant1', 'Composant2'],
  description: 'Description de la contribution'
</Contributor>
```

Cette seconde approche est particulièrement adaptée pour les fichiers MDX où le style déclaratif est plus lisible et maintainable.

## Exemples d'utilisation

### Dans un fichier JSX (comme une page React)

```jsx
import React from 'react';
import Contributor from '@site/src/components/Contributor';

function TeamPage() {
  return (
    <div className="team-container">
      <h1>Notre équipe</h1>
      
      {/* Méthode 1: Avec props */}
      <Contributor
        name="Alice Durand"
        github="alice-dev"
        website="https://alice-durand.fr"
        avatarUrl="/img/team/alice.jpg"
        components={['Authentification', 'Dashboard']}
        description="Lead developer et architecte frontend, Alice a conçu l'architecture globale de l'application."
      />
      
      {/* Méthode 2: Avec contenu entre balises */}
      <Contributor>
        name: 'Bob Martin',
        github: 'bob-coder',
        website: 'https://bobmartin.dev',
        avatarUrl: '/img/team/bob.jpg',
        components: ['API Integration', 'Data Visualization'],
        description: 'Expert en visualisation de données et intégration API, Bob a développé les graphiques interactifs.'
      </Contributor>
    </div>
  );
}
```

### Dans un fichier MDX (documentation ou blog)

```mdx
---
title: Nos contributeurs
---

# Contributeurs du projet

Merci à tous ceux qui ont contribué à ce projet !

<Contributor>
  name: 'Charlie Weber',
  github: 'charlie-dev',
  website: 'https://charlieweb.io',
  avatarUrl: '/img/team/charlie.jpg',
  components: ['Documentation', 'Tests'],
  description: 'Charlie a grandement amélioré notre documentation et mis en place la suite de tests automatisés.'
</Contributor>

<Contributor>
  name: 'Dana Lopez',
  github: 'dana-l',
  website: 'https://danalopez.com',
  avatarUrl: '/img/team/dana.jpg',
  components: ['Accessibilité', 'Design System'],
  description: 'Designer et développeuse, Dana a veillé à l\'accessibilité et créé notre design system.'
</Contributor>
```

## Approche technique

Ce composant utilise une approche hybride et polyvalente qui lui permet de fonctionner dans différents contextes.

### Conception polyvalente

Nous avons conçu ce composant pour être aussi flexible que possible:

1. **Détection automatique du mode d'utilisation**: Le composant détecte automatiquement si des props sont fournies directement ou si du contenu est passé entre les balises.

2. **Parsing intelligent**: Lorsque du contenu est fourni entre les balises, le composant utilise des expressions régulières pour extraire les différentes propriétés.

3. **État React**: Un état local gère les données du contributeur, qu'elles proviennent des props ou du contenu analysé.

### Structure du composant

Le composant s'appuie sur les composants Card existants pour maintenir une cohérence visuelle dans l'application:

```
Card (conteneur principal avec ombre et bordure)
└─┬ CardHeader (en-tête avec fond légèrement coloré)
  │ ├─ Avatar (image circulaire avec bordure)
  │ └─ Informations et liens
  │    ├─ Nom du contributeur
  │    └─ Liens sociaux (GitHub, Site web)
  └─ CardBody (corps de la carte)
     ├─ Description (texte de présentation)
     └─ Liste des composants (tags)
```

Voici une représentation visuelle simple :

```
┌─────────────────────────────────────────────────┐
│ ┌─────┐  Nom du Contributeur                   │
│ │     │                                         │
│ │ IMG │  🔗 GitHub  🔗 Site web                 │
│ └─────┘                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Description du contributeur et de son travail   │
│ sur le projet...                                │
│                                                 │
│ Composants:                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Composant1│ │Composant2│ │Composant3│        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### CSS modulaire

Les styles sont encapsulés dans un fichier CSS modulaire pour éviter les conflits de style et faciliter la maintenance:

- Styles de carte avec ombres et transitions
- Styles adaptés au mode clair et sombre
- Gestion des avatars et liens sociaux
- Mise en forme de la liste des composants

## Personnalisation

Vous pouvez personnaliser le composant selon vos besoins:

- Modifier les styles dans `styles.module.css`
- Ajouter des champs supplémentaires en étendant le composant et les expressions régulières
- Adapter l'apparence en modifiant les classes CSS appliquées aux composants Card

## Notes sur l'évolution du composant

Ce composant est le résultat d'une refactorisation qui a unifié deux approches distinctes (`Contributor` et `ContributorMDX`) en un seul composant polyvalent. Cette approche nous a permis de:

- Éliminer la duplication de code
- Simplifier la maintenance
- Offrir plus de flexibilité aux utilisateurs
- Conserver une cohérence dans l'interface utilisateur

## 📄 License

MIT — free to use, modify, and share.

## 💬 Généré par IA

Ce code a été généré par Docux à l'aide de l'IA.