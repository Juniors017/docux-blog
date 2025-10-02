
import * as React from 'react';

import Tooltip from '@site/src/components/Tooltip';
import LogoIcon from '@site/src/components/LogoIcon';
import Skill from '@site/src/components/Skill';
import Contributor from '@site/src/components/Contributor';

// Export only the symbols the react-live runtime needs to evaluate snippets.
const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment,
  forwardRef,
  createElement,
  Children,
} = React;

export default {
  // Garder l'objet React complet accessible si besoin (sans le spread pour éviter la clé 'default')
  React,
  // Hooks fréquemment utilisés dans les snippets
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment,
  forwardRef,
  createElement,
  Children,
  // Composants custom exposés dans les blocs live
  Tooltip,
  LogoIcon,
  Skill,
  Contributor,
};
