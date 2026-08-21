import { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import SearchBar from "@theme/SearchBar";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";

import styles from "./index.module.css";

/**
 * Fallback illustration.
 *
 * `PostCard` and `series.js` default to `/img/default.jpg`, which does not
 * exist in `static/`. Every published post currently carries an `image`, so
 * this only ever covers a post published without one.
 */
const FALLBACK_IMAGE = "/img/docux.webp";

const RECENT_POSTS_COUNT = 3;

const REPOSITORY_URL = "https://github.com/Juniors017/docux-blog";
const FORUM_URL = "https://forum.docuxlab.com";
const FEED_URL = "/blog/rss.xml";

/**
 * The angles the blog actually covers, each backed by the real series behind
 * it. The `series` values must match the `series` front matter exactly; a name
 * that no longer exists is dropped at render time rather than shipping a dead
 * link.
 */
const TOPICS = [
  {
    title: "MDX components",
    description:
      "Cards, columns, avatars, file trees, tooltips, skill bars. Built on Infima, registered globally, and documented from the code actually running on this site.",
    series: ["infima components", "Design your site"],
  },
  {
    title: "Local plugins",
    description:
      "Docusaurus plugins written for this blog: build-time image optimisation with sharp, word replacement in Remark, front matter read in Node.",
    series: ["Docusaurus Plugins"],
  },
  {
    title: "Writing toolchain",
    description:
      "What it takes to keep publishing: Front Matter CMS inside VS Code, ESLint and Prettier on a Docusaurus project, data fetched at build time.",
    series: ["CMS UI", "Tools", "Api and scripts in Docusaurus"],
  },
  {
    title: "SEO and analytics",
    description:
      "Measuring a static site without cookies: GoatCounter, Simple Analytics, and a per-post view counter reading the JSON API.",
    series: ["SEO Analytics"],
  },
];

/**
 * Formats a publication date.
 *
 * Pinned to UTC so the string rendered by Node during the static build matches
 * the one React produces in the browser, whatever time zone either runs in.
 */
function formatDate(value) {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Every published post, newest first.
 *
 * The metadata plugin only strips drafts in production builds, so they are
 * filtered here as well: the counters below stay honest under `npm start` too.
 */
function getPublishedPosts() {
  return getBlogMetadata()
    .filter((post) => !post.draft && !post.unlisted)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Groups published posts by series.
 *
 * Built from the posts rather than from `generateSeriesList()` so the counts
 * shown here can never contradict the article count in the hero, and so every
 * link is slugified with `createSlug` — the very function the series-route
 * plugin uses to register `/series/<slug>`.
 */
function getSeriesList(posts) {
  const bySlug = new Map();

  for (const post of posts) {
    if (!post.series) {
      continue;
    }
    const name = String(post.series);
    const slug = createSlug(name);
    if (!slug) {
      continue;
    }

    const existing = bySlug.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      // `posts` is newest first, so the first hit carries the latest date.
      bySlug.set(slug, {
        name,
        slug,
        permalink: `/series/${slug}`,
        latestDate: post.date,
        count: 1,
      });
    }
  }

  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

/**
 * The posts to feature on the homepage.
 *
 * Deliberately not the three most recent ones. Publishing a series back to
 * back — the usual rhythm here — filled the row with three articles from that
 * single series, and a first-time visitor saw a one-subject blog. Taking the
 * newest post of each distinct series instead keeps three different corners on
 * show, with no editorial list to maintain. A post without a series counts as
 * its own entry.
 */
function getFeaturedPosts(posts, limit) {
  const seen = new Set();
  const featured = [];

  for (const post of posts) {
    const key = post.series ? createSlug(String(post.series)) : post.permalink;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    featured.push(post);
    if (featured.length === limit) {
      break;
    }
  }

  return featured;
}

/**
 * Site-wide visitor count, read from the public GoatCounter counter endpoint.
 *
 * `TOTAL` is GoatCounter's special path for the whole site (case-sensitive, no
 * leading slash). Its responses are cached for up to four hours, so the number
 * is recent rather than live.
 *
 * The stat renders nothing until the request succeeds. It sits last in the
 * row, so arriving late pushes nothing around, and a blocked request — ad
 * blocker, offline, CORS — simply leaves the row three items long instead of
 * showing an empty slot.
 */
function SiteVisitors() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    // Same source of truth as the per-post counter: the endpoint is read from
    // the GoatCounter script tag rather than repeated in the code.
    const endpoint = document
      .querySelector("script[data-goatcounter]")
      ?.getAttribute("data-goatcounter");
    if (!endpoint) {
      return undefined;
    }

    let base;
    try {
      const url = new URL(endpoint);
      base = `${url.protocol}//${url.host}`;
    } catch {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`${base}/counter/TOTAL.json`, {
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => {
        if (json?.count) {
          setCount(String(json.count));
        }
      })
      .catch(() => {
        // Aborted, blocked or offline: the stat stays hidden.
      });

    return () => controller.abort();
  }, []);

  if (!count) {
    return null;
  }

  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>Visitors</dt>
      <dd className={styles.statValue}>{count}</dd>
    </div>
  );
}

function SeriesBadge({ series }) {
  if (!series) {
    return null;
  }
  return (
    <Link className={styles.badge} to={series.permalink}>
      {series.name}
    </Link>
  );
}

function Hero({ postCount, seriesCount, latestDate }) {
  return (
    <header className={styles.hero}>
      <div className={styles.wrap}>
        <div className={styles.heroInner}>
          <div className={styles.portrait}>
            <img
              src="/img/docux4.webp"
              alt="Docux, the mascot of this blog, sitting at a desk in front of screens full of code"
              width="1621"
              height="608"
              fetchPriority="high"
            />
          </div>

          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Docusaurus notebook</p>
            <h1 className={styles.title}>@DocuxLab Blog</h1>
            <p className={styles.tagline}>Explore Docusaurus with me</p>
            <p className={styles.lead}>
              Find here my developments, research, and notes about Docusaurus:
              components, plugins and tooling, written from the code that runs
              on this very site.
            </p>

            <div className={styles.actions}>
              <Link
                className={`button button--lg ${styles.primaryAction}`}
                to="/blog/"
              >
                Read the latest articles
              </Link>
              <Link
                className={`button button--lg ${styles.secondaryAction}`}
                to="/series/"
              >
                Browse the series
              </Link>
            </div>

            {/* The navbar carries a second, identical search field. The
                landmark gives this one a name of its own so both are
                distinguishable to a screen reader. */}
            <div className={styles.heroSearch} role="search" aria-label="Blog">
              <SearchBar />
              <span className={styles.heroSearchHint}>
                {postCount} articles indexed, full text.
              </span>
            </div>
          </div>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Articles</dt>
            <dd className={styles.statValue}>{postCount}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Series</dt>
            <dd className={styles.statValue}>{seriesCount}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>Last published</dt>
            <dd className={styles.statValue}>{latestDate}</dd>
          </div>
          <SiteVisitors />
        </dl>
      </div>
    </header>
  );
}

function Topics({ topics }) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="topics-heading">
      <div className={styles.wrap}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>The ground covered</p>
            <h2 id="topics-heading" className={styles.sectionTitle}>
              What you will find here
            </h2>
          </div>
        </div>

        <div className={styles.topicGrid}>
          {topics.map((topic) => (
            <article key={topic.title} className={styles.topicCard}>
              <h3 className={styles.topicTitle}>{topic.title}</h3>
              <p className={styles.topicDescription}>{topic.description}</p>
              <div className={styles.badgeRow}>
                {topic.series.map((series) => (
                  <SeriesBadge key={series.slug} series={series} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestPosts({ posts, seriesBySlug }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="latest-heading"
    >
      <div className={styles.wrap}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>One per series</p>
            <h2 id="latest-heading" className={styles.sectionTitle}>
              Latest articles
            </h2>
          </div>
          <Link className={styles.sectionLink} to="/blog/">
            All articles →
          </Link>
        </div>

        <div className={styles.postGrid}>
          {posts.map((post) => {
            const series = post.series
              ? seriesBySlug.get(createSlug(String(post.series)))
              : null;

            return (
              <article key={post.permalink} className={styles.postCard}>
                {/* Decorative duplicate of the title link: hidden from the
                    accessibility tree and skipped by the keyboard so the card
                    is announced once. */}
                <Link
                  className={styles.postMedia}
                  to={post.permalink}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={post.image || FALLBACK_IMAGE}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                <div className={styles.postBody}>
                  {series ? (
                    <div className={styles.badgeRow}>
                      <SeriesBadge series={series} />
                    </div>
                  ) : null}
                  <h3 className={styles.postTitle}>
                    <Link to={post.permalink}>{post.title}</Link>
                  </h3>
                  {post.description ? (
                    <p className={styles.postDescription}>{post.description}</p>
                  ) : null}
                  <p className={styles.postMeta}>{formatDate(post.date)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SeriesGrid({ seriesList }) {
  if (seriesList.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="series-heading">
      <div className={styles.wrap}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Read in order</p>
            <h2 id="series-heading" className={styles.sectionTitle}>
              Series
            </h2>
          </div>
          <Link className={styles.sectionLink} to="/series/">
            All series →
          </Link>
        </div>

        <div className={styles.seriesGrid}>
          {seriesList.map((series) => (
            <Link
              key={series.slug}
              className={styles.seriesCard}
              to={series.permalink}
            >
              <span className={styles.seriesCount}>
                {series.count}
                <span className={styles.seriesCountUnit}>
                  {series.count > 1 ? " articles" : " article"}
                </span>
              </span>
              <span className={styles.seriesName}>{series.name}</span>
              <span className={styles.seriesMeta}>
                Updated {formatDate(series.latestDate)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Elsewhere({ blueSkyHandle }) {
  const links = [
    {
      label: "Source of this site",
      description: "Every component and plugin behind this blog, open source.",
      href: REPOSITORY_URL,
    },
    {
      label: "My GitHub projects",
      description: "The repositories behind the articles, listed and filtered.",
      to: "/repository/",
    },
    {
      label: "Forum",
      description: "Ask a question, or share what you built.",
      href: FORUM_URL,
    },
    {
      label: "RSS feed",
      description: "New articles in your reader, no account needed.",
      href: FEED_URL,
    },
    blueSkyHandle
      ? {
          label: "Bluesky",
          description: "Short updates and work in progress.",
          href: `https://bsky.app/profile/${blueSkyHandle}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <section
      className={`${styles.section} ${styles.sectionAlt}`}
      aria-labelledby="elsewhere-heading"
    >
      <div className={styles.wrap}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Keep in touch</p>
            <h2 id="elsewhere-heading" className={styles.sectionTitle}>
              Elsewhere
            </h2>
          </div>
        </div>

        <div className={styles.linkGrid}>
          {links.map((link) => {
            // `Link` registers every internal path with the broken-link
            // checker, and `trailingSlash: true` turns `/blog/rss.xml` into
            // `/blog/rss.xml/`, which matches no route. Entries carrying an
            // `href` — the feed file and the external sites — are plain
            // anchors; only real routes go through `Link`.
            const Anchor = link.to ? Link : "a";

            return (
              <Anchor
                key={link.label}
                className={styles.linkCard}
                {...(link.to ? { to: link.to } : { href: link.href })}
              >
                <span className={styles.linkLabel}>{link.label}</span>
                <span className={styles.linkDescription}>
                  {link.description}
                </span>
              </Anchor>
            );
          })}
        </div>

        <p className={styles.signature}>@Docux</p>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyHandle = siteConfig.customFields?.blueSky?.handle;

  const posts = getPublishedPosts();
  const seriesList = getSeriesList(posts);
  const seriesBySlug = new Map(
    seriesList.map((series) => [series.slug, series])
  );

  const topics = TOPICS.map((topic) => ({
    ...topic,
    series: topic.series
      .map((name) => seriesList.find((series) => series.name === name))
      .filter(Boolean),
  })).filter((topic) => topic.series.length > 0);

  return (
    <Layout description={siteConfig.tagline}>
      <div className={styles.home}>
        <Hero
          postCount={posts.length}
          seriesCount={seriesList.length}
          latestDate={formatDate(posts[0]?.date)}
        />
        <main>
          <Topics topics={topics} />
          <LatestPosts
            posts={getFeaturedPosts(posts, RECENT_POSTS_COUNT)}
            seriesBySlug={seriesBySlug}
          />
          <SeriesGrid seriesList={seriesList} />
          <Elsewhere blueSkyHandle={blueSkyHandle} />
        </main>
      </div>
    </Layout>
  );
}
