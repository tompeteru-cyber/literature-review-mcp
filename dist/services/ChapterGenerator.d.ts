export interface ChapterSection {
    number: string;
    title: string;
    content: string;
    subsections?: ChapterSection[];
}
export interface ChapterMetadata {
    word_count: number;
    citation_count: number;
    figure_count: number;
    table_count: number;
    generation_date: Date;
    format: string;
}
export declare class ChapterGenerator {
    private citationStyle;
    private format;
    /**
     * Generate complete literature review chapter
     */
    generateChapter(analysisResults: any, chapterSections?: string[], format?: string, citationStyle?: string): Promise<string>;
    /**
     * Build chapter structure from analysis results
     */
    private buildChapterStructure;
    /**
     * Generate content for each section
     */
    private generateSectionContent;
    /**
     * Generate Chapter Overview
     */
    private generateOverview;
    /**
     * Generate Database Selection and Search Strategy
     */
    private generateDatabaseSection;
    /**
     * Generate Tier 1 Section
     */
    private generateTier1Section;
    /**
     * Generate Tier 2 Section
     */
    private generateTier2Section;
    /**
     * Generate Tier 3 AHP Section
     */
    private generateTier3Section;
    /**
     * Generate Methodological Validation Section
     */
    private generateValidationSection;
    /**
     * Generate State of Knowledge Section
     */
    private generateStateOfKnowledge;
    /**
     * Generate Research Gaps Section
     */
    private generateResearchGaps;
    /**
     * Generate Chapter Summary
     */
    private generateSummary;
    private generateMarkdown;
    private generateLatex;
    private generateHTML;
    private generateDocx;
    private extractYearRange;
    private generateSearchResultsTable;
    private generateRejectionAnalysis;
    private generateKeywordCoverage;
    private calculateAverageCitations;
    private analyzeJournalQuality;
    private analyzeTemporalDistribution;
    private generateSemanticClusters;
    private generateTopPapersTable;
    private getWeight;
    private generatePairwiseMatrix;
    private generateSensitivityAnalysis;
    private generateAHPRankingsTable;
    private generateThematicContent;
    private generateGapContent;
    private extractThematicFindings;
    private extractThematicMethods;
    private escapeLatex;
    private markdownToHTML;
}
//# sourceMappingURL=ChapterGenerator.d.ts.map