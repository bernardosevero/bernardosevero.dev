import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('menu supports arrows, wraparound, Home/End, and route links', async ({ page }) => {
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main Menu' });
  const posts = menu.getByRole('link', { name: 'Posts', exact: true });
  await posts.focus();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('link', { name: 'Reading', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(posts).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const about = menu.getByRole('link', { name: 'About', exact: true });
  await expect(about).toBeFocused();
  await expect(about).toHaveAttribute('data-active', 'true');
  await expect(about).toHaveAttribute('href', '/bernardosevero.dev/about/');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/bernardosevero.dev/about/');
  await page.goto('./');
  await posts.focus();
  await page.keyboard.press('End');
  await expect(menu.getByRole('link', { name: 'Reading', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(posts).toBeFocused();
});

test('every menu item reaches its implemented route', async ({ page }) => {
  await page.goto('./');
  for (const [name, path] of [['Posts', 'posts/'], ['About', 'about/'], ['Projects', 'projects/'], ['Reading', 'reading/']]) {
    const link = page.getByRole('navigation').getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', `/bernardosevero.dev/${path}`);
    await link.click();
    await expect(page).toHaveURL(`/bernardosevero.dev/${path}`);
    await page.goto('./');
  }
});

test('skip link moves keyboard focus directly to the main content', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

for (const viewport of [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 760, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1586, height: 992 },
]) {
  test(`layout fits at ${viewport.width}px with loaded fonts and artwork`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => {
      const selectors = ['.home', '.nameplate', '.menu-panel', '.character-panel', '.character-heading', '.character-stats', '.welcome-message'];
      return selectors.filter(selector => {
        const element = document.querySelector<HTMLElement>(selector)!;
        const rect = element.getBoundingClientRect();
        return element.scrollWidth > element.clientWidth + 2 || rect.right > innerWidth + 1 || rect.left < 0;
      });
    });
    expect(overflow).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.fonts.check('700 30px "Pixelify Sans"') && document.fonts.check('400 28px "VT323"'))).toBe(true);
    const image = await page.request.get('images/village.webp');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/webp');
    expect(failures).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`home-${viewport.width}.png`), fullPage: true });
  });
}

for (const width of [390, 1586]) {
  test(`Home and its open dialog pass automated accessibility checks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(home.violations).toEqual([]);
    await page.getByRole('link', { name: 'About', exact: true }).click();
    const about = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(about.violations).toEqual([]);
  });
}

test('design system renders live tokens and shared components', async ({ page }) => {
  await page.goto('./system/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1, name: 'Design System' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue quest' })).toBeVisible();
  await expect(page.locator('[data-token="--parchment"] [data-token-value]')).toHaveText('#ecd59c');
  await expect(page.getByRole('link', { name: /Return to the Personal Log/ })).toHaveAttribute('href', '/bernardosevero.dev/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});
