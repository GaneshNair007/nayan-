import React from 'react';
import { motion } from 'motion/react';
import LetterSwapLink from './LetterSwapLink';
import { ArrowUpRight, ShieldCheck, Activity, Terminal } from 'lucide-react';

/**
 * 21st.dev Motion Footer (Curtain Reveal Pattern)
 * Sits in the DOM with oversized masked NAYAN typography, technology strip,
 * and kinetic Letter Swap navigation.
 */
export default function MotionFooter({
  onNavigateTab,
  onOpenSystemDrawer,
  onOpenScenarioDrawer
}) {
  return (
    <footer
      style={{
        position: 'relative',
        backgroundColor: '#050507',
        borderTop: '1px solid var(--border-strong)',
        color: 'var(--text-primary)',
        paddingTop: '80px',
        paddingBottom: '60px',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Top Grid: Editorial Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '48px',
            marginBottom: '80px'
          }}
        >
          {/* Col 1: Brand & Purpose */}
          <div>
            <span className="text-micro" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              AUTONOMOUS URBAN MOBILITY
            </span>
            <h4 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>
              NAYAN CORE
            </h4>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
              Zero-hardcoding computer vision platform. Monocular video feeds, temporal kinematic verification,
              and adaptive traffic preemption running on NVIDIA CUDA.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                RTX 4050 CUDA:0 ACTIVE
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links (Letter Swap) */}
          <div>
            <span className="text-micro" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
              INTELLIGENCE SURFACES
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('command-center')}>
                Command Center
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('camera-intel')}>
                Optical Sensor Registry
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('traffic')}>
                Signals & Junction Network
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('corridor')}>
                Emergency Preemption Corridor
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('digital-twin')}>
                Digital Twin Comparison
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('audit')}>
                Chronological Audit Trail
              </LetterSwapLink>
              <LetterSwapLink onClick={() => onNavigateTab && onNavigateTab('ai-copilot')}>
                AI Operator Copilot
              </LetterSwapLink>
            </div>
          </div>

          {/* Col 3: Diagnostics & Drawers */}
          <div>
            <span className="text-micro" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
              OPERATOR TOOLS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <LetterSwapLink onClick={onOpenSystemDrawer}>
                Hardware & System Telemetry
              </LetterSwapLink>
              <LetterSwapLink onClick={onOpenScenarioDrawer}>
                Scenario Simulation Controls
              </LetterSwapLink>
              <LetterSwapLink onClick={() => window.open('/docs', '_blank')}>
                FastAPI OpenAPI Documentation
              </LetterSwapLink>
              <LetterSwapLink onClick={() => window.open('https://github.com/GaneshNair007/nayan-', '_blank')}>
                GitHub Repository (Branch: backend)
              </LetterSwapLink>
            </div>
          </div>

          {/* Col 4: Primary CTA Button */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <span className="text-micro" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
              DEPLOYED AT
            </span>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              BANGALORE ARTERIAL GRID (JNC-01 TO JNC-03)<br />
              12.9716° N, 77.5946° E
            </p>
            <button
              onClick={() => onNavigateTab && onNavigateTab('command-center')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                border: '1px solid var(--text-primary)',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                fontSize: '11px',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Oversized Masked NAYAN Wordmark */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '32px'
          }}
        >
          <div
            style={{
              fontSize: 'clamp(72px, 19vw, 280px)',
              fontWeight: 800,
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
              color: 'rgba(255, 255, 255, 0.05)',
              textAlign: 'center',
              userSelect: 'none',
              fontFamily: 'sans-serif'
            }}
          >
            NAYAN
          </div>
        </div>

        {/* Bottom Rule & Metadata */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            © 2026 NAYAN INTELLIGENCE · HACKATHON PRODUCTION BUILD
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            PALOMINO EDITORIAL ARCHITECTURE × 21ST.DEV MOTION
          </span>
        </div>

      </div>
    </footer>
  );
}
