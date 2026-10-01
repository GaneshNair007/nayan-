import { 
  Compass,
  LayoutDashboard, 
  Video, 
  GitFork, 
  Ambulance, 
  Cpu, 
  ScrollText 
} from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab, incidentCount, criticalCount }) {
  const tabs = [
    { id: 'landing', label: 'Overview & Story', icon: Compass, badge: 'PALOMINO' },
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'camera-intel', label: 'Camera Intelligence & Demo Feeds', icon: Video, badge: '8 FEEDS' },
    { id: 'traffic', label: 'Traffic & Signals', icon: GitFork },
    { id: 'corridor', label: 'Emergency Corridor', icon: Ambulance },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { id: 'audit', label: 'Audit Trail', icon: ScrollText }
  ];

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '0 16px 8px 16px',
      borderBottom: '1px solid var(--border-subtle)',
      overflowX: 'auto'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? '600' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span>{tab.label}</span>

            {tab.badge && (
              <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>
                {tab.badge}
              </span>
            )}

            {tab.id === 'command-center' && criticalCount > 0 && (
              <span className="badge badge-critical" style={{ fontSize: '9px', padding: '1px 6px' }}>
                {criticalCount} P1
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
