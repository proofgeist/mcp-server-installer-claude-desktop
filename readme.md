# My MCP Server Installer

## Using This Project as a Template

To create your own MCP server installer based on this template:

1. **Clone this repository:**
   ```sh
   git clone https://github.com/yourorg/mcp-server-installer-template.git
   cd mcp-server-installer-template
   ```
2. **Edit `src/install.ts`:**
   - Update the `SERVER_CONFIG` object at the top with your server's name and endpoint.
   - (Optional) Update the `CLI_NAME` constant to match your desired CLI command. `pg-mcp-server-installer` is the generic name which is generally fine.
3. **Edit `package.json`:**
   - Change the `"bin"` field to your desired CLI command name (should match `CLI_NAME` in `src/install.ts`).
   - Update `"name"` and other metadata as needed.
4. **Build the project:**
   ```sh
   npm run build
   ```
5. **Test locally:**
   ```sh
   npm link
   your-cli-name install
   ```
6. **Publish to npm (optional):**
   ```sh
   npm publish
   ```

Now your installer is ready for your MCP server!

### What to Change

| What to Change         | Where to Change         | Example                        |
|-----------------------|------------------------|--------------------------------|
| Server name/endpoint   | `src/install.ts`       | `SERVER_CONFIG` object         |
| CLI command name       | `package.json` (`bin`) | `"my-mcp-server-installer"`    |
| Package metadata       | `package.json`         | `"name"`, `"author"`, etc.     |

---

This project provides a CLI installer for configuring Claude Desktop to use a custom MCP server with bearer token authentication.

## How It Works

- **`package.json`** defines the CLI command name (via the `bin` field) and points to the compiled JavaScript entry point (e.g., `dist/install.js`).
- **`src/install.ts`** contains the installer logic and server-specific configuration constants (such as server name and endpoint).
- The CLI command (e.g., `my-mcp-server-installer`) is set in `package.json` and referenced in help messages in `install.ts`.
- Server-specific values (like the Claude config entry name and endpoint) are set as constants in `install.ts`.

## Setup

1. **Edit `src/install.ts`**
   - Set your server name and endpoint at the top of the file:
     ```ts
     const SERVER_NAME = 'Your Server Name';
     const ENDPOINT = 'https://your-endpoint.example.com/sse';
     ```
2. **Edit `package.json`**
   - Set the CLI command name in the `bin` field:
     ```json
     "bin": {
       "my-mcp-server-installer": "./dist/install.js"
     }
     ```
   - This makes the CLI available as `npx my-mcp-server-installer` after publishing or linking.

3. **Build the Installer**
   ```sh
   npm run build
   # or
   npx tsc
   ```

## Usage

### Local Development
- Run the installer directly with ts-node:
  ```sh
  npx ts-node src/install.ts install
  ```
- Or, build and run the compiled JS:
  ```sh
  npm run build
  node dist/install.js install
  ```

### CLI Use (after publishing or linking)
- Install globally for local testing:
  ```sh
  npm link
  my-mcp-server-installer install
  ```
- Or use npx (after publishing to npm):
  ```sh
  npx my-mcp-server-installer install
  ```

## What the Installer Does
- Prompts for a bearer token.
- Adds or updates an entry in your Claude Desktop config (e.g., `claude_desktop_config.json`) with the specified server name and endpoint.
- The config entry will look like:
  ```json
  "Your Server Name": {
    "command": "npx",
    "args": [
      "mcp-remote",
      "https://your-endpoint.example.com/sse",
      "--header",
      "Authorization: Bearer <YOUR_TOKEN>"
    ],
    "env": {}
  }
  ```

## Customization
- To create a new installer for a different server, just update the constants at the top of `src/install.ts` and the CLI name in `package.json` if desired.

## Notes
- The CLI command name is set in `package.json` and should be referenced in help messages in your code for consistency.
- Server-specific values only need to be set in `src/install.ts`.

---

For more details, see the comments in `src/install.ts` and `package.json`.

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

## Project Structure

```
├── src/
│   └── install.ts      # Main installer logic (TypeScript)
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

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