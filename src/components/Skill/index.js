// ===============================================
// SKILL COMPONENT - Progress Bars and Circles
// ===============================================
// This component allows displaying skills as:
// - Progress bars (type="bar")
// - Progress circles (type="circle")
// With scroll animations and complete customization

import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

/**
 * Skill Component - Display skills with bars or circles
 * 
 * @param {string} name - Name of the skill to display
 * @param {number} value - Mastery percentage (0-100)
 * @param {string} type - Display type: 'bar' or 'circle'
 * @param {string} color - Custom color (optional)
 * @param {object} gradient - Gradient object {from: "color1", to: "color2"}
 * @param {boolean} rounded - Rounded borders (true/false)
 * @param {string} valuePosition - Text position: 'top', 'center', 'around'
 * @param {boolean} showPercentage - Show percentage
 * @param {number} size - Circle size in pixels
 * @param {number} height - Bar height in pixels
 * @param {number} thickness - Circle thickness in pixels
 * @param {number} animationDuration - Animation duration in seconds
 * @param {boolean} animateOnScroll - Trigger animation on scroll
 * @param {string} className - Additional CSS classes
 */
export default function Skill({
  name,
  value = 0,
  type = 'bar',
  color,
  gradient,
  rounded = true,
  valuePosition = 'top',
  showPercentage = true,
  size = 120,
  height = 20,
  thickness = 8,
  animationDuration = 1.5,
  animateOnScroll = true,
  className = '' // Nouvelle prop className
}) {
  // ===============================================
  // SCROLL ANIMATION MANAGEMENT
  // ===============================================
  
  // DOM reference to observe the element
  const containerRef = useRef(null);
  
  // State to know if the element is visible (triggers animation)
  const [isVisible, setIsVisible] = useState(!animateOnScroll);

  // Effect hook to configure the Intersection Observer
  useEffect(() => {
    // If scroll animation is disabled, exit
    if (!animateOnScroll) return;

    // Intersection observer configuration
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element becomes visible
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing after the first appearance
          observer.unobserve(entry.target);
        }
      },
      {
        // Element must be 30% visible to trigger animation
        threshold: 0.3,
        // Triggers slightly before element is completely visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Start observing if element exists
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Cleanup on component destruction
    return () => observer.disconnect();
  }, [animateOnScroll]);

  // ===============================================
  // COLOR UTILITY FUNCTIONS
  // ===============================================

  /**
   * Generates automatic color based on percentage
   * Color system by tiers:
   * - 80%+ : Green (very good)
   * - 60-79% : Yellow (good)
   * - 40-59% : Orange (average)
   * - 20-39% : Red (weak)
   * - <20% : Dark red (very weak)
   */
  const getAutoColor = (value) => {
    if (value >= 80) return '#4CAF50'; // Green - Expert
    if (value >= 60) return '#e5ff00ff'; // Yellow - Advanced
    if (value >= 40) return '#FF9800'; // Orange - Intermediate
    if (value >= 20) return '#ff4107ff'; // Red - Beginner
    return '#f44336'; // Dark red - Default
  };

  // Final color: custom color or automatic color
  const finalColor = color || getAutoColor(value);
  
  /**
   * Gets background color according to current theme (light/dark)
   * Necessary for conic gradients in circles
   */
  const getBackgroundColor = () => {
    if (typeof window !== 'undefined') {
      // Check if dark theme is active
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return isDark ? '#444' : '#e0e0e0';
    }
    return '#e0e0e0'; // Default color
  };
  
  /**
   * Generates CSS style for gradients
   * - For bars: linear gradient from left to right
   * - For circles: conic gradient with empty area in background color
   */
  const getGradientStyle = () => {
    if (gradient) {
      return type === 'circle' 
        ? `conic-gradient(${gradient.from} 0deg, ${gradient.to} ${(value * 3.6)}deg, ${getBackgroundColor()} ${(value * 3.6)}deg)`
        : `linear-gradient(to right, ${gradient.from}, ${gradient.to})`;
    }
    return finalColor;
  };

  // ===============================================
  // CIRCLE COMPONENT RENDERING
  // ===============================================
  if (type === 'circle') {
    // Mathematical calculations for SVG circle thanks IA :D
    const radius = (size / 2) - (thickness / 2) - 5; // Radius minus margin
    const circumference = 2 * Math.PI * radius; // Total circumference
    const strokeDasharray = circumference; // Dash size
    
    // Animation: visible part of circle according to percentage
    const strokeDashoffset = isVisible ? circumference - (value / 100) * circumference : circumference;

    // Generate unique ID for gradient
    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div 
        ref={containerRef} 
        className={`${styles.skillCircleContainer} ${className}`} 
        style={{ width: size, height: size }}
      >
        {/* Name displayed above the circle */}
        {valuePosition === 'top' && (
          <div className={styles.skillNameCircle}>{name}</div>
        )}
        
        <div className={styles.skillCircleWrapper}>
          {/* SVG containing both circles */}
          <svg width={size} height={size} className={styles.skillCircleSvg}>
            
            {/* SVG gradient definition (must be before circles) */}
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradient.from} />
                  <stop offset="100%" stopColor={gradient.to} />
                </linearGradient>
              </defs>
            )}
            
            {/* Background circle (gray, static) */}
            <circle
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke="var(--skill-circle-background)" // Adaptive CSS variable
              strokeWidth={thickness}
            />
            
            {/* Progress circle (colored, animated) */}
            <circle
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={gradient ? `url(#${gradientId})` : finalColor}
              strokeWidth={thickness}
              strokeLinecap={rounded ? "round" : "butt"} // Rounded or sharp borders
              strokeDasharray={strokeDasharray} // Defines total circumference
              strokeDashoffset={strokeDashoffset} // Hidden part (animation)
              className={styles.skillCircleProgress}
              style={{
                animationDuration: `${animationDuration}s`,
                '--circle-circumference': circumference // CSS variable for animation
              }}
            />
          </svg>
          
          {/* Text positioned in the center of the circle */}
          {valuePosition === 'center' && (
            <div className={styles.skillCircleText}>
              <div 
                className={styles.skillCircleName}
                style={{ fontSize: `${Math.max(size * 0.08, 10)}px` }} // Adaptive size
              >
                {name}
              </div>
              {showPercentage && (
                <div 
                  className={styles.skillCircleValue}
                  style={{ fontSize: `${Math.max(size * 0.12, 14)}px` }} // Adaptive size
                >
                  {value}%
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Text positioned around the circle */}
        {valuePosition === 'around' && (
          <div className={styles.skillCircleAround}>
            <div className={styles.skillNameAround}>{name}</div>
            {showPercentage && (
              <div className={styles.skillValueAround}>{value}%</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===============================================
  // BAR COMPONENT RENDERING
  // ===============================================
  
  return (
    <div ref={containerRef} className={styles.skillBarContainer}>
      
      {/* Header with name and percentage */}
      {valuePosition === 'top' && (
        <div className={styles.skillBarHeader}>
          <span className={styles.skillBarName}>{name}</span>
          {showPercentage && (
            <span className={styles.skillBarValue}>{value}%</span>
          )}
        </div>
      )}
      
      {/* Bar container (gray background) */}
      <div 
        className={`${styles.skillBarTrack} ${rounded ? styles.rounded : ''}`}
        style={{ height: `${height}px` }}
      >
        {/* Progress bar (colored, animated) */}
        <div
          className={`${styles.skillBarFill} ${rounded ? styles.rounded : ''} ${isVisible ? styles.animate : ''}`}
          style={{
            width: isVisible ? `${value}%` : '0%', // Animation: 0% → target value
            background: getGradientStyle(), // Color or gradient
            animationDuration: `${animationDuration}s`
          }}
        />
        
        {/* Centered text on the bar */}
        {valuePosition === 'center' && (
          <div className={styles.skillBarCenterContainer}>
            <div className={styles.skillBarCenterName}>{name}</div>
            {showPercentage && (
              <div className={styles.skillBarCenterText}>{value}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}