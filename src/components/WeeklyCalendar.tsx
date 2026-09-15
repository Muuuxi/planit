import { relationshipLabel } from '../hierarchy';
import { Clock3, Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { currentTimeStatus } from '../currentTime';
import { capacities, clockLabel, dateInZone, displayTime, minutes, shiftDate, timeInZone, zoneLabel, type PlannerItem, type CalendarPreferences } from '../planner';
import { useEventColors } from '../appearance';
import type { ViewMode } from '../types';

interface Props { items: PlannerItem[]; originalItems?: PlannerItem[]; week: string; mode: ViewMode; selectedDay: number; preferences: CalendarPreferences; onSelectDay: (day: number) => void; onEdit: (item: PlannerItem) => void }
const HOUR_HEIGHT = 64;
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function wallMinute(instant: string, date: string, zone: string) { return (Date.parse(dateInZone(instant, zone)) - Date.parse(date)) / 60000 + minutes(timeInZone(instant, zone)); }

export function WeeklyCalendar({ items, originalItems, week, mode, selectedDay, preferences: p, onSelectDay, onEdit }: Props) {
  const { projects, colorStyle, resolveColor } = useEventColors();
  const startHour = p.fullDay ? 0 : p.startHour, endHour = p.fullDay ? 24 : p.endHour;
  const min = startHour * 60, max = endHour * 60, height = (endHour - startHour) * HOUR_HEIGHT;
  const visibleDays = mode === 'week' ? (p.showWeekends ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4]) : [selectedDay];
  const columns = `68px repeat(${visibleDays.length}, minmax(${mode === 'week' ? '112px' : '480px'}, 1fr))`;
  const capacity = capacities(items, week, p.timezone);
  const [, setTick] = useState(0);
  const now = new Date();
  useEffect(() => {
    const refresh = () => setTick(tick => tick + 1);
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const current = currentTimeStatus(now, p.timezone, originalItems ?? items);
  const today = current.date;
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = 0; }, [startHour, endHour, week, mode, p.timezone]);
  const proposed = (item: PlannerItem) => Boolean(originalItems && JSON.stringify(originalItems.find(original => original.id === item.id)) !== JSON.stringify(item));
  const scheduled = items.filter(item => item.startsAt && item.endsAt);
  const outside = scheduled.filter(item => {
    const date = dateInZone(item.startsAt!, p.timezone);
    return visibleDays.some(day => shiftDate(week, day) === date) && !visibleDays.some(day => { const d = shiftDate(week, day); return wallMinute(item.endsAt!, d, p.timezone) > min && wallMinute(item.startsAt!, d, p.timezone) < max; });
  });
  return <section className={`calendar-card ${mode}-mode`} aria-label="Weekly schedule"><div className="calendar-scroll" ref={scroll}><div className="calendar-inner">
    <div className="calendar-header-grid" style={{ gridTemplateColumns: columns }}>
      <div className="timezone-label" title={zoneLabel(p.timezone)}>{p.timezone === 'UTC' ? 'UTC' : p.timezone === 'Asia/Shanghai' ? 'China' : p.timezone === 'America/Los_Angeles' ? 'Pacific' : 'Eastern'}</div>
      {visibleDays.map(day => <button className={`day-heading${shiftDate(week, day) === today ? ' today' : ''}`} key={day} onClick={() => onSelectDay(day)} aria-label={`View ${dayNames[day]} ${shiftDate(week, day)}`}>
        <div className="day-title-row"><span>{dayNames[day]}</span><strong>{Number(shiftDate(week, day).slice(-2))}</strong></div>
        <div className="capacity-summary"><div className="capacity-track"><span style={{ width: `${Math.min(100, capacity[day].bookedHours / capacity[day].availableHours * 100)}%` }} /></div><small title={`${capacity[day].bookedHours} effort hours / ${capacity[day].availableHours}h capacity`}>{capacity[day].bookedHours.toFixed(1)} / {capacity[day].availableHours}h</small></div>
      </button>)}
    </div>
    <div className="deadline-grid" style={{ gridTemplateColumns: columns }}><div className="deadline-label"><Flag size={12} /> Due</div>
      {visibleDays.map(day => <div className="deadline-cell" key={day}>{items.filter(item => item.dueAt && dateInZone(item.dueAt, p.timezone) === shiftDate(week, day)).map(item => <button data-color={resolveColor(item)} style={colorStyle(item)} key={item.id} disabled={Boolean(originalItems)} onClick={() => onEdit(item)} className={`deadline-chip${proposed(item) ? ' proposed' : ''}${item.completed ? ' item-completed' : ''}`}><span /><strong>{item.title} · {displayTime(item.dueAt!, p)}</strong></button>)}</div>)}
    </div>
    {outside.length > 0 && <div className="overnight-grid" style={{ gridTemplateColumns: columns }}><div className="deadline-label">Outside<br />view</div>{visibleDays.map(day => <div className="overnight-cell" key={day}>{outside.filter(item => dateInZone(item.startsAt!, p.timezone) === shiftDate(week, day)).map(item => <button data-color={resolveColor(item)} style={colorStyle(item)} className={`overnight-event event-${item.category}${proposed(item) ? ' proposed' : ''}${item.completed ? ' item-completed' : ''}`} key={item.id} disabled={Boolean(originalItems)} onClick={() => onEdit(item)}><small>{proposed(item) ? 'PROPOSED · ' : ''}{displayTime(item.startsAt!, p)}–{displayTime(item.endsAt!, p)}</small><strong>{item.title}</strong></button>)}</div>)}</div>}
    <div className="timeline-grid" style={{ gridTemplateColumns: columns }}><div className="time-axis" style={{ height }}>{Array.from({ length: endHour - startHour + 1 }, (_, n) => <span key={n} style={{ top: n * HOUR_HEIGHT }}>{clockLabel((startHour + n) * 60, p.fullDay ? '24' : p.format)}{startHour + n === 25 ? ' +1d' : ''}</span>)}</div>
      {visibleDays.map(day => {
        const date = shiftDate(week, day);
        const segments = scheduled.map(item => ({ item, start: Math.max(min, wallMinute(item.startsAt!, date, p.timezone)), end: Math.min(max, wallMinute(item.endsAt!, date, p.timezone)), lane: 0, lanes: 1 })).filter(segment => segment.end > segment.start).sort((a, b) => a.start - b.start || b.end - a.end);
        let group: typeof segments = [], laneEnds: number[] = [], groupEnd = -1;
        const finishGroup = () => { group.forEach(segment => { segment.lanes = laneEnds.length; }); group = []; laneEnds = []; };
        segments.forEach(segment => { if (segment.start >= groupEnd) finishGroup(); let lane = laneEnds.findIndex(end => end <= segment.start); if (lane < 0) lane = laneEnds.length; laneEnds[lane] = segment.end; segment.lane = lane; group.push(segment); groupEnd = Math.max(groupEnd, segment.end); }); finishGroup();
        return <div className={`timeline-day${date === today ? ' today' : ''}`} key={day} data-date={date} style={{ height }}>
          {originalItems?.filter(item => item.startsAt && item.endsAt && items.some(next => next.id === item.id && (next.startsAt !== item.startsAt || next.endsAt !== item.endsAt))).map(item => { const start = Math.max(min, wallMinute(item.startsAt!, date, p.timezone)), end = Math.min(max, wallMinute(item.endsAt!, date, p.timezone)); return end > start ? <article className="calendar-event original-event" key={item.id} style={{ top: (start - min) / 60 * HOUR_HEIGHT, height: (end - start) / 60 * HOUR_HEIGHT }}><strong>{item.title}</strong><span>Previous time</span></article> : null; })}
          {segments.map(({ item, start, end, lane, lanes }) => <button data-conflict={lanes > 1 ? true : undefined} data-color={resolveColor(item)} key={item.id} className={`calendar-event event-${item.category}${proposed(item) ? ' proposed' : ''}${item.completed ? ' item-completed' : ''}${item.recovery ? ' recovery-event' : ''}`} aria-label={`Edit ${item.title}`} disabled={Boolean(originalItems)} onClick={() => onEdit(item)} title={`${item.title} · ${displayTime(item.startsAt!, p)}–${displayTime(item.endsAt!, p)} · ${zoneLabel(p.timezone)}`} style={{ ...colorStyle(item), top: (start - min) / 60 * HOUR_HEIGHT, height: Math.max(18, (end - start) / 60 * HOUR_HEIGHT), left: `calc(${lane / lanes * 100}% + 4px)`, right: 'auto', width: `calc(${100 / lanes}% - 8px)` }}>
            <div className="event-time"><Clock3 size={10} />{displayTime(item.startsAt!, p)}{proposed(item) ? ' · Proposed' : ''}</div><strong>{item.completed ? '✓ ' : ''}{item.title}</strong>{lanes > 1 && <span className="event-conflict" title="Overlaps another event" aria-label="Schedule conflict">!</span>}<span className="event-relationship" title={relationshipLabel(item, projects)}>{relationshipLabel(item, projects)}</span>
          </button>)}
          {date === today && current.minute >= min && current.minute < max && <div className="current-time-line" role="status" aria-label={`Current time ${displayTime(now.toISOString(), p)}. ${current.label}. ${current.detail}`} title={`${displayTime(now.toISOString(), p)} · ${zoneLabel(p.timezone)} · ${current.detail}`} style={{ top: (current.minute - min) / 60 * HOUR_HEIGHT }}><span>{current.label}</span></div>}
        </div>;
      })}
    </div>
  </div></div></section>;
}
