import natural from 'natural';
import { create, all } from 'mathjs';
const math = create(all);
export class TierFilteringSystem {
    tfidf;
    tokenizer;
    sentimentAnalyzer;
    constructor() {
        this.tfidf = new natural.TfIdf();
        this.tokenizer = new natural.WordTokenizer();
        this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    }
    /**
     * Tier 1: Initial Filtering Framework
     * Basic filtering based on keywords, citations, and journal quality
     */
    async applyTier1(papers, criteria) {
        const accepted = [];
        const rejected = [];
        const rejectionReasons = new Map();
        for (const paper of papers) {
            const reasons = [];
            let accept = true;
            // Check keyword presence
            if (criteria.keywords.length > 0) {
                const text = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`.toLowerCase();
                const hasKeywords = criteria.keywords.some(keyword => text.includes(keyword.toLowerCase()));
                if (!hasKeywords) {
                    accept = false;
                    reasons.push('Missing required keywords');
                }
            }
            // Check exclusion keywords
            if (criteria.exclude_keywords.length > 0) {
                const text = `${paper.title} ${paper.abstract}`.toLowerCase();
                const hasExcluded = criteria.exclude_keywords.some(keyword => text.includes(keyword.toLowerCase()));
                if (hasExcluded) {
                    accept = false;
                    reasons.push('Contains excluded keywords');
                }
            }
            // Check citation count
            if (paper.citations < criteria.min_citations) {
                accept = false;
                reasons.push(`Citations (${paper.citations}) below threshold (${criteria.min_citations})`);
            }
            // Check journal quality (simplified - would use real journal rankings)
            if (criteria.journal_quality === 'high' && !this.isHighQualityJournal(paper.journal)) {
                accept = false;
                reasons.push('Journal quality below threshold');
            }
            // Language check (simplified)
            if (criteria.language && !paper.abstract.match(/[a-zA-Z]/)) {
                accept = false;
                reasons.push('Language criteria not met');
            }
            if (accept) {
                accepted.push(paper);
            }
            else {
                rejected.push(paper);
                rejectionReasons.set(paper.id, reasons);
            }
        }
        const statistics = {
            total_papers: papers.length,
            accepted_count: accepted.length,
            rejected_count: rejected.length,
            acceptance_rate: (accepted.length / papers.length * 100).toFixed(2) + '%',
            rejection_reasons: Object.fromEntries(rejectionReasons),
            keyword_coverage: this.calculateKeywordCoverage(accepted, criteria.keywords)
        };
        return { accepted, rejected, statistics };
    }
    /**
     * Tier 2: Advanced Relevance Analysis
     * Semantic analysis and weighted scoring
     */
    async applyTier2(papers, weights, semanticAnalysis = true) {
        const defaultWeights = {
            title_weight: 0.3,
            abstract_weight: 0.4,
            methodology_weight: 0.2,
            recency_weight: 0.1
        };
        const w = weights || defaultWeights;
        // Add papers to TF-IDF for semantic analysis
        papers.forEach(paper => {
            this.tfidf.addDocument(`${paper.title} ${paper.abstract} ${paper.methodology || ''}`);
        });
        const scoredPapers = papers.map((paper, index) => {
            let score = 0;
            // Title relevance (using TF-IDF)
            const titleTerms = this.tfidf.listTerms(index);
            const titleScore = titleTerms.slice(0, 10).reduce((sum, term) => sum + term.tfidf, 0) / 10;
            score += titleScore * w.title_weight;
            // Abstract quality and relevance
            const abstractScore = this.calculateAbstractQuality(paper.abstract);
            score += abstractScore * w.abstract_weight;
            // Methodology completeness
            if (paper.methodology) {
                const methodScore = this.assessMethodology(paper.methodology);
                score += methodScore * w.methodology_weight;
            }
            // Recency score
            const currentYear = new Date().getFullYear();
            const age = currentYear - paper.year;
            const recencyScore = Math.max(0, 1 - (age / 10)); // Decay over 10 years
            score += recencyScore * w.recency_weight;
            return {
                ...paper,
                relevance_score: score
            };
        });
        // Sort by relevance score
        scoredPapers.sort((a, b) => b.relevance_score - a.relevance_score);
        // Perform semantic clustering if requested
        let semanticClusters = {};
        if (semanticAnalysis) {
            semanticClusters = await this.performSemanticClustering(papers);
        }
        // Calculate relevance distribution
        const scores = scoredPapers.map(p => p.relevance_score);
        const relevanceDistribution = {
            mean: math.mean(scores),
            median: math.median(scores),
            std: math.std(scores),
            quartiles: {
                q1: math.quantileSeq(scores, 0.25),
                q2: math.quantileSeq(scores, 0.5),
                q3: math.quantileSeq(scores, 0.75)
            },
            threshold_recommendations: {
                strict: math.quantileSeq(scores, 0.75),
                moderate: math.quantileSeq(scores, 0.5),
                inclusive: math.quantileSeq(scores, 0.25)
            }
        };
        return {
            ranked_papers: scoredPapers,
            semantic_clusters: semanticClusters,
            relevance_distribution: relevanceDistribution
        };
    }
    /**
     * Helper: Check if journal is high quality
     */
    isHighQualityJournal(journal) {
        const highQualityJournals = [
            'Nature', 'Science', 'Cell', 'PNAS', 'IEEE', 'ACM',
            'Elsevier', 'Springer', 'Wiley', 'Taylor & Francis'
        ];
        return highQualityJournals.some(hq => journal.toLowerCase().includes(hq.toLowerCase()));
    }
    /**
     * Helper: Calculate keyword coverage
     */
    calculateKeywordCoverage(papers, keywords) {
        const coverage = new Map();
        keywords.forEach(keyword => {
            const count = papers.filter(paper => {
                const text = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`.toLowerCase();
                return text.includes(keyword.toLowerCase());
            }).length;
            coverage.set(keyword, count);
        });
        return Object.fromEntries(coverage);
    }
    /**
     * Helper: Calculate abstract quality score
     */
    calculateAbstractQuality(abstract) {
        if (!abstract)
            return 0;
        let score = 0;
        // Length score (optimal 150-300 words)
        const wordCount = abstract.split(/\s+/).length;
        if (wordCount >= 150 && wordCount <= 300) {
            score += 0.3;
        }
        else if (wordCount >= 100 && wordCount <= 400) {
            score += 0.2;
        }
        else {
            score += 0.1;
        }
        // Structure indicators
        const hasObjective = /objective|aim|purpose/i.test(abstract);
        const hasMethod = /method|approach|technique/i.test(abstract);
        const hasResults = /result|finding|outcome/i.test(abstract);
        const hasConclusion = /conclusion|implication|significance/i.test(abstract);
        const structureScore = [hasObjective, hasMethod, hasResults, hasConclusion]
            .filter(Boolean).length / 4;
        score += structureScore * 0.4;
        // Clarity (simplified - based on sentence complexity)
        const sentences = abstract.split(/[.!?]+/);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
        if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
            score += 0.3; // Optimal sentence length
        }
        else if (avgSentenceLength >= 10 && avgSentenceLength <= 30) {
            score += 0.2;
        }
        else {
            score += 0.1;
        }
        return score;
    }
    /**
     * Helper: Assess methodology quality
     */
    assessMethodology(methodology) {
        if (!methodology)
            return 0;
        let score = 0;
        // Check for key methodology components
        const components = [
            /data collection/i,
            /sampling/i,
            /analysis/i,
            /validation/i,
            /statistical/i,
            /qualitative|quantitative/i,
            /experimental|observational/i,
            /control/i,
            /hypothesis/i,
            /framework/i
        ];
        const presentComponents = components.filter(regex => regex.test(methodology));
        score = presentComponents.length / components.length;
        return score;
    }
    /**
     * Helper: Perform semantic clustering
     */
    async performSemanticClustering(papers) {
        // Simplified clustering using keyword co-occurrence
        const clusters = new Map();
        papers.forEach(paper => {
            const mainKeyword = paper.keywords[0] || 'uncategorized';
            if (!clusters.has(mainKeyword)) {
                clusters.set(mainKeyword, []);
            }
            clusters.get(mainKeyword).push(paper);
        });
        // Calculate cluster statistics
        const clusterStats = Array.from(clusters.entries()).map(([key, papers]) => ({
            cluster_name: key,
            paper_count: papers.length,
            avg_citations: math.mean(papers.map(p => p.citations)),
            year_range: {
                min: Math.min(...papers.map(p => p.year)),
                max: Math.max(...papers.map(p => p.year))
            },
            top_authors: this.getTopAuthors(papers, 5)
        }));
        return {
            clusters: Object.fromEntries(clusters),
            statistics: clusterStats,
            optimal_clusters: Math.ceil(Math.sqrt(papers.length / 2))
        };
    }
    /**
     * Helper: Get top authors from papers
     */
    getTopAuthors(papers, limit) {
        const authorCounts = new Map();
        papers.forEach(paper => {
            paper.authors.forEach(author => {
                authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
            });
        });
        return Array.from(authorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([author]) => author);
    }
}
//# sourceMappingURL=TierFilteringSystem.js.map