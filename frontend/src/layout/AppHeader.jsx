import React, { useState } from 'react';
import { motion } from 'motion/react';
import { navEase } from '../motion/easing';

export default function AppHeader({
  activeTab,
  onSelectTab,
  wsConnected,
  onOpenSystemDrawer,
  onOpenScenarioDrawer
}) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isSystemHovered, setIsSystemHovered] = useState(false);

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
        padding: '0 var(--gutter)',
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Brand Wordmark */}
      <button
        onClick={() => onSelectTab('landing')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
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
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '8px'
          }}
        >
          CV-FIRST URBAN SAFETY
        </span>
      </button>

      {/* Main Navigation with Character / Duplicate Text Swap Hover */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(14px, 2vw, 32px)'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {/* Duplicate text swap container */}
              <div
                style={{
                  position: 'relative',
                  height: '16px',
                  overflow: 'hidden'
                }}
              >
                {/* Primary layer */}
                <motion.span
                  animate={{ y: isHovered ? '-100%' : '0%' }}
                  transition={{ duration: 0.35, ease: navEase }}
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Swap layer */}
                <motion.span
                  animate={{ y: isHovered ? '0%' : '100%' }}
                  transition={{ duration: 0.35, ease: navEase }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)'
                  }}
                >
                  {item.label}
                </motion.span>
              </div>

              {/* Active Indicator Underline */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'var(--text-primary)'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Scenarios, System Drawer Trigger, Live Pulse */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 1.5vw, 24px)'
        }}
      >
        {/* Scenarios Button */}
        <button
          onClick={onOpenScenarioDrawer}
          style={{
            background: 'none',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '2px',
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

        {/* System Drawer Button with Text Swap */}
        <button
          onClick={onOpenSystemDrawer}
          onMouseEnter={() => setIsSystemHovered(true)}
          onMouseLeave={() => setIsSystemHovered(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 0',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            height: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ position: 'relative', height: '16px', overflow: 'hidden' }}>
            <motion.span
              animate={{ y: isSystemHovered ? '-100%' : '0%' }}
              transition={{ duration: 0.35, ease: navEase }}
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)'
              }}
            >
              SYSTEM
            </motion.span>
            <motion.span
              animate={{ y: isSystemHovered ? '0%' : '100%' }}
              transition={{ duration: 0.35, ease: navEase }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)'
              }}
            >
              SYSTEM
            </motion.span>
          </div>
        </button>

        {/* Realtime Live Pulse */}
        <div
          title={wsConnected ? 'Realtime WebSocket Active' : 'WebSocket Reconnecting...'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: wsConnected ? 'var(--text-primary)' : 'var(--text-muted)'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: wsConnected ? 'var(--status-confirmed)' : 'var(--status-verifying)',
              boxShadow: wsConnected ? '0 0 8px var(--status-confirmed)' : 'none'
            }}
          />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}
