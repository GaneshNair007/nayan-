import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';
import AnimatedMetric from '../../motion/AnimatedMetric';

const CORRIDOR_STAGES = [
  {
    num: '01',
    title: 'AMBULANCE DETECTED',
    category: 'OPTICAL INFERENCE',
    description: 'Trained YOLOv8 identifies emergency vehicle on CAM-03 (0.98 precision, 48 km/h approach vector). Bounding box homography computes real-world ground coordinate (X: 12.4m, Y: 45.2m).',
    activeCells: [54, 55, 70, 71],
    ambulancePos: 0.08,
    statusText: 'DETECTION CONFIRMED · TARGET VELOCITY 48 KM/H'
  },
  {
    num: '02',
    title: 'ROAD SPACE ANALYSED',
    category: 'PLANAR HOMOGRAPHY',
    description: 'Monocular planar homography calibrates roadway boundary. Road width 14.0m evaluated for physical vehicle footprints without assuming adherence to painted lane markings.',
    activeCells: [34, 35, 36, 50, 51, 52, 66, 67, 68],
    ambulancePos: 0.18,
    statusText: 'HOMOGRAPHY MATRIX SOLVED · 14.0M SPAN AVAILABLE'
  },
  {
    num: '03',
    title: 'DYNAMIC GRID SLICING',
    category: 'DISCRETIZATION',
    description: 'Roadway partitioned into 0.5m discrete cells. Lateral spatial density computed along longitudinal slices. Obstacle clusters identified in lanes 1 and 2.',
    activeCells: [20, 21, 22, 23, 24, 25, 36, 37, 38, 39],
    ambulancePos: 0.28,
    statusText: 'DISCRETE 0.5M GRID ACTIVE · 128 CELLS EVALUATED'
  },
  {
    num: '04',
    title: 'LANE ELASTICITY COMPUTED',
    category: 'LATERAL COMPRESSIBILITY',
    description: 'Lateral yield potential modeled across adjacent vehicle queues. Shoulder clearance allows 1.8m vehicle displacement into left/right margins, creating an emergent free corridor.',
    activeCells: [18, 19, 34, 35, 50, 51, 66, 67, 82, 83],
    ambulancePos: 0.40,
    statusText: 'ELASTICITY COEFFICIENT 0.82 · SHOULDER CLEARANCE CONFIRMED'
  },
  {
    num: '05',
    title: 'LATERAL COMPRESSION',
    category: 'MICRO-CLEARANCE',
    description: 'Vehicle clusters yield toward curb margins. Central road axis clears from 1.2m residual spacing to 3.8m continuous open pavement.',
    activeCells: [38, 39, 54, 55, 70, 71, 86, 87],
    ambulancePos: 0.52,
    statusText: 'CENTRAL 3.8M CORRIDOR OPENING · VEHICLES DISPLACED'
  },
  {
    num: '06',
    title: 'JUNCTION PRE-CLEAR',
    category: 'SIGNAL ACTUATION',
    description: 'Preemption directive transmitted to JNC-02 signal controller. Eastbound green extended 35s to purge residual queue ahead of the emergency approach envelope.',
    activeCells: [42, 43, 58, 59, 74, 75],
    ambulancePos: 0.65,
    statusText: 'JNC-02 GREEN EXTENDED · DOWNSTREAM QUEUE PURGING'
  },
  {
    num: '07',
    title: 'CORRIDOR READY',
    category: 'DETERMINISTIC WAVE',
    description: 'Segment clearance width 7.5m safely exceeds 3.5m emergency vehicle clearance threshold. Uninterrupted green wave corridor established.',
    activeCells: [22, 23, 38, 39, 54, 55, 70, 71, 86, 87, 102, 103],
    ambulancePos: 0.78,
    statusText: 'CORRIDOR SECURED · GREEN WAVE ACTIVE ACROSS 1,660M'
  },
  {
    num: '08',
    title: 'FAILED SEGMENT DETECTED',
    category: 'CONTINGENCY ALERT',
    description: 'Stationary vehicle detected in sector 4 shoulder margin (CAM-04 conflict spill). Clearance drops below 2.8m critical threshold along primary trajectory.',
    activeCells: [68, 69, 84, 85],
    ambulancePos: 0.88,
    statusText: 'OBSTRUCTION ALERT: CELL 69 BLOCKED · CLEARANCE 2.6M'
  },
  {
    num: '09',
    title: 'SELF-HEAL / REROUTE',
    category: 'DYNAMIC ADAPTATION',
    description: 'OSRM routing engine calculates dynamic micro-bypass via outer slip lane within 120ms. Transit ETA preserved with zero emergency deceleration.',
    activeCells: [24, 25, 40, 41, 57, 73, 89, 105],
    ambulancePos: 0.98,
    statusText: 'SLIP-LANE BYPASS ACTUATED · ETA PRESERVED +0.0s'
  }
];

export default function CorridorPage({ resources = [] }) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking for the 9-stage sequence
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001
  });

  // Track active stage as user scrolls
  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      const stageCount = CORRIDOR_STAGES.length;
      const calculatedIdx = Math.min(Math.floor(latest * stageCount), stageCount - 1);
      setActiveStageIdx(Math.max(0, calculatedIdx));
    });
  }, [scrollYProgress]);

  const currentStage = CORRIDOR_STAGES[activeStageIdx] || CORRIDOR_STAGES[0];

  // SVG ambulance position mapped from scroll
  const ambulancePathLength = useTransform(smoothProgress, [0, 1], [0.05, 0.98]);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="EMERGENCY TRANSIT CORRIDOR · DISCRETE HOMOGRAPHY"
        title="MAKE WAY."
        subtitle="We don't assume lane discipline. We model road-space availability. Dynamic grid slicing and vehicle displacement physics create emergent green corridors for ambulances."
        meta={
          <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
            <div>
              <span className="text-micro">ROAD CLEARANCE</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 600, color: 'var(--status-confirmed)' }} className="tabular-nums">
                14.0 METERS
              </p>
            </div>
            <div>
              <span className="text-micro">CORRIDOR STATUS</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 600 }} className="tabular-nums">
                STAGE {currentStage.num}/09
              </p>
            </div>
          </div>
        }
      />

      {/* 3 Large Key Figures (Palomino Editorial Metrics) */}
      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <div className="grid-12" style={{ borderBottom: '1px solid var(--border-strong)', paddingBottom: '48px' }}>
          <div className="col-span-4">
            <span className="text-micro">01 / FREE SPACE RATIO</span>
            <div className="text-display-lg tabular-nums" style={{ margin: '8px 0 4px 0' }}>
              <AnimatedMetric value={64.2} decimals={1} suffix="%" />
            </div>
            <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
              Unoccupied road surface measured by homography grid analysis.
            </p>
          </div>

          <div className="col-span-4">
            <span className="text-micro">02 / LANE ELASTICITY</span>
            <div className="text-display-lg tabular-nums" style={{ margin: '8px 0 4px 0' }}>
              <AnimatedMetric value={0.82} decimals={2} />
            </div>
            <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
              Ability of adjacent vehicle clusters to compress into shoulder margin.
            </p>
          </div>

          <div className="col-span-4">
            <span className="text-micro">03 / TRANSIT FEASIBILITY</span>
            <div className="text-display-lg tabular-nums" style={{ margin: '8px 0 4px 0', color: 'var(--status-confirmed)' }}>
              FEASIBLE
            </div>
            <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
              Clearance width 7.5m safely exceeds 3.5m minimum ambulance envelope.
            </p>
          </div>
        </div>
      </div>

      {/* 21st.dev Interactive Scrolling Story: Sticky CCTV & Grid on Left / 9-Stage Narrative on Right */}
      <div ref={containerRef} className="page-container" style={{ position: 'relative', minHeight: '450vh', paddingTop: '40px' }}>
        <div style={{ display: 'flex', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'flex-start' }}>
          
          {/* Pinned Sticky Visual: Video, Discrete Sliced Grid, and SVG Follow-Scroll Path */}
          <div
            style={{
              flex: '1 1 58%',
              position: 'sticky',
              top: 'calc(var(--header-height, 72px) + 24px)',
              height: 'calc(100vh - var(--header-height, 72px) - 64px)',
              backgroundColor: '#0a0a0c',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Visual Top Status Strip */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                zIndex: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: activeStageIdx === 7 ? 'var(--status-critical)' : 'var(--status-confirmed)',
                    boxShadow: `0 0 8px ${activeStageIdx === 7 ? 'var(--status-critical)' : 'var(--status-confirmed)'}`
                  }}
                />
                <span className="text-micro" style={{ color: 'var(--text-primary)' }}>
                  {currentStage.statusText}
                </span>
              </div>
              <span className="text-micro" style={{ color: 'var(--text-secondary)' }}>
                STAGE {currentStage.num} OF 09
              </span>
            </div>

            {/* Video Container with Dynamic Grid & SVG Follow Scroll */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
              <video
                src="/api/videos/file/cam03_ambulance.mp4"
                autoPlay
                loop
                muted
                playsInline
                ref={(el) => { if (el) el.muted = true; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* 16x8 Dynamic Road Grid Overlay (Thin, Non-Neon, Responsive to Stages) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(16, 1fr)',
                  gridTemplateRows: 'repeat(8, 1fr)',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                {Array.from({ length: 128 }).map((_, i) => {
                  const isStageActive = currentStage.activeCells.includes(i);
                  const col = i % 16;
                  const isCorridorCenter = col >= 6 && col <= 9;
                  const isObstruction = activeStageIdx === 7 && (i === 68 || i === 69);

                  let cellBg = 'transparent';
                  let cellBorder = '0.5px solid rgba(244, 243, 238, 0.04)';

                  if (isObstruction) {
                    cellBg = 'rgba(239, 68, 68, 0.35)';
                    cellBorder = '1px solid var(--status-critical)';
                  } else if (isStageActive) {
                    cellBg = 'rgba(42, 157, 143, 0.28)';
                    cellBorder = '1px solid var(--status-confirmed)';
                  } else if (isCorridorCenter && activeStageIdx >= 5) {
                    cellBg = 'rgba(42, 157, 143, 0.08)';
                    cellBorder = '0.5px solid rgba(42, 157, 143, 0.2)';
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        border: cellBorder,
                        backgroundColor: cellBg,
                        transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    />
                  );
                })}
              </div>

              {/* 21st.dev SVG Follow Scroll: Ambulance Trajectory Spline & Animated Vehicle Marker */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 3
                }}
                viewBox="0 0 1000 600"
                preserveAspectRatio="none"
              >
                {/* Background Trajectory Vector */}
                <path
                  d={activeStageIdx >= 8 
                    ? "M 150 500 C 350 420, 500 380, 650 260 S 800 180, 920 120"
                    : "M 150 500 C 350 420, 520 320, 700 240 S 850 160, 920 120"
                  }
                  fill="none"
                  stroke="rgba(244, 243, 238, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />

                {/* Animated Path Progression Tied to Scroll */}
                <motion.path
                  d={activeStageIdx >= 8 
                    ? "M 150 500 C 350 420, 500 380, 650 260 S 800 180, 920 120"
                    : "M 150 500 C 350 420, 520 320, 700 240 S 850 160, 920 120"
                  }
                  fill="none"
                  stroke={activeStageIdx === 7 ? 'var(--status-critical)' : 'var(--status-confirmed)'}
                  strokeWidth="3.5"
                  style={{ pathLength: ambulancePathLength }}
                />

                {/* Dynamic Marker: Follows Ambulance Vector */}
                <circle
                  cx={150 + (currentStage.ambulancePos * 750)}
                  cy={500 - (currentStage.ambulancePos * 380)}
                  r="7"
                  fill={activeStageIdx === 7 ? 'var(--status-critical)' : 'var(--status-confirmed)'}
                  style={{
                    filter: 'drop-shadow(0 0 6px currentColor)',
                    transition: 'cx 0.3s cubic-bezier(0.25, 1, 0.5, 1), cy 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                />
              </svg>

              {/* Bottom Telemetry Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 24px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 4
                }}
              >
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                    ACTIVE PROTOCOL
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                    {currentStage.title}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-micro">LATERAL CLEARANCE</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 600, color: activeStageIdx === 7 ? 'var(--status-critical)' : 'var(--status-confirmed)' }}>
                    {activeStageIdx === 7 ? '2.6 METERS (BLOCKED)' : '3.8 METERS (SECURE)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Narrative Stream: 9 Discrete Stages that Scroll Past */}
          <div style={{ flex: '1 1 42%', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '35vh', paddingBottom: '30vh' }}>
            {CORRIDOR_STAGES.map((st, i) => {
              const isSelected = activeStageIdx === i;

              return (
                <div
                  key={st.num}
                  style={{
                    opacity: isSelected ? 1 : 0.28,
                    transform: isSelected ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    borderLeft: isSelected ? '2px solid var(--text-primary)' : '2px solid transparent',
                    paddingLeft: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className="text-micro" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      STAGE {st.num} / 09
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {st.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: '0 0 14px 0',
                      fontSize: 'clamp(24px, 2.5vw, 36px)',
                      fontWeight: 500,
                      lineHeight: 1.15,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {st.title}
                  </h3>

                  <p
                    className="text-body"
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)'
                    }}
                  >
                    {st.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
