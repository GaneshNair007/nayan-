import React from 'react';
import ParallaxMedia from '../motion/ParallaxMedia';
import SplitRevealText from '../motion/SplitRevealText';

export default function Story({ onEnterCommandCenter }) {
  return (
    <section
      id="our-story"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '120px 80px 120px 80px',
        boxSizing: 'border-box',
        zIndex: 45,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: '60px',
          rowGap: '40px',
          maxWidth: '1440px',
          margin: '0 auto',
          alignItems: 'center'
        }}
      >
        {/* Left Column: Story Editorial Copy (Cols 1-6) */}
        <div
          style={{
            gridColumn: 'span 6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '520px'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '48px'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff'
                }}
              />
              <h2
                className="pal-p3"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  color: '#ffffff'
                }}
              >
                OUR STORY
              </h2>
            </div>

            <SplitRevealText
              as="h3"
              className="pal-p1"
              lines={[
                'CCTV cameras were never the problem.',
                'The missing layer was understanding what happened between frames.'
              ]}
              style={{
                margin: '0 0 32px 0',
                fontSize: '34px',
                fontWeight: 400,
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}
            />

            <p
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'rgba(255, 255, 255, 0.65)',
                margin: 0
              }}
            >
              NAYAN bridges this computational gap. Rather than replacing physical
              infrastructure, our architecture mounts atop existing IP cameras. A
              CUDA-accelerated perception pipeline extracts geometric bounding
              trajectories, verifies multi-signal kinematic invariants, and
              dynamically preempts downstream arterial signals without storing
              biometric identity.
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <a
              href="#command"
              onClick={(e) => {
                e.preventDefault();
                if (onEnterCommandCenter) onEnterCommandCenter();
              }}
              className="pal-nav-item"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <span>SYSTEM ARCHITECTURE →</span>
            </a>
          </div>
        </div>

        {/* Right Column: Strong Editorial Image with Parallax (Cols 7-12) */}
        <div
          style={{
            gridColumn: 'span 6',
            position: 'relative',
            height: '560px',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <ParallaxMedia
            src="/media/editorial/india-busy-intersection-02.webp"
            alt="Bengaluru Smart City Intersection"
            strength={6}
            scaleRange={[1.05, 1.0]}
            objectPosition="50% 50%"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </section>
  );
}
