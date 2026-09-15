import { normalizeRelationship, type AreaId } from './hierarchy';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { calendarEvents } from './demoData';
import { defaultProjectColor, type EventColor, type ThemeId } from './appearance';
import type { CalendarCategory, CommitmentPriority, CommitmentFlexibility, CommitmentEnergy, DailyCapacity } from './types';

export const timezones = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' },
  { value: 'UTC', label: 'UTC' },
];
export interface CalendarPreferences { startHour: number; endHour: number; fullDay: boolean; format: '12' | '24'; timezone: string; theme: ThemeId; showWeekends: boolean; inheritProjectColor: boolean }
export const defaultPreferences: CalendarPreferences = { startHour: 6, endHour: 24, fullDay: false, format: '12', timezone: 'America/New_York', theme: 'sage', showWeekends: true, inheritProjectColor: true };
export interface CommitmentDraft {
  color: EventColor; useProjectColor: boolean; area?: AreaId; workType?: string;
  id: string; title: string; kind: 'event' | 'deadline'; date: string; start: string; endDate: string; end: string;
  deadlineDate: string; deadlineTime: string; timezone: string; category: CalendarCategory; project: string;
  priority: CommitmentPriority; flexibility: CommitmentFlexibility; energy: CommitmentEnergy; notes: string;
}
export interface PlannerItem {
  color: EventColor; useProjectColor: boolean; area?: AreaId; workType?: string;
  id: string; title: string; kind: 'event' | 'deadline'; startsAt: string | null; endsAt: string | null; dueAt: string | null;
  timezone: string; category: CalendarCategory; project: string; priority: CommitmentPriority;
  flexibility: CommitmentFlexibility; energy: CommitmentEnergy; notes: string; completed: boolean; recovery?: boolean;
}
export type AppView = 'Calendar' | 'This Week' | 'Projects' | 'Work / Life';
export const dateInZone = (instant: string | Date, zone: string) => formatInTimeZone(instant, zone, 'yyyy-MM-dd');
export const timeInZone = (instant: string, zone: string) => formatInTimeZone(instant, zone, 'HH:mm');
export const zoneLabel = (zone: string) => timezones.find(item => item.value === zone)?.label ?? zone;
export const shiftDate = (date: string, days: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
export const mondayOf = (date: string) => shiftDate(date, -((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7));
export const minutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
export function clockLabel(value: number, format: '12' | '24') {
  if (format === '24' && value === 1440) return '24:00';
  const hour = Math.floor(value / 60) % 24, minute = value % 60;
  return format === '24' ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}
export const displayTime = (iso: string, prefs: CalendarPreferences) => clockLabel(minutes(timeInZone(iso, prefs.timezone)), prefs.format);
export const displayDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
export function toInstant(date: string, time: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Enter a valid date and time.');
  const result = fromZonedTime(`${date}T${time}:00`, timezone);
  if (Number.isNaN(result.getTime()) || formatInTimeZone(result, timezone, "yyyy-MM-dd'T'HH:mm") !== `${date}T${time}`) throw new Error('This local time does not exist in the selected timezone. Choose another time.');
  return result.toISOString();
}
export function emptyDraft(date: string, timezone: string): CommitmentDraft {
  return { id: crypto.randomUUID(), title: '', kind: 'event', date, start: '09:00', endDate: date, end: '10:00', deadlineDate: '', deadlineTime: '', timezone, category: 'focus', project: 'General', priority: 'Medium', flexibility: 'Flexible', energy: 'Medium', notes: '', color: defaultProjectColor('General'), useProjectColor: true };
}
export function itemFromDraft(draft: CommitmentDraft, completed = false): PlannerItem {
  if (!draft.title.trim()) throw new Error('Enter a title.');
  if (!draft.project.trim()) throw new Error('Enter a category / project.');
  if (!timezones.some(zone => zone.value === draft.timezone)) throw new Error('Select a supported timezone.');
  const startsAt = draft.kind === 'event' ? toInstant(draft.date, draft.start, draft.timezone) : null;
  const endsAt = draft.kind === 'event' ? toInstant(draft.endDate, draft.end, draft.timezone) : null;
  if (startsAt && endsAt && endsAt <= startsAt) throw new Error('End must be after start. For an overnight event, choose the next end date.');
  const dueAt = draft.deadlineDate || draft.deadlineTime || draft.kind === 'deadline' ? toInstant(draft.deadlineDate, draft.deadlineTime, draft.timezone) : null;
  return normalizeRelationship({ area: draft.area, workType: draft.workType, id: draft.id, title: draft.title.trim(), kind: draft.kind, startsAt, endsAt, dueAt, timezone: draft.timezone, category: draft.category, project: draft.project.trim(), priority: draft.priority, flexibility: draft.flexibility, energy: draft.energy, notes: draft.notes, completed, color: draft.color, useProjectColor: draft.useProjectColor });
}
export function draftFromItem(item: PlannerItem): CommitmentDraft {
  const anchor = item.startsAt ?? item.dueAt!;
  return { ...item, date: dateInZone(anchor, item.timezone), start: item.startsAt ? timeInZone(item.startsAt, item.timezone) : '09:00', endDate: dateInZone(item.endsAt ?? anchor, item.timezone), end: item.endsAt ? timeInZone(item.endsAt, item.timezone) : '10:00', deadlineDate: item.dueAt ? dateInZone(item.dueAt, item.timezone) : '', deadlineTime: item.dueAt ? timeInZone(item.dueAt, item.timezone) : '' };
}
export function seedPlanner(): PlannerItem[] {
  const monday = mondayOf(dateInZone(new Date(), defaultPreferences.timezone));
  return [-1, 0, 1].flatMap(offset => {
    const week = shiftDate(monday, offset * 7);
    const seeded = calendarEvents.filter(event => event.id !== 'e19').map(event => {
      const date = shiftDate(week, event.day);
      const draft = emptyDraft(date, defaultPreferences.timezone);
      return itemFromDraft({ ...draft, id: `${week}-${event.id}`, title: event.id === 'e13' ? 'Project Work' : event.title, start: event.start, end: event.end, category: event.category, project: event.category === 'personal' ? 'Personal' : event.category === 'class' ? 'Academic' : 'Planit', flexibility: ['focus', 'personal'].includes(event.category) ? 'Flexible' : 'Fixed', priority: ['e09', 'e17', 'e08'].includes(event.id) ? 'High' : 'Medium', notes: event.detail ?? '' });
    });
    seeded.push(itemFromDraft({ ...emptyDraft(shiftDate(week, 2), defaultPreferences.timezone), id: `${week}-resume`, title: 'Resume Update', start: '17:00', end: '18:00', project: 'Job Search', priority: 'Low' }));
    for (const [id, title, day, time, project] of [
      ['final-project', 'Final Project Deadline', 4, '23:59', 'Academic'],
      ['assessment-brief', 'AIPI product brief', 4, '15:00', 'Academic'],
      ['research', 'Research synthesis', 2, '17:00', 'Planit'],
      ['portfolio', 'Portfolio case study', 6, '20:00', 'Portfolio'],
    ] as const) seeded.push(itemFromDraft({ ...emptyDraft(shiftDate(week, day), defaultPreferences.timezone), id: `${week}-${id}`, title, kind: 'deadline', deadlineDate: shiftDate(week, day), deadlineTime: time, category: 'deadline', project, priority: 'High', flexibility: 'Fixed' }));
    return seeded;
  });
}
export function itemsInWeek(items: PlannerItem[], week: string, zone: string) {
  const end = shiftDate(week, 7);
  return items.filter(item => [item.startsAt, item.dueAt].some(instant => instant && dateInZone(instant, zone) >= week && dateInZone(instant, zone) < end) || Boolean(item.endsAt && item.startsAt && dateInZone(item.startsAt, zone) < week && dateInZone(item.endsAt, zone) >= week));
}
export function capacities(items: PlannerItem[], week: string, zone: string): DailyCapacity[] {
  return Array.from({ length: 7 }, (_, day) => {
    const date = shiftDate(week, day), start = toInstant(date, '00:00', zone), end = toInstant(shiftDate(date, 1), '00:00', zone);
    let hours = 0;
    for (const item of items) {
      if (!item.startsAt || !item.endsAt || item.recovery || item.category === 'personal') continue;
      const overlap = Math.max(0, Math.min(Date.parse(end), Date.parse(item.endsAt)) - Math.max(Date.parse(start), Date.parse(item.startsAt))) / 3600000;
      hours += overlap * (item.energy === 'High' ? 1.25 : item.energy === 'Low' ? .8 : 1);
    }
    const nightStart = toInstant(shiftDate(date, -1), '23:00', zone), nightEnd = toInstant(date, '05:00', zone);
    const late = items.some(item => item.startsAt && item.endsAt && !item.recovery && item.category !== 'personal' && item.startsAt < nightEnd && item.endsAt > nightStart);
    return { day, bookedHours: Math.round(hours * 10) / 10, availableHours: (day < 5 ? 7.5 : 6.5) - (late ? 1.5 : 0) };
  });
}
