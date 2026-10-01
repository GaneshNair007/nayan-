import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';

// Empirical Palomino character-swap navigation link using Motion for React variants
function NavLink({ label, targetId, onClick, style = {}, active = false }) {
  const shouldReduceMotion = useReducedMotion();
  const chars = label.split('');

  const containerVariants = {
    idle: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    },
    hover: {
      transition: {
        staggerChildren: 0.025,
        staggerDirection: 1
      }
    }
  };

  const primaryCharVariants = {
    idle: {
      x: '0%',
      transition: { duration: 0.45, ease: EASING.editorialEase }
    },
    hover: {
      x: '100%',
      transition: { duration: 0.52, ease: EASING.editorialEase }
    }
  };

  const secondaryCharVariants = {
    idle: {
      x: '-100%',
      transition: { duration: 0.45, ease: EASING.editorialEase }
    },
    hover: {
      x: '0%',
      transition: { duration: 0.52, ease: EASING.editorialEase }
    }
  };

  return (
    <motion.a
      href={targetId ? `#${targetId}` : '#'}
      initial="idle"
      animate="idle"
      whileHover={shouldReduceMotion ? undefined : 'hover'}
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
        display: 'inline-block',
        textDecoration: 'none',
        opacity: active === false && style.opacity !== undefined ? style.opacity : 1,
        ...style
      }}
    >
      <motion.span
        variants={containerVariants}
        style={{
          position: 'relative',
          display: 'inline-block',
          overflow: 'hidden'
        }}
      >
        {/* Visible layer stream */}
        <span style={{ display: 'inline-flex' }}>
          {chars.map((char, i) => (
            <span
              key={`p-${i}`}
              style={{
                position: 'relative',
                display: 'inline-block',
                overflow: 'clip'
              }}
            >
              <motion.span
                variants={primaryCharVariants}
                style={{
                  display: 'inline-block',
                  willChange: 'transform'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            </span>
          ))}
        </span>

        {/* Duplicate layer entering from left */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'inline-flex'
          }}
        >
          {chars.map((char, i) => (
            <span
              key={`s-${i}`}
              style={{
                position: 'relative',
                display: 'inline-block',
                overflow: 'clip'
              }}
            >
              <motion.span
                variants={secondaryCharVariants}
                style={{
                  display: 'inline-block',
                  willChange: 'transform'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            </span>
          ))}
        </span>
      </motion.span>
    </motion.a>
  );
}

export default function LandingHeader({ onEnterCommandCenter }) {
  return (
    <header
      style={{
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
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        pointerEvents: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Brand NAYAN mark and name matching Palomino */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
        <span
          style={{
            fontFamily: 'var(--pal-font)',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
            letterSpacing: '0.04em'
          }}
        >
          NAYAN
        </span>
      </a>

      {/* Center: COMMAND / CAMERAS / SYSTEM (replaces WORK / ABOUT / CONTACT) */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '48px'
        }}
      >
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
