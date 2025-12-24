export interface ResearchContext {
    researchTitle: string;
    phDCandidate: string;
    supervisor?: string;
    industryPartner?: string;
    lastUpdated?: string;
    domainUnderstanding: {
        blockOutfitting: {
            description: string;
            environment: string;
            equipment: string;
            challenges: string[];
        };
        postLaunchOutfitting: {
            description: string;
            environment: string;
            equipment: string;
            challenges: string[];
        };
        criticalInsight: string;
    };
    literatureDistribution: {
        totalPapers: number;
        blockOutfitting: {
            count: number;
            percentage: number;
        };
        postLaunchOutfitting: {
            count: number;
            percentage: number;
        };
        majorGap: string;
    };
    identifiedGaps: {
        theoretical: {
            title: string;
            description: string;
        };
        methodological: {
            title: string;
            description: string;
            limitation?: string;
        };
        practical: {
            title: string;
            description: string;
        };
    };
    researchDirections: {
        option1: {
            title: string;
            focus: string;
            rationale: string[];
        };
        option2: {
            title: string;
            focus: string;
            rationale: string[];
        };
    };
    analysisGuidelines: {
        alwaysIdentify: string[];
        blockOutfittingMarkers: string[];
        postLaunchMarkers: string[];
        standardLimitationTemplate: string;
    };
    themes: Array<{
        id: number;
        section: string;
        name: string;
        targetWords: number;
        finding: string;
        limitation: string;
    }>;
    papersAnalyzed: {
        total: number;
        blockOutfitting: number;
        postLaunch: number;
        pattern: string;
    };
}
export declare class ResearchContextLoader {
    private contextFilePath;
    private cachedContext;
    private lastLoadTime;
    private cacheValidityMs;
    constructor(contextFilePath?: string);
    /**
     * Load and parse the research context from the markdown file
     */
    loadContext(forceReload?: boolean): Promise<ResearchContext>;
    /**
     * Parse the markdown content into structured ResearchContext
     */
    private parseMarkdown;
    /**
     * Parse outfitting section (Block or Post-Launch)
     */
    private parseOutfittingSection;
    /**
     * Parse research gaps section
     */
    private parseGaps;
    /**
     * Parse research directions
     */
    private parseResearchDirections;
    /**
     * Parse analysis guidelines
     */
    private parseAnalysisGuidelines;
    /**
     * Parse themes section
     */
    private parseThemes;
    /**
     * Parse papers analyzed section
     */
    private parsePapersAnalyzed;
    /**
     * Get default context when file cannot be loaded
     */
    private getDefaultContext;
    /**
     * Get context filtered by type
     */
    getFilteredContext(contextType?: string): Promise<Partial<ResearchContext>>;
}
export declare function getResearchContextLoader(contextFilePath?: string): ResearchContextLoader;
//# sourceMappingURL=ResearchContextLoader.d.ts.map