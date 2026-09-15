import { test, expect } from '@playwright/test';
import { currentTimeStatus } from '../src/currentTime';
import { defaultPreferences, emptyDraft, itemFromDraft, type PlannerItem } from '../src/planner';

const event = (title: string, startsAt: string, endsAt: string): PlannerItem => ({
  ...itemFromDraft({ ...emptyDraft('2026-09-14', defaultPreferences.timezone), title }),
  startsAt, endsAt,
});
const status = (now: string, items: PlannerItem[], zone = 'America/New_York') => currentTimeStatus(new Date(now), zone, items).label;

test('active events beat upcoming events, include completed scheduled blocks, and respect exact boundaries', () => {
  const work = event('Portfolio deep work', '2026-09-14T20:00:00Z', '2026-09-14T23:02:00Z');
  const next = event('Project synthesis', '2026-09-14T22:08:00Z', '2026-09-14T23:08:00Z');
  expect(status('2026-09-14T21:30:00Z', [next, work])).toBe('Now · Portfolio deep work · 1h 32m left');
  expect(status('2026-09-14T22:38:00Z', [work])).toBe('Now · Portfolio deep work · 24 min left');
  expect(status('2026-09-14T23:02:00Z', [work])).toBe('Done today');
  expect(status('2026-09-14T20:00:00Z', [{ ...work, completed: true }])).toBe('Now · Portfolio deep work · 3h 2m left');
  expect(status('2026-09-14T21:30:00Z', [next])).toBe('Next · Project synthesis in 38 min');
  expect(status('2026-09-14T20:53:00Z', [next])).toBe('Next · Project synthesis in 1h 15m');
});

test('overnight active events, local-day filtering, DST and deadline-only records', () => {
  const overnight = event('Night interview', '2026-09-15T03:00:00Z', '2026-09-15T06:00:00Z');
  expect(status('2026-09-15T04:30:00Z', [overnight])).toBe('Now · Night interview · 1h 30m left');
  expect(status('2026-09-15T04:30:00Z', [overnight], 'Asia/Shanghai')).toBe('Now · Night interview · 1h 30m left');
  const tomorrow = event('Tomorrow', '2026-09-15T05:00:00Z', '2026-09-15T06:00:00Z');
  expect(status('2026-09-15T03:30:00Z', [tomorrow])).toBe('Done today');
  expect(status('2026-09-15T03:30:00Z', [tomorrow], 'UTC')).toBe('Next · Tomorrow in 1h 30m');
  expect(status('2026-09-15T03:30:00Z', [{ ...tomorrow, kind: 'deadline', startsAt: null, endsAt: null, dueAt: tomorrow.startsAt }])).toBe('Done today');
  const dst = event('DST block', '2026-11-01T05:30:00Z', '2026-11-01T07:00:00Z');
  expect(status('2026-11-01T06:00:00Z', [dst])).toBe('Now · DST block · 1h left');
});
