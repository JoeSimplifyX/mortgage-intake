import { useState } from 'react'
import Icon from './Icons'
import ProfileMenu from '../ProfileMenu'

const TABS = ['Command Center', 'Pipeline', 'Conditions', 'Closings', 'Reports']

export default function Topbar() {
  const [active, setActive] = useState('Command Center')
  return (
    <header className="topbar">
      <nav className="top-nav">
        {TABS.map((tab) => (
          <a key={tab} href="#" className={active === tab ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActive(tab) }}>{tab}</a>
        ))}
      </nav>
      <div className="top-actions">
        <button className="icon-btn" aria-label="Notifications"><Icon name="bell" /><span className="dot" /></button>
        <button className="icon-btn" aria-label="Messages"><Icon name="mail" /></button>
        <ProfileMenu name="Deepak Bandi" initials="DB" title="Senior Loan Officer" active="officer" />
      </div>
    </header>
  )
}
