import React from 'react';

const NETWORK_MARKS = [
  { name: 'YOLOv8', category: 'PERCEPTION' },
  { name: 'CUDA 12.8', category: 'COMPUTE' },
  { name: 'PYTORCH', category: 'ACCELERATION' },
  { name: 'BYTETRACK', category: 'TRAJECTORY' },
  { name: 'FASTAPI', category: 'ASYNC REST' },
  { name: 'OPENCV', category: 'VISION ENGINE' },
  { name: 'SUMO / TraCI', category: 'SIMULATION' },
  { name: 'OSRM ROUTING', category: 'TOPOLOGY' },
  { name: 'PLANAR HOMOGRAPHY', category: 'CALIBRATION' },
  { name: 'TEMPORAL EVIDENCE', category: 'INVARIANTS' }
];

export default function NetworkStrip() {
  return (
    <section 
      id="system-network"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '72px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 20,
        overflow: 'hidden'
      }}
    >
      {/* Centered Section Label matching Palomino's "● OUR CLIENTS" */}
      <div style={{ textAlign: 'center', marginBottom: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
          OUR SYSTEM NETWORK
        </h2>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div 
        style={{
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      >
        <div className="pal-marquee-track">
          {[...NETWORK_MARKS, ...NETWORK_MARKS, ...NETWORK_MARKS].map((item, idx) => (
            <div 
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '12px',
                margin: '0 48px',
                userSelect: 'none',
                cursor: 'default'
              }}
            >
              <span 
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: '28px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase'
                }}
              >
                {item.name}
              </span>
              <span 
                style={{
                  fontFamily: 'var(--pal-font)',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.12em',
                  color: 'rgba(255, 255, 255, 0.35)',
                  textTransform: 'uppercase'
                }}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
