import path from 'path';
import { promises as fs } from 'fs';
export class ResearchContextLoader {
    contextFilePath;
    cachedContext = null;
    lastLoadTime = 0;
    cacheValidityMs = 60000; // 1 minute cache
    constructor(contextFilePath) {
        this.contextFilePath = contextFilePath || path.join(process.cwd(), 'research-context.md');
    }
    /**
     * Load and parse the research context from the markdown file
     */
    async loadContext(forceReload = false) {
        const now = Date.now();
        // Return cached version if still valid
        if (!forceReload && this.cachedContext && (now - this.lastLoadTime) < this.cacheValidityMs) {
            return this.cachedContext;
        }
        try {
            const content = await fs.readFile(this.contextFilePath, 'utf-8');
            this.cachedContext = this.parseMarkdown(content);
            this.lastLoadTime = now;
            return this.cachedContext;
        }
        catch (error) {
            console.error(`Error loading research context from ${this.contextFilePath}:`, error);
            // Return default context if file cannot be read
            return this.getDefaultContext();
        }
    }
    /**
     * Parse the markdown content into structured ResearchContext
     */
    parseMarkdown(content) {
        const context = this.getDefaultContext();
        // Extract title
        const titleMatch = content.match(/# Research Context: (.+)/);
        if (titleMatch) {
            context.researchTitle = titleMatch[1].trim();
        }
        // Extract PhD Candidate
        const candidateMatch = content.match(/\*\*PhD Candidate:\*\* (.+)/);
        if (candidateMatch) {
            context.phDCandidate = candidateMatch[1].trim();
        }
        // Extract Supervisor
        const supervisorMatch = content.match(/\*\*Supervisor:\*\* (.+)/);
        if (supervisorMatch) {
            context.supervisor = supervisorMatch[1].trim();
        }
        // Extract Industry Partner
        const industryMatch = content.match(/\*\*Industry Partner:\*\* (.+)/);
        if (industryMatch) {
            context.industryPartner = industryMatch[1].trim();
        }
        // Extract Last Updated
        const updatedMatch = content.match(/\*\*Last Updated:\*\* (.+)/);
        if (updatedMatch) {
            context.lastUpdated = updatedMatch[1].trim();
        }
        // Parse Block Outfitting section
        context.domainUnderstanding.blockOutfitting = this.parseOutfittingSection(content, 'Block Outfitting');
        // Parse Post-Launch Outfitting section
        context.domainUnderstanding.postLaunchOutfitting = this.parseOutfittingSection(content, 'Post-Launch Outfitting');
        // Extract Critical Insight
        const insightMatch = content.match(/\*\*CRITICAL INSIGHT:(.+?)\*\*/s);
        if (insightMatch) {
            context.domainUnderstanding.criticalInsight = insightMatch[1].trim();
        }
        // Parse Literature Distribution
        const totalPapersMatch = content.match(/\*\*Total Papers Analyzed:\*\* (\d+)/);
        if (totalPapersMatch) {
            context.literatureDistribution.totalPapers = parseInt(totalPapersMatch[1]);
        }
        const blockDistMatch = content.match(/\*\*Block Outfitting \(Pre-Launch\):\*\* (\d+)%.*?~?(\d+) papers/);
        if (blockDistMatch) {
            context.literatureDistribution.blockOutfitting = {
                percentage: parseInt(blockDistMatch[1]),
                count: parseInt(blockDistMatch[2])
            };
        }
        const postDistMatch = content.match(/\*\*Post-Launch Outfitting:\*\* (\d+)%.*?~?(\d+) papers/);
        if (postDistMatch) {
            context.literatureDistribution.postLaunchOutfitting = {
                percentage: parseInt(postDistMatch[1]),
                count: parseInt(postDistMatch[2])
            };
        }
        // Extract Major Gap
        const gapMatch = content.match(/### \*\*MAJOR GAP IDENTIFIED:\*\*\n(.+)/);
        if (gapMatch) {
            context.literatureDistribution.majorGap = gapMatch[1].trim();
        }
        // Parse Identified Gaps
        context.identifiedGaps = this.parseGaps(content);
        // Parse Research Directions
        context.researchDirections = this.parseResearchDirections(content);
        // Parse Analysis Guidelines
        context.analysisGuidelines = this.parseAnalysisGuidelines(content);
        // Parse Themes
        context.themes = this.parseThemes(content);
        // Parse Papers Analyzed
        context.papersAnalyzed = this.parsePapersAnalyzed(content);
        return context;
    }
    /**
     * Parse outfitting section (Block or Post-Launch)
     */
    parseOutfittingSection(content, sectionName) {
        const result = {
            description: '',
            environment: '',
            equipment: '',
            challenges: []
        };
        // Find the section
        const sectionRegex = new RegExp(`### ${sectionName}[^#]+`, 's');
        const sectionMatch = content.match(sectionRegex);
        if (sectionMatch) {
            const section = sectionMatch[0];
            // Extract Environment
            const envMatch = section.match(/- \*\*Environment:\*\* (.+)/);
            if (envMatch) {
                result.environment = envMatch[1].trim();
                result.description = sectionName.includes('Block')
                    ? 'Pre-launch shipyard environment with open spaces'
                    : 'After launch confined vessel spaces';
            }
            // Extract Equipment
            const equipMatch = section.match(/- \*\*Equipment:\*\* (.+)/);
            if (equipMatch) {
                result.equipment = equipMatch[1].trim();
            }
            // Extract Challenges
            const challengesMatch = section.match(/- \*\*Challenges:\*\*\n((?:\s+- .+\n?)+)/);
            if (challengesMatch) {
                result.challenges = challengesMatch[1]
                    .split('\n')
                    .map(line => line.replace(/^\s+- /, '').trim())
                    .filter(line => line.length > 0);
            }
        }
        return result;
    }
    /**
     * Parse research gaps section
     */
    parseGaps(content) {
        const gaps = {
            theoretical: { title: '', description: '' },
            methodological: { title: '', description: '', limitation: '' },
            practical: { title: '', description: '' }
        };
        // Theoretical Gap
        const theoreticalMatch = content.match(/### 1\. \*\*Theoretical Gap\*\*\n- \*\*(.+?):\*\* (.+)/);
        if (theoreticalMatch) {
            gaps.theoretical = {
                title: theoreticalMatch[1].trim(),
                description: theoreticalMatch[2].trim()
            };
        }
        // Methodological Gap
        const methodMatch = content.match(/### 2\. \*\*Methodological Gap\*\*\n- \*\*(.+?):\*\* (.+)\n- \*\*(.+?):\*\* (.+)/);
        if (methodMatch) {
            gaps.methodological = {
                title: methodMatch[1].trim(),
                description: methodMatch[2].trim(),
                limitation: methodMatch[4].trim()
            };
        }
        // Practical Gap
        const practicalMatch = content.match(/### 3\. \*\*Practical Gap\*\*\n- \*\*(.+?):\*\* (.+)\n- \*\*(.+?):\*\* (.+)/);
        if (practicalMatch) {
            gaps.practical = {
                title: practicalMatch[1].trim(),
                description: `${practicalMatch[2].trim()} ${practicalMatch[4].trim()}`
            };
        }
        return gaps;
    }
    /**
     * Parse research directions
     */
    parseResearchDirections(content) {
        const directions = {
            option1: { title: '', focus: '', rationale: [] },
            option2: { title: '', focus: '', rationale: [] }
        };
        // Option 1
        const opt1Match = content.match(/### \*\*Option 1: (.+?)\*\*.*?\n\*\*Focus:\*\* (.+)\n((?:- .+\n?)+)/s);
        if (opt1Match) {
            directions.option1 = {
                title: opt1Match[1].trim(),
                focus: opt1Match[2].trim(),
                rationale: opt1Match[3].split('\n')
                    .map(line => line.replace(/^- /, '').trim())
                    .filter(line => line.length > 0)
            };
        }
        // Option 2
        const opt2Match = content.match(/### Option 2: (.+?)\n\*\*Focus:\*\* (.+)\n((?:- .+\n?)+)/s);
        if (opt2Match) {
            directions.option2 = {
                title: opt2Match[1].trim(),
                focus: opt2Match[2].trim(),
                rationale: opt2Match[3].split('\n')
                    .map(line => line.replace(/^- /, '').trim())
                    .filter(line => line.length > 0)
            };
        }
        return directions;
    }
    /**
     * Parse analysis guidelines
     */
    parseAnalysisGuidelines(content) {
        const guidelines = {
            alwaysIdentify: [],
            blockOutfittingMarkers: [],
            postLaunchMarkers: [],
            standardLimitationTemplate: ''
        };
        // Always Identify items
        const identifyMatch = content.match(/### When Analyzing Papers, ALWAYS Identify:\n\n((?:\d+\. .+\n?)+)/);
        if (identifyMatch) {
            guidelines.alwaysIdentify = identifyMatch[1]
                .split('\n')
                .map(line => line.replace(/^\d+\. \*\*(.+?):\*\*/, '$1').trim())
                .filter(line => line.length > 0);
        }
        // Block Outfitting Markers
        const blockMarkersMatch = content.match(/- Keywords: (.+?)(?=\n\s+- Context)/s);
        if (blockMarkersMatch) {
            guidelines.blockOutfittingMarkers = blockMarkersMatch[1]
                .split(',')
                .map(k => k.replace(/[""]/g, '').trim())
                .filter(k => k.length > 0);
        }
        // Post-Launch Markers
        const postMarkersMatch = content.match(/Key Evidence Markers for Post-Launch:\*\*\n\s+- Keywords: (.+?)(?=\n\s+- Context)/s);
        if (postMarkersMatch) {
            guidelines.postLaunchMarkers = postMarkersMatch[1]
                .split(',')
                .map(k => k.replace(/[""]/g, '').trim())
                .filter(k => k.length > 0);
        }
        // Standard Limitation Template
        const templateMatch = content.match(/\*\*Standard Limitation Template:\*\*\n> (.+?)(?=\n\n---)/s);
        if (templateMatch) {
            guidelines.standardLimitationTemplate = templateMatch[1].trim();
        }
        return guidelines;
    }
    /**
     * Parse themes section
     */
    parseThemes(content) {
        const themes = [];
        const themeRegex = /### Theme (\d+): (.+)\n- \*\*Finding:\*\* (.+)\n- \*\*Limitation:\*\* (.+)/g;
        let match;
        while ((match = themeRegex.exec(content)) !== null) {
            themes.push({
                id: parseInt(match[1]),
                section: `2.${parseInt(match[1]) + 1}`,
                name: match[2].trim(),
                targetWords: 1800,
                finding: match[3].trim(),
                limitation: match[4].trim()
            });
        }
        return themes;
    }
    /**
     * Parse papers analyzed section
     */
    parsePapersAnalyzed(content) {
        const result = {
            total: 0,
            blockOutfitting: 0,
            postLaunch: 0,
            pattern: ''
        };
        const patternMatch = content.match(/\*\*Pattern:\*\* (.+)/);
        if (patternMatch) {
            result.pattern = patternMatch[1].trim();
            // Extract numbers from pattern
            const numbersMatch = patternMatch[1].match(/(\d+)\/(\d+)/);
            if (numbersMatch) {
                result.blockOutfitting = parseInt(numbersMatch[1]);
                result.total = parseInt(numbersMatch[2]);
            }
        }
        return result;
    }
    /**
     * Get default context when file cannot be loaded
     */
    getDefaultContext() {
        return {
            researchTitle: 'Dynamic Digital Scheduling for Optimal Outfitting of Naval Ships',
            phDCandidate: 'Tom Peter',
            supervisor: 'Dr Ian Whitfield (University of Strathclyde)',
            industryPartner: 'Dr Nabile Hifi (Shipyard)',
            domainUnderstanding: {
                blockOutfitting: {
                    description: 'Pre-launch shipyard environment with open spaces',
                    environment: 'Shipyard environment, assembly sites',
                    equipment: 'Platform vehicles, goliath cranes, moulding beds',
                    challenges: ['Inter-block coordination', 'Yard-level spatial constraints', 'Material handling bottlenecks', 'Parallel work streams optimisation']
                },
                postLaunchOutfitting: {
                    description: 'After launch confined vessel spaces',
                    environment: 'Confined spaces within launched vessel',
                    equipment: 'Thousands of equipment items in confined space',
                    challenges: ['Limited access routes and narrow hatches', 'Multiple trade coordination through access points', 'Rework from design changes', 'Safety-integrated task sequencing']
                },
                criticalInsight: 'Block and Post-Launch outfitting are FUNDAMENTALLY DIFFERENT operational problems. Methods designed for one domain cannot be directly transferred to the other.'
            },
            literatureDistribution: {
                totalPapers: 210,
                blockOutfitting: { count: 168, percentage: 80 },
                postLaunchOutfitting: { count: 42, percentage: 20 },
                majorGap: 'Overwhelming focus on block outfitting reveals significant research gap in post-launch outfitting scheduling methodologies'
            },
            identifiedGaps: {
                theoretical: {
                    title: 'Integrated Framework Absence',
                    description: 'No unified framework addressing spatial constraints, resource uncertainty, and safety requirements together'
                },
                methodological: {
                    title: 'Implementation Disconnect',
                    description: 'Methods fail to translate safety and uncertainty constraints into algorithm implementation. Block vs post-launch distinction often ignored.',
                    limitation: 'Most papers claim general "outfitting" applicability without acknowledging fundamental operational differences'
                },
                practical: {
                    title: 'Validation and Application Gap',
                    description: 'Missing full-scale shipyard validation. Post-launch compartment-level scheduling severely underserved.'
                }
            },
            researchDirections: {
                option1: {
                    title: 'Pure Post-Launch Focus (Preferred)',
                    focus: 'Compartment scheduling for confined spaces',
                    rationale: ['Addresses 80/20 imbalance', 'Novel contribution to under-researched area', 'Directly applicable to naval shipbuilding completion phase', 'Unique constraints not addressed elsewhere']
                },
                option2: {
                    title: 'Integrated Approach',
                    focus: 'Block to vessel transition',
                    rationale: ['Bridges pre-launch and post-launch phases', 'More complex scope', 'May dilute focus on primary gap']
                }
            },
            analysisGuidelines: {
                alwaysIdentify: [
                    'Outfitting stage classification (Block/Post-Launch/Both/Not specified)',
                    'Stage-specific limitations',
                    'Transferability claims and their validity',
                    'Evidence markers for each stage'
                ],
                blockOutfittingMarkers: ['block assembly', 'yard', 'assembly site', 'platform vehicle', 'goliath crane', 'pre-outfitting', 'on-unit', 'on-block'],
                postLaunchMarkers: ['compartment', 'confined space', 'hatch', 'access route', 'multi-trade coordination', 'on-board', 'launched vessel', 'fitting-out basin'],
                standardLimitationTemplate: 'Block outfitting focus limits post-launch applicability: Methods address yard-level spatial constraints (large blocks, platform vehicles, assembly sites) which are fundamentally different from post-launch compartmentation constraints (confined spaces, narrow hatches, multi-trade coordination through access points). Transferability to post-launch outfitting requires significant methodological adaptation not addressed in this work.'
            },
            themes: [
                { id: 1, section: '2.2', name: 'Spatial Optimisation & Outfitting Constraints', targetWords: 1800, finding: 'MILP and rule-based models address spatial layout and sequencing WITHOUT spatial-temporal adaptation in outfitting', limitation: 'Static optimization, yard-level focus, not process-aware schedulers' },
                { id: 2, section: '2.3', name: 'Dynamic Resource Scheduling & Uncertainty', targetWords: 1800, finding: 'DES and CONWIP models simulate flexible production but LACK spatial reasoning or adaptive outfitting', limitation: 'Fixed sequential processes, no real-time replanning' },
                { id: 3, section: '2.4', name: 'Safety Integrated Dynamic Scheduling', targetWords: 1800, finding: 'Safety and quality methods use probabilistic and laser-based tools but LACK integration with dynamic scheduling', limitation: 'Risk assessment without rescheduling capability' },
                { id: 4, section: '2.5', name: 'Multi-Stage Assembly & Outfitting Optimisation', targetWords: 1800, finding: '3D CAD-linked AI and rule-based systems optimise assembly planning but LACK feedback integration from outfitting execution', limitation: 'Static planning, no real-time monitoring, isolated block planning' },
                { id: 5, section: '2.6', name: 'Digital Scheduling & Dynamic Optimisation', targetWords: 1800, finding: 'Digital platforms synchronise enterprise data but DON\'T directly drive real-time outfitting rescheduling', limitation: 'Implementation complexity, legacy integration challenges, design-reality gap' }
            ],
            papersAnalyzed: {
                total: 9,
                blockOutfitting: 9,
                postLaunch: 0,
                pattern: '9/9 papers (100%) are Block Outfitting - validating the 80/20 literature distribution'
            }
        };
    }
    /**
     * Get context filtered by type
     */
    async getFilteredContext(contextType = 'full') {
        const context = await this.loadContext();
        switch (contextType) {
            case 'domain':
                return { domainUnderstanding: context.domainUnderstanding };
            case 'gaps':
                return { identifiedGaps: context.identifiedGaps, researchDirections: context.researchDirections };
            case 'guidelines':
                return { analysisGuidelines: context.analysisGuidelines };
            case 'distribution':
                return { literatureDistribution: context.literatureDistribution, papersAnalyzed: context.papersAnalyzed };
            case 'themes':
                return { themes: context.themes };
            case 'full':
            default:
                return context;
        }
    }
}
// Singleton instance for easy access
let loaderInstance = null;
export function getResearchContextLoader(contextFilePath) {
    if (!loaderInstance) {
        loaderInstance = new ResearchContextLoader(contextFilePath);
    }
    return loaderInstance;
}
//# sourceMappingURL=ResearchContextLoader.js.map