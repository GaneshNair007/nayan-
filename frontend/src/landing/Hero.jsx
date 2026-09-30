import React from 'react';

export default function Hero({ videoSrc = '/api/videos/file/cam04_collision.mp4' }) {
  return (
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
      {/* Background Pure Video (Zero scanlines, zero neon, zero fake HUD) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0
      }}>
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
            filter: 'brightness(0.55) contrast(1.05)'
          }}
        />
        {/* Subtle top/bottom gradient overlay for typography readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)'
        }} />
      </div>

      {/* Top Spacer */}
      <div style={{ position: 'relative', zIndex: 10 }} />

      {/* Center: Massive Palomino H1 (SPORTS / INTO / STORIES -> CAMERAS / INTO / INTELLIGENCE) */}
      <div style={{ position: 'relative', zIndex: 10, margin: 'auto 0' }}>
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
      </div>

      {/* Bottom Row: Support Copy Lower-Left, Scroll Indicator Lower-Right */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%'
      }}>
        {/* Support copy (~400px width, 16px, 3 lines matching Palomino) */}
        <div style={{
          maxWidth: '420px',
          fontFamily: 'var(--pal-font)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: 'rgba(255, 255, 255, 0.85)'
        }}>
          Autonomous incident verification and dynamic emergency yield corridors.
          Real CUDA transfer learning (0.988 mAP50) • Calibrated planar geometry.
          Bengaluru urban mobility intelligence.
        </div>

        {/* Scroll indicator */}
        <div style={{
          fontFamily: 'var(--pal-font)',
          fontSize: '14px',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          SCROLL ↓
        </div>
      </div>
    </section>
  );
}
