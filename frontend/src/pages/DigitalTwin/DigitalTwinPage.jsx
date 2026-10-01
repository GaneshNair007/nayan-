import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import PageHero from '../../layout/PageHero';
import ComparisonSlider from '../../motion/ComparisonSlider';
import AnimatedMetric from '../../motion/AnimatedMetric';
import { Sliders, ShieldCheck, Activity, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function DigitalTwinPage() {
  const [sliderPos, setSliderPos] = useState(50);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const metricsRef = useRef(null);
  const isMetricsInView = useInView(metricsRef, { once: true, margin: '-60px' });

  const keyFigures = [
    {
      number: '01',
      label: 'EMERGENCY TRAVEL TIME',
      fixed: '6.4 MIN',
      adaptiveTarget: 3.7,
      adaptiveUnit: ' MIN',
      improvementVal: -42,
      detail: 'Measured from Central Fire Hub to Hospital Stop-line along Central Expressway.'
    },
    {
      number: '02',
      label: 'MEAN INTERSECTION DELAY',
      fixed: '48.2 SEC',
      adaptiveTarget: 29.8,
      adaptiveUnit: ' SEC',
      improvementVal: -38,
      detail: 'Average vehicular wait time across all approaches at Junction 2.'
    },
    {
      number: '03',
      label: 'PEAK VEHICULAR QUEUE',
      fixed: '124 METERS',
      adaptiveTarget: 57,
      adaptiveUnit: ' METERS',
      improvementVal: -54,
      detail: 'Maximum queue tail length on Northbound approach during peak rush hour.'
    },
    {
      number: '04',
      label: 'AVERAGE STOPPED TIME',
      fixed: '38.5 SEC',
      adaptiveTarget: 15.0,
      adaptiveUnit: ' SEC',
      improvementVal: -61,
      detail: 'Per-vehicle cumulative idling time while awaiting green phase.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="SUMO TRAFFIC MICROSIMULATION & VALIDATION"
        title="FIXED VS ADAPTIVE"
        subtitle="Counterfactual validation comparing conventional fixed-time signal cycles against NAYAN closed-loop adaptive green waves. Validated via SUMO microsimulation."
        meta={
          <div style={{ textAlign: 'right' }}>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              SIMULATION PROVENANCE
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontFamily: 'monospace', color: '#10b981' }}>
              SUMO / TRACI CLOSED-LOOP ENGINE
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '140px' }}>
        
        {/* Full-Width 21st.dev Comparison Slider */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <div>
              <span className="text-micro" style={{ color: '#10b981' }}>
                TACTILE VISUAL WIPE · 50/50 SPLIT
              </span>
              <h2 className="text-heading" style={{ margin: '4px 0 0 0', textTransform: 'uppercase' }}>
                MICROSCOPIC TRAFFIC FLOW RECONSTRUCTION
              </h2>
            </div>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              DRAG HANDLE OR USE ARROW KEYS TO COMPARE
            </span>
          </div>

          <ComparisonSlider
            beforeSrc="/media/nayan/stills/cam04_still_12s.webp"
            afterSrc="/media/nayan/stills/cam03_still_7s.webp"
            beforeLabel="FIXED-TIME BASELINE"
            afterLabel="NAYAN ADAPTIVE AI"
            beforeTag="GRIDLOCK · QUEUE 124m · DELAY +4.2m"
            afterTag="PREEMPTION ACTIVE · QUEUE 57m · -42% TRAVEL TIME"
            initialPosition={50}
            onPositionChange={setSliderPos}
          />
        </div>

        {/* 4 Key Figures with 21st.dev Animated Metrics */}
        <div ref={metricsRef} style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                QUANTITATIVE PERFORMANCE COMPARISON
              </span>
              <h3 className="text-heading" style={{ margin: '6px 0 0 0', textTransform: 'uppercase' }}>
                EMPIRICAL VALIDATION FIGURES
              </h3>
            </div>
            <span className="text-micro" style={{ color: '#10b981' }}>
              ANIMATED ON VIEWPORT ENTRY
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {keyFigures.map((fig) => {
              const isHovered = hoveredMetric === fig.number;

              return (
                <div
                  key={fig.number}
                  onMouseEnter={() => setHoveredMetric(fig.number)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  style={{
                    padding: '32px',
                    border: `1px solid ${isHovered ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.03)' : '#07080a',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span className="text-micro" style={{ color: isHovered ? '#10b981' : 'var(--text-muted)' }}>
                        METRIC {fig.number}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '2px 8px'
                        }}
                      >
                        {isMetricsInView ? (
                          <AnimatedMetric value={fig.improvementVal} suffix="%" />
                        ) : '0%'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                      {fig.label}
                    </h4>

                    {/* Before vs After comparison numbers */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <span className="text-micro" style={{ color: 'var(--text-muted)' }}>FIXED BASELINE</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontFamily: 'monospace', color: '#ef4444' }}>
                          {fig.fixed}
                        </p>
                      </div>

                      <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>→</span>

                      <div>
                        <span className="text-micro" style={{ color: '#10b981' }}>NAYAN ADAPTIVE</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isMetricsInView ? (
                            <AnimatedMetric
                              value={fig.adaptiveTarget}
                              decimals={1}
                              suffix={fig.adaptiveUnit}
                            />
                          ) : (
                            `0.0${fig.adaptiveUnit}`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                    {fig.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
