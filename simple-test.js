#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing MCP server...');

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
    console.log('Sending list tools...');

    // Send list tools request
    const listRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    mcpProcess.stdin.write(JSON.stringify(listRequest) + '\n');

    setTimeout(() => {
      console.log('Closing...');
      mcpProcess.stdin.end();
    }, 1000);
  }, 1000);
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  mcpProcess.kill();
  console.log('Test timed out');
}, 10000);