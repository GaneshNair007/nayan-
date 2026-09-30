import React from 'react';

const SERVICES = [
  {
    num: '1.',
    layerTag: '01 DETECT',
    title: 'Computer vision converts camera streams into anonymous scene observations.',
    description: 'Planar homography models map perspective coordinate pixels into metric planar positions, providing verified ground-truth object detection without facial or biometric storage. Inference executes with CUDA acceleration.',
    mediaUrl: '/media/nayan/stills/cam01_still_16s.webp',
    capabilities: [
      'Real-Time Object Detection (YOLOv8)',
      'Vehicle & Mobility Classification',
      'Pedestrian Density Estimation',
      'Emergency Vehicle Recognition (0.980 Precision)',
      'Autonomous Camera Health & Drift Check',
      'CUDA Tensor Core Pipeline Acceleration'
    ]
  },
  {
    num: '2.',
    layerTag: '02 VERIFY',
    title: 'Multi-frame kinematic invariants eliminate single-frame false positives.',
    description: 'NAYAN computes trajectory persistence with ByteTrack, detecting kinematic anomalies, sudden deceleration, and persistent obstructions before an alert is promoted from CANDIDATE to CONFIRMED.',
    mediaUrl: '/media/nayan/stills/cam04_still_19s.webp',
    capabilities: [
      'ByteTrack 2D Kalman Trajectory Tracking',
      'Kinematic Anomaly & Deceleration Detection',
      'Persistent Obstruction Spatial Invariants',
      'False Positive Temporal Dampening',
      'Incident State Machine (CANDIDATE → CONFIRMED)',
      'Planar Velocity & Conflict Vector Analysis'
    ]
  },
  {
    num: '3.',
    layerTag: '03 RESPOND',
    title: 'Autonomous green wave corridors clear paths for priority emergency vehicles.',
    description: 'When an authorized ambulance is verified, NAYAN coordinates an active green wave corridor across downstream junctions. Planar bounding checks continuously audit vehicle clearance before returning signals to normal cycle.',
    mediaUrl: '/media/nayan/stills/cam03_still_10s.webp',
    capabilities: [
      'Active Priority Yield Corridors',
      'Dynamic Grid Slicing & Resource Allocation',
      'Junction Signal Preemption & Coordination',
      'Downstream Clearance CCTV Verification',
      'Dynamic Rerouting for Secondary Congestion',
      'Automated Audit Trail & Provenance Logging'
    ]
  },
  {
    num: '4.',
    layerTag: '04 SIMULATE',
    title: 'Digital twin scenario replays benchmark intervention impact against counterfactuals.',
    description: 'Every emergency intervention is mirrored in a digital twin environment. Replay scenarios with fixed vs adaptive traffic signals to calculate exact travel-time savings, emissions reductions, and corridor impact.',
    mediaUrl: '/media/editorial/traffic-command-center-01.webp',
    capabilities: [
      'Scenario Replay & Incident Recreation',
      'Microscopic Traffic Simulation (SUMO / TraCI)',
      'Fixed-Time vs Adaptive Cycle Benchmarking',
      'Urban Network Topology Routing (OSRM)',
      'Immutable Event Log Verification',
      'Municipal Operations Dispatch Integration'
    ]
  }
];

export default function CapabilitySection() {
  return (
    <section 
      id="services"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        zIndex: 35
      }}
    >
      {/* Section Sticky Header with white circle bullet matching Palomino */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#000000',
          padding: '72px 20px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
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
            SERVICES
          </h2>
        </div>
      </div>

      {/* 4 Pinned Stacked Service Panels matching Palomino */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px 100px 20px' }}>
        {SERVICES.map((srv, idx) => (
          <div 
            key={idx}
            className="pal-service-layer"
            style={{
              top: `${80 + idx * 8}px`,
              marginBottom: idx === SERVICES.length - 1 ? '0' : '48px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: '#000000',
              padding: '60px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              columnGap: '36px',
              boxSizing: 'border-box'
            }}
          >
            {/* Left Column: Image with top-left index and bottom-left large uppercase title */}
            <div 
              style={{
                gridColumn: 'span 5',
                position: 'relative',
                borderRadius: '2px',
                overflow: 'hidden',
                height: '420px',
                backgroundColor: '#0d0d10'
              }}
            >
              <img 
                src={srv.mediaUrl}
                alt={srv.layerTag}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.85) contrast(1.05)'
                }}
              />
              {/* Top-left index matching Palomino */}
              <div 
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  fontFamily: 'var(--pal-font)',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#ffffff',
                  zIndex: 10
                }}
              >
                {srv.num}
              </div>

              {/* Bottom-left massive uppercase headline overlay matching Palomino */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '24px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  zIndex: 10
                }}
              >
                <h3 
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '38px',
                    fontWeight: 600,
                    lineHeight: 1.1,
                    letterSpacing: 'normal',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    margin: 0
                  }}
                >
                  {srv.layerTag}
                </h3>
              </div>
            </div>

            {/* Center Column: Large Headline (30.7px) and Body Paragraph (16px) */}
            <div 
              style={{
                gridColumn: 'span 4',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                paddingTop: '8px'
              }}
            >
              <h4 
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: '28px',
                  fontWeight: 400,
                  lineHeight: '36px',
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  margin: '0 0 24px 0'
                }}
              >
                {srv.title}
              </h4>
              <p 
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: '16px',
                  lineHeight: '26px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  margin: 0
                }}
              >
                {srv.description}
              </p>
            </div>

            {/* Right Column: SERVICES : Header & Clean List matching Palomino */}
            <div 
              style={{
                gridColumn: 'span 3',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                paddingLeft: '24px',
                paddingTop: '8px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.45)',
                  marginBottom: '20px',
                  display: 'block'
                }}
              >
                SERVICES :
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {srv.capabilities.map((cap, capIdx) => (
                  <li 
                    key={capIdx}
                    style={{
                      fontFamily: 'var(--pal-font)',
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.75)',
                      lineHeight: '22px'
                    }}
                  >
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
