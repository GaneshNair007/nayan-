import { modules } from '../design/modules';
export default function Navigation({ activeTab, onSelectTab, criticalCount, cameraCount }) {
  return <nav className="nav-strip" aria-label="Operational modules">{modules.map((tab, index) => <button key={tab.id} className="nav-link" onClick={() => onSelectTab(tab.id)} aria-label={tab.label} aria-current={activeTab === tab.id ? 'page' : undefined}>
    <span className="nav-index">0{index + 1}</span><span className="swap"><span className="swap-inner"><span>{tab.label.toUpperCase()}</span><span aria-hidden="true">{tab.label.toUpperCase()} ↗</span></span></span>
    {tab.id === 'command-center' && criticalCount > 0 && <span className="nav-count">{criticalCount} P1</span>}
    {tab.id === 'camera-intel' && cameraCount != null && <span className="nav-index">{cameraCount}</span>}
  </button>)}</nav>;
}
