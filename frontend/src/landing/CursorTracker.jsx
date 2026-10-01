import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { SPRINGS } from '../motion/springs';

/**
 * Minimal blend-difference dot cursor matching Palomino pointer telemetry.
 * Uses MotionValues and spring inertia without React re-render cycles.
 */
export default function CursorTracker() {
  const shouldReduceMotion = useReducedMotion();
  const [hasPointer, setHasPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, SPRINGS.cursorSpring);
  const springY = useSpring(mouseY, SPRINGS.cursorSpring);

  useEffect(() => {
    // Only activate on devices with fine pointer
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    setHasPointer(true);

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (shouldReduceMotion || !hasPointer) {
    return null;
  }

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        pointerEvents: 'none',
        mixBlendMode: 'difference',
        zIndex: 99999,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform'
      }}
    />
  );
}
