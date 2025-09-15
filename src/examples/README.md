# Literature Review MCP (Model Context Protocol) Server

A comprehensive MCP server for conducting systematic literature reviews with advanced multi-tier filtering, AHP-based decision making, and automated research gap identification.

## Features

### 🔍 Advanced Database Search
- Multi-database searching (Scopus, Web of Science, IEEE, PubMed, arXiv)
- Boolean query optimization
- Temporal filtering
- Field-specific searches

### 📊 Three-Tier Filtering System

#### Tier 1: Initial Filtering
- Keyword-based filtering
- Citation thresholds
- Journal quality assessment
- Language and accessibility filters

#### Tier 2: Advanced Relevance Analysis
- TF-IDF semantic analysis
- Multi-dimensional relevance scoring
- Semantic clustering
- Statistical distribution analysis

#### Tier 3: AHP Multi-Criteria Decision Framework
- Hierarchical criteria structure
- Pairwise comparison matrices
- Consistency checking
- Sensitivity analysis
- Robust ranking generation

### 🧩 Research Gap Analysis
- **Theoretical Gaps**: Framework completeness, theoretical conflicts
- **Methodological Gaps**: Diversity, validation, replication needs
- **Practical Gaps**: Implementation, scalability, industry-academia bridge

### 📖 Knowledge Synthesis
- Narrative synthesis
- Thematic analysis
- Chronological evolution
- Methodological comparison
- Trend analysis with forecasting

### 📝 Automated Chapter Generation
- Complete literature review chapters
- Multiple output formats (Markdown, LaTeX, HTML, DOCX)
- APA, MLA, Chicago, IEEE citation styles
- Structured sections with subsections

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/literature-review-mcp.git
cd literature-review-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Database Configuration (optional - uses SQLite by default)
DATABASE_URL=your_database_url
SUPABASE_KEY=your_supabase_key

# API Keys for Database Access (when implemented)
SCOPUS_API_KEY=your_scopus_key
WOS_API_KEY=your_wos_key
IEEE_API_KEY=your_ieee_key
PUBMED_API_KEY=your_pubmed_key

# File Storage
PDF_STORAGE_PATH=/path/to/pdf/storage
OUTPUT_PATH=/path/to/outputs
```

### MCP Configuration

Add to Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "literature-review": {
      "command": "node",
      "args": ["/path/to/literature-review-mcp/dist/index.js"],
      "env": {
        "DATABASE_URL": "sqlite://literature_review.db"
      }
    }
  }
}
```

## Usage Examples

### 1. Complete Literature Review Workflow

```javascript
// Step 1: Search databases
const searchResults = await search_databases({
  databases: ["Scopus", "Web of Science", "IEEE"],
  query: "machine learning AND optimization AND (scheduling OR planning)",
  date_range: { start: "2019", end: "2024" },
  fields: ["title", "abstract", "keywords"]
});

// Step 2: Apply Tier 1 filtering
const tier1Results = await tier1_filtering({
  papers: searchResults.papers,
  criteria: {
    keywords: ["optimization", "scheduling", "machine learning"],
    exclude_keywords: ["social media", "marketing"],
    min_citations: 5,
    journal_quality: "high",
    language: "English"
  }
});

// Step 3: Apply Tier 2 analysis
const tier2Results = await tier2_analysis({
  papers: tier1Results.accepted,
  relevance_weights: {
    title_weight: 0.3,
    abstract_weight: 0.4,
    methodology_weight: 0.2,
    recency_weight: 0.1
  },
  semantic_analysis: true
});

// Step 4: Apply Tier 3 AHP
const ahpResults = await tier3_ahp({
  papers: tier2Results.ranked_papers.slice(0, 100),
  criteria: [
    { name: "Scientific Rigor", weight: 0.35 },
    { name: "Theoretical Contribution", weight: 0.25 },
    { name: "Practical Impact", weight: 0.25 },
    { name: "Research Quality", weight: 0.15 }
  ]
});

// Step 5: Extract methodologies
const methodologies = await extract_methodologies({
  paper_paths: ["/path/to/pdfs/*.pdf"],
  extraction_depth: "comprehensive"
});

// Step 6: Identify research gaps
const gaps = await identify_research_gaps({
  analyzed_papers: ahpResults.ranked_papers,
  gap_types: ["all"],
  domain_context: "optimization in manufacturing"
});

// Step 7: Synthesize knowledge
const synthesis = await synthesize_knowledge({
  papers: ahpResults.ranked_papers,
  themes: [
    "Spatial Optimisation",
    "Dynamic Scheduling",
    "Safety Integration",
    "Multi-Stage Assembly",
    "Digital Transformation"
  ],
  synthesis_type: "thematic"
});

// Step 8: Generate chapter
const chapter = await generate_chapter({
  analysis_results: {
    papers: ahpResults.ranked_papers,
    tier1_results,
    tier2_results,
    ahp_results: ahpResults,
    research_gaps: gaps,
    synthesis_results: synthesis
  },
  format: "markdown",
  citation_style: "APA"
});
```

### 2. Research Gap Analysis Only

```javascript
const gaps = await identify_research_gaps({
  analyzed_papers: papers,
  gap_types: ["theoretical", "methodological"],
  domain_context: "artificial intelligence in healthcare"
});
```

### 3. Citation Network Analysis

```javascript
const network = await analyze_citations({
  papers: papers,
  analysis_type: "co-citation",
  visualize: true
});
```

### 4. Trend Analysis

```javascript
const trends = await trend_analysis({
  papers: papers,
  time_period: { start_year: 2015, end_year: 2024 },
  trend_metrics: ["innovation_index", "collaboration_index"]
});
```

## Output Structure

### Generated Chapter Structure

```
CHAPTER 1. Literature Review
├── 1.1. Chapter Overview
├── 1.2. Database Selection and Search Strategy
├── 1.3. Tier 1: Initial Filtering Framework
├── 1.4. Tier 2: Advanced Relevance Analysis
├── 1.5. Tier 3: AHP-Based Multi-criteria Decision Framework
├── 1.6. Methodological Validation & Contribution
├── 1.7. State of the Knowledge
│   ├── 1.7.1. Spatial Optimisation & Outfitting Constraints
│   ├── 1.7.2. Dynamic Resource Scheduling & Uncertainty
│   ├── 1.7.3. Safety Integrated Dynamic Scheduling
│   ├── 1.7.4. Multi-Stage Assembly & Outfitting Optimisation
│   └── 1.7.5. Digital Scheduling & Dynamic Optimisation
├── 1.8. Research Gaps
│   ├── 1.8.1. Theoretical Gap
│   ├── 1.8.2. Methodological Gap
│   └── 1.8.3. Practical Gap
└── 1.9. Chapter Summary
```

## Database Schema

The MCP uses SQLite (local) or Supabase (cloud) with the following tables:

- `papers`: Bibliographic information
- `search_results`: Search query results
- `analyses`: Stored analysis results
- `methodologies`: Extracted methodologies
- `research_gaps`: Identified gaps
- `synthesis_results`: Knowledge synthesis
- `ahp_results`: AHP rankings
- `chapters`: Generated chapters

## Advanced Features

### Custom Analysis Pipelines

```javascript
// Create custom pipeline
const customPipeline = {
  search: { /* search config */ },
  filter: { /* filter config */ },
  analyze: { /* analysis config */ },
  synthesize: { /* synthesis config */ }
};

// Execute pipeline
const results = await executePipeline(customPipeline);
```

### Batch Processing

```javascript
// Process multiple PDF files
const batchResults = await batchProcess({
  files: [/* file paths */],
  operations: ["extract", "analyze", "synthesize"],
  parallel: true
});
```

### Export/Import

```javascript
// Export all data
const exportData = await exportToJSON();

// Import data
await importFromJSON(exportData);
```

## Best Practices

1. **Search Strategy**: Start broad, then refine
2. **Filtering**: Use moderate thresholds initially
3. **AHP Criteria**: Limit to 7±2 criteria for consistency
4. **Gap Analysis**: Validate with domain experts
5. **Synthesis**: Combine multiple synthesis types

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL environment variable
   - Ensure database server is running

2. **PDF Extraction Errors**
   - Verify PDF files are not corrupted
   - Check file permissions

3. **Memory Issues with Large Datasets**
   - Process in batches
   - Increase Node.js memory: `node --max-old-space-size=8192`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Citation

If you use this MCP in your research, please cite:

```bibtex
@software{literature_review_mcp,
  title = {Literature Review MCP: Advanced Systematic Review Automation},
  author = {Your Name},
  year = {2024},
  url = {https://github.com/yourusername/literature-review-mcp}
}
```

## Support

- Documentation: [Full Docs](https://docs.example.com)
- Issues: [GitHub Issues](https://github.com/yourusername/literature-review-mcp/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/literature-review-mcp/discussions)

## Acknowledgments

- Anthropic MCP SDK
- Natural Language Processing libraries
- AHP methodology references
- Systematic review guidelines (PRISMA)
● Perfect! ✅ Setup Complete!


  What is Created 

  1. 📁 claude_desktop_config.json - Your MCP configuration (syncs via GitHub)
  2. ⚙️ setup-claude-config.bat - Automated setup script for Windows
  3. 📋 SETUP-INSTRUCTIONS.md - Complete instructions for any device

  Current Status:

  ✅ Configuration copied to Claude Desktop✅ Ready for cross-device sync via
  GitHub

  Next Steps:

  1. Restart Claude Desktop completely (close and reopen)
  2. Look for the 🔧 tools icon
  3. Test with: "Show me available literature review tools"

  For Future Devices:

  Just run: setup-claude-config.bat after pulling from GitHub

  Your MCP server is now ready to use! Try restarting Claude Desktop and test it      
  out! 🚀