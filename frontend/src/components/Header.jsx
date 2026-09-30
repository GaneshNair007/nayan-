import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Radio, 
  Clock, 
  Play, 
  RotateCcw, 
  Users, 
  Briefcase, 
  Flame 
} from 'lucide-react';

export default function Header({ 
  capabilities, 
  wsConnected, 
  onRunScenario, 
  onReset,
  activeScenarioLoading 
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const gpuName = capabilities?.gpu?.name || 'RTX 4050 (CUDA:0)';
  const gpuAvailable = capabilities?.gpu?.available !== false;

  return (
    <header className="glass-panel" style={{ margin: '12px 16px 8px 16px', padding: '12px 20px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Brand & Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(59, 130, 246, 0.2))', 
              padding: '8px', 
              borderRadius: '8px',
              border: '1px solid var(--accent-cyan)'
            }}>
              <ShieldAlert size={22} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '1px', color: '#fff' }}>AEGIS GRID</span>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>v1.4 PROTOTYPE</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Autonomous Urban Incident Intelligence & Mobility Control
              </div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Mandatory Demo / Simulation Pill */}
          <div className="badge badge-warning" style={{ padding: '4px 10px', fontSize: '11px', gap: '6px' }}>
            <span className="pulse-dot pulse-dot-red" />
            <span>DEMO / SIMULATION ENVIRONMENT</span>
          </div>

          {/* GPU Hardware Pill */}
          <div className="badge badge-cyan" style={{ padding: '4px 10px', fontSize: '11px', gap: '6px' }}>
            <Cpu size={13} color="var(--accent-cyan)" />
            <span>{gpuAvailable ? gpuName : 'CPU FALLBACK'}</span>
            <span style={{ color: '#34d399', fontWeight: '700' }}>• FP16 CUDA</span>
          </div>

          {/* WebSocket Status */}
          <div className={`badge ${wsConnected ? 'badge-success' : 'badge-critical'}`} style={{ padding: '4px 10px', fontSize: '11px', gap: '6px' }}>
            <Radio size={13} />
            <span>{wsConnected ? 'LIVE FEED WS: ACTIVE' : 'WS RECONNECTING...'}</span>
          </div>
        </div>

        {/* Right: Quick Golden Demo Launcher & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <button 
            className="btn btn-danger"
            style={{ padding: '7px 14px', fontSize: '12px' }}
            disabled={activeScenarioLoading}
            onClick={() => onRunScenario('golden')}
            title="Starts live GPU analysis on CAM-04 collision video and triggers response lifecycle"
          >
            <Flame size={14} />
            <span>1-Click Golden Demo (CAM-04)</span>
          </button>

          <button 
            className="btn btn-ghost"
            style={{ padding: '7px 12px', fontSize: '12px' }}
            disabled={activeScenarioLoading}
            onClick={() => onRunScenario('crowd')}
            title="Analyze crowd surge on CAM-07"
          >
            <Users size={14} />
            <span>Crowd Surge</span>
          </button>

          <button 
            className="btn btn-ghost"
            style={{ padding: '7px 12px', fontSize: '12px' }}
            disabled={activeScenarioLoading}
            onClick={() => onRunScenario('baggage')}
            title="Analyze unattended luggage on CAM-11"
          >
            <Briefcase size={14} />
            <span>Baggage</span>
          </button>

          <button 
            className="btn btn-ghost"
            style={{ padding: '7px 10px', fontSize: '12px' }}
            onClick={onReset}
            title="Reset city state and clear simulated incidents"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            padding: '4px 8px',
            background: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Clock size={13} color="var(--accent-cyan)" />
            <span>{timeStr || 'UTC TIME'}</span>
          </div>

        </div>

      </div>
    </header>
  );
}
