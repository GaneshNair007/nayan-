import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageTransitionVariants } from './pageTransitions';

/**
 * 21st.dev Full Screen Scroll FX + Scroll Choreography
 * Wraps pages in standard editorial transition sequence.
 */
export default function PageTransition({ children, className = '', style = {} }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ width: '100%', ...style }}
    >
      {children}
    </motion.div>
  );
}
