@echo off
cd /d "C:\Users\Tompe\OneDrive - University of Strathclyde (1)\GitHub-Projects\literature-review-mcp"
set DATABASE_URL=sqlite://literature_review.db
set PDF_STORAGE_PATH=C:\Users\Tompe\OneDrive - University of Strathclyde (1)\PhD Files\MCP
set OUTPUT_PATH=C:\Users\Tompe\OneDrive - University of Strathclyde (1)\PhD Files\MCP\outputs
echo Starting Literature Review MCP Server...
echo Working directory: %CD%
echo Database URL: %DATABASE_URL%
node dist/index.js 2>&1
echo Server exited with code: %ERRORLEVEL%
pause