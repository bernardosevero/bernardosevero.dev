# Bernardo Severo — Personal Portfolio

Bernardo Severo's personal portfolio, built with **Astro and TypeScript**. Its visual direction is a cozy medieval RPG in pixel art, inspired by a game's pause menu, with sections for projects, writing, experience, and reading.

Live site: [bernardosevero.github.io/bernardosevero.dev](https://bernardosevero.github.io/bernardosevero.dev/)

## Development

Use Node.js 24 (specified in `.nvmrc`) and npm.

```sh
npm ci
npm run dev
```

The development server runs at `http://localhost:4321`. To check and build the site:

```sh
npm run check
npm run build
npm run preview
```

## Design references

The five approved mockups are stored in [docs/design/references](docs/design/references/README.md). Read [AGENTS.md](AGENTS.md) before making changes.

## Current scope: Home

The Home / Personal Log screen is implemented with real Astro components and CSS: wood frames, parchment panels, pixel-style ornaments, green menu buttons, and selectable profile text. Only the decorative village scenery is a bitmap. It does not contain the original mockup's interface.

The four menu buttons open accessible status dialogs. Posts, About, Projects, and Reading are **not implemented as separate pages yet**. Use Tab or the up/down arrow keys to select a button, Enter to open its dialog, and Escape to return.

- Profile content: `src/data/portfolio.ts`
- Colors and typography: `src/styles/tokens.css`
- Shared frames, buttons, and ornaments: `src/styles/global.css`
- Home layout and responsive rules: `src/styles/home.css`
- Asset provenance and implementation choices: [Home implementation](docs/implementation/home.md)

All code, comments, documentation, and default interface copy are in English.

## Browser tests

```sh
npx playwright install chromium
npm test
```

The tests build the site, start a temporary preview on port 4322, and check menu interactions, keyboard focus, missing assets, accessibility, and overflow at six viewport widths. Screenshots are saved in the ignored `test-results/` directory. This port must be free before running the tests.

## Deployment

The site deploys automatically to GitHub Pages whenever a commit reaches `main`. The workflow in `.github/workflows/deploy.yml` uses Astro's official GitHub Action and publishes the static `dist/` output at `https://bernardosevero.github.io/bernardosevero.dev/`.
