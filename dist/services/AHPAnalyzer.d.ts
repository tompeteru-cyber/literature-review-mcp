import { Paper } from './TierFilteringSystem.js';
export interface AHPCriterion {
    name: string;
    weight: number;
    sub_criteria?: AHPCriterion[];
}
export interface PairwiseComparison {
    criteria: string[];
    matrix: number[][];
}
export interface AHPResult {
    paper_id: string;
    final_score: number;
    criteria_scores: Map<string, number>;
    consistency_ratio: number;
    rank: number;
}
export declare class AHPAnalyzer {
    private readonly RI;
    /**
     * Perform complete AHP analysis on papers
     */
    performAHP(papers: Paper[], criteria: AHPCriterion[], pairwiseComparisons?: PairwiseComparison): Promise<{
        ranked_papers: AHPResult[];
        criteria_weights: Map<string, number>;
        consistency_analysis: any;
        sensitivity_analysis: any;
    }>;
    /**
     * Calculate weights from pairwise comparison matrix
     */
    private calculateWeights;
    /**
     * Extract weights directly from criteria definition
     */
    private extractWeights;
    /**
     * Normalize weights to sum to 1
     */
    private normalizeWeights;
    /**
     * Score papers against each criterion
     */
    private scorePapers;
    /**
     * Score papers on a specific criterion
     */
    private scoreCriterion;
    /**
     * Calculate final AHP scores
     */
    private calculateFinalScores;
    /**
     * Check consistency of pairwise comparison matrix
     */
    private checkConsistency;
    /**
     * Perform sensitivity analysis
     */
    private performSensitivityAnalysis;
    /**
     * Helper: Calculate rank change between two result sets
     */
    private calculateRankChange;
    /**
     * Helper: Flatten nested criteria
     */
    private flattenCriteria;
    /**
     * Helper: Normalize scores to [0, 1]
     */
    private normalizeScores;
    private calculateRelevanceScore;
    private calculateMethodologyScore;
    private calculateImpactScore;
    private calculateRecencyScore;
    private calculateQualityScore;
    private calculateGenericScore;
}
//# sourceMappingURL=AHPAnalyzer.d.ts.map