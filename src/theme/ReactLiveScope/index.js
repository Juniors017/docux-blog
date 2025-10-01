// Swizzled ReactLiveScope to inject custom components into live code blocks.
// Toute variable exportée ici sera disponible dans les blocs ```jsx live```
// Sans avoir besoin d'import explicite dans le snippet.

import * as React from 'react';
// On réimporte tout le scope par défaut Docusaurus (si besoin futur).
// (Pas strictement nécessaire de copier le scope original si on ne veut que React + nos composants.)

import Tooltip from '@site/src/components/Tooltip';
import LogoIcon from '@site/src/components/LogoIcon';
import Skill from '@site/src/components/Skill';
import Contributor from '@site/src/components/Contributor';

// Vous pouvez ajouter d'autres composants personnalisés ici :
// import MyComponent from '@site/src/components/MyComponent';



// IMPORTANT: exporter tout ce que le runtime react-live doit connaître.
export default {
  React,
  ...React,
  Tooltip,
  LogoIcon,
  Skill,
  Contributor,
  
};
