import React from 'react';

const PROJECTS = [
  {
    id: 'cam04',
    camId: 'CAM-04',
    title: 'Collision Arterial Junction',
    subtitle: 'Cross-trajectory kinematic conflict & persistent deceleration.',
    stillUrl: '/media/nayan/stills/cam04_still_12s.webp',
    videoUrl: '/api/videos/file/cam04_collision.mp4',
    fps: '30.0',
    meta: 'JUNCTION 4 • MG ROAD'
  },
  {
    id: 'cam03',
    camId: 'CAM-03',
    title: 'Emergency Vehicle Priority',
    subtitle: 'Ambulance priority clearance & signal preemption corridor.',
    stillUrl: '/media/nayan/stills/cam03_still_7s.webp',
    videoUrl: '/api/videos/file/cam03_ambulance.mp4',
    fps: '25.0',
    meta: 'JUNCTION 3 • INDIRANAGAR'
  },
  {
    id: 'cam07',
    camId: 'CAM-07',
    title: 'Pedestrian Concourse Dynamics',
    subtitle: 'Temporal density tracking & anomalous gathering alerts.',
    stillUrl: '/media/nayan/stills/cam07_still_10s.webp',
    videoUrl: null,
    fps: '30.0',
    meta: 'TRANSIT HUB 7 • MAJESTIC'
  },
  {
    id: 'cam11',
    camId: 'CAM-11',
    title: 'Unattended Object Invariant',
    subtitle: 'Persistent owner detachment & stationary temporal audit.',
    stillUrl: '/media/nayan/stills/cam11_still_10s.webp',
    videoUrl: null,
    fps: '25.0',
    meta: 'CONCOURSE 11 • TERMINAL'
  }
];

export default function SelectedIntelligence({ onSelectProject, onEnterCommandCenter }) {
  return (
    <section 
      id="selected-projects"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '72px 20px 100px 20px',
        boxSizing: 'border-box',
        zIndex: 25,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: '20px',
          rowGap: '60px',
          maxWidth: '1440px',
          margin: '0 auto'
        }}
      >
        {/* Left Column (Cols 1-4) matching Palomino */}
        <div 
          style={{
            gridColumn: 'span 4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingRight: '30px'
          }}
        >
          <div>
            {/* Section label with white circle bullet matching Palomino */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
              <h2 
                className="pal-p3"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  color: '#ffffff'
                }}
              >
                SELECTED LIVE INTELLIGENCE
              </h2>
            </div>

            {/* Editorial Lead Copy (p1: 30.7px) */}
            <p 
              className="pal-p1"
              style={{
                margin: '0 0 48px 0',
                fontSize: '30.7px',
                fontWeight: 400,
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                color: '#ffffff'
              }}
            >
              Where vision meets ground truth. A continuous stream of verified urban incidents, tracked frame by frame.
            </p>
          </div>

          {/* Action Link: SEE ALL WORK → */}
          <div>
            <a
              href="#command"
              onClick={(e) => {
                e.preventDefault();
                if (onEnterCommandCenter) onEnterCommandCenter();
              }}
              className="pal-nav-item"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span className="pal-char-primary">SEE ALL CAMERAS →</span>
            </a>
          </div>
        </div>

        {/* Right Columns (Cols 5-12) Asymmetric Film Cards */}
        <div 
          style={{
            gridColumn: 'span 8',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            columnGap: '20px',
            rowGap: '64px'
          }}
        >
          {/* Row 1: Card 1 (Wide, cols 1-7) & Card 2 (Narrow, cols 8-12) */}
          <div 
            style={{ gridColumn: 'span 7' }}
            onMouseEnter={() => { if (onSelectProject) onSelectProject(PROJECTS[0]); }}
            onMouseLeave={() => { if (onSelectProject) onSelectProject(null); }}
          >
            <div 
              className="pal-project-card"
              style={{ height: '460px', borderRadius: '2px' }}
            >
              <img 
                src={PROJECTS[0].stillUrl} 
                alt={PROJECTS[0].title}
                className="pal-project-media"
              />
              <div className="pal-project-caption">
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                  {PROJECTS[0].meta}
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                  {PROJECTS[0].subtitle}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 className="pal-p2" style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400 }}>{PROJECTS[0].title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{PROJECTS[0].subtitle}</p>
            </div>
          </div>

          <div 
            style={{ gridColumn: 'span 5' }}
            onMouseEnter={() => { if (onSelectProject) onSelectProject(PROJECTS[1]); }}
            onMouseLeave={() => { if (onSelectProject) onSelectProject(null); }}
          >
            <div 
              className="pal-project-card"
              style={{ height: '460px', borderRadius: '2px' }}
            >
              <img 
                src={PROJECTS[1].stillUrl} 
                alt={PROJECTS[1].title}
                className="pal-project-media"
              />
              <div className="pal-project-caption">
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                  {PROJECTS[1].meta}
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                  {PROJECTS[1].subtitle}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 className="pal-p2" style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400 }}>{PROJECTS[1].title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{PROJECTS[1].subtitle}</p>
            </div>
          </div>

          {/* Row 2: Card 3 (Narrow, cols 1-5) & Card 4 (Wide, cols 6-12) */}
          <div 
            style={{ gridColumn: 'span 5' }}
            onMouseEnter={() => { if (onSelectProject) onSelectProject(PROJECTS[2]); }}
            onMouseLeave={() => { if (onSelectProject) onSelectProject(null); }}
          >
            <div 
              className="pal-project-card"
              style={{ height: '460px', borderRadius: '2px' }}
            >
              <img 
                src={PROJECTS[2].stillUrl} 
                alt={PROJECTS[2].title}
                className="pal-project-media"
              />
              <div className="pal-project-caption">
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                  {PROJECTS[2].meta}
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                  {PROJECTS[2].subtitle}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 className="pal-p2" style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400 }}>{PROJECTS[2].title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{PROJECTS[2].subtitle}</p>
            </div>
          </div>

          <div 
            style={{ gridColumn: 'span 7' }}
            onMouseEnter={() => { if (onSelectProject) onSelectProject(PROJECTS[3]); }}
            onMouseLeave={() => { if (onSelectProject) onSelectProject(null); }}
          >
            <div 
              className="pal-project-card"
              style={{ height: '460px', borderRadius: '2px' }}
            >
              <img 
                src={PROJECTS[3].stillUrl} 
                alt={PROJECTS[3].title}
                className="pal-project-media"
              />
              <div className="pal-project-caption">
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                  {PROJECTS[3].meta}
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                  {PROJECTS[3].subtitle}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <h3 className="pal-p2" style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400 }}>{PROJECTS[3].title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{PROJECTS[3].subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
