#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { InitializeRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

console.error('[DEBUG] Starting minimal MCP server...');

const server = new Server(
  {
    name: 'literature-review-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[DEBUG] Initialize request received');
  return {
    capabilities: { tools: {}, resources: {} },
    serverInfo: { name: 'literature-review-mcp', version: '1.0.0' }
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[DEBUG] ListTools request received');
  return { tools: [] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[DEBUG] Minimal server connected');

  // Keep process alive
  process.stdin.resume();

  // Heartbeat
  setInterval(() => {
    console.error('[HEARTBEAT] Minimal server alive');
  }, 5000);
}

main().catch(console.error);