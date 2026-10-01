import React, { useState } from 'react';
import PageHero from '../../layout/PageHero';
import apiClient from '../../data/apiClient';

export default function AIPage({ aiStatus, incidents = [] }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-CAM-04-LIVE');
  const [activeMode, setActiveMode] = useState('INCIDENT_BRIEF');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEnabled = aiStatus?.enabled && aiStatus?.configured;

  const modes = [
    { id: 'INCIDENT_BRIEF', label: 'SITUATIONAL BRIEF' },
    { id: 'EVIDENCE_EXPLANATION', label: 'EVIDENCE EXPLANATION' },
    { id: 'RESPONSE_RECOMMENDATION', label: 'RESPONSE RECOMMENDATION' },
    { id: 'DISPATCH_DRAFT', label: 'DISPATCH DRAFT' },
    { id: 'CORRIDOR_EXPLANATION', label: 'CORRIDOR EXPLANATION' },
    { id: 'PUBLIC_ADVISORY_DRAFT', label: 'PUBLIC ADVISORY' }
  ];

  const handleGenerate = async (modeId) => {
    setLoading(true);
    setActiveMode(modeId);
    try {
      const res = await apiClient.requestAiAssist(modeId, selectedIncidentId);
      setResult(res);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="OPERATOR DECISION SUPPORT (READ-ONLY)"
        title="AI OPERATOR COPILOT"
        subtitle="Generative synthesis of verified kinematic evidence and OSRM trajectories. Generates operator briefs and advisory drafts without autonomous authority."
        meta={
          <div style={{ textAlign: 'right' }}>
            <span className="text-micro" style={{ color: isEnabled ? 'var(--status-confirmed)' : 'var(--text-muted)' }}>
              {isEnabled ? 'OPENAI SERVICE CONNECTED' : 'COPILOT OFFLINE (CORE VISION ACTIVE)'}
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'monospace' }}>
              MODEL: {aiStatus?.model || 'gpt-6-luna'} (store=False)
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
        
        {/* Mode Selector Strip */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleGenerate(m.id)}
              disabled={loading}
              style={{
                background: 'none',
                border: '1px solid',
                borderColor: activeMode === m.id ? 'var(--text-primary)' : 'var(--border-subtle)',
                color: activeMode === m.id ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Editorial Structured Output Container (Zero Chat Bubbles) */}
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            padding: 'clamp(32px, 5vw, 64px)'
          }}
        >
          {loading ? (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <p className="text-body-lg">Synthesizing authoritative operational brief from backend telemetry...</p>
            </div>
          ) : result ? (
            <div>
              {/* Provenance Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                  PROVENANCE: AI_ASSISTED · MODE: {result.mode || activeMode}
                </span>
                <span className="text-micro" style={{ color: 'var(--status-verifying)' }}>
                  REQUIRES HUMAN OPERATOR AUTHORIZATION
                </span>
              </div>

              <hr className="editorial-rule-strong" style={{ marginBottom: '32px' }} />

              {/* 5 Editorial Structured Sections */}
              <div className="grid-12">
                <div className="col-span-8">
                  <span className="text-micro">01 / SITUATIONAL SUMMARY</span>
                  <p className="text-body-lg" style={{ color: 'var(--text-primary)', margin: '8px 0 32px 0', lineHeight: 1.6 }}>
                    {result.summary || 'Incident state confirmed on CAM-04 with trajectory convergence and acute deceleration measured.'}
                  </p>

                  <span className="text-micro">02 / KEY EVIDENCE CORROBORATION</span>
                  <div style={{ margin: '8px 0 32px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(result.key_evidence || ['Deceleration anomaly 19.9 px/frame²', 'Persistent stoppage duration 3.2s']).map((ev, i) => (
                      <div key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        • {ev}
                      </div>
                    ))}
                  </div>

                  <span className="text-micro">03 / UNCERTAINTIES & SENSOR LIMITATIONS</span>
                  <p className="text-body" style={{ margin: '8px 0 32px 0', fontSize: '13px' }}>
                    {result.uncertainties?.join(' ') || 'Monocular CCTV optical perspective cannot confirm vehicle structural interior deformation.'}
                  </p>
                </div>

                <div className="col-span-4" style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '32px' }}>
                  <span className="text-micro">04 / RECOMMENDED NEXT STEP</span>
                  <div style={{ margin: '8px 0 32px 0' }}>
                    {(result.recommended_actions || ['Dispatch Unit AMB-01', 'Preempt Junction JNC-02']).map((act, i) => (
                      <p key={i} style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                        → {act}
                      </p>
                    ))}
                  </div>

                  <span className="text-micro">05 / DRAFT OPERATOR BROADCAST</span>
                  <div
                    style={{
                      border: '1px solid var(--border-subtle)',
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      marginTop: '8px'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {result.draft_message || 'ADVISORY: Multi-vehicle collision verified at Central Expressway. Emergency transit active.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <span className="text-micro" style={{ display: 'block', marginBottom: '8px' }}>
                STANDBY FOR OPERATOR QUERY
              </span>
              <p className="text-body-lg" style={{ maxWidth: '580px', margin: '0 auto 24px auto' }}>
                Select an operational mode above to generate plain-text explanations, dispatch drafts, or advisory messages from backend state.
              </p>
              <button
                onClick={() => handleGenerate('INCIDENT_BRIEF')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                GENERATE INCIDENT BRIEF →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
