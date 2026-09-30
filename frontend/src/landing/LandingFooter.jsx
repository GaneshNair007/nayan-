import React from 'react';

export default function LandingFooter({ onEnterCommandCenter, backendMetrics = {} }) {
  return (
    <>
      {/* ============================================================
          CLOSING STATEMENT (Section 09)
          Exact match to Palomino's "LET'S MAKE SOMETHING ICONIC."
          Centered 3-line massive display typography on sticky black section
          ============================================================ */}
      <section 
        id="command-cta"
        onClick={onEnterCommandCenter}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          boxSizing: 'border-box',
          zIndex: 60,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2 
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: 'clamp(54px, 11vw, 168px)',
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span>ENTER THE</span>
            <span>LIVE COMMAND</span>
            <span>CENTER.</span>
          </h2>

          <div style={{ marginTop: '36px' }}>
            <span 
              style={{
                fontFamily: 'var(--pal-font)',
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              LAUNCH INTERFACE →
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          WHITE STICKY FOOTER (Section 10)
          Matches Palomino's 100vh sticky bottom white footer with 
          brand glyph, 5 editorial columns, and giant bottom wordmark
          ============================================================ */}
      <footer 
        id="landing-footer"
        className="pal-white-footer"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '130px 40px 30px 40px',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        {/* Brand glyph on far left above columns matching Palomino */}
        <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto 48px auto' }}>
          <svg width="28" height="32" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 24V1L11 13.5V1H21V24L11 11.5V24H1Z" fill="#000000" />
          </svg>
        </div>

        {/* 5 Technical / Editorial Columns matching Palomino */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '32px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {/* Column 1: INFOS */}
          <div>
            <span style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(0, 0, 0, 0.45)', display: 'block', marginBottom: '20px' }}>
              INFOS
            </span>
            <div style={{ fontFamily: 'var(--pal-font)', fontSize: '14px', lineHeight: '22px', color: '#000000' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 500 }}>Bengaluru Central Grid</p>
              <p style={{ margin: '0 0 6px 0', color: 'rgba(0, 0, 0, 0.7)' }}>contact@nayan-ai.internal</p>
              <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.7)' }}>+91 80 2558 4000</p>
            </div>
          </div>

          {/* Column 2: PAGES */}
          <div>
            <span style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(0, 0, 0, 0.45)', display: 'block', marginBottom: '20px' }}>
              PAGES
            </span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'HOME', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { name: 'COMMAND', action: onEnterCommandCenter },
                { name: 'CAMERAS', href: '#selected-projects' },
                { name: 'SERVICES', href: '#services' },
                { name: 'EVIDENCE', href: '#forensic-evidence' }
              ].map((p, idx) => (
                <li key={idx}>
                  <a 
                    href={p.href || '#'}
                    onClick={(e) => {
                      if (p.action) {
                        e.preventDefault();
                        p.action();
                      }
                    }}
                    style={{ textDecoration: 'none', color: '#000000', fontSize: '14px', fontWeight: 400, transition: 'opacity 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: SYSTEM */}
          <div>
            <span style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(0, 0, 0, 0.45)', display: 'block', marginBottom: '20px' }}>
              SYSTEM
            </span>
            <div style={{ fontFamily: 'var(--pal-font)', fontSize: '14px', lineHeight: '22px', color: '#000000' }}>
              <p style={{ margin: '0 0 6px 0' }}>
                {backendMetrics?.modelName || 'NAYAN India V2'} {backendMetrics?.checkpoint ? `(${backendMetrics.checkpoint})` : ''}
              </p>
              <p style={{ margin: '0 0 6px 0', color: 'rgba(0, 0, 0, 0.7)' }}>
                CUDA Hardware Acceleration
              </p>
              <p style={{ margin: '0 0 6px 0', color: 'rgba(0, 0, 0, 0.7)' }}>
                {backendMetrics?.mAP50 ? `${(backendMetrics.mAP50 * 100).toFixed(1)}% mAP50 / ${(backendMetrics.ambulancePrecision * 100).toFixed(1)}% Prec` : 'Empirical Benchmark Validated'}
              </p>
              <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.5)' }}>
                Automated Verification Suite
              </p>
            </div>
          </div>

          {/* Column 4: LEGALS */}
          <div>
            <span style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(0, 0, 0, 0.45)', display: 'block', marginBottom: '20px' }}>
              LEGALS
            </span>
            <div style={{ fontFamily: 'var(--pal-font)', fontSize: '14px', lineHeight: '22px', color: '#000000' }}>
              <p style={{ margin: '0 0 6px 0' }}>Zero Facial Storage</p>
              <p style={{ margin: '0 0 6px 0', color: 'rgba(0, 0, 0, 0.7)' }}>Kinematic Invariants</p>
              <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.7)' }}>Public Safety Policy</p>
            </div>
          </div>

          {/* Column 5: CREDITS */}
          <div>
            <span style={{ fontFamily: 'var(--pal-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(0, 0, 0, 0.45)', display: 'block', marginBottom: '20px' }}>
              DESIGNED & DEVELOPED BY
            </span>
            <div style={{ fontFamily: 'var(--pal-font)', fontSize: '14px', lineHeight: '22px', color: '#000000' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>NAYAN LAB</p>
              <p style={{ margin: '0 0 6px 0', color: 'rgba(0, 0, 0, 0.7)' }}>High-Fidelity Reconstruction</p>
              <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.5)' }}>GaneshNair007/nayan-</p>
            </div>
          </div>
        </div>

        {/* Giant Bottom Wordmark: N A Y A N matching P A L O M I N O */}
        <div style={{ width: '100%', marginTop: 'auto', paddingTop: '32px' }}>
          <div 
            className="pal-giant-wordmark"
            style={{
              fontFamily: 'var(--pal-font)',
              fontSize: 'clamp(72px, 20vw, 320px)',
              fontWeight: 700,
              lineHeight: 0.85,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: '#000000',
              textAlign: 'center',
              userSelect: 'none'
            }}
          >
            NAYAN
          </div>
        </div>
      </footer>
    </>
  );
}
