@echo off
echo Setting up Claude Desktop configuration...

REM Create Claude config directory if it doesn't exist
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM Copy config file to Claude Desktop location
copy /Y "claude_desktop_config.json" "%APPDATA%\Claude\claude_desktop_config.json"

echo Configuration copied successfully!
echo Please restart Claude Desktop to load the new MCP server.
pause