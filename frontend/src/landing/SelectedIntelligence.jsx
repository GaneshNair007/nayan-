import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';
import { Radio, ArrowUpRight, ShieldCheck, Activity, Users, AlertOctagon } from 'lucide-react';

const PROJECTS = [
  {
    id: 'cam04',
    index: '01',
    camId: 'CAM-04',
    title: 'Collision Arterial Junction',
    subtitle: 'Cross-trajectory kinematic conflict & persistent deceleration.',
    category: 'traffic',
    tag: 'COLLISION CONFIRMED',
    tagColor: '#ef4444',
    icon: AlertOctagon,
    stillUrl: '/media/nayan/stills/cam04_still_12s.webp',
    videoUrl: '/api/videos/file/cam04_collision.mp4',
    fps: '30.0 FPS',
    meta: 'JUNCTION 4 • MG ROAD',
    telemetry: 'Deceleration 19.9 px/fr² • Trajectory Angle 42°',
    objectPosition: '50% 45%'
  },
  {
    id: 'cam03',
    index: '02',
    camId: 'CAM-03',
    title: 'Emergency Vehicle Priority',
    subtitle: 'Ambulance priority clearance & signal preemption corridor.',
    category: 'traffic',
    tag: 'YIELD CORRIDOR',
    tagColor: '#f59e0b',
    icon: Activity,
    stillUrl: '/media/nayan/stills/cam03_still_7s.webp',
    videoUrl: '/api/videos/file/cam03_ambulance.mp4',
    fps: '25.0 FPS',
    meta: 'JUNCTION 3 • INDIRANAGAR',
    telemetry: 'Approach Clearance 14.0m • Preemption JNC-02',
    objectPosition: '50% 50%'
  },
  {
    id: 'cam07',
    index: '03',
    camId: 'CAM-07',
    title: 'Pedestrian Concourse Dynamics',
    subtitle: 'Temporal density tracking & anomalous gathering alerts.',
    category: 'pedestrian',
    tag: 'DENSITY SURGE',
    tagColor: '#38bdf8',
    icon: Users,
    stillUrl: '/media/nayan/stills/cam07_still_10s.webp',
    videoUrl: '/api/videos/file/cam07_crowd_growth.mp4',
    fps: '30.0 FPS',
    meta: 'TRANSIT HUB 7 • MAJESTIC',
    telemetry: 'Flow Rate 2.4 p/m² • Directional Turbulence',
    objectPosition: 'center'
  },
  {
    id: 'cam11',
    index: '04',
    camId: 'CAM-11',
    title: 'Unattended Object Invariant',
    subtitle: 'Persistent owner detachment & stationary temporal audit.',
    category: 'pedestrian',
    tag: 'ANOMALY DETACHED',
    tagColor: '#c084fc',
    icon: ShieldCheck,
    stillUrl: '/media/nayan/stills/cam11_still_10s.webp',
    videoUrl: '/api/videos/file/cam11_unattended_baggage.mp4',
    fps: '25.0 FPS',
    meta: 'CONCOURSE 11 • TERMINAL',
    telemetry: 'Owner Distance 12.4m • Stationary 180s',
    objectPosition: 'center'
  }
];

function ProjectCard({ project, onSelectProject, onEnterCommandCenter }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const Icon = project.icon;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onSelectProject) onSelectProject(project);
    if (videoRef.current && project.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onSelectProject) onSelectProject(null);
    if (videoRef.current && project.videoUrl) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (onEnterCommandCenter) onEnterCommandCenter();
      }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: EASING.editorialEase }}
    >
      {/* Media Canvas Box with 16:9 Aspect Ratio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          overflow: 'hidden',
          backgroundColor: '#0a0d14',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered ? '0 16px 40px rgba(0, 0, 0, 0.7)' : '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Still Image */}
        <motion.img
          src={project.stillUrl}
          alt={project.title}
          loading="lazy"
          animate={{
            scale: isHovered && !shouldReduceMotion ? 1.05 : 1.0
          }}
          transition={{ duration: 0.6, ease: EASING.editorialEase }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: project.objectPosition,
            display: 'block',
            position: 'absolute',
            inset: 0,
            opacity: isHovered && project.videoUrl ? 0 : 1,
            transition: 'opacity 0.4s ease'
          }}
        />

        {/* Hover Looping Video Feed */}
        {project.videoUrl && (
          <video
            ref={videoRef}
            src={project.videoUrl}
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: project.objectPosition,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.4s ease'
            }}
          />
        )}

        {/* Subtle Top & Bottom Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Floating Telemetry Badges */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          {/* Camera ID & Junction */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              padding: '4px 10px'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
              {project.camId}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>•</span>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.02em' }}>
              {project.meta}
            </span>
          </div>

          {/* Status & FPS Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '4px 8px',
                borderRadius: '999px',
                backgroundColor: `${project.tagColor}22`,
                color: project.tagColor,
                border: `1px solid ${project.tagColor}44`,
                backdropFilter: 'blur(8px)'
              }}
            >
              {project.tag}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '4px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#34d399' }} />
              {project.fps}
            </span>
          </div>
        </div>

        {/* Bottom Floating Telemetry Details */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}
        >
          <div style={{ maxWidth: '80%' }}>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {project.telemetry}
            </div>
          </div>

          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <ArrowUpRight size={16} color={isHovered ? '#000000' : '#ffffff'} />
          </div>
        </div>
      </div>

      {/* Card Footer Metadata (Below Image) */}
      <div style={{ marginTop: '16px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
            {project.index}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: isHovered ? '#38bdf8' : '#ffffff',
              transition: 'color 0.2s ease'
            }}
          >
            {project.title}
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.6)'
          }}
        >
          {project.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export default function SelectedIntelligence({ onSelectProject, onEnterCommandCenter }) {
  const [filter, setFilter] = useState('all');

  const filteredProjects = PROJECTS.filter((p) => {
    if (filter === 'traffic') return p.category === 'traffic';
    if (filter === 'pedestrian') return p.category === 'pedestrian';
    return true;
  });

  return (
    <section
      id="selected-projects"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        padding: '88px 24px 120px 24px',
        boxSizing: 'border-box',
        zIndex: 25,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* 01. FULL-WIDTH HEADER BAR (No more awkward 4-col void!) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '48px',
            paddingBottom: '28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header Left: Section Eyebrow + Big Lead Headline */}
          <div style={{ maxWidth: '680px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 10px #38bdf8'
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#38bdf8'
                }}
              >
                SELECTED LIVE INTELLIGENCE
              </span>
            </div>

            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}
            >
              Where vision meets ground truth.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.55,
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              A continuous stream of verified urban incidents, tracked frame by frame using calibrated planar geometry and CUDA inference.
            </p>
          </div>

          {/* Header Right: Telemetry Tag & CTA Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
            
            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '4px'
              }}
            >
              {[
                { id: 'all', label: 'ALL FEEDS (4)' },
                { id: 'traffic', label: 'VEHICULAR (2)' },
                { id: 'pedestrian', label: 'PEDESTRIAN (2)' }
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    style={{
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Direct Link to Command Center */}
            <a
              href="#command"
              onClick={(e) => {
                e.preventDefault();
                if (onEnterCommandCenter) onEnterCommandCenter();
              }}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* 02. BALANCED 2x2 CINEMATIC CARDS GRID (Harmonious 50/50 symmetry) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            columnGap: '28px',
            rowGap: '44px'
          }}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelectProject={onSelectProject}
              onEnterCommandCenter={onEnterCommandCenter}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
