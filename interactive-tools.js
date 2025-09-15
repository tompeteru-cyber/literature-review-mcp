#!/usr/bin/env node

/**
 * Interactive literature review tools
 * Use your MCP tools directly from command line
 */

import { testTool } from './test-tool.js';

const AVAILABLE_TOOLS = {
  '1': {
    name: 'search_databases',
    description: 'Search academic databases',
    example: {
      databases: ['Scopus', 'IEEE', 'PubMed'],
      query: 'machine learning AND healthcare',
      date_range: { start: '2020', end: '2024' }
    }
  },
  '2': {
    name: 'tier1_filtering',
    description: 'Apply initial filtering to papers',
    example: {
      papers: [{ title: 'Sample Paper', citations: 50 }],
      criteria: {
        keywords: ['AI', 'healthcare'],
        min_citations: 10,
        language: 'English'
      }
    }
  },
  '3': {
    name: 'tier2_analysis',
    description: 'Advanced relevance analysis',
    example: {
      papers: [{ title: 'Sample Paper', abstract: 'This paper discusses...' }],
      relevance_weights: {
        title_weight: 0.3,
        abstract_weight: 0.5,
        methodology_weight: 0.2
      }
    }
  },
  '4': {
    name: 'identify_research_gaps',
    description: 'Identify research gaps',
    example: {
      analyzed_papers: [{ title: 'Paper 1', methodology: 'Survey' }],
      gap_types: ['theoretical', 'methodological'],
      domain_context: 'Healthcare AI'
    }
  },
  '5': {
    name: 'generate_chapter',
    description: 'Generate literature review chapter',
    example: {
      analysis_results: { summary: 'Key findings from analysis' },
      format: 'markdown',
      citation_style: 'APA'
    }
  }
};

function showMenu() {
  console.log('\n📚 Literature Review Tools - Interactive Mode');
  console.log('================================================');
  Object.entries(AVAILABLE_TOOLS).forEach(([key, tool]) => {
    console.log(`${key}. ${tool.name} - ${tool.description}`);
  });
  console.log('q. Quit');
  console.log('================================================');
}

async function runInteractive() {
  showMenu();

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  while (true) {
    const choice = await question('\nSelect a tool (1-5) or q to quit: ');

    if (choice.toLowerCase() === 'q') {
      console.log('👋 Goodbye!');
      rl.close();
      break;
    }

    const tool = AVAILABLE_TOOLS[choice];
    if (!tool) {
      console.log('❌ Invalid choice. Please select 1-5 or q.');
      continue;
    }

    console.log(`\n🔧 Running: ${tool.name}`);
    console.log(`📝 Description: ${tool.description}`);
    console.log(`📋 Example arguments:`, JSON.stringify(tool.example, null, 2));

    const useExample = await question('Use example arguments? (y/n): ');

    let args = tool.example;
    if (useExample.toLowerCase() !== 'y') {
      console.log('📝 Enter custom arguments as JSON (or press Enter for example):');
      const customArgs = await question('Arguments: ');
      if (customArgs.trim()) {
        try {
          args = JSON.parse(customArgs);
        } catch (e) {
          console.log('❌ Invalid JSON, using example arguments');
        }
      }
    }

    try {
      console.log('\n⏳ Running tool...');
      await testTool(tool.name, args);
    } catch (error) {
      console.error('❌ Tool execution failed:', error.message);
    }
  }
}

// Run interactive mode
runInteractive().catch(console.error);