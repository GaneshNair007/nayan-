import React from 'react';
import LetterSwapLink from '../motion/LetterSwapLink';
import { Radio } from 'lucide-react';

export default function AppHeader({
  activeTab,
  onSelectTab,
  wsConnected,
  onOpenSystemDrawer,
  onOpenScenarioDrawer
}) {
  const navItems = [
    { id: 'landing', label: 'OVERVIEW' },
    { id: 'command-center', label: 'COMMAND' },
    { id: 'camera-intel', label: 'CAMERAS' },
    { id: 'corridor', label: 'CORRIDORS' },
    { id: 'traffic', label: 'SIGNALS' },
    { id: 'digital-twin', label: 'TWIN' },
    { id: 'audit', label: 'AUDIT' },
    { id: 'ai', label: 'COPILOT' }
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height, 72px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--gutter, 32px)',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('landing')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span
          style={{
            fontFamily: 'inherit',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase'
          }}
        >
          NAYAN
        </span>
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '10px'
          }}
        >
          CV-FIRST URBAN SAFETY
        </span>
      </button>

      {/* Main Navigation with 21st.dev Letter Swap Links */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(14px, 2.2vw, 36px)'
        }}
      >
        {navItems.map((item) => (
          <LetterSwapLink
            key={item.id}
            active={activeTab === item.id}
            onClick={() => onSelectTab(item.id)}
            fontSize="12px"
            activeColor="var(--text-primary)"
            inactiveColor="var(--text-secondary)"
          >
            {item.label}
          </LetterSwapLink>
        ))}
      </nav>

      {/* Right Utility: Scenarios, System Drawer, and Live Pulse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Scenarios Quick-Action */}
        <button
          type="button"
          onClick={onOpenScenarioDrawer}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '5px 12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          SCENARIOS +
        </button>

        {/* System Drawer Trigger */}
        <LetterSwapLink
          onClick={onOpenSystemDrawer}
          fontSize="11px"
          inactiveColor="var(--text-muted)"
          activeColor="var(--text-primary)"
        >
          SYSTEM
        </LetterSwapLink>

        {/* Live WebSocket Status Dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--border-subtle)'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: wsConnected ? '#10b981' : '#f59e0b',
              boxShadow: wsConnected ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              color: wsConnected ? '#10b981' : '#f59e0b'
            }}
          >
            {wsConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </header>
  );
}
