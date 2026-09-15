import type { Page } from '@playwright/test';
export async function quickAction(page: Page, name: 'Add event' | 'Speak a change') {
  const action = page.locator('.quick-add-actions').getByRole('button', { name, exact: true });
  if (!await action.isVisible()) {
    const collapse = page.getByRole('button', { name: 'Collapse context sidebar' });
    if (await collapse.isVisible()) await collapse.click();
    await page.getByRole('button', { name: 'Quick Add', exact: true }).click();
  }
  await action.click();
}
