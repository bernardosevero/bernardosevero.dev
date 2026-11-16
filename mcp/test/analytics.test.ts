import { describe, expect, it } from 'vitest';
import { analyticsFromEnv, createAnalytics } from '../src/analytics';
import { createServer } from '../src/server';
import { snapshotFixture } from './fixtures/snapshot';
import { callMcp } from './mcp-client';

interface CapturedEvent {
  event: string;
  properties: Record<string, unknown>;
}

/** Records what the PostHog client would send instead of sending it. */
function recordingFetch(events: CapturedEvent[]): typeof fetch {
  return async (_input, init) => {
    const headers = new Headers(init?.headers);
    const sent = new Response(init?.body ?? '{}').body;
    const isGzipped = headers.get('content-encoding') === 'gzip';
    const readable = isGzipped ? sent?.pipeThrough(new DecompressionStream('gzip')) : sent;
    const payload: unknown = JSON.parse(await new Response(readable).text());
    const batch = (payload as { batch?: CapturedEvent[] }).batch ?? [];
    events.push(...batch);
    return new Response('{"status":1}', { headers: { 'content-type': 'application/json' } });
  };
}

async function callWithAnalytics(method: string, params: Record<string, unknown> = {}) {
  const events: CapturedEvent[] = [];
  const analytics = createAnalytics({
    key: 'phc_test',
    host: 'https://posthog.example',
    fetch: recordingFetch(events),
  });
  const message = await callMcp(
    () => {
      const server = createServer({ loadSnapshot: () => Promise.resolve(snapshotFixture) });
      analytics.instrument(server);
      return server;
    },
    method,
    params,
  );
  await analytics.flush();
  return { events, message };
}

describe('analytics', () => {
  it('records a tool call with its name, timing, and error state', async () => {
    const { events } = await callWithAnalytics('tools/call', {
      name: 'get_profile',
      arguments: {},
    });
    const call = events.find((event) => event.event === '$mcp_tool_call');

    expect(call?.properties.$mcp_tool_name).toBe('get_profile');
    expect(call?.properties.$mcp_is_error).toBe(false);
    expect(call?.properties.$mcp_duration_ms).toBeTypeOf('number');
  });

  it('never captures responses, intent, conversation IDs, or the calling model', async () => {
    const { events } = await callWithAnalytics('tools/call', {
      name: 'get_profile',
      arguments: {},
    });
    expect(events.length).toBeGreaterThan(0);

    const sent = JSON.stringify(events);
    expect(sent).not.toContain(snapshotFixture.profile.name);
    for (const event of events) {
      const keys = Object.keys(event.properties);
      expect(keys).not.toContain('$mcp_response');
      expect(keys).not.toContain('$mcp_intent');
      expect(keys).not.toContain('$mcp_conversation_id');
      expect(keys).not.toContain('$mcp_llm_model');
      expect(event.event).not.toBe('$exception');
    }
  });

  it('adds no analytics arguments to the tools clients see', async () => {
    const { message } = await callWithAnalytics('tools/list');
    const { tools } = message.result as {
      tools: { inputSchema?: { properties?: Record<string, unknown> } }[];
    };

    for (const tool of tools) {
      expect(Object.keys(tool.inputSchema?.properties ?? {})).toEqual([]);
    }
  });

  it('stays off unless both PostHog values are configured', () => {
    expect(analyticsFromEnv({ POSTHOG_KEY: '', POSTHOG_HOST: '' })).toBeUndefined();
    expect(analyticsFromEnv({ POSTHOG_KEY: 'phc_test' })).toBeUndefined();
    expect(
      analyticsFromEnv({ POSTHOG_KEY: 'phc_test', POSTHOG_HOST: 'https://posthog.example' }),
    ).toBeDefined();
  });
});
