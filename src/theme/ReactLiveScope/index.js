// Swizzled ReactLiveScope to inject custom components into live code blocks.
// Any variable exported here becomes available inside ```jsx live``` blocks
// without requiring explicit imports inside the snippet.

import * as React from 'react';
// IMPORTANT: Do NOT spread "...React" inside the exported scope object because it
// adds a "default" key. react-live then generates a function parameter named
// "default" which triggers: SyntaxError: Unexpected token 'default'.
// We expose only the useful members explicitly (hooks, Fragment, etc.).

import Tooltip from '@site/src/components/Tooltip';
import LogoIcon from '@site/src/components/LogoIcon';
import Skill from '@site/src/components/Skill';
import Contributor from '@site/src/components/Contributor';

// Add more custom components here if needed:
// import MyComponent from '@site/src/components/MyComponent';



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
