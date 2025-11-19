#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

// Paper 7 details
const paper7Path = String.raw`C:\Users\Tompe\OneDrive - University of Strathclyde (1)\PhD Files\2025\09 - SEPTEMBER\Week 3\Spatial Optimisation & Outfitting Constraints Papers\7 Modelling and Simulation of Ship Block Production Scheduling Optimization Problem Considering the Multiple Resources Constraints.pdf`;

const testCall = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "generate_paper_summary",
    arguments: {
      paper_path: paper7Path,
      theme: "Spatial Optimisation and Outfitting Constraints",
      focus_areas: [
        "Optimization methods",
        "Resource constraints",
        "Simulation approaches",
        "Scheduling algorithms",
        "Multiple resources"
      ],
      output_format: "markdown",
      include_sections: {
        evidence: true,
        tools_and_methods: true,
        limitations: true,
        findings: true
      }
    }
  }
};

console.log('Generating summary for Paper 7...');
console.log('Paper path:', paper7Path);
console.log('Request:', JSON.stringify(testCall, null, 2));

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send initialization
const init = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};

server.stdin.write(JSON.stringify(init) + '\n');

// Wait for initialization, then send test call
setTimeout(() => {
  server.stdin.write(JSON.stringify(testCall) + '\n');
}, 1000);

// Handle responses
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Response:', JSON.stringify(response, null, 2));

      if (response.id === 1) {
        console.log('\n✅ Paper 7 summary generation completed!');
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      // Ignore non-JSON lines (debug output)
    }
  });
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
});

// Timeout after 30 seconds (PDF processing can take time)
setTimeout(() => {
  console.log('❌ Test timeout');
  server.kill();
  process.exit(1);
}, 30000);
