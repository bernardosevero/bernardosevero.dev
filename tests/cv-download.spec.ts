import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cvAsset, type CvAsset } from '../src/config/cv';
import { validateCvAsset } from '../src/utils/validate-cv';

const asset: CvAsset = {
  path: 'documents/bernardo-severo-cv.pdf',
  downloadName: 'bernardo-severo-cv.pdf',
};
const run = promisify(execFile);

// A blank PDF created only inside isolated test output, never in public/.
function pdfFixture(): Buffer {
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] >>',
  ];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const start = Buffer.byteLength(pdf);
  pdf += 'xref\n0 4\n0000000000 65535 f \n';
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  pdf += `trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(pdf);
}

test('CV validation accepts absence and rejects missing or invalid configured PDFs', async ({}, testInfo) => {
  const directory = testInfo.outputPath('public');
  await mkdir(join(directory, 'documents'), { recursive: true });
  const publicDir = pathToFileURL(`${directory}/`);
  expect(() => validateCvAsset(null, publicDir)).not.toThrow();
  expect(() => validateCvAsset(asset, publicDir)).toThrow('Configured CV asset is missing');
  await writeFile(join(directory, asset.path), '<html>Not a PDF</html>');
  expect(() => validateCvAsset(asset, publicDir)).toThrow('must be a PDF');
  await writeFile(join(directory, asset.path), pdfFixture());
  expect(() => validateCvAsset(asset, publicDir)).not.toThrow();
});

test('production CV availability matches explicit configuration without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    for (const route of ['./', './about/', './system/']) {
      await page.goto(route);
      const link = page.getByRole('link', { name: 'Download CV (PDF)', exact: true });
      await expect(link).toHaveCount(cvAsset ? 1 : 0);
      if (cvAsset) {
        const response = await context.request.get((await link.getAttribute('href')) || '');
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toContain('application/pdf');
        const suppliedPdf = await readFile(join('public', cvAsset.path));
        expect(await response.body()).toEqual(suppliedPdf);
        const downloadEvent = page.waitForEvent('download');
        await link.focus();
        await page.keyboard.press('Enter');
        const download = await downloadEvent;
        expect(download.suggestedFilename()).toBe(cvAsset.downloadName);
        expect(await readFile((await download.path())!)).toEqual(suppliedPdf);
      }
    }
  } finally {
    await context.close();
  }
});

for (const base of ['/', '/bernardosevero.dev/']) {
  test(`enabled CV works in an isolated build at ${base}`, async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    const root = testInfo.outputPath('site');
    await mkdir(root, { recursive: true });
    for (const entry of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
      await cp(resolve(entry), join(root, entry), {
        recursive: true,
        filter: (source) => source !== resolve('public', asset.path),
      });
    }
    await symlink(resolve('node_modules'), join(root, 'node_modules'), 'junction');
    const configFile = join(root, 'src/config/cv.ts');
    await writeFile(configFile, 'export const cvAsset = null;\n');
    const build = () =>
      run(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
        cwd: root,
        env: { ...process.env, BASE_PATH: base, PUBLIC_POSTHOG_KEY: '' },
        maxBuffer: 4 * 1024 * 1024,
      });
    await build();
    for (const route of ['index.html', 'about/index.html', 'system/index.html']) {
      const html = await readFile(join(root, 'dist', route), 'utf8');
      expect(html).not.toContain('aria-label="Download CV (PDF)"');
      expect(html).not.toContain(`download="${asset.downloadName}"`);
    }
    // Prove the real build gate rejects an enabled action with no file.
    await writeFile(configFile, `export const cvAsset = ${JSON.stringify(asset)};\n`);
    await expect(build()).rejects.toThrow(/Configured CV asset is missing/);
    await mkdir(join(root, 'public/documents'), { recursive: true });
    const pdf = pdfFixture();
    await writeFile(join(root, 'public', asset.path), pdf);
    await build();

    const server = createServer(async (request, response) => {
      try {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (!pathname.startsWith(base)) {
          response.writeHead(404).end();
          return;
        }
        let relative = decodeURIComponent(pathname.slice(base.length));
        if (!relative || relative.endsWith('/')) relative += 'index.html';
        const file = join(root, 'dist', relative);
        const types: Record<string, string> = {
          pdf: 'application/pdf',
          html: 'text/html',
          css: 'text/css',
          js: 'text/javascript',
          woff2: 'font/woff2',
          webp: 'image/webp',
          png: 'image/png',
        };
        response.setHeader(
          'Content-Type',
          types[file.split('.').pop() || ''] || 'application/octet-stream',
        );
        response.end(await readFile(file));
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not start');
    const origin = `http://127.0.0.1:${address.port}`;
    try {
      for (const javaScriptEnabled of [true, false]) {
        const context = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce' });
        try {
          const page = await context.newPage();
          const failures: string[] = [];
          page.on('pageerror', (error) => failures.push(error.message));
          page.on('response', (response) => {
            if (response.status() >= 400) failures.push(response.url());
          });
          for (const route of ['', 'about/', 'system/']) {
            await page.goto(`${origin}${base}${route}`);
            const link = page.getByRole('link', { name: 'Download CV (PDF)', exact: true });
            await expect(link).toHaveCount(1);
            await expect(link).toHaveAttribute('href', `${base}${asset.path}`);
            await expect(link).toHaveAttribute('download', asset.downloadName);
            await expect(link).toHaveAttribute('title', 'Download CV (PDF)');
            await expect(link).not.toHaveAttribute('target');
            await expect(link.locator('svg')).toHaveAttribute('aria-hidden', 'true');
            await expect(link.locator('svg')).toHaveAttribute('focusable', 'false');
            if (route !== 'system/') {
              const contact = page.getByRole('navigation', {
                name: 'Professional profiles and CV',
              });
              await expect(contact.getByRole('link')).toHaveCount(3);
              const linkedIn = contact.getByRole('link').nth(0);
              const github = contact.getByRole('link').nth(1);
              await expect(linkedIn).toHaveAttribute(
                'href',
                'https://www.linkedin.com/in/bernardosevero/',
              );
              await expect(github).toHaveAttribute('href', 'https://github.com/bernardosevero');
              for (const profile of [linkedIn, github]) {
                await expect(profile).toHaveAttribute('target', '_blank');
                await expect(profile).toHaveAttribute('rel', 'noreferrer');
              }
              await github.focus();
              await page.keyboard.press('Tab');
            } else await link.focus();
            await expect(link).toBeFocused();
            expect(
              await link.evaluate((element) => getComputedStyle(element).outlineStyle),
            ).not.toBe('none');
            const downloadEvent = page.waitForEvent('download');
            await page.keyboard.press('Enter');
            const download = await downloadEvent;
            expect(download.suggestedFilename()).toBe(asset.downloadName);
            expect(await readFile((await download.path())!)).toEqual(pdf);
            const response = await context.request.get(`${origin}${base}${asset.path}`);
            expect(response.ok()).toBe(true);
            expect(response.headers()['content-type']).toContain('application/pdf');
            expect(await response.body()).toEqual(pdf);

            if (javaScriptEnabled) {
              for (const width of [320, 375, 390, 760, 1024, 1586]) {
                await page.setViewportSize({ width, height: 992 });
                await page.evaluate(() => document.fonts.ready);
                await link.focus();
                expect(
                  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                if (route !== 'system/') {
                  const heading = (await page
                    .getByRole('heading', { name: 'About me', exact: true })
                    .boundingBox())!;
                  for (const action of await page.locator('#contact a').all()) {
                    const box = (await action.boundingBox())!;
                    expect(box.width).toBeGreaterThanOrEqual(40);
                    expect(box.height).toBeGreaterThanOrEqual(40);
                    expect(
                      box.x >= heading.x + heading.width || box.y >= heading.y + heading.height,
                    ).toBe(true);
                  }
                }
                if ([320, 375, 1586].includes(width)) {
                  const specimen =
                    route === 'system/'
                      ? page.locator('article').filter({ has: link })
                      : page.locator('.about-heading-row');
                  await specimen.screenshot({
                    path: testInfo.outputPath(`${route.replace('/', '') || 'home'}-${width}.png`),
                  });
                }
              }
              expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
            }
          }
          expect(failures).toEqual([]);
        } finally {
          await context.close();
        }
      }
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
}
