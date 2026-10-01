import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASING } from '../motion/easing';

const PROJECTS = [
  {
    id: 'cam04',
    camId: 'CAM-04',
    title: 'Collision Arterial Junction',
    subtitle: 'Cross-trajectory kinematic conflict & persistent deceleration.',
    stillUrl: '/media/nayan/stills/cam04_still_12s.webp',
    videoUrl: '/api/videos/file/cam04_collision.mp4',
    fps: '30.0',
    meta: 'JUNCTION 4 • MG ROAD',
    objectPosition: '50% 45%'
  },
  {
    id: 'cam03',
    camId: 'CAM-03',
    title: 'Emergency Vehicle Priority',
    subtitle: 'Ambulance priority clearance & signal preemption corridor.',
    stillUrl: '/media/nayan/stills/cam03_still_7s.webp',
    videoUrl: '/api/videos/file/cam03_ambulance.mp4',
    fps: '25.0',
    meta: 'JUNCTION 3 • INDIRANAGAR',
    objectPosition: '50% 50%'
  },
  {
    id: 'cam07',
    camId: 'CAM-07',
    title: 'Pedestrian Concourse Dynamics',
    subtitle: 'Temporal density tracking & anomalous gathering alerts.',
    stillUrl: '/media/nayan/stills/cam07_still_10s.webp',
    videoUrl: null,
    fps: '30.0',
    meta: 'TRANSIT HUB 7 • MAJESTIC',
    objectPosition: 'center'
  },
  {
    id: 'cam11',
    camId: 'CAM-11',
    title: 'Unattended Object Invariant',
    subtitle: 'Persistent owner detachment & stationary temporal audit.',
    stillUrl: '/media/nayan/stills/cam11_still_10s.webp',
    videoUrl: null,
    fps: '25.0',
    meta: 'CONCOURSE 11 • TERMINAL',
    objectPosition: 'center'
  }
];

function ProjectCard({ project, height = '460px', onSelectProject, onEnterCommandCenter }) {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll parallax linkage per card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  });

  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : ['-5%', '5%']
  );

  return (
    <motion.div
      ref={cardRef}
      initial="idle"
      whileHover={shouldReduceMotion ? undefined : 'hover'}
      onMouseEnter={() => {
        if (onSelectProject) onSelectProject(project);
      }}
      onMouseLeave={() => {
        if (onSelectProject) onSelectProject(null);
      }}
      onClick={() => {
        if (onEnterCommandCenter) onEnterCommandCenter();
      }}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative',
          height,
          overflow: 'hidden',
          backgroundColor: '#0d0d10',
          borderRadius: '2px'
        }}
      >
        {/* Parallax inner container */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-8%',
            left: 0,
            right: 0,
            bottom: '-8%',
            y: mediaY,
            willChange: 'transform'
          }}
        >
          {/* Measured hover zoom: 1.0 -> 1.08 over 700ms */}
          <motion.img
            src={project.stillUrl}
            alt={project.title}
            loading="lazy"
            variants={{
              idle: { scale: 1.0 },
              hover: {
                scale: 1.08,
                transition: { duration: 0.7, ease: EASING.editorialEase }
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: project.objectPosition,
              display: 'block'
            }}
          />
        </motion.div>

        {/* Hover caption rise from clip mask */}
        <motion.div
          variants={{
            idle: { y: '100%' },
            hover: {
              y: '0%',
              transition: { duration: 0.45, ease: EASING.editorialEase }
            }
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            background:
              'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 80%, transparent 100%)',
            zIndex: 10
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              display: 'block'
            }}
          >
            {project.meta}
          </span>
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.85)'
            }}
          >
            {project.subtitle}
          </p>
        </motion.div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h3
          className="pal-p2"
          style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 400 }}
        >
          {project.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {project.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '40px'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff'
                }}
              />
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
              Where vision meets ground truth. A continuous stream of verified
              urban incidents, tracked frame by frame.
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
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <span>SEE ALL CAMERAS →</span>
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
          <div style={{ gridColumn: 'span 7' }}>
            <ProjectCard
              project={PROJECTS[0]}
              height="460px"
              onSelectProject={onSelectProject}
              onEnterCommandCenter={onEnterCommandCenter}
            />
          </div>

          <div style={{ gridColumn: 'span 5' }}>
            <ProjectCard
              project={PROJECTS[1]}
              height="460px"
              onSelectProject={onSelectProject}
              onEnterCommandCenter={onEnterCommandCenter}
            />
          </div>

          {/* Row 2: Card 3 (Narrow, cols 1-5) & Card 4 (Wide, cols 6-12) */}
          <div style={{ gridColumn: 'span 5' }}>
            <ProjectCard
              project={PROJECTS[2]}
              height="460px"
              onSelectProject={onSelectProject}
              onEnterCommandCenter={onEnterCommandCenter}
            />
          </div>

          <div style={{ gridColumn: 'span 7' }}>
            <ProjectCard
              project={PROJECTS[3]}
              height="460px"
              onSelectProject={onSelectProject}
              onEnterCommandCenter={onEnterCommandCenter}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
