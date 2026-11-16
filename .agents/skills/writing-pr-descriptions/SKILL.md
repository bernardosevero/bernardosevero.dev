---
name: writing-pr-descriptions
description: Shapes a pull request title and body for this repository. Use before `gh pr create` or `gh pr edit --body`.
---

# Writing PR descriptions

Fill [`.github/pull_request_template.md`](../../../.github/pull_request_template.md) with its exact headings. The body must stand without the diff: a reader who opens no files should know why the PR exists and what it does.

1. **Editing an existing PR?** Start from its current body (`gh pr view <number> --json body --jq .body`), because `--body` replaces everything. Carry over every image, link, and ticked box.
2. **Title.** Gitmoji plus Conventional Commits, as in `AGENTS.md`: `✨ feat(mcp): add the profile tool`.
3. **Problem.** First line: who is affected and what is wrong for them today. It must stay true under a different solution. Take the need from the issue or the request, link it, and use `Closes #N` only when the PR finishes the issue.
4. **Changes.** One bullet per change a person can notice, stating what they now see or do. Group the rest under a single "Mechanical" bullet. Add a screenshot for visual changes.
5. **How it was tested.** List the automated commands that actually ran and their results. List manual checks separately, and name what was left unchecked.
6. **Agent context.** Name the exact model and anything a reviewer should distrust.
7. **Read the body as a stranger.** The repository is public: the body holds only what the repository already publishes. Done when every heading is filled or reads `- None.`, and the body is about 150 words outside code blocks and diagrams.
