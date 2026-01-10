# Gemini CLI MCP Server Configuration

This directory contains the configuration file for MCP (Model Context Protocol) servers used with Gemini CLI.

## Configuration File

The `.gemini/settings.json` file defines the MCP servers that Gemini CLI can connect to. Each server configuration includes:

### Available Servers

1. **filesystem** - File system access server
   - Allows reading/writing files in the current directory
   - Trusted by default for local development

2. **git** - Git repository server  
   - Provides git operations on the current repository
   - Trusted by default for local development

3. **brave-search** - Web search server
   - Requires `BRAVE_API_KEY` environment variable
   - Provides web search capabilities

4. **postgres** - PostgreSQL database server
   - Requires `DATABASE_URL` environment variable
   - Provides database query capabilities

### Configuration Properties

- `command`: The executable command to run
- `args`: Command-line arguments
- `env`: Environment variables (use `$VAR_NAME` syntax for references)
- `trust`: Whether to bypass tool call confirmations (default: false)
- `timeout`: Request timeout in milliseconds (default: 600000)

### Environment Variables

Set these environment variables before using Gemini CLI:

```bash
# For Brave Search (optional)
export BRAVE_API_KEY="your-brave-api-key"

# For PostgreSQL (optional)  
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Usage

1. Install MCP servers:
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-git
   npm install -g @modelcontextprotocol/server-brave-search
   npm install -g @modelcontextprotocol/server-postgres
   ```

2. Use Gemini CLI with MCP servers:
   ```bash
   gemini mcp list  # List configured servers
   gemini chat     # Start chat with MCP servers available
   ```

### Adding Custom Servers

You can add more servers by editing `.gemini/settings.json` or using the CLI:

```bash
gemini mcp add my-server npx @my/mcp-server --arg value
```
