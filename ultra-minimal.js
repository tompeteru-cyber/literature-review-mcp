#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { InitializeRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Add comprehensive error handling
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  console.error('[FATAL] Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.error('[DEBUG] Starting ultra-minimal MCP server...');

const server = new Server(
  {
    name: 'literature-review-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.error('[DEBUG] Server instance created');

// Handle initialize
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[DEBUG] Initialize request received:', JSON.stringify(request));
  const response = {
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'literature-review-mcp',
      version: '1.0.0'
    }
  };
  console.error('[DEBUG] Sending initialize response:', JSON.stringify(response));
  return response;
});

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[DEBUG] ListTools request received');
  return { tools: [] };
});

console.error('[DEBUG] Request handlers set');

async function main() {
  try {
    console.error('[DEBUG] Creating transport...');
    const transport = new StdioServerTransport();
    console.error('[DEBUG] Transport created');

    console.error('[DEBUG] Connecting server...');
    await server.connect(transport);
    console.error('[DEBUG] Server connected successfully');

    // Keep process alive
    console.error('[DEBUG] Keeping process alive...');

  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    console.error('[ERROR] Stack:', error.stack);
    process.exit(1);
  }
}

console.error('[DEBUG] Starting main...');
main().catch((error) => {
  console.error('[FATAL] Main function failed:', error);
  console.error('[FATAL] Stack:', error.stack);
  process.exit(1);
});

console.error('[DEBUG] Main started');