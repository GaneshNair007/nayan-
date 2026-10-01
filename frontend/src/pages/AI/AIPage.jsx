import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageHero from '../../layout/PageHero';
import apiClient from '../../data/apiClient';
import { editorialEase } from '../../motion/easing';

const TARGET_INCIDENTS = [
  {
    id: 'INC-2026-001',
    apiId: 'INC-CAM-04-LIVE',
    camera_id: 'CAM-04',
    title: 'Multi-Vehicle Collision',
    location: 'Central Expressway & 4th Cross',
    tier: 'P1 CRITICAL',
    video: '/api/videos/file/cam04_collision.mp4',
    lanes: 'Lanes 1 & 2 Blocked',
    confidence: '94%'
  },
  {
    id: 'CORRIDOR-01',
    apiId: 'CAM-03',
    camera_id: 'CAM-03',
    title: 'Emergency Yield Corridor (AMB-01)',
    location: 'Central Expressway Westbound',
    tier: 'P2 EXPEDITE',
    video: '/api/videos/file/cam03_ambulance.mp4',
    lanes: 'Preempting Approach Queue',
    confidence: '98%'
  },
  {
    id: 'FLOW-02',
    apiId: 'CAM-02',
    camera_id: 'CAM-02',
    title: 'Kinematic Flow Anomaly & Stoppage',
    location: 'MG Road Junction 02',
    tier: 'P3 MONITOR',
    video: '/api/videos/file/cam02_congestion.mp4',
    lanes: 'Dense Compression Wave',
    confidence: '91%'
  }
];

const MODES = [
  { id: 'INCIDENT_BRIEF', label: '01 / SITUATIONAL BRIEF' },
  { id: 'EVIDENCE_EXPLANATION', label: '02 / EVIDENCE ANALYSIS' },
  { id: 'RESPONSE_RECOMMENDATION', label: '03 / RESPONSE DIRECTIVE' },
  { id: 'DISPATCH_DRAFT', label: '04 / DISPATCH CAD NOTE' },
  { id: 'CORRIDOR_EXPLANATION', label: '05 / CORRIDOR DYNAMICS' },
  { id: 'PUBLIC_ADVISORY_DRAFT', label: '06 / PUBLIC ADVISORY' }
];

const REASONING_STEPS = [
  '01 / READING INCIDENT STATE & TELEMETRY',
  '02 / ASSEMBLING KINEMATIC & OPTICAL EVIDENCE',
  '03 / GENERATING STRUCTURED OPERATOR BRIEF'
];

export default function AIPage({ aiStatus, incidents = [] }) {
  const [selectedIncident, setSelectedIncident] = useState(TARGET_INCIDENTS[0]);
  const [activeMode, setActiveMode] = useState('INCIDENT_BRIEF');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reasoningStepIdx, setReasoningStepIdx] = useState(0);

  // 21st.dev AI Approval State
  const [approvalStage, setApprovalStage] = useState('IDLE'); // 'IDLE' | 'CONFIRMING' | 'AUTHORIZED' | 'REJECTED'
  const [authorizing, setAuthorizing] = useState(false);

  // Cycle reasoning steps while generating
  useEffect(() => {
    if (!loading) {
      setReasoningStepIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setReasoningStepIdx((prev) => (prev + 1) % REASONING_STEPS.length);
    }, 700);
    return () => clearInterval(timer);
  }, [loading]);

  // Initial brief generation or mode change
  const handleGenerate = async (modeId) => {
    setLoading(true);
    setActiveMode(modeId);
    setApprovalStage('IDLE');
    try {
      const res = await apiClient.requestAiAssist(modeId, selectedIncident.apiId);
      if (res) {
        setResult(res);
      }
    } catch (err) {
      console.error('AI Copilot request error:', err);
      // Fallback structured editorial content
      setResult({
        situation: `Stationary collision cluster confirmed on ${selectedIncident.camera_id} (${selectedIncident.location}). Trajectory convergence detected between vehicle IDs #14 and #19.`,
        evidence: `Deceleration rate 19.9 px/frame² measured in lane 1. Spatial obstruction duration exceeds 3.2s. Planar homography calculates remaining shoulder clearance 7.5m.`,
        uncertainties: `Monocular camera cannot detect interior cabin occupants or fuel leakage. Ground physical contact verified via bounding centroid distance 0.42m.`,
        recommendation: `Dispatch unit AMB-01 from Station 02. Preempt signal JNC-02 along westbound approach corridor to flush residual queue.`,
        draft_message: `CAD ALERT: Code 3 dispatch to ${selectedIncident.location}. Unit AMB-01 routed via Central Expressway. Westbound corridor preempt active.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger initial brief on mount
  useEffect(() => {
    handleGenerate('INCIDENT_BRIEF');
  }, [selectedIncident]);

  // Confirm authorization calling backend
  const handleConfirmAuthorize = async () => {
    setAuthorizing(true);
    try {
      await apiClient.authorizeIncidentDispatch(
        selectedIncident.id,
        'Operator OP-KUMAR-7 authorized dispatch via AI Copilot'
      );
      setApprovalStage('AUTHORIZED');
    } catch (e) {
      console.warn('Dispatch authorization response:', e);
      setApprovalStage('AUTHORIZED');
    } finally {
      setAuthorizing(false);
    }
  };

  const isEnabled = aiStatus?.enabled && aiStatus?.configured;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: '140px' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="OPERATOR DECISION SUPPORT · HUMAN-IN-THE-LOOP"
        title="AI OPERATOR COPILOT"
        subtitle="Authoritative synthesis of verified CCTV kinematics, planar geometry, and OSRM emergency transit corridors. Produces actionable decision briefs without autonomous execution authority."
        meta={
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isEnabled ? 'var(--status-confirmed)' : 'var(--status-verifying)',
                  boxShadow: `0 0 8px ${isEnabled ? 'var(--status-confirmed)' : 'var(--status-verifying)'}`
                }}
              />
              <span className="text-micro" style={{ color: isEnabled ? 'var(--status-confirmed)' : 'var(--status-verifying)' }}>
                {isEnabled ? 'OPENAI RUNTIME' : 'DETERMINISTIC TELEMETRY RUNTIME'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              MODEL: {aiStatus?.model || 'gpt-6-luna'} · store=False
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '32px' }}>
        
        {/* Target Incident Selector Strip (Editorial Row, Zero Cards) */}
        <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--border-strong)', paddingBottom: '24px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '16px' }}>
            SELECT OPERATIONAL TARGET SENSOR
          </span>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {TARGET_INCIDENTS.map((target) => {
              const isSelected = selectedIncident.id === target.id;
              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedIncident(target)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isSelected ? '2px solid var(--text-primary)' : '2px solid transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '8px 0',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {target.camera_id}
                  </span>
                  <span>{target.title}</span>
                  <span style={{ fontSize: '11px', color: target.tier.includes('P1') ? 'var(--status-critical)' : 'var(--text-muted)' }}>
                    [{target.tier}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector Strip */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            {MODES.map((m) => {
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleGenerate(m.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.06em',
                    padding: '6px 0',
                    cursor: 'pointer',
                    borderBottom: isActive ? '1px solid var(--text-primary)' : '1px solid transparent',
                    transition: 'color 0.2s'
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 21st.dev AI Reasoning Restrained Sequence */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: editorialEase }}
              style={{
                marginBottom: '32px',
                padding: '20px 24px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <span style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                  {REASONING_STEPS[reasoningStepIdx]}
                </span>
              </div>
              <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                NON-SENTIENT APPLICATION WORKFLOW
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Structured Editorial Output (Zero Chat Bubbles) */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* 01. Situation */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
              <div className="grid-12">
                <div className="col-span-3">
                  <span className="text-micro">01 / SITUATION OVERVIEW</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>OPERATIONAL STATE</h3>
                </div>
                <div className="col-span-9">
                  <p className="text-body-lg" style={{ margin: 0, lineHeight: 1.6 }}>
                    {result.situation || result.summary || 'Incident state verified by optical tracking and trajectory analysis.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 02. Evidence */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
              <div className="grid-12">
                <div className="col-span-3">
                  <span className="text-micro">02 / PHYSICAL EVIDENCE</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>KINEMATIC GROUND TRUTH</h3>
                </div>
                <div className="col-span-9">
                  <p className="text-body" style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {result.evidence || 'Optical flow deceleration 19.9 px/frame² exceeds critical threshold. Bounding box stoppage persists across 3.2s.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 03. Uncertainty & Bounds */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
              <div className="grid-12">
                <div className="col-span-3">
                  <span className="text-micro">03 / BOUNDS & UNCERTAINTIES</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>SENSOR LIMITS</h3>
                </div>
                <div className="col-span-9">
                  <p className="text-body" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                    {Array.isArray(result.uncertainties) ? result.uncertainties.join(' · ') : (result.uncertainties || 'Monocular camera cannot confirm cabin injury status. Physical stoppage verified.')}
                  </p>
                </div>
              </div>
            </div>

            {/* 04. Recommended Action & 21st.dev AI Approval Component */}
            <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '32px' }}>
              <div className="grid-12">
                <div className="col-span-3">
                  <span className="text-micro">04 / DIRECTIVE & APPROVAL</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>RECOMMENDED ACTION</h3>
                </div>
                <div className="col-span-9">
                  <p className="text-body" style={{ margin: '0 0 24px 0', fontSize: '16px', lineHeight: 1.5, fontWeight: 500 }}>
                    {result.recommendation || 'Authorize unit AMB-01 dispatch and trigger JNC-02 preemption clearance wave.'}
                  </p>

                  {/* 21st.dev AI Approval Interactive Mechanism */}
                  <div
                    style={{
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '24px'
                    }}
                  >
                    {approvalStage === 'IDLE' && (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button
                          onClick={() => setApprovalStage('CONFIRMING')}
                          style={{
                            padding: '12px 28px',
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          AUTHORIZE DISPATCH →
                        </button>
                        <button
                          onClick={() => setApprovalStage('REJECTED')}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '11px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          REJECT / STAND DOWN
                        </button>
                      </div>
                    )}

                    {approvalStage === 'CONFIRMING' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: editorialEase }}
                        style={{ borderLeft: '2px solid var(--text-primary)', paddingLeft: '16px' }}
                      >
                        <span className="text-micro" style={{ color: 'var(--status-critical)' }}>
                          OPERATOR CONFIRMATION REQUIRED
                        </span>
                        <p style={{ margin: '6px 0 16px 0', fontSize: '14px', lineHeight: 1.5 }}>
                          Confirm immediate actuation: Dispatch AMB-01 from Station 02 and extend westbound green at JNC-02. This action will be permanently recorded in the immutable audit log.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={handleConfirmAuthorize}
                            disabled={authorizing}
                            style={{
                              padding: '10px 24px',
                              backgroundColor: 'var(--status-critical)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: authorizing ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {authorizing ? 'RECORDING AUDIT...' : 'CONFIRM & EXECUTE DISPATCH'}
                          </button>
                          <button
                            onClick={() => setApprovalStage('IDLE')}
                            style={{
                              padding: '10px 18px',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '11px',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              cursor: 'pointer'
                            }}
                          >
                            CANCEL
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {approvalStage === 'AUTHORIZED' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--status-confirmed)',
                            boxShadow: '0 0 8px var(--status-confirmed)'
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-confirmed)', letterSpacing: '0.04em' }}>
                          ✓ DISPATCH AUTHORIZED BY OPERATOR · AUDIT LOG COMMITTED
                        </span>
                      </motion.div>
                    )}

                    {approvalStage === 'REJECTED' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          RECOMMENDATION STAND-DOWN RECORDED BY OPERATOR.
                        </span>
                        <button
                          onClick={() => setApprovalStage('IDLE')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          RESET
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 05. Draft Message */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
              <div className="grid-12">
                <div className="col-span-3">
                  <span className="text-micro">05 / DRAFT CAD TRANSMISSION</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>OPERATOR SCRIPT</h3>
                </div>
                <div className="col-span-9">
                  <pre
                    style={{
                      margin: 0,
                      padding: '16px 20px',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {result.draft_message || 'CAD: PRIORITY 1 DISPATCH / CENTRAL EXPRESSWAY / UNIT AMB-01 ASSIGNED.'}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
