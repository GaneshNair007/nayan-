import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sliders, ChevronsLeftRight } from 'lucide-react';

/**
 * 21st.dev Image Comparison Slider (by Le Thanh / Compare Slider pattern)
 * Interactive before/after comparison with tactile drag handle, touch, and keyboard support.
 */
export default function ComparisonSlider({
  beforeSrc = '/media/nayan/stills/cam04_still_12s.webp',
  afterSrc = '/media/nayan/stills/cam03_still_7s.webp',
  beforeLabel = 'FIXED-TIME BASELINE',
  afterLabel = 'NAYAN ADAPTIVE AI',
  beforeTag = 'CONGESTION · DELAY +4.2m',
  afterTag = 'GREEN WAVE · -42% DELAY',
  initialPosition = 50,
  onPositionChange,
  className = '',
  style = {}
}) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
    if (onPositionChange) onPositionChange(pos);
  }, [onPositionChange]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onPointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, handleMove]);

  // Keyboard navigation support for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      const newPos = Math.max(0, sliderPosition - 5);
      setSliderPosition(newPos);
      if (onPositionChange) onPositionChange(newPos);
    } else if (e.key === 'ArrowRight') {
      const newPos = Math.min(100, sliderPosition + 5);
      setSliderPosition(newPos);
      if (onPositionChange) onPositionChange(newPos);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Before and after comparison slider"
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(440px, 60vh, 800px)',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'ew-resize',
        border: '1px solid var(--border-subtle)',
        backgroundColor: '#0a0a0c',
        userSelect: 'none',
        outline: 'none',
        ...style
      }}
      className={className}
    >
      {/* Background Image: After (NAYAN Adaptive AI) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* After Label (Right side) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '1px solid #10b981',
          padding: '6px 12px',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          zIndex: 3
        }}
      >
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>
          {afterLabel}
        </span>
        <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
          {afterTag}
        </span>
      </div>

      {/* Foreground Image: Before (Fixed Baseline) with clip-path wipe */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          zIndex: 2
        }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Before Label (Left side) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid #ef4444',
            padding: '6px 12px',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#ef4444', fontWeight: 600 }}>
            {beforeLabel}
          </span>
          <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
            {beforeTag}
          </span>
        </div>
      </div>

      {/* Tactile Drag Handle Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: '2px',
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
          zIndex: 4,
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}
      >
        {/* Center Circular Button */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#0a0a0c',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)'
          }}
        >
          <ChevronsLeftRight size={18} />
        </div>
      </div>

      {/* Subtle Hint Bar at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 12px',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
          zIndex: 3
        }}
      >
        <span>DRAG TO COMPARE FIXED VS ADAPTIVE</span>
      </div>
    </div>
  );
}
