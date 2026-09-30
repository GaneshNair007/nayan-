import React, { useState } from 'react';
import { 
  Ambulance, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Radio 
} from 'lucide-react';

export default function EmergencyCorridorView({ resources, corridorPlans }) {
  const [corridorActive, setCorridorActive] = useState(true);

  const units = resources || [
    { id: 'AMB-01', callsign: 'Medic 01', status: 'DISPATCHED', location: { address: 'En Route to JNC-02 Collision' } },
    { id: 'AMB-03', callsign: 'Medic 03 (Fast Response)', status: 'AVAILABLE', location: { address: 'Central Fire Hub' } },
    { id: 'POL-02', callsign: 'Patrol 02', status: 'AVAILABLE', location: { address: 'Sector 4 Precinct' } }
  ];

  return (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      
      {/* 1. Left Column: Emergency Fleet */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Ambulance size={16} color="var(--accent-cyan)" />
            <span>DISPATCH UNITS</span>
          </div>
          <span className="badge badge-cyan">{units.length} FLEET</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {units.map(unit => {
            const isDispatched = unit.status === 'DISPATCHED';

            return (
              <div 
                key={unit.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: isDispatched ? 'rgba(0, 229, 255, 0.08)' : 'var(--bg-secondary)',
                  border: isDispatched ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>{unit.callsign}</span>
                  <span className={`badge ${isDispatched ? 'badge-success' : 'badge-muted'}`}>
                    {unit.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ID: {unit.id}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {unit.location?.address}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Column: Green Corridor Preemption Sequence */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>ACTIVE GREEN CORRIDOR: COR-AMB-01</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated signal preemption sequence towards CAM-04 impact point</div>
          </div>
          <span className="badge badge-success" style={{ gap: '4px' }}>
            <span className="pulse-dot pulse-dot-green" />
            <span>PREEMPTION ARMED</span>
          </span>
        </div>

        {/* Travel Time Comparison Metric */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div className="glass-panel-subtle" style={{ padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STANDARD ROUTE ETA</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f87171', fontFamily: 'var(--font-mono)' }}>5.8 min</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Unmanaged congestion</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '12px', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>AEGIS CORRIDOR ETA</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)' }}>2.4 min</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Adaptive Green Waves</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TRANSIT TIME REDUCTION</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>-58.6%</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3.4 Minutes Saved</div>
          </div>
        </div>

        {/* Signal Preemption Junction Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
            CORRIDOR JUNCTION TIMELINE & SIGNAL CLEARANCE:
          </div>

          {[
            { id: 'JNC-01', name: 'Main St & 1st Ave', status: 'GREEN_WAVE_ACTIVE', state: 'CLEARED', eta: 'T-00:30' },
            { id: 'JNC-02', name: 'Central Expwy & 4th Cross (Target Impact)', status: 'HOLD_ALL_RED_PREEMPTION', state: 'INTERLOCKED', eta: 'T-01:45' },
            { id: 'JNC-03', name: 'Metro Plaza Perimeter', status: 'FLOW_RESUMED', state: 'STANDBY', eta: 'T-03:10' }
          ].map((item, idx) => (
            <div key={item.id} className="glass-panel-subtle" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: idx === 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: idx === 1 ? '1px solid #ef4444' : '1px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '11px'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>{item.id} — {item.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>State: {item.status}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${item.state === 'CLEARED' ? 'badge-success' : 'badge-warning'}`}>
                  {item.state}
                </span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  ETA: {item.eta}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 3. Right Column: Corridor Control Actions */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={16} color="var(--accent-cyan)" />
            <span>OPERATOR COMMAND</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Preemption overrides and safety audits
          </div>
        </div>

        <div className="glass-panel-subtle" style={{ padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            DISPATCH PROTOCOL
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Target: Junction 2 West (CAM-04)<br/>
            Priority: P1 Urgent Medical Response<br/>
            Safety Invariant: Interlocking Yellow Clearances Active
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px' }}
            onClick={() => alert('Corridor preemption active in simulation mode')}
          >
            <span>Extend Green Wave (+30s)</span>
          </button>

          <button 
            className="btn btn-ghost"
            style={{ width: '100%', padding: '10px' }}
            onClick={() => alert('Corridor deactivated; returning junctions to adaptive cycle')}
          >
            <span>Release Corridor to Adaptive Cycle</span>
          </button>
        </div>
      </div>

    </div>
  );
}
