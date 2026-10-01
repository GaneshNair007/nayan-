import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { editorialEase } from './easing';

/**
 * 21st.dev Letter Swap / Flip Link Pattern
 * Renders two duplicate layers of text inside an overflow-hidden mask.
 * On hover, the primary letters translate upwards while the secondary letters
 * rise up from below in a staggered sequence.
 */
export default function LetterSwapLink({
  children,
  onClick,
  active = false,
  className = '',
  style = {},
  activeColor = 'var(--text-primary)',
  inactiveColor = 'var(--text-secondary)',
  fontSize = '12px',
  fontFamily = 'monospace',
  staggerDelay = 0.015
}) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const text = typeof children === 'string' ? children : String(children || '');

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'none',
        border: 'none',
        padding: '4px 2px',
        cursor: 'pointer',
        fontSize,
        fontFamily,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: active ? activeColor : inactiveColor,
        lineHeight: 1.2,
        ...style
      }}
      className={className}
    >
      {/* Visual active indicator dot */}
      {active && (
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: activeColor,
            marginRight: '6px'
          }}
        />
      )}

      <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
        {/* Layer 1: Exiting Top Letter Sequence */}
        <span style={{ display: 'inline-flex' }}>
          {text.split('').map((char, index) => (
            <motion.span
              key={`top-${index}`}
              animate={{
                y: isHovered && !shouldReduceMotion ? '-100%' : '0%'
              }}
              transition={{
                duration: 0.3,
                ease: editorialEase,
                delay: index * staggerDelay
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal'
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>

        {/* Layer 2: Entering Bottom Duplicate Letter Sequence */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline-flex'
          }}
          aria-hidden="true"
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={`bot-${index}`}
              animate={{
                y: isHovered && !shouldReduceMotion ? '0%' : '100%'
              }}
              transition={{
                duration: 0.3,
                ease: editorialEase,
                delay: index * staggerDelay
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                color: activeColor
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </span>
    </motion.button>
  );
}
