import {
  CalendarDays,
  CircleUserRound,
  FolderKanban,
  Settings,
} from "lucide-react";
import { useState } from 'react';
import type { DemoSession } from '../demoSession';
import type { AppView } from '../planner';

const navigation = [
  { label: "Calendar", icon: CalendarDays, active: true },
  { label: "Projects", icon: FolderKanban },
];

export function Sidebar({ view, settingsOpen, onNavigate, onSettings, session, onAccount, onLogout }: { view: AppView; settingsOpen: boolean; onNavigate: (view: AppView) => void; onSettings: () => void; session: DemoSession; onAccount: () => void; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-lockup" title="Planit">
        <div className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </div>
        <div>
          <p className="brand-name">Planit</p>
          <p className="brand-caption">Plan with intention</p>
        </div>
      </div>

      <nav className="nav-list">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            className={`nav-item${view === label && !settingsOpen ? " active" : ""}`}
            key={label}
            type="button"
            aria-label={label}
            title={label}
            aria-current={view === label && !settingsOpen ? "page" : undefined}
            onClick={() => onNavigate(label as AppView)}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
            {view === label && !settingsOpen && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <button className={`nav-item settings-item${settingsOpen ? ' active' : ''}`} type="button" onClick={onSettings} aria-expanded={settingsOpen} aria-label="Settings" title="Settings">
        <Settings size={17} strokeWidth={1.8} />
        <span>Settings</span>
      </button>

      <div className="profile-area" onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false); }}>
        {menuOpen && <div className="account-menu"><strong>{session.name}</strong><small>{session.email}</small><button onClick={() => { setMenuOpen(false); onAccount(); }}>Account settings</button><button onClick={() => { setMenuOpen(false); onLogout(); }}>Log out</button></div>}
        <button className="profile-row" title="Account" aria-label="Open account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><CircleUserRound size={30} strokeWidth={1.5} /><div><strong>{session.name}</strong><span>{session.email}</span></div></button>
      </div>
    </aside>
  );
}
