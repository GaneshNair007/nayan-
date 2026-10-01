import React from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Activity, 
  Ambulance, 
  Video, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Zap 
} from 'lucide-react';

export default function CommandCenterView({ 
  incidents, 
  cameras, 
  junctions, 
  resources, 
  onSelectCamera, 
  onSelectIncident 
}) {
  const activeIncidents = incidents || [];
  const criticalCount = activeIncidents.filter(i => i.priority_tier === 'P1' || i.severity === 'CRITICAL').length;
  const activeCams = cameras?.filter(c => c.status === 'ACTIVE')?.length || 8;

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      
      {/* 1. KPI Telemetry Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>ACTIVE INCIDENTS</span>
            <Activity size={14} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: activeIncidents.length > 0 ? '#fff' : 'var(--text-secondary)', marginTop: '4px' }}>
            {activeIncidents.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Decoupled State Managed</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px', borderLeft: criticalCount > 0 ? '3px solid var(--status-critical)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>CRITICAL (P1)</span>
            <Flame size={14} color="#ef4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: criticalCount > 0 ? '#ef4444' : '#94a3b8', marginTop: '4px' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '10px', color: criticalCount > 0 ? '#fca5a5' : 'var(--text-muted)', marginTop: '2px' }}>Immediate Action Req.</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>CORRIDOR DISPATCH</span>
            <Ambulance size={14} color="#34d399" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>
            {resources?.filter(r => r.status === 'DISPATCHED')?.length || 0} / {resources?.length || 3}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Active Emergency Units</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>TRAFFIC DISRUPTION</span>
            <Zap size={14} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: criticalCount > 0 ? '#fbbf24' : '#34d399', marginTop: '4px' }}>
            {criticalCount > 0 ? 'MODERATE (38%)' : 'LOW (12%)'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Network Pressure Metric</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>CCTV SENSORS</span>
            <Video size={14} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {activeCams} / {cameras?.length || 8}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Optical & AI Verified</div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
            <span>AVG VERIFY TIME</span>
            <Clock size={14} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
            3.8s
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Target &lt; 5.0s Benchmark</div>
        </div>
      </div>

      {/* 2. Main Center Grid: Map & CCTV Mosaic vs Priority Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', flex: 1, minHeight: '480px' }}>
        
        {/* Left Column: Interactive City Schematic Map + Live Mosaic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tactical Schematic Map */}
          <div className="glass-panel" style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}>
                <MapPin size={16} color="var(--accent-cyan)" />
                <span>URBAN ARTERIAL GRID (CENTRAL SECTOR)</span>
              </div>
              <span className="badge badge-cyan">LEAFLET SCHEMATIC DUAL-MODE</span>
            </div>

            {/* Tactical Grid SVG Canvas */}
            <div style={{ 
              flex: 1, 
              background: '#070a10', 
              borderRadius: '8px', 
              border: '1px solid var(--border-subtle)', 
              position: 'relative', 
              overflow: 'hidden' 
            }}>
              <svg width="100%" height="100%" viewBox="0 0 800 320" style={{ display: 'block' }}>
                {/* Background Grid Lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Road Arterials */}
                {/* Grand Expressway (Horizontal) */}
                <rect x="50" y="140" width="700" height="40" fill="#141a24" stroke="#253043" strokeWidth="1" />
                <line x1="50" y1="160" x2="750" y2="160" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10,10" />

                {/* 1st Ave (Vertical Left) */}
                <rect x="180" y="20" width="36" height="280" fill="#141a24" stroke="#253043" strokeWidth="1" />
                
                {/* 4th Cross (Vertical Center - Golden Demo) */}
                <rect x="420" y="20" width="36" height="280" fill="#141a24" stroke="#253043" strokeWidth="1" />

                {/* Plaza Blvd (Vertical Right) */}
                <rect x="620" y="20" width="36" height="280" fill="#141a24" stroke="#253043" strokeWidth="1" />

                {/* Junction Nodes */}
                {/* JNC-01 */}
                <circle cx="198" cy="160" r="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                <text x="198" y="164" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">J1</text>
                <text x="198" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">Main & 1st</text>

                {/* JNC-02 (Collision Junction) */}
                <circle cx="438" cy="160" r="16" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
                <circle cx="438" cy="160" r="8" fill="#ef4444" />
                <text x="438" y="132" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">CAM-04 IMPACT POINT</text>
                <text x="438" y="195" fill="#f87171" fontSize="10" textAnchor="middle">JNC-02 (Central Expwy)</text>

                {/* JNC-03 */}
                <circle cx="638" cy="160" r="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                <text x="638" y="164" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">J3</text>
                <text x="638" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">Metro Plaza</text>

                {/* Emergency Vehicle Route (Green Corridor) */}
                <path d="M 120 70 L 198 160 L 438 160" fill="none" stroke="#00e5ff" strokeWidth="3" strokeDasharray="6,4" />
                
                {/* Ambulance Marker */}
                <circle cx="140" cy="95" r="9" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                <text x="140" y="80" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">AMB-01 (ETA: 2.4m)</text>

                {/* Camera Pins */}
                <g style={{ cursor: 'pointer' }} onClick={() => onSelectCamera('CAM-01')}>
                  <rect x="225" y="125" width="55" height="18" rx="4" fill="#0f172a" stroke="var(--accent-cyan)" strokeWidth="1" />
                  <text x="252" y="138" fill="var(--accent-cyan)" fontSize="9" fontWeight="bold" textAnchor="middle">CAM-01</text>
                </g>

                <g style={{ cursor: 'pointer' }} onClick={() => onSelectCamera('CAM-04')}>
                  <rect x="365" y="125" width="58" height="18" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="394" y="138" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">CAM-04 🚨</text>
                </g>

                <g style={{ cursor: 'pointer' }} onClick={() => onSelectCamera('CAM-07')}>
                  <rect x="660" y="125" width="55" height="18" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
                  <text x="687" y="138" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">CAM-07</text>
                </g>
              </svg>
            </div>
          </div>

          {/* CCTV Mosaic Bar (4 Primary Feeds) */}
          <div className="glass-panel" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>PRIORITY CCTV MOSAIC</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click feed to inspect real computer vision telemetry</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { id: 'CAM-04', label: 'Collision Point', file: 'cam04_collision.mp4', critical: true },
                { id: 'CAM-01', label: 'Normal Intersection', file: 'cam01_normal_intersection.mp4' },
                { id: 'CAM-07', label: 'Crowd Concourse', file: 'cam07_crowd_growth.mp4' },
                { id: 'CAM-11', label: 'Security Rail Bay', file: 'cam11_unattended_baggage.mp4' }
              ].map(cam => (
                <div 
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#090d14',
                    border: cam.critical ? '1.5px solid #ef4444' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                    <video 
                      src={`/api/videos/file/${cam.file}`} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: '4px', 
                      left: '4px', 
                      background: 'rgba(0,0,0,0.7)', 
                      padding: '2px 5px', 
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      color: cam.critical ? '#fca5a5' : 'var(--accent-cyan)'
                    }}>
                      {cam.id}
                    </div>
                  </div>
                  <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '600', color: '#fff' }}>
                    {cam.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Priority Incident Queue */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span>PRIORITY INCIDENT QUEUE</span>
            </div>
            <span className="badge badge-critical">{activeIncidents.length} TOTAL</span>
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeIncidents.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} color="#34d399" style={{ margin: '0 auto 8px auto' }} />
                <div>City Grid Operating Nominally</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Click "1-Click Golden Demo" in header to simulate collision</div>
              </div>
            ) : (
              activeIncidents.map(inc => {
                const isCritical = inc.priority_tier === 'P1';

                return (
                  <div 
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: isCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                      border: isCritical ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${isCritical ? 'badge-critical' : 'badge-warning'}`}>
                          {inc.priority_tier || 'P1'}
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '12px', color: '#fff' }}>
                          {inc.type}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {inc.camera_id}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                      {inc.title || inc.description}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <div>VERIFY: <strong style={{ color: inc.verification_state === 'CONFIRMED' ? '#f87171' : '#38bdf8' }}>{inc.verification_state}</strong></div>
                      <div>RESPONSE: <strong style={{ color: '#fbbf24' }}>{inc.response_state}</strong></div>
                      <div>CONFIDENCE: <strong style={{ color: '#fff' }}>{(inc.model_confidence * 100).toFixed(0)}%</strong></div>
                      <div>EVIDENCE: <strong style={{ color: '#34d399' }}>{(inc.evidence_score * 100).toFixed(0)}%</strong></div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontSize: '11px', color: 'var(--text-cyan)' }}>
                      <span>Review Evidence & Response</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
