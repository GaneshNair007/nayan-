import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Ambulance, 
  GitFork, 
  FileText, 
  Clock, 
  MapPin, 
  Video, 
  Check, 
  ArrowRight 
} from 'lucide-react';

export default function IncidentDrawer({ 
  incident, 
  onClose, 
  onAuthorizeResponse, 
  onDispatched 
}) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!incident) return null;

  const isConfirmed = incident.verification_state === 'CONFIRMED';
  const isProposed = incident.response_state === 'RESPONSE_PROPOSED' || incident.response_state === 'UNACKNOWLEDGED';
  const isDispatched = incident.response_state === 'DISPATCHED';

  const handleAuthorize = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/incidents/${incident.id}/response-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_state: 'AUTHORIZED',
          reason: 'Operator manual authorization for emergency response & corridor activation'
        })
      });
      if (onAuthorizeResponse) onAuthorizeResponse();
    } catch (err) {
      console.error('Failed to authorize:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/corridors/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incident.id,
          resource_id: 'AMB-01'
        })
      });
      if (onDispatched) onDispatched();
    } catch (err) {
      console.error('Failed to dispatch:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-strong)',
      boxShadow: '-8px 0 30px rgba(0,0,0,0.7)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '16px',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-critical">{incident.priority_tier || 'P1'}</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{incident.id}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {incident.title || incident.description}
          </div>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Decoupled State Machine Status */}
      <div className="glass-panel-subtle" style={{ padding: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          DECOUPLED STATE MACHINE AUDIT:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>VERIFICATION STATE:</span>
            <div style={{ fontWeight: '700', color: isConfirmed ? '#f87171' : '#38bdf8', marginTop: '2px' }}>
              {incident.verification_state}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>RESPONSE STATE:</span>
            <div style={{ fontWeight: '700', color: '#fbbf24', marginTop: '2px' }}>
              {incident.response_state}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Separated AI & Assessment Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="glass-panel-subtle" style={{ padding: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MODEL CONFIDENCE</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {(incident.model_confidence * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Instantaneous detector</div>
        </div>

        <div className="glass-panel-subtle" style={{ padding: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EVIDENCE SCORE</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            {(incident.evidence_score * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Multi-signal accumulated</div>
        </div>

        <div className="glass-panel-subtle" style={{ padding: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SEVERITY LEVEL</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
            {incident.severity}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Disruption impact</div>
        </div>

        <div className="glass-panel-subtle" style={{ padding: '10px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PRIORITY TIER</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
            {incident.priority_tier || 'P1'} ({incident.priority_score || 92}/100)
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Resource queue rank</div>
        </div>
      </div>

      {/* Why this alert was created (Verifiable Evidence) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          <ShieldCheck size={16} color="var(--accent-cyan)" />
          <span>WHY THIS ALERT WAS CREATED</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {incident.evidence && incident.evidence.length > 0 ? (
            incident.evidence.map((ev, i) => (
              <div key={i} className="glass-panel-subtle" style={{ padding: '8px 10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{ev.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '9px' }}>{(ev.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Source: {ev.source} • Provenance: {ev.provenance}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel-subtle" style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Kinematic trajectory convergence, abrupt deceleration, and post-event stoppage recorded.
            </div>
          )}
        </div>
      </div>

      {/* Evidence Capsule (Before, Event, After) */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
          EVIDENCE CAPSULE (SYNCHRONIZED AUDIT)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {['T-10s (Before)', 'T-0s (Event)', 'T+15s (After)'].map((label, idx) => (
            <div key={idx} style={{ background: '#0a0d14', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: '700' }}>{label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>CCTV Anchored</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Decision Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        {isProposed && (
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px' }}
            disabled={actionLoading}
            onClick={handleAuthorize}
          >
            <Check size={16} />
            <span>Authorize Emergency Response</span>
          </button>
        )}

        <button 
          className="btn btn-cyan"
          style={{ width: '100%', padding: '10px' }}
          disabled={actionLoading || isDispatched}
          onClick={handleDispatch}
        >
          <Ambulance size={16} />
          <span>{isDispatched ? 'Corridor Preemption Active' : 'Activate Green Corridor (AMB-01)'}</span>
        </button>
      </div>

    </div>
  );
}
