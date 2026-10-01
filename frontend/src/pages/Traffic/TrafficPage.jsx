import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';
import AnimatedMetric from '../../motion/AnimatedMetric';
import { Radio, ArrowUpRight, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';

const SIGNAL_STORY_STEPS = [
  {
    step: '01',
    phaseName: 'NORMAL ADAPTIVE CYCLE',
    signalState: { red: false, amber: false, green: true, direction: 'NORTH_SOUTH' },
    headline: '01 NORMAL BASELINE ARTERIAL FLOW',
    detail: 'Nominal four-phase cycle operating under localized vehicle-actuated density. North-South approach retains green split with 45s cycle duration. Queue headways maintain 14.5m separation.',
    opposingStatus: 'EW RED · QUEUE: 8 VEH',
    transitGain: 'BASELINE 0.0s'
  },
  {
    step: '02',
    phaseName: 'AMBULANCE RADAR & CV ACQUISITION',
    signalState: { red: false, amber: false, green: true, direction: 'APPROACH_DETECTED' },
    headline: '02 AMBULANCE DETECTED AT 250M',
    detail: 'CAM-03 Class-0 detector verified Medic 01 traveling westbound on Central Expressway at 52.0 km/h. Estimated Time of Arrival to stop line: 8.4 seconds. Preemption engine initiates green-split calculation.',
    opposingStatus: 'EW PRE-HOLDING · QUEUE: 12 VEH',
    transitGain: 'PREEMPTION ARMED'
  },
  {
    step: '03',
    phaseName: 'CROSS-TRAFFIC CONFLICT TERMINATION',
    signalState: { red: false, amber: true, green: false, direction: 'CONFLICT_STOP' },
    headline: '03 LATERAL CONFLICT PHASES TERMINATED',
    detail: 'Pedestrian walk intervals terminated immediately. Eastbound and westbound cross-traffic green splits curtailed. Approaching vehicle deceleration profiles monitored via CCTV to ensure smooth stopping.',
    opposingStatus: 'AMBER WARNING · SPEED: 18 km/h',
    transitGain: '-8.0s INTERLOCK'
  },
  {
    step: '04',
    phaseName: 'INTERMEDIATE YELLOW CLEARANCE',
    signalState: { red: false, amber: true, green: false, direction: 'CLEARANCE' },
    headline: '04 INTERSECTION CLEARANCE INTERVAL',
    detail: '3.0-second yellow transition flushes residual passenger vehicles currently within the intersection conflict zone. TraCI actuators confirm zero intersection entrapment.',
    opposingStatus: 'INTERSECTION FLUSHING',
    transitGain: '-14.0s DELAY'
  },
  {
    step: '05',
    phaseName: 'ALL-RED CONFLICT LOCKOUT',
    signalState: { red: true, amber: false, green: false, direction: 'ALL_RED' },
    headline: '05 ALL-RED INTERLOCK INTERVAL',
    detail: 'Full multi-directional red interval engaged for 2.0 seconds. Every approach is locked in a deterministic stop state, ensuring zero lateral vehicle intrusion before emergency transit.',
    opposingStatus: 'ALL STREAMS LOCKED RED',
    transitGain: 'SAFETY INVARIANT 100%'
  },
  {
    step: '06',
    phaseName: 'EMERGENCY EXTENDED GREEN',
    signalState: { red: false, amber: false, green: true, direction: 'AMBULANCE_GREEN' },
    headline: '06 AMBULANCE CORRIDOR GREEN WAVE',
    detail: 'Phase 3 (Westbound Extended Green) actuated with high-priority hold. 140 meters of downstream roadway cleared. Medic 01 traverses intersection without touching brake pedal.',
    opposingStatus: 'CROSS TRAFFIC LOCKED RED',
    transitGain: '-42% TRAVEL TIME'
  },
  {
    step: '07',
    phaseName: 'ADAPTIVE NETWORK RECOVERY',
    signalState: { red: false, amber: false, green: true, direction: 'RECOVERY' },
    headline: '07 DYNAMIC SIGNAL CYCLE REBALANCING',
    detail: 'Following CCTV confirmation of ambulance clearance across downstream detector, the controller transitions to compensatory recovery, extending cross-street green by 18s to clear accumulated queue.',
    opposingStatus: 'COMPENSATORY CYCLE ACTIVE',
    transitGain: 'ZERO RESIDUAL GRIDLOCK'
  }
];

export default function TrafficPage({ junctions = [] }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedJncId, setSelectedJncId] = useState('JNC-02');
  const stepRefs = useRef([]);
  const networkRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll linkage for Connected Network SVG Timeline
  const { scrollYProgress: networkScroll } = useScroll({
    target: networkRef,
    offset: ['start center', 'end center']
  });

  const pathFill = useTransform(networkScroll, [0, 1], [0.1, 1.0]);

  // Track active scroll stage in the sticky junction story
  useEffect(() => {
    const handleScroll = () => {
      const mid = window.innerHeight * 0.45;
      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) {
          setActiveStep(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentStep = SIGNAL_STORY_STEPS[activeStep];

  const defaultJunctions = [
    {
      id: 'JNC-01',
      name: 'Main Street & 1st Avenue',
      corridorRole: 'ENTRY NODAL POINT',
      cycleTime: 90,
      phaseName: 'NORTH_SOUTH_GREEN',
      cameras: ['CAM-01', 'CAM-02'],
      queueLength: '28.0m',
      status: 'NOMINAL FLOW'
    },
    {
      id: 'JNC-02',
      name: 'Central Expressway & 4th Cross',
      corridorRole: 'PRIMARY EMERGENCY INTERLOCK',
      cycleTime: 120,
      phaseName: 'EXTENDED_GREEN_HOLD',
      cameras: ['CAM-03', 'CAM-04'],
      queueLength: '120.0m',
      status: 'PREEMPTION ACTIVE'
    },
    {
      id: 'JNC-03',
      name: 'Tech Corridor & Ring Road',
      corridorRole: 'HOSPITAL APPROACH DOCK',
      cycleTime: 90,
      phaseName: 'EAST_WEST_PRE_HOLD',
      cameras: ['CAM-05', 'CAM-07'],
      queueLength: '45.0m',
      status: 'DOWNSTREAM ARMED'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="ADAPTIVE INTERSECTION ORCHESTRATION"
        title="SIGNAL INTELLIGENCE"
        subtitle="Closed-loop actuation balancing IRC urban standards with real-time CV queue estimation. Signals transition through a 7-stage preemption sequence during emergency transits."
        meta={
          <div style={{ display: 'flex', gap: '32px', textAlign: 'right', flexWrap: 'wrap' }}>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>NETWORK NODES</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600, fontFamily: 'monospace' }}>
                <AnimatedMetric value={3} suffix=" JUNCTIONS" />
              </p>
            </div>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>ACTUATION LATENCY</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600, fontFamily: 'monospace', color: '#10b981' }}>
                <AnimatedMetric value={24.2} suffix=" ms" decimals={1} />
              </p>
            </div>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>EMERGENCY PREEMPTION</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600, fontFamily: 'monospace', color: '#f59e0b' }}>
                ACTIVE (JNC-02)
              </p>
            </div>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '140px' }}>
        
        {/* SECTION 1: STICKY 7-STAGE SIGNAL PREEMPTION STORY */}
        <div style={{ marginBottom: '120px' }}>
          <div style={{ maxWidth: '850px', marginBottom: '48px' }}>
            <span className="text-micro" style={{ color: '#f59e0b' }}>
              SCROLL-CHOREOGRAPHED ACTUATION · 7 PHASES
            </span>
            <h2 className="text-display-lg" style={{ margin: '8px 0 16px 0' }}>
              HOW THE INTERSECTION CLEARS.
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
              Blind preemption causes secondary gridlock. NAYAN coordinates an exact 7-stage cycle:
              detecting the ambulance, terminating conflicting green splits, ensuring all-red clearance,
              holding extended green, and smoothly returning to compensatory cycle recovery.
            </p>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'minmax(420px, 50%) 1fr',
              gap: 'clamp(32px, 5vw, 80px)',
              alignItems: 'flex-start'
            }}
          >
            {/* Left Column: Pinned Sticky Intersection Display */}
            <div
              style={{
                position: 'sticky',
                top: '90px',
                height: 'clamp(520px, 75vh, 850px)',
                width: '100%',
                backgroundColor: '#07080a',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px'
              }}
            >
              {/* Header inside sticky card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                    ACTUATOR: JNC-02 · CENTRAL EXPWY
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600 }}>
                    {currentStep.phaseName}
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '3px 8px',
                    border: '1px solid var(--border-strong)',
                    color: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  PHASE {currentStep.step} / 07
                </span>
              </div>

              {/* Main Signal Lights Interactive Display */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'clamp(24px, 4vw, 56px)',
                  margin: 'auto 0'
                }}
              >
                {/* RED SIGNAL LIGHT */}
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{
                      scale: currentStep.signalState.red ? 1.05 : 0.82,
                      opacity: currentStep.signalState.red ? 1.0 : 0.18,
                      boxShadow: currentStep.signalState.red
                        ? '0 0 45px rgba(230, 57, 70, 0.9), 0 0 15px #e63946'
                        : 'none'
                    }}
                    transition={{ duration: 0.35, ease: editorialEase }}
                    style={{
                      width: 'clamp(80px, 9vw, 120px)',
                      height: 'clamp(80px, 9vw, 120px)',
                      borderRadius: '50%',
                      backgroundColor: '#e63946',
                      border: '2px solid rgba(255,255,255,0.2)',
                      margin: '0 auto 12px auto'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: currentStep.signalState.red ? '#e63946' : 'var(--text-muted)'
                    }}
                  >
                    STOP (RED)
                  </span>
                </div>

                {/* AMBER SIGNAL LIGHT */}
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{
                      scale: currentStep.signalState.amber ? 1.05 : 0.82,
                      opacity: currentStep.signalState.amber ? 1.0 : 0.18,
                      boxShadow: currentStep.signalState.amber
                        ? '0 0 45px rgba(245, 158, 11, 0.9), 0 0 15px #f59e0b'
                        : 'none'
                    }}
                    transition={{ duration: 0.35, ease: editorialEase }}
                    style={{
                      width: 'clamp(80px, 9vw, 120px)',
                      height: 'clamp(80px, 9vw, 120px)',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      border: '2px solid rgba(255,255,255,0.2)',
                      margin: '0 auto 12px auto'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: currentStep.signalState.amber ? '#f59e0b' : 'var(--text-muted)'
                    }}
                  >
                    CLEAR (AMBER)
                  </span>
                </div>

                {/* GREEN SIGNAL LIGHT */}
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{
                      scale: currentStep.signalState.green ? 1.05 : 0.82,
                      opacity: currentStep.signalState.green ? 1.0 : 0.18,
                      boxShadow: currentStep.signalState.green
                        ? '0 0 45px rgba(16, 185, 129, 0.9), 0 0 15px #10b981'
                        : 'none'
                    }}
                    transition={{ duration: 0.35, ease: editorialEase }}
                    style={{
                      width: 'clamp(80px, 9vw, 120px)',
                      height: 'clamp(80px, 9vw, 120px)',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid rgba(255,255,255,0.2)',
                      margin: '0 auto 12px auto'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: currentStep.signalState.green ? '#10b981' : 'var(--text-muted)'
                    }}
                  >
                    TRANSIT (GREEN)
                  </span>
                </div>
              </div>

              {/* Bottom Real-Time Telemetry Bar */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}
              >
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>OPPOSING STATE</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {currentStep.opposingStatus}
                  </p>
                </div>
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>TRANSIT EFFICIENCY</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: '#10b981' }}>
                    {currentStep.transitGain}
                  </p>
                </div>
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>PREEMPTION DELAY</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: '#38bdf8' }}>
                    &lt; 0.25s INTERLOCK
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Scrollable Narrative Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
              {SIGNAL_STORY_STEPS.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={s.step}
                    ref={(el) => (stepRefs.current[idx] = el)}
                    style={{
                      minHeight: '38vh',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      borderLeft: `2px solid ${isActive ? '#f59e0b' : 'var(--border-subtle)'}`,
                      paddingLeft: '32px',
                      transition: 'border-color 0.25s ease',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      paddingTop: '20px',
                      paddingBottom: '20px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: isActive ? '#f59e0b' : 'var(--text-muted)',
                        letterSpacing: '0.1em',
                        display: 'block',
                        marginBottom: '8px'
                      }}
                    >
                      STAGE {s.step} / 07 · {s.phaseName}
                    </span>
                    <h3
                      style={{
                        margin: '0 0 12px 0',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {s.headline}
                    </h3>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '520px' }}>
                      {s.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: CONNECTED JUNCTION NETWORK (VERTICAL EDITORIAL TIMELINE + ANIMATED SVG PATH) */}
        <div ref={networkRef} style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div style={{ maxWidth: '850px', marginBottom: '48px' }}>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              MULTI-JUNCTION ARTERIAL COORDINATION
            </span>
            <h2 className="text-display-lg" style={{ margin: '8px 0 16px 0' }}>
              CONNECTED NODAL NETWORK.
            </h2>
            <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>
              Green waves require downstream propagation. Rather than isolated junction controllers, NAYAN forms a synchronized arterial chain along Bangalore’s primary expressway.
            </p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {/* SVG Connecting Timeline Line */}
            <svg
              style={{
                position: 'absolute',
                top: '40px',
                left: '27px',
                width: '6px',
                height: 'calc(100% - 80px)',
                overflow: 'visible',
                pointerEvents: 'none'
              }}
            >
              <line
                x1="3"
                y1="0"
                x2="3"
                y2="100%"
                stroke="var(--border-subtle)"
                strokeWidth="2"
              />
              <motion.line
                x1="3"
                y1="0"
                x2="3"
                y2="100%"
                stroke="#10b981"
                strokeWidth="3"
                style={{ pathLength: pathFill }}
              />
            </svg>

            {/* Junction Nodes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', position: 'relative', zIndex: 2 }}>
              {defaultJunctions.map((jnc, i) => {
                const isSelected = selectedJncId === jnc.id;
                return (
                  <div
                    key={jnc.id}
                    onClick={() => setSelectedJncId(jnc.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '32px',
                      padding: '32px',
                      border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.03)' : '#07080a',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Node Circle Index */}
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#10b981' : '#0a0a0c',
                        border: `2px solid ${isSelected ? '#10b981' : 'var(--border-strong)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: isSelected ? '#000' : 'var(--text-primary)',
                        flexShrink: 0
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Node Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span className="text-micro" style={{ color: isSelected ? '#10b981' : 'var(--text-muted)' }}>
                            {jnc.corridorRole}
                          </span>
                          <h3 style={{ margin: '4px 0 6px 0', fontSize: '24px', fontWeight: 600 }}>
                            {jnc.id} — {jnc.name}
                          </h3>
                        </div>

                        <span
                          style={{
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            padding: '4px 10px',
                            backgroundColor: jnc.status.includes('ACTIVE') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: `1px solid ${jnc.status.includes('ACTIVE') ? '#f59e0b' : '#10b981'}`,
                            color: jnc.status.includes('ACTIVE') ? '#f59e0b' : '#10b981'
                          }}
                        >
                          {jnc.status}
                        </span>
                      </div>

                      {/* Micro Specs Strip */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '16px',
                          marginTop: '20px',
                          paddingTop: '16px',
                          borderTop: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div>
                          <span className="text-micro" style={{ color: 'var(--text-muted)' }}>CYCLE TIME</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontFamily: 'monospace' }}>
                            {jnc.cycleTime}s Adaptive Split
                          </p>
                        </div>
                        <div>
                          <span className="text-micro" style={{ color: 'var(--text-muted)' }}>CURRENT PHASE</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontFamily: 'monospace' }}>
                            {jnc.phaseName}
                          </p>
                        </div>
                        <div>
                          <span className="text-micro" style={{ color: 'var(--text-muted)' }}>CONNECTED CAMERAS</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontFamily: 'monospace' }}>
                            {jnc.cameras.join(' · ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-micro" style={{ color: 'var(--text-muted)' }}>APPROACH QUEUE</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontFamily: 'monospace', color: '#f59e0b' }}>
                            {jnc.queueLength}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
