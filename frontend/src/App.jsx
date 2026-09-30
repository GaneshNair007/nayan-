import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Navigation, { modules } from './components/Navigation';
import LandingView from './components/LandingView';
import CommandCenterView from './components/CommandCenterView';
import CameraIntelligenceView from './components/CameraIntelligenceView';
import TrafficControlView from './components/TrafficControlView';
import EmergencyCorridorView from './components/EmergencyCorridorView';
import DigitalTwinView from './components/DigitalTwinView';
import AuditView from './components/AuditView';
import IncidentDrawer from './components/IncidentDrawer';
import { Action, Notice } from './components/UI';
import { request, post } from './design/api';
import { motion } from './design/motion';
const paths = { capabilities: '/api/capabilities', videoCatalogue: '/api/videos', incidents: '/api/incidents', cameras: '/api/cameras', junctions: '/api/junctions', resources: '/api/resources', auditEvents: '/api/audit' };
const valid = new Set(['home', ...modules.map(module => module.id)]);
const route = () => valid.has(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'home';
export default function App() {
  const [activeTab, setActiveTab] = useState(route);
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-04');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [data, setData] = useState({ capabilities: null, videoCatalogue: [], incidents: [], cameras: [], junctions: [], resources: [], auditEvents: [] });
  const [syncState, setSyncState] = useState('loading');
  const [failedSources, setFailedSources] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [corridorPlan, setCorridorPlan] = useState(null);
  const mounted = useRef(false);
  const syncing = useRef(null);
  const syncController = useRef(null);
  const fetchAllSnapshot = useCallback(() => {
    if (syncing.current) return syncing.current;
    const controller = new AbortController(); syncController.current = controller;
    const task = (async () => {
      const entries = Object.entries(paths);
      const results = await Promise.allSettled(entries.map(([, url]) => request(url, { signal: controller.signal })));
      if (!mounted.current) return;
      const failures = [];
      const updates = {};
      results.forEach((result, index) => {
        const [key] = entries[index];
        if (result.status === 'fulfilled') updates[key] = key === 'videoCatalogue' ? result.value.videos || [] : result.value;
        else failures.push(key);
      });
      setData(previous => ({ ...previous, ...updates }));
      setFailedSources(failures);
      setSyncState(failures.length === entries.length ? 'error' : failures.length ? 'partial' : 'ready');
    })().finally(() => { syncing.current = null; });
    syncing.current = task;
    return task;
  }, []);
  useEffect(() => {
    mounted.current = true;
    fetchAllSnapshot();
    const timer = setInterval(fetchAllSnapshot, 3000);
    return () => { mounted.current = false; clearInterval(timer); syncController.current?.abort(); };
  }, [fetchAllSnapshot]);
  useEffect(() => {
    const listener = () => { setActiveTab(route()); setSelectedIncidentId(null); };
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);
  useEffect(() => {
    let disposed = false, socket, retry, heartbeat;
    const connect = () => {
      if (disposed) return;
      socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/events`);
      socket.onopen = () => {
        if (disposed) return;
        setWsConnected(true); fetchAllSnapshot();
        heartbeat = setInterval(() => { if (socket.readyState === WebSocket.OPEN) socket.send('ping'); }, 10000);
      };
      socket.onmessage = event => {
        if (disposed) return;
        try { const envelope = JSON.parse(event.data); if (envelope.type !== 'pong') { setLastEventAt(Date.now()); fetchAllSnapshot(); } } catch { /* Invalid envelope does not override snapshot */ }
      };
      socket.onclose = () => { clearInterval(heartbeat); if (!disposed) { setWsConnected(false); retry = setTimeout(connect, 3000); } };
      socket.onerror = () => socket.close();
    };
    connect();
    return () => { disposed = true; clearTimeout(retry); clearInterval(heartbeat); socket?.close(); };
  }, [fetchAllSnapshot]);
  const selectTab = id => { setActiveTab(id); window.location.hash = id; window.scrollTo({ top: 0 }); };
  const handleRunScenario = async type => {
    setScenarioLoading(true); setActionError('');
    try {
      await post(`/api/demo/scenarios/${type}/start`);
      setSelectedCameraId({ golden: 'CAM-04', crowd: 'CAM-07', baggage: 'CAM-11' }[type]);
      if (type === 'golden') setCorridorPlan(null);
      await fetchAllSnapshot(); selectTab('camera-intel');
    } catch (error) { setActionError(error.message); }
    finally { setScenarioLoading(false); }
  };
  const handleReset = async () => {
    setScenarioLoading(true); setActionError('');
    try { await post('/api/demo/reset'); setSelectedIncidentId(null); setCorridorPlan(null); await fetchAllSnapshot(); }
    catch (error) { setActionError(error.message); } finally { setScenarioLoading(false); }
  };
  const selectCamera = id => { setSelectedCameraId(id); selectTab('camera-intel'); };
  const activeIncident = data.incidents.find(incident => incident.id === selectedIncidentId);
  const module = modules.find(item => item.id === activeTab);
  const loaded = syncState === 'ready' || syncState === 'partial';
  return <div style={{ '--motion-fast': `${motion.fast}ms`, '--motion-normal': `${motion.normal}ms`, '--motion-page': `${motion.page}ms` }}>
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    <Header capabilities={data.capabilities} wsConnected={wsConnected} lastEventAt={lastEventAt} onHome={() => selectTab('home')} />
    <Navigation activeTab={activeTab} onSelectTab={selectTab} criticalCount={data.incidents.filter(incident => incident.priority_tier === 'P1').length} cameraCount={loaded && !failedSources.includes('cameras') ? data.cameras.length : null} />
    <div className="scenario-bar"><span className="eyebrow muted">REPLAY LAB / OPERATOR CONTROLS</span><div className="actions">
      <Action onClick={() => handleRunScenario('golden')} disabled={scenarioLoading}>{scenarioLoading ? 'Starting scenario…' : 'Collision demo'}</Action>
      <Action onClick={() => handleRunScenario('crowd')} disabled={scenarioLoading}>Crowd</Action>
      <Action onClick={() => handleRunScenario('baggage')} disabled={scenarioLoading}>Baggage</Action>
      <Action onClick={handleReset} disabled={scenarioLoading}>Reset</Action>
    </div></div>
    {actionError && <div className="global-notice"><Notice error title="ACTION UNAVAILABLE">{actionError}</Notice></div>}
    {syncState === 'error' && <div className="global-notice"><Notice error title="BACKEND CONNECTION UNAVAILABLE" onRetry={fetchAllSnapshot}>Start the local backend on port 8000. Operational values are unavailable until the API responds.</Notice></div>}
    {syncState === 'partial' && <div className="global-notice"><Notice error title="SOME SOURCES UNAVAILABLE" onRetry={fetchAllSnapshot}>{failedSources.join(', ')}. Previously received data may be stale.</Notice></div>}
    <main id="main-content" tabIndex={-1} className="app-main">
      {activeTab === 'home' ? <LandingView videoCatalogue={data.videoCatalogue} onSelectTab={selectTab} /> : <div className="module">
        <div className="module-intro"><div><span className="eyebrow">NAYAN / 0{modules.indexOf(module) + 1} / {module?.label}</span><h1 className="module-title" key={activeTab}>{module?.title}</h1></div><p className="module-description">{module?.description}</p></div>
        {syncState === 'loading' && <Notice title="CONNECTING TO THE CAMERA NETWORK">Reading authoritative snapshots.<div className="loading-line" /></Notice>}
        {activeTab === 'command-center' && <CommandCenterView {...data} available={loaded && !failedSources.some(source => ['incidents', 'cameras', 'resources', 'junctions'].includes(source))} onSelectCamera={selectCamera} onSelectIncident={setSelectedIncidentId} corridorPlan={corridorPlan} />}
        {activeTab === 'camera-intel' && <CameraIntelligenceView selectedCameraId={selectedCameraId} onSelectCamera={setSelectedCameraId} videoCatalogue={data.videoCatalogue} incidents={data.incidents} capabilities={data.capabilities} onOpenIncident={setSelectedIncidentId} />}
        {activeTab === 'traffic' && <TrafficControlView junctions={data.junctions} onRefresh={fetchAllSnapshot} />}
        {activeTab === 'corridor' && <EmergencyCorridorView resources={data.resources} auditEvents={data.auditEvents} corridorPlan={corridorPlan} />}
        {activeTab === 'digital-twin' && <DigitalTwinView />}
        {activeTab === 'audit' && <AuditView auditEvents={data.auditEvents} />}
      </div>}
    </main>
    {activeIncident && <IncidentDrawer incident={activeIncident} resources={data.resources} onClose={() => setSelectedIncidentId(null)} onAuthorizeResponse={fetchAllSnapshot} onDispatched={async result => { setCorridorPlan(result.corridor_plan); await fetchAllSnapshot(); }} />}
    <footer className="module-footer"><span>NAYAN / NETWORKED URBAN INTELLIGENCE</span><span>STAGED VIDEO · SOURCED METRICS · SIMULATION ONLY</span></footer>
  </div>;
}
