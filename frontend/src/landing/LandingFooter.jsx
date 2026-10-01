import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';

export default function LandingFooter({ onEnterCommandCenter, backendMetrics = {} }) {
  const ctaRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll linkage for CTA upward curtain pull
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ['start start', 'end start']
  });

  const ctaScale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1.0, 0.96]
  );

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000000' }}>
      {/* ============================================================
          CLOSING STATEMENT (Section 09)
          Exact match to Palomino's "LET'S MAKE SOMETHING ICONIC."
          Centered 3-line massive display typography on sticky black section
          ============================================================ */}
      <section
        ref={ctaRef}
        id="command-cta"
        onClick={onEnterCommandCenter}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          boxSizing: 'border-box',
          zIndex: 20,
          cursor: 'pointer',
          userSelect: 'none',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.9)'
        }}
      >
        <motion.div
          style={{
            textAlign: 'center',
            width: '100%',
            scale: ctaScale,
            willChange: 'transform'
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: 'clamp(54px, 11vw, 168px)',
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span>ENTER THE</span>
            <span>LIVE COMMAND</span>
            <span>CENTER.</span>
          </h2>

          <div style={{ marginTop: '36px' }}>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              LAUNCH INTERFACE →
            </span>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          WHITE STICKY FOOTER (Section 10)
          Matches Palomino's sticky bottom white footer (z-index 10)
          revealed as the preceding black CTA (z-index 20) scrolls up.
          ============================================================ */}
      <footer
        id="landing-footer"
        className="pal-white-footer"
        style={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 40px 24px 40px',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        {/* Brand glyph on far left above columns matching Palomino */}
        <div
          style={{
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto 40px auto'
          }}
        >
          <svg
            width="28"
            height="32"
            viewBox="0 0 22 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 24V1L11 13.5V1H21V24L11 11.5V24H1Z" fill="#000000" />
          </svg>
        </div>

        {/* 5 Technical / Editorial Columns matching Palomino */}
        <div
          style={{
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '32px',
            flexGrow: 1
          }}
        >
          {/* Col 1 */}
          <div>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
                color: '#000000'
              }}
            >
              01 PLATFORM
            </span>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {[
                'Real-Time Object Detection',
                'ByteTrack Kinematics',
                'Signal Preemption Corridor',
                'Digital Twin Simulation',
                'Forensic Incident Audit'
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '20px'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
                color: '#000000'
              }}
            >
              02 ML ARCHITECTURE
            </span>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {[
                'YOLOv8 Custom 8-Class',
                '40-Epoch CUDA Transfer',
                'TensorRT / FP16 Inference',
                'Planar Homography Calibration',
                `${backendMetrics.mAP50 ? (backendMetrics.mAP50 * 100).toFixed(1) : '98.8'}% mAP50 Benchmark`
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '20px'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
                color: '#000000'
              }}
            >
              03 VERIFIED NODES
            </span>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {[
                'CAM-01 Silk Board',
                'CAM-02 Electronic City',
                'CAM-03 Indiranagar 100ft',
                'CAM-04 MG Road Trinity',
                'CAM-07 Majestic Concourse',
                'CAM-11 Airport Terminal'
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '20px'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
                color: '#000000'
              }}
            >
              04 GOVERNANCE
            </span>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {[
                'Zero Facial Recognition',
                'Ephemeral Video Buffering',
                'Cryptographic Audit Trail',
                'Municipal API Contracts',
                'Open Source Foundation'
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '20px'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 */}
          <div>
            <span
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '16px',
                color: '#000000'
              }}
            >
              05 DISPATCH
            </span>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {[
                'Live Emergency Response',
                'Bengaluru Traffic Police',
                'Automated Yield Routing',
                'Incident State Machines',
                '100% Provenance Logs'
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '20px'
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Giant Wordmark matching Palomino */}
        <div style={{ width: '100%', overflow: 'hidden', marginTop: '48px' }}>
          <div
            className="pal-giant-wordmark"
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: 'clamp(60px, 19vw, 290px)',
              fontWeight: 700,
              lineHeight: 0.8,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              color: '#000000',
              width: '100%',
              textAlign: 'center',
              userSelect: 'none'
            }}
          >
            NAYAN
          </div>
        </div>
      </footer>
    </div>
  );
}
