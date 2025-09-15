import { Paper } from './TierFilteringSystem.js';
export interface SynthesisResult {
    synthesis_type: string;
    themes: Map<string, ThemeAnalysis>;
    narrative: string;
    key_findings: string[];
    convergent_findings: string[];
    divergent_findings: string[];
    knowledge_evolution: any;
    future_directions: string[];
}
export interface ThemeAnalysis {
    theme: string;
    papers: string[];
    key_concepts: string[];
    evolution: string;
    consensus_level: number;
    evidence_strength: string;
}
export interface TrendAnalysis {
    time_period: {
        start: number;
        end: number;
    };
    trends: Map<string, TrendData>;
    emerging_topics: string[];
    declining_topics: string[];
    stable_topics: string[];
    breakpoints: number[];
    forecast: any;
}
export interface TrendData {
    topic: string;
    frequency_over_time: number[];
    growth_rate: number;
    trend_type: 'emerging' | 'declining' | 'stable' | 'cyclical';
    significance: number;
}
export declare class KnowledgeSynthesizer {
    private tfidf;
    private tokenizer;
    private sentenceTokenizer;
    constructor();
    /**
     * Main synthesis method
     */
    synthesize(papers: Paper[], themes: string[], synthesisType?: string): Promise<SynthesisResult>;
    /**
     * Narrative synthesis
     */
    private narrativeSynthesis;
    /**
     * Thematic synthesis
     */
    private thematicSynthesis;
    /**
     * Chronological synthesis
     */
    private chronologicalSynthesis;
    /**
     * Methodological synthesis
     */
    private methodologicalSynthesis;
    /**
     * Analyze trends over time
     */
    analyzeTrends(papers: Paper[], timePeriod?: {
        start_year: number;
        end_year: number;
    }, trendMetrics?: string[]): Promise<TrendAnalysis>;
    private initializeTFIDF;
    private initializeResult;
    private analyzeTheme;
    private extractKeyConcepts;
    private describeEvolution;
    private calculateConsensus;
    private calculateKeywordOverlap;
    private assessEvidenceStrength;
    private extractKeyFindings;
    private identifyConvergentDivergent;
    private analyzeKnowledgeEvolution;
    private groupByYear;
    private calculateGrowthRate;
    private assessFieldMaturity;
    private suggestFutureDirections;
    private extractTopics;
    private analyzeSingleTrend;
    private calculateTopicGrowthRate;
    private isCyclical;
    private calculateSignificance;
    private identifyBreakpoints;
    private generateForecast;
    private calculateCustomMetric;
    private calculateInterdisciplinarity;
    private calculateInnovationIndex;
    private calculateCollaborationIndex;
    private createIntroduction;
    private createNarrativeBody;
    private createConclusion;
    private createThematicNarrative;
    private createChronologicalNarrative;
    private createMethodologicalNarrative;
    private findThemeRelationships;
    private calculateThemeOverlap;
    private identifyTimePeriods;
    private extractDominantThemes;
    private extractKeyDevelopments;
    private identifyMethodologicalShifts;
    private analyzeThemeEvolution;
    private groupByMethodology;
    private identifyPrimaryMethod;
    private identifyMethodStrengths;
    private identifyMethodLimitations;
    private synthesizeMethodFindings;
    private assessMethodQuality;
    private analyzeCrossMethod;
    private createTimeline;
    private isStopWord;
}
//# sourceMappingURL=KnowledgeSynthesizer.d.ts.map