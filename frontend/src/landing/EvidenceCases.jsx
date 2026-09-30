import React, { useState } from 'react';

const FORENSIC_CASES = [
  {
    type: 'Collision Verification',
    camId: 'Arterial Junction CAM-04',
    subTitle: 'Kinematic Trajectory & Deceleration Invariant',
    quote: '“Confirmation required trajectory conflict, acute deceleration and persistent obstruction across multiple frames.”',
    thumbnail: '/media/nayan/stills/cam04_still_12s.webp',
    reasoning: 'Single-frame bounding overlaps trigger false alarms during routine braking. NAYAN required a sustained 12-frame deceleration threshold combined with intersecting 2D Kalman trajectory vectors before promoting from CANDIDATE to CONFIRMED.'
  },
  {
    type: 'Emergency Yield Corridor',
    camId: 'Indiranagar Main CAM-03',
    subTitle: 'Dynamic Preemption & Clearance Verification',
    quote: '“Corridor selection was determined by downstream queue dissipation time and camera-verified vehicle clearance.”',
    thumbnail: '/media/nayan/stills/cam03_still_7s.webp',
    reasoning: 'Preempting signals blindly causes secondary gridlock. The corridor engine synthesized OSRM topology with real-time queue density, holding green wave duration until CCTV bounding confirmed the emergency vehicle traversed the junction stop-line.'
  },
  {
    type: 'Anomalous Concourse Gathering',
    camId: 'Majestic Concourse CAM-07',
    subTitle: 'Spatial Kinematics & Density Differentials',
    quote: '“Gathering velocity vectors converged toward a central bottleneck, triggering early crowd dispersion warnings.”',
    thumbnail: '/media/nayan/stills/cam07_still_10s.webp',
    reasoning: 'Rather than raw headcounts, the temporal engine evaluated spatial density differentials and opposing velocity vectors, detecting high-pressure compression points 4 minutes before physical bottlenecking occurred.'
  },
  {
    type: 'Unattended Object Invariant',
    camId: 'Airport Terminal CAM-11',
    subTitle: 'Temporal Attachment & Detachment State Machine',
    quote: '“Owner-object association transitioned from bonded to orphaned after 45 continuous stationary seconds without proximity.”',
    thumbnail: '/media/nayan/stills/cam11_still_10s.webp',
    reasoning: 'The dual-state tracker linked luggage to its carrier trajectory. When the carrier exited the spatial bounding envelope while the luggage remained static, the system initiated an automated security alert with exact coordinates.'
  }
];

export default function EvidenceCases({ onSelectCamera }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentCase = FORENSIC_CASES[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? FORENSIC_CASES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === FORENSIC_CASES.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      id="forensic-evidence"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '72px 0 100px 0',
        boxSizing: 'border-box',
        zIndex: 50,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Centered Section Label matching Palomino */}
      <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
          TESTIMONIALS
        </h2>
      </div>

      {/* 3-Zone Layout with Vertical Dividing Lines matching Palomino */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 120px',
          maxWidth: '1440px',
          margin: '0 auto',
          minHeight: '460px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Left Arrow Zone */}
        <div 
          onClick={handlePrev}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'background-color 0.2s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.5)' }}>←</span>
        </div>

        {/* Center Zone: Large Centered Quote + Circular Avatar + Titles */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 48px',
            textAlign: 'center'
          }}
        >
          <blockquote 
            style={{
              margin: '0 0 40px 0',
              padding: 0,
              maxWidth: '820px',
              fontFamily: 'var(--pal-font)',
              fontSize: 'clamp(22px, 2.5vw, 32px)',
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              color: '#ffffff'
            }}
          >
            {currentCase.quote}
          </blockquote>

          {/* Circular Thumbnail Avatar matching Palomino */}
          <div 
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#111'
            }}
          >
            <img 
              src={currentCase.thumbnail} 
              alt={currentCase.camId}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Author / Case Title */}
          <div 
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: '18px',
              fontWeight: 500,
              color: '#ffffff',
              marginBottom: '4px'
            }}
          >
            {currentCase.camId}
          </div>

          {/* Subtitle */}
          <div 
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '28px'
            }}
          >
            {currentCase.subTitle}
          </div>

          {/* Action Link: SEE THE PROJECT → */}
          <a
            href="#command"
            onClick={(e) => {
              e.preventDefault();
              if (onSelectCamera) onSelectCamera('CAM-04');
            }}
            className="pal-nav-item"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="pal-char-primary">SEE THE EVIDENCE →</span>
          </a>
        </div>

        {/* Right Arrow Zone */}
        <div 
          onClick={handleNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'background-color 0.2s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.5)' }}>→</span>
        </div>
      </div>
    </section>
  );
}
