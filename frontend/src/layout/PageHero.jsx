import React from 'react';
import RevealLine from '../motion/RevealLine';

export default function PageHero({
  eyebrow = '',
  title = '',
  subtitle = '',
  meta = null,
  style = {}
}) {
  return (
    <section
      style={{
        paddingTop: 'calc(var(--header-height, 72px) + clamp(32px, 5vw, 64px))',
        paddingBottom: 'clamp(24px, 4vw, 48px)',
        borderBottom: '1px solid var(--border-subtle)',
        ...style
      }}
    >
      <div className="page-container">
        {eyebrow && (
          <span
            className="text-micro"
            style={{ display: 'block', marginBottom: '12px' }}
          >
            {eyebrow}
          </span>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          <div style={{ maxWidth: '850px' }}>
            <RevealLine>
              <h1 className="text-display-xl" style={{ margin: 0 }}>
                {title}
              </h1>
            </RevealLine>

            {subtitle && (
              <p
                className="text-body-lg"
                style={{ margin: '16px 0 0 0', maxWidth: '640px' }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {meta && (
            <div style={{ paddingBottom: '8px' }}>
              {meta}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
