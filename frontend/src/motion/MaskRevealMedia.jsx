import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASING } from './easing';

/**
 * Geometric clip-path mask reveal component.
 * Uses inset() clipping to reveal imagery without relying on generic opacity fades.
 * 
 * @param {string} mode - 'vertical' (bottom to top wipe) or 'scale' (subtle scale in)
 * @param {number} duration - Animation duration in seconds (default: 0.8)
 * @param {number} delay - Animation delay in seconds (default: 0)
 */
export default function MaskRevealMedia({
  children,
  mode = 'vertical',
  duration = 0.8,
  delay = 0,
  className = '',
  style = {}
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={{ width: '100%', height: '100%', ...style }}>
        {children}
      </div>
    );
  }

  const variants = {
    hidden: {
      clipPath: mode === 'vertical' ? 'inset(100% 0 0 0)' : 'inset(0 0 0 0)',
      scale: mode === 'scale' ? 1.08 : 1.0,
      opacity: mode === 'vertical' ? 1 : 0.8
    },
    visible: {
      clipPath: 'inset(0% 0 0 0)',
      scale: 1.0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: EASING.revealEase
      }
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={variants}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}
