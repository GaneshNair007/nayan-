import React from 'react';

/**
 * StickyMediaScene: Creates Palomino-style split composition
 * where a primary media element remains sticky in viewport while
 * editorial rows or narrative scenes scroll past.
 */
export default function StickyMediaScene({
  mediaContent,
  scrollContent,
  mediaWidth = '62%',
  contentWidth = '38%',
  reverse = false,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`sticky-media-scene ${className}`}
      style={{
        display: 'flex',
        flexDirection: reverse ? 'row-reverse' : 'row',
        width: '100%',
        alignItems: 'flex-start',
        position: 'relative',
        ...style
      }}
    >
      {/* Sticky Media Container */}
      <div
        style={{
          width: mediaWidth,
          position: 'sticky',
          top: 'var(--header-height, 72px)',
          height: 'calc(100vh - var(--header-height, 72px))',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 0'
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {mediaContent}
        </div>
      </div>

      {/* Scrolling Narrative Content */}
      <div
        style={{
          width: contentWidth,
          paddingLeft: reverse ? '0' : 'clamp(24px, 4vw, 64px)',
          paddingRight: reverse ? 'clamp(24px, 4vw, 64px)' : '0',
          paddingTop: '32px',
          paddingBottom: '120px'
        }}
      >
        {scrollContent}
      </div>
    </div>
  );
}
