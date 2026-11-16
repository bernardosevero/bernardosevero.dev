# Skills

Skills carry workflows for one kind of task. Rules that apply to every change belong in [AGENTS.md](../AGENTS.md) or a guide under `docs/`.

## Where a rule belongs

Stop at the first rung that fits:

1. **A test or linter**, when a check can see the violation.
2. **A skill**, when the rule applies to one kind of task.
3. **A guide in `docs/`**, when it applies to one area of the code and is reached from the AGENTS.md table.
4. **AGENTS.md**, when nothing above can carry it. Every line there loads in every session.

Write rules as invariants ("every tool is read-only"), and say how each is enforced.

## Repository skills

These are versioned with the code. `.agents/skills/<name>/SKILL.md` is the single source; `.claude/skills/<name>/SKILL.md` is a pointer file that repeats only the frontmatter, because symlinks do not survive a Windows checkout. Change the description in both files together.

| Skill | Use when |
| --- | --- |
| [`implementing-mcp-tools`](../.agents/skills/implementing-mcp-tools/SKILL.md) | Adding or changing a tool on the MCP server, or the snapshot it reads |
| [`writing-pr-descriptions`](../.agents/skills/writing-pr-descriptions/SKILL.md) | Writing or editing a pull request title and body |
| [`add-project`](../.agents/skills/add-project/SKILL.md) | Scaffolding a draft project case study |
| [`sync-notion-books`](../.agents/skills/sync-notion-books/SKILL.md) | Importing books, ratings, covers, and reviews from Notion |

`add-project` and `sync-notion-books` began as personal Codex skills in the owner's Codex skills directory. The repository copies are now the source; a personal copy that remains must be updated to match or removed.

## `add-project`

Use `add-project` with a real title and desired slug. The skill runs the safe project scaffolder, and reports the created draft. It never overwrites an existing file and leaves factual fields as explicit prompts rather than inventing case-study notes (these fields are kept for the owner's records and are not published).

Equivalent command:

```sh
npm run content:add-project -- --slug my-project --title "My Project"
```

## `sync-notion-books`

Use `sync-notion-books` with the Notion books database URL or identifier available to the connected Notion integration. The skill reads the database, maps its properties into the normalized format in `docs/content.md`, presents changes for review, and runs the importer.

The expected semantic properties are title, author, status, rating, finished date, ISBN, review, cover, and last-edited time. Exact Notion property names may differ and must be mapped explicitly. Missing optional values remain absent; they are never guessed.

The sync is deliberately one-way from Notion into managed metadata records in `src/content/books.json` and optional Markdown files in `src/content/book-reviews/`. It does not delete local books or reviews, write back to Notion, store credentials, commit, push, or deploy.

When Notion does not supply a cover, the importer preserves an existing local `coverUrl`. Cover discovery must match title and author, verify an ISBN or edition when available, prefer durable publisher or library-catalog URLs, and leave ambiguous matches absent.

## Adding one book

Use `npm run add:book -- --id <slug> --title <title> --author <author> --status <reading|finished|wishlist>` to append a safe draft to the shared JSON catalog. The command also accepts `--isbn`; it never publishes the new entry automatically and refuses to overwrite an existing ID.

An optional review is written separately as `src/content/book-reviews/<slug>.md`; the add command does not invent or scaffold review prose.

## Updating the skills

When a content schema or script changes, update the corresponding skill in `.agents/skills/` and this document in the same task. When a skill's description changes, update its pointer file in `.claude/skills/` too.

The content scripts parse flags strictly with Node's `parseArgs`: an unknown flag or a flag without a value fails instead of being silently ignored, and `--flag=value` is accepted. Skills must pass only the documented flags.
