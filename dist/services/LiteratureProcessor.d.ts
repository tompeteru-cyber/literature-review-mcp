import { Paper } from './TierFilteringSystem';
import { DatabaseManager } from './DatabaseManager';
export interface SearchResult {
    database: string;
    query: string;
    total_results: number;
    retrieved: number;
    papers: Paper[];
    search_date: Date;
}
export interface CitationNetwork {
    nodes: Array<{
        id: string;
        label: string;
        citations: number;
    }>;
    edges: Array<{
        source: string;
        target: string;
        weight: number;
    }>;
    clusters: any;
    metrics: any;
}
export declare class LiteratureProcessor {
    private dbManager;
    constructor(dbManager: DatabaseManager);
    /**
     * Search multiple academic databases
     */
    searchDatabases(databases: string[], query: string, dateRange?: {
        start: string;
        end: string;
    }, fields?: string[]): Promise<SearchResult[]>;
    /**
     * Search a single database
     */
    private searchSingleDatabase;
    /**
     * Extract methodologies from papers
     */
    extractMethodologies(paperPaths: string[], extractionDepth?: string): Promise<Map<string, any>>;
    /**
     * Extract content from PDF
     */
    private extractPDFContent;
    /**
     * Parse methodology from text
     */
    private parseMethodology;
    /**
     * Validate methodology
     */
    validateMethodology(methodology: any, validationCriteria: string[]): Promise<{
        valid: boolean;
        score: number;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Analyze citation networks
     */
    analyzeCitations(papers: Paper[], analysisType?: string, visualize?: boolean): Promise<CitationNetwork>;
    /**
     * Cross-reference findings across databases
     */
    crossReference(primaryResults: any, secondaryDatabases: string[], deduplication?: boolean): Promise<{
        merged_results: any;
        overlap_analysis: any;
        unique_findings: any;
    }>;
    private deduplicateResults;
    private extractSection;
    private findNextSection;
    private extractApproach;
    private extractDataCollection;
    private extractAnalysisMethods;
    private extractTools;
    private extractValidation;
    private extractLimitations;
    private checkReproducibility;
    private checkValidity;
    private checkReliability;
    private checkSampling;
    private checkEthics;
    private analyzeCoCitation;
    private analyzeBibliographicCoupling;
    private analyzeFullNetwork;
    private calculateNetworkMetrics;
    private identifyClusters;
    private analyzeOverlap;
    private mergeAndDeduplicate;
    private mergeAll;
    private identifyUniqueFindings;
    private mockScopusSearch;
    private mockWoSSearch;
    private mockIEEESearch;
    private mockPubMedSearch;
    private mockArxivSearch;
}
//# sourceMappingURL=LiteratureProcessor.d.ts.map