import React, { useState, useEffect } from 'react';
import LandingHeader from './LandingHeader';
import Hero from './Hero';
import NetworkStrip from './NetworkStrip';
import SelectedIntelligence from './SelectedIntelligence';
import CursorTracker from './CursorTracker';
import KeyFigures from './KeyFigures';
import CapabilitySection from './CapabilitySection';
import Story from './Story';
import EvidenceCases from './EvidenceCases';
import LandingFooter from './LandingFooter';
import { initSmoothScroll } from './motionConfig';
import './landing.css';

export default function PalominoLanding({ onEnterCommandCenter }) {
  const [, setActiveProject] = useState(null);
  const [backendMetrics, setBackendMetrics] = useState({
    mAP50: null,
    ambulancePrecision: null,
    fps: null,
    latency: null,
    cameraCount: null,
    isReady: false,
    isOnline: false
  });

  // Initialize Lenis standalone smooth scroll (GSAP completely eliminated)
  useEffect(() => {
    const scrollInstance = initSmoothScroll();
    return () => {
      if (scrollInstance && typeof scrollInstance.destroy === 'function') {
        scrollInstance.destroy();
      }
    };
  }, []);

  // Fetch real backend data from frozen FastAPI contracts
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendData() {
      try {
        const [readyRes, capRes, camRes, modelRes] = await Promise.allSettled([
          fetch('/api/ready').then((r) => r.json()),
          fetch('/api/capabilities').then((r) => r.json()),
          fetch('/api/cameras').then((r) => r.json()),
          fetch('/api/model/metrics').then((r) => r.json())
        ]);

        if (!isMounted) return;

        const isReady =
          readyRes.status === 'fulfilled' && readyRes.value?.status === 'ready';
        const capabilities = capRes.status === 'fulfilled' ? capRes.value : null;
        const cameras = camRes.status === 'fulfilled' ? camRes.value : [];
        const modelMetrics =
          modelRes.status === 'fulfilled' && modelRes.value?.available
            ? modelRes.value
            : null;

        setBackendMetrics((prev) => ({
          ...prev,
          isReady,
          isOnline: readyRes.status === 'fulfilled',
          cameraCount:
            Array.isArray(cameras) && cameras.length > 0
              ? cameras.length
              : prev.cameraCount,
          fps: capabilities?.runtime?.fps_estimate || prev.fps,
          mAP50:
            modelMetrics?.map50 ?? capabilities?.vision?.map50 ?? prev.mAP50,
          ambulancePrecision:
            modelMetrics?.ambulance_precision ?? prev.ambulancePrecision,
          ambulanceRecall: modelMetrics?.ambulance_recall ?? 0.969,
          epochs: modelMetrics?.epochs_completed ?? 40,
          checkpoint: capabilities?.vision?.checkpoint || 'best.pt',
          modelName: modelMetrics?.model_name || 'NAYAN India V2'
        }));
      } catch (err) {
        console.warn('Backend connection notice: running with frozen benchmark values', err);
        if (isMounted) {
          setBackendMetrics((prev) => ({ ...prev, isOnline: false }));
        }
      }
    }

    fetchBackendData();

    // Optional lightweight status poll every 15s
    const pollInterval = setInterval(fetchBackendData, 15000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <div
      className="pal-root"
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        position: 'relative'
      }}
    >
      {/* 02. HERO SECTION (1.60x scale contraction, deterministic scroll linkage) */}
      <Hero videoSrc="/api/videos/file/cam04_collision.mp4" />

      {/* 03. SYSTEM NETWORK (42px/s continuous MotionValue marquee) */}
      <NetworkStrip />

      {/* 04. SELECTED LIVE INTELLIGENCE (12-col asymmetric film cards, hover zoom) */}
      <SelectedIntelligence
        onSelectProject={setActiveProject}
        onEnterCommandCenter={onEnterCommandCenter}
      />

      {/* INERTIA POINTER TRACKER (Difference dot cursor) */}
      <CursorTracker />

      {/* 05. KEY FIGURES (Viewport-triggered numeric counter animation) */}
      <KeyFigures backendMetrics={backendMetrics} />

      {/* 06. SERVICES & CORE CAPABILITIES (4 stacked pinned sticky layers with parallax) */}
      <CapabilitySection />

      {/* 07. HOW NAYAN WORKS (Our story 2-col editorial spread with ParallaxMedia) */}
      <Story onEnterCommandCenter={onEnterCommandCenter} />

      {/* 08. FORENSIC EVIDENCE CASES (Direction-aware AnimatePresence carousel) */}
      <EvidenceCases />

      {/* 09 & 10. CLOSING STATEMENT CTA & WHITE STICKY FOOTER UNDERLAY */}
      <LandingFooter
        onEnterCommandCenter={onEnterCommandCenter}
        backendMetrics={backendMetrics}
      />
    </div>
  );
}
