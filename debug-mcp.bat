@echo off
echo [DEBUG] Starting Literature Review MCP Server Debug...
echo [DEBUG] Current Time: %date% %time%
echo [DEBUG] Working Directory: %cd%
echo [DEBUG] Node.js Path: "C:\Program Files\nodejs\node.exe"
echo [DEBUG] Script Path: "%~dp0dist\index.js"
echo [DEBUG] Environment Variables:
echo [DEBUG] - DATABASE_URL: %DATABASE_URL%
echo [DEBUG] - PDF_STORAGE_PATH: %PDF_STORAGE_PATH%
echo [DEBUG] - OUTPUT_PATH: %OUTPUT_PATH%
echo [DEBUG] - NODE_ENV: %NODE_ENV%
echo.
echo [DEBUG] Starting server...
"C:\Program Files\nodejs\node.exe" "%~dp0dist\index.js"
echo.
echo [DEBUG] Server exited with code: %ERRORLEVEL%
pause