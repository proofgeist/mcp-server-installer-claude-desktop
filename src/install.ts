#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { execSync } from 'child_process';

interface ClaudeConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args?: string[];
      env?: { [key: string]: string };
    };
  };
}

class MCPInstaller {
  private configPath: string;
  private serverName: string;
  private packageName: string;

  constructor(serverName: string, packageName: string) {
    this.serverName = serverName;
    this.packageName = packageName;
    
    const homeDir = os.homedir();
    const platform = os.platform();
    
    if (platform === 'darwin') {
      this.configPath = path.join(homeDir, 'Library/Application Support/Claude/claude_desktop_config.json');
    } else if (platform === 'win32') {
      this.configPath = path.join(homeDir, 'AppData/Roaming/Claude/claude_desktop_config.json');
    } else {
      this.configPath = path.join(homeDir, '.config/claude/claude_desktop_config.json');
    }
  }

  private async promptForToken(): Promise<string> {
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

  private async ensureConfigDir(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
    }
  }

  private async loadConfig(): Promise<ClaudeConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { mcpServers: {} };
    }
  }

  private async saveConfig(config: ClaudeConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  private getServerCommand(): string {
    try {
      // Try to find the package globally first
      const globalPath = execSync('npm root -g', { encoding: 'utf-8' }).trim();
      const serverPath = path.join(globalPath, this.packageName, 'dist/index.js');
      return `node ${serverPath}`;
    } catch {
      // Fall back to npx
      return `npx ${this.packageName}`;
    }
  }

  async install(): Promise<void> {
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
    config.mcpServers[this.serverName] = {
      command: this.getServerCommand(),
      env: {
        BEARER_TOKEN: token
      }
    };

    // Save updated config
    await this.saveConfig(config);

    console.log(`✅ ${this.serverName} MCP Server installed successfully!`);
    console.log(`Config saved to: ${this.configPath}`);
    console.log('\nRestart Claude Desktop to use the new server.');
  }

  async uninstall(): Promise<void> {
    console.log(`Uninstalling ${this.serverName} MCP Server...`);
    
    const config = await this.loadConfig();
    
    if (config.mcpServers[this.serverName]) {
      delete config.mcpServers[this.serverName];
      await this.saveConfig(config);
      console.log(`✅ ${this.serverName} MCP Server uninstalled successfully!`);
    } else {
      console.log(`${this.serverName} MCP Server is not installed.`);
    }
  }

  async status(): Promise<void> {
    const config = await this.loadConfig();
    const server = config.mcpServers[this.serverName];
    
    if (server) {
      console.log(`${this.serverName} MCP Server: ✅ INSTALLED`);
      console.log(`Command: ${server.command}`);
      console.log(`Token configured: ${server.env?.BEARER_TOKEN ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log(`${this.serverName} MCP Server: ❌ NOT INSTALLED`);
    }
  }
}

// Usage example - customize these values for your specific MCP server
const SERVER_NAME = 'my-api-server';
const PACKAGE_NAME = 'my-mcp-server';

async function main() {
  const installer = new MCPInstaller(SERVER_NAME, PACKAGE_NAME);
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
        console.log('Usage: npx my-mcp-server-installer [install|uninstall|status]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}