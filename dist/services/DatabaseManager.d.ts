import { Paper } from './TierFilteringSystem.js';
export interface StoredAnalysis {
    id: string;
    analysis_type: string;
    data: any;
    created_at: Date;
    updated_at: Date;
    tags: string[];
}
export declare class DatabaseManager {
    private supabaseClient?;
    private sqliteDb?;
    private useSupabase;
    private dbPath;
    constructor(connectionString?: string);
    private initialize;
    private initializeSQLite;
    private createTables;
    /**
     * Store paper in database
     */
    storePaper(paper: Paper): Promise<void>;
    /**
     * Store search results
     */
    storeSearchResults(results: any): Promise<void>;
    /**
     * Store methodology analysis
     */
    storeMethodology(paperId: string, methodology: any): Promise<void>;
    /**
     * Store research gaps
     */
    storeResearchGaps(gaps: any[]): Promise<void>;
    /**
     * Store synthesis results
     */
    storeSynthesis(synthesis: any): Promise<void>;
    /**
     * Store AHP results
     */
    storeAHPResults(results: any[]): Promise<void>;
    /**
     * Store generated chapter
     */
    storeChapter(chapterNumber: string, title: string, content: string, format: string, metadata: any): Promise<void>;
    /**
     * Retrieve papers by criteria
     */
    getPapers(criteria: {
        year?: {
            min: number;
            max: number;
        };
        minCitations?: number;
        keywords?: string[];
        limit?: number;
    }): Promise<Paper[]>;
    /**
     * Retrieve previous analyses
     */
    getAnalyses(analysisType?: string, limit?: number): Promise<StoredAnalysis[]>;
    /**
     * Retrieve research gaps
     */
    getResearchGaps(gapType?: string): Promise<any[]>;
    /**
     * Retrieve synthesis results
     */
    getSynthesisResults(limit?: number): Promise<any[]>;
    /**
     * Retrieve AHP results
     */
    getAHPResults(limit?: number): Promise<any[]>;
    /**
     * Retrieve generated chapters
     */
    getChapters(): Promise<any[]>;
    /**
     * Execute custom query
     */
    executeQuery(query: string, params?: any[]): Promise<any>;
    /**
     * Export database to JSON
     */
    exportToJSON(): Promise<any>;
    /**
     * Import data from JSON
     */
    importFromJSON(data: any): Promise<void>;
    /**
     * Clear all data (use with caution)
     */
    clearAllData(): Promise<void>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseManager.d.ts.map