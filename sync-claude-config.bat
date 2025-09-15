@echo off
REM Sync Claude Desktop Config Script
REM This script keeps your Claude Desktop config synchronized with your OneDrive

SET "ONEDRIVE_CONFIG=%~dp0claude_desktop_config.json"
SET "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

echo Syncing Claude Desktop configuration...

REM Create Claude directory if it doesn't exist
if not exist "%APPDATA%\Claude" (
    mkdir "%APPDATA%\Claude"
    echo Created Claude config directory
)

REM Copy from OneDrive to Claude Desktop
copy "%ONEDRIVE_CONFIG%" "%CLAUDE_CONFIG%" >nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Configuration synced successfully
    echo ✓ Claude Desktop config updated from OneDrive
) else (
    echo ✗ Error syncing configuration
)

echo.
echo Claude Desktop configuration is now synced.
echo Restart Claude Desktop to apply changes.

pause