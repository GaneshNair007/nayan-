import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, animate, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';

function NumericFigure({ targetNum, suffix = '', decimals = 1 }) {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotion();
  const [currentVal, setCurrentVal] = useState(
    shouldReduceMotion || targetNum == null ? targetNum : 0
  );

  useEffect(() => {
    if (shouldReduceMotion || targetNum == null) {
      setCurrentVal(targetNum);
      return;
    }

    if (isInView && typeof targetNum === 'number') {
      const controls = animate(0, targetNum, {
        duration: 1.2,
        ease: EASING.expoOut,
        onUpdate(latest) {
          setCurrentVal(latest);
        }
      });
      return () => controls.stop();
    }
  }, [isInView, targetNum, shouldReduceMotion]);

  const formatted =
    typeof currentVal === 'number'
      ? decimals > 0
        ? currentVal.toFixed(decimals)
        : Math.round(currentVal).toString()
      : targetNum ?? '--';

  return (
    <span ref={nodeRef} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatted}
      {suffix}
    </span>
  );
}

export default function KeyFigures({ backendMetrics = {} }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });
  const shouldReduceMotion = useReducedMotion();

  // Metrics derived from live or frozen backend contracts
  const mapValue = backendMetrics.mAP50 ? backendMetrics.mAP50 * 100 : 98.8;
  const ambPrecValue = backendMetrics.ambulancePrecision
    ? backendMetrics.ambulancePrecision * 100
    : 98.0;
  const fpsValue = backendMetrics.fps ? backendMetrics.fps : 30.0;
  const latencyValue = backendMetrics.latency ? backendMetrics.latency : 18;
  const camCount = backendMetrics.cameraCount ? backendMetrics.cameraCount : 4;

  const figures = [
    {
      index: '1.',
      num: mapValue,
      suffix: '%',
      decimals: 1,
      label: 'mAP50 (CUDA Trained)',
      detail: `Epoch ${backendMetrics.epochs || 40} • ${backendMetrics.checkpoint || 'best.pt'}`
    },
    {
      index: '2.',
      num: ambPrecValue,
      suffix: '%',
      decimals: 1,
      label: 'Ambulance Precision',
      detail: `${backendMetrics.ambulanceRecall ? (backendMetrics.ambulanceRecall * 100).toFixed(1) : '96.9'}% Recall • Emergency verification`
    },
    {
      index: '3.',
      num: fpsValue,
      suffix: '',
      decimals: 1,
      label: 'Inference FPS',
      detail: 'CUDA RTX Tensor Core acceleration'
    },
    {
      index: '4.',
      num: latencyValue,
      suffix: 'ms',
      decimals: 0,
      label: 'Median Pipeline Latency',
      detail: 'End-to-end ByteTrack to Corridor preemption'
    },
    {
      index: '5.',
      num: camCount,
      suffix: '',
      decimals: 0,
      label: 'Monitored Camera Nodes',
      detail: 'Bengaluru arterial junctions active'
    },
    {
      index: '6.',
      num: 100,
      suffix: '%',
      decimals: 0,
      label: 'Forensic Audit Provenance',
      detail: 'Frame-indexed temporal state machines'
    }
  ];

  const cellVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: EASING.editorialEase
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="key-figures"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '72px 20px 100px 20px',
        boxSizing: 'border-box',
        zIndex: 30,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Section Header with white circle bullet matching Palomino */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '48px'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ffffff'
            }}
          />
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
            KEY FIGURES
          </h2>
        </div>

        {/* 3x2 Inset Panel Grid matching Palomino */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {figures.map((item, idx) => (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? undefined : 'hidden'}
              animate={isInView ? 'visible' : 'hidden'}
              variants={cellVariants}
              transition={{ delay: idx * 0.08 }}
              style={{
                backgroundColor: '#000000',
                padding: '48px 36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '16px'
                  }}
                >
                  {item.index}
                </span>
                <div
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: 'clamp(36px, 4.5vw, 68px)',
                    fontWeight: 600,
                    lineHeight: 1.0,
                    letterSpacing: '-0.03em',
                    color: '#ffffff',
                    margin: 0
                  }}
                >
                  <NumericFigure
                    targetNum={item.num}
                    suffix={item.suffix}
                    decimals={item.decimals}
                  />
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <span
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#ffffff',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--pal-font)',
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'rgba(255, 255, 255, 0.45)',
                    display: 'block'
                  }}
                >
                  {item.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
