import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OutputManager } from './utils/OutputManager.js';
import path from 'path';

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  console.error('[FATAL] Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.error('[DEBUG] Starting MCP Literature Review Server...');
console.error(`[DEBUG] Node version: ${process.version}`);
console.error(`[DEBUG] Working directory: ${process.cwd()}`);
console.error('[DEBUG] Environment variables:');
console.error(`[DEBUG] - DATABASE_URL: ${process.env.DATABASE_URL}`);
console.error(`[DEBUG] - PDF_STORAGE_PATH: ${process.env.PDF_STORAGE_PATH}`);
console.error(`[DEBUG] - OUTPUT_PATH: ${process.env.OUTPUT_PATH}`);

// Initialize OutputManager
const outputManager = new OutputManager({
  baseOutputPath: process.env.OUTPUT_PATH || path.join(process.cwd(), 'outputs'),
  generateTimestamps: true,
  organizeByType: true
});
console.error(`[DEBUG] OutputManager initialized with path: ${process.env.OUTPUT_PATH || path.join(process.cwd(), 'outputs')}`);

// Define tools array
const tools: Tool[] = [
  {
    name: 'search_databases',
    description: 'Search multiple academic databases with advanced query strategies',
    inputSchema: {
      type: 'object',
      properties: {
        databases: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of databases (Scopus, WoS, IEEE, PubMed, etc.)'
        },
        query: {
          type: 'string',
          description: 'Search query with boolean operators'
        },
        date_range: {
          type: 'object',
          properties: {
            start: { type: 'string' },
            end: { type: 'string' }
          }
        },
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific fields to search (title, abstract, keywords)'
        }
      },
      required: ['databases', 'query']
    }
  },
  {
    name: 'tier1_filtering',
    description: 'Apply Tier 1 initial filtering framework to papers',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of paper objects to filter'
        },
        criteria: {
          type: 'object',
          properties: {
            keywords: { type: 'array', items: { type: 'string' } },
            exclude_keywords: { type: 'array', items: { type: 'string' } },
            min_citations: { type: 'number' },
            journal_quality: { type: 'string' },
            language: { type: 'string' }
          }
        }
      },
      required: ['papers', 'criteria']
    }
  },
  {
    name: 'tier2_analysis',
    description: 'Perform Tier 2 advanced relevance analysis',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' }
        },
        relevance_weights: {
          type: 'object',
          properties: {
            title_weight: { type: 'number' },
            abstract_weight: { type: 'number' },
            methodology_weight: { type: 'number' },
            recency_weight: { type: 'number' }
          }
        },
        semantic_analysis: { type: 'boolean' }
      },
      required: ['papers']
    }
  },
  {
    name: 'tier3_ahp',
    description: 'Apply Tier 3 AHP-based multi-criteria decision framework',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' }
        },
        criteria: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              weight: { type: 'number' },
              sub_criteria: { type: 'array', items: { type: 'object' } }
            }
          }
        },
        pairwise_comparisons: {
          type: 'object',
          description: 'Pairwise comparison matrix'
        }
      },
      required: ['papers', 'criteria']
    }
  },
  {
    name: 'extract_methodologies',
    description: 'Extract and analyze methodologies from papers',
    inputSchema: {
      type: 'object',
      properties: {
        paper_paths: {
          type: 'array',
          items: { type: 'string' }
        },
        extraction_depth: {
          type: 'string',
          enum: ['basic', 'detailed', 'comprehensive']
        }
      },
      required: ['paper_paths']
    }
  },
  {
    name: 'identify_research_gaps',
    description: 'Identify theoretical, methodological, and practical research gaps',
    inputSchema: {
      type: 'object',
      properties: {
        analyzed_papers: {
          type: 'array',
          items: { type: 'object' }
        },
        gap_types: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['theoretical', 'methodological', 'practical', 'all']
          }
        },
        domain_context: { type: 'string' }
      },
      required: ['analyzed_papers']
    }
  },
  {
    name: 'synthesize_knowledge',
    description: 'Synthesize state of knowledge from analyzed literature',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' }
        },
        themes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key themes to focus on'
        },
        synthesis_type: {
          type: 'string',
          enum: ['narrative', 'thematic', 'chronological', 'methodological']
        }
      },
      required: ['papers', 'themes']
    }
  },
  {
    name: 'generate_chapter',
    description: 'Generate complete literature review chapter with all sections',
    inputSchema: {
      type: 'object',
      properties: {
        analysis_results: {
          type: 'object',
          description: 'Results from all analysis steps'
        },
        chapter_sections: {
          type: 'array',
          items: { type: 'string' },
          description: 'Sections to include in chapter'
        },
        format: {
          type: 'string',
          enum: ['latex', 'markdown', 'docx', 'html']
        },
        citation_style: {
          type: 'string',
          enum: ['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard']
        }
      },
      required: ['analysis_results']
    }
  },
  {
    name: 'validate_methodology',
    description: 'Validate the literature review methodology',
    inputSchema: {
      type: 'object',
      properties: {
        methodology: {
          type: 'object',
          description: 'Methodology to validate'
        },
        validation_criteria: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['methodology']
    }
  },
  {
    name: 'analyze_citations',
    description: 'Perform citation network analysis',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' }
        },
        analysis_type: {
          type: 'string',
          enum: ['co-citation', 'bibliographic-coupling', 'network-analysis']
        },
        visualize: { type: 'boolean' }
      },
      required: ['papers']
    }
  },
  {
    name: 'trend_analysis',
    description: 'Analyze research trends over time',
    inputSchema: {
      type: 'object',
      properties: {
        papers: {
          type: 'array',
          items: { type: 'object' }
        },
        time_period: {
          type: 'object',
          properties: {
            start_year: { type: 'number' },
            end_year: { type: 'number' }
          }
        },
        trend_metrics: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['papers']
    }
  },
  {
    name: 'cross_reference_databases',
    description: 'Cross-reference findings across multiple databases',
    inputSchema: {
      type: 'object',
      properties: {
        primary_results: {
          type: 'object'
        },
        secondary_databases: {
          type: 'array',
          items: { type: 'string' }
        },
        deduplication: { type: 'boolean' }
      },
      required: ['primary_results']
    }
  }
];

// Create server with proper capabilities
const server = new Server(
  {
    name: 'literature-review',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.error('[DEBUG] Creating transport...');

// Handle initialize
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[DEBUG] Initialize request received:', JSON.stringify(request));
  console.error('[DEBUG] Sending initialization response...');

  const response = {
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'literature-review',
      version: '1.0.0'
    }
  };

  console.error('[DEBUG] Initialization response:', JSON.stringify(response));
  console.error('[DEBUG] About to return initialization response...');

  return response;
});

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[DEBUG] ListTools request received');
  console.error(`[DEBUG] About to return tools list with ${tools.length} tools`);
  console.error(`[DEBUG] Tools response: ${JSON.stringify({ tools }).substring(0, 200)}...`);
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    console.error(`[DEBUG] Tool call request: ${request.params.name}`);

    const { name, arguments: args } = request.params;

    // Validate tool exists
    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    console.error(`[DEBUG] Executing tool: ${name} with args:`, JSON.stringify(args));

    // Generate mock data and save to organized output structure
    const mockResult = {
      tool: name,
      description: tool.description,
      arguments: args,
      timestamp: new Date().toISOString(),
      status: 'success',
      mockData: generateMockData(name, args)
    };

    // Save result to appropriate output directory
    let savedFilePath: string;
    try {
      savedFilePath = await saveToolResult(name, mockResult);
    } catch (saveError) {
      console.error(`[ERROR] Failed to save tool result:`, saveError);
      savedFilePath = 'Failed to save result';
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Tool "${name}" executed successfully!\n\n**Description:** ${tool.description}\n\n**Arguments received:**\n\`\`\`json\n${JSON.stringify(args, null, 2)}\n\`\`\`\n\n**Result saved to:** ${savedFilePath}\n\n**Mock Result Preview:**\n\`\`\`json\n${JSON.stringify(mockResult.mockData, null, 2).slice(0, 500)}${JSON.stringify(mockResult.mockData, null, 2).length > 500 ? '...\n```\n\n*Full results saved to file*' : '\n```'}\n\n📝 **Note:** This is a mock implementation. Full functionality will be added progressively.`
        }
      ]
    };
  } catch (error) {
    console.error(`[ERROR] Tool execution failed:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
});

// Helper function to generate mock data based on tool type
function generateMockData(toolName: string, args: any): any {
  switch (toolName) {
    case 'search_databases':
      return {
        databases: args.databases,
        query: args.query,
        totalResults: Math.floor(Math.random() * 1000) + 50,
        papers: Array.from({ length: 10 }, (_, i) => ({
          id: `paper_${i + 1}`,
          title: `Mock Paper ${i + 1} related to "${args.query}"`,
          authors: [`Author ${i + 1}`, `Co-Author ${i + 1}`],
          year: 2020 + Math.floor(Math.random() * 5),
          citations: Math.floor(Math.random() * 100),
          abstract: `This is a mock abstract for paper ${i + 1} related to the search query.`
        }))
      };

    case 'tier1_filtering':
      return {
        originalCount: Array.isArray(args.papers) ? args.papers.length : 100,
        filteredCount: Math.floor((Array.isArray(args.papers) ? args.papers.length : 100) * 0.7),
        criteria: args.criteria,
        filteredPapers: Array.from({ length: 7 }, (_, i) => ({
          id: `filtered_paper_${i + 1}`,
          title: `Filtered Paper ${i + 1}`,
          relevanceScore: 0.8 + Math.random() * 0.2
        }))
      };

    case 'tier2_analysis':
      return {
        analysisType: 'Advanced Relevance Analysis',
        papers: Array.from({ length: 5 }, (_, i) => ({
          id: `analyzed_paper_${i + 1}`,
          relevanceScore: 0.8 + Math.random() * 0.2,
          semanticScore: 0.7 + Math.random() * 0.3,
          methodologyScore: 0.6 + Math.random() * 0.4
        }))
      };

    case 'generate_chapter':
      return {
        chapterTitle: 'Literature Review Chapter',
        sections: ['Introduction', 'Methodology', 'Findings', 'Conclusion'],
        wordCount: 2500,
        citations: 45,
        format: args.format || 'markdown'
      };

    default:
      return {
        message: `Mock data for ${toolName}`,
        arguments: args,
        timestamp: new Date().toISOString()
      };
  }
}

// Helper function to save tool results to organized output
async function saveToolResult(toolName: string, result: any): Promise<string> {
  switch (toolName) {
    case 'search_databases':
      return await outputManager.saveSearchResults(
        result.arguments.databases?.[0] || 'multi-database',
        result.arguments.query || 'unknown-query',
        result.mockData
      );

    case 'tier1_filtering':
    case 'tier2_analysis':
    case 'tier3_ahp':
      return await outputManager.saveAnalysis(
        toolName.replace(/_/g, ' '),
        result.mockData
      );

    case 'generate_chapter':
      return await outputManager.saveChapter(
        result.mockData,
        result.arguments.format || 'markdown'
      );

    case 'extract_methodologies':
      return await outputManager.saveMethodologies(result.mockData);

    case 'analyze_citations':
      return await outputManager.saveCitationAnalysis(
        result.arguments.analysis_type || 'general',
        result.mockData
      );

    case 'trend_analysis':
      return await outputManager.saveTrendAnalysis(result.mockData);

    default:
      return await outputManager.saveReport(
        toolName.replace(/_/g, ' '),
        result,
        'json'
      );
  }
}

async function main() {
  try {
    console.error('[DEBUG] Creating transport...');
    const transport = new StdioServerTransport();
    console.error('[DEBUG] Transport created');

    console.error('[DEBUG] Connecting server to transport...');
    await server.connect(transport);
    console.error(`[DEBUG] Server connected successfully at: ${new Date().toISOString()}`);

    console.error('[INFO] Literature Review MCP Server started and ready to accept connections');

    // Keep the process alive but don't initialize heavy services yet
    console.error('[DEBUG] Skipping services initialization for now - focusing on MCP connection');

  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    console.error('[ERROR] Stack:', error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[FATAL] Main function failed:', error);
  console.error('[FATAL] Stack:', error.stack);
  process.exit(1);
});