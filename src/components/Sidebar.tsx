import { Icon, type IconName } from './Icon';

export type PageId =
  | 'overview'
  | 'repositories'
  | 'batch-operations'
  | 'readme-consistency'
  | 'sync-policies'
  | 'repair-policies'
  | 'agents'
  | 'execution-history'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  repositoryCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: IconName;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'repositories', label: 'Repositories', icon: 'repositories' },
  { id: 'batch-operations', label: 'Batch Operations', icon: 'sync', badge: 'New' },
  { id: 'readme-consistency', label: 'README Sync', icon: 'shield', badge: 'Auto' },
  { id: 'sync-policies', label: 'Sync Policies', icon: 'sync' },
  { id: 'repair-policies', label: 'Repair Policies', icon: 'repair' },
  { id: 'agents', label: 'Agents (Jules)', icon: 'agents' },
  { id: 'execution-history', label: 'Execution History', icon: 'runs' },
  { id: 'settings', label: 'Settings & Auth', icon: 'settings' },
];

export function Sidebar({ activePage, onNavigate, repositoryCount }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Icon name="brand" size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-title">REPOPILOT</span>
          <span className="brand-subtitle">CONTROL PLANE</span>
        </div>
      </div>

      <div className="sidebar-version">
        <span className="version-pill">v0.1.0 • PWA</span>
        <span className="status-pill status-safe">
          <span className="status-dot status-dot-safe" />
          No-Backend
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const badgeValue = item.id === 'repositories' ? repositoryCount : item.badge;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon name={item.icon} size={18} />
              <span className="nav-label">{item.label}</span>
              {badgeValue !== undefined && <span className="nav-badge">{badgeValue}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-card">
          <div className="footer-title">
            <Icon name="shield" size={14} />
            BYO Credentials
          </div>
          <p className="footer-desc">Tokens stay in LocalDB / secret manager.</p>
        </div>
      </div>
    </aside>
  );
}
