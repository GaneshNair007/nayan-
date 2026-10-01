import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Download 
} from 'lucide-react';

export default function AuditView({ auditEvents }) {
  const [filterQuery, setFilterQuery] = useState('');

  const events = auditEvents || [];
  const filtered = events.filter(e => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.action?.toLowerCase().includes(q) ||
      e.entityId?.toLowerCase().includes(q) ||
      e.actor?.toLowerCase().includes(q) ||
      e.reason?.toLowerCase().includes(q)
    );
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `aegis-grid-audit-trail-${new Date().toISOString().slice(0,10)}.json`);
    dlAnchor.click();
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      
      {/* Top Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ScrollText size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>IMMUTABLE OPERATIONAL AUDIT TRAIL</span>
          <span className="badge badge-cyan">{filtered.length} RECORDS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input 
              type="text"
              placeholder="Search audit actions, IDs, actors..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 12px 6px 30px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                width: '260px'
              }}
            />
          </div>

          <button className="btn btn-ghost" onClick={handleExportJson} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px 12px' }}>ACTOR</th>
                <th style={{ padding: '10px 12px' }}>ACTION / DESCRIPTION</th>
                <th style={{ padding: '10px 12px' }}>ENTITY</th>
                <th style={{ padding: '10px 12px' }}>STATE TRANSITION</th>
                <th style={{ padding: '10px 12px' }}>PROVENANCE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((evt, idx) => (
                  <tr key={evt.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {evt.timestamp ? evt.timestamp.slice(11, 19) + ' UTC' : '00:00:00 UTC'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-muted">{evt.actor || 'SYSTEM'}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#fff', fontWeight: '500' }}>
                      {evt.action}
                      {evt.reason && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Reason: {evt.reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {evt.entityId || 'N/A'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {evt.previousState || evt.nextState ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {evt.previousState || 'NONE'} → <strong style={{ color: '#34d399' }}>{evt.nextState}</strong>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-cyan">{evt.provenance || 'USER_INPUT'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
