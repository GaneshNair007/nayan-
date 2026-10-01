import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

const HERO_FEEDS = [
  { id: 'highway', label: 'METRO FLYOVER', src: '/media/hero/urban_highway_night.mp4' },
  { id: 'roundabout', label: 'PLANAR ROUNDABOUT', src: '/media/hero/planar_roundabout_night.mp4' },
  { id: 'aerial', label: 'AERIAL CORRIDOR', src: '/media/hero/aerial_interchange_night.mp4' },
];

export default function Hero({ videoSrc = '/media/hero/urban_highway_night.mp4' }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeSrc, setActiveSrc] = useState(videoSrc);

  // Scroll linkage matching Palomino empirical telemetry
  // Linked over the pinned container scroll duration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Measured contraction from 1.60x down to 1.00x with heavy visual inertia
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.75],
    shouldReduceMotion ? [1.0, 1.0] : [1.60, 1.00]
  );

  const imageY = useTransform(
    scrollYProgress,
    [0, 0.75],
    shouldReduceMotion ? ['0%', '0%'] : ['0%', '6%']
  );

  const textY = useTransform(
    scrollYProgress,
    [0, 0.65],
    shouldReduceMotion ? ['0px', '0px'] : ['0px', '-180px']
  );

  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 0.7],
    [1.0, 0.85, 0.0]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '160vh',
        backgroundColor: '#000000',
        zIndex: 10
      }}
    >
      <section
        id="hero"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 24px 40px 24px',
          boxSizing: 'border-box',
          backgroundColor: '#000000'
        }}
      >
        {/* Background Media with Oversized 1.6x Scale Contraction */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: '-10%',
              width: '120%',
              height: '120%',
              scale: imageScale,
              y: imageY,
              willChange: 'transform'
            }}
          >
            <video
              key={activeSrc}
              src={activeSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 45%',
                filter: 'brightness(0.62) contrast(1.10)'
              }}
            />
          </motion.div>
          {/* Subtle top/bottom gradient overlay for typography readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.82) 100%)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Top Spacer */}
        <div style={{ position: 'relative', zIndex: 10 }} />

        {/* Center: Massive Palomino H1 (CAMERAS / INTO / INTELLIGENCE) */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
            margin: 'auto 0',
            y: textY,
            opacity: textOpacity,
            willChange: 'transform, opacity'
          }}
        >
          <h1
            className="pal-h1"
            style={{
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0
            }}
          >
            <span style={{ display: 'block', textAlign: 'left' }}>CAMERAS</span>
            <span style={{ display: 'block', textAlign: 'center' }}>INTO</span>
            <span style={{ display: 'block', textAlign: 'right' }}>INTELLIGENCE</span>
          </h1>
        </motion.div>

        {/* Bottom Row: Support Copy Lower-Left, Feed Switcher Center, Scroll Indicator Lower-Right */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            opacity: textOpacity,
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {/* Support copy (~420px width, 16px, 3 lines matching Palomino) */}
          <div
            style={{
              maxWidth: '420px',
              fontFamily: 'var(--pal-font)',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '23px',
              color: 'rgba(255, 255, 255, 0.88)',
              textShadow: '0 2px 10px rgba(0,0,0,0.7)'
            }}
          >
            Autonomous incident verification and dynamic emergency yield corridors.
            Real CUDA transfer learning (0.988 mAP50) • Calibrated planar geometry.
            Bengaluru urban mobility intelligence.
          </div>

          {/* Interactive Live Hero Video Feed Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(10, 15, 25, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              padding: '4px 6px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 10px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.6)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              FEED
            </div>
            {HERO_FEEDS.map((feed) => {
              const isActive = activeSrc === feed.src;
              return (
                <button
                  key={feed.id}
                  onClick={() => setActiveSrc(feed.src)}
                  style={{
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#050b14' : 'rgba(255, 255, 255, 0.75)',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {feed.label}
                </button>
              );
            })}
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)'
            }}
          >
            SCROLL ↓
          </div>
        </motion.div>
      </section>
    </div>
  );
}
