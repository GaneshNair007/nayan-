import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PalominoLanding from './landing/PalominoLanding';
import CommandCenterView from './components/CommandCenterView';
import CameraIntelligenceView from './components/CameraIntelligenceView';
import TrafficControlView from './components/TrafficControlView';
import EmergencyCorridorView from './components/EmergencyCorridorView';
import DigitalTwinView from './components/DigitalTwinView';
import AuditView from './components/AuditView';
import IncidentDrawer from './components/IncidentDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-04');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Core Data Stores
  const [capabilities, setCapabilities] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [videoCatalogue, setVideoCatalogue] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [junctions, setJunctions] = useState([]);
  const [resources, setResources] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);

  // Telemetry & Scenario States
  const [wsConnected, setWsConnected] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  // 1. Initial Snapshot Fetcher via authoritative REST APIs
  const fetchAllSnapshot = useCallback(async () => {
    try {
      const [capsRes, readyRes, vidsRes, incsRes, camsRes, jncsRes, resRes, auditsRes] = await Promise.all([
        fetch('/api/capabilities').catch(() => null),
        fetch('/api/ready').catch(() => null),
        fetch('/api/videos').catch(() => null),
        fetch('/api/incidents').catch(() => null),
        fetch('/api/cameras').catch(() => null),
        fetch('/api/junctions').catch(() => null),
        fetch('/api/resources').catch(() => null),
        fetch('/api/audit').catch(() => null),
      ]);

      if (capsRes?.ok) setCapabilities(await capsRes.json());
      if (readyRes?.ok) setReadiness(await readyRes.json());
      if (vidsRes?.ok) {
        const vData = await vidsRes.json();
        setVideoCatalogue(vData.videos || []);
      }
      if (incsRes?.ok) setIncidents(await incsRes.json());
      if (camsRes?.ok) setCameras(await camsRes.json());
      if (jncsRes?.ok) setJunctions(await jncsRes.json());
      if (resRes?.ok) setResources(await resRes.json());
      if (auditsRes?.ok) setAuditEvents(await auditsRes.json());
    } catch (err) {
      console.error('Snapshot sync error:', err);
    }
  }, []);

  // Run initial fetch on mount
  useEffect(() => {
    fetchAllSnapshot();
    const interval = setInterval(fetchAllSnapshot, 3000); // Polling backup
    return () => clearInterval(interval);
  }, [fetchAllSnapshot]);

  // 2. Realtime WebSocket Stream with Auto-Reconnect
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/events`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          // Handle incoming event envelope
          if (envelope.type?.startsWith('incident.')) {
            fetchAllSnapshot();
          } else if (envelope.type?.startsWith('camera.')) {
            fetchAllSnapshot();
          } else if (envelope.type?.startsWith('corridor.')) {
            fetchAllSnapshot();
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [fetchAllSnapshot]);

  // Scenario Triggers
  const handleRunScenario = async (scenarioType) => {
    setScenarioLoading(true);
    try {
      if (scenarioType === 'golden') {
        setSelectedCameraId('CAM-04');
        setActiveTab('camera-intel');
        await fetch('/api/demo/scenarios/golden/start', { method: 'POST' });
      } else if (scenarioType === 'crowd') {
        setSelectedCameraId('CAM-07');
        setActiveTab('camera-intel');
        await fetch('/api/demo/scenarios/crowd/start', { method: 'POST' });
      } else if (scenarioType === 'baggage') {
        setSelectedCameraId('CAM-11');
        setActiveTab('camera-intel');
        await fetch('/api/demo/scenarios/baggage/start', { method: 'POST' });
      }
      setTimeout(fetchAllSnapshot, 1000);
    } catch (err) {
      console.error('Scenario run error:', err);
    } finally {
      setScenarioLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setSelectedIncidentId(null);
      setDrawerOpen(false);
      fetchAllSnapshot();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSelectCamera = (camId) => {
    setSelectedCameraId(camId);
    setActiveTab('camera-intel');
  };

  const handleSelectIncident = (incId) => {
    setSelectedIncidentId(incId);
    setDrawerOpen(true);
  };

  const activeIncidentObj = incidents.find(i => i.id === selectedIncidentId);
  const criticalCount = incidents.filter(i => i.priority_tier === 'P1' || i.severity === 'CRITICAL').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {activeTab === 'landing' ? (
        <PalominoLanding 
          onEnterCommandCenter={() => setActiveTab('command-center')}
          onSelectCamera={(camId) => {
            setSelectedCameraId(camId);
            setActiveTab('camera-intel');
          }}
        />
      ) : (
        <>
          {/* Top Command Bar */}
          <Header 
            capabilities={capabilities}
            wsConnected={wsConnected}
            onRunScenario={handleRunScenario}
            onReset={handleReset}
            activeScenarioLoading={scenarioLoading}
            onOpenLanding={() => setActiveTab('landing')}
          />

          {/* Navigation Module Strip */}
          <Navigation 
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            incidentCount={incidents.length}
            criticalCount={criticalCount}
          />

          {/* Active Module View */}
          <main style={{ flex: 1, position: 'relative' }}>
            {activeTab === 'command-center' && (
              <CommandCenterView 
                incidents={incidents}
                cameras={cameras}
                junctions={junctions}
                resources={resources}
                onSelectCamera={handleSelectCamera}
                onSelectIncident={handleSelectIncident}
              />
            )}

            {activeTab === 'camera-intel' && (
              <CameraIntelligenceView 
                selectedCameraId={selectedCameraId}
                onSelectCamera={setSelectedCameraId}
                videoCatalogue={videoCatalogue}
                onOpenIncident={handleSelectIncident}
              />
            )}

            {activeTab === 'traffic' && (
              <TrafficControlView 
                junctions={junctions}
              />
            )}

            {activeTab === 'corridor' && (
              <EmergencyCorridorView 
                resources={resources}
              />
            )}

            {activeTab === 'digital-twin' && (
              <DigitalTwinView />
            )}

            {activeTab === 'audit' && (
              <AuditView 
                auditEvents={auditEvents}
              />
            )}

            {/* Slideout Incident Detail Drawer */}
            {drawerOpen && activeIncidentObj && (
              <IncidentDrawer 
                incident={activeIncidentObj}
                onClose={() => setDrawerOpen(false)}
                onAuthorizeResponse={fetchAllSnapshot}
                onDispatched={fetchAllSnapshot}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
