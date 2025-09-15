import { Paper } from './TierFilteringSystem.js';
export interface ResearchGap {
    type: 'theoretical' | 'methodological' | 'practical';
    description: string;
    evidence: string[];
    papers_referenced: string[];
    severity: 'critical' | 'moderate' | 'minor';
    recommendations: string[];
    potential_impact: string;
}
export interface GapAnalysisResult {
    theoretical_gaps: ResearchGap[];
    methodological_gaps: ResearchGap[];
    practical_gaps: ResearchGap[];
    gap_matrix: any;
    research_opportunities: string[];
    priority_areas: string[];
}
export declare class ResearchGapAnalyzer {
    private tfidf;
    private tokenizer;
    private stemmer;
    constructor();
    /**
     * Main method to identify all types of research gaps
     */
    identifyGaps(papers: Paper[], gapTypes?: string[], domainContext?: string): Promise<GapAnalysisResult>;
    /**
     * Identify theoretical gaps in the literature
     */
    private identifyTheoreticalGaps;
    /**
     * Identify methodological gaps
     */
    private identifyMethodologicalGaps;
    /**
     * Identify practical gaps
     */
    private identifyPracticalGaps;
    /**
     * Helper: Initialize TF-IDF with paper content
     */
    private initializeTFIDF;
    /**
     * Helper: Extract theoretical frameworks from papers
     */
    private extractTheoreticalFrameworks;
    /**
     * Helper: Identify missing frameworks
     */
    private identifyMissingFrameworks;
    /**
     * Helper: Extract methodologies from papers
     */
    private extractMethodologies;
    /**
     * Helper: Assess methodological diversity
     */
    private assessMethodologicalDiversity;
    /**
     * Helper: Create gap matrix
     */
    private createGapMatrix;
    /**
     * Helper: Calculate overlap between two gaps
     */
    private calculateGapOverlap;
    /**
     * Helper: Identify research opportunities
     */
    private identifyOpportunities;
    /**
     * Helper: Determine priority areas
     */
    private determinePriorityAreas;
    private identifyTheoreticalConflicts;
    private identifyUnexploredDimensions;
    private checkTheoreticalIntegration;
    private identifyValidationGaps;
    private analyzeSampleAdequacy;
    private identifyMeasurementGaps;
    private checkReplicationStudies;
    private identifyImplementationGaps;
    private analyzeScalability;
    private identifyContextGaps;
    private identifyToolGaps;
    private analyzeIndustryAcademiaGap;
    private getPapersWithoutFramework;
    private getPapersWithConflicts;
    private getPapersLackingValidation;
    private getPapersWithoutImplementation;
}
//# sourceMappingURL=ResearchGapAnalyzer.d.ts.map