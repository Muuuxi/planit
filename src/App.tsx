import { HierarchyProvider } from './hierarchyState';
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { QuickAdd } from './components/QuickAdd';
import { ContextPanel } from './components/ContextPanel';
import { Sidebar } from './components/Sidebar';
import { WeekToolbar } from './components/WeekToolbar';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { VoiceCapturePanel } from './components/VoiceCapturePanel';
import { ReplanPanel } from './components/ReplanPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { EventEditor } from './components/EventEditor';
import { PlannerViews } from './components/PlannerViews';
import { useLocalPlanner } from './useLocalPlanner';
import { dateInZone, defaultPreferences, draftFromItem, emptyDraft, mondayOf, shiftDate, type AppView, type CommitmentDraft, type PlannerItem } from './planner';
import { mockReplan, type ReplanProposal } from './mockReplan';
import type { ViewMode } from './types';
import { ProjectColors, type Project } from './appearance';
import { useDemoSession } from './demoSession';
import { Welcome } from './components/Welcome';
import { ProjectNavigation } from './components/ProjectNavigation';
import { ProjectEditor } from './components/ProjectEditor';

export default function App() {
  const { items, setItems, preferences, setPreferences, projects, setProjects, storageError } = useLocalPlanner();
  const { session, sessionError, login, logout } = useDemoSession();
  useEffect(() => { document.documentElement.dataset.theme = preferences.theme; }, [preferences.theme]);
  const [projectEditing, setProjectEditing] = useState<Project | undefined>();
  const [settingsTab, setSettingsTab] = useState<'Appearance' | 'Account'>('Appearance');
  const [week, setWeek] = useState(() => mondayOf(dateInZone(new Date(), preferences.timezone)));
  const [selectedDay, setSelectedDay] = useState(() => (new Date(`${dateInZone(new Date(), preferences.timezone)}T12:00:00Z`).getUTCDay() + 6) % 7);
  const [view, setView] = useState<AppView>('Calendar');
  const [mode, setMode] = useState<ViewMode>('week');
  const [panel, setPanel] = useState<'context' | 'settings' | 'voice' | 'editor' | 'replan' | 'project'>('context');
  const [contextOpen, setContextOpen] = useState(false);
  const trayOpen = contextOpen;
  const [editing, setEditing] = useState<CommitmentDraft | null>(null);
  const [proposal, setProposal] = useState<ReplanProposal | null>(null);
  const [preview, setPreview] = useState(false);
  const [applied, setApplied] = useState(false);
  const [notice, setNotice] = useState('');
  const displayItems = preview && proposal && !applied ? proposal.items : items;
  const openPanel = (next: typeof panel) => { setPreview(false); setProposal(null); setApplied(false); setPanel(next); if (next !== 'context') setContextOpen(true); setNotice(''); };
  const edit = (item: PlannerItem) => { openPanel('editor'); setEditing(draftFromItem(item)); };
  const toggle = (id: string) => setItems(current => current.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  const navigateDate = (direction: number) => {
    const selected = shiftDate(shiftDate(week, selectedDay), direction * (mode === 'week' ? 7 : 1));
    const monday = mondayOf(selected); setWeek(monday); setSelectedDay((Date.parse(selected) - Date.parse(monday)) / 86400000);
  };
  const today = () => { const date = dateInZone(new Date(), preferences.timezone); setWeek(mondayOf(date)); setSelectedDay((Date.parse(date) - Date.parse(mondayOf(date))) / 86400000); };
  const close = () => openPanel('context');
  const signOut = () => { openPanel('context'); setView('Calendar'); setContextOpen(false); logout(); };
  const openProject = (project?: Project) => { setProjectEditing(project); openPanel('project'); };
  const addInProject = (project: Project) => { openPanel('editor'); setEditing({ ...emptyDraft(shiftDate(week, selectedDay), preferences.timezone), project: project.name, area: project.area, workType: project.workTypes?.[0], color: project.color, useProjectColor: preferences.inheritProjectColor }); };
  const addEvent = () => { setView('Calendar'); openPanel('editor'); setEditing({ ...emptyDraft(shiftDate(week, selectedDay), preferences.timezone), useProjectColor: preferences.inheritProjectColor }); };
  const speak = () => { setView('Calendar'); openPanel('voice'); };
  if (!session) return <Welcome onLogin={login} error={sessionError} />;
  return <ProjectColors.Provider value={projects}><HierarchyProvider><div className={`app-shell${trayOpen ? ' tray-open' : ''}`}>
    <Sidebar session={session} onLogout={signOut} onAccount={() => { setSettingsTab('Account'); openPanel('settings'); }} view={view} settingsOpen={panel === 'settings'} onNavigate={next => { setView(next); openPanel('context'); }} onSettings={() => { setSettingsTab('Appearance'); setView('Calendar'); openPanel(panel === 'settings' && trayOpen ? 'context' : 'settings'); }} />

    <div className="context-tray" id="context-tray">
      <button className="tray-toggle" aria-label={trayOpen ? 'Collapse context sidebar' : 'Expand context sidebar'} title={trayOpen ? 'Collapse context sidebar' : 'Expand context sidebar'} aria-expanded={trayOpen} aria-controls="context-tray-content" onClick={() => setContextOpen(open => !open)}>{trayOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
      {!trayOpen && <QuickAdd collapsed onAdd={addEvent} onSpeak={speak} />}
      <div id="context-tray-content" hidden={!trayOpen}>
    {panel === 'project' ? <ProjectEditor key={projectEditing?.name ?? 'new-project'} initial={projectEditing} existingNames={projects.map(project => project.name)} onClose={close} onSave={(project, previousName) => { setProjects(current => [...current.filter(item => item.name !== previousName), project]); if (previousName) setItems(current => current.map(item => item.project === previousName ? { ...item, project: project.name, area: project.area } : item)); close(); setNotice('Project saved.'); }} /> : panel === 'settings' ? <SettingsPanel key={settingsTab} initialTab={settingsTab} session={session} onLogout={signOut} preferences={preferences} onChange={setPreferences} onClose={close} /> : panel === 'editor' && editing ? <EventEditor key={editing.id} draft={editing} existing={items.find(item => item.id === editing.id)} onClose={close} onSave={item => { setItems(current => current.some(existing => existing.id === item.id) ? current.map(existing => existing.id === item.id ? item : existing) : [...current, item]); const date = dateInZone(item.startsAt ?? item.dueAt!, preferences.timezone); setWeek(mondayOf(date)); setSelectedDay((Date.parse(date) - Date.parse(mondayOf(date))) / 86400000); close(); setNotice('Commitment saved.'); }} onDelete={id => { setItems(current => current.filter(item => item.id !== id)); close(); setNotice('Commitment deleted.'); }} /> : panel === 'voice' ? <VoiceCapturePanel week={week} timezone={defaultPreferences.timezone} onClose={close} onConfirm={confirmed => { const next = mockReplan(items, confirmed, preferences); setProposal(next); setWeek(next.week); setMode('week'); setPanel('replan'); }} /> : panel === 'replan' && proposal ? <ReplanPanel proposal={proposal} preferences={preferences} preview={preview} applied={applied} onPreview={() => { setWeek(proposal.week); setMode('week'); setPreview(value => !value); }} onApply={() => { setItems(proposal.items); setWeek(proposal.week); setPreview(false); setApplied(true); }} onCancel={close} /> : view === 'Projects' ? <ProjectNavigation items={items} week={week} preferences={preferences} onSelect={(name, workType) => { const target = Array.from(document.querySelectorAll<HTMLElement>('[data-project]')).find(element => element.dataset.project === name); const section = Array.from(target?.querySelectorAll<HTMLElement>('[data-work-type]') ?? []).find(element => element.dataset.workType === workType); (section ?? target)?.scrollIntoView({ block: 'start' }); target?.focus({ preventScroll: true }); }} /> : <ContextPanel onAdd={addEvent} onSpeak={speak} week={week} items={items} preferences={preferences} onToggle={toggle} onEdit={edit} />}
      </div>
    </div>
    <main className="calendar-workspace">
      <WeekToolbar weekStart={new Date(`${week}T12:00:00`)} selectedDate={new Date(`${shiftDate(week, selectedDay)}T12:00:00`)} mode={mode} onPrevious={() => navigateDate(-1)} onNext={() => navigateDate(1)} onToday={today} onModeChange={next => { setMode(next); setView('Calendar'); }} />
      {storageError && <div className="replan-banner" role="status">{storageError}</div>}
      {notice && <div className="replan-banner" role="status">{notice}</div>}
      {preview && <div className="replan-banner" role="status">Preview only · dashed cards are proposed; neutral outlined cards show previous times. Apply or keep your current plan before editing.</div>}
      {view === 'Calendar' ? <WeeklyCalendar items={displayItems} originalItems={preview ? items : undefined} week={week} mode={mode} selectedDay={selectedDay} preferences={preferences} onSelectDay={day => { setSelectedDay(day); setMode('day'); }} onEdit={edit} /> : <PlannerViews onEditProject={openProject} onAddProject={() => openProject()} onAddInProject={addInProject} view={view} items={items} week={week} preferences={preferences} onEdit={edit} onToggle={toggle} />}
    </main>
  </div></HierarchyProvider></ProjectColors.Provider>;
}
