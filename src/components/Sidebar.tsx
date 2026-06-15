import Icon from './Icons'

export type Page = 'pipeline' | 'briefing' | 'actions' | 'conditions' | 'freshness' | 'structuring'

const MAIN_MENU: { icon: string; label: string; page?: Page; live?: boolean }[] = [
  { icon: 'list', label: 'Pipeline', page: 'pipeline' },
  { icon: 'cpu', label: 'AI Briefing', page: 'briefing' },
  { icon: 'alert', label: 'Action List', page: 'actions', live: true },
  { icon: 'shield', label: 'Conditions', page: 'conditions' },
  { icon: 'clock', label: 'Doc Freshness', page: 'freshness' },
  { icon: 'dollar', label: 'Structuring', page: 'structuring' },
]

function NavItem({ item, active, onClick }: { item: { icon: string; label: string; live?: boolean }; active: boolean; onClick: () => void }) {
  return (
    <a href="#" className={`nav-item${active ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); onClick() }}>
      <span className="nav-icon"><Icon name={item.icon} /></span>
      {item.label}
      {item.live && <span className="nav-live" aria-label="Action required" />}
    </a>
  )
}

export default function Sidebar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand brand-simplifyx">
        <img className="brand-mark" src="/simplifyx-logo.svg" alt="SimplifyX" />
        <span className="brand-caption">Mortgage Origination</span>
      </div>

      <nav className="side-nav">
        <p className="nav-section">Loan Officer</p>
        {MAIN_MENU.map((item) => (
          <NavItem key={item.label} item={item} active={item.page === page} onClick={() => item.page && onNavigate(item.page)} />
        ))}
      </nav>

      <div className="side-footer">
        <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}><span className="nav-icon"><Icon name="gear" /></span>Settings</a>
        <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}><span className="nav-icon"><Icon name="help" /></span>Get Help</a>
        <a href="#" className="nav-item logout" onClick={(e) => e.preventDefault()}><span className="nav-icon"><Icon name="logout" /></span>Log Out</a>
      </div>
    </aside>
  )
}
