import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { clockLabel, type CalendarPreferences } from '../planner';
import { TimezoneSelect } from './TimezoneSelect';
import { themes } from '../appearance';
import type { DemoSession } from '../demoSession';

export function SettingsPanel({ preferences: p, onChange, onClose, session, onLogout, initialTab = 'Appearance' }: { preferences: CalendarPreferences; onChange: (p: CalendarPreferences) => void; onClose: () => void; session: DemoSession; onLogout: () => void; initialTab?: 'Appearance' | 'Account' }) {
  const [tab, setTab] = useState<string>(initialTab);
  return <aside className="context-panel settings-panel" aria-label="Calendar settings" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <header className="voice-panel-header"><div><span className="voice-header-icon"><Settings size={16} /></span><strong>Settings</strong></div><button onClick={onClose} aria-label="Close settings"><X size={16} /></button></header>
    <div className="settings-tabs" role="tablist" aria-label="Settings sections" aria-orientation="vertical">{['Appearance', 'Calendar', 'Account'].map(name => <button key={name} id={`settings-tab-${name}`} type="button" role="tab" aria-selected={tab === name} aria-controls="settings-content" onClick={() => setTab(name)}>{name}</button>)}</div>
    <section id="settings-content" role="tabpanel" aria-labelledby={`settings-tab-${tab}`}>
    {tab === 'Appearance' && <div className="panel-form"><h3 className="settings-section-title">Your kind of calm</h3><p className="section-note">One planner, a few different moods. Choose the palette that feels like you.</p>
      <div className="theme-options" aria-label="Theme">{themes.map(theme => <button className="theme-option" key={theme.id} aria-label={theme.name} aria-pressed={p.theme === theme.id} onClick={() => onChange({ ...p, theme: theme.id })}><span className="theme-preview" aria-hidden="true" style={{ background: theme.background }}><i style={{ background: theme.surface }} /><span><b style={{ background: theme.accent }} /><b style={{ background: theme.surface }} /><b style={{ background: theme.accent, opacity: .35 }} /></span></span><span className="theme-copy"><strong>{theme.name}</strong><small>{theme.description}</small></span><span className="theme-check" aria-hidden="true">{p.theme === theme.id ? '✓' : ''}</span></button>)}</div>
      <h3 className="settings-section-title">Event color behavior</h3><label className="preference-toggle"><span>Inherit project colors by default<small>For new events. Existing overrides stay unchanged.</small></span><input type="checkbox" checked={p.inheritProjectColor} onChange={event => onChange({ ...p, inheritProjectColor: event.target.checked })} /></label><p className="section-note">Change a project’s default color in Projects, or choose a custom color in any event editor.</p>
    </div>}
    {tab === 'Calendar' && <div className="panel-form">
      <p className="section-note">Changes appear immediately and are saved on this device.</p>
      <label><span>Calendar visible start time</span><select disabled={p.fullDay} value={p.startHour} onChange={event => { const startHour = Number(event.target.value); onChange({ ...p, startHour, endHour: Math.max(p.endHour, startHour + 1) }); }}>{Array.from({ length: 24 }, (_, hour) => <option value={hour} key={hour}>{clockLabel(hour * 60, p.format)}</option>)}</select></label>
      <label><span>Calendar visible end time</span><select disabled={p.fullDay} value={p.endHour} onChange={event => onChange({ ...p, endHour: Number(event.target.value) })}>{Array.from({ length: 25 - p.startHour }, (_, n) => p.startHour + n + 1).map(hour => <option value={hour} key={hour}>{clockLabel(hour * 60, p.format)}{hour >= 24 ? ' (next day)' : ''}</option>)}</select></label>
      <label className="preference-toggle"><span>Full 24-hour view<small>Display 00:00–24:00</small></span><input aria-label="Full 24-hour view" type="checkbox" role="switch" checked={p.fullDay} onChange={event => onChange({ ...p, fullDay: event.target.checked })} /></label>
      <label><span>Time format</span><select aria-label="Time format" value={p.format} onChange={event => onChange({ ...p, format: event.target.value as '12' | '24' })}><option value="12">12-hour</option><option value="24">24-hour</option></select></label>
      <TimezoneSelect value={p.timezone} onChange={timezone => onChange({ ...p, timezone })} />
      <label className="preference-toggle"><span>Show weekends</span><input aria-label="Show weekends" type="checkbox" checked={p.showWeekends} onChange={event => onChange({ ...p, showWeekends: event.target.checked })} /></label>
      <p className="section-note">Changing the display timezone preserves the actual moment of each event. Times and dates may shift.</p><p className="capacity-principle">Free time ≠ available capacity.</p>
    </div>}
    {tab === 'Account' && <div className="panel-form"><h3 className="settings-section-title">Demo account</h3><div className="account-card"><span className="account-avatar">{session.name.slice(0, 1).toUpperCase()}</span><strong>{session.name}</strong><p>{session.email}</p><small>{session.provider} · Local demo session</small></div><p className="section-note">Your planner stays on this browser. Signing out preserves local events, projects and preferences.</p><button className="voice-secondary" onClick={onLogout}>Log out</button></div>}
    </section>
  </aside>;
}
