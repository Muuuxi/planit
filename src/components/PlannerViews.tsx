import { ProjectHierarchy } from './ProjectHierarchy';
import { dateInZone, displayDate, displayTime, itemsInWeek, shiftDate, type AppView, type PlannerItem, type CalendarPreferences } from '../planner';
import { useEventColors, type Project } from '../appearance';

export function PlannerViews({ view, items, week, preferences: p, onEdit, onToggle, onEditProject, onAddProject, onAddInProject }: { view: AppView; items: PlannerItem[]; week: string; preferences: CalendarPreferences; onEdit: (item: PlannerItem) => void; onToggle: (id: string) => void; onEditProject: (project: Project) => void; onAddProject: () => void; onAddInProject: (project: Project) => void }) {
  const { colorStyle, resolveColor } = useEventColors();
  const current = itemsInWeek(items, week, p.timezone).sort((a, b) => (a.startsAt ?? a.dueAt!).localeCompare(b.startsAt ?? b.dueAt!));
  const row = (item: PlannerItem) => <div style={colorStyle(item)} data-color={resolveColor(item)} className={`planner-row${item.completed ? ' item-completed' : ''}`} key={item.id}><input type="checkbox" aria-label={`Complete ${item.title}`} checked={item.completed} onChange={() => onToggle(item.id)} /><button onClick={() => onEdit(item)}><strong>{item.title}</strong><small>{item.dueAt && !item.startsAt ? 'Due ' : ''}{displayTime(item.startsAt ?? item.dueAt!, p)} · {item.project}</small></button></div>;
  return <section className="planner-view" aria-label={view}><div className="view-heading"><h2>{view}</h2>{view === 'Projects' && <button className="today-button" onClick={onAddProject}>New project</button>}</div>
    {view === 'This Week' && <div className="planner-groups">{Array.from({ length: 7 }, (_, day) => { const date = shiftDate(week, day), events = current.filter(item => dateInZone(item.startsAt ?? item.dueAt!, p.timezone) === date); return <article className="planner-group" key={date}><h3>{displayDate(date)}</h3>{events.map(row)}{!events.length && <p className="section-note">Room to breathe.</p>}</article>; })}</div>}
    {view === 'Projects' && <ProjectHierarchy items={items} week={week} preferences={p} onEdit={onEdit} onToggle={onToggle} onEditProject={onEditProject} onAddInProject={onAddInProject} />}
    {view === 'Work / Life' && <div className="planner-groups">{['Work / Study', 'Personal'].map(label => <article className="planner-group" key={label}><h3>{label}</h3>{current.filter(item => (item.category === 'personal') === (label === 'Personal')).map(row)}</article>)}</div>}
    {!current.length && view !== 'Projects' && <p className="section-note">No commitments in this week. Add an event to get started.</p>}
  </section>;
}
