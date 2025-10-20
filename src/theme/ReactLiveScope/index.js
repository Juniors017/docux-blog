
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
  // Keep the complete React object accessible if needed (without spread to avoid 'default' key)
  React,
  // Frequently used hooks in snippets
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment,
  forwardRef,
  createElement,
  Children,
  // Custom components exposed in live blocks
  Tooltip,
  LogoIcon,
  Skill,
  Contributor,
};
