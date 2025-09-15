import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { LiteratureProcessor } from './services/LiteratureProcessor.js';
import { TierFilteringSystem } from './services/TierFilteringSystem.js';
import { AHPAnalyzer } from './services/AHPAnalyzer.js';
import { ResearchGapAnalyzer } from './services/ResearchGapAnalyzer.js';
import { KnowledgeSynthesizer } from './services/KnowledgeSynthesizer.js';
import { DatabaseManager } from './services/DatabaseManager.js';
import { ChapterGenerator } from './services/ChapterGenerator.js';

// Initialize services
const dbManager = new DatabaseManager(process.env.DATABASE_URL || '');
const literatureProcessor = new LiteratureProcessor(dbManager);
const tierFilter = new TierFilteringSystem();
const ahpAnalyzer = new AHPAnalyzer();
const gapAnalyzer = new ResearchGapAnalyzer();
const synthesizer = new KnowledgeSynthesizer();
const chapterGen = new ChapterGenerator();

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

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_databases':
        const searchResults = await literatureProcessor.searchDatabases(
          args.databases,
          args.query,
          args.date_range,
          args.fields
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(searchResults, null, 2)
          }]
        };

      case 'tier1_filtering':
        const tier1Results = await tierFilter.applyTier1(
          args.papers,
          args.criteria
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(tier1Results, null, 2)
          }]
        };

      case 'tier2_analysis':
        const tier2Results = await tierFilter.applyTier2(
          args.papers,
          args.relevance_weights,
          args.semantic_analysis
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(tier2Results, null, 2)
          }]
        };

      case 'tier3_ahp':
        const ahpResults = await ahpAnalyzer.performAHP(
          args.papers,
          args.criteria,
          args.pairwise_comparisons
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(ahpResults, null, 2)
          }]
        };

      case 'extract_methodologies':
        const methodologies = await literatureProcessor.extractMethodologies(
          args.paper_paths,
          args.extraction_depth
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(methodologies, null, 2)
          }]
        };

      case 'identify_research_gaps':
        const gaps = await gapAnalyzer.identifyGaps(
          args.analyzed_papers,
          args.gap_types || ['all'],
          args.domain_context
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(gaps, null, 2)
          }]
        };

      case 'synthesize_knowledge':
        const synthesis = await synthesizer.synthesize(
          args.papers,
          args.themes,
          args.synthesis_type
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(synthesis, null, 2)
          }]
        };

      case 'generate_chapter':
        const chapter = await chapterGen.generateChapter(
          args.analysis_results,
          args.chapter_sections,
          args.format || 'markdown',
          args.citation_style || 'APA'
        );
        return {
          content: [{
            type: 'text',
            text: chapter
          }]
        };

      case 'validate_methodology':
        const validation = await literatureProcessor.validateMethodology(
          args.methodology,
          args.validation_criteria
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(validation, null, 2)
          }]
        };

      case 'analyze_citations':
        const citationAnalysis = await literatureProcessor.analyzeCitations(
          args.papers,
          args.analysis_type,
          args.visualize
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(citationAnalysis, null, 2)
          }]
        };

      case 'trend_analysis':
        const trends = await synthesizer.analyzeTrends(
          args.papers,
          args.time_period,
          args.trend_metrics
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(trends, null, 2)
          }]
        };

      case 'cross_reference_databases':
        const crossRef = await literatureProcessor.crossReference(
          args.primary_results,
          args.secondary_databases,
          args.deduplication
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
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Literature Review MCP Server started');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
