# Design system

## Purpose

The design system turns the supplied medieval pixel-art references into a maintainable web language. It balances two goals: a distinctive RPG-world atmosphere and immediate professional clarity for recruiters and technical readers.

The public `/system/` route is the live specimen sheet. This document defines ownership, constraints, and contribution rules. Production CSS and components remain authoritative.

## Decision: vanilla CSS

The project uses vanilla CSS with Astro rather than Tailwind or another styling framework.

Why it fits:

- The interface relies on a small, distinctive vocabulary rather than a broad utility catalog.
- Timber, parchment, pixel corners, ornaments, and layered shadows benefit from readable custom CSS.
- Astro scopes component styles by default and ships no runtime CSS-in-JS cost.
- A token layer keeps recurring choices consistent without turning every template into a long class string.
- Fewer dependencies make a small static portfolio easier to understand and maintain.

Tradeoffs accepted:

- Contributors must name and organize CSS deliberately.
- Responsive composition is written by hand.
- Drift is possible if one-off values bypass tokens; review and the live `/system/` page are the controls.

Revisit this decision only if repetition or team scale creates a demonstrated maintenance problem. Do not add a framework preemptively.

## CSS ownership

| Layer | Location | Owns |
| --- | --- | --- |
| Tokens | `src/styles/tokens.css` | Palette, typography families, spacing base, frame geometry, shared effects |
| Foundations and primitives | `src/styles/global.css` | Reset, document defaults, focus, wood frames, parchment, RPG buttons, ornaments, dialogs |
| Components | Component-local `<style>` | A reusable component's internal layout and variants |
| Routes | `src/styles/*.css` or route-local `<style>` | Cross-component page composition and responsive changes |

The cascade order is declared as `reset, tokens, base, components, utilities, overrides`. Do not create a new layer without a concrete conflict it resolves.

## Foundation tokens

### Color roles

- `--ink`, `--ink-soft` — primary and secondary text on parchment.
- `--parchment`, `--parchment-light`, `--parchment-edge` — readable surfaces and aged edges.
- `--wood-dark`, `--wood-shadow`, `--wood`, `--wood-light` — structural frames and depth.
- `--green-dark`, `--green`, `--green-light` — primary actions and village continuity.
- `--gold` — focus, selection, and scarce emphasis.
- `--ornament` — dividers and quiet decoration.

Gold is not body-copy color. Green does not carry state by itself. Every status also needs text, shape, position, or an accessible label.

### Typography

- `--font-heading`: Pixelify Sans 700 for names, section titles, navigation, and compact labels.
- `--font-body`: VT323 400 for body copy, metadata, descriptions, and controls where legible.

Both fonts are self-hosted through Fontsource. Pixel typography is thematic, not permission to use cramped sizes. Long articles should target a readable line length and may use a future text-optimized token if testing shows it is needed.

### Space and geometry

- The base spacing unit is `--space-unit: 4px`.
- Shared component spacing should normally use multiples of the base unit.
- `--frame-width` controls the timber surround and changes responsively.
- `--frame-shadow` owns the shared elevation recipe.

Not every dimension must become a token. Promote a value when it represents a reusable decision, not merely because it appears twice by coincidence.

## Materials and primitives

### WoodFrame

`WoodFrame.astro` provides the timber surround, corner hardware, and optional parchment surface. Use it for primary RPG windows, not every content card. Nested frames should be rare so the hierarchy remains obvious.

The Components and States section on `/system/` includes a live timber-only specimen alongside the parchment-backed production windows that structure the page.

### RPG button

`.rpg-button` is the primary action primitive. Its focus ring uses gold and remains visible independently of hover. Use native links for navigation even if they share the visual class; use buttons only for actions.

### Site navigation

`SiteNavigation.astro` and `src/config/navigation.ts` own the portfolio's four page destinations: About, Projects, Posts, and Books. It uses real anchors, derives the active section from the current route, and renders on every public content route. The Character Sheet uses its rail variant; other pages use the bar variant. The bar renders four columns on wide screens and two columns below 820px; the page shell reserves enough vertical space to keep the mobile menu separate from page content.

### Reading Codex

`ReadingCodex.astro` renders the compact banner, bookshelf tiles, selected-book details, and shelf navigation. Its named styles live in `src/styles/reading-codex.css`; enhancement lives in `src/scripts/reading-codex.ts`. The same complete component runs on Reading and `/system/`, using real collection data. Each instance requires a unique ID.

Desktop uses a 3:2 split between shelf and details, with four cover-first columns. Container queries reduce the shelf to three columns on tablets, then two columns with stacked panels on phones. Real edition covers use `object-fit: contain`; metadata is semantic HTML. Selected tiles have gold corner brackets and a diamond, while the active shelf has a gold border and marker. Keyboard focus remains distinct from selection.

Without JavaScript, shelf navigation and book tiles are fragment links and all metadata and review links remain readable. Enhancement displays one shelf and detail at a time, remembers a selection per shelf, supports Arrow Left/Right and Home/End on tabs, and moves focus to the chosen book details. The first populated shelf opens by default. Empty shelves never display stale book details.

`BookRating.astro` renders five outlined stars with full or fractional fills plus an exact accessible value. Missing ratings say “Not rated”; zero remains a valid rating. The system page shows all these states. No ratings or review summaries are inferred.

Reading uses the same `SiteNavigation` bar demonstrated on `/system/`: green actions in a timber frame, four columns on desktop and two on mobile. It sits in normal document flow above the Codex so its actual height determines the content spacing.

### Project card

`ProjectCard.astro` owns the compact Projects index presentation. Its explicit link list can expose verified Alura and GitHub destinations without making the entire card interactive; missing or unusable URLs leave the title and summary readable. Project list cards do not show technology tags or case-study labels.

### Ornaments

`Ornament.astro` renders divider, sprig, and branch variants as CSS shapes. They are decorative and hidden from assistive technology. Ornaments reinforce structure but never replace a heading or label.

### Pixel icons

The homepage and `/about/` share `src/layouts/CharacterSheet.astro`, backed by the About content entry. The approved About composition supersedes the original Home mockup for the landing screen. Existing Personal Log return links still lead to `/`. The homepage menu retains Reading instead of a redundant home link. The sheet stacks its columns at intermediate widths to preserve readability.

`PixelIcon.astro` contains multicolor SVG artwork for the character sheet, tool tiles, and professional profile links. Tool marks retain recognizable colors; the briefcase, star, wrench, and book share dark walnut outlines, bronze shading, and gold highlights drawn from the About reference. The AWS illustration is a cloud symbol with an orange smile, not an official logo. Artwork is independent of CSS geometry; CSS controls its size and surrounding tile. Decorative instances are hidden from assistive technology; icon-only controls must provide an accessible name and a visible tooltip or nearby label. The live inventory shows both icon families.

### Dialogs

Section previews use native `<dialog>` for focus management and Escape behavior. Dialog copy must state unfinished routes honestly. A dialog must have a labelled title, described status, explicit close action, and restored opener focus.

### Tags and status labels

`.tag-list` groups technologies and topics; `.status-badge` labels metadata. Both use the legible body pixel font rather than the display face. They are real semantic list or text content and are demonstrated on `/system/`. The Codex's status field and star rating belong to its detail panel.

### Topic filters

`.topic-filter` is a native button used for client-side post filtering. The active option carries `aria-pressed="true"` as well as a gold selected state. Without JavaScript, every post remains visible and readable.

## Responsive behavior

Desktop mockups define hierarchy, not a fixed canvas. Layouts should reflow at content-driven breakpoints:

- Preserve readable text and touch targets.
- Stack or reorder panels when horizontal space disappears.
- Keep functional controls inside the viewport without scaling the entire scene.
- Allow documents and lists to scroll naturally.
- Decorative scenery may crop; professional content may not.

Current regression widths are 320, 390, 760, 768, 1024, and 1586 pixels.

## Accessibility states

Every interactive primitive needs default, hover, focus-visible, active, and disabled behavior when disabled is supported. Test keyboard interaction at 200% zoom and with reduced motion. Automated axe checks supplement rather than replace manual review.

## Maintaining `/system/`

The public route must import real production components and read computed CSS variables. It should not maintain a copied palette or recreated button. When a shared visual primitive changes:

1. Update its implementation and tokens.
2. Update the live specimen if a new state or variant exists.
3. Update this document if the ownership or rule changes.
4. Run type, build, browser, accessibility, and responsive checks.