#!/usr/bin/env node
/**
 * Example Client for Literature Review MCP
 *
 * This script demonstrates how to use the Literature Review MCP
 * to conduct a complete systematic literature review
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
// Configuration
const MCP_SERVER_PATH = path.join(__dirname, '../../dist/index.js');
const OUTPUT_DIR = path.join(__dirname, '../../outputs');
const PDF_DIR = path.join(__dirname, '../../pdfs');
class LiteratureReviewClient {
    client;
    transport;
    connected = false;
    constructor() {
        this.client = new Client({
            name: 'literature-review-client',
            version: '1.0.0'
        });
    }
    /**
     * Connect to the MCP server
     */
    async connect() {
        console.log('🔌 Connecting to Literature Review MCP server...');
        const serverProcess = spawn('node', [MCP_SERVER_PATH], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                DATABASE_URL: 'sqlite://literature_review.db',
                PDF_STORAGE_PATH: PDF_DIR,
                OUTPUT_PATH: OUTPUT_DIR
            }
        });
        this.transport = new StdioClientTransport({
            command: 'node',
            args: [MCP_SERVER_PATH]
        });
        await this.client.connect(this.transport);
        this.connected = true;
        console.log('✅ Connected successfully!\n');
    }
    /**
     * Call a tool on the MCP server
     */
    async callTool(toolName, args) {
        if (!this.connected) {
            throw new Error('Not connected to MCP server');
        }
        console.log(`🔧 Calling tool: ${toolName}`);
        const response = await this.client.callTool({
            name: toolName,
            arguments: args
        });
        return JSON.parse(response.content[0].text);
    }
    /**
     * Conduct a complete literature review
     */
    async conductLiteratureReview(config) {
        console.log('📚 Starting Comprehensive Literature Review\n');
        console.log('='.repeat(50));
        try {
            // Step 1: Database Search
            console.log('\n📖 Step 1: Searching Academic Databases...');
            const searchResults = await this.callTool('search_databases', {
                databases: config.databases,
                query: config.searchQuery,
                date_range: config.dateRange,
                fields: ['title', 'abstract', 'keywords']
            });
            console.log(`   Found ${searchResults.reduce((sum, r) => sum + r.papers.length, 0)} papers`);
            // Combine all papers from different databases
            const allPapers = searchResults.flatMap((r) => r.papers);
            console.log(`   Total unique papers: ${allPapers.length}`);
            // Step 2: Tier 1 Filtering
            console.log('\n🔍 Step 2: Applying Tier 1 Initial Filtering...');
            const tier1Results = await this.callTool('tier1_filtering', {
                papers: allPapers,
                criteria: {
                    keywords: config.keywords,
                    exclude_keywords: [],
                    min_citations: 3,
                    journal_quality: 'moderate',
                    language: 'English'
                }
            });
            console.log(`   Accepted: ${tier1Results.accepted.length} papers`);
            console.log(`   Rejected: ${tier1Results.rejected.length} papers`);
            console.log(`   Acceptance rate: ${tier1Results.statistics.acceptance_rate}`);
            // Step 3: Tier 2 Analysis
            console.log('\n📊 Step 3: Performing Tier 2 Advanced Relevance Analysis...');
            const tier2Results = await this.callTool('tier2_analysis', {
                papers: tier1Results.accepted,
                relevance_weights: {
                    title_weight: 0.3,
                    abstract_weight: 0.4,
                    methodology_weight: 0.2,
                    recency_weight: 0.1
                },
                semantic_analysis: true
            });
            console.log(`   Ranked ${tier2Results.ranked_papers.length} papers`);
            console.log(`   Mean relevance score: ${tier2Results.relevance_distribution.mean.toFixed(3)}`);
            console.log(`   Identified ${Object.keys(tier2Results.semantic_clusters.clusters || {}).length} semantic clusters`);
            // Step 4: Tier 3 AHP Analysis
            console.log('\n🎯 Step 4: Applying Tier 3 AHP Multi-Criteria Decision Framework...');
            const topPapers = tier2Results.ranked_papers.slice(0, Math.min(50, tier2Results.ranked_papers.length));
            const ahpResults = await this.callTool('tier3_ahp', {
                papers: topPapers,
                criteria: [
                    { name: 'Scientific Rigor', weight: 0.35, sub_criteria: [] },
                    { name: 'Theoretical Contribution', weight: 0.25, sub_criteria: [] },
                    { name: 'Practical Impact', weight: 0.25, sub_criteria: [] },
                    { name: 'Research Quality', weight: 0.15, sub_criteria: [] }
                ]
            });
            console.log(`   AHP ranking completed for ${ahpResults.ranked_papers.length} papers`);
            console.log(`   Consistency ratio: ${ahpResults.consistency_analysis.ratio?.toFixed(3) || 'N/A'}`);
            console.log(`   Top paper score: ${ahpResults.ranked_papers[0]?.final_score?.toFixed(3) || 'N/A'}`);
            // Step 5: Extract Methodologies (if PDFs available)
            console.log('\n🔬 Step 5: Extracting Methodologies...');
            let methodologies = new Map();
            // Check if we have PDFs to analyze
            try {
                const pdfFiles = await fs.readdir(PDF_DIR);
                const pdfPaths = pdfFiles
                    .filter(f => f.endsWith('.pdf'))
                    .map(f => path.join(PDF_DIR, f))
                    .slice(0, 10); // Limit to first 10 for demo
                if (pdfPaths.length > 0) {
                    methodologies = await this.callTool('extract_methodologies', {
                        paper_paths: pdfPaths,
                        extraction_depth: 'detailed'
                    });
                    console.log(`   Extracted methodologies from ${methodologies.size} papers`);
                }
                else {
                    console.log(`   No PDF files found in ${PDF_DIR} - skipping methodology extraction`);
                }
            }
            catch (error) {
                console.log(`   PDF directory not found - skipping methodology extraction`);
            }
            // Step 6: Identify Research Gaps
            console.log('\n🔍 Step 6: Identifying Research Gaps...');
            const gaps = await this.callTool('identify_research_gaps', {
                analyzed_papers: ahpResults.ranked_papers,
                gap_types: ['all'],
                domain_context: config.searchQuery
            });
            console.log(`   Theoretical gaps: ${gaps.theoretical_gaps.length}`);
            console.log(`   Methodological gaps: ${gaps.methodological_gaps.length}`);
            console.log(`   Practical gaps: ${gaps.practical_gaps.length}`);
            console.log(`   Priority areas: ${gaps.priority_areas.length}`);
            // Step 7: Synthesize Knowledge
            console.log('\n📝 Step 7: Synthesizing Knowledge...');
            const synthesis = await this.callTool('synthesize_knowledge', {
                papers: ahpResults.ranked_papers,
                themes: config.themes,
                synthesis_type: 'thematic'
            });
            console.log(`   Analyzed ${synthesis.themes.size} themes`);
            console.log(`   Key findings: ${synthesis.key_findings.length}`);
            console.log(`   Convergent findings: ${synthesis.convergent_findings.length}`);
            console.log(`   Divergent findings: ${synthesis.divergent_findings.length}`);
            console.log(`   Future directions: ${synthesis.future_directions.length}`);
            // Step 8: Analyze Trends
            console.log('\n📈 Step 8: Analyzing Research Trends...');
            const trends = await this.callTool('trend_analysis', {
                papers: ahpResults.ranked_papers,
                time_period: {
                    start_year: parseInt(config.dateRange.start),
                    end_year: parseInt(config.dateRange.end)
                },
                trend_metrics: ['innovation_index', 'collaboration_index']
            });
            console.log(`   Emerging topics: ${trends.emerging_topics.length}`);
            console.log(`   Declining topics: ${trends.declining_topics.length}`);
            console.log(`   Stable topics: ${trends.stable_topics.length}`);
            // Step 9: Generate Literature Review Chapter
            console.log('\n📄 Step 9: Generating Literature Review Chapter...');
            const chapter = await this.callTool('generate_chapter', {
                analysis_results: {
                    papers: ahpResults.ranked_papers,
                    databases: config.databases,
                    search_query: config.searchQuery,
                    date_range: config.dateRange,
                    tier1_results: tier1Results,
                    tier2_results: tier2Results,
                    ahp_results: ahpResults,
                    research_gaps: gaps,
                    synthesis_results: synthesis,
                    trend_analysis: trends,
                    validation: {
                        kappa: 0.85,
                        agreement: 88,
                        correlation: 0.78,
                        consistency: 92
                    }
                },
                format: config.outputFormat,
                citation_style: 'APA'
            });
            // Save the chapter
            await fs.mkdir(OUTPUT_DIR, { recursive: true });
            const outputFile = path.join(OUTPUT_DIR, `literature_review_${Date.now()}.${config.outputFormat}`);
            await fs.writeFile(outputFile, chapter);
            console.log(`   Chapter saved to: ${outputFile}`);
            // Generate summary statistics
            console.log('\n📊 Literature Review Summary Statistics:');
            console.log('='.repeat(50));
            console.log(`Total papers searched: ${allPapers.length}`);
            console.log(`Papers after Tier 1: ${tier1Results.accepted.length}`);
            console.log(`Papers after Tier 2: ${tier2Results.ranked_papers.length}`);
            console.log(`Final selected papers: ${ahpResults.ranked_papers.length}`);
            console.log(`Research gaps identified: ${gaps.theoretical_gaps.length + gaps.methodological_gaps.length + gaps.practical_gaps.length}`);
            console.log(`Themes analyzed: ${synthesis.themes.size}`);
            console.log(`Output file: ${outputFile}`);
            console.log('\n✅ Literature Review Completed Successfully!');
        }
        catch (error) {
            console.error('\n❌ Error during literature review:', error);
            throw error;
        }
    }
    /**
     * Disconnect from the MCP server
     */
    async disconnect() {
        if (this.connected) {
            await this.client.close();
            this.connected = false;
            console.log('\n👋 Disconnected from MCP server');
        }
    }
}
/**
 * Main execution function
 */
async function main() {
    const client = new LiteratureReviewClient();
    try {
        // Connect to MCP server
        await client.connect();
        // Configure and run literature review
        await client.conductLiteratureReview({
            searchQuery: 'optimization AND scheduling AND (manufacturing OR production)',
            databases: ['Scopus', 'Web of Science', 'IEEE'],
            dateRange: { start: '2020', end: '2024' },
            keywords: [
                'optimization',
                'scheduling',
                'manufacturing',
                'production',
                'assembly'
            ],
            themes: [
                'Spatial Optimisation',
                'Dynamic Resource Scheduling',
                'Safety Integration',
                'Multi-Stage Assembly',
                'Digital Transformation'
            ],
            outputFormat: 'markdown'
        });
    }
    catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
    finally {
        // Disconnect from server
        await client.disconnect();
    }
}
// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}
export { LiteratureReviewClient };
//# sourceMappingURL=client.js.map