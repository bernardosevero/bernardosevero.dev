import { SELF, env } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { snapshotBody, snapshotFixture } from './fixtures/snapshot';
import { readMcpMessage } from './mcp-client';

describe('worker routing', () => {
  it('answers 404 with the endpoint path for anything other than /mcp', async () => {
    const response = await SELF.fetch('https://mcp.example.dev/');
    expect(response.status).toBe(404);
    expect(await response.text()).toContain('/mcp');
  });

  it('lists tools over HTTP without a session', async () => {
    const response = await SELF.fetch('https://mcp.example.dev/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    });

    expect(response.status).toBe(200);
    const { result } = await readMcpMessage(response);
    const { tools } = result as { tools: { name: string }[] };
    expect(tools.map((tool) => tool.name)).toContain('get_profile');
  });
});

describe('get_profile through the Worker', () => {
  afterEach(() => vi.unstubAllGlobals());

  async function callGetProfile() {
    const response = await SELF.fetch('https://mcp.example.dev/mcp', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'get_profile', arguments: {} },
      }),
    });
    const { result } = await readMcpMessage(response);
    return result as { structuredContent?: unknown; isError?: boolean };
  }

  it('fetches only the configured snapshot URL, then serves from the edge cache', async () => {
    const requested: string[] = [];
    // Like the Workers runtime, reject a call whose `this` is anything but the global scope.
    vi.stubGlobal('fetch', async function (this: unknown, input: RequestInfo | URL) {
      if (this !== undefined && this !== globalThis) {
        throw new TypeError('Illegal invocation: function called with incorrect `this` reference.');
      }
      requested.push(String(input));
      return new Response(snapshotBody);
    });

    const first = await callGetProfile();
    const second = await callGetProfile();

    expect(first.structuredContent).toEqual(snapshotFixture.profile);
    expect(second.structuredContent).toEqual(snapshotFixture.profile);
    expect(requested).toEqual([env.SNAPSHOT_URL]);
  });
});
