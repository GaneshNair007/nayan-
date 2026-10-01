import React, { useState } from 'react';
import { motion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';

export default function CorridorPage({ resources = [] }) {
  const [activeStoryStage, setActiveStoryStage] = useState(1);
  const [showTechnical, setShowTechnical] = useState(false);

  const stages = [
    {
      stage: '01',
      title: 'AMBULANCE DETECTED',
      detail: 'Trained YOLOv8 identifies emergency vehicle on CAM-03 (0.98 precision). Optical tracking registers speed 48 km/h on approach vector.'
    },
    {
      stage: '02',
      title: 'ROAD-SPACE ANALYSED',
      detail: 'Monocular planar homography calibrates roadway boundary. Road width 14.0m evaluated for physical vehicle footprint.'
    },
    {
      stage: '03',
      title: 'DYNAMIC GRID SLICING',
      detail: 'Roadway partitioned into 0.5m discrete cells. Lateral spatial density computed without assuming lane discipline.'
    },
    {
      stage: '04',
      title: 'LANE ELASTICITY MODELING',
      detail: 'Adjacent vehicle spacing compressed into shoulder margins, creating an emergent 3.5m free-space central corridor.'
    },
    {
      stage: '05',
      title: 'JUNCTION PRE-CLEARANCE',
      detail: 'Actuation command sent to JNC-02 via TraCI interface. Eastbound green extended 35s to clear conflict zone.'
    },
    {
      stage: '06',
      title: 'CORRIDOR VERIFIED READY',
      detail: 'Segment clearance width 7.5m exceeds 3.5m emergency clearance threshold. Green wave corridor confirmed.'
    },
    {
      stage: '07',
      title: 'DETERMINISTIC REROUTE ADAPTATION',
      detail: 'Continuous CCTV monitoring watches for secondary blockages. If clearance drops below 2.8m, OSRM automatically reroutes.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero — MAKE WAY. */}
      <PageHero
        eyebrow="EMERGENCY TRANSIT CORRIDOR"
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
              <span className="text-micro">CORRIDOR FEASIBILITY</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 600 }} className="tabular-nums">
                FEASIBLE (0.86)
              </p>
            </div>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        
        {/* Dominant Corridor Primary Visual with Road Grid Overlay */}
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '80px'
          }}
        >
          {/* Header Strip */}
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
                  backgroundColor: 'var(--status-confirmed)',
                  boxShadow: '0 0 8px var(--status-confirmed)'
                }}
              />
              <span className="text-micro" style={{ color: 'var(--text-primary)' }}>
                DYNAMIC GRID SLICING: ACTIVE ON CENTRAL EXPRESSWAY (CAM-03 → CAM-04)
              </span>
            </div>

            <button
              onClick={() => setShowTechnical(!showTechnical)}
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
              {showTechnical ? 'HIDE CALIBRATION' : 'CALIBRATION DETAILS +'}
            </button>
          </div>

          {/* Media & Sliced Grid Overlay Simulation */}
          <div style={{ position: 'relative', width: '100%', height: 'clamp(440px, 55vh, 750px)', backgroundColor: '#000' }}>
            <video
              src="/api/videos/file/cam03_ambulance.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Subtle Geometric Road Grid Overlay (Thin, Restrained, Non-Neon) */}
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
                pointerEvents: 'none'
              }}
            >
              {Array.from({ length: 128 }).map((_, i) => {
                const col = i % 16;
                const isCorridorCenter = col >= 6 && col <= 9;
                return (
                  <div
                    key={i}
                    style={{
                      border: '0.5px solid rgba(244, 243, 238, 0.05)',
                      backgroundColor: isCorridorCenter ? 'rgba(42, 157, 143, 0.08)' : 'transparent',
                      transition: 'background-color 0.5s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Central Free Space Vector Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '40%',
                width: '20%',
                height: '60%',
                borderLeft: '1px dashed var(--status-confirmed)',
                borderRight: '1px dashed var(--status-confirmed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.08em',
                  color: 'var(--status-confirmed)',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  padding: '2px 8px'
                }}
              >
                EMERGENT CORRIDOR · 3.5m WIDTH
              </span>
            </div>
          </div>

          {/* Collapsible Technical Calibration Drawer */}
          {showTechnical && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}
            >
              <div>
                <span className="text-micro">HOMOGRAPHY CALIBRATION</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  4-Point Planar Projection: Image (u,v) → Ground (X,Y) in meters
                </p>
              </div>
              <div>
                <span className="text-micro">CALIBRATION ERROR</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Residual reprojection error &lt; 0.15m across 25m corridor
                </p>
              </div>
              <div>
                <span className="text-micro">LANE ELASTICITY COEFFICIENT</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Elasticity ratio 0.82 (High shoulder lateral yield capacity)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3 Oversized Key Figures (Palomino Editorial Metric Treatment, Zero KPI Cards) */}
        <div style={{ marginBottom: '96px', borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '24px' }}>
            CORRIDOR METRIC QUANTIFICATION
          </span>

          <div className="grid-12">
            <div className="col-span-4">
              <span className="text-micro">01 / FREE SPACE RATIO</span>
              <div className="text-display-lg tabular-nums" style={{ margin: '8px 0 4px 0' }}>
                64.2%
              </div>
              <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                Unoccupied road surface measured by homography grid analysis.
              </p>
            </div>

            <div className="col-span-4">
              <span className="text-micro">02 / LANE ELASTICITY</span>
              <div className="text-display-lg tabular-nums" style={{ margin: '8px 0 4px 0' }}>
                0.82
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

        {/* 7-Stage Scroll Story Narrative */}
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span className="text-micro">CLOSED-LOOP PREEMPTION STORY</span>
            <h2 className="text-display-lg" style={{ margin: '8px 0 16px 0' }}>
              HOW THE CORRIDOR CLEARS
            </h2>
            <p className="text-body-lg">
              Unlike traditional emergency preemption that blindly triggers green lights, NAYAN coordinates vehicle displacement, CCTV verification, and signal actuation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {stages.map((st, i) => {
              const isActive = activeStoryStage === i + 1;
              return (
                <div
                  key={st.stage}
                  onClick={() => setActiveStoryStage(i + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '32px',
                    padding: '24px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'padding-left 0.2s',
                    paddingLeft: isActive ? '16px' : '0'
                  }}
                >
                  <span className="text-micro" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {st.stage}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {st.title}
                    </h3>
                    <p className="text-body" style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, maxWidth: '720px' }}>
                      {st.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
