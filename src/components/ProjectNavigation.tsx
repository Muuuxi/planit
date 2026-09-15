import { ProjectHierarchy } from './ProjectHierarchy';
import type { CalendarPreferences, PlannerItem } from '../planner';

export function ProjectNavigation({ items, week, preferences, onSelect }: { items: PlannerItem[]; week: string; preferences: CalendarPreferences; onSelect: (project: string, workType: string) => void }) {
  return <aside className="context-panel project-navigation" aria-label="Project navigation">
    <div className="context-intro"><p className="eyebrow">Projects</p><h2>Areas & projects</h2></div>
    <ProjectHierarchy compact items={items} week={week} preferences={preferences} onSelect={onSelect} />
  </aside>;
}
