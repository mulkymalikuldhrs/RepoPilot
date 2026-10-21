import { EmptyState } from '../components/EmptyState';
import { Icon, type IconName } from '../components/Icon';
import { PROVIDERS } from '../providers/registry';
import type { ProviderId, RepositoryConfig } from '../domain/types';

interface RepositoriesProps {
  repositories: RepositoryConfig[];
  onAddRepository: () => void;
}

const providerIcons: Record<ProviderId, IconName> = {
  github: 'github',
  gitlab: 'gitlab',
  codeberg: 'codeberg',
  git: 'git',
};

const providerNames = Object.fromEntries(PROVIDERS.map((provider) => [provider.id, provider.name]));

export function Repositories({ repositories, onAddRepository }: RepositoriesProps) {
  return (
    <div className="page">
      <header className="page-heading page-heading-compact">
        <div>
          <div className="eyebrow">WORKSPACE / INVENTORY</div>
          <h1>Repositories</h1>
          <p className="page-subtitle">
            Keep a local inventory of the remotes you choose to manage.
          </p>
        </div>
        <button className="button button-primary" onClick={onAddRepository} type="button">
          <Icon name="plus" size={17} />
          Add repository
        </button>
      </header>

      <div className="inventory-summary">
        <div>
          <span className="inventory-count">{repositories.length}</span>
          <span>saved in this browser</span>
        </div>
        <span className="status-pill status-muted">
          <span className="status-dot status-dot-muted" />
          Provider access is not connected
        </span>
      </div>

      {repositories.length === 0 ? (
        <section className="panel inventory-empty-panel">
          <EmptyState
            icon="repositories"
            title="Your inventory is empty"
            description="Add a remote URL to start a local configuration. RepoPilot will label it unverified until a real provider check is implemented."
            actionLabel="Add first repository"
            onAction={onAddRepository}
          />
        </section>
      ) : (
        <section className="panel inventory-table-panel">
          <div className="table-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>REPOSITORY</th>
                  <th>PROVIDER</th>
                  <th>REMOTE</th>
                  <th>SOURCE BRANCH</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {repositories.map((repository) => (
                  <tr key={repository.id}>
                    <td>
                      <div className="repo-name-cell">
                        <span className={`provider-mark provider-mark-${repository.provider}`}>
                          <Icon name={providerIcons[repository.provider]} size={17} />
                        </span>
                        <span>
                          <strong>{repository.name}</strong>
                          <small>{repository.account || 'Account label not set'}</small>
                        </span>
                      </div>
                    </td>
                    <td>{providerNames[repository.provider]}</td>
                    <td>
                      <code className="remote-code" title={repository.remoteUrl}>
                        {repository.remoteUrl}
                      </code>
                    </td>
                    <td>
                      <span className="branch-tag">{repository.defaultBranch}</span>
                    </td>
                    <td>
                      <span className="status-pill status-unverified">
                        <span className="status-dot status-dot-amber" />
                        Unverified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footnote">
            <Icon name="warning" size={15} />
            Entries are browser-local metadata. No remote has been fetched or authenticated.
          </div>
        </section>
      )}

      <section className="provider-catalog">
        <div className="section-title-row">
          <div>
            <div className="eyebrow">PROVIDER ADAPTERS</div>
            <h2>Designed for multiple accounts</h2>
          </div>
          <span className="status-pill status-muted">Integrations not connected</span>
        </div>
        <div className="provider-grid">
          {PROVIDERS.map((provider) => (
            <article className="provider-card" key={provider.id}>
              <div className={`provider-mark provider-mark-${provider.id}`}>
                <Icon name={providerIcons[provider.id]} size={18} />
              </div>
              <div>
                <strong>{provider.name}</strong>
                <p>{provider.detail}</p>
              </div>
              <span className={`provider-state provider-state-${provider.connectionState}`}>
                {provider.connectionState === 'unverified' ? 'Unverified' : 'Not connected'}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
