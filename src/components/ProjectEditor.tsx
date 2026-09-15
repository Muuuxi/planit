import { areas, defaultWorkTypes, inferArea, type AreaId } from '../hierarchy';
import { useState } from 'react';
import { X } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { swatchStyle, type Project } from '../appearance';
export function ProjectEditor({ initial, existingNames, onSave, onClose }: { initial?: Project; existingNames: string[]; onSave: (project: Project, previousName?: string) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? 'green');
  const [area, setArea] = useState<AreaId>(initial?.area ?? (initial ? inferArea(initial.name) : 'Portfolio'));
  const [error, setError] = useState('');
  return <aside className="context-panel settings-panel" aria-label="Project editor"><header className="voice-panel-header"><strong>{initial ? 'Edit project' : 'Create project'}</strong><button aria-label="Close project editor" onClick={onClose}><X size={16} /></button></header><form className="panel-form" onSubmit={event => { event.preventDefault(); const trimmed = name.trim(); if (!trimmed) { setError('Enter a project name.'); return; } if (existingNames.some(value => value !== initial?.name && value.toLowerCase() === trimmed.toLowerCase())) { setError('A project with that name already exists.'); return; } onSave({ ...initial, name: trimmed, color, area, workTypes: initial?.workTypes ?? defaultWorkTypes(trimmed) }, initial?.name); }}><label><span>Project name</span><input required value={name} onChange={event => setName(event.target.value)} /></label><label><span>Area</span><select aria-label="Project area" value={area} onChange={event => setArea(event.target.value as AreaId)}>{areas.map(area => <option key={area.id}>{area.id}</option>)}</select></label><ColorPicker label="Project color" value={color} onChange={setColor} /><div className="project-color-preview" style={swatchStyle(color)}><span className="item-color-dot" />{name || 'Your project'}</div><p className="section-note">Events using project color will follow this selection. Individual overrides stay unchanged.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="voice-primary" type="submit">Save project</button></form></aside>;
}
