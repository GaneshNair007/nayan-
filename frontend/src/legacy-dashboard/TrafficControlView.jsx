import React, { useState } from 'react';
import { 
  GitFork, 
  ShieldCheck, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react';

export default function TrafficControlView({ junctions }) {
  const [selectedJncId, setSelectedJncId] = useState('JNC-02');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedNotice, setOptimizedNotice] = useState(false);

  const jncList = junctions || [
    {
      id: 'JNC-01',
      name: 'Main St & 1st Ave',
      pressure: 0.35,
      current_phase: { name: 'North-South Green', duration_seconds: 45 },
      proposed_phase: { name: 'East-West Green', duration_seconds: 30 },
      approaches: [
        { name: 'Northbound', queue_length_meters: 25.0, vehicle_count: 8, average_speed_kmh: 35.0, occupancy_pct: 35.0 },
        { name: 'Southbound', queue_length_meters: 30.0, vehicle_count: 10, average_speed_kmh: 32.0, occupancy_pct: 40.0 },
        { name: 'Eastbound', queue_length_meters: 15.0, vehicle_count: 4, average_speed_kmh: 42.0, occupancy_pct: 20.0 },
        { name: 'Westbound', queue_length_meters: 18.0, vehicle_count: 5, average_speed_kmh: 40.0, occupancy_pct: 25.0 }
      ]
    },
    {
      id: 'JNC-02',
      name: 'Central Expwy & 4th Cross (Collision Corridor)',
      pressure: 0.72,
      current_phase: { name: 'Expressway Eastbound Green', duration_seconds: 55 },
      proposed_phase: { name: 'Emergency Vehicle Flush Phase', duration_seconds: 40 },
      approaches: [
        { name: 'Northbound', queue_length_meters: 85.0, vehicle_count: 22, average_speed_kmh: 12.0, occupancy_pct: 78.0 },
        { name: 'Southbound', queue_length_meters: 95.0, vehicle_count: 26, average_speed_kmh: 9.0, occupancy_pct: 85.0 },
        { name: 'Eastbound', queue_length_meters: 120.0, vehicle_count: 34, average_speed_kmh: 6.0, occupancy_pct: 92.0 },
        { name: 'Westbound', queue_length_meters: 60.0, vehicle_count: 15, average_speed_kmh: 22.0, occupancy_pct: 55.0 }
      ]
    },
    {
      id: 'JNC-03',
      name: 'Metro Plaza & Plaza Blvd',
      pressure: 0.42,
      current_phase: { name: 'Pedestrian Crossing Concurrent', duration_seconds: 30 },
      proposed_phase: { name: 'North-South Vehicle Advance', duration_seconds: 40 },
      approaches: [
        { name: 'Northbound', queue_length_meters: 35.0, vehicle_count: 11, average_speed_kmh: 28.0, occupancy_pct: 45.0 },
        { name: 'Southbound', queue_length_meters: 40.0, vehicle_count: 12, average_speed_kmh: 26.0, occupancy_pct: 48.0 },
        { name: 'Eastbound', queue_length_meters: 22.0, vehicle_count: 6, average_speed_kmh: 38.0, occupancy_pct: 28.0 },
        { name: 'Westbound', queue_length_meters: 25.0, vehicle_count: 7, average_speed_kmh: 35.0, occupancy_pct: 30.0 }
      ]
    }
  ];

  const currentJnc = jncList.find(j => j.id === selectedJncId) || jncList[0];

  const handleApplyOptimization = async () => {
    setOptimizing(true);
    try {
      await fetch(`/api/junctions/${selectedJncId}/phase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase_id: 2,
          duration_seconds: 45,
          reason: 'Operator accepted AI adaptive signal recommendation'
        })
      });
      setOptimizedNotice(true);
      setTimeout(() => setOptimizedNotice(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      
      {/* 1. Junction Selector List */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitFork size={16} color="var(--accent-cyan)" />
            <span>ADAPTIVE JUNCTIONS</span>
          </div>
          <span className="badge badge-cyan">{jncList.length} CONNECTED</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {jncList.map(j => {
            const isSelected = j.id === selectedJncId;
            const isHigh = j.pressure > 0.6;

            return (
              <div
                key={j.id}
                onClick={() => setSelectedJncId(j.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: isSelected ? 'var(--accent-cyan)' : '#fff' }}>
                    {j.id}
                  </span>
                  <span className={`badge ${isHigh ? 'badge-critical' : 'badge-success'}`}>
                    {(j.pressure * 100).toFixed(0)}% LOAD
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {j.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Phase: {j.current_phase?.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Column: 4 Approaches Telemetry & Live Signal Phase */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{currentJnc.id} — {currentJnc.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time approach queue dynamics and signal preemption</div>
          </div>
          <span className="badge badge-warning">SIMULATION / ADAPTIVE</span>
        </div>

        {/* 4 Approaches Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {currentJnc.approaches && currentJnc.approaches.map(app => {
            const isHeavy = app.occupancy_pct > 70;

            return (
              <div 
                key={app.name} 
                className="glass-panel-subtle" 
                style={{ 
                  padding: '12px', 
                  borderLeft: isHeavy ? '3px solid var(--status-critical)' : '3px solid #34d399' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: '#fff' }}>{app.name}</span>
                  <span className={`badge ${isHeavy ? 'badge-critical' : 'badge-success'}`} style={{ fontSize: '9px' }}>
                    {app.occupancy_pct}% OCCUPIED
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div>Queue: <strong style={{ color: '#fff' }}>{app.queue_length_meters}m</strong></div>
                  <div>Vehicles: <strong style={{ color: '#fff' }}>{app.vehicle_count}</strong></div>
                  <div>Avg Speed: <strong style={{ color: app.average_speed_kmh < 15 ? '#f87171' : '#34d399' }}>{app.average_speed_kmh} km/h</strong></div>
                  <div>Status: <strong style={{ color: isHeavy ? '#f87171' : '#34d399' }}>{isHeavy ? 'CONGESTED' : 'FLOWING'}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current vs Proposed Phase Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
          <div className="glass-panel-subtle" style={{ padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
              CURRENT ACTIVE PHASE
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399', marginBottom: '4px' }}>
              {currentJnc.current_phase?.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Duration: {currentJnc.current_phase?.duration_seconds}s
            </div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '12px', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              AI PROPOSED ADAPTIVE PHASE
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              {currentJnc.proposed_phase?.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Optimized Duration: {currentJnc.proposed_phase?.duration_seconds}s
            </div>
          </div>
        </div>

        {/* Optimization Action Banner */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', padding: '12px 16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>Adaptive Network Balance Recommendation</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Flushes Eastbound queue while maintaining safety clearance invariants.</div>
          </div>
          <button 
            className="btn btn-cyan"
            disabled={optimizing}
            onClick={handleApplyOptimization}
          >
            <Sliders size={14} />
            <span>{optimizing ? 'Executing Transition...' : 'Apply Adaptive Timing'}</span>
          </button>
        </div>

        {optimizedNotice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
            <CheckCircle2 size={16} />
            <span>Adaptive timing successfully scheduled. Yellow and all-red clearance enforced.</span>
          </div>
        )}

      </div>

      {/* 3. Right Column: Safety Constraints Invariants */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#34d399" />
            <span>MUNICIPAL SAFETY INVARIANTS</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Hardware interlocking cannot be overridden by AI
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="glass-panel-subtle" style={{ padding: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MINIMUM GREEN TIME</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>15.0 Seconds</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Prevents pedestrian trapping</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAXIMUM GREEN EXTENSION</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>90.0 Seconds</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Prevents starvation on cross streets</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>YELLOW CLEARANCE INTERVAL</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fbbf24' }}>4.0 Seconds</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Strict kinematic stopping distance</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ALL-RED CLEARANCE BUFFER</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>2.0 Seconds</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Guarantees intersection vacuum</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          ⚠️ All signal preemption adjustments are confined to the digital simulation layer; never connected to live municipal controllers.
        </div>
      </div>

    </div>
  );
}
