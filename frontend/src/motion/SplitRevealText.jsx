import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASING } from './easing';

/**
 * Editorial line-by-line reveal component.
 * Splits text into lines wrapped in overflow:hidden containers,
 * lifting the typography upwards with measured deceleration.
 * 
 * @param {string|string[]} lines - Array of text lines or single string
 * @param {number} delay - Initial trigger delay in seconds
 * @param {number} stagger - Stagger delay between lines (default: 0.08s)
 * @param {string} as - HTML tag wrapper (e.g. 'h2', 'p', 'div')
 */
export default function SplitRevealText({
  lines,
  delay = 0,
  stagger = 0.08,
  as: Component = 'div',
  className = '',
  style = {}
}) {
  const shouldReduceMotion = useReducedMotion();
  const lineArray = Array.isArray(lines) ? lines : [lines];

  if (shouldReduceMotion) {
    return (
      <Component className={className} style={style}>
        {lineArray.map((line, idx) => (
          <span key={idx} style={{ display: 'block' }}>
            {line}
          </span>
        ))}
      </Component>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  const lineVariants = {
    hidden: {
      y: '105%',
      opacity: 0
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: EASING.editorialEase
      }
    }
  };

  return (
    <Component className={className} style={style}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8% 0px' }}
        variants={containerVariants}
        style={{ display: 'block' }}
      >
        {lineArray.map((line, idx) => (
          <span
            key={idx}
            style={{
              display: 'block',
              overflow: 'hidden',
              paddingBottom: '2px'
            }}
          >
            <motion.span
              variants={lineVariants}
              style={{
                display: 'block',
                willChange: 'transform'
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
