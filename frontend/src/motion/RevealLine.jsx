import React from 'react';
import { motion } from 'motion/react';
import { editorialEase } from './easing';

export default function RevealLine({ children, delay = 0, className = '', style = {} }) {
  return (
    <div style={{ overflow: 'hidden', display: 'block', ...style }} className={className}>
      <motion.div
        initial={{ y: '105%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-5% 0px' }}
        transition={{
          duration: 0.85,
          delay,
          ease: editorialEase
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
