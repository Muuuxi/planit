import { courseDefinitions, normalizeProject, normalizeRelationship } from './hierarchy';
import { useEffect, useState } from 'react';
import { defaultPreferences, seedPlanner, timezones, type CalendarPreferences, type PlannerItem } from './planner';
import { defaultProjects, defaultProjectColor, isColor, themes, type Project } from './appearance';

export const ITEMS_KEY = 'planit-items-v4';
export const PREFS_KEY = 'planit-preferences-v1';
export const PROJECTS_KEY = 'planit-projects-v1';
function read<T>(key: string, fallback: () => T, valid: (value: unknown) => boolean): T {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null'); if (valid(value)) return value as T; } catch { /* Missing or invalid local data falls back to demo defaults. */ }
  return fallback();
}
export function useLocalPlanner() {
  const [initialProjects] = useState<Project[]>(() => read(PROJECTS_KEY, () => defaultProjects, value => Array.isArray(value) && value.every(project => project && typeof project.name === 'string' && isColor(project.color))));
  const [items, setItems] = useState<PlannerItem[]>(() => read(ITEMS_KEY, seedPlanner, value => Array.isArray(value) && value.every(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.project === 'string' && ['event', 'deadline'].includes(item.kind) && [item.startsAt, item.endsAt, item.dueAt].every(instant => instant === null || typeof instant === 'string' && !Number.isNaN(Date.parse(instant))) && (item.kind === 'event' ? item.startsAt && item.endsAt : item.dueAt) && timezones.some(zone => zone.value === item.timezone))).map(item => {
    const normalized = normalizeRelationship(item);
    const oldColor = initialProjects.find(project => project.name === item.project)?.color;
    const newColor = initialProjects.find(project => project.name === normalized.project)?.color ?? defaultProjectColor(normalized.project);
    // Reclassification must not silently recolor existing user-customized academic work.
    return item.project !== normalized.project && item.useProjectColor !== false && oldColor && oldColor !== newColor ? { ...normalized, color: oldColor, useProjectColor: false } : normalized;
  }).map(item => ({ ...item, color: isColor(item.color) ? item.color : defaultProjectColor(item.project), useProjectColor: typeof item.useProjectColor === 'boolean' ? item.useProjectColor : true })));
  const [preferences, setPreferences] = useState<CalendarPreferences>(() => { const saved = read(PREFS_KEY, () => defaultPreferences, value => {
    if (!value || typeof value !== 'object') return false;
    const p = value as CalendarPreferences;
    return Number.isInteger(p.startHour) && p.startHour >= 0 && p.startHour <= 23 && Number.isInteger(p.endHour) && p.endHour > p.startHour && p.endHour <= 25 && typeof p.fullDay === 'boolean' && ['12', '24'].includes(p.format) && timezones.some(zone => zone.value === p.timezone);
  }); return { ...saved, theme: themes.some(theme => theme.id === saved.theme) ? saved.theme : 'sage', showWeekends: saved.showWeekends ?? true, inheritProjectColor: saved.inheritProjectColor ?? true }; });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = initialProjects;
    const normalized = saved.map(normalizeProject);
    const legacy = saved.some(project => !project.area || !project.workTypes);
    const all = [...normalized, ...(legacy ? courseDefinitions.filter(course => !normalized.some(project => project.name === course.name)) : [])];
    return [...all, ...[...new Set(items.map(item => item.project))].filter(name => !all.some(project => project.name === name)).map(name => normalizeProject({ name, area: items.find(item => item.project === name)?.area, color: defaultProjectColor(name) }))];
  });
  useEffect(() => { setProjects(current => { const missing = [...new Set(items.map(item => item.project))].filter(name => !current.some(project => project.name === name)); return missing.length ? [...current, ...missing.map(name => normalizeProject({ name, area: items.find(item => item.project === name)?.area, color: defaultProjectColor(name) }))] : current; }); }, [items]);
  const [storageError, setStorageError] = useState('');
  useEffect(() => { try { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); localStorage.setItem(PREFS_KEY, JSON.stringify(preferences)); localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); setStorageError(''); } catch { setStorageError('Browser storage is unavailable. Changes will last until this tab is refreshed.'); } }, [items, preferences, projects]);
  return { items, setItems, preferences, setPreferences, projects, setProjects, storageError };
}
