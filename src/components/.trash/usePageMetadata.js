import { useMemo } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'; // Import ajouté

// Helper pour normaliser les métadonnées
function normalizeMetadata(source) {
  if (!source) return { title: '', description: '', frontMatter: {} };
  return {
    title: source.title ?? source.frontMatter?.title ?? '',
    description: source.description ?? source.frontMatter?.description ?? '',
    frontMatter: source.frontMatter ?? {},
  };
}

/**
 * Un hook React pour récupérer les métadonnées de la page actuelle
 * à partir de diverses sources Docusaurus.
 */
function usePageMetadata({ blogPostData, customPageMetadata }) {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const metadata = useMemo(() => {
    // Priorité 1: Données de blog passées en props
    if (blogPostData?.metadata) {
      return normalizeMetadata(blogPostData.metadata);
    }

    // Priorité 2: Métadonnées personnalisées passées en props
    if (customPageMetadata) {
      return normalizeMetadata(customPageMetadata);
    }
    
    // Uniquement côté client pour les fallbacks
    if (ExecutionEnvironment.canUseDOM) {
        // Priorité 3: Pages MDX personnalisées via les données globales
        try {
            const globalData = window.docusaurus.globalData;
            if (globalData && globalData['docusaurus-plugin-content-pages']) {
                const pagesData = globalData['docusaurus-plugin-content-pages'].default;
                const currentPageData = pagesData.find(
                    (page) => page.path === location.pathname || page.permalink === location.pathname
                );
                if (currentPageData?.metadata) {
                    return normalizeMetadata(currentPageData.metadata);
                }
            }
        } catch (error) {
            console.warn('Erreur de récupération des métadonnées de page MDX:', error);
        }

        // Priorité 4: Fallback via les balises meta déjà dans le DOM
        try {
            const existingTitle = document.title;
            const existingDescription = document.querySelector('meta[name="description"]')?.content;
            if (existingTitle || existingDescription) {
                return normalizeMetadata({
                    title: existingTitle.replace(` | ${siteConfig.title}`, ''),
                    description: existingDescription,
                    frontMatter: {},
                });
            }
        } catch (error) {
            console.warn('Erreur de récupération des métadonnées du DOM:', error);
        }
    }


    // Fallback ultime: configuration du site
    return normalizeMetadata({
      title: siteConfig.title,
      description: siteConfig.tagline,
      frontMatter: {},
    });
  }, [location.pathname, blogPostData, customPageMetadata, siteConfig.title, siteConfig.tagline]);

  return metadata;
}

export default usePageMetadata;