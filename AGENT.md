# Navfolio Main Site Agent Guide

This repository is a runnable Astro starter and the composition root of the Navfolio ecosystem. It is responsible for site configuration, content schemas, the host adapter, not-yet-extracted UI, build and deployment, and the integration of the various `@navfolio/*` packages. The current product branch is `v1`.

## Getting Started

1. When entering from the monorepo workspace, first read `../AGENT.md`.
2. Read `../.agents/context/ecosystem-map.md` to confirm capability ownership and dependency direction.
3. Read this repository's `.agents/context/current-design.md` and
   `.agents/context/current-progress.md`.
4. Cross-repository or public-contract changes follow
   `../.agents/workflows/cross-repository-change.md`.
5. Treat the current source code, `package.json`, `bun.lock`, and workflows as authoritative; do not infer the current state from old RFCs.

The upper-level workspace currently contains all 15 local repositories, including `core`, `theme-default`, and `page-media`. However, this repository installs dependencies via GitHub specs, so sibling working trees are not automatically part of the build; upstream changes still need to be pushed first, then the downstream lockfile refreshed.

## Current Boundaries

- `navfolio.config.ts` explicitly enables Projects, Vibe, Media, the Pages marker, and the Markdown preset.
- `src/config/site.toml` manages the user-editable site, theme, font, page copy, navigation, search, comment, and homepage configuration.
- `src/content.config.ts` still centrally owns the Astro collection schemas and conditionally registers Projects, Vibe, and Media based on module status.
- Projects UI still lives in `src/modules/routes/**`; Vibe and Media use package-owned routes.
- `src/modules/page-runtime.ts` is the host adapter used by package-owned routes.
- `@navfolio/core` already provides both the i18n and theme manifest contracts; it does not depend on a specific theme.
- `@navfolio/theme-default` provides the extracted default theme components and styles; the remaining UI and compatibility wrappers still belong to the main site.
- `@navfolio/plugin-markdown` configures the compilation pipeline; `@navfolio/mdx-components` provides the explicitly imported content components.
- `src/docs` is the `astro-navfolio-docs` submodule, not an ordinary main-site source directory.
- Friend Circle is wired into deployment; WeRead still has no main-site consumer.

## Modification Rules

- Behavior changes should be made in the true owner repository; do not write logic back into the main site just because it is the composition root.
- Page-module changes should also check route, collection, navigation, scaffold, i18n, and `virtual:navfolio/page-runtime`.
- When modifying docs, first commit and push to the separate docs repository, then update the main site's submodule pointer.
- Keep both the starter and docs content modes buildable, and keep the calm editorial visuals, accessibility, responsive behavior, and basic no-JavaScript readability.
- Do not commit secrets, dependency caches, temporary build artifacts, or personal data snapshots without explicit authorization.
- Preserve changes unrelated to the user's task; do not roll back or overwrite work outside the task scope.

## Verification

First run the tests closest to the change, then run according to impact scope:

```bash
bun run format:check
bun run build
bun run docs:build
```

Visible UI, routing, navigation, style, or hydration changes also require a browser check.

## Maintaining This Repository's Agent Memory

- Update `.agents/context/current-design.md` when architecture or ownership changes.
- Update `.agents/context/current-progress.md` when capability onboarding, rollback, or transition state changes.
- Distinguish "landed, in transition, not yet integrated"; only mark something as landed when the source code, manifests, lockfiles, or workflows provide evidence.
- Historical implementation plans live in Git/issues/PRs; do not keep a list of completed items as current working memory.
