import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('menu supports arrows, wraparound, Home/End, Enter and Escape', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('navigation', { name: 'Main Menu' });
  const posts = menu.getByRole('button', { name: 'Posts', exact: true });
  await posts.focus();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('button', { name: 'Reading', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(posts).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const about = menu.getByRole('button', { name: 'About', exact: true });
  await expect(about).toBeFocused();
  await expect(about).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'About', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Back to main menu' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => {
    const active = document.activeElement;
    return active === document.body || !!active?.closest('dialog[open]');
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(about).toBeFocused();
  await page.keyboard.press('End');
  await expect(menu.getByRole('button', { name: 'Reading', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(posts).toBeFocused();
});

test('every menu item opens and closes its own honest section preview', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Posts', 'About', 'Projects', 'Reading']) {
    const opener = page.getByRole('navigation').getByRole('button', { name, exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('not available yet');
    await dialog.getByRole('button', { name: 'Back to main menu' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page).toHaveURL('/');
  }
});

test('skip link moves keyboard focus directly to the main content', async ({ page }) => {
  await page.goto('/');
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
    await page.goto('/');
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
    const image = await page.request.get('/images/village.webp');
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
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(home.violations).toEqual([]);
    await page.getByRole('button', { name: 'About', exact: true }).click();
    const dialog = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(dialog.violations).toEqual([]);
  });
}
