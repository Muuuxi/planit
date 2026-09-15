import { courseDefinitions, inferArea, defaultWorkTypes, type AreaId } from './hierarchy';
import { createContext, useContext, type CSSProperties } from 'react';

export const themes = [
  { id: 'sage', name: 'Sage', description: 'Warm cream · grounded green', background: '#f7f5ef', surface: '#eaf0e6', accent: '#52775e' },
  { id: 'mist', name: 'Mist Blue', description: 'Cool ivory · fog blue', background: '#f3f6f9', surface: '#e3ebf2', accent: '#527997' },
  { id: 'sand', name: 'Warm Sand', description: 'Soft ivory · amber warmth', background: '#faf5ed', surface: '#f0e5d4', accent: '#967344' },
  { id: 'lavender', name: 'Lavender', description: 'Quiet neutrals · muted plum', background: '#f7f5fa', surface: '#eae3f1', accent: '#806591' },
  { id: 'clean', name: 'Clean Light', description: 'Crisp white · clear blue', background: '#ffffff', surface: '#eef2f7', accent: '#426fad' },
  { id: 'bright', name: 'Bright White', description: 'Bright white · confident blue', background: '#ffffff', surface: '#f7f9fc', accent: '#2f6bff' },
] as const;
export type ThemeId = typeof themes[number]['id'];
export const palette = {
  red: { name: 'Red', accent: '#d45353', background: '#fbe3e3', text: '#792e2e' },
  orange: { name: 'Orange', accent: '#c87931', background: '#fcebd8', text: '#70411c' },
  yellow: { name: 'Yellow', accent: '#c79622', background: '#fff4c7', text: '#694d08' },
  green: { name: 'Green', accent: '#438a5e', background: '#e2f2e6', text: '#244f34' },
  teal: { name: 'Teal', accent: '#26877e', background: '#dcf2ee', text: '#18594f' },
  blue: { name: 'Blue', accent: '#3478d4', background: '#e1edff', text: '#173b68' },
  indigo: { name: 'Indigo', accent: '#596ac4', background: '#e5e9ff', text: '#303f85' },
  purple: { name: 'Purple', accent: '#7a5cb3', background: '#eee6fa', text: '#49356d' },
  pink: { name: 'Pink', accent: '#c76089', background: '#f9e2ec', text: '#75344e' },
  gray: { name: 'Gray', accent: '#74818d', background: '#edf0f4', text: '#3b4854' },
};
// Keep the palette independent of app themes so project identity remains stable.
export type EventColor = keyof typeof palette;
export interface Project { name: string; color: EventColor; area?: AreaId; workTypes?: string[] }
export const defaultProjectColor = (name: string): EventColor => ({ 'GAMEDSGN 552': 'yellow', 'Serious Games': 'green', 'I&E 748': 'purple', 'Academic planning': 'blue', 'AIPI 590': 'blue', Academic: 'blue', Planit: 'green', 'Job Search': 'purple', Portfolio: 'orange', Personal: 'pink', General: 'teal' } as Record<string, EventColor>)[name] ?? 'teal';
export const isColor = (value: unknown): value is EventColor => typeof value === 'string' && Object.hasOwn(palette, value);
export const defaultProjects: Project[] = [...courseDefinitions, ...['Academic planning', 'Planit', 'Job Search', 'Portfolio', 'Personal', 'General'].map(name => ({ name, color: defaultProjectColor(name), area: inferArea(name), workTypes: defaultWorkTypes(name) }))];
export const ProjectColors = createContext<Project[]>(defaultProjects);
export function swatchStyle(color: EventColor): CSSProperties {
  const entry = palette[color];
  return { '--item-accent': entry.accent, '--item-bg': entry.background, '--item-text': entry.text } as CSSProperties;
}
export function useEventColors() {
  const projects = useContext(ProjectColors);
  const resolveColor = (item: { project: string; color: EventColor; useProjectColor: boolean }) => item.useProjectColor ? projects.find(project => project.name === item.project)?.color ?? defaultProjectColor(item.project) : item.color;
  return { projects, resolveColor, colorStyle: (item: { project: string; color: EventColor; useProjectColor: boolean }) => swatchStyle(resolveColor(item)) };
}
