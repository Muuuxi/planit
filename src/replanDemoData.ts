import { calendarEvents, deadlines, dailyCapacity } from './demoData';
import type { CalendarEvent, Deadline, DailyCapacity } from './types';

export interface WeekPlan {
  events: CalendarEvent[];
  deadlines: Deadline[];
  capacity: DailyCapacity[];
}

export const recommendations = [
  { action: 'KEEP', title: 'Final Project Deadline', schedule: 'Friday', reason: 'fixed academic deadline' },
  { action: 'MOVE', title: 'Resume Update', schedule: 'Wednesday → Saturday', reason: 'flexible and lower urgency' },
  { action: 'ADD', title: 'Interview Preparation', schedule: 'Wednesday 7:00–9:00 PM', reason: 'preparation is needed before the interview' },
  { action: 'PROTECT', title: 'Thursday Morning', schedule: '7:00–11:00 AM · recovery', reason: 'capacity is reduced after a 2 AM interview' },
  { action: 'MOVE', title: 'Project Work', schedule: 'Thursday → Wednesday afternoon', reason: 'Thursday capacity is limited' },
];

export const newCommitments = [
  'Final Interview — Thu 2:00 AM',
  'Online Assessment — Wed 11:59 PM',
];

function scheduledHours(events: CalendarEvent[], day: number): number {
  const minutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  return Math.round(events.filter(event => event.day === day && event.id !== 'recovery').reduce((total, event) => total + (minutes(event.end) - minutes(event.start)) / 60, 0) * 10) / 10;
}

export const initialPlan: WeekPlan = {
  events: [
    ...calendarEvents.map(event => event.id === 'e13' ? { ...event, title: 'Project Work', detail: 'Flexible project block' } : event),
    { id: 'resume-update', title: 'Resume Update', day: 2, start: '17:00', end: '18:00', category: 'focus', detail: 'Flexible · lower urgency' },
  ],
  deadlines: [...deadlines, { id: 'final-project', title: 'Final Project Deadline', day: 4, time: '11:59 PM', project: 'Academic · fixed' }],
  capacity: dailyCapacity,
};
initialPlan.capacity = dailyCapacity.map(day => ({ ...day, bookedHours: scheduledHours(initialPlan.events, day.day) }));

export const changedEventIds = new Set(['e13', 'resume-update', 'final-interview', 'interview-prep', 'recovery']);

// Deterministic mock: no AI or network calls. Stable IDs make applying idempotent.
export function createReplannedWeek(current: WeekPlan): WeekPlan {
  const additions: CalendarEvent[] = [
    { id: 'final-interview', title: 'Final Interview', day: 3, start: '02:00', end: '03:00', category: 'meeting', detail: 'Job Search · Critical · Fixed · High energy' },
    { id: 'interview-prep', title: 'Interview Preparation', day: 2, start: '19:00', end: '21:00', category: 'focus', detail: 'Prepare before the interview' },
    { id: 'recovery', title: 'Protected Recovery', day: 3, start: '07:00', end: '11:00', category: 'personal', detail: 'Reduced capacity after a 2 AM interview' },
  ];
  const result: WeekPlan = {
    events: [
      ...current.events.filter(event => !additions.some(addition => addition.id === event.id)).map(event => {
        if (event.id === 'resume-update') return { ...event, day: 5, start: '13:00', end: '14:00' };
        if (event.id === 'e13') return { ...event, day: 2, start: '13:30', end: '15:00' };
        return { ...event };
      }),
      ...additions,
    ],
    deadlines: [
      ...current.deadlines.filter(deadline => deadline.id !== 'assessment'),
      { id: 'assessment', title: 'Online Assessment', day: 2, time: '11:59 PM', project: 'Job Search · High · Fixed' },
    ],
    capacity: current.capacity.map(day => day.day === 3 ? { ...day, availableHours: 6 } : { ...day }),
  };
  result.capacity = result.capacity.map(day => ({ ...day, bookedHours: scheduledHours(result.events, day.day) }));
  return result;
}
