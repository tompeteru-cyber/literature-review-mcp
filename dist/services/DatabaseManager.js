import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
export class DatabaseManager {
    supabaseClient;
    sqliteDb;
    useSupabase;
    dbPath;
    constructor(connectionString) {
        this.useSupabase = !!connectionString && connectionString.startsWith('http');
        this.dbPath = connectionString || path.join(process.cwd(), 'literature_review.db');
        this.initialize(connectionString);
    }
    async initialize(connectionString) {
        if (this.useSupabase && connectionString) {
            // Initialize Supabase for cloud storage
            const supabaseUrl = connectionString;
            const supabaseKey = process.env.SUPABASE_KEY || '';
            this.supabaseClient = createClient(supabaseUrl, supabaseKey);
        }
        else {
            // Initialize SQLite for local storage
            await this.initializeSQLite();
        }
    }
    async initializeSQLite() {
        this.sqliteDb = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });
        // Create tables
        await this.createTables();
    }
    async createTables() {
        if (!this.sqliteDb)
            return;
        // Papers table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        abstract TEXT,
        authors TEXT,
        year INTEGER,
        citations INTEGER,
        journal TEXT,
        doi TEXT,
        keywords TEXT,
        methodology TEXT,
        findings TEXT,
        full_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Search results table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS search_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        database_name TEXT,
        query TEXT,
        total_results INTEGER,
        retrieved INTEGER,
        search_date DATETIME,
        results_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Analyses table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        analysis_type TEXT,
        data TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Methodologies table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS methodologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT,
        approach TEXT,
        data_collection TEXT,
        analysis_methods TEXT,
        tools TEXT,
        validation TEXT,
        limitations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paper_id) REFERENCES papers (id)
      )
    `);
        // Research gaps table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS research_gaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gap_type TEXT,
        description TEXT,
        evidence TEXT,
        severity TEXT,
        recommendations TEXT,
        potential_impact TEXT,
        papers_referenced TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Synthesis results table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS synthesis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        synthesis_type TEXT,
        themes TEXT,
        narrative TEXT,
        key_findings TEXT,
        convergent_findings TEXT,
        divergent_findings TEXT,
        knowledge_evolution TEXT,
        future_directions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // AHP results table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS ahp_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT,
        final_score REAL,
        criteria_scores TEXT,
        consistency_ratio REAL,
        rank INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paper_id) REFERENCES papers (id)
      )
    `);
        // Literature review chapters table
        await this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_number TEXT,
        title TEXT,
        content TEXT,
        format TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create indexes
        await this.sqliteDb.exec(`
      CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
      CREATE INDEX IF NOT EXISTS idx_papers_citations ON papers(citations);
      CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
      CREATE INDEX IF NOT EXISTS idx_search_results_date ON search_results(search_date);
      CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(analysis_type);
      CREATE INDEX IF NOT EXISTS idx_research_gaps_type ON research_gaps(gap_type);
    `);
    }
    /**
     * Store paper in database
     */
    async storePaper(paper) {
        if (this.useSupabase && this.supabaseClient) {
            await this.supabaseClient
                .from('papers')
                .upsert({
                id: paper.id,
                title: paper.title,
                abstract: paper.abstract,
                authors: paper.authors,
                year: paper.year,
                citations: paper.citations,
                journal: paper.journal,
                doi: paper.doi,
                keywords: paper.keywords,
                methodology: paper.methodology,
                findings: paper.findings,
                full_text: paper.fullText,
                updated_at: new Date()
            });
        }
        else if (this.sqliteDb) {
            await this.sqliteDb.run(`
        INSERT OR REPLACE INTO papers 
        (id, title, abstract, authors, year, citations, journal, doi, keywords, methodology, findings, full_text, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
                paper.id,
                paper.title,
                paper.abstract,
                JSON.stringify(paper.authors),
                paper.year,
                paper.citations,
                paper.journal,
                paper.doi,
                JSON.stringify(paper.keywords),
                paper.methodology,
                paper.findings,
                paper.fullText
            ]);
        }
    }
    /**
     * Store search results
     */
    async storeSearchResults(results) {
        if (this.useSupabase && this.supabaseClient) {
            await this.supabaseClient
                .from('search_results')
                .insert({
                database_name: results.database,
                query: results.query,
                total_results: results.total_results,
                retrieved: results.retrieved,
                search_date: results.search_date,
                results_json: JSON.stringify(results.papers)
            });
        }
        else if (this.sqliteDb) {
            await this.sqliteDb.run(`
        INSERT INTO search_results 
        (database_name, query, total_results, retrieved, search_date, results_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
                results.database,
                results.query,
                results.total_results,
                results.retrieved,
                results.search_date,
                JSON.stringify(results.papers)
            ]);
        }
        // Store individual papers
        for (const paper of results.papers) {
            await this.storePaper(paper);
        }
    }
    /**
     * Store methodology analysis
     */
    async storeMethodology(paperId, methodology) {
        if (this.useSupabase && this.supabaseClient) {
            await this.supabaseClient
                .from('methodologies')
                .insert({
                paper_id: paperId,
                approach: methodology.approach,
                data_collection: methodology.data_collection,
                analysis_methods: JSON.stringify(methodology.analysis_methods),
                tools: JSON.stringify(methodology.tools),
                validation: methodology.validation,
                limitations: JSON.stringify(methodology.limitations)
            });
        }
        else if (this.sqliteDb) {
            await this.sqliteDb.run(`
        INSERT INTO methodologies 
        (paper_id, approach, data_collection, analysis_methods, tools, validation, limitations)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                paperId,
                methodology.approach,
                methodology.data_collection,
                JSON.stringify(methodology.analysis_methods),
                JSON.stringify(methodology.tools),
                methodology.validation,
                JSON.stringify(methodology.limitations)
            ]);
        }
    }
    /**
     * Store research gaps
     */
    async storeResearchGaps(gaps) {
        for (const gap of gaps) {
            if (this.useSupabase && this.supabaseClient) {
                await this.supabaseClient
                    .from('research_gaps')
                    .insert({
                    gap_type: gap.type,
                    description: gap.description,
                    evidence: JSON.stringify(gap.evidence),
                    severity: gap.severity,
                    recommendations: JSON.stringify(gap.recommendations),
                    potential_impact: gap.potential_impact,
                    papers_referenced: JSON.stringify(gap.papers_referenced)
                });
            }
            else if (this.sqliteDb) {
                await this.sqliteDb.run(`
          INSERT INTO research_gaps 
          (gap_type, description, evidence, severity, recommendations, potential_impact, papers_referenced)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
                    gap.type,
                    gap.description,
                    JSON.stringify(gap.evidence),
                    gap.severity,
                    JSON.stringify(gap.recommendations),
                    gap.potential_impact,
                    JSON.stringify(gap.papers_referenced)
                ]);
            }
        }
    }
    /**
     * Store synthesis results
     */
    async storeSynthesis(synthesis) {
        if (this.useSupabase && this.supabaseClient) {
            await this.supabaseClient
                .from('synthesis_results')
                .insert({
                synthesis_type: synthesis.synthesis_type,
                themes: JSON.stringify(Array.from(synthesis.themes.entries())),
                narrative: synthesis.narrative,
                key_findings: JSON.stringify(synthesis.key_findings),
                convergent_findings: JSON.stringify(synthesis.convergent_findings),
                divergent_findings: JSON.stringify(synthesis.divergent_findings),
                knowledge_evolution: JSON.stringify(synthesis.knowledge_evolution),
                future_directions: JSON.stringify(synthesis.future_directions)
            });
        }
        else if (this.sqliteDb) {
            await this.sqliteDb.run(`
        INSERT INTO synthesis_results 
        (synthesis_type, themes, narrative, key_findings, convergent_findings, divergent_findings, knowledge_evolution, future_directions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                synthesis.synthesis_type,
                JSON.stringify(Array.from(synthesis.themes.entries())),
                synthesis.narrative,
                JSON.stringify(synthesis.key_findings),
                JSON.stringify(synthesis.convergent_findings),
                JSON.stringify(synthesis.divergent_findings),
                JSON.stringify(synthesis.knowledge_evolution),
                JSON.stringify(synthesis.future_directions)
            ]);
        }
    }
    /**
     * Store AHP results
     */
    async storeAHPResults(results) {
        for (const result of results) {
            if (this.useSupabase && this.supabaseClient) {
                await this.supabaseClient
                    .from('ahp_results')
                    .insert({
                    paper_id: result.paper_id,
                    final_score: result.final_score,
                    criteria_scores: JSON.stringify(Array.from(result.criteria_scores.entries())),
                    consistency_ratio: result.consistency_ratio,
                    rank: result.rank
                });
            }
            else if (this.sqliteDb) {
                await this.sqliteDb.run(`
          INSERT INTO ahp_results 
          (paper_id, final_score, criteria_scores, consistency_ratio, rank)
          VALUES (?, ?, ?, ?, ?)
        `, [
                    result.paper_id,
                    result.final_score,
                    JSON.stringify(Array.from(result.criteria_scores.entries())),
                    result.consistency_ratio,
                    result.rank
                ]);
            }
        }
    }
    /**
     * Store generated chapter
     */
    async storeChapter(chapterNumber, title, content, format, metadata) {
        if (this.useSupabase && this.supabaseClient) {
            await this.supabaseClient
                .from('chapters')
                .insert({
                chapter_number: chapterNumber,
                title,
                content,
                format,
                metadata: JSON.stringify(metadata),
                updated_at: new Date()
            });
        }
        else if (this.sqliteDb) {
            await this.sqliteDb.run(`
        INSERT INTO chapters 
        (chapter_number, title, content, format, metadata, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [
                chapterNumber,
                title,
                content,
                format,
                JSON.stringify(metadata)
            ]);
        }
    }
    /**
     * Retrieve papers by criteria
     */
    async getPapers(criteria) {
        let papers = [];
        if (this.useSupabase && this.supabaseClient) {
            let query = this.supabaseClient.from('papers').select('*');
            if (criteria.year) {
                query = query.gte('year', criteria.year.min).lte('year', criteria.year.max);
            }
            if (criteria.minCitations) {
                query = query.gte('citations', criteria.minCitations);
            }
            if (criteria.limit) {
                query = query.limit(criteria.limit);
            }
            const { data } = await query;
            papers = data || [];
        }
        else if (this.sqliteDb) {
            let sql = 'SELECT * FROM papers WHERE 1=1';
            const params = [];
            if (criteria.year) {
                sql += ' AND year >= ? AND year <= ?';
                params.push(criteria.year.min, criteria.year.max);
            }
            if (criteria.minCitations) {
                sql += ' AND citations >= ?';
                params.push(criteria.minCitations);
            }
            if (criteria.limit) {
                sql += ' LIMIT ?';
                params.push(criteria.limit);
            }
            papers = await this.sqliteDb.all(sql, params);
        }
        // Parse JSON fields and convert to Paper objects
        return papers.map(p => ({
            id: p.id,
            title: p.title,
            abstract: p.abstract,
            authors: typeof p.authors === 'string' ? JSON.parse(p.authors) : p.authors,
            year: p.year,
            citations: p.citations,
            journal: p.journal,
            doi: p.doi,
            keywords: typeof p.keywords === 'string' ? JSON.parse(p.keywords) : p.keywords,
            methodology: p.methodology,
            findings: p.findings,
            fullText: p.full_text
        }));
    }
    /**
     * Retrieve previous analyses
     */
    async getAnalyses(analysisType, limit = 10) {
        let analyses = [];
        if (this.useSupabase && this.supabaseClient) {
            let query = this.supabaseClient
                .from('analyses')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (analysisType) {
                query = query.eq('analysis_type', analysisType);
            }
            const { data } = await query;
            analyses = data || [];
        }
        else if (this.sqliteDb) {
            let sql = 'SELECT * FROM analyses';
            const params = [];
            if (analysisType) {
                sql += ' WHERE analysis_type = ?';
                params.push(analysisType);
            }
            sql += ' ORDER BY created_at DESC LIMIT ?';
            params.push(limit);
            analyses = await this.sqliteDb.all(sql, params);
        }
        return analyses.map(a => ({
            id: a.id,
            analysis_type: a.analysis_type,
            data: typeof a.data === 'string' ? JSON.parse(a.data) : a.data,
            created_at: new Date(a.created_at),
            updated_at: new Date(a.updated_at),
            tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags
        }));
    }
    /**
     * Retrieve research gaps
     */
    async getResearchGaps(gapType) {
        let gaps = [];
        if (this.useSupabase && this.supabaseClient) {
            let query = this.supabaseClient.from('research_gaps').select('*');
            if (gapType) {
                query = query.eq('gap_type', gapType);
            }
            const { data } = await query;
            gaps = data || [];
        }
        else if (this.sqliteDb) {
            let sql = 'SELECT * FROM research_gaps';
            const params = [];
            if (gapType) {
                sql += ' WHERE gap_type = ?';
                params.push(gapType);
            }
            gaps = await this.sqliteDb.all(sql, params);
        }
        return gaps.map(g => ({
            ...g,
            evidence: typeof g.evidence === 'string' ? JSON.parse(g.evidence) : g.evidence,
            recommendations: typeof g.recommendations === 'string' ? JSON.parse(g.recommendations) : g.recommendations,
            papers_referenced: typeof g.papers_referenced === 'string' ? JSON.parse(g.papers_referenced) : g.papers_referenced
        }));
    }
    /**
     * Retrieve synthesis results
     */
    async getSynthesisResults(limit = 5) {
        let results = [];
        if (this.useSupabase && this.supabaseClient) {
            const { data } = await this.supabaseClient
                .from('synthesis_results')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            results = data || [];
        }
        else if (this.sqliteDb) {
            results = await this.sqliteDb.all('SELECT * FROM synthesis_results ORDER BY created_at DESC LIMIT ?', [limit]);
        }
        return results.map(r => ({
            ...r,
            themes: typeof r.themes === 'string' ? JSON.parse(r.themes) : r.themes,
            key_findings: typeof r.key_findings === 'string' ? JSON.parse(r.key_findings) : r.key_findings,
            convergent_findings: typeof r.convergent_findings === 'string' ? JSON.parse(r.convergent_findings) : r.convergent_findings,
            divergent_findings: typeof r.divergent_findings === 'string' ? JSON.parse(r.divergent_findings) : r.divergent_findings,
            knowledge_evolution: typeof r.knowledge_evolution === 'string' ? JSON.parse(r.knowledge_evolution) : r.knowledge_evolution,
            future_directions: typeof r.future_directions === 'string' ? JSON.parse(r.future_directions) : r.future_directions
        }));
    }
    /**
     * Retrieve AHP results
     */
    async getAHPResults(limit = 100) {
        let results = [];
        if (this.useSupabase && this.supabaseClient) {
            const { data } = await this.supabaseClient
                .from('ahp_results')
                .select('*')
                .order('rank', { ascending: true })
                .limit(limit);
            results = data || [];
        }
        else if (this.sqliteDb) {
            results = await this.sqliteDb.all('SELECT * FROM ahp_results ORDER BY rank ASC LIMIT ?', [limit]);
        }
        return results.map(r => ({
            ...r,
            criteria_scores: typeof r.criteria_scores === 'string' ? JSON.parse(r.criteria_scores) : r.criteria_scores
        }));
    }
    /**
     * Retrieve generated chapters
     */
    async getChapters() {
        let chapters = [];
        if (this.useSupabase && this.supabaseClient) {
            const { data } = await this.supabaseClient
                .from('chapters')
                .select('*')
                .order('chapter_number', { ascending: true });
            chapters = data || [];
        }
        else if (this.sqliteDb) {
            chapters = await this.sqliteDb.all('SELECT * FROM chapters ORDER BY chapter_number ASC');
        }
        return chapters.map(c => ({
            ...c,
            metadata: typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata
        }));
    }
    /**
     * Execute custom query
     */
    async executeQuery(query, params = []) {
        if (this.useSupabase && this.supabaseClient) {
            // For Supabase, use RPC functions or raw SQL if available
            console.warn('Custom queries not directly supported with Supabase client');
            return null;
        }
        else if (this.sqliteDb) {
            if (query.toUpperCase().startsWith('SELECT')) {
                return await this.sqliteDb.all(query, params);
            }
            else {
                return await this.sqliteDb.run(query, params);
            }
        }
    }
    /**
     * Export database to JSON
     */
    async exportToJSON() {
        const exportData = {
            papers: await this.getPapers({ limit: 10000 }),
            research_gaps: await this.getResearchGaps(),
            synthesis_results: await this.getSynthesisResults(100),
            ahp_results: await this.getAHPResults(1000),
            chapters: await this.getChapters(),
            export_date: new Date()
        };
        return exportData;
    }
    /**
     * Import data from JSON
     */
    async importFromJSON(data) {
        // Import papers
        if (data.papers) {
            for (const paper of data.papers) {
                await this.storePaper(paper);
            }
        }
        // Import research gaps
        if (data.research_gaps) {
            await this.storeResearchGaps(data.research_gaps);
        }
        // Import synthesis results
        if (data.synthesis_results) {
            for (const synthesis of data.synthesis_results) {
                await this.storeSynthesis(synthesis);
            }
        }
        // Import AHP results
        if (data.ahp_results) {
            await this.storeAHPResults(data.ahp_results);
        }
        // Import chapters
        if (data.chapters) {
            for (const chapter of data.chapters) {
                await this.storeChapter(chapter.chapter_number, chapter.title, chapter.content, chapter.format, chapter.metadata);
            }
        }
    }
    /**
     * Clear all data (use with caution)
     */
    async clearAllData() {
        if (this.sqliteDb) {
            await this.sqliteDb.exec(`
        DELETE FROM papers;
        DELETE FROM search_results;
        DELETE FROM analyses;
        DELETE FROM methodologies;
        DELETE FROM research_gaps;
        DELETE FROM synthesis_results;
        DELETE FROM ahp_results;
        DELETE FROM chapters;
      `);
        }
        // For Supabase, implement table clearing if needed
    }
    /**
     * Close database connection
     */
    async close() {
        if (this.sqliteDb) {
            await this.sqliteDb.close();
        }
    }
}
//# sourceMappingURL=DatabaseManager.js.map