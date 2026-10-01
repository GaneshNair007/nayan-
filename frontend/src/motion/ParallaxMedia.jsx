import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASING } from './easing';

/**
 * Reusable scroll-linked parallax media component.
 * Uses MotionValues (useScroll, useTransform) to drive visual properties
 * entirely off the main React render cycle (zero setState per frame).
 * 
 * @param {string} src - Image URL or Video URL
 * @param {string} alt - Accessibility alt text
 * @param {boolean} isVideo - Whether the media is a video
 * @param {number} strength - Vertical parallax translation percentage (default: 8)
 * @param {number[]} scaleRange - Optional scale range [start, end]
 * @param {string[]} offset - useScroll offset (default: ["start end", "end start"])
 * @param {string} objectPosition - CSS object-position (default: 'center')
 * @param {number} hoverScale - Scale multiplier on hover (default: 1.0, e.g. 1.08)
 * @param {string} className - Additional CSS class name
 * @param {object} style - Additional styles for the wrapper container
 */
export default function ParallaxMedia({
  src,
  alt = '',
  isVideo = false,
  strength = 6,
  scaleRange = null,
  offset = ['start end', 'end start'],
  objectPosition = 'center',
  hoverScale = 1.0,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset
  });

  // Calculate deterministic translation without React re-renders
  const yProgress = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : [`-${strength}%`, `${strength}%`]
  );

  const scaleProgress = useTransform(
    scrollYProgress,
    scaleRange ? [0, 1] : [0, 1],
    scaleRange && !shouldReduceMotion ? scaleRange : [1.0, 1.0]
  );

  // Overscan height padding to prevent clipping empty gaps during parallax travel
  const overscanPercent = strength * 2 + 10;

  return (
    <div
      ref={containerRef}
      className={`pal-parallax-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: `-${overscanPercent / 2}%`,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: `${100 + overscanPercent}%`,
          y: yProgress,
          scale: scaleProgress,
          willChange: 'transform'
        }}
        whileHover={
          hoverScale > 1.0 && !shouldReduceMotion
            ? { scale: hoverScale }
            : undefined
        }
        transition={{
          duration: 0.6,
          ease: EASING.editorialEase
        }}
      >
        {isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              display: 'block'
            }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              display: 'block'
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
