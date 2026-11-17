import { serverName } from './server';
import type { ToolSummary } from './tools';

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => htmlEntities[character] ?? character);
}

/** True when a person opened the endpoint in a browser rather than an MCP client calling it. */
export function wantsDocsPage(request: Request): boolean {
  return request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html');
}

/** A small page for people who open the endpoint in a browser: what it is and how to connect. */
export function renderDocsPage(endpoint: string, tools: ToolSummary[]): Response {
  const safeEndpoint = escapeHtml(endpoint);
  const toolItems = tools
    .map(
      (tool) =>
        `<li><h3><code>${escapeHtml(tool.name)}</code> ${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></li>`,
    )
    .join('\n      ');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Bernardo Severo — MCP server</title>
    <style>
      body { max-width: 44rem; margin: 0 auto; padding: 2rem 1rem; color: #2a1c10; background: #f2e2b8; font: 1rem/1.6 Georgia, serif; }
      h1, h2, h3 { line-height: 1.25; }
      h3 { margin: 0; font-size: 1rem; }
      code { padding: 0.1em 0.3em; background: #fbf0d0; border: 1px solid #a7884f; font: 0.9em ui-monospace, monospace; overflow-wrap: anywhere; }
      pre code { display: block; padding: 0.6em 0.8em; }
      ul { padding: 0; list-style: none; }
      li { margin: 0 0 1rem; }
      li p { margin: 0.2rem 0 0; }
      a { color: #24563e; }
    </style>
  </head>
  <body>
    <main>
      <h1>Bernardo Severo — MCP server</h1>
      <p>
        This is a read-only <a href="https://modelcontextprotocol.io">Model Context Protocol</a>
        server. Connect an AI assistant to it to ask about Bernardo's profile, projects, blog
        posts, and reading list. Everything it returns is already published at
        <a href="https://bernardosevero.dev">bernardosevero.dev</a>.
      </p>

      <h2>Connect</h2>
      <p>Server URL, with no account or key:</p>
      <pre><code>${safeEndpoint}</code></pre>
      <p>Claude Code:</p>
      <pre><code>claude mcp add --transport http ${escapeHtml(serverName)} ${safeEndpoint}</code></pre>
      <p>In Claude, Cursor, VS Code, or another MCP client, add a custom connector with the server URL.</p>

      <h2>Tools</h2>
      <ul>
      ${toolItems}
      </ul>
    </main>
  </body>
</html>
`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
