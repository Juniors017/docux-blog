import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import styles from "./styles.module.css";
import * as tooltipModels from "./models";

// SSR-safe layout effect hook.
// Uses useLayoutEffect on the client and useEffect on the server to prevent warnings.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

// Hook to generate a unique and stable ID during the component's lifecycle.
// Essential for accessibility, especially for linking the trigger to the tooltip via `aria-describedby`.
const useUniqueId = (prefix = "id") => {
  const idRef = useRef(`${prefix}-${Math.random().toString(36).slice(2, 11)}`);
  return idRef.current;
};

// Debounce hook to limit the calling frequency of a function.
// Used here to optimize position recalculations on scroll or resize.
const useDebounce = (fn, wait) => {
  const timeout = useRef(null);
  const cb = useCallback(
    (...args) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => fn(...args), wait);
    },
    [fn, wait]
  );

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  return cb;
};

// Utility to parse a pixel value (string or number) into a number.
const parsePx = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const m = String(v).match(/([0-9.]+)/);
  return m ? Number(m[1]) : 0;
};

// Utility to recursively extract the raw text from a React component's children.
const extractChildrenInnerText = (node) => {
  if (typeof node === "string") return node;
  if (Array.isArray(node))
    return node.map(extractChildrenInnerText).join(" ");
  if (React.isValidElement(node))
    return extractChildrenInnerText(node.props.children);
  return "";
};

/**
 * A flexible and accessible Tooltip component.
 * Displays a tooltip on hover or focus of a trigger element.
 * Positioning is dynamic to stay within the viewport, and the arrow is always aligned.
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The content of the tooltip.
 * @param {string} props.text The trigger text, which also serves as the tooltip's title.
 * @param {('info'|'success'|'warning'|'error'|'teacher'|'suricate'|object|Function)} [props.model=null] Pre-defined style model, a custom style object, or a function returning a style object.
 * @param {'top'|'bottom'|'left'|'right'} [props.position='top'] Preferred tooltip position. It will flip automatically if there's not enough space.
 * @param {number} [props.delay=200] Delay in milliseconds before the tooltip is shown.
 * @param {number} [props.offset=10] Distance in pixels between the trigger element and the tooltip.
 * @param {React.CSSProperties} [props.style={}] Custom CSS styles to apply to the tooltip, overriding model styles.
 * @param {boolean} [props.shadow=true] Toggles the box-shadow on the tooltip.
 * @param {boolean} [props.block=false] If true, the trigger element will be a block-level element (`display: block`).
 */
const Tooltip = ({
  children,
  text,
  model = null,
  position = "top",
  delay = 200,
  offset = 10,
  style = {},
  shadow = true,
  block = false,
}) => {
  // --- Component States ---
  const [visible, setVisible] = useState(false); // Tooltip visibility
  const [coords, setCoords] = useState({ top: 0, left: 0 }); // Tooltip coordinates (top, left)
  const [currentPosition, setCurrentPosition] = useState(position); // Actual position after calculation (may differ from `position`)
  const [arrowCoords, setArrowCoords] = useState({}); // Arrow coordinates for perfect alignment
  const [isMounted, setIsMounted] = useState(false); // Tracks mounting for client-side only rendering (portal)
  const [isTouch, setIsTouch] = useState(false); // Detects a touch-enabled environment

  // --- Refs ---
  const triggerRef = useRef(null); // Ref to the trigger element
  const tooltipRef = useRef(null); // Ref to the tooltip itself
  const timerRef = useRef(null); // Ref for the delay timer

  // --- IDs ---
  const tooltipId = useUniqueId("tooltip"); // Unique ID for accessibility

  // Effect to mark the component as mounted (client-side)
  useEffect(() => {
    setIsMounted(true);
    // Clean up the timer if the component unmounts
    return () => clearTimeout(timerRef.current);
  }, []);

  // --- Show/Hide Management ---

  // Shows the tooltip after the specified delay
  const showTooltip = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  // Hides the tooltip immediately
  const hideTooltip = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // --- Positioning Logic ---

  // Calculates the optimal position for the tooltip and its arrow
  const computePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const { scrollX, scrollY, innerWidth, innerHeight } = window;

    let bestPosition = position;

    // --- Flipping Logic ---
    // If the preferred position doesn't fit in the viewport, try the opposite position.

    // Vertical flipping
    if (position === 'top' && triggerRect.top - tooltipRect.height - offset < 0) {
      if (triggerRect.bottom + tooltipRect.height + offset <= innerHeight) {
        bestPosition = 'bottom';
      }
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + offset > innerHeight) {
      if (triggerRect.top - tooltipRect.height - offset >= 0) {
        bestPosition = 'top';
      }
    }

    // Horizontal flipping
    if (position === 'left' && triggerRect.left - tooltipRect.width - offset < 0) {
      if (triggerRect.right + tooltipRect.width + offset <= innerWidth) {
        bestPosition = 'right';
      }
    } else if (position === 'right' && triggerRect.right + tooltipRect.width + offset > innerWidth) {
      if (triggerRect.left - tooltipRect.width - offset >= 0) {
        bestPosition = 'left';
      }
    }

    setCurrentPosition(bestPosition); // Update the actual used position

    let top, left;

    // Calculate top/left coordinates based on the best position
    switch (bestPosition) {
      case "bottom":
        top = triggerRect.bottom + scrollY + offset;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - offset;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollY +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        left = triggerRect.right + scrollX + offset;
        break;
      case "top":
      default:
        top = triggerRect.top + scrollY - tooltipRect.height - offset;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
    }

    // --- Collision Prevention (Clamping) ---
    // Ensures the tooltip never overflows the viewport edges.
    if (left < scrollX) left = scrollX + offset;
    if (left + tooltipRect.width > scrollX + innerWidth)
      left = scrollX + innerWidth - tooltipRect.width - offset;
    if (top < scrollY) top = scrollY + offset;
    if (top + tooltipRect.height > scrollY + innerHeight)
      top = scrollY + innerHeight - tooltipRect.height - offset;

    // --- Arrow Position Calculation ---
    // Aligns the arrow with the center of the trigger, even if the tooltip is shifted.
    const ARROW_WIDTH = 8;
    const ARROW_HEIGHT = 8;
    const newArrowCoords = {};
    if (bestPosition === 'top' || bestPosition === 'bottom') {
      const arrowLeft = (triggerRect.left + scrollX + triggerRect.width / 2) - left - (ARROW_WIDTH / 2);
      newArrowCoords.left = `${arrowLeft}px`;
    } else { // 'left' or 'right'
      const arrowTop = (triggerRect.top + scrollY + triggerRect.height / 2) - top - (ARROW_HEIGHT / 2);
      newArrowCoords.top = `${arrowTop}px`;
    }
    setArrowCoords(newArrowCoords);

    return { top, left };
  }, [offset, position, setArrowCoords]);

  // Updates the tooltip's position
  const updatePosition = useCallback(() => {
    const newCoords = computePosition();
    if (newCoords) setCoords(newCoords);
  }, [computePosition]);

  // --- Event Observers ---

  // Recalculates position on scroll or resize
  const debouncedUpdate = useDebounce(updatePosition, 20);
  useIsomorphicLayoutEffect(() => {
    if (!visible) return;
    updatePosition(); // Initial update

    window.addEventListener("scroll", debouncedUpdate, { passive: true });
    window.addEventListener("resize", debouncedUpdate);

    // ResizeObserver is more performant for detecting element size changes
    let ro;
    if (window.ResizeObserver && (triggerRef.current || tooltipRef.current)) {
      ro = new ResizeObserver(debouncedUpdate);
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (tooltipRef.current) ro.observe(tooltipRef.current);
    }

    return () => {
      window.removeEventListener("scroll", debouncedUpdate);
      window.removeEventListener("resize", debouncedUpdate);
      if (ro) ro.disconnect();
    };
  }, [visible, updatePosition, debouncedUpdate]);

  // Hides the tooltip with the "Escape" key
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e) => e.key === "Escape" && hideTooltip();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, hideTooltip]);

  // Detects if the environment is touch-enabled to adapt behavior (on click)
  useEffect(() => {
    const handler = () => setIsTouch(true);
    window.addEventListener("touchstart", handler, { once: true });
    return () => window.removeEventListener("touchstart", handler);
  }, []);

  // --- Event Handlers for the Trigger ---
  const onClick = useCallback(
    () => (isTouch ? (visible ? hideTooltip() : showTooltip()) : null),
    [isTouch, visible, showTooltip, hideTooltip]
  );

  const triggerElement = (
    <span
      ref={triggerRef}
      aria-describedby={visible ? tooltipId : undefined}
      tabIndex={0} // Makes the element focusable
      style={{ display: block ? "block" : "inline-block" }}
      onClick={onClick}
      onMouseEnter={!isTouch ? showTooltip : undefined}
      onMouseLeave={!isTouch ? hideTooltip : undefined}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className="text--decoration text--italic text--primary"
    >
      {text}
    </span>
  );

  // --- Tooltip Styles and Content ---

  // Merges model styles and custom styles
  const { finalStyle, mergedStyle } = useMemo(() => {
    const modelStyle =
      typeof model === "string"
        ? tooltipModels[model] || {}
        : typeof model === "function"
        ? model(style) || {}
        : typeof model === "object"
        ? model
        : {};

    const _mergedStyle = { ...modelStyle, ...style };
    const imageSize = parsePx(_mergedStyle.imageSize || 0);
    const imageRight = parsePx(_mergedStyle.imageRight || 0);
    const imageBottom = parsePx(_mergedStyle.imageBottom || 0);

    const _finalStyle = { ..._mergedStyle };
    if (_mergedStyle.image) {
      _finalStyle.paddingRight ??= `${imageSize + imageRight + 12}px`;
      _finalStyle.paddingBottom ??= `${imageSize + imageBottom + 8}px`;
    }
    return { finalStyle: _finalStyle, mergedStyle: _mergedStyle };
  }, [model, style]);

  // Prepares the content (title and body) of the tooltip
  const { contentTop, contentMainNodes } = useMemo(() => {
    // The title is the `text` prop.
    const _contentTop = (typeof text === "string" && text.trim()) ? text : null;

    // The main content is the `children` prop.
    const _contentMain = children;

    // If `children` is a plain string, process it to create paragraphs.
    // Otherwise, render it directly (assuming it's JSX).
    const _contentMainNodes =
      typeof _contentMain === "string"
        ? _contentMain
            .split(/\n\s*\n/)
            .map((p, idx) => (
              <p key={idx} className={styles.paragraph}>
                {p}
              </p>
            ))
        : _contentMain;

    return { contentTop: _contentTop, contentMainNodes: _contentMainNodes };
  }, [children, text]);

  // --- Tooltip Rendering via a Portal ---
  // The React portal renders the tooltip at the root of `document.body`
  // to avoid z-index and clipping issues from parent containers.
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
        boxShadow: shadow
          ? style.boxShadow || "0 4px 10px rgba(0,0,0,0.2)"
          : "none",
        position: "absolute",
        zIndex: 9999,
        pointerEvents: visible ? "auto" : "none",
      }}
      data-position={currentPosition}
    >
      <div className={styles.contentWrapper}>
        {contentTop && (
          <div className={styles.contentTop}>
            <h4 className={styles.contentTopTitle}>{contentTop}</h4>
          </div>
        )}
        <div className={styles.contentMainRow}>
          <div className={styles.contentMain}>{contentMainNodes}</div>
          {mergedStyle.image && (
            <img
              src={mergedStyle.image}
              alt={mergedStyle.imageAlt ?? ""}
              aria-hidden={mergedStyle.imageAlt ? "false" : "true"}
              className={styles.modelImage}
              style={{
                width: mergedStyle.imageSize || "64px",
                bottom: mergedStyle.imageBottom || "8px",
                right: mergedStyle.imageRight || "8px",
              }}
            />
          )}
        </div>
      </div>
      <div
        className={styles.arrow}
        style={{
          ...arrowCoords, // Apply the dynamic position of the arrow
          background:
            mergedStyle.backgroundColor ||
            mergedStyle.background ||
            "#333",
          boxShadow:
            mergedStyle.boxShadow ||
            (shadow ? "0 4px 10px rgba(0,0,0,0.2)" : "none"),
          border: mergedStyle.border,
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





