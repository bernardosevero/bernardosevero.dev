# Codex skills

Two personal Codex skills support this repository. They live in the user's Codex skills directory so Codex can discover them across sessions; this document is the versioned project contract.

## `$add-project`

Use `$add-project` with a real title and desired slug. The skill finds this repository, runs the safe project scaffolder, and reports the created draft. It never overwrites an existing file and leaves factual fields as explicit prompts rather than inventing a case study.

Equivalent command:

```sh
npm run content:add-project -- --slug my-project --title "My Project"
```

## `$sync-notion-books`

Use `$sync-notion-books` with the Notion books database URL or identifier available to the connected Notion integration. The skill reads the database, maps its properties into the normalized format in `docs/content.md`, presents changes for review, and runs the importer.

The expected semantic properties are title, author, status, rating, finished date, ISBN, review, cover, and last-edited time. Exact Notion property names may differ and must be mapped explicitly. Missing optional values remain absent; they are never guessed.

The sync is deliberately one-way from Notion into managed metadata records in `src/content/books.json` and optional Markdown files in `src/content/book-reviews/`. It does not delete local books or reviews, write back to Notion, store credentials, commit, push, or deploy.

When Notion does not supply a cover, the importer preserves an existing local `coverUrl`. Cover discovery must match title and author, verify an ISBN or edition when available, prefer durable publisher or library-catalog URLs, and leave ambiguous matches absent.

## Adding one book

Use `npm run add:book -- --id <slug> --title <title> --author <author> --status <reading|finished|wishlist>` to append a safe draft to the shared JSON catalog. The command also accepts `--isbn`; it never publishes the new entry automatically and refuses to overwrite an existing ID.

An optional review is written separately as `src/content/book-reviews/<slug>.md`; the add command does not invent or scaffold review prose.

## Updating the skills

When a content schema or script changes, update the corresponding personal skill and this document in the same task. Validate personal skills with the `quick_validate.py` utility from the Codex skill-creator package.

The content scripts parse flags strictly with Node's `parseArgs`: an unknown flag or a flag without a value fails instead of being silently ignored, and `--flag=value` is accepted. Skills must pass only the documented flags.
