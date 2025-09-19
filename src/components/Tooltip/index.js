import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";
import * as tooltipModels from "./models";

// Hook pour générer un ID unique, stable
const useUniqueId = (prefix = "id") => {
  const idRef = useRef(`${prefix}-${Math.random().toString(36).slice(2, 11)}`);
  return idRef.current;
};

// Simple debounce
const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const Tooltip = ({
  children,
  text,
  content, // allow JSX/content
  model = null,
  position = "top",
  delay = 200,
  offset = 10,
  style = {},
  shadow = true,
  block = false,
  square = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const tooltipId = useUniqueId("tooltip");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Gestion affichage avec délai
  const showTooltip = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // Positionnement du tooltip
  const computePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const { scrollX, scrollY, innerWidth, innerHeight } = window;

    let newCoords = {};

    switch (position) {
      case "bottom":
        newCoords = {
          top: triggerRect.bottom + scrollY + offset,
          left:
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            tooltipRect.width / 2,
        };
        break;
      case "left":
        newCoords = {
          top:
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            tooltipRect.height / 2,
          left: triggerRect.left + scrollX - tooltipRect.width - offset,
        };
        break;
      case "right":
        newCoords = {
          top:
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            tooltipRect.height / 2,
          left: triggerRect.right + scrollX + offset,
        };
        break;
      case "top":
      default:
        newCoords = {
          top: triggerRect.top + scrollY - tooltipRect.height - offset,
          left:
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            tooltipRect.width / 2,
        };
        break;
    }

    // Collision detection
    if (newCoords.left < scrollX) {
      newCoords.left = scrollX + offset;
    }
    if (newCoords.left + tooltipRect.width > scrollX + innerWidth) {
      newCoords.left = scrollX + innerWidth - tooltipRect.width - offset;
    }
    if (newCoords.top < scrollY) {
      newCoords.top = scrollY + offset;
    }
    if (newCoords.top + tooltipRect.height > scrollY + innerHeight) {
      newCoords.top = scrollY + innerHeight - tooltipRect.height - offset;
    }

    return newCoords;
  };

  const updatePosition = () => {
    const newCoords = computePosition();
    if (newCoords) setCoords(newCoords);
  };

  // Calcul initial + écoute scroll/resize + resize observer
  const debouncedRef = useRef(null);
  useLayoutEffect(() => {
    if (!visible) return;

    debouncedRef.current = debounce(updatePosition, 20);
    const debounced = debouncedRef.current;
    updatePosition();

    window.addEventListener("scroll", debounced, { passive: true });
    window.addEventListener("resize", debounced);

    let ro;
    if (typeof window !== "undefined" && window.ResizeObserver && (triggerRef.current || tooltipRef.current)) {
      ro = new ResizeObserver(debounced);
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (tooltipRef.current) ro.observe(tooltipRef.current);
    }

    return () => {
      window.removeEventListener("scroll", debounced);
      window.removeEventListener("resize", debounced);
      if (ro) ro.disconnect();
      debouncedRef.current = null;
    };
  }, [visible, position, offset]);

  // Support clavier Escape
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        hideTooltip();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible]);

  // Handlers & wrapper approach: always wrap children in a span so we can attach ref/handlers.
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const onClick = useCallback((e) => {
    if (isTouchDevice) visible ? hideTooltip() : showTooltip();
  }, [isTouchDevice, visible, showTooltip, hideTooltip]);

  const onMouseEnter = useCallback(() => showTooltip(), [showTooltip]);
  const onMouseLeave = useCallback(() => hideTooltip(), [hideTooltip]);
  const onFocus = useCallback(() => showTooltip(), [showTooltip]);
  const onBlur = useCallback(() => hideTooltip(), [hideTooltip]);

  const childIsElement = React.isValidElement(children) && typeof children.type === "string";

  // Règle déterministe : si `text` est fourni il est utilisé comme trigger (mot),
  // et `children` (ou `content`) est toujours le contenu du tooltip (définition).
  const triggerNode = (typeof text !== 'undefined' && text !== null) ? text : children;

  const triggerElement = (
    <span
      ref={triggerRef}
      aria-describedby={visible ? tooltipId : undefined}
      tabIndex={childIsElement ? undefined : 0}
      // Par défaut on rend le trigger en block pour éviter le comportement inline
      // (user requested earlier). Le prop `block` permet d'overrider si nécessaire.
      style={{ display: block !== undefined ? (block ? "block" : "inline-block") : "block" }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {triggerNode}
    </span>
  );

  // Contenu du tooltip
  const modelStyle = (() => {
    if (!model) return {};
    if (typeof model === "string") return tooltipModels[model] || {};
    if (typeof model === "function") return model(style) || {};
    if (typeof model === "object") return model || {};
    return {};
  })();

  const mergedStyle = { ...modelStyle, ...style };

  // Harmonise paddingRight when an image is present: ensure text doesn't overlap the image.
  const parsePx = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const m = String(v).match(/([0-9.]+)/);
    return m ? Number(m[1]) : 0;
  };

  const imageSize = parsePx(mergedStyle.imageSize || mergedStyle.image_size || mergedStyle.imagewidth);
  const imageRight = parsePx(mergedStyle.imageRight || mergedStyle.image_right || 0);
  const imageBottom = parsePx(mergedStyle.imageBottom || mergedStyle.image_bottom || 0);
  // Prefer explicit paddingRight / paddingBottom. If `padding` is provided as a shorthand
  // (e.g. '30px 10px'), we avoid using it as a direct paddingRight/paddingBottom value
  // for the image-space calculation because it may contain multiple values.
  const shorthandPadding = mergedStyle.padding;
  const paddingIsShorthand = typeof shorthandPadding === 'string' && /\s/.test(shorthandPadding);

  const explicitPaddingRight = mergedStyle.paddingRight ?? mergedStyle.padding_right ?? (paddingIsShorthand ? undefined : shorthandPadding);

  const explicitPaddingBottom = mergedStyle.paddingBottom ?? mergedStyle.padding_bottom ?? (paddingIsShorthand ? undefined : shorthandPadding);

  const finalPaddingRight = explicitPaddingRight
    ? (typeof explicitPaddingRight === 'number' ? explicitPaddingRight : explicitPaddingRight)
    : (mergedStyle.image ? `${Math.ceil(imageSize + imageRight + 12)}px` : undefined);

  const finalPaddingBottom = explicitPaddingBottom
    ? (typeof explicitPaddingBottom === 'number' ? explicitPaddingBottom : explicitPaddingBottom)
    : (mergedStyle.image ? `${Math.ceil(imageSize + imageBottom + 8)}px` : undefined);

  const finalStyle = { ...mergedStyle };
  if (finalPaddingRight) finalStyle.paddingRight = finalPaddingRight;
  if (finalPaddingBottom) finalStyle.paddingBottom = finalPaddingBottom;

  // Préparer le contenu: si `text` est fourni (cas courant pour votre usage),
  // `text` est le trigger et le contenu provient de `children` (ou `content`).
  // Sinon on tombe sur `content` ou `text`/`children` comme fallback.
  // Si children est un élément (MDX wrap <p>...), essayer d'en extraire le texte intérieur.
  const extractChildrenInnerText = (node) => {
    if (typeof node === 'string') return node;
    if (React.isValidElement(node) && typeof node.type === 'string') {
      const inner = node.props && node.props.children;
      if (typeof inner === 'string') return inner;
      if (Array.isArray(inner)) return inner.filter(i => typeof i === 'string').join(' ');
    }
    return null;
  };

  const childInnerText = extractChildrenInnerText(children);

  const rawContent = (typeof text !== 'undefined' && text !== null)
    ? (content ?? childInnerText ?? children ?? '')
    : (content ?? childInnerText ?? children ?? text ?? '');
  let contentTop = null;
  let contentMain = rawContent;
  if (typeof rawContent === 'string') {
    const parts = rawContent.split(/\n\s*\n/);
    if (parts.length > 1) {
      contentTop = parts[0];
      contentMain = parts.slice(1).join('\n\n');
    }
  }

  // Si le contenu est une simple chaîne et qu'il n'y a pas de titre explicite,
  // utiliser `text` comme titre (h4) dans le tooltip.
  if (!contentTop && typeof rawContent === 'string' && typeof text === 'string' && text.trim().length > 0) {
    contentTop = text;
  }

  // Préparer les nodes JSX pour le contenu principal :
  let contentMainNodes = null;
  if (typeof contentMain === 'string') {
    const paragraphs = contentMain.split(/\n\s*\n/).map((p, idx) => {
      const lines = p.split(/\n/).map((line, i) => (
        // key is fine here because content is stable for the render
        <React.Fragment key={i}>{line}{i < p.split(/\n/).length - 1 ? <br/> : null}</React.Fragment>
      ));
      return <p key={idx} className={styles.paragraph}>{lines}</p>;
    });
    contentMainNodes = paragraphs;
  } else {
    contentMainNodes = contentMain;
  }

  const TooltipContent = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      aria-hidden={!visible}
  className={`${styles.tooltip} ${finalStyle.image ? styles.withImage : ""} ${visible ? styles.visible : ""}`}
  style={{
    top: coords.top,
    left: coords.left,
  ...finalStyle,
    boxShadow: shadow ? style.boxShadow || "0 4px 10px rgba(0,0,0,0.2)" : "none",
    position: "absolute",
    zIndex: 9999,
    pointerEvents: visible ? style.pointerEvents || "auto" : "none",
  }}
      data-position={position}
    >
      <div className={styles.contentWrapper}>
        {contentTop && (
          <div className={styles.contentTop}>
            <h4 className={styles.contentTopTitle}>{contentTop}</h4>
          </div>
        )}

        <div className={styles.contentMainRow}>
          <div className={styles.contentMain}>
            {contentMainNodes}
          </div>

          {mergedStyle.image && (
            <img
              src={mergedStyle.image}
              alt={mergedStyle.imageAlt !== undefined ? mergedStyle.imageAlt : ''}
              aria-hidden={mergedStyle.imageAlt ? 'false' : 'true'}
              className={styles.modelImage}
              style={{
                width: mergedStyle.imageSize || '64px',
                bottom: mergedStyle.imageBottom || '8px',
                right: mergedStyle.imageRight || '8px',
              }}
            />
          )}
        </div>
      </div>
      <div
        className={styles.arrow}
        style={{
          background: mergedStyle.backgroundColor || mergedStyle.background || "#333",
          boxShadow: mergedStyle.boxShadow || (shadow ? "0 4px 10px rgba(0,0,0,0.2)" : "none"),
          border: mergedStyle.border || undefined,
        }}
      />
    </div>
  );

  return (
    <>
      {triggerElement}
      {isMounted && ReactDOM.createPortal(TooltipContent, document.body)}
    </>
  );
};

export default Tooltip;
