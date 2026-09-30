import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const dsaPost =
  './posts/i-kept-forgetting-leetcode-problems-so-i-built-a-spaced-repetition-trainer/';

async function scrollToHeading(page: Page, id: string) {
  await page.evaluate((headingId) => {
    const heading = document.getElementById(headingId);
    if (!heading) throw new Error(`Missing heading #${headingId}`);
    window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY);
  }, id);
}

test('segments are sized by section length and follow the reading position', async ({ page }) => {
  await page.goto(dsaPost);
  const bar = page.locator('details.chapter-bar');
  const segments = bar.locator('[data-chapter-segment]');
  // The Contents list is inside the closed disclosure, so role queries would skip it.
  const links = bar.locator('[data-chapter-link]');
  await expect(segments).toHaveCount(6);
  await expect(bar.locator('[data-chapter-segments]')).toBeVisible();

  const words = await links.evaluateAll((elements) =>
    elements.map((element) => Number(element.getAttribute('data-words'))),
  );
  const widths = await segments.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );
  const titles = await links.allTextContents();
  const byWords = [...words.keys()].sort((a, b) => words[a] - words[b]);
  const byWidth = [...widths.keys()].sort((a, b) => widths[a] - widths[b]);
  expect(byWidth).toEqual(byWords);
  expect(titles[byWidth.at(-1) ?? -1]).toBe('Research basis');
  expect(titles[byWidth[0]]).toBe('Local-first, no account');

  await scrollToHeading(page, 'why-this-design');
  await expect(links.filter({ hasText: 'Why this design' })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(bar.locator('[data-chapter-position]')).toHaveText('· 2 of 6');
  await expect(bar.locator('[data-chapter-title]')).toHaveText('Why this design');
  expect(
    await segments.first().evaluate((element) => element.style.getPropertyValue('--progress')),
  ).toBe('1');
  await expect(segments.nth(1)).toHaveAttribute('data-current', '');

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(bar.locator('[data-chapter-remaining]')).toHaveText('100% · Finished');
});

test('Contents links jump below the strip, close the panel, and Escape restores focus', async ({
  page,
}) => {
  await page.goto(dsaPost);
  const bar = page.locator('details.chapter-bar');
  const summary = bar.locator('summary');
  await summary.click();
  await expect(bar).toHaveAttribute('open', '');
  await bar.getByRole('link', { name: 'Research basis' }).click();
  await expect(page).toHaveURL(/#research-basis$/);
  await expect(bar).not.toHaveAttribute('open', '');
  const heading = page.locator('#research-basis');
  await expect(heading).toBeInViewport();
  const stripBottom = await summary.evaluate((element) => element.getBoundingClientRect().bottom);
  const headingTop = await heading.evaluate((element) => element.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(stripBottom);

  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(bar).toHaveAttribute('open', '');
  await bar.getByRole('link', { name: 'How it works' }).focus();
  await page.keyboard.press('Escape');
  await expect(bar).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
});

test('without JavaScript the Contents disclosure opens and every link reaches its heading', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(dsaPost);
  const bar = page.locator('details.chapter-bar');
  await expect(bar.locator('[data-chapter-status]')).toBeHidden();
  await expect(bar.locator('[data-chapter-segments]')).toBeHidden();
  const summary = bar.locator('summary');
  await expect(summary).toHaveText(/Contents/);
  await summary.click();
  const links = bar.getByRole('navigation', { name: 'Contents' }).getByRole('link');
  await expect(links).toHaveCount(6);
  for (const href of await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('href') ?? ''),
  )) {
    if (!(await bar.evaluate((element: HTMLDetailsElement) => element.open))) await summary.click();
    await bar.locator(`a[href="${href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(`.prose ${href}`)).toBeInViewport();
  }
  await context.close();
});

test('the bar renders only for posts with at least two sections', async ({ page }) => {
  await page.goto('./posts/building-my-portfolio-with-a-design-system-and-llms/');
  await expect(page.locator('.chapter-bar [data-chapter-segment]')).toHaveCount(2);
  await page.goto('./reading/fyodor-dostoevsky-white-nights/');
  await expect(page.locator('.chapter-bar')).toHaveCount(0);
});

for (const width of [320, 390, 1586]) {
  test(`the chapter bar fits, clears the header, and passes axe open and closed at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dsaPost);
    await page.evaluate(() => document.fonts.ready);
    const bar = page.locator('details.chapter-bar');
    const barTop = await bar.evaluate((element) => element.getBoundingClientRect().top);
    const headerBottom = await page
      .locator('.article header')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    expect(barTop).toBeGreaterThanOrEqual(headerBottom);

    for (const open of [false, true]) {
      if (open) await bar.locator('summary').click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 320) continue;
      const accessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    }
  });
}
