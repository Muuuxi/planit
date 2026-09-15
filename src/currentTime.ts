import { dateInZone, minutes, timeInZone, type PlannerItem } from './planner';

// Use absolute instants for countdowns; wall-clock time only determines grid position.
export function remainingTime(milliseconds: number) {
  const total = Math.max(1, Math.ceil(milliseconds / 60000));
  return total < 60 ? `${total} min` : `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ''}`;
}

export function currentTimeStatus(now: Date, timezone: string, items: PlannerItem[]) {
  const timestamp = now.getTime();
  const date = dateInZone(now, timezone);
  const events = items.filter(item => item.kind === 'event' && item.startsAt && item.endsAt && Date.parse(item.endsAt) > Date.parse(item.startsAt));
  // For overlaps, show the earliest-ending active event, with stable tie breakers.
  const active = events.filter(item => Date.parse(item.startsAt!) <= timestamp && timestamp < Date.parse(item.endsAt!))
    .sort((a, b) => Date.parse(a.endsAt!) - Date.parse(b.endsAt!) || a.id.localeCompare(b.id))[0];
  const next = events.filter(item => Date.parse(item.startsAt!) > timestamp && dateInZone(item.startsAt!, timezone) === date)
    .sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!))[0];
  return {
    date,
    minute: minutes(timeInZone(now.toISOString(), timezone)),
    label: active ? `Now · ${active.title} · ${remainingTime(Date.parse(active.endsAt!) - timestamp)} left` : next ? `Next · ${next.title} in ${remainingTime(Date.parse(next.startsAt!) - timestamp)}` : 'Done today',
    detail: active ? `In progress: ${active.title}` : next ? `Next: ${next.title}` : 'No active or later scheduled events today',
  };
}
