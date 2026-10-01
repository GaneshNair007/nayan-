import React, { useState } from 'react';
import PageHero from '../../layout/PageHero';

export default function AuditPage({ auditEvents = [] }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const defaultAudits = auditEvents.length > 0 ? auditEvents : [
    {
      id: 'audit-001',
      timestamp: new Date().toISOString(),
      actor: 'SYSTEM_CV',
      action: 'Multi-Signal Temporal Verification: OBSERVED → CONFIRMED',
      entityType: 'INCIDENT',
      entityId: 'INC-CAM-04-LIVE',
      provenance: 'INFERENCE',
      reason: 'Convergence rate 19.9 px/frame and deceleration anomaly 6.2 px/frame² verified by EvidenceEngine.'
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 35000).toISOString(),
      actor: 'OP-KUMAR-7',
      action: 'Authorized Emergency Corridor Preemption on JNC-02',
      entityType: 'CORRIDOR',
      entityId: 'CORR-CENTRAL-01',
      provenance: 'USER_INPUT',
      reason: 'Operator approved green wave dispatch for incoming unit AMB-01.'
    },
    {
      id: 'audit-003',
      timestamp: new Date(Date.now() - 72000).toISOString(),
      actor: 'AI_ASSISTANT',
      action: 'Generated Situational Incident Brief (INCIDENT_BRIEF)',
      entityType: 'INCIDENT',
      entityId: 'INC-CAM-04-LIVE',
      provenance: 'AI_ASSISTED',
      reason: 'Synthesized plain-text operational summary from verified kinematic telemetry (store=False).'
    },
    {
      id: 'audit-004',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      actor: 'SYSTEM_ROUTING',
      action: 'Computed Deterministic OSRM Ambulance Trajectory',
      entityType: 'RESOURCE',
      entityId: 'AMB-01',
      provenance: 'EXTERNAL_ROUTING',
      reason: '1660.1m path computed in 185.3s from Station 02 to Central Expressway.'
    }
  ];

  const filters = ['ALL', 'INFERENCE', 'USER_INPUT', 'AI_ASSISTED', 'EXTERNAL_ROUTING'];

  const filteredEvents = activeFilter === 'ALL'
    ? defaultAudits
    : defaultAudits.filter(a => a.provenance === activeFilter);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="IMMUTABLE DECISION PROVENANCE & FORENSICS"
        title="EVERY DECISION EXPLAINED."
        subtitle="Cryptographically tracked log of all perception inferences, deterministic state transitions, AI-assisted drafts, and human operator authorizations."
        meta={
          <div style={{ textAlign: 'right' }}>
            <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
              LOGGED AUDIT TRAIL
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 600 }}>
              {defaultAudits.length} AUDIT RECORDS
            </p>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
        
        {/* Minimal Text Filter Strip (No giant dropdown toolbar) */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '48px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <span className="text-micro">FILTER PROVENANCE:</span>
          {filters.map((flt) => (
            <button
              key={flt}
              onClick={() => setActiveFilter(flt)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                cursor: 'pointer',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: activeFilter === flt ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeFilter === flt ? 600 : 400,
                borderBottom: activeFilter === flt ? '2px solid var(--text-primary)' : '2px solid transparent',
                transition: 'color 0.2s'
              }}
            >
              {flt}
            </button>
          ))}
        </div>

        {/* Vertical Editorial Timeline (Zero Giant Data Tables) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredEvents.map((evt, idx) => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString();
            const dateStr = new Date(evt.timestamp).toLocaleDateString();

            return (
              <div
                key={evt.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'clamp(20px, 4vw, 48px)',
                  padding: '32px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background-color 0.2s'
                }}
              >
                {/* Time & Provenance Column */}
                <div style={{ width: '160px', flexShrink: 0 }}>
                  <span className="text-micro" style={{ color: 'var(--text-primary)', display: 'block' }}>
                    {timeStr}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {dateStr}
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {evt.provenance}
                    </span>
                  </div>
                </div>

                {/* Event & Action Description */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      {evt.action}
                    </h3>
                    <span className="text-micro" style={{ color: 'var(--text-muted)' }}>
                      ACTOR: {evt.actor}
                    </span>
                  </div>

                  <p className="text-body" style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: 1.5 }}>
                    {evt.reason || 'State transition verified by authoritative telemetry.'}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>ENTITY: {evt.entityType} ({evt.entityId})</span>
                    <span>LOG ID: {evt.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
