import React, { useEffect } from 'react'; 
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import { useLocation } from "@docusaurus/router"; // 👉 pour détecter les changements de page
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';
import ScrollToTopButton from '../../components/ScrollToTopButton';

// 👉 c'est le client fourni par le plugin simple-analytics
import { loadSimpleAnalytics } from "../../../plugins/simpleAnalytics/sa-client";

export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    title,
    description,
    frontMatter, // 👉 contient le frontmatter de la page (depuis Markdown/MDX)
  } = props;

  // 👉 gère l'accessibilité clavier (navigation tab)
  useKeyboardNavigation();

  // 👉 permet de savoir sur quelle URL on est (et détecter les changements)
  const location = useLocation();

  // 👉 logiquement on désactive Simple Analytics si :
  // - le frontmatter de la page contient `simpleAnalytics: false`
  // - ou si on n'est pas en prod (donc pas besoin en mode dev)
  const disableSA =
    frontMatter?.simpleAnalytics === false || process.env.NODE_ENV !== "production";

  // 👉 effet qui se déclenche à chaque changement de page
  useEffect(() => {
    if (disableSA) return; // si désactivé → on sort

    // sinon → on charge Simple Analytics
    const cleanup = loadSimpleAnalytics();

    // `loadSimpleAnalytics` retourne une fonction pour nettoyer au démontage
    return cleanup;
  }, [disableSA, location.pathname]); // ⚡️ relance à chaque changement d'URL

  return (
    <LayoutProvider>
      {/* 👉 SEO (balises <title> et <meta description>) */}
      <PageMetadata title={title} description={description} />

      {/* 👉 barre d'accessibilité "Aller au contenu" */}
      <SkipToContent />

      {/* 👉 bandeau au-dessus (si activé dans config) */}
      <AnnouncementBar />

      {/* 👉 barre de navigation */}
      <Navbar />

      {/* 👉 contenu principal */}
      <div
        id={SkipToContentFallbackId}
        className={clsx(
          ThemeClassNames.layout.main.container,
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        
        {/* 👉 gestion des erreurs avec fallback (évite crash UI) */}
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
          {children} 
        </ErrorBoundary>
      </div>

      {/* 👉 footer si non désactivé */}
      {!noFooter && <Footer />}

      {/* 👉 bouton retour en haut */}
      <ScrollToTopButton />
    </LayoutProvider>
  );
}
