#!/usr/bin/env node

/**
 * Direct tool testing for literature review MCP server
 * Run specific tools without Claude Desktop
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, 'dist', 'index.js');

async function testTool(toolName, args = {}) {
  console.log(`🔧 Testing tool: ${toolName}`);
  console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DATABASE_URL: 'sqlite://literature_review.db',
        PDF_STORAGE_PATH: path.join(__dirname, 'pdfs'),
        OUTPUT_PATH: path.join(__dirname, 'outputs')
      }
    });

    let initComplete = false;
    let responses = [];

    serverProcess.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('ready to accept connections')) {
        // Server is ready, send initialization
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
      }
    });

    serverProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (!message) return;

      try {
        const response = JSON.parse(message);
        responses.push(response);

        if (response.id === 1 && !initComplete) {
          // Initialization complete, now call the tool
          initComplete = true;
          const toolMessage = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: toolName,
              arguments: args
            }
          };
          serverProcess.stdin.write(JSON.stringify(toolMessage) + '\n');
        } else if (response.id === 2) {
          // Tool response received
          console.log('✅ Tool Response:');
          console.log(JSON.stringify(response.result, null, 2));
          serverProcess.kill('SIGTERM');
          resolve(response.result);
        }
      } catch (e) {
        // Not JSON, probably debug output
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.error('❌ Tool test timed out');
      serverProcess.kill('SIGTERM');
      reject(new Error('Timeout'));
    }, 10000);
  });
}

// Export for use
export { testTool };

// If run directly, test a sample tool
if (import.meta.url === `file://${process.argv[1]}`) {
  const toolName = process.argv[2] || 'search_databases';
  const args = {
    databases: ['Scopus', 'IEEE'],
    query: 'machine learning AND healthcare'
  };

  testTool(toolName, args)
    .then(() => console.log('🎉 Tool test completed'))
    .catch(error => console.error('❌ Tool test failed:', error));
}