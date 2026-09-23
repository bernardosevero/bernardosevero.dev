import { test, expect } from '@playwright/test';

for (const width of [320, 390, 760, 1024, 1586]) {
  test(`post images load and fit the article at ${width}px`, async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize({ width, height: 992 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./posts/building-my-portfolio-with-a-design-system-and-llms/');
    await page.evaluate(() => document.fonts.ready);
    const images = page.locator('.article-content img');
    await expect(images).toHaveCount(2);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      const geometry = await image.evaluate((node: HTMLImageElement) => {
        const bounds = node.getBoundingClientRect();
        const article = node.closest('.article-content')!.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, width: bounds.width, height: bounds.height, articleLeft: article.left, articleRight: article.right, ratio: node.naturalWidth / node.naturalHeight, src: node.currentSrc };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(geometry.articleLeft - 1);
      expect(geometry.right).toBeLessThanOrEqual(geometry.articleRight + 1);
      expect(Math.abs(geometry.height - geometry.width / geometry.ratio)).toBeLessThan(1);
      expect(new URL(geometry.src).pathname.startsWith(new URL(baseURL!).pathname)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await images.first().scrollIntoViewIfNeeded();
    await images.first().evaluate(async (node: HTMLImageElement) => {
      await node.decode();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await page.screenshot({ path: testInfo.outputPath(`post-images-${width}.png`) });
  });
}
