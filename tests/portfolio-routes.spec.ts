import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { path: 'about/', heading: 'About' },
  { path: 'projects/', heading: 'Projects' },
  { path: 'projects/unified-troubleshooting-platform/', heading: 'Unified troubleshooting platform' },
  { path: 'projects/event-driven-invoicing/', heading: 'Event-driven invoicing system' },
  { path: 'posts/', heading: 'Posts' },
  { path: 'reading/', heading: 'Reading' },
  { path: 'reading/fiodor-dostoievski-noites-brancas/', heading: 'Noites Brancas' },
];

for (const route of routes) {
  test(`${route.path} has a real page, no loading failures, and an accessible heading`, async ({ page }) => {
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto(`./${route.path}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(page.getByRole('link', { name: /Personal Log|Quest Log|Reading Codex/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(failures).toEqual([]);
  });
}

test('About exposes the requested professional profile links', async ({ page }) => {
  await page.goto('./about/');
  await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/bernardosevero/');
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/bernardosevero');
  await expect(page.getByRole('heading', { name: 'Experience' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Specializations' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Working strengths' })).toBeVisible();
  await expect(page.locator('.social-link .pixel-icon')).toHaveCount(2);
});

for (const width of [320, 390, 1586]) {
  test(`About portrait and heading links fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.goto('./about/');
    await page.evaluate(() => document.fonts.ready);
    const portrait = page.getByRole('img', { name: /Bernardo wearing round glasses/ });
    await expect(portrait).toBeVisible();
    expect(await portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    const heading = await page.getByRole('heading', { name: 'About me', exact: true }).boundingBox();
    for (const name of [/LinkedIn/, /GitHub/]) {
      const link = await page.getByRole('link', { name }).boundingBox();
      expect(Math.abs((heading!.y + heading!.height / 2) - (link!.y + link!.height / 2))).toBeLessThan(2);
    }
    await expect(page.getByText('Better tools. Kinder humans.')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('Reading opens a book review from its card', async ({ page }) => {
  await page.goto('./reading/');
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toHaveCount(0);
  await page.getByRole('link', { name: /Noites Brancas/ }).click();
  await expect(page).toHaveURL(/reading\/fiodor-dostoievski-noites-brancas\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Noites Brancas' })).toBeVisible();
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toBeVisible();
});

for (const width of [390, 1586]) {
  test(`portfolio pages fit and pass automated accessibility checks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of ['about/', 'projects/', 'projects/unified-troubleshooting-platform/', 'posts/', 'reading/', 'reading/fiodor-dostoievski-noites-brancas/']) {
      await page.goto(`./${path}`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(accessibility.violations).toEqual([]);
    }
  });
}
