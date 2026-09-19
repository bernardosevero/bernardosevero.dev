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

The expected semantic properties are title, author, status, rating, finished date, review, cover, and last-edited time. Exact Notion property names may differ and must be mapped explicitly. Missing optional values remain absent; they are never guessed.

The sync is deliberately one-way from Notion to local Markdown for managed book entries. It does not delete local books, write back to Notion, store credentials, commit, push, or deploy.

When Notion does not supply a cover, the importer preserves an existing local `coverUrl`. Cover discovery must match title and author, verify an ISBN or edition when available, prefer durable publisher or library-catalog URLs, and leave ambiguous matches absent.

## Updating the skills

When a content schema or script changes, update the corresponding personal skill and this document in the same task. Validate personal skills with the `quick_validate.py` utility from the Codex skill-creator package.
