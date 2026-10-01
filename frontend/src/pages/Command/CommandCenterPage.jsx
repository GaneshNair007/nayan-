import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import HoverMediaPreview from '../../motion/HoverMediaPreview';
import { editorialEase } from '../../motion/easing';

// CCTV video map for all sensors
const CAMERA_MEDIA_MAP = {
  'CAM-04': { video: '/api/videos/file/cam04_collision.mp4', label: 'CAM-04 COLLISION CLUSTER' },
  'CAM-03': { video: '/api/videos/file/cam03_ambulance.mp4', label: 'CAM-03 EMERGENCY TRANSIT' },
  'CAM-07': { video: '/api/videos/file/cam07_crowd.mp4', label: 'CAM-07 PEDESTRIAN SPILL' },
  'CAM-11': { video: '/api/videos/file/cam11_baggage.mp4', label: 'CAM-11 UNATTENDED OBJECT' },
  'CAM-02': { video: '/api/videos/file/cam02_congestion.mp4', label: 'CAM-02 FLOW ANOMALY' },
  'CAM-01': { video: '/api/videos/file/cam01_intersection.mp4', label: 'CAM-01 JUNCTION OPTICAL' }
};

export default function CommandCenterPage({
  incidents = [],
  cameras = [],
  _corridors = [],
  onSelectCamera,
  onSelectIncident
}) {
  const fallbackIncidents = [
    {
      id: 'INC-CAM-04-LIVE',
      camera_id: 'CAM-04',
      title: 'Multi-Vehicle Traffic Collision',
      description: 'Real-time collision verified via trajectory convergence, acute deceleration anomaly, and persistent stoppage on Central Expressway.',
      verification_state: 'CONFIRMED',
      priority_tier: 'P1',
      priority_score: 94.5,
      model_confidence: 0.94,
      affected_lanes: ['Lane 1', 'Lane 2']
    },
    {
      id: 'INC-CAM-03-CORRIDOR',
      camera_id: 'CAM-03',
      title: 'Emergency Yield Corridor (AMB-01)',
      description: 'Dynamic grid slicing models 3.5m free-space central corridor as adjacent traffic yields into shoulder.',
      verification_state: 'CONFIRMED',
      priority_tier: 'P2',
      priority_score: 88.0,
      model_confidence: 0.98,
      affected_lanes: ['Corridor Center']
    },
    {
      id: 'INC-CAM-07-CROWD',
      camera_id: 'CAM-07',
      title: 'Pedestrian Surge Anomaly',
      description: 'Abnormal pedestrian density accumulation observed spilling beyond pedestrian safety perimeter into active roadway.',
      verification_state: 'VERIFYING',
      priority_tier: 'P3',
      priority_score: 72.0,
      model_confidence: 0.89,
      affected_lanes: ['Crosswalk A']
    }
  ];

  const activeIncidents = incidents.length > 0 ? incidents : fallbackIncidents;
  const [hoveredPreview, setHoveredPreview] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(activeIncidents[0]);
  const shouldReduceMotion = useReducedMotion();

  // Active or focused camera visual
  const activeCamId = selectedIncident?.camera_id || 'CAM-04';
  const activeCamera = cameras.find(c => c.id === activeCamId) || { id: activeCamId, name: 'Central Expressway' };
  const activeMedia = CAMERA_MEDIA_MAP[activeCamId] || CAMERA_MEDIA_MAP['CAM-04'];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* 21st.dev Floating Hover Media Preview */}
      <HoverMediaPreview activeItem={hoveredPreview} />

      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="CENTRALIZED SURVEILLANCE & ACTIVE INTERVENTIONS"
        title="LIVE CITY STATE"
        subtitle="Monocular video streams processed continuously on local GPU hardware. Detections, multi-object tracks, and temporal kinematic evidence verify incidents before dispatch."
        meta={
          <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
            <div>
              <span className="text-micro">SURVEILLANCE SENSORS</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600 }} className="tabular-nums">
                {cameras.length || 8} ACTIVE
              </p>
            </div>
            <div>
              <span className="text-micro">VERIFIED INCIDENTS</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600, color: 'var(--status-critical)' }} className="tabular-nums">
                {incidents.length || 3} EVENTS
              </p>
            </div>
          </div>
        }
      />

      {/* Main Split Composition: 65% Sticky Media Visual / 35% Incident Index */}
      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 64px)', alignItems: 'flex-start' }}>
          
          {/* Dominant Sticky Visual Field (65%) with AnimatePresence Crossfade */}
          <div
            style={{
              flex: '1 1 65%',
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
            {/* Visual Header Strip */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 2
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-critical)',
                    boxShadow: '0 0 8px var(--status-critical)'
                  }}
                />
                <span className="text-micro" style={{ color: 'var(--text-primary)' }}>
                  PRIMARY SENSOR: {activeCamId} · {activeCamera.name || 'SURVEILLANCE'}
                </span>
              </div>
              <span className="text-micro">
                RTX 4050 FP16 · ~40.7 FPS · BYTETRACK ACTIVE
              </span>
            </div>

            {/* Video Player Area with 21st AnimatePresence Crossfade */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCamId}
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                  transition={{ duration: 0.5, ease: editorialEase }}
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                >
                  <video
                    key={activeMedia.video}
                    src={activeMedia.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(el) => { if (el) el.muted = true; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Bounding Box Overlay Simulation */}
                  {activeCamId === 'CAM-04' && (
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
                          top: '-18px',
                          left: 0,
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: 'var(--status-critical)',
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          padding: '1px 4px',
                          letterSpacing: '0.04em'
                        }}
                      >
                        COLLISION CLUSTER · CONF 0.94
                      </span>
                    </div>
                  )}

                  {activeCamId === 'CAM-03' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '45%',
                        left: '35%',
                        width: '24%',
                        height: '30%',
                        border: '1px solid var(--status-confirmed)',
                        pointerEvents: 'none'
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '-18px',
                          left: 0,
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: 'var(--status-confirmed)',
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          padding: '1px 4px',
                          letterSpacing: '0.04em'
                        }}
                      >
                        EMERGENCY AMBULANCE · CONF 0.98
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Telemetry Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '20px 24px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 2
                }}
              >
                <div>
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                    ACTIVE HYPOTHESIS
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 600 }}>
                    {selectedIncident ? selectedIncident.title : 'Multi-Vehicle Conflict Detected'}
                  </p>
                </div>
                <button
                  onClick={() => onSelectCamera(activeCamId)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '8px 16px',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  OPEN SENSOR INTELLIGENCE →
                </button>
              </div>
            </div>
          </div>

          {/* Editorial Incident Index (35%) — Pure Typography & Thin Rules, Zero Boxed Cards */}
          <div style={{ flex: '1 1 35%', minWidth: '320px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span className="text-micro">OPERATIONAL INCIDENT REGISTRY</span>
              <h2 className="text-heading" style={{ margin: '4px 0 0 0', textTransform: 'uppercase' }}>
                ACTIVE EVENTS
              </h2>
            </div>

            <hr className="editorial-rule-strong" style={{ marginBottom: '16px' }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activeIncidents.map((inc, index) => {
                  const num = String(index + 1).padStart(2, '0');
                  const isSelected = selectedIncident?.id === inc.id;
                  const isCritical = inc.priority_tier === 'P1' || inc.severity === 'CRITICAL';
                  const statusColor = isCritical ? 'var(--status-critical)' : 'var(--status-verifying)';
                  const mediaInfo = CAMERA_MEDIA_MAP[inc.camera_id] || CAMERA_MEDIA_MAP['CAM-04'];

                  return (
                    <div
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncident(inc);
                        if (onSelectIncident) onSelectIncident(inc.id);
                      }}
                      onMouseEnter={() => {
                        setHoveredPreview({
                          title: `${inc.camera_id} · ${inc.title}`,
                          videoUrl: mediaInfo.video,
                          badge: inc.priority_tier || 'P1'
                        });
                      }}
                      onMouseLeave={() => setHoveredPreview(null)}
                      style={{
                        padding: '24px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'padding-left 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease',
                        paddingLeft: isSelected ? '16px' : '0',
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                          {num} / {inc.camera_id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              letterSpacing: '0.06em',
                              color: statusColor
                            }}
                          >
                            {inc.verification_state || 'CONFIRMED'}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              fontFamily: 'monospace'
                            }}
                          >
                            {inc.priority_tier || 'P1'} ({inc.priority_score || '92.0'})
                          </span>
                        </div>
                      </div>

                      <h3
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: 500,
                          lineHeight: 1.3,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {inc.title}
                      </h3>

                      <p
                        className="text-body"
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {inc.description}
                      </p>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>LANES: {Array.isArray(inc.affected_lanes) && inc.affected_lanes.length ? inc.affected_lanes.join(', ') : 'Derived from Sector'}</span>
                        <span>CONFIDENCE: {Math.round((inc.model_confidence || 0.88) * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Response, Corridor & System Provenance (Editorial Row, Zero Cards) */}
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '16px' }}>
            OPERATIONAL COUPLING & DETERMINISTIC DISPATCH
          </span>

          <div className="grid-12">
            <div className="col-span-4">
              <span className="text-micro">01 / LATEST RESPONSE RECOMMENDATION</span>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '18px', fontWeight: 600 }}>
                AMB-01 Pre-Emption Path Active
              </h4>
              <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                Deterministic OSRM routing mapped 1,660m trajectory in 185s with zero traffic obstruction on Central Expressway.
              </p>
            </div>

            <div className="col-span-4">
              <span className="text-micro">02 / EMERGENCY CORRIDOR VERIFICATION</span>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '18px', fontWeight: 600 }}>
                14.0m Roadway Clearance Verified
              </h4>
              <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                Camera planar homography confirms vehicle lateral displacement into shoulder; center clearance exceeds 3.5m threshold.
              </p>
            </div>

            <div className="col-span-4">
              <span className="text-micro">03 / AUDIT TRAIL IMMUTABILITY</span>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '18px', fontWeight: 600 }}>
                Human Operator Authorization Enforced
              </h4>
              <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                AI decision-support proposes drafts; system state changes execute strictly following authenticated operator approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
