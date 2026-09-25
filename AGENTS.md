# Project operating guide

Build Bernardo Severo's static portfolio with a cozy medieval RPG atmosphere. Visitors must quickly understand his work, judgment, technologies, and contact options. Professional evidence and readable semantic HTML come first.

## Commands

Use Node.js 24, npm, and the committed `package-lock.json`. Dependency versions live in `package.json` and the lockfile; `.gitattributes` keeps text line endings LF across platforms.

```sh
npm ci
npm run dev
npm run check
npm run format:check
npm run build
npx playwright install chromium # First browser-test setup
npm test
npm test -- tests/design-consistency.spec.ts # Focused iteration
```

`npm test` builds before running Chromium tests. Focused runs do not replace required full suites. CI must pass formatting, type checking, builds, and browser tests for both base paths before deployment.

## Read before changing

| Task | Required guide |
| --- | --- |
| Routes, layouts, architecture | [Architecture](docs/architecture.md) |
| Code, scripts, tests, inline scripts | [Code review](docs/code-review.md) |
| UI, styles, accessibility | [Design system](docs/design-system.md) and live `/system/` specimens |
| Editorial content or imports | [Content](docs/content.md) |
| Builds, CI, deployment, base paths | [Deployment and local verification](docs/deployment.md#local-verification) |
| Skill workflows or maintenance | [Skills](docs/skills.md) |

Production components and the design system are the visual source of truth. `/` and `/about/` share the Character Sheet and `BaseLayout` top navigation.

## Product and content

- Use English for code, comments, docs, commits, frontmatter, and default UI; use `lang="en"`. Write precise, warm prose without inflated claims or excessive RPG jokes. Preserve supplied facts and proper names.
- Never invent employers, responsibilities, metrics, testimonials, dates, ratings, or outcomes. Remove confidential details and publish only complete, verified content.
- Keep editorial prose in `src/content/`, validated by `src/content.config.ts`; keep behavior and reusable configuration in code. Prefer Markdown; use MDX only for embedded components. Use kebab-case slugs and ISO dates.
- Exclude every `draft: true` entry in all environments. Keep this a simple filter; no draft previews or workflow features. Use existing content commands without overwriting IDs.
- Notion sync owns only entries with `notionId`. Show a normalized diff before importing; preserve hand-authored entries, unrelated fields, and existing reviews unless replacements are supplied. Never delete local content because it disappeared from Notion.
- Core reading and navigation must work without JavaScript. Every public page needs useful metadata, canonical/social URLs, and a logical heading hierarchy. Keep unfinished routes honestly unavailable.

## Implementation contracts

- Use Astro, strict TypeScript, static generation, and vanilla CSS. Prefer `.astro` components and small local browser scripts; add a framework only for a concrete interaction need. No Tailwind, Sass, CSS-in-JS, or component library without user direction.
- Put routes in `src/pages/`, shells in `src/layouts/`, components in `src/components/`, and assets in `public/` or `src/assets/`. References and process notes belong in `docs/`.
- Build internal paths from `import.meta.env.BASE_URL`; preserve `/` and `/bernardosevero.dev/` support. Production is Cloudflare Pages at `https://bernardosevero.dev/`.
- `BaseLayout` owns the single `SiteNavigation`. Reuse shared geometry/material tokens; `portfolio.css` owns the backdrop and outer shell. Do not add route-local menus or compensating offsets.
- Reuse tokens and primitives. Keep component styles local and page composition in route CSS. Prefer Grid/Flexbox; reserve absolute positioning for decoration/overlays and `!important` for documented accessibility/third-party overrides.
- Update `/system/` with every shared component, variant, token, or interaction-state change. Use small production-component specimens and static navigation previews; never embed full pages or load editorial collections. Update the design-system guide when ownership or shared rules change.
- Preserve `tests/design-consistency.spec.ts`; extend it for new routes and primitives. Intentional contract changes require user direction and matching documentation.

## Code Review Rules

Apply these to all new or modified code, including generated code, scripts, and tests. See [review examples](docs/code-review.md) for lookup maps, branching, and boundary checks.

- No nested ternaries. Choose `if`, `switch`, lookup objects, or `Map` for clarity; none is mandatory. For a fixed mapping:

  ```ts
  type Shelf = 'reading' | 'finished' | 'wishlist';
  const shelfLabels: Record<Shelf, string> = {
    reading: 'Reading',
    finished: 'Finished',
    wishlist: 'Wishlist',
  };
  ```

- Keep decisions and side effects explicit. Give functions one responsibility, use meaningful names, explain non-obvious constraints, and reuse existing helpers without speculative abstractions.
- Use narrow types and boundary validation. Do not bypass unresolved types with `any`, unchecked assertions, non-null assertions, or suppression comments. Handle missing DOM nodes and empty collections deliberately.
- Surface actionable failures; never swallow exceptions or promises. Preserve valid zero values, keyboard defaults, focus, and boundary behavior during refactors. Test behavior and meaningful edge cases.
- Inspect the full diff before finishing. Correct readability, failure-path, duplication, and scope problems. Automated checks do not enforce every review rule; never weaken checks to pass.

## Verification by change

Requirements are cumulative; apply each matching row.

| Change | Required verification |
| --- | --- |
| Documentation only | Check links, commands, and consistency; no browser run required. Markdown is excluded from Prettier. |
| Code or configuration | `npm run check`, `npm run format:check`, `npm run build`. |
| Editorial content | Schema validation via check/build; review facts, links, headings, draft visibility, and affected pages at mobile/desktop widths. |
| Routes, UI, behavior, accessibility, or shared styles | Full `npm test` at both base paths using the deployment guide; inspect affected pages and follow the design-system visual/accessibility checklist. |
| Build/test/deployment pipeline | Run both base-path browser suites locally; preserve deployment's dependency on successful checks. |

Report changes, verification results, and anything incomplete. Distinguish automated checks from manual visual review.

## Boundaries and Git

- Preserve unrelated user changes. Do not commit, push, deploy, force-push, broadly delete, or mutate external services (including Notion) unless authorized by the task. Skill use does not grant that authorization.
- Never commit secrets, private URLs, `node_modules/`, `.astro/`, `dist/`, browser binaries, or generated test artifacts.
- When authorized to commit, use English Gitmoji + Conventional Commits: `✨ feat(home): add social sharing metadata`. Match the emoji to the change.
