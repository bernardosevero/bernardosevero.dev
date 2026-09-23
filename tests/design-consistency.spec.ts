import { test, expect, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cvAsset } from '../src/config/cv';

// Computed styles catch route-local overrides even when component classes match.
async function navigationAppearance(locator: Locator) {
  return locator.evaluate((element) => {
    const properties = ['backgroundImage', 'backgroundColor', 'borderWidth', 'padding', 'fontFamily', 'fontSize', 'lineHeight', 'boxShadow'] as const;
    return [element, element.querySelector('.frame-surface')!, ...element.querySelectorAll('.site-navigation__link')].map((node) => {
      const style = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      // Empty frame wrappers inherit surrounding copy color; only links render text.
      return { width: bounds.width, height: bounds.height, color: node.matches('.site-navigation__link') ? style.color : undefined, ...Object.fromEntries(properties.map((key) => [key, style[key]])) };
    });
  });
}

for (const width of [320, 390, 760, 1024, 1586]) {
  test(`page chrome is consistent and specimens fit at ${width}px`, async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let baseline: unknown;
    let projectNavigation: Awaited<ReturnType<typeof navigationAppearance>> | undefined;
    for (const route of ['', 'about/', 'projects/', 'posts/', 'posts/building-my-portfolio-with-a-design-system-and-llms/', 'reading/', 'projects/unified-troubleshooting-platform/', 'reading/fiodor-dostoievski-noites-brancas/']) {
      await page.goto(`./${route}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(1);
      const menu = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(menu.getByRole('link')).toHaveCount(5);
      await expect(menu.locator('button')).toHaveCount(0);
      await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(page.getByRole('link', { name: /Return to the Personal Log/ })).toHaveCount(0);
      for (const link of await menu.getByRole('link').all()) {
        const basePath = new URL(baseURL!).pathname;
        await expect(link).toHaveAttribute('href', new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
      }
      await menu.locator('a').last().evaluate((element) => (element as HTMLElement).blur());
      await page.mouse.move(0, 0);
      const geometry = await page.evaluate(() => {
        const navigation = document.querySelector('.base-navigation')!;
        const frame = document.querySelector('.portfolio-shell > .wood-frame, .portfolio-shell .codex-frame')!;
        const bounds = navigation.getBoundingClientRect();
        const content = frame.getBoundingClientRect();
        const background = getComputedStyle(document.querySelector('.portfolio-page')!, '::before');
        const vignette = getComputedStyle(document.querySelector('.portfolio-page')!, '::after');
        const timber = getComputedStyle(frame);
        const surface = getComputedStyle(frame.querySelector('.codex-parchment') ?? frame.querySelector('.frame-surface')!);
        const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-section-gap'));
        if (Math.abs(content.top - bounds.bottom - gap) > 1) throw new Error('Navigation must sit above content with the shared gap');
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, contentX: content.x, contentY: content.y, contentWidth: content.width, background: background.backgroundImage, backgroundOpacity: background.opacity, vignette: vignette.backgroundImage, vignetteOpacity: vignette.opacity, timber: [timber.padding, timber.borderWidth, timber.backgroundImage], parchment: [surface.backgroundImage, surface.backgroundColor, surface.opacity] };
      });
      if (baseline) expect(geometry).toEqual(baseline);
      else baseline = geometry;
      if (route === 'projects/') projectNavigation = await navigationAppearance(page.locator('.site-navigation'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll('/', '-') || 'home'}-${width}.png`), fullPage: true });
    }
    await page.goto('./system/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.locator('.portfolio-page').evaluate((element) => getComputedStyle(element, '::before').backgroundImage)).toContain('village.webp');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')).toHaveCount(5);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('reading-codex')).toHaveCount(0);
    await expect(page.locator('.navigation-specimen a, .navigation-specimen button')).toHaveCount(0);
    await expect(page.locator('.navigation-specimen [aria-current="page"]')).toHaveCount(1);
    const specimenNavigation = await navigationAppearance(page.locator('.navigation-specimen .site-navigation'));
    expect(projectNavigation).toBeDefined();
    expect(specimenNavigation.map(({ width, height, ...styles }) => styles)).toEqual(projectNavigation!.map(({ width, height, ...styles }) => styles));
    await expect(page.getByRole('link', { name: /Return to the Personal Log/ })).toHaveCount(0);
    await expect(page.locator('.book-tile-specimens .codex-tile')).toHaveCount(2);
    const cvSpecimen = page.locator('.component-grid > article').filter({ has: page.getByRole('heading', { name: 'CTA icons', exact: true }) });
    await expect(cvSpecimen.locator('.pixel-icon')).toHaveCount(3);
    await expect(cvSpecimen.getByRole('link', { name: 'LinkedIn (opens in a new tab)' })).toHaveAttribute('href', 'https://www.linkedin.com/in/bernardosevero/');
    await expect(cvSpecimen.getByRole('link', { name: 'GitHub (opens in a new tab)' })).toHaveAttribute('href', 'https://github.com/bernardosevero');
    await expect(cvSpecimen.getByRole('link', { name: 'Download CV (PDF)' })).toHaveCount(cvAsset ? 1 : 0);
    await expect(page.locator('.book-tile-specimens .codex-tile[aria-current="true"]')).toHaveCount(1);
    const specimenProblems = await page.locator('.component-grid > article').evaluateAll((specimens) => specimens.flatMap((specimen, index) => {
      const box = specimen.getBoundingClientRect();
      const children = [...specimen.children].map((child) => child.getBoundingClientRect());
      const outside = children.some((child) => child.left < box.left - 1 || child.right > box.right + 1 || child.top < box.top - 1 || child.bottom > box.bottom + 1);
      const overlap = children.some((child, i) => i > 0 && child.top < children[i - 1].bottom - 1);
      return outside || overlap || specimen.scrollWidth > specimen.clientWidth + 1 ? [index] : [];
    }));
    expect(specimenProblems, 'Specimens must contain examples without overlapping labels or descriptions').toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`system-${width}.png`), fullPage: true });
  });
}
