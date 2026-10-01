import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';

const FORENSIC_CASES = [
  {
    type: 'Collision Verification',
    camId: 'Arterial Junction CAM-04',
    subTitle: 'Kinematic Trajectory & Deceleration Invariant',
    quote:
      '“Confirmation required trajectory conflict, acute deceleration and persistent obstruction across multiple frames.”',
    thumbnail: '/media/nayan/stills/cam04_still_12s.webp',
    reasoning:
      'Single-frame bounding overlaps trigger false alarms during routine braking. NAYAN required a sustained 12-frame deceleration threshold combined with intersecting 2D Kalman trajectory vectors before promoting from CANDIDATE to CONFIRMED.'
  },
  {
    type: 'Emergency Yield Corridor',
    camId: 'Indiranagar Main CAM-03',
    subTitle: 'Dynamic Preemption & Clearance Verification',
    quote:
      '“Corridor selection was determined by downstream queue dissipation time and camera-verified vehicle clearance.”',
    thumbnail: '/media/nayan/stills/cam03_still_7s.webp',
    reasoning:
      'Preempting signals blindly causes secondary gridlock. The corridor engine synthesized OSRM topology with real-time queue density, holding green wave duration until CCTV bounding confirmed the emergency vehicle traversed the junction stop-line.'
  },
  {
    type: 'Anomalous Concourse Gathering',
    camId: 'Majestic Concourse CAM-07',
    subTitle: 'Spatial Kinematics & Density Differentials',
    quote:
      '“Gathering velocity vectors converged toward a central bottleneck, triggering early crowd dispersion warnings.”',
    thumbnail: '/media/nayan/stills/cam07_still_10s.webp',
    reasoning:
      'Rather than raw headcounts, the temporal engine evaluated spatial density differentials and opposing velocity vectors, detecting high-pressure compression points 4 minutes before physical bottlenecking occurred.'
  },
  {
    type: 'Unattended Object Invariant',
    camId: 'Airport Terminal CAM-11',
    subTitle: 'Temporal Attachment & Detachment State Machine',
    quote:
      '“Owner-object association transitioned from bonded to orphaned after 45 continuous stationary seconds without proximity.”',
    thumbnail: '/media/nayan/stills/cam11_still_10s.webp',
    reasoning:
      'The dual-state tracker linked luggage to its carrier trajectory. When the carrier exited the spatial bounding envelope while the luggage remained static, the system initiated an automated security alert with exact coordinates.'
  }
];

export default function EvidenceCases() {
  const [[activeIdx, direction], setPage] = useState([0, 0]);
  const shouldReduceMotion = useReducedMotion();
  const currentCase = FORENSIC_CASES[activeIdx];

  const paginate = (newDirection) => {
    let nextIdx = activeIdx + newDirection;
    if (nextIdx < 0) nextIdx = FORENSIC_CASES.length - 1;
    if (nextIdx >= FORENSIC_CASES.length) nextIdx = 0;
    setPage([nextIdx, newDirection]);
  };

  const slideVariants = {
    enter: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 40 : -40,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: EASING.mediaEase
      }
    },
    exit: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -40 : 40,
      opacity: 0,
      transition: {
        duration: 0.45,
        ease: EASING.mediaEase
      }
    })
  };

  return (
    <section
      id="forensic-evidence"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '72px 0 100px 0',
        boxSizing: 'border-box',
        zIndex: 50,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Centered Section Label matching Palomino */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
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
          TESTIMONIALS
        </h2>
      </div>

      {/* 3-Zone Layout with Vertical Dividing Lines matching Palomino */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 120px',
          maxWidth: '1440px',
          margin: '0 auto',
          minHeight: '460px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Left Arrow Zone */}
        <div
          onClick={() => paginate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            userSelect: 'none',
            zIndex: 10
          }}
        >
          <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.6)' }}>
            ←
          </span>
        </div>

        {/* Center Content Zone with Direction-Aware AnimatePresence */}
        <div
          style={{
            padding: '64px 80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '360px'
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Top Row: Case Category and Index */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '32px'
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--pal-font)',
                      fontSize: '12px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.45)',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    EVIDENCE RECORD • {currentCase.type}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--pal-font)',
                      fontSize: '18px',
                      fontWeight: 500,
                      color: '#ffffff'
                    }}
                  >
                    {currentCase.camId}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--pal-mono)',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.35)',
                    letterSpacing: '0.08em'
                  }}
                >
                  [ 0{activeIdx + 1} / 0{FORENSIC_CASES.length} ]
                </span>
              </div>

              {/* Center: Large Quote Text matching Palomino */}
              <p
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: 'clamp(22px, 2.5vw, 32px)',
                  fontWeight: 400,
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  margin: '0 0 32px 0'
                }}
              >
                {currentCase.quote}
              </p>

              {/* Bottom: Reasoning and Thumbnail Avatar matching Palomino */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <img
                    src={currentCase.thumbnail}
                    alt={currentCase.camId}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--pal-font)',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#ffffff',
                      display: 'block'
                    }}
                  >
                    {currentCase.subTitle}
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--pal-font)',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.55)',
                      lineHeight: '20px',
                      margin: '4px 0 0 0',
                      maxWidth: '720px'
                    }}
                  >
                    {currentCase.reasoning}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow Zone */}
        <div
          onClick={() => paginate(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            userSelect: 'none',
            zIndex: 10
          }}
        >
          <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.6)' }}>
            →
          </span>
        </div>
      </div>
    </section>
  );
}
