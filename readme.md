# MCP Server with Auth Bearer Token Installer

A simple installer for MCP (Model Context Protocol) servers that need bearer token authentication with Claude Desktop.

Clone me to make your own mcp-server installer

## Quick Start

```bash
# Install the MCP server
npx my-mcp-server-installer install

# Check installation status
npx my-mcp-server-installer status

# Uninstall the MCP server
npx my-mcp-server-installer uninstall
```

## What It Does

This installer:
- Prompts for your bearer token
- Finds your Claude Desktop config file automatically
- Adds your MCP server configuration with token authentication
- Works across macOS, Windows, and Linux

## Configuration Location

The installer automatically finds your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## Customization

To create your own installer:

1. Clone this repository
2. Update the constants in `src/install.ts`:
   ```typescript
   const SERVER_NAME = 'your-server-name';
   const PACKAGE_NAME = 'your-npm-package-name';
   ```
3. Update `package.json` with your details
4. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

## Project Structure

```
├── src/
│   └── install.ts      # Main installer logic
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## How It Works

The installer:
1. Detects your operating system
2. Locates the Claude Desktop config file
3. Prompts for your bearer token
4. Updates the config with your MCP server entry
5. Sets the token as an environment variable

## Security Notes

- Tokens are stored in your local Claude Desktop config file
- The config file is only readable by your user account
- No tokens are transmitted or stored elsewhere

## Requirements

- Node.js 18 or higher
- Claude Desktop installed
- Valid bearer token for your MCP server

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test locally
node dist/install.js install
```

## License

MIT