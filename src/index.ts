import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OutputManager } from './utils/OutputManager.js';
import { getResearchContextLoader } from './utils/ResearchContextLoader.js';
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
  },
  {
    name: 'generate_presentation',
    description: 'Generate academic presentation slides from literature review analysis',
    inputSchema: {
      type: 'object',
      properties: {
        analysis_results: {
          type: 'object',
          description: 'Results from literature review analysis'
        },
        presentation_type: {
          type: 'string',
          enum: ['conference', 'thesis-defense', 'research-proposal', 'progress-update'],
          description: 'Type of presentation to generate'
        },
        duration: {
          type: 'number',
          description: 'Presentation duration in minutes'
        },
        audience: {
          type: 'string',
          enum: ['academic', 'industry', 'mixed', 'students'],
          description: 'Target audience for the presentation'
        },
        format: {
          type: 'string',
          enum: ['powerpoint', 'reveal.js', 'beamer', 'google-slides'],
          description: 'Output format for slides'
        },
        sections: {
          type: 'array',
          items: { type: 'string' },
          description: 'Sections to include in presentation'
        },
        include_visuals: {
          type: 'boolean',
          description: 'Whether to include charts and visualizations'
        }
      },
      required: ['analysis_results', 'presentation_type']
    }
  },
  {
    name: 'generate_paper_summary',
    description: 'Generate structured summary from academic paper capturing unique methodologies, evidence, limitations, and findings. AUTOMATICALLY applies research context to identify: (1) Outfitting stage (Block vs Post-Launch), (2) Stage-specific limitations, (3) Transferability issues. IMPORTANT: Accurately describe what THIS specific paper actually does - do not assume papers "combine" methods unless explicitly stated. Each paper has unique contributions.',
    inputSchema: {
      type: 'object',
      properties: {
        paper_path: {
          type: 'string',
          description: 'Path to the PDF paper file'
        },
        theme: {
          type: 'string',
          description: 'Research theme/category (e.g., "Spatial Optimisation & Outfitting Constraints")'
        },
        focus_areas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific areas to focus on when extracting information (e.g., methodology, algorithms, simulation, optimization)'
        },
        output_format: {
          type: 'string',
          enum: ['markdown', 'powerpoint', 'html', 'latex'],
          description: 'Output format for the summary'
        },
        include_sections: {
          type: 'object',
          properties: {
            evidence: { type: 'boolean' },
            tools_and_methods: { type: 'boolean' },
            limitations: { type: 'boolean' },
            findings: { type: 'boolean' },
            outfitting_stage: { type: 'boolean', description: 'Include outfitting stage classification (Block/Post-Launch)' }
          },
          description: 'Sections to include in summary'
        }
      },
      required: ['paper_path', 'theme']
    }
  },
  {
    name: 'get_research_context',
    description: 'Retrieve the research context including domain understanding, literature distribution, identified gaps, and analysis guidelines. Use this to understand the Block vs Post-Launch outfitting distinction and the 80/20 literature gap.',
    inputSchema: {
      type: 'object',
      properties: {
        context_type: {
          type: 'string',
          enum: ['full', 'domain', 'gaps', 'guidelines', 'distribution'],
          description: 'Type of context to retrieve'
        }
      }
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
    const mockData = await generateMockData(name, args);
    const mockResult = {
      tool: name,
      description: tool.description,
      arguments: args,
      timestamp: new Date().toISOString(),
      status: 'success',
      mockData: mockData
    };

    // Save result to appropriate output directory
    let savedFilePath: string;
    try {
      savedFilePath = await saveToolResult(name, mockResult);
    } catch (saveError) {
      console.error(`[ERROR] Failed to save tool result:`, saveError);
      savedFilePath = 'Failed to save result';
    }

    console.error(`[DEBUG] Tool response prepared, returning response`);

    // Return just the mock data directly
    return {
      content: [
        {
          type: 'text' as const,
          text: `Tool executed: ${name}\n\nResults: ${JSON.stringify(mockResult.mockData, null, 2)}`
        }
      ]
    };

  } catch (error) {
    console.error(`[ERROR] Tool execution failed:`, error);
    const errorResponse = {
      content: [
        {
          type: 'text' as const,
          text: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };

    console.error(`[DEBUG] Error response prepared, returning error response`);
    return errorResponse;
  }
});

// Helper function to generate mock data based on tool type
async function generateMockData(toolName: string, args: any): Promise<any> {
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

    case 'generate_presentation':
      const slideCount = Math.floor((args.duration || 20) / 2); // ~2 minutes per slide
      return {
        presentationType: args.presentation_type,
        title: `Literature Review Presentation: ${args.presentation_type}`,
        duration: args.duration || 20,
        audience: args.audience || 'academic',
        format: args.format || 'powerpoint',
        slideCount: slideCount,
        sections: args.sections || ['Introduction', 'Methodology', 'Key Findings', 'Research Gaps', 'Conclusions'],
        slides: Array.from({ length: slideCount }, (_, i) => ({
          slideNumber: i + 1,
          title: `Slide ${i + 1}`,
          content: `Content for slide ${i + 1} in ${args.presentation_type} presentation`,
          notes: `Speaker notes for slide ${i + 1}`,
          visualElements: args.include_visuals ? [`Chart ${i + 1}`, `Figure ${i + 1}`] : []
        })),
        estimatedReadingTime: `${slideCount * 2} minutes`,
        includeVisuals: args.include_visuals || false
      };

    case 'generate_paper_summary':
      return {
        paperPath: args.paper_path,
        theme: args.theme,
        format: args.output_format || 'markdown',
        summary: {
          evidence: {
            paperTitle: 'Extracted from PDF: [Paper Title]',
            authors: ['Author 1', 'Author 2'],
            year: 2024,
            keyPoints: [
              'Main contribution or finding 1',
              'Main contribution or finding 2',
              'Methodological approach description'
            ],
            pageReferences: ['Pg. 83', 'Pg. 84']
          },
          toolsAndMethods: {
            primary: [
              {
                name: 'Primary Method/Tool',
                description: 'Detailed description of the method or tool used',
                application: 'How it was applied in the study'
              }
            ],
            secondary: [
              {
                name: 'Supporting Method/Tool',
                description: 'Additional methods used',
                application: 'Supporting role in the research'
              }
            ]
          },
          limitations: [
            'Identified limitation 1',
            'Identified limitation 2',
            'Scope or methodological constraint'
          ],
          preliminaryFindings: {
            theme: args.theme,
            findings: [
              'Key finding 1 with quantitative result',
              'Key finding 2 with comparative analysis',
              'Key finding 3 with practical implications'
            ],
            metrics: {
              performanceIndicators: ['Metric 1', 'Metric 2'],
              comparisons: ['Baseline vs proposed approach']
            }
          }
        },
        extractionMetadata: {
          extractedAt: new Date().toISOString(),
          focusAreas: args.focus_areas || ['methodology', 'results', 'limitations'],
          sectionsIncluded: args.include_sections || {
            evidence: true,
            tools_and_methods: true,
            limitations: true,
            findings: true
          }
        }
      };

    case 'get_research_context':
      // Dynamically load research context from research-context.md file
      const contextLoader = getResearchContextLoader(path.join(process.cwd(), 'research-context.md'));
      const requestedContextType = args.context_type || 'full';

      try {
        const dynamicContext = await contextLoader.getFilteredContext(requestedContextType);
        return {
          source: 'research-context.md',
          loadedAt: new Date().toISOString(),
          contextType: requestedContextType,
          ...dynamicContext
        };
      } catch (error) {
        console.error('[ERROR] Failed to load research context:', error);
        // Fallback to indicate error
        return {
          error: 'Failed to load research context from file',
          message: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Ensure research-context.md exists in the project root'
        };
      }

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

    case 'generate_presentation':
      return await outputManager.savePresentation(
        result.mockData,
        result.arguments.format || 'powerpoint'
      );

    case 'generate_paper_summary':
      return await outputManager.savePaperSummary(
        result.mockData,
        result.arguments.theme || 'general',
        result.arguments.output_format || 'markdown'
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

    case 'get_research_context':
      return await outputManager.saveReport(
        'research-context',
        result.mockData,
        'json'
      );

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