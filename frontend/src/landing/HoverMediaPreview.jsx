import React, { useEffect, useRef } from 'react';

/**
 * Floating cursor-following media capsule matching Palomino's pointer interaction.
 * Uses RequestAnimationFrame (RAF) interpolation for silky 60fps tracking without
 * causing React re-renders on mousemove.
 */
export default function HoverMediaPreview({ activeProject }) {
  const containerRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isVisible = useRef(false);
  const animFrameId = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 60FPS RAF interpolation loop
    const tick = () => {
      // Linear interpolation (lerp factor: 0.12)
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;

      if (el) {
        // Offset slightly to lower-right of pointer and clamp within viewport
        const width = 280;
        const height = 180;
        const clampX = Math.min(Math.max(currentPos.current.x + 20, 10), window.innerWidth - width - 20);
        const clampY = Math.min(Math.max(currentPos.current.y - 60, 10), window.innerHeight - height - 20);

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

  useEffect(() => {
    if (activeProject) {
      isVisible.current = true;
    } else {
      isVisible.current = false;
    }
  }, [activeProject]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '175px',
        borderRadius: '2px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: activeProject ? 1 : 0,
        transform: 'translate3d(-999px, -999px, 0)',
        transition: 'opacity 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.05s linear',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        backgroundColor: '#0a0a0c'
      }}
    >
      {activeProject && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {activeProject.videoUrl ? (
            <video
              src={activeProject.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <img
              src={activeProject.stillUrl}
              alt={activeProject.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}

          {/* Minimal forensic metadata watermark */}
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
              fontFamily: 'var(--pal-mono)',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '0.04em'
            }}
          >
            <span>{activeProject.camId}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{activeProject.fps} FPS</span>
          </div>
        </div>
      )}
    </div>
  );
}
