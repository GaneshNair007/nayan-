import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useReducedMotion } from 'motion/react';
import { editorialEase } from './easing';

/**
 * 21st.dev Interactive Scrolling Story Component & Sticky Scroll Reveal
 * Coordinates a sticky visual stage alongside a sequential narrative scroll stream.
 */
export default function StickyStory({
  stages = [],
  renderStickyMedia,
  onStageChange,
  initialStage = 0,
  className = '',
  style = {}
}) {
  const [activeStage, setActiveStage] = useState(initialStage);
  const stageRefs = useRef([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const midViewport = window.innerHeight * 0.45;

      stageRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= midViewport && rect.bottom >= midViewport) {
          if (activeStage !== index) {
            setActiveStage(index);
            if (onStageChange) onStageChange(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStage, onStageChange, stages.length]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 48%) 1fr',
        gap: ' clamp(32px, 5vw, 80px)',
        alignItems: 'flex-start',
        ...style
      }}
      className={`sticky-story-container ${className}`}
    >
      {/* Left Column: Sticky Media Display */}
      <div
        style={{
          position: 'sticky',
          top: '100px',
          height: 'clamp(480px, 72vh, 850px)',
          width: '100%',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          backgroundColor: '#0a0a0c',
          borderRadius: '2px'
        }}
        className="sticky-story-media"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.5, ease: editorialEase }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            {renderStickyMedia ? renderStickyMedia(stages[activeStage], activeStage) : (
              stages[activeStage]?.mediaUrl ? (
                <img
                  src={stages[activeStage].mediaUrl}
                  alt={stages[activeStage].title || 'Stage visual'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Column: Scrolling Narrative Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '120px' }}>
        {stages.map((stage, idx) => {
          const isActive = activeStage === idx;
          return (
            <div
              key={idx}
              ref={(el) => (stageRefs.current[idx] = el)}
              style={{
                minHeight: '40vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderLeft: `2px solid ${isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                paddingLeft: '32px',
                transition: 'border-color 0.3s ease',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                paddingTop: '24px',
                paddingBottom: '24px'
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '10px'
                }}
              >
                PHASE {String(idx + 1).padStart(2, '0')} · {stage.metric || stage.badge || 'TELEMETRY'}
              </span>

              <h3
                style={{
                  fontSize: 'clamp(24px, 2.5vw, 36px)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  margin: '0 0 16px 0',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {stage.title}
              </h3>

              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  maxWidth: '540px'
                }}
              >
                {stage.description || stage.detail}
              </p>

              {stage.extra && (
                <div style={{ marginTop: '20px' }}>
                  {stage.extra}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
