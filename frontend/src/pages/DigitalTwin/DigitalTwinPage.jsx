import React, { useState } from 'react';
import PageHero from '../../layout/PageHero';
import EditorialCounter from '../../motion/EditorialCounter';

export default function DigitalTwinPage() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100

  // 4 Palomino Key Figures for Fixed vs Adaptive
  const keyFigures = [
    { number: '01', label: 'EMERGENCY TRAVEL TIME', fixed: '6.4 MIN', adaptive: '3.7 MIN', improvement: '-42%' },
    { number: '02', label: 'MEAN INTERSECTION DELAY', fixed: '48.2 SEC', adaptive: '29.8 SEC', improvement: '-38%' },
    { number: '03', label: 'PEAK VEHICULAR QUEUE', fixed: '124 METERS', adaptive: '57 METERS', improvement: '-54%' },
    { number: '04', label: 'AVERAGE STOPPED TIME', fixed: '38.5 SEC', adaptive: '15.0 SEC', improvement: '-61%' }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="SUMO TRAFFIC MICROSIMULATION & VALIDATION"
        title="FIXED VS ADAPTIVE"
        subtitle="Controlled comparison of standard fixed-time traffic signal cycles versus NAYAN closed-loop adaptive green-wave corridors. Validated via SUMO microsimulation."
        meta={
          <div style={{ textAlign: 'right' }}>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              SIMULATION PROVENANCE
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
              SUMO / TRACI CLOSED-LOOP ENGINE
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        
        {/* Dominant Split Comparison Visual (Draggable/Adjustable Slider) */}
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '80px',
            userSelect: 'none'
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
            <span className="text-micro">
              LEFT: CONVENTIONAL FIXED-CYCLE TRAFFIC · RIGHT: NAYAN ADAPTIVE PREEMPTION
            </span>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              DRAG SLIDER TO COMPARE BEHAVIOR
            </span>
          </div>

          {/* Split Comparison Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(440px, 55vh, 700px)',
              overflow: 'hidden'
            }}
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
                setSliderPos(pos);
              }
            }}
          >
            {/* Background Layer: NAYAN Adaptive (Right) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/media/editorial/aerial-highway-interchange-02.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.9)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  padding: '8px 16px',
                  border: '1px solid var(--status-confirmed)',
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: 'var(--status-confirmed)'
                }}
              >
                NAYAN ADAPTIVE CORRIDOR (3.7 MIN)
              </div>
            </div>

            {/* Clipped Top Layer: Conventional Fixed Signal (Left) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2px solid var(--text-primary)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  maxWidth: '1600px',
                  height: '100%',
                  backgroundImage: 'url(/media/editorial/urban-traffic-congestion-03.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(0.6) brightness(0.65)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: '8px 16px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)'
                  }}
                >
                  CONVENTIONAL FIXED SIGNALS (6.4 MIN)
                </div>
              </div>
            </div>

            {/* Slider Handle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPos}%`,
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                pointerEvents: 'none'
              }}
            >
              ↔
            </div>
          </div>
        </div>

        {/* 4 Palomino Key Figures (Zero Boxed Cards) */}
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '48px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '24px' }}>
            SUMO SIMULATION VALIDATION METRICS
          </span>

          <div className="grid-12">
            {keyFigures.map((fig) => (
              <div key={fig.number} className="col-span-3" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
                <span className="text-micro">{fig.number} / {fig.label}</span>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '12px 0 6px 0' }}>
                  <span className="text-display-lg tabular-nums" style={{ color: 'var(--status-confirmed)' }}>
                    {fig.improvement}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>FIXED: {fig.fixed}</span>
                  <span style={{ color: 'var(--text-primary)' }}>NAYAN: {fig.adaptive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
