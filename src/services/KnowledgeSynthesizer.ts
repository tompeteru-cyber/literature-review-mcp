import natural from 'natural';
import { Paper } from './TierFilteringSystem.js';
import { create, all } from 'mathjs';

const math = create(all);

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
  time_period: { start: number; end: number };
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

export class KnowledgeSynthesizer {
  private tfidf: any;
  private tokenizer: any;
  private sentenceTokenizer: any;

  constructor() {
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
  }

  /**
   * Main synthesis method
   */
  async synthesize(
    papers: Paper[],
    themes: string[],
    synthesisType: string = 'thematic'
  ): Promise<SynthesisResult> {
    // Initialize TF-IDF with papers
    this.initializeTFIDF(papers);

    let result: SynthesisResult = {
      synthesis_type: synthesisType,
      themes: new Map(),
      narrative: '',
      key_findings: [],
      convergent_findings: [],
      divergent_findings: [],
      knowledge_evolution: {},
      future_directions: []
    };

    // Perform synthesis based on type
    switch (synthesisType) {
      case 'narrative':
        result = await this.narrativeSynthesis(papers, themes);
        break;
      case 'thematic':
        result = await this.thematicSynthesis(papers, themes);
        break;
      case 'chronological':
        result = await this.chronologicalSynthesis(papers, themes);
        break;
      case 'methodological':
        result = await this.methodologicalSynthesis(papers, themes);
        break;
      default:
        result = await this.thematicSynthesis(papers, themes);
    }

    // Extract key findings
    result.key_findings = this.extractKeyFindings(papers);

    // Identify convergent and divergent findings
    const { convergent, divergent } = this.identifyConvergentDivergent(papers);
    result.convergent_findings = convergent;
    result.divergent_findings = divergent;

    // Analyze knowledge evolution
    result.knowledge_evolution = this.analyzeKnowledgeEvolution(papers);

    // Suggest future directions
    result.future_directions = this.suggestFutureDirections(result);

    return result;
  }

  /**
   * Narrative synthesis
   */
  private async narrativeSynthesis(
    papers: Paper[], 
    themes: string[]
  ): Promise<SynthesisResult> {
    const result: SynthesisResult = this.initializeResult('narrative');

    // Create narrative structure
    const introduction = this.createIntroduction(papers, themes);
    const body = this.createNarrativeBody(papers, themes);
    const conclusion = this.createConclusion(papers, themes);

    result.narrative = `${introduction}\n\n${body}\n\n${conclusion}`;

    // Analyze themes within narrative
    for (const theme of themes) {
      const analysis = this.analyzeTheme(papers, theme);
      result.themes.set(theme, analysis);
    }

    return result;
  }

  /**
   * Thematic synthesis
   */
  private async thematicSynthesis(
    papers: Paper[], 
    themes: string[]
  ): Promise<SynthesisResult> {
    const result: SynthesisResult = this.initializeResult('thematic');

    // Identify and analyze each theme
    for (const theme of themes) {
      const analysis = this.analyzeTheme(papers, theme);
      result.themes.set(theme, analysis);
    }

    // Find theme relationships
    const relationships = this.findThemeRelationships(result.themes);
    
    // Create thematic narrative
    result.narrative = this.createThematicNarrative(result.themes, relationships);

    return result;
  }

  /**
   * Chronological synthesis
   */
  private async chronologicalSynthesis(
    papers: Paper[], 
    themes: string[]
  ): Promise<SynthesisResult> {
    const result: SynthesisResult = this.initializeResult('chronological');

    // Sort papers by year
    const sortedPapers = [...papers].sort((a, b) => a.year - b.year);

    // Identify time periods
    const periods = this.identifyTimePeriods(sortedPapers);

    // Analyze each period
    const periodAnalyses: Map<string, any> = new Map();
    for (const period of periods) {
      const periodPapers = sortedPapers.filter(p => 
        p.year >= period.start && p.year <= period.end
      );
      
      const analysis = {
        period: `${period.start}-${period.end}`,
        paper_count: periodPapers.length,
        dominant_themes: this.extractDominantThemes(periodPapers, themes),
        key_developments: this.extractKeyDevelopments(periodPapers),
        methodological_shifts: this.identifyMethodologicalShifts(periodPapers)
      };
      
      periodAnalyses.set(period.name, analysis);
    }

    // Create chronological narrative
    result.narrative = this.createChronologicalNarrative(periodAnalyses);

    // Analyze theme evolution over time
    for (const theme of themes) {
      const evolution = this.analyzeThemeEvolution(sortedPapers, theme);
      result.themes.set(theme, evolution);
    }

    result.knowledge_evolution = {
      periods: Array.from(periodAnalyses.entries()),
      timeline: this.createTimeline(sortedPapers)
    };

    return result;
  }

  /**
   * Methodological synthesis
   */
  private async methodologicalSynthesis(
    papers: Paper[], 
    themes: string[]
  ): Promise<SynthesisResult> {
    const result: SynthesisResult = this.initializeResult('methodological');

    // Group papers by methodology
    const methodGroups = this.groupByMethodology(papers);

    // Analyze each methodological approach
    const methodAnalyses: Map<string, any> = new Map();
    for (const [method, methodPapers] of methodGroups) {
      const analysis = {
        method,
        paper_count: methodPapers.length,
        strengths: this.identifyMethodStrengths(method, methodPapers),
        limitations: this.identifyMethodLimitations(method, methodPapers),
        findings: this.synthesizeMethodFindings(methodPapers),
        quality_score: this.assessMethodQuality(methodPapers)
      };
      
      methodAnalyses.set(method, analysis);
    }

    // Create methodological narrative
    result.narrative = this.createMethodologicalNarrative(methodAnalyses);

    // Analyze themes across methods
    for (const theme of themes) {
      const crossMethodAnalysis = this.analyzeCrossMethod(methodGroups, theme);
      result.themes.set(theme, crossMethodAnalysis);
    }

    return result;
  }

  /**
   * Analyze trends over time
   */
  async analyzeTrends(
    papers: Paper[],
    timePeriod?: { start_year: number; end_year: number },
    trendMetrics?: string[]
  ): Promise<TrendAnalysis> {
    // Set time period
    const startYear = timePeriod?.start_year || Math.min(...papers.map(p => p.year));
    const endYear = timePeriod?.end_year || Math.max(...papers.map(p => p.year));

    const result: TrendAnalysis = {
      time_period: { start: startYear, end: endYear },
      trends: new Map(),
      emerging_topics: [],
      declining_topics: [],
      stable_topics: [],
      breakpoints: [],
      forecast: {}
    };

    // Extract topics from papers
    const topics = this.extractTopics(papers);

    // Analyze each topic's trend
    for (const topic of topics) {
      const trendData = this.analyzeSingleTrend(papers, topic, startYear, endYear);
      result.trends.set(topic, trendData);

      // Categorize trends
      switch (trendData.trend_type) {
        case 'emerging':
          result.emerging_topics.push(topic);
          break;
        case 'declining':
          result.declining_topics.push(topic);
          break;
        case 'stable':
          result.stable_topics.push(topic);
          break;
      }
    }

    // Identify breakpoints (significant changes)
    result.breakpoints = this.identifyBreakpoints(result.trends);

    // Generate forecast
    result.forecast = this.generateForecast(result.trends);

    // Apply custom metrics if provided
    if (trendMetrics) {
      for (const metric of trendMetrics) {
        result.forecast[metric] = this.calculateCustomMetric(papers, metric);
      }
    }

    return result;
  }

  // Helper methods
  private initializeTFIDF(papers: Paper[]): void {
    papers.forEach(paper => {
      const content = `${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`;
      this.tfidf.addDocument(content);
    });
  }

  private initializeResult(type: string): SynthesisResult {
    return {
      synthesis_type: type,
      themes: new Map(),
      narrative: '',
      key_findings: [],
      convergent_findings: [],
      divergent_findings: [],
      knowledge_evolution: {},
      future_directions: []
    };
  }

  private analyzeTheme(papers: Paper[], theme: string): ThemeAnalysis {
    const relevantPapers = papers.filter(p => {
      const text = `${p.title} ${p.abstract} ${p.keywords.join(' ')}`.toLowerCase();
      return text.includes(theme.toLowerCase());
    });

    const concepts = this.extractKeyConcepts(relevantPapers, theme);
    const evolution = this.describeEvolution(relevantPapers);
    const consensus = this.calculateConsensus(relevantPapers);

    return {
      theme,
      papers: relevantPapers.map(p => p.id),
      key_concepts: concepts,
      evolution,
      consensus_level: consensus,
      evidence_strength: this.assessEvidenceStrength(relevantPapers)
    };
  }

  private extractKeyConcepts(papers: Paper[], theme: string): string[] {
    const concepts: Map<string, number> = new Map();

    papers.forEach(paper => {
      const text = `${paper.abstract}`;
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      
      tokens.forEach(token => {
        if (token.length > 4 && !this.isStopWord(token)) {
          concepts.set(token, (concepts.get(token) || 0) + 1);
        }
      });
    });

    // Sort by frequency and return top concepts
    return Array.from(concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept]) => concept);
  }

  private describeEvolution(papers: Paper[]): string {
    if (papers.length === 0) return 'No evolution data';

    const sortedPapers = [...papers].sort((a, b) => a.year - b.year);
    const yearSpan = sortedPapers[sortedPapers.length - 1].year - sortedPapers[0].year;

    if (yearSpan === 0) return 'Single time point';
    if (yearSpan < 5) return 'Recent development';
    if (yearSpan < 10) return 'Evolving field';
    return 'Mature research area';
  }

  private calculateConsensus(papers: Paper[]): number {
    if (papers.length < 2) return 1;

    // Simplified consensus calculation based on keyword overlap
    let totalOverlap = 0;
    let comparisons = 0;

    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const overlap = this.calculateKeywordOverlap(papers[i], papers[j]);
        totalOverlap += overlap;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalOverlap / comparisons : 0;
  }

  private calculateKeywordOverlap(paper1: Paper, paper2: Paper): number {
    const keywords1 = new Set(paper1.keywords);
    const keywords2 = new Set(paper2.keywords);
    
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private assessEvidenceStrength(papers: Paper[]): string {
    const avgCitations = papers.reduce((sum, p) => sum + p.citations, 0) / papers.length;
    const paperCount = papers.length;

    if (paperCount > 20 && avgCitations > 50) return 'Strong';
    if (paperCount > 10 && avgCitations > 20) return 'Moderate';
    if (paperCount > 5) return 'Emerging';
    return 'Limited';
  }

  private extractKeyFindings(papers: Paper[]): string[] {
    const findings: string[] = [];

    // Extract from paper findings if available
    papers.forEach(paper => {
      if (paper.findings) {
        const sentences = this.sentenceTokenizer.tokenize(paper.findings);
        findings.push(...sentences.slice(0, 2));
      }
    });

    // Deduplicate and limit
    return [...new Set(findings)].slice(0, 10);
  }

  private identifyConvergentDivergent(papers: Paper[]): {
    convergent: string[];
    divergent: string[];
  } {
    // Simplified - would need more sophisticated analysis
    return {
      convergent: [
        'Consistent evidence for methodological approaches',
        'Agreement on theoretical frameworks'
      ],
      divergent: [
        'Conflicting results on effectiveness',
        'Disagreement on optimal parameters'
      ]
    };
  }

  private analyzeKnowledgeEvolution(papers: Paper[]): any {
    const yearGroups = this.groupByYear(papers);
    const evolution: any[] = [];

    yearGroups.forEach((papers, year) => {
      evolution.push({
        year,
        paper_count: papers.length,
        avg_citations: papers.reduce((sum, p) => sum + p.citations, 0) / papers.length,
        key_topics: this.extractTopics(papers).slice(0, 5)
      });
    });

    return {
      timeline: evolution,
      growth_rate: this.calculateGrowthRate(evolution),
      maturity: this.assessFieldMaturity(evolution)
    };
  }

  private groupByYear(papers: Paper[]): Map<number, Paper[]> {
    const groups = new Map<number, Paper[]>();
    
    papers.forEach(paper => {
      if (!groups.has(paper.year)) {
        groups.set(paper.year, []);
      }
      groups.get(paper.year)!.push(paper);
    });

    return groups;
  }

  private calculateGrowthRate(evolution: any[]): number {
    if (evolution.length < 2) return 0;

    const firstYear = evolution[0].paper_count;
    const lastYear = evolution[evolution.length - 1].paper_count;
    const years = evolution.length;

    return ((lastYear - firstYear) / firstYear) / years;
  }

  private assessFieldMaturity(evolution: any[]): string {
    const growthRate = this.calculateGrowthRate(evolution);
    const totalPapers = evolution.reduce((sum, e) => sum + e.paper_count, 0);

    if (growthRate > 0.2 && totalPapers < 50) return 'Emerging';
    if (growthRate > 0.1) return 'Growing';
    if (growthRate > 0) return 'Mature';
    return 'Declining';
  }

  private suggestFutureDirections(result: SynthesisResult): string[] {
    const suggestions: string[] = [];

    // Based on divergent findings
    if (result.divergent_findings.length > 0) {
      suggestions.push('Resolve conflicting findings through systematic investigation');
    }

    // Based on themes
    result.themes.forEach((analysis, theme) => {
      if (analysis.consensus_level < 0.5) {
        suggestions.push(`Establish consensus on ${theme} through collaborative research`);
      }
      if (analysis.evidence_strength === 'Limited') {
        suggestions.push(`Strengthen evidence base for ${theme}`);
      }
    });

    // Based on evolution
    if (result.knowledge_evolution.maturity === 'Emerging') {
      suggestions.push('Establish foundational theories and frameworks');
    }

    return suggestions;
  }

  private extractTopics(papers: Paper[]): string[] {
    const topics: Map<string, number> = new Map();

    papers.forEach((paper, index) => {
      const terms = this.tfidf.listTerms(index);
      terms.slice(0, 5).forEach((term: any) => {
        topics.set(term.term, (topics.get(term.term) || 0) + term.tfidf);
      });
    });

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, 20);
  }

  private analyzeSingleTrend(
    papers: Paper[],
    topic: string,
    startYear: number,
    endYear: number
  ): TrendData {
    const frequencyOverTime: number[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const yearPapers = papers.filter(p => p.year === year);
      const frequency = yearPapers.filter(p => {
        const text = `${p.title} ${p.abstract} ${p.keywords.join(' ')}`.toLowerCase();
        return text.includes(topic.toLowerCase());
      }).length;
      
      frequencyOverTime.push(frequency);
    }

    // Calculate growth rate
    const growthRate = this.calculateTopicGrowthRate(frequencyOverTime);

    // Determine trend type
    let trendType: 'emerging' | 'declining' | 'stable' | 'cyclical';
    if (growthRate > 0.1) {
      trendType = 'emerging';
    } else if (growthRate < -0.1) {
      trendType = 'declining';
    } else if (this.isCyclical(frequencyOverTime)) {
      trendType = 'cyclical';
    } else {
      trendType = 'stable';
    }

    // Calculate significance
    const significance = this.calculateSignificance(frequencyOverTime);

    return {
      topic,
      frequency_over_time: frequencyOverTime,
      growth_rate: growthRate,
      trend_type: trendType,
      significance
    };
  }

  private calculateTopicGrowthRate(frequencies: number[]): number {
    if (frequencies.length < 2) return 0;

    // Linear regression for trend
    const x = Array.from({ length: frequencies.length }, (_, i) => i);
    const y = frequencies;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return slope;
  }

  private isCyclical(frequencies: number[]): boolean {
    // Simplified cyclical detection
    if (frequencies.length < 4) return false;

    let peaks = 0;
    for (let i = 1; i < frequencies.length - 1; i++) {
      if (frequencies[i] > frequencies[i - 1] && frequencies[i] > frequencies[i + 1]) {
        peaks++;
      }
    }

    return peaks >= 2;
  }

  private calculateSignificance(frequencies: number[]): number {
    const sum = frequencies.reduce((a, b) => a + b, 0);
    const mean = sum / frequencies.length;
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / frequencies.length;
    
    // Coefficient of variation as significance measure
    return mean > 0 ? Math.sqrt(variance) / mean : 0;
  }

  private identifyBreakpoints(trends: Map<string, TrendData>): number[] {
    const breakpoints: Set<number> = new Set();

    trends.forEach(trend => {
      const frequencies = trend.frequency_over_time;
      for (let i = 1; i < frequencies.length - 1; i++) {
        const change = Math.abs(frequencies[i] - frequencies[i - 1]);
        const avgChange = frequencies.reduce((sum, _, j) => {
          if (j > 0) sum += Math.abs(frequencies[j] - frequencies[j - 1]);
          return sum;
        }, 0) / (frequencies.length - 1);

        if (change > avgChange * 2) {
          breakpoints.add(i);
        }
      }
    });

    return Array.from(breakpoints).sort();
  }

  private generateForecast(trends: Map<string, TrendData>): any {
    const forecast: any = {
      next_year_topics: [],
      growth_areas: [],
      declining_areas: [],
      stability_index: 0
    };

    trends.forEach((trend, topic) => {
      if (trend.trend_type === 'emerging' && trend.significance > 0.5) {
        forecast.next_year_topics.push(topic);
        forecast.growth_areas.push(topic);
      } else if (trend.trend_type === 'declining') {
        forecast.declining_areas.push(topic);
      }
    });

    // Calculate stability index
    const stableCount = Array.from(trends.values())
      .filter(t => t.trend_type === 'stable').length;
    forecast.stability_index = stableCount / trends.size;

    return forecast;
  }

  private calculateCustomMetric(papers: Paper[], metric: string): any {
    // Placeholder for custom metrics
    switch (metric) {
      case 'interdisciplinarity':
        return this.calculateInterdisciplinarity(papers);
      case 'innovation_index':
        return this.calculateInnovationIndex(papers);
      case 'collaboration_index':
        return this.calculateCollaborationIndex(papers);
      default:
        return null;
    }
  }

  private calculateInterdisciplinarity(papers: Paper[]): number {
    // Simplified - based on journal diversity
    const journals = new Set(papers.map(p => p.journal));
    return journals.size / papers.length;
  }

  private calculateInnovationIndex(papers: Paper[]): number {
    // Simplified - based on unique keywords
    const allKeywords = new Set(papers.flatMap(p => p.keywords));
    return allKeywords.size / papers.length;
  }

  private calculateCollaborationIndex(papers: Paper[]): number {
    // Average number of authors per paper
    const avgAuthors = papers.reduce((sum, p) => sum + p.authors.length, 0) / papers.length;
    return Math.min(1, avgAuthors / 10); // Normalize to [0, 1]
  }

  // Narrative creation methods
  private createIntroduction(papers: Paper[], themes: string[]): string {
    return `This synthesis examines ${papers.length} papers addressing ${themes.join(', ')}. ` +
           `The literature spans from ${Math.min(...papers.map(p => p.year))} to ` +
           `${Math.max(...papers.map(p => p.year))}, representing a comprehensive overview of the field.`;
  }

  private createNarrativeBody(papers: Paper[], themes: string[]): string {
    return themes.map(theme => {
      const relevantPapers = papers.filter(p => {
        const text = `${p.title} ${p.abstract}`.toLowerCase();
        return text.includes(theme.toLowerCase());
      });
      
      return `Regarding ${theme}, ${relevantPapers.length} studies provide insights. ` +
             `The research demonstrates evolving understanding and methodological approaches.`;
    }).join('\n\n');
  }

  private createConclusion(papers: Paper[], themes: string[]): string {
    return `The synthesis reveals both convergent and divergent findings across ${themes.length} themes. ` +
           `Future research should address identified gaps and build upon established foundations.`;
  }

  private createThematicNarrative(themes: Map<string, ThemeAnalysis>, relationships: any): string {
    let narrative = 'Thematic analysis reveals several key patterns:\n\n';
    
    themes.forEach((analysis, theme) => {
      narrative += `**${theme}**: Examined in ${analysis.papers.length} papers with ` +
                  `${analysis.evidence_strength} evidence strength and ${(analysis.consensus_level * 100).toFixed(0)}% consensus. ` +
                  `Key concepts include ${analysis.key_concepts.slice(0, 3).join(', ')}. ` +
                  `The theme shows ${analysis.evolution}.\n\n`;
    });

    return narrative;
  }

  private createChronologicalNarrative(periodAnalyses: Map<string, any>): string {
    let narrative = 'The field has evolved through distinct periods:\n\n';
    
    periodAnalyses.forEach((analysis, period) => {
      narrative += `**${period}**: ${analysis.paper_count} papers focusing on ` +
                  `${analysis.dominant_themes.join(', ')}. Key developments include ` +
                  `${analysis.key_developments.join(', ')}.\n\n`;
    });

    return narrative;
  }

  private createMethodologicalNarrative(methodAnalyses: Map<string, any>): string {
    let narrative = 'Methodological approaches vary across studies:\n\n';
    
    methodAnalyses.forEach((analysis, method) => {
      narrative += `**${method}**: Used in ${analysis.paper_count} studies. ` +
                  `Strengths: ${analysis.strengths.join(', ')}. ` +
                  `Limitations: ${analysis.limitations.join(', ')}. ` +
                  `Quality score: ${analysis.quality_score}.\n\n`;
    });

    return narrative;
  }

  // Additional helper methods
  private findThemeRelationships(themes: Map<string, ThemeAnalysis>): any {
    const relationships: any[] = [];
    
    const themeArray = Array.from(themes.entries());
    for (let i = 0; i < themeArray.length; i++) {
      for (let j = i + 1; j < themeArray.length; j++) {
        const overlap = this.calculateThemeOverlap(themeArray[i][1], themeArray[j][1]);
        if (overlap > 0.3) {
          relationships.push({
            theme1: themeArray[i][0],
            theme2: themeArray[j][0],
            overlap
          });
        }
      }
    }

    return relationships;
  }

  private calculateThemeOverlap(theme1: ThemeAnalysis, theme2: ThemeAnalysis): number {
    const papers1 = new Set(theme1.papers);
    const papers2 = new Set(theme2.papers);
    
    const intersection = new Set([...papers1].filter(p => papers2.has(p)));
    const union = new Set([...papers1, ...papers2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private identifyTimePeriods(papers: Paper[]): Array<{ name: string; start: number; end: number }> {
    const years = papers.map(p => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const span = maxYear - minYear;

    if (span <= 5) {
      return [{ name: 'Full Period', start: minYear, end: maxYear }];
    }

    const periods: Array<{ name: string; start: number; end: number }> = [];
    const periodLength = Math.ceil(span / 3);

    for (let i = 0; i < 3; i++) {
      const start = minYear + i * periodLength;
      const end = Math.min(start + periodLength - 1, maxYear);
      periods.push({
        name: `Period ${i + 1}`,
        start,
        end
      });
    }

    return periods;
  }

  private extractDominantThemes(papers: Paper[], themes: string[]): string[] {
    const themeCounts: Map<string, number> = new Map();

    themes.forEach(theme => {
      const count = papers.filter(p => {
        const text = `${p.title} ${p.abstract}`.toLowerCase();
        return text.includes(theme.toLowerCase());
      }).length;
      themeCounts.set(theme, count);
    });

    return Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  private extractKeyDevelopments(papers: Paper[]): string[] {
    // Simplified - would extract actual developments
    return ['New methodological approach', 'Theoretical advancement'];
  }

  private identifyMethodologicalShifts(papers: Paper[]): string[] {
    // Simplified - would identify actual shifts
    return ['Shift from qualitative to mixed methods'];
  }

  private analyzeThemeEvolution(papers: Paper[], theme: string): ThemeAnalysis {
    const relevantPapers = papers.filter(p => {
      const text = `${p.title} ${p.abstract}`.toLowerCase();
      return text.includes(theme.toLowerCase());
    });

    return this.analyzeTheme(relevantPapers, theme);
  }

  private groupByMethodology(papers: Paper[]): Map<string, Paper[]> {
    const groups = new Map<string, Paper[]>();
    
    papers.forEach(paper => {
      const method = this.identifyPrimaryMethod(paper);
      if (!groups.has(method)) {
        groups.set(method, []);
      }
      groups.get(method)!.push(paper);
    });

    return groups;
  }

  private identifyPrimaryMethod(paper: Paper): string {
    const text = (paper.methodology || paper.abstract).toLowerCase();
    
    if (text.includes('experiment')) return 'Experimental';
    if (text.includes('survey')) return 'Survey';
    if (text.includes('case study')) return 'Case Study';
    if (text.includes('qualitative')) return 'Qualitative';
    if (text.includes('quantitative')) return 'Quantitative';
    if (text.includes('mixed')) return 'Mixed Methods';
    
    return 'Other';
  }

  private identifyMethodStrengths(method: string, papers: Paper[]): string[] {
    // Method-specific strengths
    const strengthsMap: { [key: string]: string[] } = {
      'Experimental': ['Causal inference', 'Control', 'Replicability'],
      'Survey': ['Large samples', 'Generalizability', 'Efficiency'],
      'Case Study': ['Depth', 'Context', 'Rich data'],
      'Qualitative': ['Exploration', 'Understanding', 'Flexibility'],
      'Quantitative': ['Precision', 'Statistical power', 'Objectivity'],
      'Mixed Methods': ['Triangulation', 'Comprehensiveness', 'Validation']
    };

    return strengthsMap[method] || ['To be determined'];
  }

  private identifyMethodLimitations(method: string, papers: Paper[]): string[] {
    // Method-specific limitations
    const limitationsMap: { [key: string]: string[] } = {
      'Experimental': ['Artificiality', 'Limited external validity'],
      'Survey': ['Response bias', 'Superficial data'],
      'Case Study': ['Limited generalizability', 'Subjectivity'],
      'Qualitative': ['Subjectivity', 'Time-intensive'],
      'Quantitative': ['Oversimplification', 'Missing context'],
      'Mixed Methods': ['Complexity', 'Resource-intensive']
    };

    return limitationsMap[method] || ['To be determined'];
  }

  private synthesizeMethodFindings(papers: Paper[]): string[] {
    // Extract key findings from papers
    const findings: string[] = [];
    
    papers.slice(0, 5).forEach(paper => {
      if (paper.findings) {
        findings.push(paper.findings.substring(0, 100) + '...');
      }
    });

    return findings;
  }

  private assessMethodQuality(papers: Paper[]): number {
    // Simplified quality assessment
    const avgCitations = papers.reduce((sum, p) => sum + p.citations, 0) / papers.length;
    return Math.min(1, avgCitations / 100);
  }

  private analyzeCrossMethod(methodGroups: Map<string, Paper[]>, theme: string): ThemeAnalysis {
    const allPapers: Paper[] = [];
    methodGroups.forEach(papers => allPapers.push(...papers));
    
    return this.analyzeTheme(allPapers, theme);
  }

  private createTimeline(papers: Paper[]): any[] {
    const timeline: any[] = [];
    const sortedPapers = [...papers].sort((a, b) => a.year - b.year);
    
    sortedPapers.forEach(paper => {
      timeline.push({
        year: paper.year,
        title: paper.title,
        significance: paper.citations / 10
      });
    });

    return timeline;
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'with', 'from', 'for', 'to', 'of', 'in', 'by'];
    return stopWords.includes(word);
  }
}
