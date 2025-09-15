#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📚 Testing Chapter Generation Tool');
console.log('==================================');

const serverProcess = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DATABASE_URL: 'sqlite://literature_review.db'
  }
});

let serverReady = false;

const chapterArgs = {
  analysis_results: {
    summary: "Comprehensive analysis of AI in healthcare literature from 2020-2024",
    key_themes: [
      "Machine learning applications in diagnostics",
      "Deep learning for medical imaging",
      "Natural language processing for clinical notes",
      "Ethical considerations in healthcare AI"
    ],
    research_gaps: [
      "Limited studies on AI bias in healthcare",
      "Insufficient research on patient privacy in AI systems",
      "Need for standardized evaluation metrics"
    ],
    methodology_analysis: "Most studies used quantitative approaches with limited qualitative insights",
    citation_trends: "Exponential growth in publications since 2020"
  },
  chapter_sections: [
    "Introduction",
    "Methodology",
    "Key Themes and Findings",
    "Research Gaps",
    "Future Directions",
    "Conclusion"
  ],
  format: "markdown",
  citation_style: "APA"
};

serverProcess.stderr.on('data', (data) => {
  const message = data.toString();
  console.log('[SERVER]', message.trim());

  if (message.includes('ready to accept connections') && !serverReady) {
    serverReady = true;
    console.log('\n🚀 Server ready! Sending chapter generation request...\n');

    // Initialize
    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "chapter-test", version: "1.0.0" }
      }
    };

    serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
  }
});

let initDone = false;

serverProcess.stdout.on('data', (data) => {
  const message = data.toString().trim();
  if (!message) return;

  try {
    const response = JSON.parse(message);

    if (response.id === 1 && !initDone) {
      initDone = true;
      console.log('✅ Server initialized. Calling generate_chapter tool...\n');

      // Call chapter generation tool
      const toolMessage = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "generate_chapter",
          arguments: chapterArgs
        }
      };

      serverProcess.stdin.write(JSON.stringify(toolMessage) + '\n');

    } else if (response.id === 2) {
      console.log('📖 CHAPTER GENERATION RESULT:');
      console.log('============================');

      if (response.result && response.result.content) {
        response.result.content.forEach(item => {
          if (item.type === 'text') {
            console.log(item.text);
          }
        });
      } else {
        console.log(JSON.stringify(response.result, null, 2));
      }

      console.log('\n🎉 Chapter generation completed!');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    }
  } catch (e) {
    // Not JSON, ignore
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Timeout - killing process');
  serverProcess.kill('SIGTERM');
  process.exit(1);
}, 15000);