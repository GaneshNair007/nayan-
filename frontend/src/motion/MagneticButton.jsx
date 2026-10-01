import React, { useRef } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';

/**
 * 21st.dev Magnetic Button
 * Gently pulls towards the pointer during proximity hover with spring physics.
 */
export default function MagneticButton({
  children,
  onClick,
  strength = 0.35,
  className = '',
  style = {}
}) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...style
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
