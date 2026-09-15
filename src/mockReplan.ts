import { dateInZone, displayDate, displayTime, emptyDraft, itemFromDraft, itemsInWeek, mondayOf, shiftDate, timeInZone, toInstant, type CalendarPreferences, type PlannerItem } from './planner';

export interface Recommendation { action: string; title: string; schedule: string; reason: string }
export interface ReplanProposal { items: PlannerItem[]; confirmed: PlannerItem[]; recommendations: Recommendation[]; week: string }
export function mockReplan(current: PlannerItem[], confirmed: PlannerItem[], p: CalendarPreferences): ReplanProposal {
  let items = [...current.filter(item => !confirmed.some(next => next.id === item.id || item.id === `${next.id}-prep` || item.id === `${next.id}-recovery`)), ...confirmed];
  const anchor = confirmed.find(item => item.startsAt) ?? confirmed[0];
  const week = mondayOf(dateInZone(anchor.startsAt ?? anchor.dueAt!, p.timezone));
  const recommendations: Recommendation[] = [];
  const fixed = itemsInWeek(current, week, p.timezone).find(item => item.title === 'Final Project Deadline');
  if (fixed) recommendations.push({ action: 'KEEP', title: fixed.title, schedule: displayDate(dateInZone(fixed.dueAt!, p.timezone)), reason: 'fixed academic deadline' });
  const interview = confirmed.find(item => item.startsAt && item.id.includes('interview'));
  if (interview) {
    const zone = interview.timezone, date = dateInZone(interview.startsAt!, zone), prior = shiftDate(date, -1), monday = mondayOf(date);
    const place = (item: PlannerItem, target: string, startHour: number, endHour: number, duration: number): PlannerItem | null => {
      for (let minute = startHour * 60; minute + duration <= endHour * 60; minute += 30) {
        const start = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        const finish = minute + duration;
        const end = `${String(Math.floor(finish / 60)).padStart(2, '0')}:${String(finish % 60).padStart(2, '0')}`;
        const startsAt = toInstant(target, start, zone), endsAt = toInstant(target, end, zone);
        if (!items.some(other => other.id !== item.id && other.startsAt && other.endsAt && other.startsAt < endsAt && other.endsAt > startsAt)) return { ...item, startsAt, endsAt, timezone: zone };
      }
      return null;
    };
    const move = (title: string, target: string, from: number, until: number, reason: string) => {
      const item = itemsInWeek(items, monday, zone).find(item => item.title === title && item.flexibility === 'Flexible' && !item.completed && item.startsAt && item.endsAt);
      if (!item) return;
      const moved = place(item, target, from, until, (Date.parse(item.endsAt!) - Date.parse(item.startsAt!)) / 60000);
      if (moved) { items = items.map(existing => existing.id === item.id ? moved : existing); recommendations.push({ action: 'MOVE', title, schedule: `${displayDate(dateInZone(item.startsAt!, zone))} → ${displayDate(target)} · ${displayTime(moved.startsAt!, { ...p, timezone: zone })}`, reason }); }
      else recommendations.push({ action: 'KEEP', title, schedule: 'No free slot in the suggested window', reason: 'review manually; existing commitments remain intact' });
    };
    move('Resume Update', shiftDate(monday, 5), 13, 19, 'flexible and lower urgency');
    move('Project Work', prior, 13, 18, 'interview-day capacity is limited');
    const prep = itemFromDraft({ ...emptyDraft(prior, zone), id: `${interview.id}-prep`, title: 'Interview Preparation', start: '19:00', end: '21:00', project: interview.project, area: interview.area, workType: 'Preparation', energy: 'High', priority: 'High' });
    const placedPrep = place(prep, prior, 19, 23, 120);
    if (placedPrep) { items = [...items.filter(item => item.id !== prep.id), placedPrep]; recommendations.push({ action: 'ADD', title: prep.title, schedule: `${displayDate(prior)} · ${displayTime(placedPrep.startsAt!, { ...p, timezone: zone })}–${displayTime(placedPrep.endsAt!, { ...p, timezone: zone })}`, reason: 'preparation is needed before the interview' }); }
    else recommendations.push({ action: 'KEEP', title: 'Interview preparation needs a slot', schedule: 'No two-hour evening slot available', reason: 'review manually before the interview' });
    if (timeInZone(interview.startsAt!, zone) < '05:00') {
      const recovery = { ...itemFromDraft({ ...emptyDraft(date, zone), id: `${interview.id}-recovery`, title: 'Protected Recovery', start: '07:00', end: '11:00', category: 'personal', project: 'Personal', flexibility: 'Fixed', energy: 'Low', notes: 'Recovery after an overnight interview' }), recovery: true };
      const protectedTime = place(recovery, date, 7, 12, 240);
      if (protectedTime) { items = [...items.filter(item => item.id !== recovery.id), protectedTime]; recommendations.push({ action: 'PROTECT', title: 'Interview-day Morning', schedule: `${displayDate(date)} · ${displayTime(protectedTime.startsAt!, { ...p, timezone: zone })}–${displayTime(protectedTime.endsAt!, { ...p, timezone: zone })}`, reason: 'capacity is reduced after an overnight interview' }); }
      else recommendations.push({ action: 'KEEP', title: 'Recovery needs review', schedule: 'No four-hour morning slot available', reason: 'fixed commitments were preserved; capacity is still reduced' });
    }
  }
  if (!recommendations.length) confirmed.forEach(item => recommendations.push({ action: 'ADD', title: item.title, schedule: displayDate(dateInZone(item.startsAt ?? item.dueAt!, item.timezone)), reason: 'confirmed by you; no other commitments need to move' }));
  return { items, confirmed, recommendations, week };
}
