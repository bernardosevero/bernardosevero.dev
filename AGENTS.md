# Project operating guide

## Mission

Build Bernardo Severo's personal portfolio as a memorable, credible entry point for recruiters, engineering leaders, collaborators, and curious visitors. The experience should feel like opening a cozy medieval RPG menu while making Bernardo's work, judgment, and technologies easy to understand.

Success means a visitor can quickly answer:

1. Who is Bernardo and what kind of problems does he solve?
2. What has he built, what was his role, and what changed because of it?
3. How does he think and communicate?
4. Which technologies and domains does he work with?
5. How can someone contact him?

Visual charm supports those answers; it must never hide them.

## Non-negotiable product principles

- Lead with professional evidence. The RPG metaphor is the navigation language, not a barrier to comprehension.
- Keep the site static, fast, accessible, and simple to maintain.
- Render real semantic HTML. Never ship a screenshot as the interface or place invisible controls over an image.
- Do not invent employers, responsibilities, metrics, testimonials, dates, book ratings, or project outcomes. Mark incomplete content as draft.
- Treat privacy and confidentiality as product requirements. Remove internal names and sensitive details from case studies.
- Use progressive enhancement. Core reading and navigation must work without client-side JavaScript.

## Language and voice

- Write code identifiers, comments, documentation, commit messages, content frontmatter, and default UI copy in English.
- Use `lang="en"` unless a page is explicitly localized later.
- Sound precise, warm, curious, and direct. Avoid corporate filler, inflated claims, and excessive RPG jokes.
- Prefer short paragraphs, descriptive headings, concrete verbs, and evidence-backed outcomes.
- Preserve proper names and user-supplied facts exactly unless asked to edit them.

## Information architecture

- `/` — Personal Log: introduction and primary navigation.
- `/posts/` — Journal: writing list with useful topic filters.
- `/posts/[slug]/` — Individual article.
- `/about/` — Character Sheet: profile, experience, specialties, tools, and contact path.
- `/projects/` — Quest Log: project list and featured work.
- `/projects/[slug]/` — Case study with problem, constraints, decisions, contribution, outcome, and lessons.
- `/reading/` — Reading Codex: reading, finished, and wishlist shelves with ratings and optional reviews.
- `/system/` — Live design-system inventory built from production tokens and components.

Do not expose a route as finished until its content, responsive layout, keyboard behavior, metadata, and tests are ready. Until then, use an honest unavailable state.

## Content architecture

Astro content collections are the source of truth for editorial material:

- `src/content/posts/` — articles in Markdown or MDX.
- `src/content/projects/` — project case studies in Markdown or MDX.
- `src/content/books/` — one Markdown file per book; the body holds the review.
- `src/content/pages/` — low-frequency page copy such as Home and About.
- `src/content.config.ts` — schemas and validation contracts.

Rules:

- Use plain Markdown by default. Use MDX only when an article genuinely needs an interactive or custom component.
- Keep navigation behavior and reusable UI configuration in code; keep visitor-facing prose in content files.
- Use lowercase kebab-case slugs and ISO dates.
- A draft must stay out of production indexes and feeds.
- A project begins with `draft: true`; publishing requires real role, context, decisions, and supportable outcomes.
- Notion book sync owns only entries carrying `notionId`. It must not delete hand-authored content or rewrite unrelated fields silently.
- Store no Notion token, database secret, or private URL in Git.
- See `docs/content.md` before adding or importing content.

## Astro and code architecture

- Use Astro, strict TypeScript, static generation, npm, and the committed `package-lock.json`.
- Put routes in `src/pages/`, shared shells in `src/layouts/`, reusable UI in `src/components/`, and editorial data in `src/content/`.
- Prefer `.astro` components. Add a framework integration only when a concrete interaction cannot be expressed simply with Astro and browser APIs.
- Keep client JavaScript small and local. Do not hydrate static prose or decoration.
- Use semantic links for navigation and buttons for actions.
- Respect the configured GitHub Pages base path. Build internal paths from `import.meta.env.BASE_URL`; never assume deployment at `/`.
- Production assets belong in `public/` or `src/assets/`. References and process notes belong in `docs/`.
- Never commit secrets, `node_modules/`, `.astro/`, `dist/`, browser binaries, or generated test artifacts.

## CSS decision

Use vanilla CSS. Do not add Tailwind, Sass, CSS-in-JS, or a component library unless the user explicitly reopens this decision.

The styling layers are:

1. `src/styles/tokens.css` — global design tokens and cascade-layer order.
2. `src/styles/global.css` — reset, base rules, accessibility helpers, and shared primitives such as frames and buttons.
3. Component-local `<style>` blocks — styles owned by one Astro component.
4. Route stylesheets such as `src/styles/home.css` — composition that genuinely spans several child components.

Rules:

- Reuse a token when one expresses the intent; do not scatter near-duplicate colors or spacing values.
- Name tokens semantically when their role is stable and descriptively when they represent a material.
- Keep page composition out of shared component primitives.
- Prefer Grid and Flexbox. Use absolute positioning only for decorative details and overlays that require it.
- Avoid `!important` except for a documented accessibility or third-party override.
- The public `/system/` page must render production classes, components, fonts, and CSS variables. If a specimen disagrees with the real component, fix or remove the specimen.
- Every new or changed reusable UI component, visual variant, design token, or interaction state must update `/system/` in the same change.
- Page-specific layout CSS does not require a `/system/` specimen unless it introduces a reusable pattern or changes a shared visual rule.
- Update `docs/design-system.md` in the same change whenever the design system's ownership, usage rules, tokens, or shared primitives change materially.

## Visual source of truth

- Inspect `docs/design/references/` before changing a referenced screen.
- The five supplied mockups are the primary composition references. Home defines navigation; Projects defines list/detail structure; Reading defines finish; Posts and About define their screens.
- Preserve hierarchy, density, proportions, timber frames, parchment surfaces, green actions, gold selection cues, and the medieval village atmosphere.
- Avoid generic dashboards, terminal aesthetics, glassmorphism, and cyberpunk motifs.
- Raster imagery is allowed for scenery, textures, and illustration. Text, navigation, controls, lists, ratings, and statuses must remain real HTML/CSS.
- Document approximations and missing assets. A passing build is not proof of visual fidelity.

## Accessibility, responsiveness, and performance

- Target WCAG 2.2 AA for content and interactions.
- Support keyboard navigation, visible focus, logical focus order, accessible names, and Escape behavior for dialogs.
- Never communicate selection or status through color alone.
- Preserve readable type and touch targets on small screens; reflow layouts instead of shrinking a desktop screenshot.
- Respect `prefers-reduced-motion` and hide decorative nodes from assistive technology.
- Keep long-form reading comfortable even when display typography is pixel-inspired.
- Self-host necessary fonts and optimize raster assets. Avoid new runtime dependencies for effects CSS can provide.
- Every page needs a useful title, description, heading hierarchy, and shareable URL. Add canonical and social metadata before public launch.

## Skills and automation contracts

- `$add-project` scaffolds a draft in `src/content/projects/` through `npm run content:add-project`. It must fail rather than overwrite an existing slug and must never fabricate claims.
- `$sync-notion-books` reads the configured Notion books database, shows a normalized diff, and imports books through `npm run content:import-books`. It must not delete local entries or store credentials.
- A skill may prepare local changes, but it may not commit, push, deploy, delete references, or mutate Notion without the user's request.
- Skills are personal Codex skills stored under the user's Codex skills directory. Their project contract is documented in `docs/skills.md`.

## Reference retirement gate

Do not delete `docs/design/references/` during normal page work. Remove it only when all five experience areas are complete and all of the following are true:

1. Home, Posts, About, Projects, and Reading are implemented at desktop and mobile sizes.
2. Production no longer depends on a reference file.
3. Each screen has been visually compared with its reference and the remaining intentional differences are documented.
4. Accessibility, type checking, build, and browser tests pass.
5. The user explicitly approves retiring the references.

Reference removal should be a separate, reviewable housekeeping change. Keep provenance and design decisions even after the large images are removed.

## Verification checklist

For any code or configuration change:

```sh
npm run check
npm run build
```

Run `npm test` for routes, layout, interactions, shared styles, or accessibility changes. Install Chromium once with `npx playwright install chromium` if needed.

Before reporting completion:

- Inspect the affected routes at mobile and desktop widths.
- Check overflow, wrapping, loading errors, keyboard focus, and reduced motion.
- Validate new content against `src/content.config.ts`.
- Confirm that GitHub Pages paths work under `/bernardosevero.dev/`.
- Report what changed, what was verified, and what remains incomplete.

Preserve unrelated user changes. Do not commit, push, deploy, force-push, delete broad paths, or change external services unless the task authorizes it.
