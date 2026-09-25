import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cvAsset } from '../src/config/cv';

const routes = [
  { path: 'about/', heading: 'About' },
  { path: 'projects/', heading: 'Projects' },
  {
    path: 'projects/full-stack-courses-alura/',
    heading: 'Full-stack development courses for beginners',
  },
  { path: 'posts/', heading: 'Posts' },
  { path: 'reading/', heading: 'Reading' },
  { path: 'reading/fyodor-dostoevsky-white-nights/', heading: 'White Nights' },
];

for (const route of routes) {
  test(`${route.path} has a real page, no loading failures, and an accessible heading`, async ({
    page,
  }) => {
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    await page.goto(`./${route.path}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    const menu = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(menu.getByRole('link')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(failures).toEqual([]);
  });
}

test('authored names keep their casing while page titles remain decorative', async ({ page }) => {
  for (const [route, selector] of [
    ['about/', '.timeline h3'],
    ['projects/', '.project-card h2'],
    ['reading/', '.codex-detail:visible h2'],
  ]) {
    await page.goto(`./${route}`);
    const name = page.locator(selector).first();
    await expect(name).toBeVisible();
    expect(await name.evaluate((element) => getComputedStyle(element).textTransform)).toBe('none');
    expect(
      await page
        .locator('h1')
        .first()
        .evaluate((element) => getComputedStyle(element).textTransform),
    ).toBe('uppercase');
  }
  await page.goto('./about/');
  await expect(page.locator('.timeline h3').first()).toHaveText('SAP Concur');
});

test('About exposes the requested professional profile links', async ({ page }) => {
  await page.goto('./about/');
  await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/bernardosevero/',
  );
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/bernardosevero',
  );
  await expect(page.getByRole('heading', { name: 'Experience' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Specializations' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Working strengths' })).toBeVisible();
  await expect(page.locator('[data-professional-profile] .pixel-icon')).toHaveCount(2);
  await expect(page.locator('.social-link .pixel-icon')).toHaveCount(cvAsset ? 3 : 2);
});

for (const width of [320, 390, 1586]) {
  test(`About portrait and heading links fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.goto('./about/');
    await page.evaluate(() => document.fonts.ready);
    const portrait = page.getByRole('img', { name: /Bernardo wearing round glasses/ });
    await expect(portrait).toBeVisible();
    expect(
      await portrait.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    ).toBe(true);
    const heading = await page
      .getByRole('heading', { name: 'About me', exact: true })
      .boundingBox();
    for (const name of [/LinkedIn/, /GitHub/]) {
      const link = await page.getByRole('link', { name }).boundingBox();
      const sameRow = Math.abs(heading!.y + heading!.height / 2 - (link!.y + link!.height / 2)) < 2;
      expect(sameRow || (cvAsset !== null && link!.y >= heading!.y + heading!.height)).toBe(true);
    }
    await expect(page.getByText('Better tools. Kinder humans.')).toHaveCount(0);
    expect(
      await page.locator('.specialization-list').evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          display: style.display,
          marginTop: style.marginTop,
          columns: style.gridTemplateColumns.split(' ').length,
        };
      }),
    ).toEqual({ display: 'grid', marginTop: '12px', columns: width === 1586 ? 3 : 2 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('Reading selects a book and opens its review', async ({ page }) => {
  await page.goto('./reading/');
  await expect(page.getByRole('tab', { name: 'finished', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('article', { name: 'Clean Architecture' })).toBeVisible();
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: /White Nights/ }).click();
  await expect(page.getByRole('heading', { name: 'White Nights' })).toBeVisible();
  await page.getByRole('link', { name: 'Read review →' }).click();
  await expect(page).toHaveURL(/reading\/fyodor-dostoevsky-white-nights\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'White Nights' })).toBeVisible();
  await expect(page.getByText('Portuguese (Brazil)')).toContainText('🇧🇷');
  await expect(page.locator('.review-content')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByText('O livro apresenta um protagonista', { exact: false })).toBeVisible();
  await expect(page.locator('.review-content blockquote em')).toContainText(
    'Um minuto de inteiro de felicidade',
  );
});

test('mobile codex keeps navigation, bookshelf, and details separate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./reading/');
  await page.evaluate(() => document.fonts.ready);

  const navigation = await page.locator('.base-navigation').boundingBox();
  const menu = page.locator('.base-navigation .site-navigation');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Books', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
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

test('shelf tabs support keyboard selection, scrolling, and remembered books', async ({ page }) => {
  await page.goto('./reading/');
  await page.getByRole('link', { name: 'White Nights', exact: true }).click();
  await expect(
    page
      .getByRole('article', { name: 'White Nights' })
      .getByText('4.5 out of 5 stars', { exact: true }),
  ).toBeVisible();
  const finished = page.getByRole('tab', { name: 'finished', exact: true });
  await finished.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'reading' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'reading' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('article', { name: 'The Alienist' })).toBeVisible();
  await expect(page.locator('[data-announcement]')).toHaveText('reading: 1 book');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'wishlist' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'wishlist' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const wishlist = page.getByRole('tabpanel', { name: 'wishlist' });
  expect(await wishlist.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
    true,
  );
  await wishlist.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await wishlist.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: 'White Nights' })).toBeVisible();
});

test('codex fragment links open the linked shelf and book', async ({ page }) => {
  await page.goto('./reading/#reading-codex-book-machado-de-assis-the-alienist');
  await expect(page.getByRole('tab', { name: 'reading', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('article', { name: 'The Alienist' })).toBeVisible();
  await page.goto('./');
  await page.goto('./reading/#reading-codex-wishlist');
  await expect(page.getByRole('tab', { name: 'wishlist', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel', { name: 'wishlist' })).toBeVisible();
});

test('post topic filters announce correctly pluralized results', async ({ page }) => {
  await page.goto('./posts/');
  const status = page.locator('[data-filter-status]');
  const topic = page.getByRole('button', { name: 'AI', exact: true });
  await topic.click();
  await expect(topic).toHaveAttribute('aria-pressed', 'true');
  await expect(status).toHaveText('Showing 1 post tagged AI.');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(status).toHaveText('Showing 1 post across all topics.');
});

test('books and reviews remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('./reading/');
  await expect(page.locator('.codex-detail')).toHaveCount(30);
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
      expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`codex-${width}.png`), fullPage: true });
  });
}

test('Projects list uses repository cards without case-study actions', async ({ page }) => {
  await page.goto('./projects/');
  await expect(page.getByRole('link', { name: 'View case study' })).toHaveCount(0);
  await expect(page.locator('.project-list a[href*="/projects/"]')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Full-stack development courses for beginners' }),
  ).toBeVisible();
  await expect(
    page.getByText('Created and delivered a three-course full-stack learning path', {
      exact: false,
    }),
  ).toBeVisible();
  const aluraLinks = page.getByRole('list', {
    name: 'Full-stack development courses for beginners links',
  });
  await expect(aluraLinks.getByRole('link', { name: /View Alura formation/ })).toHaveAttribute(
    'href',
    'https://www.alura.com.br/formacao-full-stack-react-node-js',
  );
  await expect(aluraLinks.getByRole('link', { name: /Frontend repository/ })).toHaveAttribute(
    'href',
    'https://github.com/bernardosevero/alura-books-aulas',
  );
  await expect(aluraLinks.getByRole('link', { name: /API repository/ })).toHaveAttribute(
    'href',
    'https://github.com/bernardosevero/alura-books-server-aulas',
  );
});

test('case studies omit list sections that have no items', async ({ page }) => {
  await page.goto('./projects/full-stack-courses-alura/');
  await expect(page.getByRole('heading', { level: 2, name: 'Problem' })).toBeVisible();
  await expect(page.locator('.case-study ul:empty')).toHaveCount(0);
});

test('Project card specimens expose linked and read-only states', async ({ page }) => {
  await page.goto('./system/');
  await expect(page.getByRole('link', { name: /Source repository/ })).toHaveAttribute(
    'href',
    'https://github.com/bernardosevero/bernardosevero.dev',
  );
  await expect(page.getByRole('heading', { name: 'Repository unavailable' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Repository unavailable/ })).toHaveCount(0);
});

for (const width of [390, 1586]) {
  test(`portfolio pages fit and pass automated accessibility checks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of [
      'about/',
      'projects/',
      'projects/full-stack-courses-alura/',
      'posts/',
      'reading/',
      'reading/fyodor-dostoevsky-white-nights/',
    ]) {
      await page.goto(`./${path}`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const accessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    }
  });
}
