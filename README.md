# ⚔️ Bernardo Severo's Personal Log

> A portfolio disguised as a cozy RPG menu. No dragons were harmed; several CSS gradients were.

This is the source of [Bernardo Severo's portfolio](https://bernardosevero.github.io/bernardosevero.dev/): a small, static Astro site where recruiters and curious humans can explore projects, writing, experience, tools, and books without fighting a cookie banner boss.

## 🗺️ What lives here?

- 🏡 **Personal Log** — the RPG-style entrance to the portfolio.
- 📜 **Quest Log** — projects and the decisions behind them.
- ✍️ **Journal** — engineering notes and lessons learned.
- 🛡️ **Character Sheet** — experience, specialties, and tools.
- 📚 **Reading Codex** — books, ratings, and optional reviews.
- 🎨 **Design System** — the live tokens and components at [`/system/`](https://bernardosevero.github.io/bernardosevero.dev/system/).

Only Home and the design-system inventory are currently implemented. The other chapters announce their unfinished state honestly instead of pretending a locked door is a feature.

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

## 🧰 The intentionally boring stack

- [Astro](https://astro.build/) for static pages and content collections.
- TypeScript for schemas and behavior that should not be mysterious.
- Vanilla CSS for tokens, shared primitives, and route composition.
- Markdown/MDX for posts and projects; Markdown for books and page copy.
- Playwright + axe-core for behavior, overflow, and automated accessibility checks.

There is no Tailwind and no client framework. The site is small enough that explicit CSS is a superpower, not a punishment. The rationale and rules live in [the design-system guide](docs/design-system.md).

## ✍️ Add content, not components

Content lives under `src/content/` and is validated by `src/content.config.ts`.

Create a safe project draft:

```sh
npm run content:add-project -- --slug reliable-ai-agents --title "Reliable AI Agents"
```

Import normalized book data produced from Notion:

```sh
npm run content:import-books -- --input C:\path\to\books.json
```

The personal Codex skills `$add-project` and `$sync-notion-books` automate those workflows. See [the content handbook](docs/content.md) and [skills guide](docs/skills.md) before publishing.

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

Pushes to `main` trigger `.github/workflows/deploy.yml`. GitHub Pages publishes the static build at:

👉 [bernardosevero.github.io/bernardosevero.dev](https://bernardosevero.github.io/bernardosevero.dev/)

The repository name stays in the URL because no custom domain is configured yet. Internal asset and route paths must therefore respect Astro's `/bernardosevero.dev` base.

## 🧭 Project status

- ✅ Real Astro/CSS Home screen
- ✅ Responsive and keyboard-aware menu dialogs
- ✅ Typed content foundations
- ✅ Live design-system route
- 🛠️ Posts, About, Projects, and Reading screens
- 🐉 Final content, SEO pass, and custom domain: future quests

Made with parchment, pixels, and a healthy suspicion of unnecessary JavaScript. 🌿
