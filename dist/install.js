#!/usr/bin/env node
// ===============================
// MCP Server Installer Template
//
// To use this file for your own MCP server installer:
// 1. Change the CLI_NAME constant below to match your CLI command (should match the bin key in package.json)
// 2. Change the SERVER_CONFIG object below to set your server's name and endpoint
// 3. The rest of the logic is generic and does not need to be changed
// ===============================
const CLI_NAME = 'pg-mcp-server-installer'; // Should match package.json "bin" key
const SERVER_CONFIG = {
    name: 'Proof+Geist FileMaker 2025 Go-to-Market Hub',
    endpoint: 'https://proofgeist.app.n8n.cloud/mcp/b96923a4-3080-4a6e-9f34-42f1f79a7e0d/sse'
};
function makeClaudeConfigEntry(token) {
    return {
        command: "npx",
        args: [
            "mcp-remote",
            SERVER_CONFIG.endpoint,
            "--header",
            `Authorization: Bearer ${token}`
        ],
        env: {}
    };
}
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import readline from 'readline';
class MCPInstaller {
    configPath;
    serverName;
    constructor() {
        this.serverName = SERVER_CONFIG.name;
        const homeDir = os.homedir();
        const platform = os.platform();
        if (platform === 'darwin') {
            this.configPath = path.join(homeDir, 'Library/Application Support/Claude/claude_desktop_config.json');
        }
        else if (platform === 'win32') {
            this.configPath = path.join(homeDir, 'AppData/Roaming/Claude/claude_desktop_config.json');
        }
        else {
            this.configPath = path.join(homeDir, '.config/claude/claude_desktop_config.json');
        }
    }
    async promptForToken() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(`Enter your bearer token for ${this.serverName}: `, (token) => {
                rl.close();
                resolve(token.trim());
            });
        });
    }
    async ensureConfigDir() {
        const configDir = path.dirname(this.configPath);
        try {
            await fs.access(configDir);
        }
        catch {
            await fs.mkdir(configDir, { recursive: true });
        }
    }
    async loadConfig() {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return { mcpServers: {} };
        }
    }
    async saveConfig(config) {
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    }
    async install() {
        console.log(`Installing ${this.serverName} MCP Server...`);
        // Get bearer token
        const token = await this.promptForToken();
        if (!token) {
            throw new Error('Bearer token is required');
        }
        // Ensure config directory exists
        await this.ensureConfigDir();
        // Load existing config
        const config = await this.loadConfig();
        // Add server configuration
        config.mcpServers[this.serverName] = makeClaudeConfigEntry(token);
        // Save updated config
        await this.saveConfig(config);
        console.log(`✅ ${this.serverName} MCP Server installed successfully!`);
        console.log(`Config saved to: ${this.configPath}`);
        console.log('\nRestart Claude Desktop to use the new server.');
    }
    async uninstall() {
        console.log(`Uninstalling ${this.serverName} MCP Server...`);
        const config = await this.loadConfig();
        if (config.mcpServers[this.serverName]) {
            delete config.mcpServers[this.serverName];
            await this.saveConfig(config);
            console.log(`✅ ${this.serverName} MCP Server uninstalled successfully!`);
        }
        else {
            console.log(`${this.serverName} MCP Server is not installed.`);
        }
    }
    async status() {
        const config = await this.loadConfig();
        const server = config.mcpServers[this.serverName];
        if (server) {
            console.log(`${this.serverName} MCP Server: ✅ INSTALLED`);
            console.log(`Command: ${server.command}`);
            if (server.args) {
                console.log(`Args: ${JSON.stringify(server.args)}`);
            }
            if (server.env) {
                console.log(`Env: ${JSON.stringify(server.env)}`);
            }
        }
        else {
            console.log(`${this.serverName} MCP Server: ❌ NOT INSTALLED`);
        }
    }
}
async function main() {
    const installer = new MCPInstaller();
    const command = process.argv[2];
    try {
        switch (command) {
            case 'install':
                await installer.install();
                break;
            case 'uninstall':
                await installer.uninstall();
                break;
            case 'status':
                await installer.status();
                break;
            default:
                console.log(`Usage: npx ${CLI_NAME} [install|uninstall|status]`);
                process.exit(1);
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
main();
//# sourceMappingURL=install.js.map