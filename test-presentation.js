#!/usr/bin/env node

import { spawn } from 'child_process';

// Test data for presentation generation
const testCall = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "generate_presentation",
    arguments: {
      analysis_results: {
        papers_analyzed: 45,
        research_gaps: ['Gap 1', 'Gap 2'],
        key_findings: ['Finding 1', 'Finding 2']
      },
      presentation_type: "thesis-defense",
      duration: 30,
      audience: "academic",
      format: "reveal.js",
      sections: ["Introduction", "Literature Review", "Methodology", "Findings", "Research Gaps", "Conclusions"],
      include_visuals: true
    }
  }
};

console.log('Testing presentation generation...');
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
        console.log('\n✅ Presentation generation test completed!');
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

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Test timeout');
  server.kill();
  process.exit(1);
}, 10000);