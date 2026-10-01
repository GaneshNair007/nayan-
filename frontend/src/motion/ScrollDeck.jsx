import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { editorialEase } from './easing';
import { ArrowUpRight, ShieldCheck, Activity, Cpu, Layers } from 'lucide-react';

const DECK_PANELS = [
  {
    index: '01',
    phase: 'DETECT',
    title: 'CONTINUOUS MONOCULAR SENSOR HARVEST',
    tagline: 'Zero specialized hardware. Edge monocular feeds decoded on NVIDIA RTX 4050.',
    mediaType: 'video',
    mediaSrc: '/api/videos/file/cam01_normal_intersection.mp4',
    fallbackStill: '/media/nayan/stills/cam04_still_12s.webp',
    details: [
      { label: 'THROUGHPUT', value: '45.8 FPS' },
      { label: 'PRECISION (mAP50)', value: '98.2%' },
      { label: 'DEVICE', value: 'CUDA:0 (FP16)' },
      { label: 'TRACKER', value: 'ByteTrack Multi-Class' }
    ],
    narrative: 'High-speed object acquisition isolates Indian mixed-traffic entities (ambulances, auto-rickshaws, two-wheelers, buses) within 21.8 milliseconds per frame with zero reliance on cloud streaming.'
  },
  {
    index: '02',
    phase: 'VERIFY',
    title: 'TEMPORAL KINEMATIC INVARIANT MACHINE',
    tagline: 'Rejecting single-frame false alarms through cumulative multi-signal physical evidence.',
    mediaType: 'video',
    mediaSrc: '/api/videos/file/cam04_collision.mp4',
    fallbackStill: '/media/nayan/stills/cam04_still_12s.webp',
    details: [
      { label: 'DECELERATION INVARIANT', value: '6.2 px/fr²' },
      { label: 'EVIDENCE STAGES', value: '4 Stages' },
      { label: 'STATE MACHINE', value: 'Deterministic' },
      { label: 'VERIFICATION', value: 'P1 Confirmed' }
    ],
    narrative: 'Trajectory convergence, sudden deceleration anomalies, and persistent spatial overlap must be proven across sequential frames before transitioning an incident from SUSPECTED to CONFIRMED.'
  },
  {
    index: '03',
    phase: 'RESPOND',
    title: 'AUTONOMOUS EMERGENCY GREEN WAVE',
    tagline: 'Dynamic arterial preemption clears high-speed transit corridors ahead of ambulances.',
    mediaType: 'video',
    mediaSrc: '/api/videos/file/cam03_ambulance.mp4',
    fallbackStill: '/media/nayan/stills/cam03_still_7s.webp',
    details: [
      { label: 'DOWNSTREAM CLEARANCE', value: '140 METERS' },
      { label: 'PREEMPTION SPEED', value: '52.0 km/h' },
      { label: 'INTERLOCK', value: 'Zero Conflict' },
      { label: 'TRANSIT GAIN', value: '-42% DELAY' }
    ],
    narrative: 'When Class 0 (Ambulance) is classified on approach, NAYAN locks out cross-traffic conflicting phases and extends arterial green waves, providing safe, uninterrupted passage across multi-junction grids.'
  },
  {
    index: '04',
    phase: 'SIMULATE',
    title: 'HIGH-FIDELITY DIGITAL TWIN COGNITION',
    tagline: 'Predictive urban arterial modeling comparing fixed-time signal cycles against adaptive AI waves.',
    mediaType: 'video',
    mediaSrc: '/api/videos/file/cam02_congestion.mp4',
    fallbackStill: '/media/nayan/stills/cam07_still_10s.webp',
    details: [
      { label: 'QUEUE REDUCTION', value: '-38.4%' },
      { label: 'NETWORK DELAY', value: '-42.1%' },
      { label: 'JUNCTIONS MONITORED', value: '3 Active' },
      { label: 'MODEL CYCLE', value: 'Adaptive 75s' }
    ],
    narrative: 'Every signal change and corridor plan is counterfactually validated in real time against baseline fixed-time timing, proving quantitative delay reduction and zero dead-time spillback.'
  }
];

function DeckCard({ panel, index, total, scrollProgress, onEnterCommandCenter }) {
  const shouldReduceMotion = useReducedMotion();

  // Each card has an active range in the overall 400vh container
  // Index 0: enters at 0, stays pinned
  // Index 1: rises from [0.20, 0.45]
  // Index 2: rises from [0.45, 0.70]
  // Index 3: rises from [0.70, 0.95]
  const startRise = (index - 0.2) / total;
  const endRise = index / total;

  // Scale of card when newer cards cover it: 1 -> 0.95 -> 0.90
  const scale = useTransform(
    scrollProgress,
    [endRise, endRise + 0.25],
    [1, 0.95]
  );

  // Slight upward recession: 0 -> -2vh
  const translateYRecession = useTransform(
    scrollProgress,
    [endRise, endRise + 0.25],
    ['0vh', '-2vh']
  );

  // Dimming brightness: 1 -> 0.75
  const brightness = useTransform(
    scrollProgress,
    [endRise, endRise + 0.25],
    [1, 0.75]
  );

  // Entry translateY for rising card: 100% -> 0%
  const translateYRise = useTransform(
    scrollProgress,
    [Math.max(0, startRise), endRise],
    [index === 0 ? '0%' : '100%', '0%']
  );

  // Parallax on inner media
  const mediaY = useTransform(
    scrollProgress,
    [startRise, endRise],
    ['-8%', '0%']
  );

  return (
    <motion.div
      style={{
        position: 'sticky',
        top: `${80 + index * 12}px`, // Stacked top deck edges visible
        height: 'calc(100vh - 120px)',
        minHeight: '620px',
        maxHeight: '850px',
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        backgroundColor: '#0a0a0c',
        border: '1px solid var(--border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
        zIndex: index + 1,
        y: index === 0 ? translateYRecession : translateYRise,
        scale: index === total - 1 ? 1 : scale,
        filter: shouldReduceMotion ? 'none' : `brightness(${brightness.get() || 1})`,
        boxShadow: index > 0 ? '0 -16px 40px rgba(0, 0, 0, 0.8)' : 'none'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 38%) 1fr',
          height: '100%',
          width: '100%'
        }}
        className="deck-card-grid"
      >
        {/* Left Column: Editorial Information & Telemetry */}
        <div
          style={{
            padding: 'clamp(24px, 4vw, 56px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            zIndex: 2
          }}
        >
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)'
                }}
              >
                STAGE {panel.index} / 04
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '2px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)'
                }}
              >
                {panel.phase}
              </span>
            </div>

            <h3
              style={{
                fontSize: 'clamp(24px, 3vw, 42px)',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: '0 0 16px 0',
                color: 'var(--text-primary)'
              }}
            >
              {panel.title}
            </h3>

            <p
              style={{
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0
              }}
            >
              {panel.tagline}
            </p>
          </div>

          {/* Details / Specs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '24px'
            }}
          >
            {panel.details.map((d, i) => (
              <div key={i}>
                <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                  {d.label}
                </span>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '15px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                >
                  {d.value}
                </p>
              </div>
            ))}
          </div>

          {/* Narrative Paragraph & CTA */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', marginTop: '20px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              {panel.narrative}
            </p>
            <button
              onClick={onEnterCommandCenter}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              <span>INSPECT PIPELINE STAGE</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Right Column: 62% Full Dominant Photographic / Video Media */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}
        >
          <motion.div
            style={{
              width: '100%',
              height: '116%',
              position: 'relative',
              y: shouldReduceMotion ? 0 : mediaY
            }}
          >
            <video
              src={panel.mediaSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Subtle Gradient Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(10, 10, 12, 0.4) 0%, transparent 20%, transparent 80%, rgba(10, 10, 12, 0.6) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Stage Identification Tag */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>LIVE PIPELINE · {panel.phase}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 21st.dev Sticky Scroll Cards Section / Animated Cards Stack
 * Outer 400vh scroll container coordinating 4 physical stacking panels:
 * 01 DETECT -> 02 VERIFY -> 03 RESPOND -> 04 SIMULATE
 */
export default function ScrollDeck({ onEnterCommandCenter }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        height: '420vh', // 400vh+ for deliberate, measured scroll pacing
        backgroundColor: 'var(--bg-primary)',
        paddingTop: '64px',
        paddingBottom: '120px'
      }}
    >
      {/* Editorial Section Header */}
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto 48px auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid var(--border-strong)',
          paddingBottom: '24px'
        }}
      >
        <div>
          <span className="text-micro" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            AUTONOMOUS ARCHITECTURE · 01 TO 04
          </span>
          <h2
            className="text-display-lg"
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 600,
              letterSpacing: '-0.03em'
            }}
          >
            DETECT → VERIFY → RESPOND → SIMULATE
          </h2>
        </div>
        <span className="text-micro" style={{ color: 'var(--text-secondary)' }}>
          SCROLL TO ADVANCE SYSTEM PHASES ↓
        </span>
      </div>

      {/* Stacked Panels */}
      <div style={{ position: 'relative', width: '100%', padding: '0 24px' }}>
        {DECK_PANELS.map((panel, idx) => (
          <DeckCard
            key={panel.index}
            panel={panel}
            index={idx}
            total={DECK_PANELS.length}
            scrollProgress={scrollYProgress}
            onEnterCommandCenter={onEnterCommandCenter}
          />
        ))}
      </div>
    </section>
  );
}
