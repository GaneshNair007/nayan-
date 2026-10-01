import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

export default function Hero({ videoSrc = '/api/videos/file/cam04_collision.mp4' }) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

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
          padding: '120px 20px 40px 20px',
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
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 45%',
                filter: 'brightness(0.55) contrast(1.05)'
              }}
            />
          </motion.div>
          {/* Subtle top/bottom gradient overlay for typography readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)',
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

        {/* Bottom Row: Support Copy Lower-Left, Scroll Indicator Lower-Right */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            opacity: textOpacity
          }}
        >
          {/* Support copy (~420px width, 16px, 3 lines matching Palomino) */}
          <div
            style={{
              maxWidth: '420px',
              fontFamily: 'var(--pal-font)',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              color: 'rgba(255, 255, 255, 0.85)'
            }}
          >
            Autonomous incident verification and dynamic emergency yield corridors.
            Real CUDA transfer learning (0.988 mAP50) • Calibrated planar geometry.
            Bengaluru urban mobility intelligence.
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            SCROLL ↓
          </div>
        </motion.div>
      </section>
    </div>
  );
}
