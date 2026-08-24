import React from "react";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl"; // Import the useBaseUrl function from Docusaurus
// `srcSet` and `sizes` are optional passthroughs: the caller decides whether
// responsive candidates exist, so this component keeps knowing nothing about
// where they come from.
const CardImage = ({
  className,
  style,
  cardImageUrl,
  alt,
  title,
  srcSet,
  sizes,
}) => {
  const generatedCardImageUrl = useBaseUrl(cardImageUrl);
  return (
    <img
      className={clsx("card__image", className)}
      style={style}
      src={generatedCardImageUrl}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      title={title}
    />
  );
};
export default CardImage;
