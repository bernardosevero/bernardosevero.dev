import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { advertiseMcpServer, mcpServer } from '../src/config/mcp';

const specimenEndpoint = 'https://mcp.example.dev/mcp';

test('the System specimen shows the server URL and a complete Claude Code command', async ({
  page,
}) => {
  await page.goto('./system/');
  const block = page.locator('.mcp-connect');

  await expect(block).toHaveCount(1);
  await expect(
    block.getByRole('heading', { level: 3, name: 'Ask your AI about me' }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ask your AI about me' })).toBeVisible();

  const values = await block.locator('code').allTextContents();
  expect(values).toEqual([
    specimenEndpoint,
    `claude mcp add --transport http example ${specimenEndpoint}`,
  ]);
  // The specimen must never advertise the real server while it may be offline.
  expect(await block.textContent()).not.toContain(mcpServer.endpoint);
});

test('the connect block has no accessibility violations', async ({ page }) => {
  await page.goto('./system/');
  const results = await new AxeBuilder({ page }).include('.mcp-connect').analyze();
  expect(results.violations).toEqual([]);
});

for (const width of [320, 390, 1586]) {
  test(`long values wrap inside the connect block at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./system/');
    const block = page.locator('.mcp-connect');
    await block.scrollIntoViewIfNeeded();

    const overflow = await block.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const escaping = [...element.querySelectorAll('code')].filter((code) => {
        const rect = code.getBoundingClientRect();
        return rect.left < box.left - 1 || rect.right > box.right + 1;
      });
      return { scrolls: element.scrollWidth > element.clientWidth + 1, escaping: escaping.length };
    });

    expect(overflow).toEqual({ scrolls: false, escaping: 0 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

test('the connect block is left out of print', async ({ page }) => {
  await page.goto('./system/');
  await expect(page.locator('.mcp-connect')).toBeVisible();

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.mcp-connect')).toBeHidden();
});

test('the CV page advertises the server only while the switch is on', async ({ page }) => {
  await page.goto('./about/');
  const block = page.locator('.mcp-connect');

  if (!advertiseMcpServer) {
    await expect(block).toHaveCount(0);
    expect(await page.content()).not.toContain(new URL(mcpServer.endpoint).host);
    return;
  }

  await expect(
    block.getByRole('heading', { level: 2, name: 'Ask your AI about me' }),
  ).toBeVisible();
  await expect(block.locator('code').first()).toHaveText(mcpServer.endpoint);
  await expect(block.locator('code').nth(1)).toHaveText(
    `claude mcp add --transport http ${mcpServer.name} ${mcpServer.endpoint}`,
  );
  const results = await new AxeBuilder({ page }).include('.mcp-connect').analyze();
  expect(results.violations).toEqual([]);

  await page.emulateMedia({ media: 'print' });
  await expect(block).toBeHidden();
});

test('the advertised server matches the Worker and its documented address', () => {
  expect(mcpServer).toEqual({
    name: 'bernardosevero',
    endpoint: 'https://mcp.bernardosevero.dev/mcp',
  });
});
