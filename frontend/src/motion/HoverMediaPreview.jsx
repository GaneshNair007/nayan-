import React, { useEffect, useRef } from 'react';

/**
 * Floating cursor-following media capsule matching Palomino's pointer interaction.
 * Uses RequestAnimationFrame (RAF) interpolation for 60fps tracking without
 * causing React re-renders on mousemove.
 */
export default function HoverMediaPreview({ activeItem }) {
  const containerRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const tick = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;

      if (el) {
        const width = 280;
        const height = 180;
        const clampX = Math.min(Math.max(currentPos.current.x + 24, 10), window.innerWidth - width - 24);
        const clampY = Math.min(Math.max(currentPos.current.y - 60, 10), window.innerHeight - height - 24);
        el.style.transform = `translate3d(${clampX}px, ${clampY}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(tick);
    };

    animFrameId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  if (!activeItem) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '175px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: activeItem ? 1 : 0,
        transform: 'translate3d(-999px, -999px, 0)',
        transition: 'opacity 0.22s var(--ease-editorial)',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(244, 243, 238, 0.15)',
        backgroundColor: '#0a0a0c'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {activeItem.videoUrl ? (
          <video
            src={activeItem.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={activeItem.stillUrl || activeItem.imageUrl}
            alt={activeItem.title || 'Preview'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '6px 10px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'rgba(244, 243, 238, 0.9)',
            letterSpacing: '0.04em'
          }}
        >
          <span>{activeItem.label || activeItem.camId || activeItem.id}</span>
          <span style={{ color: 'rgba(244, 243, 238, 0.5)' }}>{activeItem.status || 'LIVE'}</span>
        </div>
      </div>
    </div>
  );
}
