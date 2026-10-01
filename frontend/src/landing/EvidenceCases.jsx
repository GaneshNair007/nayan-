import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';
import IntroAnimation from '../components/ui/scroll-morph-hero';
import { ShieldCheck, Layers, ChevronRight, ChevronLeft, Sparkles, Activity } from 'lucide-react';

const FORENSIC_CASES = [
  {
    type: 'Collision Verification',
    camId: 'Arterial Junction CAM-04',
    subTitle: 'Kinematic Trajectory & Deceleration Invariant',
    quote:
      '“Confirmation required trajectory conflict, acute deceleration and persistent obstruction across multiple frames.”',
    thumbnail: '/media/nayan/stills/cam04_still_12s.webp',
    reasoning:
      'Single-frame bounding overlaps trigger false alarms during routine braking. NAYAN required a sustained 12-frame deceleration threshold combined with intersecting 2D Kalman trajectory vectors before promoting from CANDIDATE to CONFIRMED.',
    tag: 'VERIFIED CRITICAL'
  },
  {
    type: 'Emergency Yield Corridor',
    camId: 'Indiranagar Main CAM-03',
    subTitle: 'Dynamic Preemption & Clearance Verification',
    quote:
      '“Corridor selection was determined by downstream queue dissipation time and camera-verified vehicle clearance.”',
    thumbnail: '/media/nayan/stills/cam03_still_7s.webp',
    reasoning:
      'Preempting signals blindly causes secondary gridlock. The corridor engine synthesized OSRM topology with real-time queue density, holding green wave duration until CCTV bounding confirmed the emergency vehicle traversed the junction stop-line.',
    tag: 'PREEMPTION ACTIVE'
  },
  {
    type: 'Anomalous Concourse Gathering',
    camId: 'Majestic Concourse CAM-07',
    subTitle: 'Spatial Kinematics & Density Differentials',
    quote:
      '“Gathering velocity vectors converged toward a central bottleneck, triggering early crowd dispersion warnings.”',
    thumbnail: '/media/nayan/stills/cam07_still_10s.webp',
    reasoning:
      'Rather than raw headcounts, the temporal engine evaluated spatial density differentials and opposing velocity vectors, detecting high-pressure compression points 4 minutes before physical bottlenecking occurred.',
    tag: 'DENSITY ANOMALY'
  },
  {
    type: 'Unattended Object Invariant',
    camId: 'Airport Terminal CAM-11',
    subTitle: 'Temporal Attachment & Detachment State Machine',
    quote:
      '“Owner-object association transitioned from bonded to orphaned after 45 continuous stationary seconds without proximity.”',
    thumbnail: '/media/nayan/stills/cam11_still_10s.webp',
    reasoning:
      'The dual-state tracker linked luggage to its carrier trajectory. When the carrier exited the spatial bounding envelope while the luggage remained static, the system initiated an automated security alert with exact coordinates.',
    tag: 'ORPHAN AUDIT'
  }
];

export default function EvidenceCases() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'details'
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
        padding: '88px 0 120px 0',
        boxSizing: 'border-box',
        zIndex: 50,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 10px #38bdf8'
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#38bdf8' }}>
                FORENSIC EVIDENCE REGISTRY
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
            >
              Verified Incident Evidence Matrix
            </h2>
            <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: 'rgba(255, 255, 255, 0.65)' }}>
              Deterministic CCTV trajectory convergence, planar homography, and temporal audit records.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '4px'
            }}
          >
            <button
              onClick={() => setActiveTab('matrix')}
              style={{
                background: activeTab === 'matrix' ? '#ffffff' : 'transparent',
                color: activeTab === 'matrix' ? '#000000' : 'rgba(255, 255, 255, 0.75)',
                border: 'none',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Layers size={13} />
              <span>3D MORPH MATRIX</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              style={{
                background: activeTab === 'details' ? '#ffffff' : 'transparent',
                color: activeTab === 'details' ? '#000000' : 'rgba(255, 255, 255, 0.75)',
                border: 'none',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <ShieldCheck size={13} />
              <span>CASE AUDIT LOGS</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: 3D SCROLL-MORPH-HERO MATRIX */}
        {activeTab === 'matrix' && (
          <div
            style={{
              width: '100%',
              height: '750px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
            }}
          >
            <IntroAnimation />
          </div>
        )}

        {/* VIEW 2: FORENSIC CASE AUDIT CAROUSEL */}
        {activeTab === 'details' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 80px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              backgroundColor: '#0a0d14',
              minHeight: '460px',
              overflow: 'hidden'
            }}
          >
            {/* Left Paginate */}
            <div
              onClick={() => paginate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
            >
              <ChevronLeft size={24} color="#ffffff" />
            </div>

            {/* Case Details */}
            <div style={{ padding: 'clamp(32px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIdx}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)'
                          }}
                        >
                          {currentCase.tag}
                        </span>
                        <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>
                          EVIDENCE RECORD • {currentCase.type}
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.4)' }}>
                        [ 0{activeIdx + 1} / 0{FORENSIC_CASES.length} ]
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 600, color: '#ffffff' }}>
                      {currentCase.camId}
                    </h3>
                    <p style={{ margin: 0, fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.4, color: '#f8fafc', fontStyle: 'italic' }}>
                      {currentCase.quote}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      paddingTop: '24px',
                      marginTop: '32px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        flexShrink: 0
                      }}
                    >
                      <img src={currentCase.thumbnail} alt={currentCase.camId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8' }}>{currentCase.subTitle}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, maxWidth: '720px' }}>
                        {currentCase.reasoning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Paginate */}
            <div
              onClick={() => paginate(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
            >
              <ChevronRight size={24} color="#ffffff" />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
