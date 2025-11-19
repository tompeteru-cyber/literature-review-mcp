#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing MCP tool call...');

const mcpProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

mcpProcess.stdout.on('data', (data) => {
  const str = data.toString();
  console.log('STDOUT:', str);
  output += str;
});

mcpProcess.stderr.on('data', (data) => {
  const str = data.toString();
  console.log('STDERR:', str);
  errorOutput += str;
});

mcpProcess.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  console.log('Final output:', output);
  console.log('Final error:', errorOutput);
});

// Wait a bit for the server to start
setTimeout(() => {
  console.log('Sending initialize...');

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

  setTimeout(() => {
    console.log('Sending tool call...');

    // Send tool call request
    const toolRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'search_databases',
        arguments: {
          databases: ['Scopus', 'IEEE'],
          query: 'shipbuilding optimization scheduling',
          date_range: { start: '2020', end: '2024' }
        }
      }
    };

    mcpProcess.stdin.write(JSON.stringify(toolRequest) + '\n');

    setTimeout(() => {
      console.log('Closing...');
      mcpProcess.stdin.end();
    }, 2000);
  }, 1000);
}, 1000);

// Timeout after 15 seconds
setTimeout(() => {
  mcpProcess.kill();
  console.log('Test timed out');
}, 15000);