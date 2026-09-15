import { test, expect } from '@playwright/test';
import { quickAction } from './quickAction';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.clock.setFixedTime(new Date('2026-09-14T14:00:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
});

test('collapsed popover is keyboard accessible and opens existing voice without duplicate header actions', async ({ page }) => {
  await expect(page.locator('.week-toolbar').getByRole('button', { name: 'Add event' })).toHaveCount(0);
  await expect(page.locator('.week-toolbar').getByRole('button', { name: 'Speak a change' })).toHaveCount(0);
  const trigger = page.getByRole('button', { name: 'Quick Add', exact: true });
  await trigger.click();
  const popover = page.getByRole('dialog', { name: 'Quick Add' });
  await expect(popover).toBeVisible();
  await expect(popover.getByRole('button', { name: 'Add event' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Expand context sidebar' })).toHaveAttribute('aria-expanded', 'false');
  await page.screenshot({ path: 'test-results/quick-add-popover.png' });
  await page.keyboard.press('Escape');
  await expect(popover).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(popover).toHaveCount(0);
  await trigger.click();
  await popover.getByRole('button', { name: 'Speak a change' }).click();
  await expect(page.getByRole('heading', { name: 'Here’s what I understood' })).toBeVisible();
});

test('Quick Add creates an active event; edits, moves and deletes immediately update the line', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('planit-items-v4', '[]'));
  await page.reload();
  const line = page.locator('.current-time-line');
  await expect(line).toHaveText('Done today');
  await page.getByRole('button', { name: 'Expand context sidebar' }).click();
  await expect(page.getByRole('complementary', { name: 'Week context' }).getByRole('button', { name: 'Add event', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/quick-add-expanded.png' });
  await quickAction(page, 'Add event');
  await page.getByLabel('Title', { exact: true }).fill('Live work');
  await page.getByLabel('Start time', { exact: true }).fill('09:30');
  await page.getByLabel('End time', { exact: true }).fill('10:30');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(line).toHaveText('Now · Live work · 30 min left');
  await page.getByRole('button', { name: 'Edit Live work', exact: true }).click();
  await page.getByLabel('End time', { exact: true }).fill('10:15');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(line).toHaveText('Now · Live work · 15 min left');
  await page.getByRole('button', { name: 'Edit Live work', exact: true }).click();
  await page.getByLabel('Start time', { exact: true }).fill('11:00');
  await page.getByLabel('End time', { exact: true }).fill('12:00');
  await page.getByRole('button', { name: 'Save commitment' }).click();
  await expect(line).toHaveText('Next · Live work in 1h');
  await page.getByRole('button', { name: 'Edit Live work', exact: true }).click();
  await page.getByRole('button', { name: 'Delete commitment' }).click();
  await page.getByRole('button', { name: 'Confirm delete' }).click();
  await expect(line).toHaveText('Done today');
});
