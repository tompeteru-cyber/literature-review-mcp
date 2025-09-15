#!/usr/bin/env node

/**
 * Standalone test for the MCP server
 * Tests basic initialization without Claude Desktop
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, 'dist', 'index.js');

console.log('🔬 Testing MCP Server Standalone...');
console.log('Server path:', SERVER_PATH);
console.log('Working directory:', process.cwd());

const serverProcess = spawn('node', [SERVER_PATH], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DATABASE_URL: 'sqlite://test_literature_review.db',
    PDF_STORAGE_PATH: path.join(__dirname, 'test-pdfs'),
    OUTPUT_PATH: path.join(__dirname, 'test-outputs')
  }
});

let hasStarted = false;
let initTimeout;

serverProcess.stderr.on('data', (data) => {
  const message = data.toString();
  console.log('[SERVER]', message.trim());

  if (message.includes('Literature Review MCP Server started and ready to accept connections')) {
    hasStarted = true;
    console.log('✅ Server started successfully!');

    // Test basic MCP initialization
    setTimeout(() => {
      console.log('🔧 Testing MCP initialization...');

      // Send MCP initialize message
      const initMessage = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: {
            name: "test-client",
            version: "1.0.0"
          }
        }
      };

      serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
    }, 1000);
  }
});

serverProcess.stdout.on('data', (data) => {
  const message = data.toString();
  console.log('[STDOUT]', message.trim());

  try {
    const response = JSON.parse(message);
    if (response.id === 1 && response.result) {
      console.log('✅ MCP initialization successful!');
      console.log('Server capabilities:', JSON.stringify(response.result, null, 2));

      // Test listing tools
      setTimeout(() => {
        const listToolsMessage = {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {}
        };

        console.log('🛠️ Testing tools list...');
        serverProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');
      }, 500);
    } else if (response.id === 2 && response.result) {
      console.log('✅ Tools list successful!');
      console.log(`Found ${response.result.tools.length} tools`);

      // Success - shutdown
      setTimeout(() => {
        console.log('🎉 All tests passed! Shutting down...');
        serverProcess.kill('SIGTERM');
        process.exit(0);
      }, 1000);
    }
  } catch (e) {
    // Not JSON, probably debug output
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Server process error:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code} and signal ${signal}`);
  if (!hasStarted) {
    console.error('❌ Server failed to start');
    process.exit(1);
  }
});

// Timeout after 30 seconds
initTimeout = setTimeout(() => {
  console.error('❌ Server initialization timed out');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}, 30000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('🛑 Interrupted, cleaning up...');
  clearTimeout(initTimeout);
  serverProcess.kill('SIGTERM');
  process.exit(0);
});