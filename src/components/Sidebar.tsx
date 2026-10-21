import { Icon, type IconName } from './Icon';

export type PageId =
  'overview' | 'repositories' | 'sync' | 'repairs' | 'agents' | 'runs' | 'settings';

const navigation: { id: PageId; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'repositories', label: 'Repositories', icon: 'repositories' },
  { id: 'sync', label: 'Sync policies', icon: 'sync' },
  { id: 'repairs', label: 'Repair policies', icon: 'repair' },
  { id: 'agents', label: 'Agents', icon: 'agents' },
  { id: 'runs', label: 'Execution history', icon: 'runs' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

interface SidebarProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  onAddRepository: () => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ page, onNavigate, onAddRepository, open, onClose }: SidebarProps) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>RepoPilot</strong>
            <span>REPOSITORY CONTROL</span>
          </div>
        </div>

        <div className="workspace-select" aria-label="Current workspace">
          <span className="workspace-avatar">RP</span>
          <span className="workspace-name">
            <strong>Personal workspace</strong>
            <small>Local profile</small>
          </span>
          <Icon name="chevron" size={16} />
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-item${page === item.id ? ' nav-item-active' : ''}`}
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
              {item.id === 'repositories' && <span className="nav-count">local</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="runner-card">
            <div className="runner-card-top">
              <span className="status-dot status-dot-muted" />
              <span>RUNNER STATUS</span>
            </div>
            <strong>Not connected</strong>
            <p>Execution stays in an environment you control.</p>
          </div>
          <button className="sidebar-add" type="button" onClick={onAddRepository}>
            <Icon name="plus" size={16} />
            <span>Add repository</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">P</div>
            <div>
              <strong>Local profile</strong>
              <span>No account connected</span>
            </div>
            <Icon name="settings" size={16} />
          </div>
        </div>
      </aside>
    </>
  );
}
