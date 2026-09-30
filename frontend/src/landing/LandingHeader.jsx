import React from 'react';

// Character swap navigation link matching Palomino's duplicate layer mechanic
function NavLink({ label, targetId, onClick, style = {}, active = false }) {
  return (
    <a
      href={targetId ? `#${targetId}` : '#'}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className="pal-nav-item"
      style={{
        fontFamily: 'var(--pal-font)',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '24px',
        color: '#ffffff',
        position: 'relative',
        opacity: active === false && style.opacity !== undefined ? style.opacity : 1,
        ...style
      }}
    >
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {/* Primary layer: exits to right (+100% X) */}
        <span style={{ display: 'inline-block' }}>
          {label.split('').map((char, i) => (
            <span key={i} className="pal-char-stream" style={{ position: 'relative', display: 'inline-block', overflow: 'clip' }}>
              <span className="pal-char-primary" style={{ transitionDelay: `${i * 0.015}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </span>

        {/* Secondary layer: enters from left (-100% X to 0%) */}
        <span style={{ position: 'absolute', left: 0, top: 0 }}>
          {label.split('').map((char, i) => (
            <span key={i} className="pal-char-stream" style={{ position: 'relative', display: 'inline-block', overflow: 'clip' }}>
              <span className="pal-char-secondary" style={{ transitionDelay: `${i * 0.015}s` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}

export default function LandingHeader({ onEnterCommandCenter }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: '75px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 500,
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)',
      pointerEvents: 'auto',
      boxSizing: 'border-box'
    }}>
      {/* Left: Brand NAYAN mark and name matching Palomino */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: '#ffffff'
        }}
      >
        <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 24V1L11 13.5V1H21V24L11 11.5V24H1Z" fill="#ffffff" />
        </svg>
        <span style={{
          fontFamily: 'var(--pal-font)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          letterSpacing: '0.04em'
        }}>
          NAYAN
        </span>
      </a>

      {/* Center: COMMAND / CAMERAS / SYSTEM (replaces WORK / ABOUT / CONTACT) */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '48px'
      }}>
        <NavLink label="COMMAND" onClick={onEnterCommandCenter} />
        <NavLink label="CAMERAS" targetId="selected-projects" />
        <NavLink label="SYSTEM" targetId="services" />
      </nav>

      {/* Right: EN | FR with character-swap matching Palomino */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <NavLink label="EN" style={{ fontSize: '14px', padding: '2px 4px' }} active={true} />
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '12px' }}>|</span>
        <NavLink label="FR" style={{ fontSize: '14px', padding: '2px 4px', opacity: 0.35 }} />
      </div>
    </header>
  );
}
