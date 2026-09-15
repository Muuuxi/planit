import { quickAction } from './quickAction';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.clock.setFixedTime(new Date('2026-09-14T16:00:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
});

test('secondary context changes by section and collapse preserves settings and drafts', async ({ page }) => {
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  const navigation = page.getByRole('complementary', { name: 'Project navigation' });
  await expect(navigation).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Week context' })).toHaveCount(0);
  await navigation.locator('[data-area="Personal"] .work-type-link').first().click();
  await expect(page.locator('[data-project="Personal"]')).toBeFocused();
  await page.screenshot({ path: 'test-results/left-project-navigation.png' });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('tab', { name: 'Calendar', exact: true }).click();
  await page.getByRole('button', { name: 'Collapse context sidebar' }).click();
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await expect(page.getByRole('tab', { name: 'Calendar', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: 'test-results/left-settings.png' });
  await quickAction(page, 'Add event');
  await page.getByLabel('Title', { exact: true }).fill('Unsaved sidebar draft');
  await page.getByRole('button', { name: 'Collapse context sidebar' }).click();
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Unsaved sidebar draft');
});

test('week balance and compact daily rows surface over-capacity days', async ({ page }) => {
  await page.evaluate(() => {
    const item = JSON.parse(localStorage.getItem('planit-items-v4')!)[0];
    localStorage.setItem('planit-items-v4', JSON.stringify([{ ...item, startsAt: '2026-09-14T10:00:00Z', endsAt: '2026-09-14T22:00:00Z', dueAt: null, energy: 'High', category: 'focus', completed: false }]));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  const context = page.getByRole('complementary', { name: 'Week context' });
  await expect(context.locator('.week-balance')).toContainText('h planned /');
  await expect(context.locator('.week-balance')).toContainText('%');
  await expect(context.locator('.capacity-warning')).toHaveText('Some days exceed capacity');
  await expect(context.locator('.capacity-row.over-capacity')).toHaveCount(1);
  await expect(context.getByLabel('Over capacity')).toBeVisible();
  await page.screenshot({ path: 'test-results/left-capacity-warning.png' });
});
