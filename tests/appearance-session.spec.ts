import { quickAction } from './quickAction';
import { test, expect, type Page } from '@playwright/test';
test.beforeEach(async ({ page }) => { page.on('pageerror', error => { throw error; }); await page.clock.setFixedTime(new Date('2026-09-14T16:00:00Z')); await page.goto('/'); });
async function enter(page: Page) { await page.getByRole('button', { name: 'Explore Demo', exact: true }).click(); await page.getByRole('button', { name: 'Expand context sidebar' }).click(); }
async function settings(page: Page) { await page.getByRole('button', { name: 'Settings', exact: true }).click(); }
async function logout(page: Page) { await page.getByRole('button', { name: 'Open account menu' }).click(); await page.getByRole('button', { name: 'Log out', exact: true }).click(); }
const calendar = (page: Page) => page.getByRole('region', { name: 'Weekly schedule' });

test('welcome, provider demos, email validation, session persistence and logout', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Plan with your voice. Adapt when life changes.' })).toBeVisible();
  await page.screenshot({ path: 'test-results/welcome-sage.png' });
  await enter(page);
  await expect(calendar(page)).toBeVisible();
  await page.reload();
  await expect(calendar(page)).toBeVisible();
  await logout(page);
  await expect(page.getByRole('button', { name: 'Explore Demo' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Explore Demo' })).toBeVisible();
  for (const provider of ['Google', 'Microsoft']) {
    await page.getByRole('button', { name: `Continue with ${provider}` }).click();
    await page.getByRole('button', { name: 'Open account menu' }).click();
    await expect(page.locator('.account-menu')).toContainText(`${provider} Demo`);
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Sign in with email' }).click();
  await page.getByLabel('Email', { exact: true }).fill('invalid');
  await page.getByLabel('Password', { exact: true }).fill('temporary-only');
  await page.getByRole('button', { name: 'Enter demo with email' }).click();
  await expect(calendar(page)).toHaveCount(0);
  await page.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await page.getByRole('button', { name: 'Enter demo with email' }).click();
  await expect(calendar(page)).toBeVisible();
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  expect(storage).not.toContain('temporary-only');
  await settings(page); await page.getByRole('tab', { name: 'Account', exact: true }).click();
  await expect(page.locator('.account-card')).toContainText('alex@example.com');
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Explore Demo' })).toBeVisible();
});

test('five themes update app surfaces and persist, weekends and color behavior are configurable', async ({ page }) => {
  await enter(page); await settings(page);
  const before = await page.locator('.sidebar').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.getByRole('button', { name: 'Mist Blue', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mist');
  expect(await page.locator('.sidebar').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before);
  const focusColor = await page.getByRole('button', { name: 'Today', exact: true }).evaluate(el => getComputedStyle(el).getPropertyValue('--focus-ring'));
  expect(focusColor.trim()).toBe('#80a4bf');
  await page.screenshot({ path: 'test-results/theme-mist.png' });
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'mist');
  await settings(page);
  const backgrounds = new Set<string>();
  for (const [name, id] of [['Sage', 'sage'], ['Warm Sand', 'sand'], ['Lavender', 'lavender'], ['Clean Light', 'clean'], ['Mist Blue', 'mist']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', id);
    backgrounds.add(await page.locator('.sidebar').evaluate(el => getComputedStyle(el).backgroundColor));
  }
  expect(backgrounds.size).toBe(5);
  await page.getByLabel('Inherit project colors by default').uncheck();
  await page.getByRole('tab', { name: 'Calendar', exact: true }).click();
  await page.getByLabel('Show weekends', { exact: true }).uncheck();
  await expect(calendar(page).locator('.timeline-day')).toHaveCount(5);
  await page.reload(); await expect(calendar(page).locator('.timeline-day')).toHaveCount(5);
  await quickAction(page, 'Add event');
  await expect(page.getByLabel('Use project color', { exact: true })).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Purple', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Close event editor' }).click();
  await logout(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'mist');
});

test('event overrides sync across views; project colors propagate and survive rename/reload', async ({ page }) => {
  await enter(page);
  const event = calendar(page).getByRole('button', { name: 'Edit Project synthesis', exact: true });
  await expect(event).toHaveAttribute('data-color', 'green');
  await event.click();
  await page.getByLabel('Use project color', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Purple', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Event editor' })).toHaveAttribute('data-color', 'purple');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(event).toHaveAttribute('data-color', 'purple');
  await expect(page.getByRole('button', { name: 'Complete Project synthesis', exact: true })).toHaveAttribute('data-color', 'purple');
  for (const name of ['Projects']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('region', { name, exact: true }).locator('.planner-row').filter({ hasText: 'Project synthesis' })).toHaveAttribute('data-color', 'purple');
  }
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.locator('[data-project="Planit"]').getByRole('button', { name: 'Edit project' }).click();
  await page.getByRole('button', { name: 'Blue', exact: true }).click();
  await page.getByRole('button', { name: 'Save project' }).click();
  await expect(page.locator('[data-project="Planit"] .planner-row').filter({ hasText: 'Case study writing' })).toHaveAttribute('data-color', 'blue');
  await expect(page.locator('[data-project="Planit"] .planner-row').filter({ hasText: 'Project synthesis' })).toHaveAttribute('data-color', 'purple');
  await page.locator('[data-project="Planit"]').getByRole('button', { name: 'Edit project' }).click();
  await page.getByLabel('Project name').fill('Research');
  await page.getByRole('button', { name: 'Save project' }).click();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await expect(event).toHaveAttribute('data-color', 'purple');
  await expect(calendar(page).getByRole('button', { name: 'Edit Case study writing' })).toHaveAttribute('data-color', 'blue');
  await page.reload();
  await expect(event).toHaveAttribute('data-color', 'purple');
  await expect(calendar(page).getByRole('button', { name: 'Edit Case study writing' })).toHaveAttribute('data-color', 'blue');
  await page.screenshot({ path: 'test-results/event-colors.png' });
});

test('new projects, inherited new events, deadline colors and existing-data migration', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Project name').fill('Launch');
  await page.getByRole('button', { name: 'Indigo', exact: true }).click();
  await page.getByRole('button', { name: 'Save project' }).click();
  await page.locator('[data-project="Launch"]').getByRole('button', { name: 'Add event' }).click();
  await expect(page.getByLabel('Use project color', { exact: true })).toBeChecked();
  await page.getByLabel('Title', { exact: true }).fill('Launch review');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await expect(calendar(page).getByRole('button', { name: 'Edit Launch review' })).toHaveAttribute('data-color', 'indigo');
  await calendar(page).locator('.deadline-chip').filter({ hasText: 'AIPI product brief' }).click();
  await page.getByLabel('Use project color', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Orange', exact: true }).click();
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(calendar(page).locator('.deadline-chip').filter({ hasText: 'AIPI product brief' })).toHaveAttribute('data-color', 'orange');
  await expect(page.locator('.contextual-deadline').filter({ hasText: 'AIPI product brief' })).toHaveAttribute('data-color', 'orange');
  const count = await page.evaluate(() => {
    const items = JSON.parse(localStorage.getItem('planit-items-v4')!);
    items.forEach((item: Record<string, unknown>) => { delete item.color; delete item.useProjectColor; });
    localStorage.setItem('planit-items-v4', JSON.stringify(items));
    const prefs = JSON.parse(localStorage.getItem('planit-preferences-v1')!); delete prefs.theme; delete prefs.showWeekends; delete prefs.inheritProjectColor;
    localStorage.setItem('planit-preferences-v1', JSON.stringify(prefs));
    return items.length;
  });
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('planit-items-v4')!).length)).toBe(count);
  await expect(calendar(page).getByRole('button', { name: 'Edit Launch review' })).toHaveAttribute('data-color', 'indigo');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'sage');
});
