# Cloudflare Pages deployment

The production target is `https://bernardosevero.dev`, served as a static Astro build from `dist/`. No Cloudflare adapter or server runtime is required.

## One-time setup

The `bernardosevero-dev` Pages project was created and its first production build uploaded on 2026-09-20. The site is available at `https://bernardosevero-dev.pages.dev`. The custom domain `bernardosevero.dev` was added through Pages with an apex CNAME pointing to that hostname; Cloudflare initially reported it as initializing. The existing Worker with the same name is a separate resource and was left unchanged. Project creation instructions below are retained for recovery; do not create a duplicate.

The first deployment was a manual upload of the locally verified build. Automatic updates still require the GitHub secrets below and committing/pushing the prepared workflow changes.

Live checks confirmed HTTP 200 for Home, Projects, Posts, Reading, and the main images on the Pages hostname. Public DNS resolves the custom domain, and HTTPS returned HTTP 200 using that public address with normal certificate validation. The local resolver still had a cached missing-domain response immediately after setup, so some visitors may need to wait for DNS caches to expire.

1. Open Cloudflare **Workers & Pages**, create a **Pages** project using **Direct Upload**, and name it `bernardosevero-dev`. Use `main` as its production branch. If the dashboard requires an initial upload, upload the verified `dist/` folder after running the checks below. Alternatively, create the empty project with `npx wrangler@4 pages project create bernardosevero-dev --production-branch=main` after `npx wrangler@4 login`.
2. Create a Cloudflare API token with **Account > Cloudflare Pages > Edit**, restricted to the account containing the domain. This token does not need DNS-edit permissions.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions** and add these repository secrets:
   - `CLOUDFLARE_ACCOUNT_ID`: the account ID from the Cloudflare dashboard.
   - `CLOUDFLARE_API_TOKEN`: the token from step 2. Never put it in source files or chat.
4. Commit and push the deployment changes to `main`. The **Deploy to Cloudflare Pages** workflow checks types and runs the browser suite against both the root deployment and the legacy GitHub Pages base path. Playwright runs the production build before each suite. Only the verified root build is uploaded, and deployment waits for both test jobs to pass. Pull requests and manual runs on other branches cannot publish production.
5. After the first successful deployment, open the Pages project, select **Custom domains > Set up a custom domain**, and enter `bernardosevero.dev`. Let Cloudflare configure the required DNS record and wait for the domain and certificate to become active. Add the domain through Pages; creating a DNS record alone is insufficient.
6. Verify HTTPS, navigation, images, and a direct visit to `/reading/`. Optionally add `www.bernardosevero.dev` and a redirect to the apex domain afterward.

The domain must be an active zone in the same Cloudflare account. It was confirmed active during setup on 2026-09-20. If existing website records conflict, review them before replacing them; preserve email-related records.

This setup uses GitHub Actions with Direct Upload so deployment depends on browser tests. Do not also enable automatic Cloudflare Git builds. Direct Upload projects cannot later switch to Git integration without creating a new project.

## Local verification

Use Node.js 24:

```sh
npm ci
npx playwright install chromium
npm run check
npm run build
npm test
```

Defaults use the custom domain and `/` base.

Copy `.env.example` to `.env` when setting up a new checkout. Astro loads `SITE_URL` and `BASE_PATH` from this file; shell and CI values take precedence. The Cloudflare account ID and API token are deployment-only values, never public browser variables. The local `.env` is ignored by Git and does not configure GitHub Actions secrets automatically.

To verify compatibility with the former GitHub Pages location in PowerShell:

```powershell
$env:SITE_URL = 'https://bernardosevero.github.io'
$env:BASE_PATH = '/bernardosevero.dev'
npm test
Remove-Item Env:SITE_URL
Remove-Item Env:BASE_PATH
npm run build
```

Always rebuild with the root defaults before manually uploading `dist/` to Cloudflare. Upload the generated `dist/` contents, not the repository.

The workflow replaces GitHub Pages publishing. The previous GitHub Pages deployment is not automatically removed or redirected.

## Official references

- [Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Astro on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
