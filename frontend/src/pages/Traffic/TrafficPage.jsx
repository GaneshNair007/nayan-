import React, { useState } from 'react';
import PageHero from '../../layout/PageHero';

export default function TrafficPage({ junctions = [] }) {
  const [selectedJncId, setSelectedJncId] = useState('JNC-02');

  const rawJunctions = junctions.length > 0 ? junctions : [
    {
      id: 'JNC-01',
      name: 'Main Street & 1st Avenue',
      current_phase: { name: 'NORTH_SOUTH_GREEN', duration_seconds: 45 },
      cycle_time: 90,
      phase_time_remaining: 18,
      preemption_active: false,
      connected_cameras: ['CAM-01', 'CAM-02']
    },
    {
      id: 'JNC-02',
      name: 'Central Expressway & 4th Cross',
      current_phase: { name: 'EMERGENCY_PREEMPTION_WEST', duration_seconds: 60 },
      cycle_time: 120,
      phase_time_remaining: 35,
      preemption_active: true,
      connected_cameras: ['CAM-03', 'CAM-04']
    },
    {
      id: 'JNC-03',
      name: 'Tech Corridor & Ring Road',
      current_phase: { name: 'EAST_WEST_GREEN', duration_seconds: 40 },
      cycle_time: 90,
      phase_time_remaining: 24,
      preemption_active: false,
      connected_cameras: ['CAM-05', 'CAM-07']
    }
  ];

  const defaultJunctions = rawJunctions.map((j) => {
    const phaseName = typeof j.current_phase === 'object' && j.current_phase !== null
      ? (j.current_phase.name || 'ADAPTIVE_GREEN')
      : (j.current_phase || 'NORTH_SOUTH_GREEN');
    const phaseDuration = typeof j.current_phase === 'object' && j.current_phase !== null
      ? (j.current_phase.duration_seconds || 45)
      : 45;
    const cycleTime = j.cycle_time || (phaseDuration * 2);
    const cameras = Array.isArray(j.connected_cameras)
      ? j.connected_cameras
      : ['CAM-01', 'CAM-02'];

    return {
      ...j,
      phase_name: phaseName,
      cycle_time: cycleTime,
      phase_time_remaining: j.phase_time_remaining || phaseDuration,
      preemption_active: Boolean(j.preemption_active || j.corridor_active),
      connected_cameras: cameras
    };
  });

  const currentJnc = defaultJunctions.find(j => j.id === selectedJncId) || defaultJunctions[1] || defaultJunctions[0];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Editorial Page Hero */}
      <PageHero
        eyebrow="ADAPTIVE INTERSECTION ORCHESTRATION"
        title="SIGNAL INTELLIGENCE"
        subtitle="Dynamic green-wave corridor preemption with SUMO/TraCI closed-loop actuation. Signals adapt to real-time CCTV queue length and approaching emergency vehicles."
        meta={
          <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
            <div>
              <span className="text-micro">JUNCTION NETWORK</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600 }}>
                {defaultJunctions.length} NODES
              </p>
            </div>
            <div>
              <span className="text-micro">ACTIVE PREEMPTION</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 600, color: 'var(--status-critical)' }}>
                {defaultJunctions.filter(j => j.preemption_active).length} JUNCTION
              </p>
            </div>
          </div>
        }
      />

      <div className="page-container" style={{ paddingTop: '48px', paddingBottom: '120px' }}>
        
        {/* Dominant Large Signal State Display (Large Visual States, Zero Tiny Cards) */}
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#0a0a0c',
            padding: 'clamp(32px, 5vw, 64px)',
            marginBottom: '80px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
            <div>
              <span className="text-micro">ACTIVE INTERSECTION ACTUATION</span>
              <h2 className="text-display-lg" style={{ margin: '8px 0 0 0' }}>
                {currentJnc.id} — {currentJnc.name}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="text-micro" style={{ color: currentJnc.preemption_active ? 'var(--status-critical)' : 'var(--status-confirmed)' }}>
                {currentJnc.preemption_active ? 'EMERGENCY PREEMPTION ACTIVE' : 'NOMINAL ADAPTIVE CYCLE'}
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 600 }} className="tabular-nums">
                {currentJnc.phase_time_remaining}s REMAINING
              </p>
            </div>
          </div>

          <hr className="editorial-rule" style={{ marginBottom: '48px' }} />

          {/* Large Scale Signal Light Visualization */}
          <div className="grid-12" style={{ alignItems: 'center' }}>
            <div className="col-span-4" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  backgroundColor: currentJnc.preemption_active ? 'rgba(230, 57, 70, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${currentJnc.preemption_active ? 'var(--status-critical)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: currentJnc.preemption_active ? 'var(--status-critical)' : 'transparent',
                    boxShadow: currentJnc.preemption_active ? '0 0 32px var(--status-critical)' : 'none'
                  }}
                />
              </div>
              <span className="text-micro">OPPOSING TRAFFIC: ALL RED</span>
            </div>

            <div className="col-span-4" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'transparent' }} />
              </div>
              <span className="text-micro">INTERMEDIATE: AMBER CLEAR</span>
            </div>

            <div className="col-span-4" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  backgroundColor: currentJnc.preemption_active ? 'rgba(42, 157, 143, 0.2)' : 'rgba(42, 157, 143, 0.2)',
                  border: '2px solid var(--status-confirmed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-confirmed)',
                    boxShadow: '0 0 32px var(--status-confirmed)'
                  }}
                />
              </div>
              <span className="text-micro">AMBULANCE CORRIDOR: EXTENDED GREEN</span>
            </div>
          </div>

          {/* Horizontal Editorial Phase Timeline */}
          <div style={{ marginTop: '56px', borderTop: '1px solid var(--border-subtle)', paddingTop: '32px' }}>
            <span className="text-micro" style={{ display: 'block', marginBottom: '16px' }}>
              PHASE TIMELINE (120s CYCLE)
            </span>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '65%',
                  height: '100%',
                  backgroundColor: 'var(--status-confirmed)',
                  transition: 'width 1s linear'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>0s: PHASE START</span>
              <span>35s: EXTENDED GREEN HOLD (AMBULANCE TRANSIT)</span>
              <span>120s: CYCLE RESET</span>
            </div>
          </div>
        </div>

        {/* Junction Registry Rows (Palomino Editorial Rows) */}
        <div>
          <span className="text-micro" style={{ display: 'block', marginBottom: '16px' }}>
            NODAL ACTUATION NETWORK
          </span>
          <h3 className="text-heading" style={{ margin: '0 0 32px 0', textTransform: 'uppercase' }}>
            CONNECTED JUNCTIONS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {defaultJunctions.map((jnc, i) => {
              const num = String(i + 1).padStart(2, '0');
              const isSelected = jnc.id === selectedJncId;

              return (
                <div
                  key={jnc.id}
                  onClick={() => setSelectedJncId(jnc.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'padding-left 0.2s ease',
                    paddingLeft: isSelected ? '16px' : '0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                    <span className="text-micro">{num}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 500, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {jnc.id} — {jnc.name}
                      </h4>
                      <span className="text-micro" style={{ marginTop: '4px', display: 'block' }}>
                        CAMERAS: {jnc.connected_cameras.join(', ')} · CYCLE: {jnc.cycle_time}s
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: jnc.preemption_active ? 'var(--status-critical)' : 'var(--status-confirmed)'
                      }}
                    >
                      {jnc.preemption_active ? 'PREEMPTION ACTIVE' : 'ADAPTIVE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
