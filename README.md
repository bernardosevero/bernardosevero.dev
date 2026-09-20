# ⚔️ Bernardo Severo's Personal Website  

> A portfolio disguised as a cozy RPG menu. No dragons were harmed; several CSS gradients were.

This is the source of [Bernardo Severo's portfolio](https://bernardosevero.dev/): a small, static Astro site where recruiters and curious humans can explore projects, writing, experience, tools, and books without fighting a cookie banner boss.

## 🗺️ What lives here?

- 🛡️ **Character Sheet** — about me page with experience, specialties, and tools.
- 📜 **Quest Log** — projects and the decisions behind them.
- ✍️ **Journal** — random texts, engineering notes, and lessons learned.
- 📚 **Reading Codex** — books, ratings, and optional reviews.
- 🎨 **Design System** — the live tokens and components at [`/system/`](https://bernardosevero.dev/system/).

## 🧪 Start the local quest

You need Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:4321/`. Astro will reload the page while you edit.

Useful spells:

```sh
npm run check              # Type-check Astro and TypeScript
npm run build              # Forge the static production build
npm run preview            # Preview the build locally
npm test                   # Run browser, layout, and accessibility checks
```

The first browser-test run may need `npx playwright install chromium`.

## 🧰 The tech stack

- [Astro](https://astro.build/) for static pages and content collections.
- TypeScript for schemas and behavior that should not be mysterious.
- Vanilla CSS for tokens, shared primitives, and route composition.
- Markdown/MDX for posts and projects; Markdown for books and page copy.
- [Playwright](https://playwright.dev/) + [axe-core](https://github.com/dequelabs/axe-core) for behavior, overflow, and automated accessibility checks.

## ✍️ Add content, not components

Content lives under `src/content/` and is validated by `src/content.config.ts`.

Create a safe project draft:

```sh
npm run content:add-project -- --slug reliable-ai-agents --title "Reliable AI Agents"
```

Import normalized book data produced from Notion:

```sh
npm run content:import-books -- --input [path]\books.json
```

The personal agent skills `$add-project` and `$sync-notion-books` automate those workflows. See [the content handbook](docs/content.md) and [skills guide](docs/skills.md) before publishing.

## 🏰 Map of the codebase

```text
src/
├── components/      Reusable RPG interface primitives
├── content/         Markdown and MDX source material
├── layouts/         Shared document shell
├── pages/           Astro routes
└── styles/          Tokens, foundations, and route composition
```

Start with [AGENTS.md](AGENTS.md) for the project's rules and [architecture.md](docs/architecture.md) for the guided tour. The original visual references stay in `docs/design/references/` until every page passes the retirement gate in `AGENTS.md`.

## 🚀 Deployment

Pushes to `main` run type checking, production builds, and browser tests before deploying the verified output to Cloudflare Pages. The production target is [bernardosevero.dev](https://bernardosevero.dev/).

Follow [the deployment guide](docs/deployment.md) to create the Pages project, configure GitHub secrets, and connect the domain. The default build uses `/`; `SITE_URL` and `BASE_PATH` retain compatibility with the former GitHub Pages location.

## 🧭 Project status

- ✅ Real Astro/CSS Home screen
- ✅ Responsive and keyboard-aware menu dialogs
- ✅ Typed content foundations
- ✅ Live design-system route
- 🛠️ Posts, About, Projects, and Reading screens
- 🐉 Final content, SEO pass, and custom domain: future quests

Made with parchment, pixels, and a healthy suspicion of unnecessary JavaScript. 🌿
