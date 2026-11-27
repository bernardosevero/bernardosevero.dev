import { createMcpHandler } from 'agents/mcp/server';
import { analyticsFromEnv } from './analytics';
import { renderDocsPage, wantsDocsPage } from './docs-page';
import { createServer } from './server';
import { edgeCacheStore, loadSnapshot, runtimeSnapshotSource } from './snapshot';
import { toolSummaries } from './tools';

export interface Env {
  SNAPSHOT_URL: string;
  POSTHOG_KEY?: string;
  POSTHOG_HOST?: string;
  RATE_LIMITER: RateLimit;
}

const mcpPath = '/mcp';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (new URL(request.url).pathname !== mcpPath) {
      return new Response(`Not found. The MCP endpoint is ${mcpPath}.`, { status: 404 });
    }

    // A browser visit gets a readable page; MCP clients never ask for HTML.
    if (wantsDocsPage(request)) {
      const { origin } = new URL(request.url);
      return renderDocsPage(`${origin}${mcpPath}`, toolSummaries);
    }

    // Anonymous server: the caller's address is the only identity to limit by.
    const caller = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const { success } = await env.RATE_LIMITER.limit({ key: caller });
    if (!success) {
      return new Response('Rate limit exceeded. Retry in a minute.', {
        status: 429,
        headers: { 'retry-after': '60' },
      });
    }

    const analytics = analyticsFromEnv(env);
    const store = edgeCacheStore(caches.default, env.SNAPSHOT_URL);

    // Stateless: a fresh server per request, so no session or Durable Object.
    const handler = createMcpHandler(
      () => {
        const server = createServer({
          loadSnapshot: () => loadSnapshot(runtimeSnapshotSource(env.SNAPSHOT_URL, store)),
        });
        analytics?.instrument(server);
        return server;
      },
      { route: mcpPath },
    );

    const response = await handler(request, env, ctx);
    if (!analytics) return response;
    return afterBody(response, ctx, () => analytics.flush());
  },
} satisfies ExportedHandler<Env>;

/**
 * Runs `done` once the response body has been fully sent. The tool runs while
 * the body streams, so analytics events exist only after that point.
 */
function afterBody(response: Response, ctx: ExecutionContext, done: () => Promise<void>): Response {
  if (!response.body) {
    ctx.waitUntil(done());
    return response;
  }
  const { readable, writable } = new TransformStream();
  ctx.waitUntil(response.body.pipeTo(writable).then(done, done));
  return new Response(readable, response);
}
