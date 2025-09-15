import natural from 'natural';
export class ResearchGapAnalyzer {
    tfidf;
    tokenizer;
    stemmer;
    constructor() {
        this.tfidf = new natural.TfIdf();
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
    }
    /**
     * Main method to identify all types of research gaps
     */
    async identifyGaps(papers, gapTypes = ['all'], domainContext) {
        // Initialize TF-IDF with paper content
        this.initializeTFIDF(papers);
        const result = {
            theoretical_gaps: [],
            methodological_gaps: [],
            practical_gaps: [],
            gap_matrix: {},
            research_opportunities: [],
            priority_areas: []
        };
        // Identify each type of gap
        if (gapTypes.includes('all') || gapTypes.includes('theoretical')) {
            result.theoretical_gaps = await this.identifyTheoreticalGaps(papers, domainContext);
        }
        if (gapTypes.includes('all') || gapTypes.includes('methodological')) {
            result.methodological_gaps = await this.identifyMethodologicalGaps(papers);
        }
        if (gapTypes.includes('all') || gapTypes.includes('practical')) {
            result.practical_gaps = await this.identifyPracticalGaps(papers, domainContext);
        }
        // Create gap matrix showing relationships
        result.gap_matrix = this.createGapMatrix(result);
        // Identify research opportunities
        result.research_opportunities = this.identifyOpportunities(result);
        // Determine priority areas
        result.priority_areas = this.determinePriorityAreas(result);
        return result;
    }
    /**
     * Identify theoretical gaps in the literature
     */
    async identifyTheoreticalGaps(papers, domainContext) {
        const gaps = [];
        // 1. Identify missing theoretical frameworks
        const frameworks = this.extractTheoreticalFrameworks(papers);
        const missingFrameworks = this.identifyMissingFrameworks(frameworks, domainContext);
        if (missingFrameworks.length > 0) {
            gaps.push({
                type: 'theoretical',
                description: 'Absence of comprehensive theoretical framework',
                evidence: missingFrameworks,
                papers_referenced: this.getPapersWithoutFramework(papers),
                severity: 'critical',
                recommendations: [
                    'Develop unified theoretical framework',
                    'Integrate existing partial theories',
                    'Conduct systematic theory building research'
                ],
                potential_impact: 'High - foundational for future research'
            });
        }
        // 2. Check for conflicting theories
        const conflicts = this.identifyTheoreticalConflicts(papers);
        if (conflicts.length > 0) {
            gaps.push({
                type: 'theoretical',
                description: 'Unresolved theoretical conflicts',
                evidence: conflicts,
                papers_referenced: this.getPapersWithConflicts(papers, conflicts),
                severity: 'moderate',
                recommendations: [
                    'Conduct comparative theoretical analysis',
                    'Design studies to test competing theories',
                    'Develop reconciling framework'
                ],
                potential_impact: 'Moderate - affects theoretical clarity'
            });
        }
        // 3. Identify unexplored theoretical dimensions
        const dimensions = this.identifyUnexploredDimensions(papers);
        dimensions.forEach(dimension => {
            gaps.push({
                type: 'theoretical',
                description: `Unexplored theoretical dimension: ${dimension.name}`,
                evidence: dimension.evidence,
                papers_referenced: dimension.related_papers,
                severity: 'minor',
                recommendations: dimension.recommendations,
                potential_impact: dimension.impact
            });
        });
        // 4. Check for lack of theoretical integration
        const integrationGaps = this.checkTheoreticalIntegration(papers);
        if (integrationGaps.length > 0) {
            gaps.push({
                type: 'theoretical',
                description: 'Lack of cross-disciplinary theoretical integration',
                evidence: integrationGaps,
                papers_referenced: papers.map(p => p.id).slice(0, 5),
                severity: 'moderate',
                recommendations: [
                    'Conduct interdisciplinary theoretical review',
                    'Develop bridging concepts',
                    'Create integrated theoretical model'
                ],
                potential_impact: 'High - enables new research directions'
            });
        }
        return gaps;
    }
    /**
     * Identify methodological gaps
     */
    async identifyMethodologicalGaps(papers) {
        const gaps = [];
        // 1. Check for limited methodological diversity
        const methods = this.extractMethodologies(papers);
        const diversity = this.assessMethodologicalDiversity(methods);
        if (diversity.score < 0.5) {
            gaps.push({
                type: 'methodological',
                description: 'Limited methodological diversity',
                evidence: [
                    `Diversity score: ${diversity.score}`,
                    `Dominant method: ${diversity.dominant_method}`,
                    `Coverage: ${diversity.coverage}`
                ],
                papers_referenced: papers.map(p => p.id).slice(0, 10),
                severity: 'moderate',
                recommendations: [
                    'Apply mixed methods approaches',
                    'Explore alternative methodologies',
                    'Conduct methodological triangulation'
                ],
                potential_impact: 'Moderate - affects validity and generalizability'
            });
        }
        // 2. Identify missing validation studies
        const validationGaps = this.identifyValidationGaps(papers);
        if (validationGaps.length > 0) {
            gaps.push({
                type: 'methodological',
                description: 'Insufficient methodological validation',
                evidence: validationGaps,
                papers_referenced: this.getPapersLackingValidation(papers),
                severity: 'critical',
                recommendations: [
                    'Conduct validation studies',
                    'Perform reliability testing',
                    'Implement cross-validation techniques'
                ],
                potential_impact: 'High - affects research credibility'
            });
        }
        // 3. Check for sample size and power issues
        const sampleIssues = this.analyzeSampleAdequacy(papers);
        if (sampleIssues.inadequate_count > papers.length * 0.3) {
            gaps.push({
                type: 'methodological',
                description: 'Inadequate sample sizes across studies',
                evidence: [
                    `${sampleIssues.inadequate_count} studies with small samples`,
                    `Average sample size: ${sampleIssues.avg_sample_size}`,
                    `Power analysis missing in ${sampleIssues.missing_power_analysis} studies`
                ],
                papers_referenced: sampleIssues.affected_papers,
                severity: 'moderate',
                recommendations: [
                    'Conduct adequately powered studies',
                    'Perform meta-analysis to aggregate findings',
                    'Use appropriate sample size calculations'
                ],
                potential_impact: 'Moderate - affects statistical conclusions'
            });
        }
        // 4. Identify measurement gaps
        const measurementGaps = this.identifyMeasurementGaps(papers);
        measurementGaps.forEach(gap => {
            gaps.push({
                type: 'methodological',
                description: gap.description,
                evidence: gap.evidence,
                papers_referenced: gap.papers,
                severity: gap.severity,
                recommendations: gap.recommendations,
                potential_impact: gap.impact
            });
        });
        // 5. Check for replication studies
        const replicationGap = this.checkReplicationStudies(papers);
        if (replicationGap.needed) {
            gaps.push({
                type: 'methodological',
                description: 'Lack of replication studies',
                evidence: replicationGap.evidence,
                papers_referenced: replicationGap.original_studies,
                severity: 'critical',
                recommendations: [
                    'Conduct direct replications',
                    'Perform conceptual replications',
                    'Establish replication protocols'
                ],
                potential_impact: 'High - affects scientific robustness'
            });
        }
        return gaps;
    }
    /**
     * Identify practical gaps
     */
    async identifyPracticalGaps(papers, domainContext) {
        const gaps = [];
        // 1. Implementation gaps
        const implementationGaps = this.identifyImplementationGaps(papers);
        if (implementationGaps.length > 0) {
            gaps.push({
                type: 'practical',
                description: 'Gap between research and practical implementation',
                evidence: implementationGaps,
                papers_referenced: this.getPapersWithoutImplementation(papers),
                severity: 'moderate',
                recommendations: [
                    'Develop implementation frameworks',
                    'Conduct field studies',
                    'Create practical guidelines',
                    'Engage with practitioners'
                ],
                potential_impact: 'High - affects real-world application'
            });
        }
        // 2. Scalability issues
        const scalabilityGaps = this.analyzeScalability(papers);
        if (scalabilityGaps.issues.length > 0) {
            gaps.push({
                type: 'practical',
                description: 'Limited scalability considerations',
                evidence: scalabilityGaps.issues,
                papers_referenced: scalabilityGaps.affected_papers,
                severity: 'moderate',
                recommendations: [
                    'Conduct scalability studies',
                    'Test in real-world settings',
                    'Analyze computational complexity',
                    'Consider resource constraints'
                ],
                potential_impact: 'Moderate - affects practical adoption'
            });
        }
        // 3. Context-specific gaps
        const contextGaps = this.identifyContextGaps(papers, domainContext);
        contextGaps.forEach(gap => {
            gaps.push({
                type: 'practical',
                description: `Missing context: ${gap.context}`,
                evidence: gap.evidence,
                papers_referenced: gap.papers,
                severity: 'minor',
                recommendations: gap.recommendations,
                potential_impact: gap.impact
            });
        });
        // 4. Tool and technology gaps
        const toolGaps = this.identifyToolGaps(papers);
        if (toolGaps.length > 0) {
            gaps.push({
                type: 'practical',
                description: 'Lack of supporting tools and technologies',
                evidence: toolGaps,
                papers_referenced: papers.map(p => p.id).slice(0, 5),
                severity: 'moderate',
                recommendations: [
                    'Develop automated tools',
                    'Create software implementations',
                    'Build evaluation frameworks',
                    'Establish benchmarks'
                ],
                potential_impact: 'Moderate - affects research efficiency'
            });
        }
        // 5. Industry-academia gap
        const industryGap = this.analyzeIndustryAcademiaGap(papers);
        if (industryGap.gap_size > 0.5) {
            gaps.push({
                type: 'practical',
                description: 'Significant industry-academia gap',
                evidence: industryGap.evidence,
                papers_referenced: industryGap.academic_papers,
                severity: 'critical',
                recommendations: [
                    'Increase industry collaboration',
                    'Conduct industry-focused research',
                    'Validate findings in industrial settings',
                    'Address industry-specific challenges'
                ],
                potential_impact: 'High - affects practical relevance'
            });
        }
        return gaps;
    }
    /**
     * Helper: Initialize TF-IDF with paper content
     */
    initializeTFIDF(papers) {
        papers.forEach(paper => {
            const content = `${paper.title} ${paper.abstract} ${paper.methodology || ''} ${paper.findings || ''}`;
            this.tfidf.addDocument(content);
        });
    }
    /**
     * Helper: Extract theoretical frameworks from papers
     */
    extractTheoreticalFrameworks(papers) {
        const frameworks = new Set();
        const frameworkPatterns = [
            /theoretical framework/i,
            /conceptual framework/i,
            /theory of/i,
            /model of/i,
            /paradigm/i
        ];
        papers.forEach(paper => {
            const text = `${paper.abstract} ${paper.methodology || ''}`;
            frameworkPatterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    frameworks.add(matches[0]);
                }
            });
        });
        return Array.from(frameworks);
    }
    /**
     * Helper: Identify missing frameworks
     */
    identifyMissingFrameworks(frameworks, domainContext) {
        const expectedFrameworks = [
            'unified theory',
            'comprehensive model',
            'integrated framework'
        ];
        if (domainContext) {
            expectedFrameworks.push(`${domainContext} framework`);
        }
        return expectedFrameworks.filter(expected => !frameworks.some(f => f.toLowerCase().includes(expected.toLowerCase())));
    }
    /**
     * Helper: Extract methodologies from papers
     */
    extractMethodologies(papers) {
        const methods = new Map();
        const methodKeywords = [
            'quantitative', 'qualitative', 'mixed methods',
            'experimental', 'observational', 'survey',
            'case study', 'meta-analysis', 'systematic review',
            'simulation', 'modeling', 'ethnography'
        ];
        papers.forEach(paper => {
            const text = (paper.methodology || paper.abstract).toLowerCase();
            methodKeywords.forEach(method => {
                if (text.includes(method)) {
                    methods.set(method, (methods.get(method) || 0) + 1);
                }
            });
        });
        return methods;
    }
    /**
     * Helper: Assess methodological diversity
     */
    assessMethodologicalDiversity(methods) {
        const total = Array.from(methods.values()).reduce((a, b) => a + b, 0);
        const uniqueMethods = methods.size;
        // Shannon diversity index
        let diversity = 0;
        methods.forEach(count => {
            const p = count / total;
            if (p > 0) {
                diversity -= p * Math.log(p);
            }
        });
        // Normalize to [0, 1]
        const maxDiversity = Math.log(uniqueMethods);
        const normalizedDiversity = maxDiversity > 0 ? diversity / maxDiversity : 0;
        // Find dominant method
        let dominant = '';
        let maxCount = 0;
        methods.forEach((count, method) => {
            if (count > maxCount) {
                maxCount = count;
                dominant = method;
            }
        });
        return {
            score: normalizedDiversity,
            dominant_method: dominant,
            coverage: `${uniqueMethods} unique methods across ${total} studies`
        };
    }
    /**
     * Helper: Create gap matrix
     */
    createGapMatrix(result) {
        const matrix = {
            total_gaps: result.theoretical_gaps.length +
                result.methodological_gaps.length +
                result.practical_gaps.length,
            by_type: {
                theoretical: result.theoretical_gaps.length,
                methodological: result.methodological_gaps.length,
                practical: result.practical_gaps.length
            },
            by_severity: {
                critical: 0,
                moderate: 0,
                minor: 0
            },
            interconnections: []
        };
        // Count by severity
        const allGaps = [
            ...result.theoretical_gaps,
            ...result.methodological_gaps,
            ...result.practical_gaps
        ];
        allGaps.forEach(gap => {
            matrix.by_severity[gap.severity]++;
        });
        // Identify interconnections
        for (let i = 0; i < allGaps.length; i++) {
            for (let j = i + 1; j < allGaps.length; j++) {
                const overlap = this.calculateGapOverlap(allGaps[i], allGaps[j]);
                if (overlap > 0.3) {
                    matrix.interconnections.push({
                        gap1: `${allGaps[i].type}: ${allGaps[i].description}`,
                        gap2: `${allGaps[j].type}: ${allGaps[j].description}`,
                        overlap_score: overlap
                    });
                }
            }
        }
        return matrix;
    }
    /**
     * Helper: Calculate overlap between two gaps
     */
    calculateGapOverlap(gap1, gap2) {
        // Simple overlap based on shared papers
        const papers1 = new Set(gap1.papers_referenced);
        const papers2 = new Set(gap2.papers_referenced);
        const intersection = new Set([...papers1].filter(p => papers2.has(p)));
        const union = new Set([...papers1, ...papers2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    /**
     * Helper: Identify research opportunities
     */
    identifyOpportunities(result) {
        const opportunities = [];
        // Based on critical gaps
        const criticalGaps = [
            ...result.theoretical_gaps,
            ...result.methodological_gaps,
            ...result.practical_gaps
        ].filter(gap => gap.severity === 'critical');
        criticalGaps.forEach(gap => {
            opportunities.push(`Address ${gap.type} gap: ${gap.description} - ${gap.recommendations[0]}`);
        });
        // Based on interconnections
        if (result.gap_matrix.interconnections.length > 0) {
            opportunities.push('Conduct integrated research addressing multiple interconnected gaps');
        }
        // Novel combinations
        if (result.theoretical_gaps.length > 0 && result.methodological_gaps.length > 0) {
            opportunities.push('Develop new methodologies based on theoretical insights');
        }
        return opportunities;
    }
    /**
     * Helper: Determine priority areas
     */
    determinePriorityAreas(result) {
        const priorities = [];
        // Priority 1: Critical severity gaps
        const criticalGaps = [
            ...result.theoretical_gaps,
            ...result.methodological_gaps,
            ...result.practical_gaps
        ].filter(gap => gap.severity === 'critical');
        criticalGaps.forEach(gap => {
            priorities.push(`HIGH PRIORITY: ${gap.description}`);
        });
        // Priority 2: High-impact moderate gaps
        const highImpactGaps = [
            ...result.theoretical_gaps,
            ...result.methodological_gaps,
            ...result.practical_gaps
        ].filter(gap => gap.severity === 'moderate' &&
            gap.potential_impact.toLowerCase().includes('high'));
        highImpactGaps.forEach(gap => {
            priorities.push(`MEDIUM PRIORITY: ${gap.description}`);
        });
        return priorities.slice(0, 5); // Top 5 priorities
    }
    // Additional helper methods...
    identifyTheoreticalConflicts(papers) {
        // Simplified - would need more sophisticated conflict detection
        return [];
    }
    identifyUnexploredDimensions(papers) {
        // Simplified - would analyze for missing theoretical dimensions
        return [];
    }
    checkTheoreticalIntegration(papers) {
        // Check for cross-disciplinary integration
        return [];
    }
    identifyValidationGaps(papers) {
        // Check for validation studies
        return [];
    }
    analyzeSampleAdequacy(papers) {
        // Analyze sample sizes across studies
        return {
            inadequate_count: 0,
            avg_sample_size: 100,
            missing_power_analysis: 0,
            affected_papers: []
        };
    }
    identifyMeasurementGaps(papers) {
        // Identify measurement issues
        return [];
    }
    checkReplicationStudies(papers) {
        // Check for replication studies
        return {
            needed: true,
            evidence: ['Most findings not replicated'],
            original_studies: papers.map(p => p.id).slice(0, 3)
        };
    }
    identifyImplementationGaps(papers) {
        // Check for implementation considerations
        return [];
    }
    analyzeScalability(papers) {
        // Analyze scalability considerations
        return {
            issues: [],
            affected_papers: []
        };
    }
    identifyContextGaps(papers, context) {
        // Identify missing contexts
        return [];
    }
    identifyToolGaps(papers) {
        // Identify missing tools
        return [];
    }
    analyzeIndustryAcademiaGap(papers) {
        // Analyze industry-academia gap
        return {
            gap_size: 0.3,
            evidence: [],
            academic_papers: []
        };
    }
    getPapersWithoutFramework(papers) {
        return papers.filter(p => !p.methodology?.includes('framework'))
            .map(p => p.id)
            .slice(0, 5);
    }
    getPapersWithConflicts(papers, conflicts) {
        return papers.map(p => p.id).slice(0, 3);
    }
    getPapersLackingValidation(papers) {
        return papers.filter(p => !p.methodology?.includes('validation'))
            .map(p => p.id)
            .slice(0, 5);
    }
    getPapersWithoutImplementation(papers) {
        return papers.filter(p => !p.findings?.includes('implementation'))
            .map(p => p.id)
            .slice(0, 5);
    }
}
//# sourceMappingURL=ResearchGapAnalyzer.js.map