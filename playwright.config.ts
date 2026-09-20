import { defineConfig } from '@playwright/test';
import process from 'node:process';

const basePath = `${(process.env.BASE_PATH || '/').replace(/\/+$/, '')}/`;
const baseURL = `http://127.0.0.1:4322${basePath}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1586, height: 992 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4322 --ignore-lock',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
