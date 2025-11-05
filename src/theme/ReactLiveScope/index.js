import * as React from "react";

// @ts-ignore
import Tooltip from "@site/src/components/Tooltip";
import LogoIcon from "@site/src/components/LogoIcon";
import Skill from "@site/src/components/Skill";
import Contributor from "@site/src/components/Contributor";
import Columns from "@site/src/components/Columns";
import TimeTimer, {
  FallbackBefore,
  FallbackAfter,
} from "@site/src/components/TimeTimer";
import Column from "@site/src/components/Column";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardFooter from "@site/src/components/Card/CardFooter";
import CardHeader from "@site/src/components/Card/CardHeader";
import CardImage from "@site/src/components/Card/CardImage";
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
  TimeTimer,
  FallbackBefore,
  FallbackAfter,
  Columns,
  Column,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  // HTML elements
  center: "center",
};
