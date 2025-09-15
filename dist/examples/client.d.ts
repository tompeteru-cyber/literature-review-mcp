#!/usr/bin/env node
/**
 * Example Client for Literature Review MCP
 *
 * This script demonstrates how to use the Literature Review MCP
 * to conduct a complete systematic literature review
 */
declare class LiteratureReviewClient {
    private client;
    private transport;
    private connected;
    constructor();
    /**
     * Connect to the MCP server
     */
    connect(): Promise<void>;
    /**
     * Call a tool on the MCP server
     */
    callTool(toolName: string, args: any): Promise<any>;
    /**
     * Conduct a complete literature review
     */
    conductLiteratureReview(config: {
        searchQuery: string;
        databases: string[];
        dateRange: {
            start: string;
            end: string;
        };
        keywords: string[];
        themes: string[];
        outputFormat: string;
    }): Promise<void>;
    /**
     * Disconnect from the MCP server
     */
    disconnect(): Promise<void>;
}
export { LiteratureReviewClient };
//# sourceMappingURL=client.d.ts.map