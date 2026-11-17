import { McpServer } from '@modelcontextprotocol/server';
import { registerTools } from './tools';
import type { ToolDependencies } from './tools/define';

export const serverName = 'bernardosevero';
export const serverVersion = '0.2.0';

const instructions = [
  'Read-only facts about Bernardo Severo, a software engineer, taken from his portfolio at https://bernardosevero.dev.',
  'The data is first-party and self-reported.',
  'Cite the canonical URLs returned with each item, and do not extrapolate beyond what the data says.',
].join(' ');

export function createServer(dependencies: ToolDependencies): McpServer {
  const server = new McpServer({ name: serverName, version: serverVersion }, { instructions });
  registerTools(server, dependencies);
  return server;
}
