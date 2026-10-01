import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';

export default function CameraPage({
  selectedCameraId = 'CAM-04',
  onSelectCamera,
  videoCatalogue = [],
  onOpenIncident
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeEvidenceStep, setActiveEvidenceStep] = useState(1);

  // Curated demo feeds
  const cameraCatalog = videoCatalogue.length > 0 ? videoCatalogue : [
    { cameraId: 'CAM-01', scenario: 'Normal Urban Intersection', purpose: 'baseline_traffic', file: 'cam01_normal_intersection.mp4', duration: '30s', fps: 30 },
    { cameraId: 'CAM-02', scenario: 'Traffic Congestion & Queue Buildup', purpose: 'congestion', file: 'cam02_congestion.mp4', duration: '30s', fps: 30 },
    { cameraId: 'CAM-03', scenario: 'Emergency Vehicle Transit', purpose: 'emergency_corridor', file: 'cam03_ambulance.mp4', duration: '13.4s', fps: 30 },
    { cameraId: 'CAM-04', scenario: 'Multi-Vehicle Collision', purpose: 'collision', file: 'cam04_collision.mp4', duration: '35s', fps: 30 },
    { cameraId: 'CAM-05', scenario: 'Night-Time Surveillance & Tracking', purpose: 'night_conditions', file: 'cam05_night_traffic.mp4', duration: '30s', fps: 30 },
    { cameraId: 'CAM-07', scenario: 'Pedestrian Crowd Density Surge', purpose: 'crowd_movement', file: 'cam07_crowd_growth.mp4', duration: '30s', fps: 30 },
    { cameraId: 'CAM-09', scenario: 'Camera Health & Baseline Verification', purpose: 'camera_health', file: 'cam09_normal_source.mp4', duration: '26s', fps: 30 },
    { cameraId: 'CAM-11', scenario: 'Unattended Baggage & Separation', purpose: 'unattended_baggage', file: 'cam11_unattended_baggage.mp4', duration: '30s', fps: 30 }
  ];

  const currentCam = cameraCatalog.find(c => c.cameraId === selectedCameraId) || cameraCatalog[3];
  const videoUrl = `/api/videos/file/${currentCam.file}`;

  // Evidence steps for the "WHY THIS ALERT?" narrative
  const evidenceSteps = [
    {
      step: '01',
      title: 'TRAJECTORY CONFLICT',
      metric: 'CONVERGENCE RATE: 19.9 px/frame',
      detail: 'ByteTrack kinematic tracking observed two opposing vehicle vectors on colliding trajectories at Central Expressway.'
    },
    {
      step: '02',
      title: 'ABRUPT DECELERATION ANOMALY',
      metric: 'PEAK DECELERATION: 6.2 px/frame²',
      detail: 'Temporal feature engine measured negative acceleration exceeding nominal urban braking thresholds within a 0.25s window.'
    },
    {
      step: '03',
      title: 'PERSISTENT SPATIAL PROXIMITY',
      metric: 'STOPPAGE DURATION: >3.2 SECONDS',
      detail: 'Contact cluster maintained stationary spatial overlap with zero post-event egress, ruling out transient traffic occlusion.'
    },
    {
      step: '04',
      title: 'HYPOTHESIS STATE CONFIRMATION',
      metric: 'VERIFICATION STATE: CONFIRMED (P1)',
      detail: 'Accumulated multi-signal evidence achieved a 0.88 evidence score, transitioning the incident deterministically from SUSPECTED to CONFIRMED.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow={`SURVEILLANCE SENSOR · ${currentCam.cameraId}`}
        title={`${currentCam.cameraId} ${currentCam.scenario.toUpperCase()}`}
        subtitle={`Real-time monocular video inference running on NVIDIA RTX 4050 (FP16 half-precision). Detections, velocity tracking, and multi-signal temporal verification.`}
        meta={
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span className="text-micro" style={{ color: 'var(--status-critical)' }}>
              VERIFICATION: CONFIRMED
            </span>
            <span className="text-micro">
              PROVENANCE: INFERENCE
            </span>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '32px', paddingBottom: '120px' }}>
        
        {/* Primary Camera Media (Occupies 85vw - The Interface) */}
        <div
          style={{
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto 64px auto',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
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
                FEED: {currentCam.file} · {currentCam.scenario}
              </span>
            </div>

            {/* Minimal Controls (No giant blue SaaS buttons) */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {showTechnicalDetails ? 'HIDE METADATA' : 'TECHNICAL DETAILS +'}
              </button>
            </div>
          </div>

          {/* Video Container with 1px Bounding Box Overlays */}
          <div style={{ position: 'relative', width: '100%', height: 'clamp(440px, 60vh, 850px)', backgroundColor: '#000' }}>
            <video
              src={videoUrl}
              autoPlay={isPlaying}
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Subtle 1px Bounding Box Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '36%',
                left: '40%',
                width: '20%',
                height: '26%',
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
                  padding: '1px 6px'
                }}
              >
                V-004 · CAR · 0.94 CONF
              </span>
            </div>
          </div>

          {/* Collapsible Technical Metadata Drawer */}
          {showTechnicalDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.35, ease: editorialEase }}
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px'
              }}
            >
              <div>
                <span className="text-micro">INFERENCE CHECKPOINT</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
                  artifacts/models/nayan_india_v2/best.pt
                </p>
              </div>
              <div>
                <span className="text-micro">FRAME TIMING (RTX 4050)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  23.6 ms median · 40.7 FPS throughput
                </p>
              </div>
              <div>
                <span className="text-micro">RESOLUTION & CODEC</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  1280x720 · H.264 Baseline @ 30.0 FPS
                </p>
              </div>
              <div>
                <span className="text-micro">TRACKING ENGINE</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  High-Precision ByteTrack with Anonymous Privacy IDs
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Section: "WHY THIS ALERT?" — Scroll Narrative (Zero Stacked Mini-Cards) */}
        <div style={{ marginTop: '96px', borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span className="text-micro">TEMPORAL EVIDENCE CHAIN</span>
            <h2 className="text-display-lg" style={{ margin: '8px 0 16px 0' }}>
              WHY THIS ALERT?
            </h2>
            <p className="text-body-lg">
              NAYAN rejects single-frame false alarms. State machine transitions require cumulative physical kinematic evidence: trajectory convergence, acute deceleration, and persistent stoppage.
            </p>
          </div>

          <div className="grid-12" style={{ alignItems: 'flex-start' }}>
            {/* Left Narrative Stepper */}
            <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {evidenceSteps.map((ev, idx) => {
                const isActive = activeEvidenceStep === idx + 1;
                return (
                  <div
                    key={ev.step}
                    onClick={() => setActiveEvidenceStep(idx + 1)}
                    style={{
                      borderLeft: `2px solid ${isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                      paddingLeft: '24px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <span className="text-micro" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      STAGE {ev.step} / {ev.metric}
                    </span>
                    <h3 style={{ margin: '6px 0 8px 0', fontSize: '20px', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {ev.title}
                    </h3>
                    <p className="text-body" style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                      {ev.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Forensic Detail Callout */}
            <div
              className="col-span-6"
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '32px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <span className="text-micro" style={{ display: 'block', marginBottom: '8px' }}>
                CURRENT HYPOTHESIS EVALUATION
              </span>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
                Deterministic Evidence Score: 0.88 / 1.00
              </h4>
              <p className="text-body" style={{ margin: '0 0 24px 0', fontSize: '14px' }}>
                Multi-signal convergence confirmed across 4 separate temporal metrics. Camera calibration validates obstacle placement in Lane 1 with zero ambiguous occlusions.
              </p>

              <hr className="editorial-rule" style={{ marginBottom: '20px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="text-micro">ASSOCIATED INCIDENT</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 600 }}>
                    INC-CAM04-COLLISION
                  </p>
                </div>
                <button
                  onClick={() => onOpenIncident && onOpenIncident('INC-CAM04-LIVE')}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border-strong)',
                    background: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  OPEN INCIDENT CASE STUDY →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Feed Switcher Rows (Palomino Editorial Rows) */}
        <div style={{ marginTop: '120px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '16px' }}>
            OPTICAL SENSOR REGISTRY
          </span>
          <h2 className="text-heading" style={{ margin: '0 0 32px 0', textTransform: 'uppercase' }}>
            AVAILABLE CCTV FEEDS
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cameraCatalog.map((cam, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const isSelected = cam.cameraId === selectedCameraId;

              return (
                <div
                  key={cam.cameraId}
                  onClick={() => onSelectCamera(cam.cameraId)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'padding-left 0.2s ease',
                    paddingLeft: isSelected ? '16px' : '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      {num}
                    </span>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '20px',
                          fontWeight: 500,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {cam.cameraId} — {cam.scenario}
                      </h3>
                      <span className="text-micro" style={{ marginTop: '4px', display: 'block' }}>
                        PURPOSE: {cam.purpose.toUpperCase()} · DURATION: {cam.duration}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {isSelected ? 'ACTIVE VIEW' : 'SELECT FEED →'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
