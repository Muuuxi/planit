import { test, expect } from '@playwright/test';
import { capacities, emptyDraft, itemFromDraft, toInstant } from '../src/planner';

test('timezone conversion respects DST and rejects nonexistent local times', () => {
  expect(toInstant('2026-01-15', '09:00', 'America/New_York')).toBe('2026-01-15T14:00:00.000Z');
  expect(toInstant('2026-07-15', '09:00', 'America/New_York')).toBe('2026-07-15T13:00:00.000Z');
  expect(toInstant('2026-09-18', '23:59', 'Asia/Shanghai')).toBe('2026-09-18T15:59:00.000Z');
  expect(() => toInstant('2026-03-08', '02:30', 'America/New_York')).toThrow('does not exist');
});

test('work spanning midnight reduces next-day capacity; rest does not', () => {
  const item = itemFromDraft({ ...emptyDraft('2026-09-14', 'America/New_York'), title: 'Late work', start: '23:30', endDate: '2026-09-15', end: '01:00', energy: 'High' });
  const work = capacities([item], '2026-09-14', 'America/New_York');
  expect(work[1].availableHours).toBe(6);
  expect(work[1].bookedHours).toBe(1.3);
  const rest = capacities([{ ...item, category: 'personal' }], '2026-09-14', 'America/New_York');
  expect(rest[1].availableHours).toBe(7.5);
  expect(rest[1].bookedHours).toBe(0);
});
