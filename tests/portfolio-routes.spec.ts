import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { path: 'about/', heading: 'About' },
  { path: 'projects/', heading: 'Projects' },
  { path: 'projects/unified-troubleshooting-platform/', heading: 'Unified troubleshooting platform' },
  { path: 'projects/event-driven-invoicing/', heading: 'Event-driven invoicing system' },
  { path: 'posts/', heading: 'Posts' },
  { path: 'reading/', heading: 'Reading' },
  { path: 'reading/fiodor-dostoievski-noites-brancas/', heading: 'White Nights' },
];

for (const route of routes) {
  test(`${route.path} has a real page, no loading failures, and an accessible heading`, async ({ page }) => {
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto(`./${route.path}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    const menu = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(menu.getByRole('link')).toHaveCount(4);
    if (route.path !== 'about/') {
      await expect(page.getByRole('link', { name: /Personal Log|Quest Log|Reading Codex/ })).toBeVisible();
    }
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

test('Reading selects a book and opens its review', async ({ page }) => {
  await page.goto('./reading/');
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toHaveCount(0);
  await page.getByRole('link', { name: /White Nights/ }).click();
  await expect(page.getByRole('heading', { name: 'White Nights' })).toBeVisible();
  await page.getByRole('link', { name: 'Read review →' }).click();
  await expect(page).toHaveURL(/reading\/fiodor-dostoievski-noites-brancas\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'White Nights' })).toBeVisible();
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toBeVisible();
});

test('mobile codex keeps navigation, bookshelf, and details separate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./reading/');
  await page.evaluate(() => document.fonts.ready);

  const navigation = await page.locator('.reading-navigation').boundingBox();
  const menu = page.locator('.reading-navigation .site-navigation--bar');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Books', exact: true })).toHaveAttribute('aria-current', 'page');
  const about = await menu.getByRole('link', { name: 'About', exact: true }).boundingBox();
  const projects = await menu.getByRole('link', { name: 'Projects', exact: true }).boundingBox();
  const posts = await menu.getByRole('link', { name: 'Posts', exact: true }).boundingBox();
  expect(about!.y).toBe(projects!.y);
  expect(posts!.y).toBeGreaterThan(about!.y + about!.height);
  const codex = await page.locator('reading-codex').boundingBox();
  expect(codex!.y - (navigation!.y + navigation!.height)).toBeGreaterThanOrEqual(12);
  const shelf = await page.locator('.codex-library').boundingBox();
  const details = await page.locator('.codex-details').boundingBox();
  expect(details!.y).toBeGreaterThan(shelf!.y + shelf!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('shelf tabs support keyboard selection, empty states, and remembered books', async ({ page }) => {
  await page.goto('./reading/');
  await page.getByRole('link', { name: 'White Nights', exact: true }).click();
  await expect(page.getByRole('article', { name: 'White Nights' }).getByText('4.5 out of 5 stars', { exact: true })).toBeVisible();
  const finished = page.getByRole('tab', { name: 'finished', exact: true });
  await finished.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'wishlist' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'wishlist' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'wishlist' }).getByText('No books on this shelf yet.', { exact: true })).toBeVisible();
  await expect(page.locator('.codex-detail:visible')).toHaveCount(0);
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: 'White Nights' })).toBeVisible();
});

test('books and reviews remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/bernardosevero.dev/reading/');
  await expect(page.locator('.codex-detail')).toHaveCount(3);
  await page.getByRole('link', { name: 'White Nights', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'White Nights' })).toBeVisible();
  await page.getByRole('link', { name: 'Read review →' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'White Nights' })).toBeVisible();
  await context.close();
});

for (const width of [320, 390, 760, 1586]) {
  test(`Reading Codex fits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./reading/');
    await page.evaluate(() => document.fonts.ready);
    for (const title of ['The Death of Ivan Ilyich', 'The Metamorphosis', 'White Nights']) {
      await page.getByRole('link', { name: title, exact: true }).click();
      const detail = page.getByRole('article', { name: title });
      expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`codex-${width}.png`), fullPage: true });
  });
}

test('Projects list uses repository cards without case-study actions', async ({ page }) => {
  await page.goto('./projects/');
  await expect(page.getByRole('link', { name: 'View case study' })).toHaveCount(0);
  await expect(page.locator('.project-list a[href*="/projects/"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Unified troubleshooting platform' })).toBeVisible();
  await expect(page.getByText('Consolidated fragmented troubleshooting tools', { exact: false })).toBeVisible();
  const aluraLinks = page.getByRole('list', { name: 'Full-stack courses for Alura links' });
  await expect(aluraLinks.getByRole('link', { name: /View Alura formation/ })).toHaveAttribute('href', 'https://www.alura.com.br/formacao-full-stack-react-node-js');
  await expect(aluraLinks.getByRole('link', { name: /Frontend repository/ })).toHaveAttribute('href', 'https://github.com/bernardosevero/alura-books-aulas');
  await expect(aluraLinks.getByRole('link', { name: /API repository/ })).toHaveAttribute('href', 'https://github.com/bernardosevero/alura-books-server-aulas');
});

test('Project card specimens expose linked and read-only states', async ({ page }) => {
  await page.goto('./system/');
  await expect(page.getByRole('link', { name: /Source repository/ })).toHaveAttribute('href', 'https://github.com/bernardosevero/bernardosevero.dev');
  await expect(page.getByRole('heading', { name: 'Repository unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Repository unavailable/ })).toHaveCount(0);
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
