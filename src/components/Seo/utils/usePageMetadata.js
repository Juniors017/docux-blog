import { useMemo } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'; // Import ajouté

function usesearchPageMetadata(pageData, propsFrontMatter) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🟢 Début usesearchPageMetadata', { pageData, propsFrontMatter });
  }
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  let searchPageMetadata = undefined;
  let searchBlogPostData = undefined;

  /**
   * initialisation : Utilisation des props directement passées au composant
   * 
   * Si des données sont passées directement en props (par exemple depuis une page MDX),
   * on les utilise en priorité.
   */
  if (pageData || propsFrontMatter) {
    searchPageMetadata = {
      title: pageData?.title || propsFrontMatter?.title,
      description: pageData?.description || propsFrontMatter?.description,
      frontMatter: propsFrontMatter || pageData?.frontMatter || {}
    };
  }
  
  /**
   * ÉTAPE 1 : Récupération des métadonnées des articles de blog
   * 
   * Utilisation d'un try-catch car le hook useBlogPost n'est disponible
   * que sur les pages d'articles. Sur les autres pages, il génère une erreur
   * que nous interceptons gracieusement.
   */
  try {
    // Import dynamique du hook blog - seulement si on est sur une page de blog
    const { useBlogPost } = require('@docusaurus/plugin-content-blog/client');
    if (typeof useBlogPost === 'function') {
      const blogPost = useBlogPost?.();
      if (blogPost?.metadata) {
        searchBlogPostData = blogPost.metadata; // Stockage des métadonnées de l'article
      }
    }
  } catch (error) {
    // Hook useBlogPost non disponible sur cette page (normal pour les pages non-blog)
    // Le composant SEO continue de fonctionner avec des métadonnées génériques
    // Silencieux : détection normale d'une page non-blog
  }

  /**
   * ÉTAPE 2 : Récupération des métadonnées des pages de documentation
   * 
   * Tentative de récupération des métadonnées pour les pages docs.
   * Même principe avec try-catch pour éviter les erreurs.
   */
  try {
    const { useDoc } = require('@docusaurus/plugin-content-docs/client');
    if (typeof useDoc === 'function') {
      const doc = useDoc?.();
      if (doc?.metadata) {
        searchPageMetadata = doc.metadata; // Stockage des métadonnées de documentation
      }
    }
  } catch (error) {
    // Hook useDoc non disponible ou pas sur une page docs
    // Silencieux : détection normale d'une page non-docs
  }

  /**
   * ÉTAPE 3 : Récupération des métadonnées pour les pages MDX personnalisées
   * 
   * Pour les pages MDX dans src/pages/, tentative de récupération
   * des métadonnées depuis les hooks disponibles ou le contexte global.
   */
  try {
    // Essayer de récupérer les métadonnées depuis le contexte global Docusaurus
    if (!searchPageMetadata && ExecutionEnvironment.canUseDOM && window.docusaurus) {
      const globalData = window.docusaurus.globalData;
      
      // Rechercher dans les données du plugin de pages
      if (globalData && globalData['docusaurus-plugin-content-pages']) {
        const pagesData = globalData['docusaurus-plugin-content-pages'];
        if (pagesData && pagesData.default) {
          const currentPageData = pagesData.default.find(page => 
            page.path === location.pathname || 
            page.permalink === location.pathname
          );
          
          if (currentPageData && currentPageData.metadata) {
            searchPageMetadata = {
              title: currentPageData.metadata.title || currentPageData.title,
              description: currentPageData.metadata.description || currentPageData.description,
              frontMatter: currentPageData.metadata.frontMatter || {}
            };
          }
        }
      }
    }
  } catch (error) {
    // Récupération des métadonnées de pages non disponible
    // Silencieux : situation normale pour certaines pages
  }

  /**
   * ÉTAPE 3bis : Récupération alternative via les métadonnées globales
   * 
   * Si aucun hook spécialisé n'a fonctionné, on essaie de récupérer
   * les métadonnées depuis le contexte global de Docusaurus.
   */
  try {
    // Essayer avec @docusaurus/theme-common pour plus de compatibilité
    const { useThemeConfig } = require('@docusaurus/theme-common');
    const themeConfig = useThemeConfig?.();
    
    /**
     * Récupération depuis le DOM si aucun hook n'a fonctionné
     * Utile pour les pages statiques générées côté client
     */
    if (!searchPageMetadata && ExecutionEnvironment.canUseDOM) {
      // Si on a des données globals Docusaurus disponibles
      if (window.docusaurus) {
        const globalData = window.docusaurus.globalData;
        if (globalData) {
          // Rechercher les métadonnées de page spécifiques dans les plugins
          const pagePluginData = globalData['docusaurus-plugin-content-pages'];
          if (pagePluginData && pagePluginData.default) {
            const currentPageData = pagePluginData.default.find(page => 
              page.path === location.pathname || 
              page.permalink === location.pathname
            );
            
            if (currentPageData && currentPageData.frontMatter) {
              searchPageMetadata = {
                title: currentPageData.title || currentPageData.frontMatter.title,
                description: currentPageData.description || currentPageData.frontMatter.description,
                frontMatter: currentPageData.frontMatter
              };
            }
          }
        }
      }
      
    }
  } catch (error) {
    // Hooks alternatifs non disponibles - situation normale
    // Silencieux : détection normale des capacités disponibles
  }

  if (!searchPageMetadata && !searchBlogPostData) {
  /**
   * Fallback ultime : récupération des métadonnées depuis le DOM
   * -------------------------------------------------------------
   * Si aucune métadonnée n'a été trouvée via les hooks Docusaurus ou le contexte global,
   * on tente de récupérer les informations SEO directement depuis les balises meta du DOM.
   * On ajoute une gestion spécifique pour les pages /repository et /series.
   */
    const existingTitle = ExecutionEnvironment.canUseDOM ? document.title : undefined;
    const existingDescription = ExecutionEnvironment.canUseDOM ? document.querySelector('meta[name="description"]')?.content : undefined;
    const existingOgTitle = ExecutionEnvironment.canUseDOM ? document.querySelector('meta[property="og:title"]')?.content : undefined;
    const existingOgDescription = ExecutionEnvironment.canUseDOM ? document.querySelector('meta[property="og:description"]')?.content : undefined;
    const existingOgImage = ExecutionEnvironment.canUseDOM ? document.querySelector('meta[property="og:image"]')?.content : undefined;

    // Gestion spécifique pour /repository
    if (location.pathname.includes('/repository')) {
      searchPageMetadata = {
        title: existingTitle || "Repositories Publics - Projets Open Source de Docux",
        description: existingDescription || "Découvrez tous les projets open source développés par Docux : applications React, outils Docusaurus, composants UI et solutions de développement web moderne",
        frontMatter: {
          title: "Repositories Publics - Projets Open Source de DocuxLab",
          description: "Découvrez tous les projets open source développés par Docux : applications React, outils Docusaurus, composants UI et solutions de développement web moderne",
          schemaType: "CollectionPage",
          image: "/img/docux.png",
          authors: ["docux"],
          tags: [
            "open source",
            "github",
            "repositories",
            "projets",
            "react",
            "docusaurus",
            "javascript",
            "typescript",
            "portfolio",
            "développement web",
            "code",
            "programming"
          ],
          keywords: [
            "repositories",
            "projets open source",
            "github", 
            "développement web",
            "react",
            "docusaurus",
            "javascript",
            "typescript",
            "portfolio"
          ],
          category: "Portfolio",
         
        }
      };
    }
    // Gestion spécifique pour /series
    else if (location.pathname.includes('/series')) {
    
      searchPageMetadata = {
        title: existingTitle || "Séries d'Articles - Collections Thématiques de Docux",
        description: existingDescription || "Découvrez nos séries d'articles organisées par thématique : développement web, Docusaurus, React, SEO et bien plus. Collections d'articles approfondis pour progresser étape par étape",
        authors: ["docux"],
        frontMatter: {
          title: "Séries d'Articles - Collections Thématiques de DocuxLab",
          description: "Découvrez nos séries d'articles organisées par thématique : développement web, Docusaurus, React, SEO et bien plus. Collections d'articles approfondis pour progresser étape par étape",
          schemaType: "CollectionPage",
          image: "/img/docux.png",
          authors: ["docux"],
          tags: [
            "séries",
            "collections",
            "articles",
            "tutoriels",
            "développement web",
            "docusaurus",
            "react",
            "javascript",
            "apprentissage",
            "formation"
          ],
          keywords: [
            "séries d'articles",
            "collections thématiques", 
            "tutoriels progressifs",
            "développement web",
            "docusaurus",
            "react",
            "javascript",
            "apprentissage",
            "formation"
          ],
          category: "Collections",
        
          // ...existing code...
        }
      };
    }
     // Gestion spécifique pour series/series-articles/?name=
    else if (location.pathname.includes('series/series-articles/?name=')) {
     
      searchPageMetadata = {
        title: existingTitle || "Séries d'Articles - Collections Thématiques de Docux",
        description: `Cette série contient différents article sur le thème :  ${serieName},`,
        authors: ["docux"],
        frontMatter: {
          title: "Séries d'Articles - Collections Thématiques de DocuxLab",
          description: "Développement web, Docusaurus, React, SEO et bien plus. Collections d'articles approfondis pour progresser étape par étape.",
          schemaType: "CollectionPage",
          image: "/img/docux.png",
          authors: ["docux"],
          tags: [
            "séries",
            "collections",
            "articles",
            "tutoriels",
            "développement web",
            "docusaurus",
            "react",
            "javascript",
            "apprentissage",
            "formation"
          ],
          keywords: [
            "séries d'articles",
            "collections thématiques", 
            "tutoriels progressifs",
            "développement web",
            "docusaurus",
            "react",
            "javascript",
            "apprentissage",
            "formation"
          ],
          category: "Collections",
         
          // ...existing code...
        }
      };
    }
    // Fallback générique pour toutes les autres pages
    else {
      searchPageMetadata = {
        title: existingTitle || siteConfig.title,
        description: existingDescription || siteConfig.tagline,
        frontMatter: {
          title: existingOgTitle || siteConfig.title,
          description: existingOgDescription || siteConfig.tagline,
          image: existingOgImage || "/img/docux.png",
          schemaType: "WebPage",
          authors: ["docux"],
          tags: [
            "docux",
            "docusaurus",
            "react",
            "javascript",
            "typescript",
            "développement web",
            "blog",
            "portfolio"
          ],
          keywords: [
            "docux",
            "docusaurus",
            "react",
            "javascript",
            "typescript",
            "développement web",
            "blog",
            "portfolio"
          ],
          category: "Site",
       
          // ...existing code...
        }
      };
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('🔴 Fin usesearchPageMetadata', { searchPageMetadata, searchBlogPostData });
  }
return {
  blogPostData: searchBlogPostData || pageData,
  pageMetadata: searchPageMetadata || searchBlogPostData,
};
}
export default usesearchPageMetadata;