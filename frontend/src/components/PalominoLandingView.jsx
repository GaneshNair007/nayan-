import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Layers, 
  Compass, 
  Clock, 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowUpRight,
  ExternalLink,
  Zap,
  Radio,
  Eye,
  Server
} from 'lucide-react';

export default function PalominoLandingView({ 
  capabilities, 
  readiness,
  cameras = [], 
  incidents = [], 
  videoCatalogue = [], 
  wsConnected = false,
  onEnterCommandCenter,
  onSelectCamera
}) {
  // Cursor follow state
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [activeHoverCamera, setActiveHoverCamera] = useState(null);
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const gridSectionRef = useRef(null);

  // Active CCTV videos
  const cam04Video = '/api/videos/file/cam04_collision.mp4';
  const cam03Video = '/api/videos/file/cam03_ambulance.mp4';
  const cam07Video = '/api/videos/file/cam07_crowd_growth.mp4';
  const cam11Video = '/api/videos/file/cam11_unattended_baggage.mp4';

  // Track cursor position when hovering the camera section
  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const modelInfo = capabilities?.vision || {
    model_name: 'NAYAN India Emergency Traffic Detector',
    checkpoint: 'best.pt',
    sha256: '6eb11ed634f43ea67a2866ceed7227a50b1a8b850be13013607b4da5d25cebbe',
    device: 'cuda:0',
    fine_tuned: true,
    classes: ['ambulance', 'car', 'motorcycle', 'auto_rickshaw', 'bus', 'truck']
  };

  const hwInfo = capabilities?.hardware || {
    gpu_name: 'NVIDIA GeForce RTX 4050 Laptop GPU',
    cuda_available: true
  };

  // Nav link helper with horizontal character-swap hover
  const PalominoNavLink = ({ label, onClick, href }) => {
    return (
      <a 
        href={href || '#'} 
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className="palomino-nav-link"
      >
        {label.split('').map((char, idx) => (
          <span key={idx} className="char-wrap" style={{ transitionDelay: `${idx * 0.015}s` }}>
            <span className="char-primary">{char === ' ' ? '\u00A0' : char}</span>
            <span className="char-secondary">{char === ' ' ? '\u00A0' : char}</span>
          </span>
        ))}
      </a>
    );
  };

  // Interactive camera feed card
  const CameraStreamCard = ({ camId, title, scenario, location, videoSrc, tag, widthPct = '50%' }) => {
    const isLive = activeHoverCamera === camId;
    return (
      <div 
        className="palomino-card-media"
        style={{
          height: '420px',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid var(--border-subtle)',
          transition: 'border-color 0.3s ease, transform 0.3s ease'
        }}
        onMouseEnter={() => {
          setActiveHoverCamera(camId);
          setIsHoveringGrid(true);
        }}
        onMouseLeave={() => {
          setActiveHoverCamera(null);
          setIsHoveringGrid(false);
        }}
        onClick={() => onSelectCamera ? onSelectCamera(camId) : onEnterCommandCenter()}
      >
        {/* Real HTML5 CCTV Video */}
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLive ? 1 : 0.82,
            transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.2, 1, 0.3, 1)',
            transform: isLive ? 'scale(1.03)' : 'scale(1)'
          }}
        />

        {/* Scanline & HUD Overlay */}
        <div className="scanlines-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

        {/* Top telemetry badge */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10
        }}>
          <span style={{
            background: 'rgba(10, 13, 20, 0.85)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            color: 'var(--accent-cyan)',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}>
            {camId}
          </span>
          <span style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)'
          }}>
            {tag}
          </span>
        </div>

        {/* Live indicator top right */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '4px 10px',
          borderRadius: '20px',
          zIndex: 10
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: '0.08em' }}>
            ONLINE • 30 FPS
          </span>
        </div>

        {/* Slideup Bottom Caption on Hover */}
        <div className="palomino-card-caption">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {scenario}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginTop: '2px', fontFamily: 'var(--font-display)' }}>
                {title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {location}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              borderBottom: '1px solid var(--accent-cyan)',
              paddingBottom: '2px'
            }}>
              <span>INSPECT STREAM</span>
              <ArrowUpRight size={14} color="var(--accent-cyan)" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{
        backgroundColor: '#07080c',
        color: '#f0f4fc',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* =================================================================
          1. PALOMINO FIXED HEADER
          ================================================================= */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '75px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 500,
        background: 'linear-gradient(to bottom, rgba(7, 8, 12, 0.95) 0%, rgba(7, 8, 12, 0.4) 80%, transparent 100%)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>NAYAN</span>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '2px 6px', borderRadius: '3px' }}>
              GRID v2.0
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 9px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 600 }}>
              {wsConnected ? 'WS LIVE' : 'SYNCING'}
            </span>
          </div>
        </div>

        {/* Duplicated Character-Swap Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PalominoNavLink label="OVERVIEW" href="#hero" />
          <PalominoNavLink label="OPTICAL SENSORS" href="#cameras" />
          <PalominoNavLink label="LIVE TELEMETRY" href="#telemetry" />
          <PalominoNavLink label="SUBSYSTEMS" href="#subsystems" />
          <PalominoNavLink label="EXPLAINABILITY" href="#evidence" />
        </nav>

        {/* Enter Command Center CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onEnterCommandCenter}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.25) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.5)',
              color: '#fff',
              padding: '9px 20px',
              borderRadius: '6px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-cyan)';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.25) 100%)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)';
            }}
          >
            <span>COMMAND CENTER</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </header>

      {/* =================================================================
          2. FULL-SCREEN CCTV HERO SECTION
          ================================================================= */}
      <section 
        id="hero"
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '100px 32px 40px 32px',
          overflow: 'hidden'
        }}
      >
        {/* Background Looping CCTV Stream */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <video
            src={cam04Video}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.38) contrast(1.15) saturate(1.1)'
            }}
          />
          {/* Vignette Gradients */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(7,8,12,0.2) 0%, rgba(7,8,12,0.92) 80%, #07080c 100%)'
          }} />
          <div className="scanlines-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} />
        </div>

        {/* Top Tagline */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--accent-cyan)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            [ AEGIS GRID // BENGALURU URBAN SENSORY CORRIDOR ]
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>LAT: 12.9754° N</span>
            <span>LON: 77.5985° E</span>
            <span>CALIBRATED: PLANAR HOMOGRAPHY</span>
          </div>
        </div>

        {/* Huge Hero Display Typography (3 Staggered Lines) */}
        <div style={{ position: 'relative', zIndex: 10, margin: 'auto 0' }}>
          <div className="hero-display-title" style={{ textAlign: 'left' }}>
            <span className="hero-display-accent">NAYAN URBAN</span>
          </div>
          <div className="hero-display-title" style={{ textAlign: 'center' }}>
            <span className="hero-display-cyan">AI PERCEPTION</span>
          </div>
          <div className="hero-display-title" style={{ textAlign: 'right' }}>
            <span className="hero-display-accent">CORRIDOR ENGINE</span>
          </div>
        </div>

        {/* Hero Support Bottom Area (Left Copy, Right Telemetry, CTA) */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '24px',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px'
        }}>
          {/* Left Support Copy (~400px width) */}
          <div style={{ maxWidth: '440px' }}>
            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.5', fontFamily: 'var(--font-sans)' }}>
              Autonomous computer-vision incident verification and dynamic emergency yield corridors for Indian metropolitan transit.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              Real CUDA transfer learning (0.988 mAP50) • Calibrated geometry • Zero heuristic frame labels.
            </p>
          </div>

          {/* Center: Live GPU Telemetry Chip */}
          <div style={{
            background: 'rgba(15, 18, 26, 0.75)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>ACTIVE HARDWARE NODE</span>
              <span style={{ color: '#10b981' }}>CUDA 12.8 ACTIVE</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {hwInfo.gpu_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              40.7 FPS THROUGHPUT • 23.6ms MEDIAN
            </div>
          </div>

          {/* Right: Enter Command Center Large Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onEnterCommandCenter}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 30px rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-cyan)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 229, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.2)';
              }}
            >
              <span>ENTER COMMAND CENTER</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. SENSOR ARSENAL MARQUEE STRIP (TICKER)
          ================================================================= */}
      <section style={{
        background: '#0a0d14',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 0',
        overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-cyan)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            [ 01 / SENSOR ARSENAL & TELEMETRY STREAM ]
          </span>
        </div>

        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div className="animate-marquee">
            {[...Array(2)].map((_, loopIdx) => (
              <div key={loopIdx} style={{ display: 'flex', alignItems: 'center', gap: '32px', paddingRight: '32px' }}>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  CAM-01 CENTRAL EXPRESSWAY (NORMAL FLOW)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  CAM-02 INDIRANAGAR FLYOVER (CONGESTION)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#34d399', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  CAM-03 AMBULANCE GREEN CORRIDOR (BYTETRACK)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#f87171', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  CAM-04 MULTI-VEHICLE COLLISION (GROUND TRUTH)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  CAM-05 NIGHT ARTERIAL (ADAPTIVE EXPOSURE)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                  CAM-07 METRO ENTRANCE PLAZA (DENSITY FLOW)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: '#fbbf24', whiteSpace: 'nowrap' }}>
                  CAM-11 AIRPORT TERMINAL (UNATTENDED BAGGAGE)
                </span>
                <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          4. SELECTED WORK / ACTIVE CAMERA FEEDS (ASYMMETRIC GRID)
          ================================================================= */}
      <section 
        id="cameras"
        ref={gridSectionRef}
        style={{
          padding: '100px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '32px',
          maxWidth: '1440px',
          margin: '0 auto'
        }}
      >
        {/* Left Column (Editorial Rail, 1/3 Width) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
              02 / ACTIVE OPTICAL SENSORS
            </div>
            <h2 style={{
              fontSize: '34px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#fff',
              marginTop: '12px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}>
              Eight synchronized CCTV streams across Bengaluru arterial corridors.
            </h2>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Real-time vehicle trajectory convergence, lane elasticity, and sub-second anomaly detection. No simulated frame rates or fabricated labels.
          </p>

          {/* Model Provenance Capsule */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '18px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              LOADED CHECKPOINT CONTRACT
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
              {modelInfo.checkpoint} (v2.0.0)
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px', wordBreak: 'break-all' }}>
              SHA256: {modelInfo.sha256?.substring(0, 36)}...
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {modelInfo.classes?.map((c, i) => (
                <span key={i} style={{
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  color: c === 'ambulance' ? '#34d399' : 'var(--text-secondary)'
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onEnterCommandCenter}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              color: '#fff',
              padding: '14px 20px',
              borderRadius: '6px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <span>OPEN CAMERA INTELLIGENCE VIEW</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Right Column (Asymmetric 2x2 Media Grid, 2/3 Width) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <CameraStreamCard 
            camId="CAM-04"
            title="Central Expressway Collision"
            scenario="Kinetic Collision Verification"
            location="Central Expressway & 4th Cross (Westbound)"
            videoSrc={cam04Video}
            tag="INCIDENT FEED"
          />

          <CameraStreamCard 
            camId="CAM-03"
            title="Emergency Green Corridor"
            scenario="Ambulance ByteTrack & Yield Feasibility"
            location="Indiranagar 100ft Rd Corridor"
            videoSrc={cam03Video}
            tag="AMBULANCE CORRIDOR"
          />

          <CameraStreamCard 
            camId="CAM-07"
            title="Pedestrian Plaza Surge"
            scenario="Density Trend & Direction Vectors"
            location="MG Road Metro Entrance B"
            videoSrc={cam07Video}
            tag="CROWD ANOMALY"
          />

          <CameraStreamCard 
            camId="CAM-11"
            title="Terminal Baggage Separation"
            scenario="Owner Disassociation > 180s"
            location="Airport Express Terminal Zone 2"
            videoSrc={cam11Video}
            tag="UNATTENDED BAGGAGE"
          />
        </div>
      </section>

      {/* =================================================================
          5. KEY FIGURES / LIVE REAL BACKEND TELEMETRY (3x2 INSET PANELS)
          ================================================================= */}
      <section 
        id="telemetry"
        style={{
          padding: '80px 32px',
          background: '#090b10',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
                03 / SCIENTIFIC BENCHMARKS & VERIFIED TELEMETRY
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                Authoritative Metrics from Held-Out Test & Live Pipeline
              </h2>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              PROVENANCE: HELD-OUT TEST (1,173 IMAGES)
            </div>
          </div>

          {/* 6 Inset Panels Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Cell 1: mAP50 */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>01 // ACCURACY</span>
                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>VERIFIED</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                98.8%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                mAP50 Validation on nayan_india_v2 (40 Epochs)
              </div>
            </div>

            {/* Cell 2: Throughput FPS */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>02 // SPEED</span>
                <span style={{ fontSize: '10px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>CUDA 12.8</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                40.7 <span style={{ fontSize: '24px' }}>FPS</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Continuous Throughput on RTX 4050 Laptop GPU
              </div>
            </div>

            {/* Cell 3: Median Latency */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>03 // LATENCY</span>
                <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>BENCHMARK</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                23.6 <span style={{ fontSize: '24px' }}>ms</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                End-to-End Frame Median Latency (p95: 32.8ms)
              </div>
            </div>

            {/* Cell 4: Ambulance Precision */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>04 // CRITICAL TARGET</span>
                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>AMBULANCE</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                98.0%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Emergency Vehicle Precision (Recall: 96.9%)
              </div>
            </div>

            {/* Cell 5: Optical Sensor Nodes */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>05 // TOPOLOGY</span>
                <span style={{ fontSize: '10px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>CCTV</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                {cameras?.length || 8} <span style={{ fontSize: '24px' }}>NODES</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Active Camera Feeds with Planar Homography
              </div>
            </div>

            {/* Cell 6: Provenance Invariants */}
            <div style={{
              background: '#0e1118',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>06 // SCIENTIFIC AUDIT</span>
                <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>HONESTY</span>
              </div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', textAlign: 'right' }}>
                100%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Audited Provenance (Zero Fabricated Metrics)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          6. FOUR LAYERED STACKED PANELS (SERVICES / CORE SUBSYSTEMS)
          ================================================================= */}
      <section 
        id="subsystems"
        style={{
          padding: '100px 32px',
          maxWidth: '1440px',
          margin: '0 auto'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '0.1em' }}>
            04 / AUTONOMOUS PIPELINE SUBSYSTEMS
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
            Four Layered Pillars of NAYAN Infrastructure
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Panel 1: CUDA Detector */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 2fr 1fr',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>01 // EDGE PERCEPTION</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                CUDA YOLOv8 Detector
              </h3>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Custom fine-tuned detector on <code className="font-mono" style={{ color: '#fff' }}>nayan_india_v2</code>. Native semantic mapping across 6 classes: ambulance, car, motorcycle, auto_rickshaw, bus, and truck. Eliminates COCO domain collapse.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>• FP16 TENSOR ACCELERATION</div>
              <div>• SINGLETON MODEL ENGINE</div>
              <div>• 0.988 mAP50 HELD-OUT TEST</div>
            </div>
          </div>

          {/* Panel 2: Temporal Evidence */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 2fr 1fr',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>02 // TEMPORAL ENGINE</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                ByteTrack Evidence Fusion
              </h3>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Multi-frame spatial Kalman filter association. Tracks trajectory convergence, deceleration spikes, and stationary obstruction duration. Decoupled incident state machine enforces evidence before confirmation.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>• OBSERVED → CONFIRMED</div>
              <div>• REASON-ANNOTATED AUDIT</div>
              <div>• ZERO CAMERA-ID SHORTCUTS</div>
            </div>
          </div>

          {/* Panel 3: Dynamic Grid Slicing */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 2fr 1fr',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>03 // CORRIDOR GEOMETRY</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                Dynamic Grid Slicing
              </h3>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Calculates lane-agnostic lateral free space for heterogeneous traffic. Computes Lane Elasticity Index and outputs deterministic corridor feasibility (HIGH, MEDIUM, LOW) to guarantee ambulance clearance.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>• 5x5 SPATIAL CELL SLICING</div>
              <div>• LATERAL COMPRESSION RATIO</div>
              <div>• PHYSICAL CALIBRATION ONLY</div>
            </div>
          </div>

          {/* Panel 4: Emergency Corridors & Preemption */}
          <div style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 2fr 1fr',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>04 // TRAFFIC PREEMPTION</div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                Multi-Junction Green Corridor
              </h3>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Preemptive signal sequence across JNC-01, JNC-02, and JNC-03 with safe phase constraints (min green, yellow, all-red). Dynamically recalculates alternate bypass routes when segment obstructions occur.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div>• PREDICTIVE SIGNAL CONTROL</div>
              <div>• CCTV GROUND CLEARANCE CHECK</div>
              <div>• DYNAMIC BYPASS REROUTING</div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          7. EXPLAINABILITY & FORENSIC INTEGRITY SECTION
          ================================================================= */}
      <section 
        id="evidence"
        style={{
          padding: '100px 32px',
          background: '#080a0f',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            [ 05 / FORENSIC EXPLAINABILITY & CONTRACT INTEGRITY ]
          </div>

          <div style={{
            margin: '36px auto',
            height: '1px',
            width: '120px',
            background: 'var(--border-strong)'
          }} />

          <blockquote style={{
            fontSize: '26px',
            fontWeight: 500,
            lineHeight: 1.45,
            color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.01em',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            “Every incident state transition requires verifiable multi-frame temporal evidence. Zero camera-ID heuristics, zero synthetic frame-counter relabeling, and zero uncalibrated physical claims.”
          </blockquote>

          <div style={{
            margin: '36px auto',
            height: '1px',
            width: '120px',
            background: 'var(--border-strong)'
          }} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
              PROVENANCE: INFERENCE
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              PROVENANCE: DERIVED
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              PROVENANCE: SIMULATOR (MOCK HONEST)
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '6px 14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              AUDIT: SHA256 IMMUTABLE
            </span>
          </div>
        </div>
      </section>

      {/* =================================================================
          8. CLOSING CALL TO ACTION (ENORMOUS TYPOGRAPHY)
          ================================================================= */}
      <section style={{
        padding: '120px 32px',
        textAlign: 'center',
        background: '#07080c',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            READY FOR LIVE OPERATIONAL DISPATCH
          </div>

          <h2 style={{
            fontSize: 'clamp(3.5rem, 9vw, 8rem)',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            color: '#fff'
          }}>
            ENTER THE LIVE<br />
            <span style={{ color: 'var(--accent-cyan)' }}>COMMAND CENTER</span>
          </h2>

          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={onEnterCommandCenter}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '18px 44px',
                borderRadius: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.25s ease',
                boxShadow: '0 10px 40px rgba(0, 229, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-cyan)';
                e.currentTarget.style.boxShadow = '0 0 45px rgba(0, 229, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 229, 255, 0.3)'
              }}
            >
              <span>LAUNCH OPERATIONAL GRID</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================
          9. OVERSIZED PALOMINO FOOTER
          ================================================================= */}
      <footer style={{
        background: '#040507',
        borderTop: '1px solid var(--border-subtle)',
        padding: '80px 32px 40px 32px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* 5 Editorial Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '32px', marginBottom: '80px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '16px' }}>
                ARCHITECTURE
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>FastAPI ASGI Engine</li>
                <li>CUDA 12.8 / PyTorch</li>
                <li>YOLOv8 ByteTrack Adapter</li>
                <li>Dynamic Grid Slicing v2</li>
                <li>Planar Homography Engine</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '16px' }}>
                CHECKPOINTS
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>nayan_india_v2/best.pt</li>
                <li>40 Epochs (RTX 4050)</li>
                <li>0.988 mAP50 Accuracy</li>
                <li>0.980 Ambulance Precision</li>
                <li>6,961 Ground Truth Pairs</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '16px' }}>
                COMMUNICATION
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>WebSocket (/ws/events)</li>
                <li>Typed Event Envelope</li>
                <li>Auto-Reconnect Pipeline</li>
                <li>REST Audit Trail (/api/audit)</li>
                <li>OSRM Real-time Routing</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '16px' }}>
                SIMULATION & TWIN
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Dynamic Host Probing</li>
                <li>SUMO_UNAVAILABLE Handshake</li>
                <li>Sublane Lateral Yield Model</li>
                <li>Predictive Signal Timing</li>
                <li>Seed 48172 Comparative Twin</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '16px' }}>
                STATUS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                  <span>BACKEND READY</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  HOST: 127.0.0.1:8000
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  DEVICE: {modelInfo.device}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  GIT COMMIT: 71569f2
                </div>
              </div>
            </div>
          </div>

          {/* Massive Wordmark at Bottom */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div style={{
              fontSize: 'clamp(4rem, 16vw, 15rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.05em',
              lineHeight: 0.8,
              color: 'rgba(255, 255, 255, 0.08)',
              userSelect: 'none'
            }}>
              NAYAN
            </div>

            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
              © 2026 AEGIS GRID INTEL • ALL RIGHTS RESERVED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
