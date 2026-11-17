export interface McpServer {
  /** The short name visitors use for the server in their client's configuration. */
  name: string;
  endpoint: string;
}

export const mcpServer: McpServer = {
  name: 'bernardosevero',
  endpoint: 'https://mcp.bernardosevero.dev/mcp',
};

// The CV page advertises the server only while this is true. Keep it false
// until the Worker answers at the endpoint (docs/deployment.md#mcp-worker).
export const advertiseMcpServer: boolean = false;
