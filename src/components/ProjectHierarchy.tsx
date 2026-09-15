import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { areas, defaultWorkTypes, inferArea, inferWorkType, relationshipLabel } from '../hierarchy';
import { hierarchyKey, useHierarchy } from '../hierarchyState';
import { swatchStyle, useEventColors, type Project } from '../appearance';
import { displayTime, itemsInWeek, type CalendarPreferences, type PlannerItem } from '../planner';

interface Props {
  items: PlannerItem[]; week: string; preferences: CalendarPreferences; compact?: boolean;
  onSelect?: (project: string, workType: string) => void;
  onEdit?: (item: PlannerItem) => void; onToggle?: (id: string) => void;
  onEditProject?: (project: Project) => void; onAddInProject?: (project: Project, workType?: string) => void;
}
export function ProjectHierarchy({ items, week, preferences, compact, onSelect, onEdit, onToggle, onEditProject, onAddInProject }: Props) {
  const { projects, colorStyle, resolveColor } = useEventColors();
  const { isOpen, toggle } = useHierarchy();
  const current = itemsInWeek(items, week, preferences.timezone);
  const chevron = (open: boolean) => open ? <ChevronDown size={14} /> : <ChevronRight size={14} />;
  return <div className={`project-hierarchy${compact ? ' compact-hierarchy' : ''}`}>{areas.map(area => {
    const areaKey = hierarchyKey(area.id), open = isOpen(areaKey);
    const children = projects.filter(project => (project.area ?? inferArea(project.name)) === area.id);
    return <section className="hierarchy-area" data-area={area.id} key={area.id}>
      <button className="area-heading" style={swatchStyle(area.color)} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${area.id} area`} onClick={() => toggle(areaKey)}>{chevron(open)}<Layers size={16} /><strong>{area.id}</strong><small>{children.length}</small></button>
      {open && <div className="area-projects">{children.map(project => {
        const key = hierarchyKey(area.id, project.name), courseOpen = isOpen(key);
        const group = current.filter(item => item.project === project.name);
        const types = [...new Set([...(project.workTypes ?? defaultWorkTypes(project.name)), ...group.map(item => item.workType || inferWorkType(item))])];
        return <article className="hierarchy-project" style={swatchStyle(project.color)} key={project.name} data-project={compact ? undefined : project.name} tabIndex={compact ? undefined : -1}>
          <button className="course-heading" aria-expanded={courseOpen} aria-label={`${courseOpen ? 'Collapse' : 'Expand'} ${project.name} project`} onClick={() => toggle(key)}>{chevron(courseOpen)}<strong>{project.name}</strong><small>{group.length}</small></button>
          {courseOpen && <div className="course-content">
            {!compact && <div className="project-actions"><button className="voice-secondary" onClick={() => onEditProject?.(project)}>Edit project</button><button className="voice-secondary" onClick={() => onAddInProject?.(project)}>Add event</button></div>}
            {types.map(type => {
              const typeKey = hierarchyKey(area.id, project.name, type), typeOpen = isOpen(typeKey);
              const tasks = group.filter(item => (item.workType || inferWorkType(item)) === type);
              return <section className="work-type" data-work-type={type} key={type}>
                <button className="work-type-heading" aria-expanded={typeOpen} aria-label={`${typeOpen ? 'Collapse' : 'Expand'} ${project.name} ${type}`} onClick={() => toggle(typeKey)}>{chevron(typeOpen)}<span>{type}</span><small>{tasks.length}</small></button>
                {typeOpen && (compact ? <button className="work-type-link" onClick={() => onSelect?.(project.name, type)}>View {tasks.length} commitments</button> : <div className="work-type-content">
                  {tasks.map(item => <div className={`planner-row${item.completed ? ' item-completed' : ''}`} style={colorStyle(item)} data-color={resolveColor(item)} key={item.id}><input type="checkbox" aria-label={`Complete ${item.title}`} checked={item.completed} onChange={() => onToggle?.(item.id)} /><button onClick={() => onEdit?.(item)}><strong>{item.title}</strong><small>{displayTime(item.startsAt ?? item.dueAt!, preferences)} · {relationshipLabel(item, projects)}</small><span className="solid-tag">{item.flexibility}</span> <span className={`solid-tag priority-${item.priority.toLowerCase()}`}>{item.priority}</span></button></div>)}
                  {!tasks.length && <p className="section-note">No commitments this week.</p>}
                </div>)}
              </section>;
            })}
          </div>}
        </article>;
      })}{!children.length && <p className="section-note">Create a project in this area to get started.</p>}</div>}
    </section>;
  })}</div>;
}
