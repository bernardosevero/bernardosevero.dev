# MCP server

Read before changing the public data snapshot (`src/pages/api/v1/`), its serializer, or anything in `mcp/`. The plan and scope live in [issue 47](https://github.com/bernardosevero/bernardosevero.dev/issues/47).

**Status:** the snapshot carries the profile, projects, posts, and books, and the Worker serves all six tools. The Worker deploys only while the `MCP_DEPLOY_ENABLED` repository variable is `true` (see [Deployment](deployment.md#mcp-worker)).

## Shape

The site emits one static snapshot of its public content. A stateless Cloudflare Worker at `https://mcp.bernardosevero.dev/mcp` fetches that snapshot, caches it for about five minutes, and answers read-only MCP tool calls from it.

| Piece | Location | Owns |
| --- | --- | --- |
| Snapshot | `src/pages/api/v1/content.json.ts`, `index.json.ts` | The public data contract, built by Astro |
| Serializer | `src/utils/public-snapshot.ts` (pure mapping), `public-snapshot-source.ts` (reads collections) | Mapping content entries to public DTOs |
| Worker | `mcp/` (own `package.json`, lockfile, Vitest) | Transport, tools, cache, analytics |

The Worker is a separate deploy. The site stays a static Pages upload with no server runtime.

Inside `mcp/src/`: `index.ts` routes, rate-limits, and wires dependencies; `server.ts` creates the server; `tools/index.ts` lists the tool surface and `tools/` holds one file per tool, each a pure `run(snapshot, input)` function; `tools/define.ts` registers them with the shared annotations, schemas, and error handling; `snapshot.ts` fetches and caches; `snapshot-schema.ts` is the zod contract and the source of tool output schemas; `analytics.ts` configures PostHog. Tools receive `loadSnapshot` as a dependency, so tests never touch the network.

```sh
cd mcp
npm ci
npm run check                                        # TypeScript
npm test                                             # Vitest inside the Workers runtime
npm run check:snapshot -- ../dist/api/v1/content.json # after `npm run build` at the root
npm run dev                                          # wrangler dev at http://localhost:8787/mcp
```

## Invariants

Each rule carries its enforcement: `[test]` means a test fails when it is broken, `[review]` means only a reviewer catches it.

1. **Read-only.** Every tool is annotated `readOnlyHint: true` and has an output schema. The Worker holds no secrets and mutates nothing. `[test]`
2. **Allowlist serialization.** The serializer names every field it emits and never spreads a content entry, so a new schema field stays private until someone adds it on purpose. `[review]`
3. **Private fields stay out.** The snapshot contains no `draft` entries and none of `notionId`, `notionLastEditedAt`, `coverProvenance`, `coverOverride`, or a strength `level`. No email address. `[test]`
4. **One data source.** The Worker fetches the fixed snapshot URL only. No URL is ever built from tool input. `[review]`
5. **Validated boundaries.** Tool inputs use zod schemas: the slug pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` for IDs and enums for closed sets. The fetched snapshot is validated against the Worker's own zod schema before use. `[test]`
6. **Honest failures.** An unknown ID returns an MCP error that names the valid choice or the listing tool. A failed snapshot fetch serves the last cached copy, or an error asking the client to retry; never partial data and never an empty success. `[test]`
7. **Traceable facts.** Every returned value comes from a published entry in `src/content/`, and every item carries its canonical site URL. The Worker adds no prose of its own beyond tool descriptions and server instructions. `[review]`
8. **Basic analytics only.** PostHog events carry tool name, validated parameters, timing, and error state. Agent intent, conversation IDs, and tool responses are never captured. `[test]`
9. **Additive contract.** `/api/v1/` changes only by adding fields. Removing or renaming a field is a `/api/v2/` change. `[review]`

## Tools

Six tools, all read-only:

| Tool | Input | Returns |
| --- | --- | --- |
| `get_profile` | none | Profile, experience, education, skills, and public links |
| `get_projects` | none | Title, summary, and verified links for each project |
| `list_posts` | `topic?` | Post metadata, newest first, and every topic in use |
| `get_post` | `slug` | One post in full, as Markdown |
| `get_reading_list` | `status?` | Books with rating and a review URL where one exists |
| `get_book_review` | `id` | One review in full, in its original language |

Projects expose only what the Projects page renders. Role, technologies, outcomes, and the case-study fields are the owner's records and are not published, so there is no technology filter. Adding, renaming, or removing a tool changes the public surface and needs the owner's direction. Follow the [implementing-mcp-tools skill](../.agents/skills/implementing-mcp-tools/SKILL.md) for the workflow.

## Docs page and discovery

A browser that opens `/mcp` (a `GET` that accepts `text/html`) receives a small page with the server URL, the Claude Code command, and the tool list. `toolSummaries` in `mcp/src/tools/index.ts` feeds that page, and a test keeps it equal to the registered tools. MCP clients never ask for HTML, so they are unaffected.

The CV page shows the `McpConnect` block only while `advertiseMcpServer` in `src/config/mcp.ts` is `true`. Keep it `false` until the Worker answers at the endpoint.

`mcp/server.json` is the entry for the official MCP Registry, under the GitHub namespace `io.github.bernardosevero`. It has not been published. Its `version` must equal `serverVersion` in `mcp/src/server.ts`; a test enforces that. The file follows the registry's published example for a remote server and has not been validated by the registry itself.

## Platform facts

Proven by the Vitest suite on 2026-11-16, which runs inside the local Workers runtime. Nothing here has run on Cloudflare's network or against a real MCP client yet.

- **Stateless transport.** `createMcpHandler` from `agents/mcp/server` takes a server factory and builds a fresh `McpServer` (`@modelcontextprotocol/server`, SDK v2) per request, with no Durable Object. Requests without a session answer as a server-sent event stream, so the tool runs while the body streams. [Cloudflare reference](https://developers.cloudflare.com/agents/api-reference/mcp-handler-api/)
- **PostHog.** `instrument(server, posthog, options)` from `@posthog/mcp` works on the per-request server, despite the vendor docs steering Workers to manual capture. `context: false`, `enableConversationId: false`, `captureModel: false`, and `enableExceptionAutocapture: false` turn those captures off; `$mcp_response` has no switch and is deleted in `beforeSend`. Events are flushed after the response body finishes, inside `ctx.waitUntil`. The vendor docs say client name and version are absent on this stateless path. [PostHog reference](https://posthog.com/docs/mcp-analytics/installation/typescript)
- **Edge cache.** The snapshot is stored with the Cache API for seven days with its fetch time in a header; the Worker treats it as fresh for five minutes and as a fallback after that. The Cache API needs the custom domain; it does nothing on `workers.dev`.
- **Rate limiting.** The `ratelimits` binding in `wrangler.jsonc` allows 60 requests per 60 seconds per caller address. Limits are approximate and counted per Cloudflare location. Plan availability is unconfirmed until the first deploy. [Cloudflare reference](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- **Tests.** `@cloudflare/vitest-plugin` runs tests inside the Workers runtime. `vi.stubGlobal('fetch', …)` replaces the Worker's outbound fetch, and `SELF.fetch` exercises the whole Worker.

## Verification

Cumulative with the table in [AGENTS.md](../AGENTS.md).

| Change | Required verification |
| --- | --- |
| Snapshot or serializer | Site checks at both base paths, plus the drift check: the built `dist/api/v1/content.json` passes the Worker's snapshot schema. |
| Worker code | In `mcp/`: typecheck and Vitest, including the unknown-ID and failed-fetch cases for any tool touched. |
| Tool surface or analytics | The above, plus a manual call from one real client, reported as manual. |
