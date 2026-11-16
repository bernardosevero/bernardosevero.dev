import { createMcpHandler } from 'agents/mcp/server';
import type { McpServer } from '@modelcontextprotocol/server';

const endpoint = 'https://mcp.example.dev/mcp';

/** Sends one JSON-RPC request through the same stateless handler the Worker uses. */
export async function callMcp(
  createServer: () => McpServer,
  method: string,
  params: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const handler = createMcpHandler(createServer);
  const response = await handler.fetch(
    new Request(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
  );

  return readMcpMessage(response);
}

/** Reads the JSON-RPC message from a plain JSON body or a server-sent event stream. */
export async function readMcpMessage(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  const isEventStream = response.headers.get('content-type')?.includes('text/event-stream');
  const json = isEventStream
    ? body
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice('data:'.length).trim())
        .at(-1)
    : body;
  if (!json) throw new Error(`No JSON-RPC message in the response: ${body}`);

  const message: unknown = JSON.parse(json);
  if (message === null || typeof message !== 'object') {
    throw new Error(`Expected a JSON-RPC object, received ${json}`);
  }
  return message as Record<string, unknown>;
}
