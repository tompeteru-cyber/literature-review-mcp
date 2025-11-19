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
        reports: 'reports',
        presentations: 'presentations',
        paperSummaries: 'paper-summaries'
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
     * Save presentation slides
     */
    async savePresentation(presentationData, format = 'powerpoint') {
        const fileName = `${presentationData.presentationType || 'presentation'}-slides`;
        const extension = this.getPresentationExtension(format);
        const filePath = await this.generateFilePath('presentations', fileName, extension);
        let content;
        switch (format) {
            case 'reveal.js':
                content = this.formatAsRevealJS(presentationData);
                break;
            case 'beamer':
                content = this.formatAsBeamer(presentationData);
                break;
            case 'powerpoint':
            case 'google-slides':
            default:
                content = this.formatAsPresentationMarkdown(presentationData);
        }
        await fs.writeFile(filePath, content, 'utf8');
        console.error(`[OUTPUT] Presentation saved: ${filePath}`);
        return filePath;
    }
    /**
     * Save paper summary (evidence, methods, limitations, findings)
     */
    async savePaperSummary(summaryData, theme, format = 'markdown') {
        const fileName = `${theme.toLowerCase().replace(/\s+/g, '-')}-paper-summary`;
        const extension = format === 'powerpoint' ? 'pptx.md' : format === 'latex' ? 'tex' : format;
        const filePath = await this.generateFilePath('paperSummaries', fileName, extension);
        let content;
        switch (format) {
            case 'markdown':
                content = this.formatPaperSummaryAsMarkdown(summaryData, theme);
                break;
            case 'powerpoint':
                content = this.formatPaperSummaryAsPowerPoint(summaryData, theme);
                break;
            case 'html':
                content = this.formatPaperSummaryAsHTML(summaryData, theme);
                break;
            case 'latex':
                content = this.formatPaperSummaryAsLatex(summaryData, theme);
                break;
            default:
                content = JSON.stringify(summaryData, null, 2);
        }
        await fs.writeFile(filePath, content, 'utf8');
        console.error(`[OUTPUT] Paper summary saved: ${filePath}`);
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
    // Presentation formatting helpers
    getPresentationExtension(format) {
        switch (format) {
            case 'reveal.js':
                return 'html';
            case 'beamer':
                return 'tex';
            case 'powerpoint':
                return 'pptx.md'; // Markdown format for PowerPoint import
            case 'google-slides':
                return 'slides.md';
            default:
                return 'md';
        }
    }
    formatAsPresentationMarkdown(data) {
        const slides = Array.isArray(data.slides) ? data.slides : [];
        return `# ${data.title || 'Literature Review Presentation'}

**Type:** ${data.presentationType || 'presentation'}
**Duration:** ${data.duration || 20} minutes
**Audience:** ${data.audience || 'academic'}
**Slides:** ${data.slideCount || slides.length}

---

${slides.map((slide, index) => `
## Slide ${slide.slideNumber || index + 1}: ${slide.title || `Slide ${index + 1}`}

${slide.content || 'Content for this slide...'}

${slide.visualElements && slide.visualElements.length > 0 ? `
**Visual Elements:**
${slide.visualElements.map((element) => `- ${element}`).join('\n')}
` : ''}

${slide.notes ? `
**Speaker Notes:**
${slide.notes}
` : ''}

---`).join('\n')}

*Generated on: ${new Date().toISOString()}*
*Generated by Literature Review MCP Server*
`;
    }
    formatAsRevealJS(data) {
        const slides = Array.isArray(data.slides) ? data.slides : [];
        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${data.title || 'Literature Review Presentation'}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/white.css">
</head>
<body>
    <div class="reveal">
        <div class="slides">
            <section>
                <h1>${data.title || 'Literature Review Presentation'}</h1>
                <p><strong>${data.presentationType || 'Research Presentation'}</strong></p>
                <p><small>Duration: ${data.duration || 20} minutes | Audience: ${data.audience || 'academic'}</small></p>
            </section>

            ${slides.map((slide) => `
            <section>
                <h2>${slide.title || 'Slide Title'}</h2>
                <div>${slide.content || 'Slide content...'}</div>
                ${slide.visualElements && slide.visualElements.length > 0 ? `
                <div class="visual-elements">
                    ${slide.visualElements.map((element) => `<div class="visual-element">${element}</div>`).join('')}
                </div>` : ''}
                ${slide.notes ? `<aside class="notes">${slide.notes}</aside>` : ''}
            </section>`).join('')}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
    <script>
        Reveal.initialize({
            hash: true,
            transition: 'slide'
        });
    </script>
</body>
</html>`;
    }
    formatAsBeamer(data) {
        const slides = Array.isArray(data.slides) ? data.slides : [];
        return `\\documentclass{beamer}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}

\\title{${data.title || 'Literature Review Presentation'}}
\\subtitle{${data.presentationType || 'Research Presentation'}}
\\author{Literature Review MCP Server}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}

\\frame{\\titlepage}

${slides.map((slide) => `
\\begin{frame}{${slide.title || 'Slide Title'}}
${slide.content || 'Slide content...'}

${slide.visualElements && slide.visualElements.length > 0 ? `
\\begin{itemize}
${slide.visualElements.map((element) => `\\item ${element}`).join('\n')}
\\end{itemize}` : ''}
\\end{frame}
`).join('')}

\\end{document}`;
    }
    // Paper summary formatting helpers
    formatPaperSummaryAsMarkdown(data, theme) {
        const summary = data.summary || data;
        const evidence = summary.evidence || {};
        const methods = summary.toolsAndMethods || {};
        const limitations = summary.limitations || [];
        const findings = summary.preliminaryFindings || {};
        return `# Theme Classification from Literature Analysis
## Theme 1: ${theme}

---

## Evidence:

**Paper Title: ${evidence.paperTitle || 'N/A'}**

${Array.isArray(evidence.keyPoints) ? evidence.keyPoints.map((point, i) => `${i === 0 ? '- ' : '\n- '}${point}`).join('') : 'No key points available'}

${evidence.pageReferences && evidence.pageReferences.length > 0 ?
            `\n**Page References:** ${evidence.pageReferences.join(', ')}` : ''}

---

## Tools and Key Methods:

${this.formatMethodsSection(methods)}

---

## Limitation:

${Array.isArray(limitations) ? limitations.map((limitation) => `- ${limitation}`).join('\n') : 'No limitations documented'}

---

## Preliminary Findings: ${findings.theme || theme}

**${findings.theme || theme}:**

${Array.isArray(findings.findings) ? findings.findings.map((finding) => `- ${finding}`).join('\n') : 'No findings available'}

${findings.metrics ? `
${findings.metrics.performanceIndicators ? findings.metrics.performanceIndicators.map((metric) => `- ${metric}`).join('\n') : ''}
${findings.metrics.comparisons ? findings.metrics.comparisons.map((comp) => `- ${comp}`).join('\n') : ''}
` : ''}

---

**Generated using Claude Code - Literature Review Analysis**
`;
    }
    /**
     * Format methods section flexibly based on methodology structure
     */
    formatMethodsSection(methods) {
        if (!methods || ((!methods.primary || methods.primary.length === 0) && (!methods.secondary || methods.secondary.length === 0))) {
            return 'No methods documented';
        }
        let methodsText = '';
        // Format primary methods - each gets its own bullet with description and application
        if (Array.isArray(methods.primary) && methods.primary.length > 0) {
            methodsText += methods.primary.map((method) => {
                let text = `- **${method.name}**`;
                if (method.description) {
                    text += `. ${method.description}`;
                }
                if (method.application) {
                    text += ` ${method.application}`;
                }
                return text;
            }).join('\n\n');
        }
        // Format secondary/supporting methods if present
        if (Array.isArray(methods.secondary) && methods.secondary.length > 0) {
            if (methodsText)
                methodsText += '\n\n';
            methodsText += methods.secondary.map((method) => {
                let text = `- **${method.name}**`;
                if (method.description) {
                    text += `. ${method.description}`;
                }
                if (method.application) {
                    text += ` ${method.application}`;
                }
                return text;
            }).join('\n\n');
        }
        return methodsText;
    }
    formatPaperSummaryAsPowerPoint(data, theme) {
        // PowerPoint-compatible markdown format
        return this.formatPaperSummaryAsMarkdown(data, theme);
    }
    formatPaperSummaryAsHTML(data, theme) {
        const summary = data.summary || data;
        const evidence = summary.evidence || {};
        const methods = summary.toolsAndMethods || {};
        const limitations = summary.limitations || [];
        const findings = summary.preliminaryFindings || {};
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Paper Summary: ${theme}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
            background: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .evidence-item, .method-item, .finding-item {
            margin: 15px 0;
            padding-left: 20px;
            border-left: 3px solid #764ba2;
        }
        .limitation {
            background: #fff3cd;
            padding: 10px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Theme Classification from Literature Analysis</h1>
        <h2>Theme 1: ${theme}</h2>
    </div>

    <div class="section">
        <h2>Evidence</h2>
        <h3>${evidence.paperTitle || 'Paper Title Not Available'}</h3>
        ${Array.isArray(evidence.keyPoints) ? evidence.keyPoints.map((point) => `<div class="evidence-item">${point}</div>`).join('') : '<p>No key points available</p>'}
    </div>

    <div class="section">
        <h2>Tools and Key Methods</h2>
        ${Array.isArray(methods.primary) ? methods.primary.map((method) => `
          <div class="method-item">
            <h4>${method.name}</h4>
            <p>${method.description}</p>
            ${method.application ? `<p><em>Application: ${method.application}</em></p>` : ''}
          </div>
        `).join('') : '<p>No methods documented</p>'}
    </div>

    <div class="section">
        <h2>Limitations</h2>
        ${Array.isArray(limitations) ? limitations.map((limitation) => `<div class="limitation">${limitation}</div>`).join('') : '<p>No limitations documented</p>'}
    </div>

    <div class="section">
        <h2>Preliminary Findings</h2>
        ${Array.isArray(findings.findings) ? findings.findings.map((finding, i) => `<div class="finding-item"><strong>${i + 1}.</strong> ${finding}</div>`).join('') : '<p>No findings available</p>'}
    </div>

    <div class="footer">
        <p><strong>Generated using Claude Code - Literature Review MCP Server</strong></p>
        <p><em>Generated on: ${new Date().toISOString()}</em></p>
    </div>
</body>
</html>`;
    }
    formatPaperSummaryAsLatex(data, theme) {
        const summary = data.summary || data;
        const evidence = summary.evidence || {};
        const methods = summary.toolsAndMethods || {};
        const limitations = summary.limitations || [];
        const findings = summary.preliminaryFindings || {};
        return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{xcolor}
\\usepackage{tcolorbox}
\\usepackage{enumitem}

\\title{Theme Classification from Literature Analysis}
\\author{Literature Review MCP Server}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}
\\maketitle

\\section{Theme 1: ${theme}}

\\subsection{Evidence}
\\textbf{${evidence.paperTitle || 'Paper Title Not Available'}}

\\begin{itemize}
${Array.isArray(evidence.keyPoints) ? evidence.keyPoints.map((point) => `  \\item ${point.replace(/[_&%$#]/g, '\\$&')}`).join('\n') : '  \\item No key points available'}
\\end{itemize}

\\subsection{Tools and Key Methods}
${Array.isArray(methods.primary) ? methods.primary.map((method) => `
\\textbf{${method.name}}: ${method.description}
`).join('\n') : 'No methods documented'}

\\subsection{Limitations}
\\begin{tcolorbox}[colback=yellow!10,colframe=yellow!50!black]
\\begin{itemize}
${Array.isArray(limitations) ? limitations.map((limitation) => `  \\item ${limitation.replace(/[_&%$#]/g, '\\$&')}`).join('\n') : '  \\item No limitations documented'}
\\end{itemize}
\\end{tcolorbox}

\\subsection{Preliminary Findings}
\\begin{enumerate}
${Array.isArray(findings.findings) ? findings.findings.map((finding) => `  \\item ${finding.replace(/[_&%$#]/g, '\\$&')}`).join('\n') : '  \\item No findings available'}
\\end{enumerate}

\\vspace{1cm}
\\hrule
\\vspace{0.5cm}
\\textit{Generated using Claude Code - Literature Review MCP Server}

\\end{document}`;
    }
}
//# sourceMappingURL=OutputManager.js.map