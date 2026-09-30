export const modules = [
  { id: 'command-center', label: 'Command', title: 'COMMAND CENTER', description: 'A single operational view of observations, verified incidents and available response resources.' },
  { id: 'camera-intel', label: 'Cameras', title: 'SEE. VERIFY.', description: 'Staged CCTV. Actual backend tracking. Evidence and confidence remain separate.' },
  { id: 'traffic', label: 'Traffic', title: 'TRAFFIC CONTROL', description: 'Understand junction pressure and request a safe signal recommendation. Simulation only.' },
  { id: 'corridor', label: 'Corridor', title: 'DYNAMIC YIELD CORRIDOR', description: 'Create passage through heterogeneous traffic. Inspect clearance, compression and routing decisions.' },
  { id: 'digital-twin', label: 'Twin', title: 'FIXED VS ADAPTIVE', description: 'Compare identical demand using the backend’s deterministic demonstration. Results are explicitly mocked.' },
  { id: 'audit', label: 'Audit', title: 'EVERY DECISION.', description: 'Trace the observations, state transitions and operator decisions behind each response.' },
];
export default function Navigation({ activeTab, onSelectTab, criticalCount, cameraCount }) {
  return <nav className="nav-strip" aria-label="Operational modules">{modules.map((tab, index) => <button key={tab.id} className="nav-link" onClick={() => onSelectTab(tab.id)} aria-label={tab.label} aria-current={activeTab === tab.id ? 'page' : undefined}>
    <span className="nav-index">0{index + 1}</span><span className="swap"><span className="swap-inner"><span>{tab.label.toUpperCase()}</span><span aria-hidden="true">{tab.label.toUpperCase()} ↗</span></span></span>
    {tab.id === 'command-center' && criticalCount > 0 && <span className="nav-count">{criticalCount} P1</span>}
    {tab.id === 'camera-intel' && cameraCount != null && <span className="nav-index">{cameraCount}</span>}
  </button>)}</nav>;
}
