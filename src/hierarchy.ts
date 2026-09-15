import type { Project, EventColor } from './appearance';

export const areas = [
  { id: 'Academic', color: 'blue' }, { id: 'Career', color: 'purple' },
  { id: 'Portfolio', color: 'green' }, { id: 'Personal', color: 'pink' },
] as const;
export type AreaId = typeof areas[number]['id'];
export const isArea = (value: unknown): value is AreaId => areas.some(area => area.id === value);
export const courseDefinitions: { name: string; color: EventColor; area: AreaId; workTypes: string[] }[] = [
  { name: 'AIPI 590', color: 'blue', area: 'Academic', workTypes: ['Assignments', 'Class / Meetings', 'Readings', 'Presentations', 'Final Project'] },
  { name: 'GAMEDSGN 552', color: 'yellow', area: 'Academic', workTypes: ['Assignments', 'Team Work', 'Presentations'] },
  { name: 'Serious Games', color: 'green', area: 'Academic', workTypes: ['Assignments', 'Playtests', 'Project Work'] },
  { name: 'I&E 748', color: 'purple', area: 'Academic', workTypes: ['Assignments', 'Research', 'Presentations'] },
];
export function inferArea(name: string): AreaId {
  if (courseDefinitions.some(project => project.name === name) || name.startsWith('Academic')) return 'Academic';
  if (['Job Search', 'Didi', 'Firestorm', 'Klook'].includes(name)) return 'Career';
  if (['Personal', 'Life admin'].includes(name)) return 'Personal';
  return 'Portfolio';
}
export function defaultWorkTypes(name: string) {
  return courseDefinitions.find(project => project.name === name)?.workTypes ?? (inferArea(name) === 'Career' ? ['Applications', 'Interviews', 'Preparation'] : ['Project Work', 'Class / Meetings', 'Research']);
}
export function normalizeProject(project: Project): Project {
  const name = project.name === 'Academic' ? 'Academic planning' : project.name;
  return { ...project, name, area: isArea(project.area) ? project.area : inferArea(name), workTypes: Array.isArray(project.workTypes) && project.workTypes.every(type => typeof type === 'string' && type.trim()) ? project.workTypes : defaultWorkTypes(name) };
}
export function inferWorkType(item: { title: string; category?: string }) {
  if (/final project/i.test(item.title)) return 'Final Project';
  if (/assignment|brief|assessment/i.test(item.title)) return 'Assignments';
  if (/prepar/i.test(item.title)) return 'Preparation';
  if (/interview/i.test(item.title)) return 'Interviews';
  if (/reading/i.test(item.title)) return 'Readings';
  if (/presentation/i.test(item.title)) return 'Presentations';
  if (/research/i.test(item.title)) return 'Research';
  if (['class', 'meeting'].includes(item.category ?? '')) return 'Class / Meetings';
  return 'Project Work';
}
export function normalizeRelationship<T extends { project: string; title: string; category?: string; area?: AreaId; workType?: string }>(item: T): T {
  // Preserve legacy academic work in its own project instead of dropping or merging records.
  const project = item.project === 'Academic' ? (/AIPI|Final Project/i.test(item.title) ? 'AIPI 590' : 'Academic planning') : item.project;
  return { ...item, project, area: isArea(item.area) ? item.area : inferArea(project), workType: typeof item.workType === 'string' && item.workType.trim() || inferWorkType(item) };
}
export function relationship(item: { project: string; title: string; category?: string; area?: AreaId; workType?: string }, projects: Project[]) {
  const project = projects.find(project => project.name === item.project);
  return { area: project?.area ?? item.area ?? inferArea(item.project), project: item.project, workType: item.workType || inferWorkType(item) };
}
export function relationshipLabel(item: Parameters<typeof relationship>[0], projects: Project[]) {
  const value = relationship(item, projects);
  return `${value.area} › ${value.project} › ${value.workType}`;
}
