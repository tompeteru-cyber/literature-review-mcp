// Test script for MCP Literature Review tools
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

async function testTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ output, errorOutput });
      } else {
        reject(new Error(`Process exited with code ${code}\nError: ${errorOutput}`));
      }
    });

    // Send MCP message
    const message = JSON.stringify({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    mcpProcess.stdin.write(message + '\n');
    mcpProcess.stdin.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('Timeout'));
    }, 10000);
  });
}

// Example usage
async function runTests() {
  try {
    console.log('🔍 Testing search_databases...');
    const searchResult = await testTool('search_databases', {
      databases: ['Scopus', 'IEEE'],
      query: 'shipbuilding optimization scheduling',
      date_range: { start: '2020', end: '2024' }
    });
    console.log('✅ Search completed');

    console.log('\n📊 Testing tier1_filtering...');
    const filterResult = await testTool('tier1_filtering', {
      papers: [{id: 1, title: 'Test Paper'}],
      criteria: {
        keywords: ['optimization', 'scheduling'],
        min_citations: 5
      }
    });
    console.log('✅ Filtering completed');

    console.log('\n📈 Testing trend_analysis...');
    const trendResult = await testTool('trend_analysis', {
      papers: [{id: 1, year: 2023, title: 'Test Paper'}],
      time_period: { start_year: 2020, end_year: 2024 }
    });
    console.log('✅ Trend analysis completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();