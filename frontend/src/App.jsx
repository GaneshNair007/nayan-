import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNayanState } from './data/useNayanState';
import { pageTransitionVariants } from './motion/pageTransitions';

// Layout
import AppHeader from './layout/AppHeader';
import SystemDrawer from './layout/SystemDrawer';
import ScenarioDrawer from './layout/ScenarioDrawer';

// Reconstructed Editorial Pages
import LandingPage from './pages/Landing/LandingPage';
import CommandCenterPage from './pages/Command/CommandCenterPage';
import CameraPage from './pages/Camera/CameraPage';
import IncidentPage from './pages/Incident/IncidentPage';
import TrafficPage from './pages/Traffic/TrafficPage';
import CorridorPage from './pages/Corridor/CorridorPage';
import DigitalTwinPage from './pages/DigitalTwin/DigitalTwinPage';
import AuditPage from './pages/Audit/AuditPage';
import AIPage from './pages/AI/AIPage';
import SystemPage from './pages/System/SystemPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-04');
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-CAM-04-LIVE');
  const [systemDrawerOpen, setSystemDrawerOpen] = useState(false);
  const [scenarioDrawerOpen, setScenarioDrawerOpen] = useState(false);

  // Authoritative Unified State Layer
  const {
    capabilities,
    readiness,
    videoCatalogue,
    incidents,
    cameras,
    corridors,
    junctions,
    resources,
    auditEvents,
    aiStatus,
    modelMetrics,
    wsConnected,
    refreshSnapshot
  } = useNayanState();

  const handleSelectCamera = (camId) => {
    setSelectedCameraId(camId);
    setActiveTab('camera-intel');
  };

  const handleSelectIncident = (incId) => {
    setSelectedIncidentId(incId);
    setActiveTab('incident');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Persistent Minimalist Header */}
      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        wsConnected={wsConnected}
        onOpenSystemDrawer={() => setSystemDrawerOpen(true)}
        onOpenScenarioDrawer={() => setScenarioDrawerOpen(true)}
      />

      {/* Main Editorial Content with AnimatePresence Page Transitions */}
      <main style={{ flex: 1, position: 'relative' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LandingPage
                onEnterCommandCenter={() => setActiveTab('command-center')}
                onSelectCamera={handleSelectCamera}
              />
            </motion.div>
          )}

          {activeTab === 'command-center' && (
            <motion.div
              key="command-center"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CommandCenterPage
                incidents={incidents}
                cameras={cameras}
                corridors={corridors}
                onSelectCamera={handleSelectCamera}
                onSelectIncident={handleSelectIncident}
              />
            </motion.div>
          )}

          {activeTab === 'camera-intel' && (
            <motion.div
              key="camera-intel"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CameraPage
                selectedCameraId={selectedCameraId}
                onSelectCamera={setSelectedCameraId}
                videoCatalogue={videoCatalogue}
                onOpenIncident={handleSelectIncident}
              />
            </motion.div>
          )}

          {activeTab === 'incident' && (
            <motion.div
              key="incident"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <IncidentPage
                incidentId={selectedIncidentId}
                incidents={incidents}
                onBack={() => setActiveTab('command-center')}
                onOpenCorridor={() => setActiveTab('corridor')}
                onRefresh={refreshSnapshot}
              />
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div
              key="traffic"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <TrafficPage
                junctions={junctions}
              />
            </motion.div>
          )}

          {activeTab === 'corridor' && (
            <motion.div
              key="corridor"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CorridorPage
                resources={resources}
              />
            </motion.div>
          )}

          {activeTab === 'digital-twin' && (
            <motion.div
              key="digital-twin"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DigitalTwinPage />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AuditPage
                auditEvents={auditEvents}
              />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AIPage
                aiStatus={aiStatus}
                incidents={incidents}
              />
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SystemPage
                capabilities={capabilities}
                readiness={readiness}
                modelMetrics={modelMetrics}
                aiStatus={aiStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-out Technical Telemetry Drawer */}
      <SystemDrawer
        isOpen={systemDrawerOpen}
        onClose={() => setSystemDrawerOpen(false)}
        capabilities={capabilities}
        readiness={readiness}
        aiStatus={aiStatus}
        modelMetrics={modelMetrics}
        onOpenSystemPage={() => {
          setSystemDrawerOpen(false);
          setActiveTab('system');
        }}
      />

      {/* Slide-out Scenario Orchestration Drawer */}
      <ScenarioDrawer
        isOpen={scenarioDrawerOpen}
        onClose={() => setScenarioDrawerOpen(false)}
        onScenarioTriggered={(scenario) => {
          setSelectedCameraId(scenario.camId);
          setActiveTab('camera-intel');
          refreshSnapshot();
        }}
        onResetTriggered={refreshSnapshot}
      />
    </div>
  );
}
