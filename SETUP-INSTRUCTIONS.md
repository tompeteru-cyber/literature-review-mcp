# Claude Desktop MCP Setup Instructions

## Quick Setup (Windows)

1. **Navigate to project folder:**
   ```cmd
   cd "C:\Users\Tompe\OneDrive - University of Strathclyde (1)\GitHub-Projects\literature-review-mcp"
   ```

2. **Run setup script:**
   ```cmd
   setup-claude-config.bat
   ```

3. **Restart Claude Desktop** completely

## Manual Setup (Any OS)

### Windows:
```cmd
copy claude_desktop_config.json %APPDATA%\Claude\
```

### Mac:
```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/
```

### Linux:
```bash
cp claude_desktop_config.json ~/.config/Claude/
```

## Verify Setup

After restarting Claude Desktop, you should see:
- 🔧 Tools icon available
- Literature review tools in the tools menu
- Server connecting when you use MCP tools

## Troubleshooting

1. **Server not starting:** Check that `dist/index.js` exists
2. **Path errors:** Ensure OneDrive folder paths match your system
3. **Permission errors:** Run as administrator on Windows

## Cross-Device Sync

1. **Git pull** latest changes on new device
2. **Run setup script** or manual copy
3. **Restart Claude Desktop**
4. Ready to use!

---
*Generated for Literature Review MCP Server*