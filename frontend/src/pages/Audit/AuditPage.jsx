import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import LetterSwapLink from '../../motion/LetterSwapLink';
import { editorialEase } from '../../motion/easing';
import { ShieldCheck, Activity, Terminal, User, Cpu, Sparkles, Clock, ArrowUpRight } from 'lucide-react';

const AUDIT_EVENTS_SEED = [
  {
    id: 'audit-001',
    time: '08:35:12 UTC',
    timestamp: '2026-10-01T08:35:12.410Z',
    actor: 'SYSTEM_KERNEL',
    category: 'SYSTEM',
    provenance: 'SIMULATOR',
    title: 'AEGIS GRID KERNEL INITIALIZED ON CUDA:0',
    description: 'Hardware watchdog verified NVIDIA GeForce RTX 4050 Laptop GPU (FP16 half-precision mode). Initialized 3 junction actuators, 8 monocular optical feeds, and in-memory audit store with zero cold-start delay.',
    metadata: {
      hardware: 'RTX 4050 6GB',
      modelHash: '6eb11ed634f43ea6...',
      memoryFootprint: '412 MB VRAM'
    },
    hoverMedia: '/media/hero/urban_highway_night.mp4',
    mediaType: 'video'
  },
  {
    id: 'audit-002',
    time: '08:35:24 UTC',
    timestamp: '2026-10-01T08:35:24.890Z',
    actor: 'YOLOV8_DETECTOR',
    category: 'INFERENCE',
    provenance: 'INFERENCE',
    title: 'CLASS 0 (AMBULANCE) DETECTED ON CAM-03',
    description: 'Edge monocular feed at Central Expressway East acquired emergency response unit Medic 01 with 98.2% confidence. Vehicle velocity measured at 52.0 km/h with acute approach vector towards Junction 2.',
    metadata: {
      confidence: '0.982',
      speed: '52.0 km/h',
      camera: 'CAM-03 Eastbound',
      interlock: 'Dispatched to Preemption Engine'
    },
    hoverMedia: '/api/videos/file/cam03_ambulance.mp4',
    mediaType: 'video'
  },
  {
    id: 'audit-003',
    time: '08:35:28 UTC',
    timestamp: '2026-10-01T08:35:28.110Z',
    actor: 'CORRIDOR_ENGINE',
    category: 'DERIVED',
    provenance: 'INFERENCE',
    title: 'DYNAMIC ROADWAY PREEMPTION SPLINE GENERATED',
    description: 'Kinematic safety engine calculated 140m conflict-free clearance interval across pedestrian and lateral phases. Preemption signal override prepared for JNC-02 Phase 3 (Westbound Extended Green).',
    metadata: {
      clearanceWindow: '12.0s',
      downstreamNode: 'JNC-02',
      crossTrafficStop: 'All-Red Lockout Armed'
    },
    hoverMedia: '/media/nayan/stills/cam03_still_7s.webp',
    mediaType: 'image'
  },
  {
    id: 'audit-004',
    time: '08:35:34 UTC',
    timestamp: '2026-10-01T08:35:34.900Z',
    actor: 'OP-KUMAR-7',
    category: 'USER',
    provenance: 'USER_INPUT',
    title: 'OPERATOR AUTHORIZED EMERGENCY CORRIDOR DISPATCH',
    description: 'Human-in-the-loop operator confirmed preemption authorization via the Dispatch Console. Signal override command transmitted to physical junction controller.',
    metadata: {
      operatorId: 'OP-KUMAR-7',
      authMethod: 'Cryptographic Signature',
      overrideDuration: '60s'
    },
    hoverMedia: '/media/nayan/stills/cam04_still_12s.webp',
    mediaType: 'image'
  },
  {
    id: 'audit-005',
    time: '08:35:46 UTC',
    timestamp: '2026-10-01T08:35:46.330Z',
    actor: 'COPILOT_AI',
    category: 'AI',
    provenance: 'AI_ASSISTED',
    title: 'AI COPILOT GENERATED SITUATION BRIEF & RADIO DRAFT',
    description: 'Synthesized plain-text operational dispatch memo for EMS unit Medic 01: "Corridor green-wave locked on Central Expressway through JNC-02. Cross traffic held at all-red stop line."',
    metadata: {
      reasoningLatency: '1.24s',
      modelSource: 'Local LLM Dispatcher',
      humanApproved: 'True'
    },
    hoverMedia: '/media/nayan/stills/cam07_still_10s.webp',
    mediaType: 'image'
  },
  {
    id: 'audit-006',
    time: '08:36:10 UTC',
    timestamp: '2026-10-01T08:36:10.050Z',
    actor: 'TEMPORAL_EVIDENCE_ENGINE',
    category: 'INFERENCE',
    provenance: 'INFERENCE',
    title: 'COLLISION DETECTED & CONFIRMED ON CAM-04',
    description: 'Kinematic deceleration spike of 6.2 px/fr² and persistent contact stoppage exceeding 3.2 seconds validated multi-vehicle collision hypothesis. State machine transitioned deterministically from SUSPECTED to CONFIRMED.',
    metadata: {
      evidenceScore: '0.88 / 1.00',
      affectedLanes: 'Lanes 1 & 2',
      policeUnit: 'POL-02 Dispatched'
    },
    hoverMedia: '/api/videos/file/cam04_collision.mp4',
    mediaType: 'video'
  }
];

export default function AuditPage({ auditEvents = [] }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Vertical timeline progress rule
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center']
  });

  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const allAudits = auditEvents.length > 0 ? auditEvents : AUDIT_EVENTS_SEED;
  const filters = ['ALL', 'INFERENCE', 'DERIVED', 'AI', 'USER', 'SYSTEM'];

  const filteredEvents = activeFilter === 'ALL'
    ? allAudits
    : allAudits.filter(a => (a.category === activeFilter || a.provenance === activeFilter));

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      
      {/* 60vh Massive Editorial Hero */}
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(32px, 5vw, 96px) var(--gutter, 32px)',
          borderBottom: '1px solid var(--border-strong)',
          backgroundColor: '#000000',
          position: 'relative'
        }}
      >
        <span
          className="text-micro"
          style={{
            color: 'var(--text-muted)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px'
          }}
        >
          IMMUTABLE FORENSIC LEDGER · 08:35:12 TO PRESENT
        </span>

        <h1
          style={{
            fontSize: 'clamp(48px, 9vw, 130px)',
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            margin: '0 0 32px 0',
            maxWidth: '1400px'
          }}
        >
          EVERY DECISION EXPLAINED.
        </h1>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <p
            style={{
              fontSize: 'clamp(16px, 1.4vw, 20px)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '750px',
              margin: 0
            }}
          >
            Cryptographically audited decision provenance. From the raw GPU monocular bounding box
            to the human operator’s preemption consent, every state transition is recorded for total legal auditability.
          </p>

          <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>RECORDS LOGGED</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 600, fontFamily: 'monospace' }}>
                {allAudits.length} EVENTS
              </p>
            </div>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>PROVENANCE INTEGRITY</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 600, fontFamily: 'monospace', color: '#10b981' }}>
                SHA-256 SIGNED
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar with 21st.dev Letter Swap */}
      <div
        style={{
          position: 'sticky',
          top: '72px',
          zIndex: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px var(--gutter, 32px)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(16px, 2.5vw, 36px)',
          overflowX: 'auto'
        }}
      >
        <span className="text-micro" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          PROVENANCE FILTER:
        </span>
        {filters.map((flt) => (
          <LetterSwapLink
            key={flt}
            active={activeFilter === flt}
            onClick={() => setActiveFilter(flt)}
            activeColor="var(--text-primary)"
            inactiveColor="var(--text-muted)"
            fontSize="12px"
          >
            {flt}
          </LetterSwapLink>
        ))}
      </div>

      {/* Full-Viewport Modern Timeline (35–50vh per Major Event) */}
      <div
        ref={timelineRef}
        style={{
          position: 'relative',
          maxWidth: '1500px',
          margin: '0 auto',
          padding: '80px var(--gutter, 32px) 160px var(--gutter, 32px)'
        }}
      >
        {/* Continuous Center Timeline Line */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            bottom: '160px',
            left: 'clamp(32px, 8vw, 120px)',
            width: '2px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 1
          }}
        >
          {/* Scroll-Driven Progress Fill Line */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: progressHeight,
              backgroundColor: '#10b981',
              transformOrigin: 'top'
            }}
          />
        </div>

        {/* Timeline Events List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', position: 'relative', zIndex: 2 }}>
          {filteredEvents.map((evt, idx) => {
            const isHovered = hoveredEvent?.id === evt.id;

            return (
              <motion.div
                key={evt.id}
                onMouseEnter={() => setHoveredEvent(evt)}
                onMouseLeave={() => setHoveredEvent(null)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: editorialEase }}
                style={{
                  minHeight: '38vh',
                  display: 'grid',
                  gridTemplateColumns: 'clamp(80px, 14vw, 180px) 1fr minmax(280px, 32%)',
                  gap: 'clamp(24px, 4vw, 64px)',
                  alignItems: 'flex-start',
                  padding: '36px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.025)' : '#07080a',
                  transition: 'background-color 0.25s, border-color 0.25s',
                  position: 'relative'
                }}
              >
                {/* Column 1: Monospaced Timestamp & Marker Dot */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: evt.provenance === 'USER_INPUT' ? '#f59e0b' : '#10b981',
                      border: '2px solid #fff',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                      marginTop: '4px',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'block'
                      }}
                    >
                      {evt.time || '08:35:12 UTC'}
                    </span>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      STEP {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Column 2: Event Headline, Description, & Metadata Badges */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        padding: '2px 8px',
                        border: '1px solid var(--border-strong)',
                        color: '#fff',
                        textTransform: 'uppercase'
                      }}
                    >
                      {evt.category || evt.provenance}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      ACTOR: {evt.actor}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(20px, 2.2vw, 32px)',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      margin: '0 0 16px 0',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {evt.title || evt.action}
                  </h3>

                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      margin: '0 0 24px 0',
                      maxWidth: '720px'
                    }}
                  >
                    {evt.description || evt.reason}
                  </p>

                  {/* Metadata Chips / Key-Value Pairs */}
                  {evt.metadata && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      {Object.entries(evt.metadata).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                            {k.toUpperCase()}
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 3: Forensic Visual Evidence Preview */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '220px',
                    backgroundColor: '#0a0a0c',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    borderRadius: '2px'
                  }}
                >
                  {evt.hoverMedia ? (
                    evt.mediaType === 'video' ? (
                      <video
                        src={evt.hoverMedia}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={evt.hoverMedia}
                        alt="audit evidence"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    >
                      CRYPTO AUDIT TRAIL LOGGED
                    </div>
                  )}

                  {/* Subtle Media Label Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: '2px 6px',
                      fontFamily: 'monospace',
                      fontSize: '9px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    PROVENANCE PROOF
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
