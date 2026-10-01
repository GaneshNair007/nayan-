import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { editorialEase } from '../motion/easing';
import apiClient from '../data/apiClient';

export default function ScenarioDrawer({
  isOpen,
  onClose,
  onScenarioTriggered,
  onResetTriggered
}) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'golden',
      number: '01',
      title: 'MULTI-VEHICLE COLLISION',
      camId: 'CAM-04',
      description: 'Vehicular trajectory convergence, acute deceleration anomaly, and persistent stoppage on Central Expressway.',
      actionLabel: 'RUN COLLISION SCENARIO'
    },
    {
      id: 'crowd',
      number: '02',
      title: 'PEDESTRIAN CROWD SURGE',
      camId: 'CAM-07',
      description: 'Abnormal pedestrian concentration, directional turbulence, and rapid density growth rate exceeding 15%/s.',
      actionLabel: 'RUN CROWD SCENARIO'
    },
    {
      id: 'baggage',
      number: '03',
      title: 'UNATTENDED LUGGAGE ANOMALY',
      camId: 'CAM-11',
      description: 'Stationary luggage detected with associated owner departure beyond safe spatial threshold (>4.0s).',
      actionLabel: 'RUN BAGGAGE SCENARIO'
    }
  ];

  const handleRun = async (scenario) => {
    setLoading(true);
    setActiveScenario(scenario.id);
    try {
      await apiClient.runScenario(scenario.id);
      if (onScenarioTriggered) onScenarioTriggered(scenario);
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Scenario error:', err);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await apiClient.resetDemo();
      if (onResetTriggered) onResetTriggered();
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Reset error:', err);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.45, ease: editorialEase }}
          style={{
            width: 'clamp(360px, 32vw, 540px)',
            height: '100%',
            backgroundColor: '#0a0a0c',
            borderLeft: '1px solid var(--border-subtle)',
            padding: 'var(--gutter)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <span className="text-micro" style={{ display: 'block', marginBottom: '4px' }}>
                DEMO ORCHESTRATION
              </span>
              <h2 className="text-heading" style={{ margin: 0, textTransform: 'uppercase' }}>
                SCENARIOS
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              CLOSE ✕
            </button>
          </div>

          <p className="text-body" style={{ margin: '0 0 32px 0' }}>
            Select an operational incident scenario to stream curated surveillance feeds through the CUDA-accelerated perception and temporal evidence pipeline.
          </p>

          {/* Scenario List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span className="text-micro">{sc.number} / {sc.camId}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CCTV FEED</span>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {sc.title}
                </h3>
                
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sc.description}
                </p>

                <button
                  onClick={() => handleRun(sc)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: activeScenario === sc.id ? 'var(--text-primary)' : 'transparent',
                    color: activeScenario === sc.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeScenario !== sc.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 243, 238, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeScenario !== sc.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {loading && activeScenario === sc.id ? 'TRIGGERING INFERENCE...' : sc.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Reset Action */}
          <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
            <hr className="editorial-rule" style={{ marginBottom: '20px' }} />
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--status-critical)';
                e.currentTarget.style.color = 'var(--status-critical)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              RESET TELEMETRY & CLEAR INCIDENTS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
