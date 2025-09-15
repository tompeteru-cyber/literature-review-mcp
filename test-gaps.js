#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Research Gap Identification Tool');
console.log('==========================================');

const serverProcess = spawn('node', [path.join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DATABASE_URL: 'sqlite://literature_review.db'
  }
});

let serverReady = false;

const gapAnalysisArgs = {
  analyzed_papers: [
    {
      title: "Machine Learning in Medical Diagnosis: A Systematic Review",
      authors: ["Smith, J.", "Johnson, A."],
      year: 2023,
      methodology: "Systematic review",
      domain: "Healthcare AI",
      key_findings: "ML models show 85% accuracy in diagnostic tasks",
      limitations: "Limited diversity in training datasets",
      sample_size: "50 studies reviewed"
    },
    {
      title: "Deep Learning for Radiology: Current Applications",
      authors: ["Chen, L.", "Wilson, R."],
      year: 2022,
      methodology: "Literature review",
      domain: "Medical imaging",
      key_findings: "CNN architectures dominate radiology applications",
      limitations: "Lack of explainability in deep learning models",
      sample_size: "30 papers analyzed"
    },
    {
      title: "AI Ethics in Healthcare: A Comparative Study",
      authors: ["Brown, M.", "Davis, K."],
      year: 2024,
      methodology: "Comparative analysis",
      domain: "Healthcare ethics",
      key_findings: "Significant variation in ethical frameworks across institutions",
      limitations: "Small sample size from developed countries only",
      sample_size: "12 healthcare institutions"
    },
    {
      title: "Natural Language Processing in Clinical Notes",
      authors: ["Garcia, P.", "Kim, S."],
      year: 2023,
      methodology: "Experimental study",
      domain: "Clinical NLP",
      key_findings: "NER models achieve 92% accuracy on medical entities",
      limitations: "Limited to English language clinical notes",
      sample_size: "10,000 clinical notes"
    }
  ],
  gap_types: ["theoretical", "methodological", "practical"],
  domain_context: "AI applications in healthcare and medical research"
};

serverProcess.stderr.on('data', (data) => {
  const message = data.toString();
  console.log('[SERVER]', message.trim());

  if (message.includes('ready to accept connections') && !serverReady) {
    serverReady = true;
    console.log('\n🚀 Server ready! Analyzing research gaps...\n');

    // Initialize
    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "gap-analysis", version: "1.0.0" }
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
      console.log('✅ Server initialized. Running research gap identification...\n');

      // Call research gap identification tool
      const toolMessage = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "identify_research_gaps",
          arguments: gapAnalysisArgs
        }
      };

      serverProcess.stdin.write(JSON.stringify(toolMessage) + '\n');

    } else if (response.id === 2) {
      console.log('🔍 RESEARCH GAP ANALYSIS RESULT:');
      console.log('================================');

      if (response.result && response.result.content) {
        response.result.content.forEach(item => {
          if (item.type === 'text') {
            console.log(item.text);
          }
        });
      } else {
        console.log(JSON.stringify(response.result, null, 2));
      }

      console.log('\n🎯 Gap identification analysis completed!');
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