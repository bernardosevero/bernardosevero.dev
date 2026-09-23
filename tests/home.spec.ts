import { test, expect } from '@playwright/test';
import process from 'node:process';
import AxeBuilder from '@axe-core/playwright';

const basePath = `${(process.env.BASE_PATH || '/').replace(/\/+$/, '')}/`;
const siteURL = process.env.SITE_URL || 'https://bernardosevero.dev';

test('homepage opens the character sheet with keyboard-accessible navigation', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'About', exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /Bernardo wearing round glasses/ })).toBeVisible();
  await expect(page).toHaveTitle('Bernardo Severo — Product Engineer');
  const menu = page.getByRole('navigation', { name: 'Main navigation' });
  const about = menu.getByRole('link', { name: 'About', exact: true });
  await expect(about).toHaveAttribute('data-active', 'true');
  await about.focus();
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link', { name: 'Projects', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${basePath}projects/`);
});

test('every menu item reaches its implemented route', async ({ page }) => {
  await page.goto('./');
  for (const [name, path] of [
    ['Posts', 'posts/'],
    ['Projects', 'projects/'],
    ['Books', 'reading/'],
    ['System', 'system/'],
  ]) {
    const link = page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', `${basePath}${path}`);
    await link.click();
    await expect(page).toHaveURL(`${basePath}${path}`);
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

test('social metadata exposes a crawler-friendly sharing image', async ({ page }) => {
  await page.goto('./');
  const socialImage = page.locator('meta[property="og:image"]');
  await expect(socialImage).toHaveAttribute(
    'content',
    new URL(`${basePath}images/social-card-v2.jpg`, siteURL).href,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new URL(basePath, siteURL).href,
  );
  await expect(page.locator('meta[property="og:image:url"]')).toHaveAttribute(
    'content',
    (await socialImage.getAttribute('content')) as string,
  );
  await expect(page.locator('meta[property="og:image:secure_url"]')).toHaveAttribute(
    'content',
    (await socialImage.getAttribute('content')) as string,
  );
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
    'content',
    'image/jpeg',
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('link[rel="image_src"]')).toHaveAttribute(
    'href',
    (await socialImage.getAttribute('content')) as string,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  const response = await page.request.get('images/social-card-v2.jpg');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/jpeg');
  expect((await response.body()).byteLength).toBeLessThan(300_000);
});

for (const viewport of [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 760, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1586, height: 992 },
]) {
  test(`layout fits at ${viewport.width}px with loaded fonts and artwork`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => {
      const selectors = [
        '.about-page',
        '.about-shell',
        '.character-sheet',
        '.sheet-grid',
        '.identity-panel',
        '.about-heading-row',
      ];
      return selectors.filter((selector) => {
        const element = document.querySelector<HTMLElement>(selector)!;
        const rect = element.getBoundingClientRect();
        return (
          element.scrollWidth > element.clientWidth + 2 ||
          rect.right > innerWidth + 1 ||
          rect.left < 0
        );
      });
    });
    expect(overflow).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () =>
          document.fonts.check('700 30px "Pixelify Sans"') &&
          document.fonts.check('400 28px "VT323"'),
      ),
    ).toBe(true);
    const image = await page.request.get('images/village.webp');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/webp');
    expect(failures).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`home-${viewport.width}.png`),
      fullPage: true,
    });
  });
}

for (const width of [390, 1586]) {
  test(`Home character sheet passes automated accessibility checks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const home = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(home.violations).toEqual([]);
    await page.getByRole('link', { name: 'About', exact: true }).click();
    const about = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(about.violations).toEqual([]);
  });
}

test('design system renders live tokens and shared components', async ({ page }) => {
  await page.goto('./system/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1, name: 'Design System' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue quest' })).toBeVisible();
  await expect(page.locator('[data-token="--parchment"] [data-token-value]')).toHaveText('#ecd59c');
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }),
  ).toHaveAttribute('href', basePath);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
