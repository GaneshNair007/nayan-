import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  SendHorizontal, 
  Radio, 
  Ambulance, 
  Check, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

const ANALYSIS_STAGES = [
  'READING AUTHORITATIVE EVIDENCE',
  'CHECKING RESPONSE STATE',
  'ASSEMBLING OPERATOR BRIEF'
];

export default function AIOperatorPanel({ 
  incident, 
  onAuthorizeDispatch, 
  isDispatched = false 
}) {
  const [activeMode, setActiveMode] = useState('INCIDENT_BRIEF');
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [aiResponse, setAiResponse] = useState(null);
  const [errorState, setErrorState] = useState(null); // { type: 'RATE_LIMITED'|'AUTH_ERROR'|'MODEL_UNAVAILABLE'|'CONTEXT_ERROR'|'UNAVAILABLE', message: '' }
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiStatus, setAiStatus] = useState(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Fetch AI status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then(r => r.json())
      .then(data => setAiStatus(data))
      .catch(() => setAiStatus({ configured: false, available: false }));
  }, []);

  // Rotate loading stages
  useEffect(() => {
    if (!loading) {
      setStageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIdx(prev => (prev + 1) % ANALYSIS_STAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

  const handleRequestAssistance = useCallback(async (mode, question = null) => {
    if (!incident?.id) return;
    setLoading(true);
    setErrorState(null);
    setAuthError(null);
    setActiveMode(mode);

    try {
      const payload = {
        mode,
        incident_id: incident.id,
        operator: 'OPERATOR-01'
      };
      if (question) {
        payload.operator_question = question;
      }

      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 429) {
        setErrorState({ type: 'RATE_LIMITED', message: 'OpenAI API rate limit encountered. Throttling active.' });
        return;
      }
      if (res.status === 401) {
        setErrorState({ type: 'AUTH_ERROR', message: 'OpenAI authentication failed. Verify server-side OPENAI_API_KEY.' });
        return;
      }
      if (res.status === 404) {
        setErrorState({ type: 'CONTEXT_ERROR', message: `Incident entity '${incident.id}' not found in backend database.` });
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.ai_available === false) {
        setErrorState({ type: 'UNAVAILABLE', message: data.error || 'AI Copilot decision support temporarily unavailable.' });
        if (data.fallback_context) {
          setAiResponse({
            mode,
            model: 'DETERMINISTIC_FALLBACK',
            summary: data.fallback_context.summary,
            key_evidence: [
              `Verification State: ${data.fallback_context.verification_state}`,
              `Priority Tier: ${data.fallback_context.priority_tier}`
            ],
            recommended_actions: ['Operator manual visual verification required before taking action.'],
            uncertainties: ['OpenAI Responses API offline; displaying deterministic backend telemetry.'],
            requires_operator_approval: true
          });
        }
      } else {
        setAiResponse(data);
      }
    } catch (err) {
      setErrorState({ type: 'UNAVAILABLE', message: err.message || 'Network error reaching AI assistant service.' });
    } finally {
      setLoading(false);
    }
  }, [incident?.id]);

  // Request initial brief when incident changes
  useEffect(() => {
    if (incident?.id) {
      setAuthSuccess(false);
      setAuthError(null);
      handleRequestAssistance('INCIDENT_BRIEF');
    } else {
      setAiResponse(null);
    }
  }, [incident?.id, handleRequestAssistance]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;
    handleRequestAssistance('TECHNICAL_EXPLANATION', customQuestion.trim());
    setCustomQuestion('');
  };

  // Authoritative human approval action that calls backend dispatch
  const handleApproveAction = async () => {
    if (!incident?.id || isDispatched || authorizing) return;
    setAuthorizing(true);
    setAuthError(null);

    try {
      // 1. Authorize Response State in Backend
      const authRes = await fetch(`/api/incidents/${incident.id}/authorize-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!authRes.ok) {
        const err = await authRes.json().catch(() => ({}));
        throw new Error(err.detail || `State transition failed (HTTP ${authRes.status})`);
      }

      // 2. Execute Emergency Dispatch with deterministic resource ranking
      const dispRes = await fetch(`/api/incidents/${incident.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!dispRes.ok) {
        const err = await dispRes.json().catch(() => ({}));
        throw new Error(err.detail || `Corridor dispatch failed (HTTP ${dispRes.status})`);
      }

      const dispData = await dispRes.json();
      setAuthSuccess(true);
      if (onAuthorizeDispatch) {
        onAuthorizeDispatch(dispData);
      }
    } catch (err) {
      setAuthError(err.message || 'Authorization rejected by backend.');
    } finally {
      setAuthorizing(false);
    }
  };

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Bot size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', color: '#cbd5e1' }}>
          AI OPERATOR COPILOT (IDLE)
        </div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>
          Select an active incident in the queue to synthesize operational evidence.
        </div>
      </div>
    );
  }

  const evidenceCount = incident.evidence?.length || 0;
  const coverageLabel = evidenceCount >= 2 ? 'COMPLETE' : 'PARTIAL';

  return (
    <div 
      className="glass-panel" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        padding: '16px',
        backgroundColor: '#0a0d14',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', color: '#fff' }}>
            NAYAN COPILOT
          </span>
          <span 
            className="badge" 
            style={{ 
              fontSize: '9px', 
              backgroundColor: aiStatus?.configured ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              color: aiStatus?.configured ? '#34d399' : '#fbbf24',
              border: `1px solid ${aiStatus?.configured ? 'rgba(52, 211, 153, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`
            }}
          >
            {aiStatus?.configured ? (aiStatus.model || 'OPENAI') : 'OFFLINE FALLBACK'}
          </span>
        </div>

        {/* Deterministic Grounding Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--pal-mono)' }}>
          <ShieldCheck size={12} color="var(--accent-cyan)" />
          <span>COVERAGE: {coverageLabel} ({evidenceCount} ITEMS)</span>
        </div>
      </div>

      {/* Contextual Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {[
          { id: 'INCIDENT_BRIEF', label: 'SUMMARIZE' },
          { id: 'EVIDENCE_EXPLANATION', label: 'WHY THIS ALERT?' },
          { id: 'RESPONSE_RECOMMENDATION', label: 'RECOMMEND RESPONSE' },
          { id: 'DISPATCH_DRAFT', label: 'DRAFT DISPATCH' },
          { id: 'CORRIDOR_EXPLANATION', label: 'EXPLAIN CORRIDOR' },
          { id: 'PUBLIC_ADVISORY_DRAFT', label: 'DRAFT PUBLIC NOTICE' }
        ].map(btn => (
          <button
            key={btn.id}
            type="button"
            disabled={loading}
            onClick={() => handleRequestAssistance(btn.id)}
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: activeMode === btn.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeMode === btn.id ? '#000' : '#fff',
              border: activeMode === btn.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
              transition: 'all 0.15s ease'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Loading Indicator with Truthful Stages */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px 0', color: 'var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={18} className="spin-animation" />
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em' }}>
              GENERATING ANALYSIS...
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--pal-mono)' }}>
            STAGE: {ANALYSIS_STAGES[stageIdx]}
          </span>
        </div>
      )}

      {/* Specific Error Notice Banner */}
      {errorState && !loading && (
        <div style={{ 
          padding: '10px 12px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.35)', 
          borderRadius: '6px', 
          fontSize: '11px', 
          color: '#fca5a5' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '2px' }}>
            <AlertTriangle size={14} />
            <span>STATE: {errorState.type}</span>
          </div>
          <div>{errorState.message}</div>
        </div>
      )}

      {/* Backend Authorization Error Notice */}
      {authError && (
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', fontSize: '11px', color: '#fca5a5' }}>
          <strong>Authorization Rejection:</strong> {authError}
        </div>
      )}

      {/* Structured Output Sections */}
      {aiResponse && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Situation Summary */}
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
                SITUATION ({aiResponse.mode})
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--pal-mono)' }}>
                PROVENANCE: {aiResponse.provenance || 'AI_ASSISTED'}
              </span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '18px', color: '#f1f5f9' }}>
              {aiResponse.summary || 'Operational situation synthesized from backend telemetry.'}
            </div>
          </div>

          {/* Traceable Evidence */}
          {aiResponse.key_evidence && aiResponse.key_evidence.length > 0 && (
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.08em', marginBottom: '6px' }}>
                CONFIRMED EVIDENCE & SENSOR ANCHORS
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {aiResponse.key_evidence.map((ev, idx) => (
                  <li key={idx} style={{ lineHeight: '16px' }}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Uncertainties & Limitations */}
          {aiResponse.uncertainties && aiResponse.uncertainties.length > 0 && (
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#fbbf24', letterSpacing: '0.08em', marginBottom: '4px' }}>
                <AlertTriangle size={12} />
                <span>UNCERTAINTY & SENSOR BOUNDS</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#fde68a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {aiResponse.uncertainties.map((un, idx) => (
                  <li key={idx} style={{ lineHeight: '16px' }}>{un}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Next Actions */}
          {aiResponse.recommended_actions && aiResponse.recommended_actions.length > 0 && (
            <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#34d399', letterSpacing: '0.08em', marginBottom: '6px' }}>
                RECOMMENDED OPERATOR STEPS
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#a7f3d0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {aiResponse.recommended_actions.map((act, idx) => (
                  <li key={idx} style={{ lineHeight: '16px' }}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Draft Transmission / Public Notice */}
          {aiResponse.draft_message && (
            <div style={{ backgroundColor: '#05070a', padding: '10px', borderRadius: '6px', border: '1px dashed rgba(0, 240, 255, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  DRAFT TRANSMISSION (REQUIRES OPERATOR APPROVAL)
                </span>
                <Radio size={12} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', color: '#93c5fd', whiteSpace: 'pre-wrap', lineHeight: '16px' }}>
                {aiResponse.draft_message}
              </div>
            </div>
          )}

          {/* Real Operator Authorization Flow */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>STATE: OPERATOR AUTHORIZATION REQUIRED</span>
              <span>SAFETY INVARIANT ENFORCED</span>
            </div>
            
            <button
              type="button"
              onClick={handleApproveAction}
              disabled={isDispatched || authSuccess || authorizing}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: (isDispatched || authSuccess) ? '#065f46' : 'var(--accent-cyan)',
                color: (isDispatched || authSuccess) ? '#a7f3d0' : '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '11px',
                letterSpacing: '0.06em',
                cursor: (isDispatched || authSuccess || authorizing) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              {authorizing ? (
                <>
                  <Loader2 size={14} className="spin-animation" />
                  <span>TRANSMITTING AUTHORIZATION TO BACKEND...</span>
                </>
              ) : (isDispatched || authSuccess) ? (
                <>
                  <Check size={14} />
                  <span>EMERGENCY RESPONSE & CORRIDOR AUTHORIZED</span>
                </>
              ) : (
                <>
                  <Ambulance size={14} />
                  <span>AUTHORIZE PROPOSED EMERGENCY RESPONSE</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Contextual Inquiry Input */}
      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <input 
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask copilot about this incident..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '4px',
            padding: '8px 10px',
            fontSize: '11px',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!customQuestion.trim() || loading}
          style={{
            padding: '8px 12px',
            backgroundColor: customQuestion.trim() ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
            color: customQuestion.trim() ? '#000' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '4px',
            cursor: customQuestion.trim() ? 'pointer' : 'default'
          }}
        >
          <SendHorizontal size={14} />
        </button>
      </form>

    </div>
  );
}
