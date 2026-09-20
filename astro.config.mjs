import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), ['SITE_URL', 'BASE_PATH']);

export default defineConfig({
  site: env.SITE_URL || 'https://bernardosevero.dev',
  base: env.BASE_PATH || '/',
  output: 'static',
  devToolbar: { enabled: false },
});
