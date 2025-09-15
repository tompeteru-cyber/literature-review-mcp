export interface Paper {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    year: number;
    citations: number;
    journal: string;
    doi: string;
    keywords: string[];
    methodology?: string;
    findings?: string;
    fullText?: string;
}
export interface FilterCriteria {
    keywords: string[];
    exclude_keywords: string[];
    min_citations: number;
    journal_quality: string;
    language: string;
}
export interface RelevanceWeights {
    title_weight: number;
    abstract_weight: number;
    methodology_weight: number;
    recency_weight: number;
}
export declare class TierFilteringSystem {
    private tfidf;
    private tokenizer;
    private sentimentAnalyzer;
    constructor();
    /**
     * Tier 1: Initial Filtering Framework
     * Basic filtering based on keywords, citations, and journal quality
     */
    applyTier1(papers: Paper[], criteria: FilterCriteria): Promise<{
        accepted: Paper[];
        rejected: Paper[];
        statistics: any;
    }>;
    /**
     * Tier 2: Advanced Relevance Analysis
     * Semantic analysis and weighted scoring
     */
    applyTier2(papers: Paper[], weights?: RelevanceWeights, semanticAnalysis?: boolean): Promise<{
        ranked_papers: Array<Paper & {
            relevance_score: number;
        }>;
        semantic_clusters: any;
        relevance_distribution: any;
    }>;
    /**
     * Helper: Check if journal is high quality
     */
    private isHighQualityJournal;
    /**
     * Helper: Calculate keyword coverage
     */
    private calculateKeywordCoverage;
    /**
     * Helper: Calculate abstract quality score
     */
    private calculateAbstractQuality;
    /**
     * Helper: Assess methodology quality
     */
    private assessMethodology;
    /**
     * Helper: Perform semantic clustering
     */
    private performSemanticClustering;
    /**
     * Helper: Get top authors from papers
     */
    private getTopAuthors;
}
//# sourceMappingURL=TierFilteringSystem.d.ts.map