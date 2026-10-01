import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';
import apiClient from '../../data/apiClient';

const TIMELINE_PHASES = [
  {
    phase: '01',
    state: 'OBSERVED',
    timestamp: '08:35:38.120',
    signals: 'Trajectory Convergence Detected',
    detail: 'YOLOv8 & ByteTrack track IDs #14 and #19 observe vector intersection with lateral angular closure >32°.'
  },
  {
    phase: '02',
    state: 'SUSPECTED',
    timestamp: '08:35:39.450',
    signals: 'Acute Deceleration Anomaly',
    detail: 'Optical flow records sudden velocity decay from 54 km/h to 0 km/h in 0.8s (19.9 px/frame² peak deceleration).'
  },
  {
    phase: '03',
    state: 'VERIFYING',
    timestamp: '08:35:40.800',
    signals: 'Spatial Proximity & Cluster Stoppage',
    detail: 'Planar bounding boxes overlap. Multi-object tracker clusters vehicles into a single stationary entity across lane 1.'
  },
  {
    phase: '04',
    state: 'CONFIRMED',
    timestamp: '08:35:41.900',
    signals: 'Obstruction Duration >2.5s',
    detail: 'Stationary threshold exceeded. Critical incident confirmed with 0.94 model confidence. Automated preemption proposal issued.'
  }
];

export default function IncidentPage({
  incidentId = 'INC-CAM-04-LIVE',
  incidents = [],
  onBack,
  onOpenCorridor,
  onRefresh
}) {
  const [authorizing, setAuthorizing] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const galleryRef = useRef(null);
  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ['start end', 'end start']
  });

  // Asynchronous vertical parallax for the 4 forensic frames
  const yFrame1 = useTransform(galleryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [40, -40]);
  const yFrame2 = useTransform(galleryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-30, 50]);
  const yFrame3 = useTransform(galleryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [60, -60]);
  const yFrame4 = useTransform(galleryProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-50, 40]);

  const incident = incidents.find(i => i.id === incidentId) || incidents[0] || {
    id: 'INC-CAM-04-LIVE',
    camera_id: 'CAM-04',
    title: 'Multi-Vehicle Traffic Collision',
    description: 'Real-time collision verified via trajectory convergence, acute deceleration anomaly, and persistent stoppage on Central Expressway.',
    verification_state: 'CONFIRMED',
    response_state: 'UNACKNOWLEDGED',
    priority_tier: 'P1',
    priority_score: 92.0,
    model_confidence: 0.94,
    evidence_score: 0.88,
    affected_lanes: ['Lane 1', 'Lane 2'],
    created_at: new Date().toISOString()
  };

  const isConfirmed = incident.verification_state === 'CONFIRMED';
  const isDispatched = incident.response_state === 'DISPATCHED';

  // Handle human operator authorization
  const handleAuthorize = async () => {
    setAuthorizing(true);
    try {
      await apiClient.authorizeIncidentDispatch(incident.id, 'Operator OP-KUMAR-7 authorized unit AMB-01 dispatch');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Authorize error:', e);
    } finally {
      setAuthorizing(false);
    }
  };

  // Request AI operator copilot assistance
  const handleRequestAi = async () => {
    setAiLoading(true);
    try {
      const res = await apiClient.requestAiAssist('INCIDENT_BRIEF', incident.id);
      if (res) setAiDraft(res);
    } catch (e) {
      console.error('AI Copilot error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow={`INCIDENT CASE STUDY · ${incident.id}`}
        title={incident.title.toUpperCase()}
        subtitle={`Sensor ${incident.camera_id} · Central Expressway & 4th Cross · Verified ${incident.verification_state} (Priority ${incident.priority_tier} - ${incident.priority_score})`}
        meta={
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            ← BACK TO COMMAND
          </button>
        }
      />

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
        
        {/* Dominant Hero Media (85vw Cinematic Presentation) */}
        <div
          style={{
            width: '100%',
            height: 'clamp(460px, 62vh, 800px)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '96px'
          }}
        >
          <video
            src="/api/videos/file/cam04_collision.mp4"
            autoPlay
            loop
            muted
            playsInline
            ref={(el) => { if (el) el.muted = true; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Calibrated Bounding Box */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '42%',
              width: '18%',
              height: '24%',
              border: '1px solid var(--status-critical)',
              pointerEvents: 'none'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-20px',
                left: 0,
                fontSize: '10px',
                fontFamily: 'monospace',
                color: 'var(--status-critical)',
                backgroundColor: 'rgba(0,0,0,0.85)',
                padding: '1px 6px',
                letterSpacing: '0.04em'
              }}
            >
              IMPACT CLUSTER · CONF 0.94
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 32px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}
          >
            <div>
              <span className="text-micro" style={{ color: 'var(--status-critical)' }}>
                TELEMETRY: VERIFIED TRAJECTORY IMPACT
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600 }}>
                Trajectory Conflict Verified on CAM-04 (Lane 1 Blocked)
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>PROVENANCE: YOLOv8 FP16 CUDA · BYTETRACK</span>
            </div>
          </div>
        </div>

        {/* Section 01: Modern Timeline Spanning Substantial Viewport Height */}
        <div style={{ marginBottom: '120px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '32px' }}>
            01 / 4-STAGE FORENSIC VERIFICATION TIMELINE
          </span>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Continuous Vertical Timeline Track */}
            <div
              style={{
                position: 'absolute',
                left: '120px',
                top: '16px',
                bottom: '16px',
                width: '1px',
                backgroundColor: 'var(--border-subtle)'
              }}
            />

            {TIMELINE_PHASES.map((ph, idx) => {
              const isConfirmedState = ph.state === 'CONFIRMED';
              const dotColor = isConfirmedState ? 'var(--status-critical)' : 'var(--text-primary)';

              return (
                <div
                  key={ph.phase}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '40px',
                    position: 'relative',
                    padding: '24px 0',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  {/* Timestamp & Phase Index */}
                  <div style={{ width: '100px', textAlign: 'right' }}>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      PHASE {ph.phase}
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {ph.timestamp}
                    </p>
                  </div>

                  {/* Timeline Node Dot */}
                  <div
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      boxShadow: `0 0 8px ${dotColor}`,
                      marginTop: '6px',
                      zIndex: 2
                    }}
                  />

                  {/* Narrative Body */}
                  <div style={{ flex: 1, paddingLeft: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ph.state}
                      </h3>
                      <span
                        style={{
                          fontSize: '11px',
                          color: isConfirmedState ? 'var(--status-critical)' : 'var(--text-secondary)',
                          fontFamily: 'monospace'
                        }}
                      >
                        — {ph.signals}
                      </span>
                    </div>

                    <p className="text-body" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, maxWidth: '820px' }}>
                      {ph.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 02: 21st.dev Immersive Scroll Gallery (Asynchronous Vertical Parallax) */}
        <div ref={galleryRef} style={{ marginBottom: '120px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <div style={{ marginBottom: '40px' }}>
            <span className="text-micro">02 / IMMERSIVE FORENSIC SCROLL GALLERY</span>
            <h2 className="text-heading" style={{ margin: '4px 0 0 0', textTransform: 'uppercase' }}>
              CHRONOLOGICAL FRAME EVIDENCE
            </h2>
            <p className="text-body" style={{ margin: '8px 0 0 0', maxWidth: '680px' }}>
              High-cadence camera frame sequence with differential optical displacement. Frames translate asynchronously during scroll.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              alignItems: 'center'
            }}
          >
            {/* Frame 1: Before Frame */}
            <motion.div
              style={{ y: yFrame1, border: '1px solid var(--border-subtle)', backgroundColor: '#0a0a0c', overflow: 'hidden' }}
            >
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <video
                  src="/api/videos/file/cam04_collision.mp4"
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="text-micro" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 6px' }}>
                    T - 4.2s · BASELINE
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <span className="text-micro">UNINTERRUPTED FLOW</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Speeds nominal at 52 km/h across both lanes.
                </p>
              </div>
            </motion.div>

            {/* Frame 2: Event Frame */}
            <motion.div
              style={{ y: yFrame2, border: '1px solid var(--status-critical)', backgroundColor: '#0a0a0c', overflow: 'hidden' }}
            >
              <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
                <video
                  src="/api/videos/file/cam04_collision.mp4"
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="text-micro" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '2px 6px' }}>
                    T = 0.0s · IMPACT
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <span className="text-micro" style={{ color: 'var(--status-critical)' }}>DECELERATION SPIKE</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Peak 19.9 px/frame² kinematic deceleration anomaly.
                </p>
              </div>
            </motion.div>

            {/* Frame 3: After Frame */}
            <motion.div
              style={{ y: yFrame3, border: '1px solid var(--border-subtle)', backgroundColor: '#0a0a0c', overflow: 'hidden' }}
            >
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <video
                  src="/api/videos/file/cam04_collision.mp4"
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="text-micro" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 6px' }}>
                    T + 3.5s · STOPPAGE
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <span className="text-micro">ROADWAY IMPASSE</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Vehicles immobilized. Queue propagation initiated.
                </p>
              </div>
            </motion.div>

            {/* Frame 4: Bounding Box Evidence Crop */}
            <motion.div
              style={{ y: yFrame4, border: '1px solid var(--border-subtle)', backgroundColor: '#0a0a0c', overflow: 'hidden' }}
            >
              <div style={{ height: '240px', position: 'relative', overflow: 'hidden', backgroundColor: '#111' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '25%',
                    left: '20%',
                    right: '20%',
                    bottom: '25%',
                    border: '1px dashed var(--status-critical)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--status-critical)' }}>
                    ROI CROP: V-001/002
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className="text-micro" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 6px' }}>
                    PLANAR PROJECTION
                  </span>
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <span className="text-micro">GROUND HOMOGRAPHY</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Centroid separation: 0.42m (Direct Physical Contact).
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 03: Human Operator Approval & AI Decision Support */}
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div className="grid-12">
            
            {/* Operator Authorization Control */}
            <div className="col-span-6" style={{ paddingRight: '24px' }}>
              <span className="text-micro">03 / HUMAN OPERATOR AUTHORIZATION</span>
              <h3 style={{ margin: '8px 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
                DISPATCH DIRECTIVE
              </h3>
              
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="text-micro">CURRENT STATUS</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: isDispatched ? 'var(--status-confirmed)' : 'var(--status-verifying)' }}>
                    {incident.response_state}
                  </span>
                </div>
                <p className="text-body" style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                  Recommended response: Dispatch Unit AMB-01 from Station 02. Preempt signal JNC-02 along westbound corridor.
                </p>

                <button
                  onClick={handleAuthorize}
                  disabled={authorizing || isDispatched}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isDispatched ? 'transparent' : 'var(--text-primary)',
                    color: isDispatched ? 'var(--status-confirmed)' : 'var(--bg-primary)',
                    border: isDispatched ? '1px solid var(--status-confirmed)' : 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: isDispatched ? 'default' : 'pointer'
                  }}
                >
                  {isDispatched ? '✓ DISPATCH AUTHORIZED BY OPERATOR' : (authorizing ? 'RECORDING AUDIT...' : 'AUTHORIZE DISPATCH & PREEMPTION')}
                </button>
              </div>
            </div>

            {/* AI Decision Support (Strictly Secondary) */}
            <div className="col-span-6">
              <span className="text-micro">04 / AI OPERATOR COPILOT (DECISION SUPPORT)</span>
              <h3 style={{ margin: '8px 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
                SITUATIONAL SYNTHESIS
              </h3>

              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                {aiDraft ? (
                  <div>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      AI DRAFT · PROVENANCE: AI_ASSISTED · STORE=FALSE
                    </span>
                    <p style={{ margin: '12px 0 16px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      {aiDraft.summary}
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      <strong>UNCERTAINTIES:</strong> {aiDraft.uncertainties?.join(', ') || 'Monocular feed cannot determine cabin integrity.'}
                    </div>
                  </div>
                ) : (
                  <p className="text-body" style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                    Request an AI-assisted operational brief synthesized from already-verified backend telemetry and OSRM routing.
                  </p>
                )}

                <button
                  onClick={handleRequestAi}
                  disabled={aiLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: aiLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {aiLoading ? 'SYNTHESIZING BRIEF...' : (aiDraft ? 'RE-SYNTHESIZE BRIEF' : 'GENERATE AI INCIDENT BRIEF')}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
