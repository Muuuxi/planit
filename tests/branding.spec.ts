import { test, expect } from '@playwright/test';

test('legacy browser data migrates without changing settings, colors or session behavior', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
  const original = await page.evaluate(() => {
    const items = JSON.parse(localStorage.getItem('planit-items-v4')!);
    items.forEach((item: { project: string }) => { if (item.project === 'Planit') item.project = 'ChronoFlow'; });
    const projects = JSON.parse(localStorage.getItem('planit-projects-v1')!);
    projects.forEach((project: { name: string; color: string }) => { if (project.name === 'Planit') { project.name = 'ChronoFlow'; project.color = 'indigo'; } });
    const prefs = { ...JSON.parse(localStorage.getItem('planit-preferences-v1')!), theme: 'lavender', format: '24', timezone: 'Asia/Shanghai' };
    localStorage.clear();
    localStorage.setItem('chronoflow-items-v4', JSON.stringify(items));
    localStorage.setItem('chronoflow-projects-v1', JSON.stringify(projects));
    localStorage.setItem('chronoflow-preferences-v1', JSON.stringify(prefs));
    localStorage.setItem('chronoflow-demo-session-v1', JSON.stringify({ name: 'Demo Explorer', email: 'explorer@demo.chronoflow.local', provider: 'Explore Demo' }));
    return { items, prefs };
  });
  await page.reload();
  await expect(page).toHaveTitle('Planit — Weekly Calendar');
  await expect(page.locator('.brand-name')).toHaveText('Planit');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'lavender');
  const saved = await page.evaluate(() => ({
    items: JSON.parse(localStorage.getItem('planit-items-v4')!),
    prefs: JSON.parse(localStorage.getItem('planit-preferences-v1')!),
    projects: JSON.parse(localStorage.getItem('planit-projects-v1')!),
    session: JSON.parse(localStorage.getItem('planit-demo-session-v1')!),
    keys: Object.keys(localStorage),
  }));
  expect(saved.items).toEqual(original.items.map((item: { project: string }) => ({ ...item, project: item.project === 'ChronoFlow' ? 'Planit' : item.project })));
  expect(saved.prefs).toEqual(original.prefs);
  expect(saved.projects).toContainEqual(expect.objectContaining({ name: 'Planit', color: 'indigo' }));
  expect(saved.session.email).toBe('explorer@demo.planit.local');
  expect(saved.keys.some(key => key.includes('chronoflow'))).toBe(false);
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Explore Demo', exact: true })).toBeVisible();
});

test('renamed calendar retains its existing presentation', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-14T16:00:00Z'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Demo', exact: true }).click();
  await expect(page.locator('.brand-name')).toHaveText('Planit');
  await page.screenshot({ path: 'v1-preview.png' });
});
