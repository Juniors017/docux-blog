/**
 * 📁 MyRepositories Component
 *
 * A layout wrapper for showcasing a user's GitHub repositories.
 * Combines a hero section with a dynamic list of public repositories
 * fetched from GitHub and displayed via the `GithubProjects` component.
 *
 * Props:
 * - username (string): GitHub username whose repositories will be displayed
 *
 * Behavior:
 * - Renders a hero intro with a title and description
 * - Passes the `username` prop to the `GithubProjects` component
 * - Displays both active and archived repositories
 *
 * Styling:
 * - Uses scoped styles from `styles.module.css`
 * - Applies layout styling to the main container
 *
 * Returns:
 * - A full-page section with a header and repository grid
 */

import PropTypes from "prop-types";
import GithubProjects from "@site/src/components/GithubProjects";
import Hero from "@site/src/components/Hero";

import styles from "./styles.module.css";

export default function MyRepositories({ username }) {
  return (
    <main className={styles.main}>
      <Hero>
        <h1>Mes Projets GitHub</h1>
        <p>
          Ci-dessous, vous trouverez une liste de mes dépôts publics stockés sur
          GitHub.com. Ils sont divisés en deux parties : les actifs et les inactifs.
          <br />
          N'hésitez pas à récupérer le code et à le réutiliser dans votre projet s'il peut
          vous être utile.
        </p>
      </Hero>
      <GithubProjects username={username} />
    </main>
  );
}

MyRepositories.propTypes = {
  username: PropTypes.string.isRequired,
};
