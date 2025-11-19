export interface OutputConfig {
    baseOutputPath: string;
    generateTimestamps: boolean;
    organizeByType: boolean;
}
export declare class OutputManager {
    private config;
    private outputDirs;
    constructor(config: OutputConfig);
    /**
     * Generate timestamp string for file naming
     */
    private generateTimestamp;
    /**
     * Generate organized file path
     */
    generateFilePath(category: keyof typeof this.outputDirs, fileName: string, extension: string): Promise<string>;
    /**
     * Save analysis results (Tier 1, 2, 3, AHP)
     */
    saveAnalysis(analysisType: string, data: any, format?: 'json' | 'csv'): Promise<string>;
    /**
     * Save literature review chapter
     */
    saveChapter(chapterData: any, format?: 'markdown' | 'latex' | 'html'): Promise<string>;
    /**
     * Save presentation slides
     */
    savePresentation(presentationData: any, format?: 'powerpoint' | 'reveal.js' | 'beamer' | 'google-slides'): Promise<string>;
    /**
     * Save paper summary (evidence, methods, limitations, findings)
     */
    savePaperSummary(summaryData: any, theme: string, format?: 'markdown' | 'powerpoint' | 'html' | 'latex'): Promise<string>;
    /**
     * Save search results
     */
    saveSearchResults(database: string, query: string, results: any): Promise<string>;
    /**
     * Save methodology extraction results
     */
    saveMethodologies(methodologies: any): Promise<string>;
    /**
     * Save citation analysis results
     */
    saveCitationAnalysis(analysisType: string, results: any): Promise<string>;
    /**
     * Save trend analysis results
     */
    saveTrendAnalysis(trends: any): Promise<string>;
    /**
     * Save comprehensive report
     */
    saveReport(reportType: string, data: any, format?: 'markdown' | 'html' | 'json'): Promise<string>;
    private convertToCSV;
    private formatAsMarkdown;
    private formatAsLatex;
    private formatAsHTML;
    private formatReportAsMarkdown;
    private formatReportAsHTML;
    private getPresentationExtension;
    private formatAsPresentationMarkdown;
    private formatAsRevealJS;
    private formatAsBeamer;
    private formatPaperSummaryAsMarkdown;
    /**
     * Format methods section flexibly based on methodology structure
     */
    private formatMethodsSection;
    private formatPaperSummaryAsPowerPoint;
    private formatPaperSummaryAsHTML;
    private formatPaperSummaryAsLatex;
}
//# sourceMappingURL=OutputManager.d.ts.map