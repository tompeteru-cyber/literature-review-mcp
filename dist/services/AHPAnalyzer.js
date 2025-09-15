import { create, all } from 'mathjs';
const math = create(all);
export class AHPAnalyzer {
    RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    /**
     * Perform complete AHP analysis on papers
     */
    async performAHP(papers, criteria, pairwiseComparisons) {
        // Step 1: Calculate criteria weights from pairwise comparisons
        const criteriaWeights = pairwiseComparisons
            ? this.calculateWeights(pairwiseComparisons)
            : this.extractWeights(criteria);
        // Step 2: Normalize criteria weights
        const normalizedWeights = this.normalizeWeights(criteriaWeights);
        // Step 3: Score each paper against each criterion
        const paperScores = await this.scorePapers(papers, criteria);
        // Step 4: Calculate final scores using weighted sum
        const ahpResults = this.calculateFinalScores(papers, paperScores, normalizedWeights);
        // Step 5: Perform consistency check
        const consistencyAnalysis = pairwiseComparisons
            ? this.checkConsistency(pairwiseComparisons)
            : { consistent: true, ratio: 0 };
        // Step 6: Perform sensitivity analysis
        const sensitivityAnalysis = this.performSensitivityAnalysis(ahpResults, normalizedWeights, paperScores);
        // Sort papers by final score
        ahpResults.sort((a, b) => b.final_score - a.final_score);
        // Assign ranks
        ahpResults.forEach((result, index) => {
            result.rank = index + 1;
        });
        return {
            ranked_papers: ahpResults,
            criteria_weights: normalizedWeights,
            consistency_analysis: consistencyAnalysis,
            sensitivity_analysis: sensitivityAnalysis
        };
    }
    /**
     * Calculate weights from pairwise comparison matrix
     */
    calculateWeights(comparison) {
        const n = comparison.matrix.length;
        const matrix = math.matrix(comparison.matrix);
        // Calculate eigenvector using power method
        let eigenvector = math.ones(n, 1);
        const maxIterations = 100;
        const tolerance = 1e-6;
        for (let i = 0; i < maxIterations; i++) {
            const newVector = math.multiply(matrix, eigenvector);
            const norm = math.norm(newVector);
            const normalized = math.divide(newVector, norm);
            const diff = math.subtract(normalized, eigenvector);
            if (math.norm(diff) < tolerance) {
                eigenvector = normalized;
                break;
            }
            eigenvector = normalized;
        }
        // Convert to weights map
        const weights = new Map();
        const vectorArray = eigenvector.toArray();
        comparison.criteria.forEach((criterion, index) => {
            weights.set(criterion, vectorArray[index]);
        });
        return weights;
    }
    /**
     * Extract weights directly from criteria definition
     */
    extractWeights(criteria) {
        const weights = new Map();
        const extractRecursive = (criterionList, parentWeight = 1) => {
            criterionList.forEach(criterion => {
                const weight = criterion.weight * parentWeight;
                weights.set(criterion.name, weight);
                if (criterion.sub_criteria) {
                    extractRecursive(criterion.sub_criteria, weight);
                }
            });
        };
        extractRecursive(criteria);
        return weights;
    }
    /**
     * Normalize weights to sum to 1
     */
    normalizeWeights(weights) {
        const sum = Array.from(weights.values()).reduce((a, b) => a + b, 0);
        const normalized = new Map();
        weights.forEach((weight, criterion) => {
            normalized.set(criterion, weight / sum);
        });
        return normalized;
    }
    /**
     * Score papers against each criterion
     */
    async scorePapers(papers, criteria) {
        const scores = new Map();
        // Initialize score maps for each paper
        papers.forEach(paper => {
            scores.set(paper.id, new Map());
        });
        // Score each paper on each criterion
        const flatCriteria = this.flattenCriteria(criteria);
        for (const criterion of flatCriteria) {
            const criterionScores = await this.scoreCriterion(papers, criterion);
            papers.forEach(paper => {
                scores.get(paper.id).set(criterion.name, criterionScores.get(paper.id));
            });
        }
        return scores;
    }
    /**
     * Score papers on a specific criterion
     */
    async scoreCriterion(papers, criterion) {
        const scores = new Map();
        // Different scoring methods based on criterion name
        switch (criterion.name.toLowerCase()) {
            case 'relevance':
                papers.forEach(paper => {
                    const score = this.calculateRelevanceScore(paper);
                    scores.set(paper.id, score);
                });
                break;
            case 'methodology':
                papers.forEach(paper => {
                    const score = this.calculateMethodologyScore(paper);
                    scores.set(paper.id, score);
                });
                break;
            case 'impact':
                papers.forEach(paper => {
                    const score = this.calculateImpactScore(paper);
                    scores.set(paper.id, score);
                });
                break;
            case 'recency':
                papers.forEach(paper => {
                    const score = this.calculateRecencyScore(paper);
                    scores.set(paper.id, score);
                });
                break;
            case 'quality':
                papers.forEach(paper => {
                    const score = this.calculateQualityScore(paper);
                    scores.set(paper.id, score);
                });
                break;
            default:
                // Generic scoring based on keywords
                papers.forEach(paper => {
                    const score = this.calculateGenericScore(paper, criterion.name);
                    scores.set(paper.id, score);
                });
        }
        // Normalize scores to [0, 1]
        return this.normalizeScores(scores);
    }
    /**
     * Calculate final AHP scores
     */
    calculateFinalScores(papers, paperScores, weights) {
        const results = [];
        papers.forEach(paper => {
            const scores = paperScores.get(paper.id);
            let finalScore = 0;
            weights.forEach((weight, criterion) => {
                const score = scores.get(criterion) || 0;
                finalScore += score * weight;
            });
            results.push({
                paper_id: paper.id,
                final_score: finalScore,
                criteria_scores: scores,
                consistency_ratio: 0, // Will be updated if pairwise comparisons provided
                rank: 0 // Will be assigned after sorting
            });
        });
        return results;
    }
    /**
     * Check consistency of pairwise comparison matrix
     */
    checkConsistency(comparison) {
        const n = comparison.matrix.length;
        const matrix = math.matrix(comparison.matrix);
        // Calculate maximum eigenvalue
        const eigenvalues = math.eigs(matrix).values;
        const maxEigenvalue = Math.max(...eigenvalues.toArray());
        // Calculate Consistency Index (CI)
        const CI = (maxEigenvalue - n) / (n - 1);
        // Calculate Consistency Ratio (CR)
        const RI = this.RI[Math.min(n - 1, this.RI.length - 1)];
        const CR = RI > 0 ? CI / RI : 0;
        // Interpret consistency
        let interpretation;
        if (CR <= 0.1) {
            interpretation = 'Excellent consistency';
        }
        else if (CR <= 0.2) {
            interpretation = 'Acceptable consistency';
        }
        else {
            interpretation = 'Poor consistency - reconsider comparisons';
        }
        return {
            consistent: CR <= 0.1,
            ratio: CR,
            eigenvalue: maxEigenvalue,
            interpretation
        };
    }
    /**
     * Perform sensitivity analysis
     */
    performSensitivityAnalysis(results, weights, paperScores) {
        const sensitivity = {
            weight_variations: new Map(),
            rank_stability: new Map(),
            critical_criteria: []
        };
        // Test weight variations for each criterion
        weights.forEach((originalWeight, criterion) => {
            const variations = [-0.1, -0.05, 0.05, 0.1];
            const rankChanges = [];
            variations.forEach(variation => {
                const newWeights = new Map(weights);
                newWeights.set(criterion, Math.max(0, Math.min(1, originalWeight + variation)));
                // Renormalize
                const sum = Array.from(newWeights.values()).reduce((a, b) => a + b, 0);
                newWeights.forEach((w, c) => newWeights.set(c, w / sum));
                // Recalculate scores
                const newResults = this.calculateFinalScores(results.map(r => ({ id: r.paper_id })), paperScores, newWeights);
                // Calculate rank changes
                const rankChange = this.calculateRankChange(results, newResults);
                rankChanges.push(rankChange);
            });
            sensitivity.weight_variations.set(criterion, {
                max_rank_change: Math.max(...rankChanges),
                avg_rank_change: math.mean(rankChanges),
                stability: Math.max(...rankChanges) <= 2 ? 'Stable' : 'Sensitive'
            });
        });
        // Identify critical criteria
        sensitivity.weight_variations.forEach((analysis, criterion) => {
            if (analysis.stability === 'Sensitive') {
                sensitivity.critical_criteria.push(criterion);
            }
        });
        return sensitivity;
    }
    /**
     * Helper: Calculate rank change between two result sets
     */
    calculateRankChange(original, modified) {
        let totalChange = 0;
        original.forEach((orig, index) => {
            const modIndex = modified.findIndex(m => m.paper_id === orig.paper_id);
            totalChange += Math.abs(index - modIndex);
        });
        return totalChange / original.length;
    }
    /**
     * Helper: Flatten nested criteria
     */
    flattenCriteria(criteria) {
        const flat = [];
        const flatten = (criterionList) => {
            criterionList.forEach(criterion => {
                flat.push(criterion);
                if (criterion.sub_criteria) {
                    flatten(criterion.sub_criteria);
                }
            });
        };
        flatten(criteria);
        return flat;
    }
    /**
     * Helper: Normalize scores to [0, 1]
     */
    normalizeScores(scores) {
        const values = Array.from(scores.values());
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const normalized = new Map();
        scores.forEach((score, id) => {
            normalized.set(id, range > 0 ? (score - min) / range : 0.5);
        });
        return normalized;
    }
    // Scoring functions for different criteria
    calculateRelevanceScore(paper) {
        // Simplified relevance scoring
        let score = 0;
        if (paper.title)
            score += 0.3;
        if (paper.abstract && paper.abstract.length > 100)
            score += 0.4;
        if (paper.keywords && paper.keywords.length > 3)
            score += 0.3;
        return score;
    }
    calculateMethodologyScore(paper) {
        if (!paper.methodology)
            return 0.2;
        const methodKeywords = ['quantitative', 'qualitative', 'experimental',
            'statistical', 'validation', 'framework'];
        let score = 0.3; // Base score
        methodKeywords.forEach(keyword => {
            if (paper.methodology.toLowerCase().includes(keyword)) {
                score += 0.1;
            }
        });
        return Math.min(1, score);
    }
    calculateImpactScore(paper) {
        // Logarithmic scaling for citations
        const citationScore = Math.min(1, Math.log10(paper.citations + 1) / 3);
        return citationScore;
    }
    calculateRecencyScore(paper) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - paper.year;
        return Math.max(0, 1 - (age / 20)); // Linear decay over 20 years
    }
    calculateQualityScore(paper) {
        let score = 0;
        // Journal quality (simplified)
        const topJournals = ['Nature', 'Science', 'IEEE', 'ACM'];
        if (topJournals.some(j => paper.journal.includes(j))) {
            score += 0.5;
        }
        else {
            score += 0.2;
        }
        // Completeness
        if (paper.abstract)
            score += 0.2;
        if (paper.methodology)
            score += 0.2;
        if (paper.findings)
            score += 0.1;
        return score;
    }
    calculateGenericScore(paper, criterion) {
        // Generic scoring based on text matching
        const text = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`.toLowerCase();
        const criterionLower = criterion.toLowerCase();
        if (text.includes(criterionLower)) {
            return 0.8;
        }
        else if (text.includes(criterionLower.substring(0, 4))) {
            return 0.5;
        }
        else {
            return 0.2;
        }
    }
}
//# sourceMappingURL=AHPAnalyzer.js.map