import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import serverJson from '../server.json';
import { renderDocsPage, wantsDocsPage } from '../src/docs-page';
import { createServer, serverName, serverVersion } from '../src/server';
import { toolSummaries } from '../src/tools';
import { snapshotFixture } from './fixtures/snapshot';
import { callMcp } from './mcp-client';

const endpoint = 'https://mcp.example.dev/mcp';

describe('docs page', () => {
  it('is served to a browser that opens the endpoint', async () => {
    const response = await SELF.fetch(endpoint, { headers: { accept: 'text/html,*/*;q=0.8' } });
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain(`claude mcp add --transport http ${serverName} ${endpoint}`);
    for (const tool of toolSummaries) expect(html).toContain(`<code>${tool.name}</code>`);
  });

  it('is not served to MCP clients', () => {
    const request = (method: string, accept: string) =>
      new Request(endpoint, { method, headers: { accept } });

    expect(wantsDocsPage(request('GET', 'text/html'))).toBe(true);
    expect(wantsDocsPage(request('GET', 'text/event-stream'))).toBe(false);
    expect(wantsDocsPage(request('GET', 'application/json'))).toBe(false);
    expect(wantsDocsPage(request('POST', 'application/json, text/event-stream'))).toBe(false);
    expect(wantsDocsPage(new Request(endpoint))).toBe(false);
  });

  it('escapes everything it interpolates', async () => {
    const response = renderDocsPage('https://example.dev/mcp?a=1&b="2"', [
      { name: 'x<script>', title: 'T & <b>', description: "It's <i>fine</i>" },
    ]);
    const html = await response.text();

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<i>');
    expect(html).toContain('x&lt;script&gt;');
    expect(html).toContain('a=1&amp;b=&quot;2&quot;');
    expect(html).toContain('It&#39;s');
  });

  it('lists exactly the tools the server registers', async () => {
    const { result } = await callMcp(
      () => createServer({ loadSnapshot: () => Promise.resolve(snapshotFixture) }),
      'tools/list',
    );
    const registered = (result as { tools: { name: string; description: string }[] }).tools;

    expect(toolSummaries.map(({ name, description }) => ({ name, description }))).toEqual(
      registered.map(({ name, description }) => ({ name, description })),
    );
  });
});

describe('registry server.json', () => {
  it('matches the server version and the deployed endpoint', () => {
    expect(serverJson.version).toBe(serverVersion);
    expect(serverJson.remotes).toEqual([
      { type: 'streamable-http', url: 'https://mcp.bernardosevero.dev/mcp' },
    ]);
    expect(serverJson.name).toMatch(/^io\.github\.bernardosevero\/[a-z0-9-]+$/);
    expect(serverJson.description.length).toBeLessThanOrEqual(100);
  });
});
