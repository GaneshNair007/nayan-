import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform, useReducedMotion } from 'motion/react';

/**
 * 21st.dev Animated Number / Sliding Counter
 * Counts smoothly from 0 to value when entered into viewport.
 * Triggers once to avoid distracting resets.
 */
export default function AnimatedMetric({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
  className = '',
  style = {}
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  // Extract numeric part from string if needed
  const numericTarget = typeof value === 'number' 
    ? value 
    : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

  const springValue = useSpring(0, {
    stiffness: 70,
    damping: 24,
    mass: 0.8
  });

  const [displayValue, setDisplayValue] = useState(
    shouldReduceMotion ? numericTarget.toFixed(decimals) : '0'
  );

  useEffect(() => {
    if (isInView && !shouldReduceMotion) {
      springValue.set(numericTarget);
    } else if (shouldReduceMotion) {
      setDisplayValue(numericTarget.toFixed(decimals));
    }
  }, [isInView, numericTarget, springValue, shouldReduceMotion, decimals]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest.toFixed(decimals));
    });

    return () => unsubscribe();
  }, [springValue, decimals, shouldReduceMotion]);

  return (
    <span
      ref={ref}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        ...style
      }}
      className={className}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
