import Icon from './Icons'
import type { Loan } from '../lib'

export type Page = 'pipeline' | 'briefing' | 'actions' | 'conditions' | 'freshness' | 'structuring'

// Portfolio-level views — not tied to any one borrower.
const PORTFOLIO: { icon: string; label: string; page: Page; live?: boolean }[] = [
  { icon: 'list', label: 'Pipeline', page: 'pipeline' },
  { icon: 'alert', label: 'Action List', page: 'actions', live: true },
]

// Borrower-scoped views — always relative to the selected borrower.
const BORROWER: { icon: string; label: string; page: Page }[] = [
  { icon: 'cpu', label: 'AI Briefing', page: 'briefing' },
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

export default function Sidebar({ page, onNavigate, loan }: { page: Page; onNavigate: (p: Page) => void; loan: Loan }) {
  return (
    <aside className="sidebar">
      <div className="brand brand-simplifyx">
        <img className="brand-mark" src="/simplifyx-logo.svg" alt="SimplifyX" />
        <span className="brand-caption">Mortgage Origination</span>
      </div>

      <nav className="side-nav">
        <p className="nav-section">Portfolio</p>
        {PORTFOLIO.map((item) => (
          <NavItem key={item.label} item={item} active={item.page === page} onClick={() => onNavigate(item.page)} />
        ))}

        {/* Borrower context — the views below all act on this borrower */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            margin: '16px 6px 8px', padding: '9px 10px',
            background: '#f3f3fb', border: '1px solid var(--line)', borderRadius: 12,
          }}
        >
          <span className="avatar" data-initials={loan.ini} />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, minWidth: 0 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>Selected borrower</span>
            <strong style={{ fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loan.bwr}</strong>
            <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{loan.id}</span>
          </span>
        </div>
        {BORROWER.map((item) => (
          <NavItem key={item.label} item={item} active={item.page === page} onClick={() => onNavigate(item.page)} />
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
