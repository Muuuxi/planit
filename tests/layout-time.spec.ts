import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.clock.install({ time: new Date('2026-09-14T13:59:00Z') });
  await page.clock.pauseAt(new Date('2026-09-14T14:00:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
});

test('compact rail and optional context expand calendar space without losing data', async ({ page }) => {
  const sidebar = page.getByRole('complementary', { name: 'Primary navigation' });
  await expect(sidebar.getByRole('button', { name: 'This Week', exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole('button', { name: 'Work / Life', exact: true })).toHaveCount(0);
  await expect(sidebar.locator('.week-balance')).toHaveCount(0);
  expect((await sidebar.boundingBox())!.width).toBe(68);
  const context = page.getByRole('complementary', { name: 'Week context' });
  await expect(context).toBeHidden();
  const calendar = page.getByRole('region', { name: 'Weekly schedule' });
  const wide = (await calendar.boundingBox())!.width;
  await page.screenshot({ path: 'test-results/compact-calendar.png' });
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await expect(context).toBeVisible();
  await expect(context.getByRole('region', { name: 'Week balance' })).toBeVisible();
  expect((await calendar.boundingBox())!.width).toBeLessThan(wide);
  const railBox = (await sidebar.boundingBox())!;
  const contextBox = (await context.boundingBox())!;
  const calendarBox = (await calendar.boundingBox())!;
  expect(contextBox.x).toBe(railBox.x + railBox.width);
  expect(contextBox.width).toBe(279);
  expect(calendarBox.x).toBeGreaterThan(contextBox.x);
  expect(calendarBox.x + calendarBox.width).toBe(page.viewportSize()!.width);
  const balanceBox = (await context.locator('.week-balance').boundingBox())!;
  const prioritiesBox = (await context.getByRole('heading', { name: 'Top priorities' }).boundingBox())!;
  expect(balanceBox.y).toBeLessThan(prioritiesBox.y);
  await page.screenshot({ path: 'test-results/expanded-context.png' });
  await page.getByRole('button', { name: 'Collapse context sidebar' }).click();
  await expect(context).toBeHidden();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Calendar settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Collapse context sidebar' }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Projects', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await expect(calendar).toBeVisible();
});

test('live line advances, shows next event and done state, and stays on today only', async ({ page }) => {
  await page.evaluate(() => {
    const example = JSON.parse(localStorage.getItem('planit-items-v4')!)[0];
    localStorage.setItem('planit-items-v4', JSON.stringify([{ ...example, id: 'live-test', title: 'Upcoming seminar', completed: false, startsAt: '2026-09-14T14:30:00Z', endsAt: '2026-09-14T15:00:00Z', dueAt: null }]));
  });
  await page.reload();
  const line = page.locator('.current-time-line');
  await expect(line).toHaveCount(1);
  await expect(line).toHaveText('Next · Upcoming seminar in 30 min');
  await expect(page.locator('[data-date="2026-09-14"] .current-time-line')).toHaveCount(1);
  const top = await line.evaluate(el => parseFloat((el as HTMLElement).style.top));
  await page.clock.fastForward(60000);
  await expect(line).toHaveText('Next · Upcoming seminar in 29 min');
  expect(await line.evaluate(el => parseFloat((el as HTMLElement).style.top))).toBeCloseTo(top + 64 / 60, 2);
  await page.getByRole('button', { name: 'Day', exact: true }).click();
  await expect(line).toHaveCount(1);
  await page.getByRole('button', { name: 'Next day', exact: true }).click();
  await expect(line).toHaveCount(0);
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.clock.fastForward(60 * 60000);
  await expect(line).toHaveText('Done today');
  await page.getByRole('button', { name: 'Week', exact: true }).click();
  await page.getByRole('button', { name: 'Next week', exact: true }).click();
  await expect(line).toHaveCount(0);
});

test('timezone shifts line and events together, handles midnight and visible range', async ({ page }) => {
  const line = page.locator('.current-time-line');
  const initialLabel = await line.textContent();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('tab', { name: 'Calendar', exact: true }).click();
  const settings = page.getByRole('complementary', { name: 'Calendar settings' });
  await settings.getByRole('switch').check();
  await settings.getByLabel('Search timezones').fill('Pacific');
  await settings.getByLabel('Timezone', { exact: true }).selectOption('America/Los_Angeles');
  await expect(line).toHaveText(initialLabel!);
  expect(await line.evaluate(el => parseFloat((el as HTMLElement).style.top))).toBe(7 * 64);
  await settings.getByLabel('Search timezones').fill('China');
  await settings.getByLabel('Timezone', { exact: true }).selectOption('Asia/Shanghai');
  // The active event is the same instant in every timezone.
  await expect(line).toHaveText(initialLabel!);
  expect(await line.evaluate(el => parseFloat((el as HTMLElement).style.top))).toBe(22 * 64);
  await expect(page.getByRole('button', { name: 'Edit Weekly planning', exact: true })).toContainText('8:00 PM');
  await page.clock.fastForward(121 * 60000);
  await expect(page.locator('[data-date="2026-09-15"] .current-time-line')).toHaveCount(1);
  expect(await line.evaluate(el => parseFloat((el as HTMLElement).style.top))).toBeCloseTo(64 / 60, 2);
  await settings.getByRole('switch').uncheck();
  await expect(line).toHaveCount(0);
});
