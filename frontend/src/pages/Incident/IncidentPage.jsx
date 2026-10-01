import React, { useState } from 'react';
import { motion } from 'motion/react';
import PageHero from '../../layout/PageHero';
import { editorialEase } from '../../motion/easing';
import apiClient from '../../data/apiClient';

export default function IncidentPage({
  incidentId = 'INC-CAM-04-LIVE',
  incidents = [],
  onBack,
  onOpenCorridor,
  onRefresh
}) {
  const [authorizing, setAuthorizing] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const incident = incidents.find(i => i.id === incidentId) || incidents[0] || {
    id: 'INC-CAM-04-LIVE',
    camera_id: 'CAM-04',
    title: 'Multi-Vehicle Traffic Collision',
    description: 'Real-time collision verified via trajectory convergence, acute deceleration anomaly, and persistent stoppage on Central Expressway.',
    verification_state: 'CONFIRMED',
    response_state: 'UNACKNOWLEDGED',
    priority_tier: 'P1',
    priority_score: 92.0,
    model_confidence: 0.94,
    evidence_score: 0.88,
    affected_lanes: ['Lane 1', 'Lane 2'],
    created_at: new Date().toISOString()
  };

  const isConfirmed = incident.verification_state === 'CONFIRMED';
  const isDispatched = incident.response_state === 'DISPATCHED';

  // Handle human operator authorization
  const handleAuthorize = async () => {
    setAuthorizing(true);
    try {
      await apiClient.authorizeIncidentDispatch(incident.id, 'Operator OP-KUMAR-7 authorized unit AMB-01 dispatch');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Authorize error:', e);
    } finally {
      setAuthorizing(false);
    }
  };

  // Request AI operator copilot assistance
  const handleRequestAi = async () => {
    setAiLoading(true);
    try {
      const res = await apiClient.requestAiAssist('INCIDENT_BRIEF', incident.id);
      if (res) setAiDraft(res);
    } catch (e) {
      console.error('AI Copilot error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow={`INCIDENT CASE STUDY · ${incident.id}`}
        title={incident.title.toUpperCase()}
        subtitle={`Sensor ${incident.camera_id} · Central Expressway & 4th Cross · Verified ${incident.verification_state} (Priority ${incident.priority_tier} - ${incident.priority_score})`}
        meta={
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            ← BACK TO COMMAND
          </button>
        }
      />

      <div className="page-container" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        
        {/* Hero Media Block (Full width, Cinematic Aspect Ratio) */}
        <div
          style={{
            width: '100%',
            height: 'clamp(400px, 50vh, 700px)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '64px'
          }}
        >
          <video
            src="/api/videos/file/cam04_collision.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 32px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}
          >
            <div>
              <span className="text-micro" style={{ color: 'var(--status-critical)' }}>
                TELEMETRY: IMPACT DETECTED
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>
                Trajectory Conflict Verified on CAM-04 (Lane 1 Blocked)
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>PROVENANCE: INFERENCE</span>
            </div>
          </div>
        </div>

        {/* Section 01: Typographic Verification Timeline (Full Width) */}
        <div style={{ marginBottom: '80px', borderTop: '1px solid var(--border-strong)', paddingTop: '40px' }}>
          <span className="text-micro" style={{ display: 'block', marginBottom: '24px' }}>
            01 / MULTI-STAGE VERIFICATION LIFECYCLE
          </span>

          <div className="grid-12" style={{ textAlign: 'center' }}>
            {[
              { stage: 'OBSERVED', num: '01', desc: '1 Signal: Trajectory Vector Convergence' },
              { stage: 'SUSPECTED', num: '02', desc: '2 Signals: Deceleration Anomaly Measured' },
              { stage: 'VERIFYING', num: '03', desc: '3 Signals: Spatial Overlap & Proximity' },
              { stage: 'CONFIRMED', num: '04', desc: 'Stoppage >2.5s & Evidence Score ≥0.75' }
            ].map((st, i) => {
              const isPastOrCurrent = true;
              return (
                <div
                  key={st.stage}
                  className="col-span-3"
                  style={{
                    borderTop: `2px solid ${st.stage === 'CONFIRMED' ? 'var(--status-critical)' : 'var(--text-primary)'}`,
                    paddingTop: '16px',
                    textAlign: 'left'
                  }}
                >
                  <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                    PHASE {st.num}
                  </span>
                  <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {st.stage}
                  </h4>
                  <p className="text-body" style={{ margin: 0, fontSize: '12px' }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 02: What Happened & Forensic Evidence Details (Editorial Asymmetry) */}
        <div className="grid-12" style={{ marginBottom: '96px', alignItems: 'flex-start' }}>
          <div className="col-span-5">
            <span className="text-micro">02 / SITUATIONAL CHRONOLOGY</span>
            <h2 className="text-heading" style={{ margin: '8px 0 16px 0', textTransform: 'uppercase' }}>
              WHAT HAPPENED
            </h2>
            <p className="text-body-lg" style={{ lineHeight: 1.6 }}>
              {incident.description}
            </p>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><strong>LOCATION:</strong> Central Expressway & 4th Cross (JNC-02)</div>
              <div><strong>AFFECTED LANES:</strong> {incident.affected_lanes?.join(', ') || 'Sector 1 (Left)'}</div>
              <div><strong>DETECTOR CONFIDENCE:</strong> {Math.round(incident.model_confidence * 100)}% (FP16 CUDA)</div>
            </div>
          </div>

          <div className="col-span-7" style={{ paddingLeft: 'clamp(16px, 3vw, 48px)' }}>
            <span className="text-micro">03 / QUANTITATIVE PHYSICAL EVIDENCE</span>
            <hr className="editorial-rule-strong" style={{ margin: '12px 0 24px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Deceleration Anomaly</h4>
                  <span className="text-micro">CONF 0.92</span>
                </div>
                <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                  Peak deceleration rate 19.9 px/frame² measured between V-001 and V-002, matching physical impact criteria.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Persistent Spatial Obstruction</h4>
                  <span className="text-micro">CONF 0.85</span>
                </div>
                <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                  Contact cluster stationary duration reached 3.2s, verifying vehicle immobilization across roadway.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Road Space Corridor Feasibility</h4>
                  <span className="text-micro">CONF 0.95</span>
                </div>
                <p className="text-body" style={{ margin: 0, fontSize: '13px' }}>
                  Dynamic corridor engine confirms 14.0m road width with remaining 7.5m clearance along southern shoulder.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 03: Human Operator Approval & AI Decision Support */}
        <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '64px' }}>
          <div className="grid-12">
            
            {/* Operator Authorization Control */}
            <div className="col-span-6" style={{ paddingRight: '24px' }}>
              <span className="text-micro">04 / DISPATCH AUTHORIZATION</span>
              <h3 style={{ margin: '8px 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
                OPERATOR RESPONSE STATUS
              </h3>
              
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="text-micro">CURRENT STATUS</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: isDispatched ? 'var(--status-confirmed)' : 'var(--status-verifying)' }}>
                    {incident.response_state}
                  </span>
                </div>
                <p className="text-body" style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                  Recommended response: Dispatch Unit AMB-01 from Station 02. Preempt signal JNC-02 along westbound corridor.
                </p>

                <button
                  onClick={handleAuthorize}
                  disabled={authorizing || isDispatched}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isDispatched ? 'transparent' : 'var(--text-primary)',
                    color: isDispatched ? 'var(--status-confirmed)' : 'var(--bg-primary)',
                    border: isDispatched ? '1px solid var(--status-confirmed)' : 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: isDispatched ? 'default' : 'pointer'
                  }}
                >
                  {isDispatched ? '✓ DISPATCH AUTHORIZED BY OPERATOR' : (authorizing ? 'RECORDING AUDIT...' : 'AUTHORIZE DISPATCH & PREEMPTION')}
                </button>
              </div>
            </div>

            {/* AI Decision Support (Strictly Secondary) */}
            <div className="col-span-6">
              <span className="text-micro">05 / AI OPERATOR COPILOT (DECISION SUPPORT)</span>
              <h3 style={{ margin: '8px 0 16px 0', fontSize: '24px', fontWeight: 600 }}>
                SITUATIONAL SYNTHESIS
              </h3>

              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                {aiDraft ? (
                  <div>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      AI DRAFT · PROVENANCE: AI_ASSISTED · STORE=FALSE
                    </span>
                    <p style={{ margin: '12px 0 16px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      {aiDraft.summary}
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      <strong>UNCERTAINTIES:</strong> {aiDraft.uncertainties?.join(', ') || 'Monocular feed cannot determine cabin integrity.'}
                    </div>
                  </div>
                ) : (
                  <p className="text-body" style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                    Request an AI-assisted operational brief synthesized from already-verified backend telemetry and OSRM routing.
                  </p>
                )}

                <button
                  onClick={handleRequestAi}
                  disabled={aiLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: aiLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {aiLoading ? 'SYNTHESIZING BRIEF...' : (aiDraft ? 'RE-SYNTHESIZE BRIEF' : 'GENERATE AI INCIDENT BRIEF')}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
