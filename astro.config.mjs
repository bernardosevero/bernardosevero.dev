import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { cvAsset } from './src/config/cv';
import { validateCvAsset } from './src/utils/validate-cv';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), [
  'SITE_URL',
  'BASE_PATH',
]);

export default defineConfig({
  site: env.SITE_URL || 'https://bernardosevero.dev',
  base: env.BASE_PATH || '/',
  output: 'static',
  integrations: [
    {
      name: 'validate-cv-asset',
      hooks: {
        'astro:config:done': ({ config }) => validateCvAsset(cvAsset, config.publicDir),
      },
    },
  ],
  devToolbar: { enabled: false },
});
