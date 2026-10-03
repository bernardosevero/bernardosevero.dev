import { test, expect } from '@playwright/test';
import process from 'node:process';
import AxeBuilder from '@axe-core/playwright';

const basePath = `${(process.env.BASE_PATH || '/').replace(/\/+$/, '')}/`;
const siteURL = process.env.SITE_URL || 'https://bernardosevero.dev';

const greeting = "Welcome, traveler! I'm Bernardo.";
const intro =
  'A product engineer from Brazil. I build useful products where AI, the web and real people meet.';
const prompt = 'Where would you like to go?';
const choices = [
  ['See my quests', 'projects/', 'Projects'],
  ['Read the blog', 'posts/', 'Blog'],
  ['Browse the library', 'reading/', 'Books'],
  ['Open my character sheet', 'about/', 'About'],
] as const;

test('Home greets with the dialogue and four base-aware choices', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page).toHaveTitle('Bernardo Severo — Product Engineer');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(greeting);
  await expect(page.getByText(intro, { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /Bernardo wearing round glasses/ })).toBeVisible();
  const menu = page.getByRole('navigation', { name: prompt });
  await expect(menu.getByRole('link')).toHaveCount(choices.length);
  for (const [index, [label, path, pageName]] of choices.entries()) {
    const link = menu.getByRole('link').nth(index);
    await expect(link).toContainText(label);
    await expect(link).toContainText(pageName);
    await expect(link).toHaveAttribute('href', `${basePath}${path}`);
  }
});

test('the Home tile marks Home current, and About is current only on its page', async ({
  page,
}) => {
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main navigation' });
  const home = menu.getByRole('link', { name: 'Home', exact: true });
  await expect(home).toHaveAttribute('href', basePath);
  await expect(home).toHaveAttribute('aria-current', 'page');
  await expect(menu.locator('.site-navigation__link[aria-current]')).toHaveCount(0);
  await home.focus();
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link', { name: 'About', exact: true })).toBeFocused();

  await page.goto('./about/');
  await expect(home).not.toHaveAttribute('aria-current', 'page');
  await expect(menu.getByRole('link', { name: 'About', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('every menu item reaches its implemented route', async ({ page }) => {
  await page.goto('./');
  for (const [name, path] of [
    ['About', 'about/'],
    ['Blog', 'posts/'],
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

test('the typewriter hides choices until Skip completes the full text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  const dialogue = page.locator('[data-home-dialogue]');
  const choiceLinks = page.getByRole('navigation', { name: prompt }).getByRole('link');
  const skip = dialogue.getByRole('button', { name: /Skip/ });
  await expect(skip).toBeVisible();
  await expect(choiceLinks.first()).toBeHidden();
  await expect(dialogue.locator('[aria-hidden="true"].home-dialogue__typed')).toHaveCount(3);
  // Assistive technology reads the complete sentence once while the aria-hidden copy types.
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(greeting);

  await skip.focus();
  await page.keyboard.press('Enter');
  await expect(skip).toHaveCount(0);
  await expect(choiceLinks).toHaveCount(choices.length);
  for (const link of await choiceLinks.all()) await expect(link).toBeVisible();
  await expect(choiceLinks.first()).toBeFocused();
  await expect(dialogue.locator('.home-dialogue__typed')).toHaveCount(0);
  await expect(page.getByText(intro, { exact: true })).toBeVisible();
});

test('a click inside the dialogue completes the typing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await page.locator('.home-dialogue__parchment').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('[data-home-dialogue]').getByRole('button')).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: prompt }).getByRole('link').first(),
  ).toBeVisible();
});

test('reduced motion and no JavaScript show the full dialogue without Skip', async ({
  browser,
  baseURL,
}) => {
  for (const options of [
    { reducedMotion: 'reduce' as const, javaScriptEnabled: true },
    { reducedMotion: 'no-preference' as const, javaScriptEnabled: false },
  ]) {
    const context = await browser.newContext({ ...options, baseURL });
    try {
      const page = await context.newPage();
      await page.goto('./');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(greeting);
      await expect(page.getByText(intro, { exact: true })).toBeVisible();
      const links = page.getByRole('navigation', { name: prompt }).getByRole('link');
      for (const link of await links.all()) await expect(link).toBeVisible();
      await expect(page.getByRole('button', { name: /Skip/ })).toHaveCount(0);
      if (options.reducedMotion === 'reduce') {
        await expect(page.locator('.home-scene')).toBeHidden();
      }
    } finally {
      await context.close();
    }
  }
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`the first screen fills the viewport and fits the dialogue at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const screen = await page.locator('.home-first-screen').boundingBox();
    if (!screen) throw new Error('The Home first screen must render.');
    expect(Math.abs(screen.y + screen.height - viewport.height)).toBeLessThanOrEqual(2);
    const dialogue = await page.locator('.home-dialogue').boundingBox();
    if (!dialogue) throw new Error('The Home dialogue must render.');
    expect(dialogue.y + dialogue.height).toBeLessThanOrEqual(viewport.height);
    for (const link of await page
      .getByRole('navigation', { name: prompt })
      .getByRole('link')
      .all()) {
      const box = await link.boundingBox();
      if (!box) throw new Error('Every choice must render.');
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}

test('doubled root text grows the first screen and scrolls instead of clipping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await page.evaluate(() => document.fonts.ready);
  const clipped = await page.locator('.home-dialogue').evaluate((dialogue) =>
    [dialogue, ...dialogue.querySelectorAll<HTMLElement>('*')]
      // The phone prompt line is visually hidden on purpose, like .sr-only.
      .filter((element) => !element.matches('.home-dialogue__prompt'))
      .filter(
        (element) =>
          getComputedStyle(element).overflow !== 'visible' &&
          (element.scrollHeight > element.clientHeight + 1 ||
            element.scrollWidth > element.clientWidth + 1),
      )
      .map((element) => element.className),
  );
  expect(clipped).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const last = await page
    .getByRole('navigation', { name: prompt })
    .getByRole('link')
    .last()
    .boundingBox();
  const dialogue = await page.locator('.home-dialogue').boundingBox();
  if (!last || !dialogue) throw new Error('The dialogue and its choices must render.');
  expect(last.y + last.height).toBeLessThanOrEqual(dialogue.y + dialogue.height);
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
    const overflow = await page.evaluate(() =>
      ['.home-shell', '.home-first-screen', '.home-dialogue', '.home-dialogue__parchment'].filter(
        (selector) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) return true;
          const rect = element.getBoundingClientRect();
          return (
            element.scrollWidth > element.clientWidth + 2 ||
            rect.right > innerWidth + 1 ||
            rect.left < 0
          );
        },
      ),
    );
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
  test(`Home and About pass automated accessibility checks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const home = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(home.violations).toEqual([]);
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'About', exact: true })
      .click();
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
  ).toHaveAttribute('href', `${basePath}about/`);
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }),
  ).toHaveAttribute('href', basePath);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
