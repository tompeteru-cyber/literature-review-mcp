import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LiteratureProcessor } from './services/LiteratureProcessor.js';
import { TierFilteringSystem } from './services/TierFilteringSystem.js';
import { AHPAnalyzer } from './services/AHPAnalyzer.js';
import { ResearchGapAnalyzer } from './services/ResearchGapAnalyzer.js';
import { KnowledgeSynthesizer } from './services/KnowledgeSynthesizer.js';
import { DatabaseManager } from './services/DatabaseManager.js';
import { ChapterGenerator } from './services/ChapterGenerator.js';

// Initialize services with error handling
let dbManager: DatabaseManager;
let literatureProcessor: LiteratureProcessor;
let tierFilter: TierFilteringSystem;
let ahpAnalyzer: AHPAnalyzer;
let gapAnalyzer: ResearchGapAnalyzer;
let synthesizer: KnowledgeSynthesizer;
let chapterGen: ChapterGenerator;

async function initializeServices() {
  try {
    console.error('[DEBUG] Creating DatabaseManager...');
    dbManager = new DatabaseManager(process.env.DATABASE_URL || '');
    console.error('[DEBUG] Initializing DatabaseManager...');
    await dbManager.initialize(process.env.DATABASE_URL || '');
    console.error('[DEBUG] DatabaseManager initialized successfully');

    console.error('[DEBUG] Initializing LiteratureProcessor...');
    literatureProcessor = new LiteratureProcessor(dbManager);
    console.error('[DEBUG] LiteratureProcessor initialized successfully');

    console.error('[DEBUG] Initializing TierFilteringSystem...');
    tierFilter = new TierFilteringSystem();
    console.error('[DEBUG] TierFilteringSystem initialized successfully');

    console.error('[DEBUG] Initializing AHPAnalyzer...');
    ahpAnalyzer = new AHPAnalyzer();
    console.error('[DEBUG] AHPAnalyzer initialized successfully');

    console.error('[DEBUG] Initializing ResearchGapAnalyzer...');
    gapAnalyzer = new ResearchGapAnalyzer();
    console.error('[DEBUG] ResearchGapAnalyzer initialized successfully');

    console.error('[DEBUG] Initializing KnowledgeSynthesizer...');
    synthesizer = new KnowledgeSynthesizer();
    console.error('[DEBUG] KnowledgeSynthesizer initialized successfully');

    console.error('[DEBUG] Initializing ChapterGenerator...');
    chapterGen = new ChapterGenerator();
    console.error('[DEBUG] ChapterGenerator initialized successfully');

    console.error('[DEBUG] All services initialized successfully');
  } catch (error) {
    console.error('[ERROR] Failed to initialize services:', error);
    console.error('[ERROR] Services initialization stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to be caught by the promise handler
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: 'literature-review-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Add server event logging
server.onclose = () => {
  console.error('[DEBUG] Server connection closed');
};

server.onerror = (error) => {
  console.error('[ERROR] Server error:', error);
};

// Define comprehensive tool set
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
        primary_results: { type: 'object' },
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

// Handle initialization
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[DEBUG] Initialize request received:', JSON.stringify(request.params));
  console.error('[DEBUG] Sending initialization response...');

  const response = {
    capabilities: {
      tools: {},
      resources: {}
    },
    serverInfo: {
      name: 'literature-review-mcp',
      version: '1.0.0'
    }
  };

  console.error('[DEBUG] Initialization response:', JSON.stringify(response));
  return response;
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[DEBUG] ListTools request received');
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error('[DEBUG] CallTool request received:', request.params.name);
  const { name, arguments: args } = request.params;

  try {
    // Ensure all services are initialized
    if (!dbManager || !literatureProcessor || !tierFilter || !ahpAnalyzer || !gapAnalyzer || !synthesizer || !chapterGen) {
      throw new Error('Services not properly initialized');
    }

    switch (name) {
      case 'search_databases':
        const searchResults = await literatureProcessor.searchDatabases(
          args.databases as string[],
          args.query as string,
          args.date_range as { start: string; end: string },
          args.fields as string[]
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(searchResults, null, 2)
          }]
        };

      case 'tier1_filtering':
        const tier1Results = await tierFilter.applyTier1(
          args.papers as any[],
          args.criteria as any
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(tier1Results, null, 2)
          }]
        };

      case 'tier2_analysis':
        const tier2Results = await tierFilter.applyTier2(
          args.papers as any[],
          args.relevance_weights as any,
          args.semantic_analysis as boolean
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(tier2Results, null, 2)
          }]
        };

      case 'tier3_ahp':
        const ahpResults = await ahpAnalyzer.performAHP(
          args.papers as any[],
          args.criteria as any[],
          args.pairwise_comparisons as any
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(ahpResults, null, 2)
          }]
        };

      case 'extract_methodologies':
        const methodologies = await literatureProcessor.extractMethodologies(
          args.paper_paths as string[],
          args.extraction_depth as string
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(methodologies, null, 2)
          }]
        };

      case 'identify_research_gaps':
        const gaps = await gapAnalyzer.identifyGaps(
          args.analyzed_papers as any[],
          (args.gap_types as string[]) || ['all'],
          args.domain_context as string
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(gaps, null, 2)
          }]
        };

      case 'synthesize_knowledge':
        const synthesis = await synthesizer.synthesize(
          args.papers as any[],
          args.themes as string[],
          args.synthesis_type as string
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(synthesis, null, 2)
          }]
        };

      case 'generate_chapter':
        const chapter = await chapterGen.generateChapter(
          args.analysis_results as string[],
          args.chapter_sections as string[],
          (args.format as string) || 'markdown',
          (args.citation_style as string) || 'APA'
        );
        return {
          content: [{
            type: 'text',
            text: chapter
          }]
        };

      case 'validate_methodology':
        const validation = await literatureProcessor.validateMethodology(
          args.methodology as string,
          args.validation_criteria as string[]
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(validation, null, 2)
          }]
        };

      case 'analyze_citations':
        const citationAnalysis = await literatureProcessor.analyzeCitations(
          args.papers as any[],
          args.analysis_type as string,
          args.visualize as boolean
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(citationAnalysis, null, 2)
          }]
        };

      case 'trend_analysis':
        const trends = await synthesizer.analyzeTrends(
          args.papers as any[],
          args.time_period as { start_year: number; end_year: number },
          args.trend_metrics as string[]
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(trends, null, 2)
          }]
        };

      case 'cross_reference_databases':
        const crossRef = await literatureProcessor.crossReference(
          args.primary_results as string[],
          args.secondary_databases as string[],
          args.deduplication as boolean
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(crossRef, null, 2)
          }]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('[ERROR] Tool execution failed:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }],
      isError: true
    };
  }
});

// Flag to track initialization status
let servicesInitialized = false;

// Start the server
async function main() {
  try {
    console.error('[DEBUG] Starting MCP Literature Review Server...');
    console.error('[DEBUG] Node version:', process.version);
    console.error('[DEBUG] Working directory:', process.cwd());
    console.error('[DEBUG] Environment variables:');
    console.error('[DEBUG] - DATABASE_URL:', process.env.DATABASE_URL || 'not set');
    console.error('[DEBUG] - PDF_STORAGE_PATH:', process.env.PDF_STORAGE_PATH || 'not set');
    console.error('[DEBUG] - OUTPUT_PATH:', process.env.OUTPUT_PATH || 'not set');

    console.error('[DEBUG] Creating transport...');
    const transport = new StdioServerTransport();

    // Add more detailed transport event logging
    transport.onclose = () => {
      console.error('[DEBUG] Transport connection closed at:', new Date().toISOString());
    };

    transport.onerror = (error) => {
      console.error('[ERROR] Transport error at:', new Date().toISOString(), error);
    };

    console.error('[DEBUG] Connecting server to transport...');
    await server.connect(transport);

    console.error('[DEBUG] Server connected successfully at:', new Date().toISOString());
    console.error('[INFO] Literature Review MCP Server started and ready to accept connections');

    // Initialize services AFTER MCP connection is established
    console.error('[DEBUG] Skipping services initialization for now - focusing on MCP connection');
    // TODO: Re-enable services initialization once MCP connection is stable
    /*
    initializeServices().then(() => {
      console.error('[DEBUG] Services initialization completed');
      servicesInitialized = true;
    }).catch((error) => {
      console.error('[ERROR] Services initialization failed:', error);
      console.error('[ERROR] Services initialization stack:', error?.stack);
      // Don't exit on service initialization failure - server should still work for basic operations
    });
    */

    // Add a heartbeat to show server is alive
    const heartbeat = setInterval(() => {
      console.error('[HEARTBEAT] Server running at:', new Date().toISOString());
    }, 10000); // Every 10 seconds

    // Keep the process alive and handle shutdown
    process.stdin.resume();

    // Cleanup on exit
    process.on('exit', () => {
      clearInterval(heartbeat);
      console.error('[INFO] Server shutting down...');
    });

  } catch (error) {
    console.error('[ERROR] Failed to start MCP server:', error);
    console.error('[ERROR] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception - this will cause server exit:', error);
  console.error('[FATAL] Stack trace:', error.stack);
  console.error('[FATAL] Process will exit in 1 second...');
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection - this will cause server exit at:', promise, 'reason:', reason);
  console.error('[FATAL] Process will exit in 1 second...');
  setTimeout(() => process.exit(1), 1000);
});

// Handle SIGINT and SIGTERM gracefully
process.on('SIGINT', () => {
  console.error('[INFO] Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('[INFO] Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  console.error('[ERROR] Main function failed:', error);
  process.exit(1);
});
