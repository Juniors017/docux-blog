import React, { useState, useEffect } from "react";
import clsx from "clsx";
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from "./styles.module.css";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [fly, setFly] = useState(false);
  const imageUrl = useBaseUrl('/img/buttontop.png');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    setFly(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => setFly(false), 800);
  };

  return (
    <div
      className={clsx(
        styles.scrollBtn,
        isVisible && styles.show,
        fly && styles.fly
      )}
      onClick={scrollToTop}
    >
      <img
        src={imageUrl}
        alt="Retour en haut"
        width="30"
        height="30"
      />
    </div>
  );
}
