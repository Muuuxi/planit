import { test, expect } from '@playwright/test';
import { palette } from '../src/appearance';
import { quickAction } from './quickAction';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.clock.setFixedTime(new Date('2026-09-14T16:00:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
});

test('Bright White persists, preserves six themes, and uses opaque readable event surfaces', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  for (const name of ['Sage', 'Mist Blue', 'Warm Sand', 'Lavender', 'Clean Light', 'Bright White']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bright White', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'bright');
  await page.screenshot({ path: 'test-results/bright-settings.png' });
  await page.getByRole('button', { name: 'Close settings' }).click();
  await expect(page.locator('.timeline-day.today')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.sidebar')).toHaveCSS('background-color', 'rgb(247, 249, 252)');
  await expect(page.locator('.context-tray')).toHaveCSS('background-color', 'rgb(250, 251, 252)');
  for (const card of await page.locator('.calendar-event[data-color]').all()) {
    await expect(card).toHaveCSS('opacity', '1');
    const background = await card.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(background).toMatch(/^rgb\(/);
  }
  await page.getByRole('button', { name: 'Complete Project synthesis', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit Project synthesis', exact: true })).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/bright-calendar.png' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'bright');
});

test('three shared hierarchy levels collapse and keep session expansion; editor changes regroup tasks', async ({ page }) => {
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  const view = page.getByRole('region', { name: 'Projects', exact: true });
  const academic = view.locator('[data-area="Academic"]');
  for (const name of ['AIPI 590', 'GAMEDSGN 552', 'Serious Games', 'I&E 748']) {
    await expect(academic.locator(`[data-project="${name}"]`)).toBeVisible();
    expect(await academic.locator(`[data-project="${name}"] .work-type`).count()).toBeGreaterThan(1);
  }
  const course = academic.locator('[data-project="AIPI 590"]');
  await course.getByRole('button', { name: 'Collapse AIPI 590 Assignments', exact: true }).click();
  await expect(course.locator('[data-work-type="Assignments"] .planner-row')).toHaveCount(0);
  await course.getByRole('button', { name: 'Collapse AIPI 590 project', exact: true }).click();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(course.getByRole('button', { name: 'Expand AIPI 590 project', exact: true })).toBeVisible();
  await course.getByRole('button', { name: 'Expand AIPI 590 project', exact: true }).click();
  await expect(course.getByRole('button', { name: 'Expand AIPI 590 Assignments', exact: true })).toBeVisible();
  await academic.getByRole('button', { name: 'Collapse Academic area', exact: true }).click();
  await expect(academic.locator('[data-project]')).toHaveCount(0);
  await academic.getByRole('button', { name: 'Expand Academic area', exact: true }).click();
  await course.getByRole('button', { name: 'Expand AIPI 590 Assignments', exact: true }).click();
  await course.getByRole('button', { name: 'Add event', exact: true }).click();
  await expect(page.getByLabel('Area', { exact: true })).toHaveValue('Academic');
  await expect(page.getByLabel('Course / Project', { exact: true })).toHaveValue('AIPI 590');
  await page.getByLabel('Title', { exact: true }).fill('Hierarchy presentation');
  await page.getByLabel('Work Type', { exact: true }).fill('Presentations');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(course.locator('[data-work-type="Presentations"]')).toContainText('Hierarchy presentation');
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  const event = page.getByRole('button', { name: 'Edit Hierarchy presentation', exact: true });
  await expect(event).toContainText('Academic › AIPI 590 › Presentations');
  await expect(event).toHaveAttribute('data-color', 'blue');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Bright White', exact: true }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.screenshot({ path: 'test-results/bright-projects.png' });
});

test('shared palette text has strong contrast on every opaque event surface', () => {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  for (const color of Object.values(palette)) {
    expect(color.background).toMatch(/^#[a-f0-9]{6}$/i);
    expect((luminance(color.background) + .05) / (luminance(color.text) + .05)).toBeGreaterThanOrEqual(4.5);
  }
});

test('legacy academic colors survive classification and a renamed course is not recreated on reload', async ({ page }) => {
  const before = await page.evaluate(() => {
    const example = JSON.parse(localStorage.getItem('planit-items-v4')!)[0];
    const item = { ...example, id: 'legacy-course', title: 'AIPI 590', project: 'Academic', color: 'blue', useProjectColor: true, notes: 'Keep this note', startsAt: '2026-09-14T13:00:00Z', endsAt: '2026-09-14T14:00:00Z' };
    delete item.area; delete item.workType;
    localStorage.setItem('planit-items-v4', JSON.stringify([item]));
    localStorage.setItem('planit-projects-v1', JSON.stringify([{ name: 'Academic', color: 'red' }, { name: 'AIPI 590', color: 'blue' }]));
    return item;
  });
  await page.reload();
  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem('planit-items-v4')!)[0]);
  expect(migrated).toMatchObject({ id: before.id, notes: before.notes, startsAt: before.startsAt, endsAt: before.endsAt, project: 'AIPI 590', area: 'Academic', color: 'red', useProjectColor: false });
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.locator('[data-project="AIPI 590"]').getByRole('button', { name: 'Edit project' }).click();
  await page.getByLabel('Project name').fill('AI Product Management');
  await page.getByRole('button', { name: 'Save project' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('[data-project="AIPI 590"]')).toHaveCount(0);
  await expect(page.locator('[data-project="AI Product Management"] .planner-row')).toHaveAttribute('data-color', 'red');
});

test('Bright White editor, mock voice and proposals stay opaque with shared relationships', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Bright White', exact: true }).click();
  await quickAction(page, 'Add event');
  await expect(page.getByLabel('Area', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Work Type', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/bright-editor.png' });
  await quickAction(page, 'Speak a change');
  await expect(page.getByRole('heading', { name: 'Here’s what I understood' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Final Interview', exact: true })).toContainText('Career');
  await page.screenshot({ path: 'test-results/bright-voice.png' });
  await page.getByRole('button', { name: 'Confirm & Replan' }).click();
  await expect(page.locator('.replan-commitments')).toContainText('Career › Job Search › Interviews');
  await page.getByRole('button', { name: 'Preview Changes' }).click();
  for (const card of await page.locator('.calendar-event.proposed, .calendar-event.original-event, .deadline-chip.proposed').all()) {
    await expect(card).toHaveCSS('opacity', '1');
    expect(await card.evaluate(el => getComputedStyle(el).backgroundColor)).toMatch(/^rgb\(/);
  }
  await page.screenshot({ path: 'test-results/bright-replan.png' });
});
