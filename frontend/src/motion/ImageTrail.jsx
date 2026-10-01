import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * 21st.dev Image Trail (by Daniel Petho)
 * Spawns recent surveillance/incident frames trailing cursor during movement.
 */
export default function ImageTrail({
  images = [
    '/media/nayan/stills/cam04_still_12s.webp',
    '/media/nayan/stills/cam03_still_7s.webp',
    '/media/nayan/stills/cam07_still_10s.webp',
    '/media/nayan/stills/cam11_still_10s.webp'
  ],
  children,
  maxTrail = 5,
  distanceThreshold = 65,
  className = '',
  style = {}
}) {
  const [trail, setTrail] = useState([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const imgIndex = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const handlePointerMove = (e) => {
    if (shouldReduceMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > distanceThreshold) {
      lastPos.current = { x, y };
      const currentSrc = images[imgIndex.current % images.length];
      imgIndex.current += 1;

      const newId = Date.now() + Math.random();
      const newItem = { id: newId, x, y, src: currentSrc };

      setTrail((prev) => [...prev.slice(-maxTrail + 1), newItem]);

      // Remove after 650ms
      setTimeout(() => {
        setTrail((prev) => prev.filter((item) => item.id !== newId));
      }, 650);
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      className={className}
    >
      {children}

      {/* Floating Trail Frames */}
      <AnimatePresence>
        {!shouldReduceMotion && trail.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0.9, scale: 0.85, x: item.x - 70, y: item.y - 45 }}
            animate={{ opacity: 0.7, scale: 1, x: item.x - 70, y: item.y - 45 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '140px',
              height: '90px',
              borderRadius: '2px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 30,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)'
            }}
          >
            <img
              src={item.src}
              alt="surveillance trail"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
