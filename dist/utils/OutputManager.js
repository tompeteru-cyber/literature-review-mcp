import path from 'path';
import { promises as fs } from 'fs';
export class OutputManager {
    config;
    outputDirs = {
        analyses: 'analyses',
        chapters: 'chapters',
        searchResults: 'search-results',
        methodologies: 'methodologies',
        citations: 'citations',
        trends: 'trends',
        reports: 'reports'
    };
    constructor(config) {
        this.config = config;
    }
    /**
     * Generate timestamp string for file naming
     */
    generateTimestamp() {
        const now = new Date();
        return now.toISOString()
            .replace(/:/g, '-')
            .replace(/\./g, '-')
            .slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    }
    /**
     * Generate organized file path
     */
    async generateFilePath(category, fileName, extension) {
        const dir = this.config.organizeByType
            ? path.join(this.config.baseOutputPath, this.outputDirs[category])
            : this.config.baseOutputPath;
        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });
        // Generate filename with optional timestamp
        const timestamp = this.config.generateTimestamps ? `${this.generateTimestamp()}_` : '';
        const fullFileName = `${timestamp}${fileName}.${extension}`;
        return path.join(dir, fullFileName);
    }
    /**
     * Save analysis results (Tier 1, 2, 3, AHP)
     */
    async saveAnalysis(analysisType, data, format = 'json') {
        const fileName = `${analysisType.toLowerCase().replace(/\s+/g, '-')}-analysis`;
        const filePath = await this.generateFilePath('analyses', fileName, format);
        const content = format === 'json'
            ? JSON.stringify(data, null, 2)
            : this.convertToCSV(data);
        await fs.writeFile(filePath, content, 'utf8');
        console.error(`[OUTPUT] Analysis saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save literature review chapter
     */
    async saveChapter(chapterData, format = 'markdown') {
        const fileName = `literature-review-chapter`;
        const filePath = await this.generateFilePath('chapters', fileName, format);
        let content;
        switch (format) {
            case 'markdown':
                content = this.formatAsMarkdown(chapterData);
                break;
            case 'latex':
                content = this.formatAsLatex(chapterData);
                break;
            case 'html':
                content = this.formatAsHTML(chapterData);
                break;
            default:
                content = JSON.stringify(chapterData, null, 2);
        }
        await fs.writeFile(filePath, content, 'utf8');
        console.error(`[OUTPUT] Chapter saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save search results
     */
    async saveSearchResults(database, query, results) {
        const fileName = `${database.toLowerCase()}-search-${query.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}`;
        const filePath = await this.generateFilePath('searchResults', fileName, 'json');
        const data = {
            database,
            query,
            timestamp: new Date().toISOString(),
            totalResults: results.length,
            results
        };
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.error(`[OUTPUT] Search results saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save methodology extraction results
     */
    async saveMethodologies(methodologies) {
        const fileName = 'methodology-extraction';
        const filePath = await this.generateFilePath('methodologies', fileName, 'json');
        await fs.writeFile(filePath, JSON.stringify(methodologies, null, 2), 'utf8');
        console.error(`[OUTPUT] Methodologies saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save citation analysis results
     */
    async saveCitationAnalysis(analysisType, results) {
        const fileName = `${analysisType.toLowerCase().replace(/\s+/g, '-')}-citation-analysis`;
        const filePath = await this.generateFilePath('citations', fileName, 'json');
        await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf8');
        console.error(`[OUTPUT] Citation analysis saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save trend analysis results
     */
    async saveTrendAnalysis(trends) {
        const fileName = 'research-trends';
        const filePath = await this.generateFilePath('trends', fileName, 'json');
        await fs.writeFile(filePath, JSON.stringify(trends, null, 2), 'utf8');
        console.error(`[OUTPUT] Trend analysis saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save comprehensive report
     */
    async saveReport(reportType, data, format = 'markdown') {
        const fileName = `${reportType.toLowerCase().replace(/\s+/g, '-')}-report`;
        const filePath = await this.generateFilePath('reports', fileName, format);
        let content;
        switch (format) {
            case 'markdown':
                content = this.formatReportAsMarkdown(reportType, data);
                break;
            case 'html':
                content = this.formatReportAsHTML(reportType, data);
                break;
            default:
                content = JSON.stringify(data, null, 2);
        }
        await fs.writeFile(filePath, content, 'utf8');
        console.error(`[OUTPUT] Report saved: ${filePath}`);
        return filePath;
    }
    // Formatting helpers
    convertToCSV(data) {
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ].join('\n');
            return csvContent;
        }
        return JSON.stringify(data);
    }
    formatAsMarkdown(chapterData) {
        if (typeof chapterData === 'string')
            return chapterData;
        return `# Literature Review Chapter

Generated on: ${new Date().toISOString()}

## Content

${JSON.stringify(chapterData, null, 2)}

---
*Generated by Literature Review MCP Server*
`;
    }
    formatAsLatex(chapterData) {
        return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\title{Literature Review Chapter}
\\author{Literature Review MCP Server}
\\date{${new Date().toISOString()}}

\\begin{document}
\\maketitle

${typeof chapterData === 'string' ? chapterData : JSON.stringify(chapterData, null, 2)}

\\end{document}
`;
    }
    formatAsHTML(chapterData) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Literature Review Chapter</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        pre { background: #f5f5f5; padding: 20px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Literature Review Chapter</h1>
    <p><em>Generated on: ${new Date().toISOString()}</em></p>
    <pre>${typeof chapterData === 'string' ? chapterData : JSON.stringify(chapterData, null, 2)}</pre>
</body>
</html>
`;
    }
    formatReportAsMarkdown(reportType, data) {
        return `# ${reportType} Report

Generated on: ${new Date().toISOString()}

## Summary

This report contains ${reportType.toLowerCase()} analysis results.

## Data

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---
*Generated by Literature Review MCP Server*
`;
    }
    formatReportAsHTML(reportType, data) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>${reportType} Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #e7f3ff; padding: 20px; border-radius: 8px; }
        pre { background: #f5f5f5; padding: 20px; overflow-x: auto; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>${reportType} Report</h1>
    <div class="summary">
        <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        <p>This report contains ${reportType.toLowerCase()} analysis results.</p>
    </div>

    <h2>Data</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>

    <footer>
        <hr>
        <p><em>Generated by Literature Review MCP Server</em></p>
    </footer>
</body>
</html>
`;
    }
}
//# sourceMappingURL=OutputManager.js.map