import { areas, defaultWorkTypes, inferArea, inferWorkType, relationshipLabel, type AreaId } from '../hierarchy';
import type { CommitmentDraft } from '../planner';
import { TimezoneSelect } from './TimezoneSelect';
import { ColorPicker } from './ColorPicker';
import { palette, useEventColors } from '../appearance';

export function CommitmentFields({ value: v, onChange }: { value: CommitmentDraft; onChange: (value: CommitmentDraft) => void }) {
  const { projects, resolveColor, colorStyle } = useEventColors();
  const field = (key: keyof CommitmentDraft, value: string) => onChange({ ...v, [key]: value });
  return <div className="panel-form commitment-fields">
    <label><span>Title</span><input required value={v.title} onChange={event => field('title', event.target.value)} /></label>
    <label><span>Commitment type</span><select aria-label="Commitment type" value={v.kind} onChange={event => onChange({ ...v, kind: event.target.value as CommitmentDraft['kind'], deadlineDate: v.deadlineDate || v.date, deadlineTime: v.deadlineTime || '23:59' })}><option value="event">Scheduled event</option><option value="deadline">Deadline</option></select></label>
    {v.kind === 'event' && <div className="field-pair">
      <label><span>Date</span><input required type="date" value={v.date} onChange={event => onChange({ ...v, date: event.target.value, endDate: v.endDate === v.date ? event.target.value : v.endDate })} /></label>
      <label><span>Start time</span><input required type="time" value={v.start} onChange={event => field('start', event.target.value)} /></label>
      <label><span>End date</span><input required type="date" value={v.endDate} onChange={event => field('endDate', event.target.value)} /></label>
      <label><span>End time</span><input required type="time" value={v.end} onChange={event => field('end', event.target.value)} /></label>
    </div>}
    <div className="field-pair"><label><span>Deadline date{v.kind === 'event' ? ' (optional)' : ''}</span><input required={v.kind === 'deadline'} type="date" value={v.deadlineDate} onChange={event => field('deadlineDate', event.target.value)} /></label><label><span>Deadline time</span><input required={v.kind === 'deadline'} type="time" value={v.deadlineTime} onChange={event => field('deadlineTime', event.target.value)} /></label></div>
    <TimezoneSelect value={v.timezone} onChange={timezone => onChange({ ...v, timezone })} />
    <label><span>Area</span><select aria-label="Area" value={projects.find(project => project.name === v.project)?.area ?? v.area ?? inferArea(v.project)} onChange={event => { const area = event.target.value as AreaId; const project = projects.find(project => project.area === area); onChange({ ...v, area, project: project?.name ?? v.project, workType: project?.workTypes?.[0] ?? 'Project Work' }); }}>{areas.map(area => <option key={area.id}>{area.id}</option>)}</select></label>
    <label><span>Course / Project</span><input aria-label="Course / Project" required list={`project-names-${v.id}`} value={v.project} onChange={event => { const project = projects.find(project => project.name === event.target.value); onChange({ ...v, project: event.target.value, area: project?.area ?? v.area ?? inferArea(event.target.value), workType: project?.workTypes?.[0] ?? v.workType ?? inferWorkType(v) }); }} /></label><datalist id={`project-names-${v.id}`}>{projects.filter(project => project.area === (projects.find(project => project.name === v.project)?.area ?? v.area ?? inferArea(v.project))).map(project => <option value={project.name} key={project.name} />)}</datalist>
    <label><span>Work Type</span><input aria-label="Work Type" required list={`work-types-${v.id}`} value={v.workType ?? inferWorkType(v)} onChange={event => field('workType', event.target.value)} /></label><datalist id={`work-types-${v.id}`}>{(projects.find(project => project.name === v.project)?.workTypes ?? defaultWorkTypes(v.project)).map(type => <option key={type}>{type}</option>)}</datalist>
    <p className="relationship-path">{relationshipLabel(v, projects)}</p>
    <label className="preference-toggle"><span>Use project color</span><input type="checkbox" checked={v.useProjectColor} onChange={event => onChange({ ...v, useProjectColor: event.target.checked })} /></label>
    <ColorPicker value={v.useProjectColor ? resolveColor(v) : v.color} disabled={v.useProjectColor} onChange={color => onChange({ ...v, color })} />
    <p className="color-source" style={colorStyle(v)}><span className="item-color-dot" />{palette[resolveColor(v)].name} · {v.useProjectColor ? `Inherited from ${v.project}` : 'Custom event color'}</p>
    <div className="field-pair">
      <label><span>Calendar category</span><select aria-label="Calendar category" value={v.category} onChange={event => field('category', event.target.value)}><option value="meeting">Meeting</option><option value="class">Study</option><option value="focus">Focus</option><option value="personal">Personal / Rest</option><option value="deadline">Deadline</option></select></label>
      <label><span>Priority</span><select aria-label="Priority" value={v.priority} onChange={event => field('priority', event.target.value)}>{['Critical', 'High', 'Medium', 'Low'].map(option => <option key={option}>{option}</option>)}</select></label>
      <label><span>Flexibility</span><select aria-label="Flexibility" value={v.flexibility} onChange={event => field('flexibility', event.target.value)}><option>Fixed</option><option>Flexible</option></select></label>
      <label><span>Estimated energy / effort</span><select aria-label="Estimated energy / effort" value={v.energy} onChange={event => field('energy', event.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label>
    </div>
    <label><span>Notes</span><textarea value={v.notes} onChange={event => field('notes', event.target.value)} /></label>
  </div>;
}
