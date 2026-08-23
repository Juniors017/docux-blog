import React from "react";
// Importe le mapper original + nos composants selon la doc docusaurus
import MDXComponents from "@theme-original/MDXComponents";
import Highlight from "@site/src/components/Highlight";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import DocusaurusButton from "@site/src/components/DocusaurusButton";
import Timeline from "@site/src/components/Timeline";
import TimelineItem from "@site/src/components/Timeline/TimelineItem";
import Columns from "@site/src/components/Columns";
import Column from "@site/src/components/Column";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardFooter from "@site/src/components/Card/CardFooter";
import CardHeader from "@site/src/components/Card/CardHeader";
import CardImage from "@site/src/components/Card/CardImage";
import Contributor from "@site/src/components/Contributor";
import AvatarContainer from "@site/src/components/Avatar/AvatarContainer";
import AvatarImage from "@site/src/components/Avatar/AvatarImage";
import AvatarIntro from "@site/src/components/Avatar/AvatarIntro";
import AvatarName from "@site/src/components/Avatar/AvatarName";
import AvatarSubtitle from "@site/src/components/Avatar/AvatarSubtitle";
import ImageOnClick from "@site/src/components/ImageOnClick";
import LogoIcon from "@site/src/components/LogoIcon";
import Skill from "@site/src/components/Skill";
import Tooltip from "@site/src/components/Tooltip";
import Snippet from "@site/src/components/Snippet";
import Trees from "@site/src/components/Trees";
import Folder from "@site/src/components/Trees/Folder";
import File from "@site/src/components/Trees/File";
import GoatCounterViews from "@site/src/components/GoatCountViews";
import Terminal from "@site/src/components/Terminal";
import TimeTimer, {
  FallbackBefore,
  FallbackAfter,
} from "@site/src/components/TimeTimer";
import PhotosGrid from "@site/src/components/PhotosGrid";

export default {
  // Réutilise la correspondance par défaut
  ...MDXComponents,

  /**
   * Responsive candidates for images in article bodies.
   *
   * `docusaurus-plugin-image-optimizer` writes `<name>-400w.<ext>` and so on
   * during `postBuild` — after this markup is rendered, but into the same
   * build. Deterministic naming is what makes referencing them safe.
   *
   * The plugin writes a candidate **only when it is genuinely narrower than the
   * source**, so a consumer must not ask for one that does not exist. This one
   * can hold to that: since dimensions are forwarded (see below), the real
   * width is known here, and only narrower rungs are listed.
   *
   * `sizes` describes the article column: 65% of a container capped at 1600px
   * in `custom.css`, less 2rem of padding on each side — about 976px — and the
   * full viewport on a phone.
   */
  img: (props) => {
    const { loading, decoding, className, style, height, width, ...rest } =
      props;

    const intrinsicWidth = Number(width);
    let srcSet;
    let sizes;

    if (rest.src && !rest.srcSet && Number.isFinite(intrinsicWidth)) {
      const dot = String(rest.src).lastIndexOf(".");
      const rungs = [400, 800, 1200, 1600].filter((w) => w < intrinsicWidth);

      if (dot > 0 && rungs.length) {
        const base = String(rest.src).slice(0, dot);
        const ext = String(rest.src).slice(dot);
        srcSet = rungs.map((w) => `${base}-${w}w${ext} ${w}w`).join(", ");
        sizes = "(max-width: 996px) 100vw, 976px";
      }
    }

    return (
      <img
        {...rest}
        // Docusaurus measures every image it processes and passes its real
        // dimensions here. They are forwarded rather than dropped: without
        // them the browser cannot reserve space, and since every image below
        // is lazy-loaded, the text shifted under the reader at each one.
        //
        // This used to be `height="auto" width=""`, which removed the problem
        // it was meant to solve. The reason was real — the attributes alone
        // would stretch the image once `max-width: 100%` shrank it — but the
        // answer belongs in CSS, hence the `height: auto` below. Attributes
        // give the aspect ratio, CSS does the sizing.
        height={height}
        width={width}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading || "lazy"}
        decoding={decoding || "async"}
        className={`${className || ""}`}
        // Centering is handled in custom.css (`.markdown p > img`) so that
        // images inside links — badges, inline icons — keep flowing inline.
        //
        // `height: auto` is set here rather than as a `.markdown img` rule:
        // that rule would also hit avatars and component images that rely on a
        // fixed height. Declared before `...style` so a caller can override it.
        style={{
          borderRadius: "3px",
          height: "auto",
          ...style,
        }}
      />
    );
  },
  // Ajoute la balise "highlight" à notre composant <Highlight> };
  // `Highlight` recevra tous les props qui ont été passés à `<Highlight>` dans MDX
  Highlight,

  TabItem,
  Tabs,
  DocusaurusButton,
  Timeline,
  TimelineItem,
  Columns,
  Column,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  Contributor,
  AvatarContainer,
  AvatarImage,
  AvatarIntro,
  AvatarName,
  AvatarSubtitle,
  ImageOnClick,
  LogoIcon,
  Skill,
  Tooltip,
  Snippet,
  Trees,
  Folder,
  File,
  GoatCounterViews,
  Terminal,
  TimeTimer,
  FallbackBefore,
  FallbackAfter,
  PhotosGrid,
};
