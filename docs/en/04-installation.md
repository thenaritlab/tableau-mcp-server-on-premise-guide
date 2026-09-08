[🏠 Home](../../README.md) · [◀ Previous: Prerequisites](03-prerequisites.md) · [Next: Top 5 use cases ▶](05-use-cases.md) · [🇹🇭 ภาษาไทย](../th/04-installation.md)

---

# ⚙️ Installation and configuration

`Section 4 of 9`

> Four parts: prepare Tableau Server, run Tableau MCP (local stdio first, then a shared HTTP server), connect each AI client, and verify. Every command uses placeholder names; replace them with your own.

## 4.1 Prepare Tableau Server

### Create a Personal Access Token (for local testing)

1. **Sign in to Tableau Server** — as the user the MCP server will act as. For a quick test that can be your own account; for anything shared use a dedicated user such as `svc-mcp-reader`.
2. **Open account settings** — Click your avatar (top right) › *My Account Settings* › scroll to *Personal Access Tokens*.
3. **Create the token** — Token name `mcp-demo-pat` › *Create Token*. Copy the secret now: it is shown once. The token name, not your username, goes into `PAT_NAME`.
4. **Note the site content URL** — It is the part after `/#/site/` in your browser URL, e.g. `DemoSite`. For the Default site leave `SITE_NAME` empty.
5. **Prove the PAT works** — before involving MCP:

**`rest-signin-check.sh`**

```bash
# Proves the PAT works against Tableau Server REST API directly (bypasses MCP)
curl -s -k -X POST https://demo-server.local/api/3.24/auth/signin \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"credentials":{"personalAccessTokenName":"mcp-demo-pat",
       "personalAccessTokenSecret":"<YOUR_PAT_VALUE>",
       "site":{"contentUrl":"DemoSite"}}}'
# success: {"credentials":{"site":{...},"user":{...},"token":"..."}}
```

> [!WARNING]
> **PATs expire**
>
> A PAT that is not used for 15 days is revoked (site admins can change the window). If a working setup suddenly returns 401 after a holiday, this is usually why.

### Create a Connected App (for Direct Trust or the portal)

1. **Go to** — *Settings › Connected Apps › New Connected App › Direct Trust* (site administrator required).
2. **Name it** — `mcp-direct-trust`. Access level: *All projects* or a specific project if you want to fence the AI in. Domain allow-list: leave default for server-side use.
3. **Generate a secret** — and record *Client ID*, *Secret ID* and *Secret value*.
4. **Enable the app** — The toggle is off after creation. A disabled Connected App produces 401 with a JWT error in the log.

### Allow the OAuth redirect (OAuth mode only, 2025.3+)

Run on a Tableau Server node as a TSM administrator:

**`tsm-oauth.sh`**

```bash
# Run on a Tableau Server node as a TSM admin. Value = MCP host WITHOUT protocol or trailing slash.
tsm configuration set -k oauth.allowed_redirect_uri_hosts -v tableau-mcp.demo-company.local
tsm pending-changes apply
```

## 4.2 Install and run Tableau MCP

### Option A – local stdio (5 minutes)

Nothing to install: the AI client runs `npx -y @tableau/mcp-server@latest` and passes the environment variables. You only need Node.js 18+ on PATH. Jump to 4.3 and use the *stdio* config for your client.

To check Node.js:

```bash
node -v      # v18 or later
npx -y @tableau/mcp-server@latest --help
```

### Option B – shared HTTP server with Docker (30 minutes)

1. **Prepare a folder** — on the MCP host: `sudo mkdir -p /opt/tableau-mcp && cd /opt/tableau-mcp`.
2. **Choose an auth mode and write `.env`** — Pick one of the three files below. Start with PAT on an isolated machine; move to OAuth before letting other people connect.

<details><summary>.env – PAT (testing only)</summary>

**`http-pat.env`**

```dotenv
# Tableau MCP - HTTP transport, PAT auth (testing / single user only)
SERVER=https://demo-server.local
SITE_NAME=DemoSite
TRANSPORT=http
PORT=3927

AUTH=pat
PAT_NAME=mcp-demo-pat
PAT_VALUE=<YOUR_PAT_VALUE>

# With TRANSPORT=http, OAuth is required by default.
# Only disable it on an isolated network for testing.
DANGEROUSLY_DISABLE_OAUTH=true

# Tableau Server has no Pulse - hide those tools
EXCLUDE_TOOLS=pulse
PRODUCT_TELEMETRY_ENABLED=false
```

</details>

<details><summary>.env – Connected App / Direct Trust</summary>

**`http-direct-trust.env`**

```dotenv
# Tableau MCP - HTTP transport, Connected App (Direct Trust) auth
SERVER=https://demo-server.local
SITE_NAME=DemoSite
TRANSPORT=http
PORT=3927

AUTH=direct-trust
JWT_SUB_CLAIM=svc-mcp-reader
CONNECTED_APP_CLIENT_ID=<CONNECTED_APP_CLIENT_ID>
CONNECTED_APP_SECRET_ID=<CONNECTED_APP_SECRET_ID>
CONNECTED_APP_SECRET_VALUE=<CONNECTED_APP_SECRET_VALUE>

# Required when not using OAuth on HTTP transport (see warning in the guide)
DANGEROUSLY_DISABLE_OAUTH=true

EXCLUDE_TOOLS=pulse
PRODUCT_TELEMETRY_ENABLED=false
```

</details>

<details><summary>.env – OAuth (recommended for teams)</summary>

Generate the RSA key first:

**`openssl-key.sh`**

```bash
sudo mkdir -p /etc/tableau-mcp
sudo openssl genrsa -out /etc/tableau-mcp/private.pem 2048
sudo chmod 600 /etc/tableau-mcp/private.pem
```

**`http-oauth.env`**

```dotenv
# Tableau MCP - HTTP transport, OAuth (recommended for multi-user). Tableau Server 2025.3+
SERVER=https://demo-server.local
SITE_NAME=DemoSite
TRANSPORT=http
PORT=3927

AUTH=oauth
# Local testing:
OAUTH_ISSUER=http://127.0.0.1:3927
# Production (behind your reverse proxy / TLS):
#OAUTH_ISSUER=https://tableau-mcp.demo-company.local
#OAUTH_RESOURCE_URI=https://tableau-mcp.demo-company.local

# RSA private key used to decrypt the access tokens it issues (one of the two)
OAUTH_JWE_PRIVATE_KEY_PATH=/etc/tableau-mcp/private.pem
#OAUTH_JWE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----

# Optional: let users pick any site they can access
#OAUTH_LOCK_SITE=false
# Optional: access token lifetime (default 1 hour)
#OAUTH_ACCESS_TOKEN_TIMEOUT_MS=86400000

EXCLUDE_TOOLS=pulse
PRODUCT_TELEMETRY_ENABLED=false
ENABLED_LOGGERS=fileLogger
FILE_LOGGER_DIRECTORY=/var/log/tableau-mcp
```

</details>

> [!IMPORTANT]
> **Verify with current docs**
>
> The listening port is `3927` by default. Confirm the exact environment variable that overrides it in the current Configuration › Environment variables page of the Tableau MCP docs before relying on `PORT`.

3. **Run the container**

**`docker-run.sh`**

```bash
# Pin a real version tag instead of :latest in production
docker run -d --name tableau-mcp \
  --restart unless-stopped \
  --env-file /opt/tableau-mcp/.env \
  -p 3927:3927 \
  ghcr.io/tableau/tableau-mcp:latest
docker logs -f tableau-mcp
```

Or with Docker Compose (binds to localhost so only the reverse proxy can reach it):

**`docker-compose.yml`**

```yaml
services:
  tableau-mcp:
    image: ghcr.io/tableau/tableau-mcp:latest   # pin a version in production
    container_name: tableau-mcp
    restart: unless-stopped
    env_file: ./.env
    ports:
      - "127.0.0.1:3927:3927"    # bind to localhost; expose via reverse proxy only
    volumes:
      - ./private.pem:/etc/tableau-mcp/private.pem:ro
      - ./logs:/var/log/tableau-mcp
```

4. **Look for the ready line** — in the logs: `tableau-mcp v3.6.0 streamable HTTP server available at http://localhost:3927/tableau-mcp`.

### Option C – shared HTTP server with Node.js and systemd

Use the same `.env` as option B.

**`run-npx.sh`**

```bash
# Runs in the folder that contains your .env file
cd /opt/tableau-mcp
npx -y @tableau/mcp-server@latest
# expected: tableau-mcp vX.Y.Z streamable HTTP server available at http://localhost:3927/tableau-mcp
```

For an unattended service:

**`tableau-mcp.service`**

```ini
# /etc/systemd/system/tableau-mcp.service
[Unit]
Description=Tableau MCP server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tableaumcp
WorkingDirectory=/opt/tableau-mcp
EnvironmentFile=/opt/tableau-mcp/.env
ExecStart=/usr/bin/npx -y @tableau/mcp-server@3.6.0
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**`systemd-enable.sh`**

```bash
sudo useradd -r -s /usr/sbin/nologin tableaumcp
sudo chown -R tableaumcp:tableaumcp /opt/tableau-mcp /etc/tableau-mcp
sudo systemctl daemon-reload
sudo systemctl enable --now tableau-mcp
sudo systemctl status tableau-mcp
```

### Put TLS and an allow-list in front (options B and C)

**`nginx-tableau-mcp.conf`**

```nginx
# /etc/nginx/conf.d/tableau-mcp.conf
server {
    listen 443 ssl;
    server_name tableau-mcp.demo-company.local;

    ssl_certificate     /etc/ssl/certs/tableau-mcp.crt;
    ssl_certificate_key /etc/ssl/private/tableau-mcp.key;

    # Only allow your office / VPN ranges
    allow 10.0.0.0/8;
    allow 192.168.0.0/16;
    deny  all;

    location / {
        proxy_pass         http://127.0.0.1:3927;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        # Streamable HTTP uses SSE-style streaming - do not buffer
        proxy_buffering    off;
        proxy_read_timeout 300s;
    }
}
```

With this in place the URL your users configure is `https://tableau-mcp.demo-company.local/tableau-mcp`, and `OAUTH_ISSUER` / `OAUTH_RESOURCE_URI` in `.env` must match `https://tableau-mcp.demo-company.local`.

### Limit what the AI can see (optional but recommended)

**`tool-scoping.env`**

```dotenv
# Limit what the AI can see. All values are comma-separated LUIDs / names.
INCLUDE_PROJECT_IDS=<PROJECT_LUID>
INCLUDE_TAGS=ai-ready
# or lock to specific published data sources only:
#INCLUDE_DATASOURCE_IDS=<DATASOURCE_LUID_1>,<DATASOURCE_LUID_2>
# or expose only the data source tool group:
#INCLUDE_TOOLS=datasource
```

Tool groups you will use most: `datasource` (metadata + query), `workbook`, `view`, `pulse` (exclude on Server), `admin`. The full list is in `src/tools/web/toolName.ts` in the repo.

## 4.3 Connect each AI client

### Claude Desktop

1. **Open the config file** — Claude Desktop › *Settings › Developer › Edit Config*. Paths: Windows `%APPDATA%\Claude\claude_desktop_config.json`, macOS `~/Library/Application Support/Claude/claude_desktop_config.json`.
2. **Add the server (stdio)**

**`claude-desktop.json`**

```json
{
  "mcpServers": {
    "tableau-demo": {
      "command": "npx",
      "args": ["-y", "@tableau/mcp-server@latest"],
      "env": {
        "SERVER": "https://demo-server.local",
        "SITE_NAME": "DemoSite",
        "PAT_NAME": "mcp-demo-pat",
        "PAT_VALUE": "<YOUR_PAT_VALUE>",
        "EXCLUDE_TOOLS": "pulse"
      }
    }
  }
}
```

Or point Claude Desktop at the shared HTTP server through the `mcp-remote` bridge (it handles the OAuth sign-in pop-up):

**`claude-desktop-http.json`**

```json
{
  "mcpServers": {
    "tableau-demo": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:3927/tableau-mcp"]
    }
  }
}
```

3. **Restart Claude Desktop** — fully (quit from the tray on Windows). The tools icon under the prompt box should list `tableau-demo`.
4. **Test** — with *"List my Tableau data sources."*

### Claude Code

**`claude-code.sh`**

```bash
# Option A: local stdio server (Claude Code starts it for you)
claude mcp add tableau-demo \
  -e SERVER=https://demo-server.local \
  -e SITE_NAME=DemoSite \
  -e PAT_NAME=mcp-demo-pat \
  -e PAT_VALUE=<YOUR_PAT_VALUE> \
  -e EXCLUDE_TOOLS=pulse \
  -- npx -y @tableau/mcp-server@latest

# Option B: shared HTTP server (already running on port 3927)
claude mcp add --transport http tableau-demo http://127.0.0.1:3927/tableau-mcp

# Check the connection
claude mcp list
```

Then inside a Claude Code session type `/mcp` to see the connection status and sign in if OAuth is enabled.

### ChatGPT

ChatGPT runs in OpenAI's cloud, so it needs the HTTP deployment reachable on a public HTTPS URL with OAuth enabled (options B/C + reverse proxy, or a tunnel for a demo).

1. **Enable developer mode** — *Settings › Connectors › Advanced › Developer mode* (name and location vary by plan).
2. **Create a connector** — *Connectors › Create*. Name `Tableau Demo`, MCP server URL `https://tableau-mcp.demo-company.local/tableau-mcp`, authentication *OAuth*. ChatGPT discovers the embedded authorization server automatically.
3. **Authorise** — You are redirected to your Tableau Server sign-in page and back.
4. **Use it** — In a new chat open *Tools* › enable `Tableau Demo` and ask *"Which published data sources can I query?"*

> [!IMPORTANT]
> **Verify with current docs**
>
> The connector UI and plan requirements in ChatGPT change frequently. Confirm the current path in OpenAI's Help Center before a customer demo.

### Gemini CLI

Edit `~/.gemini/settings.json` (or `.gemini/settings.json` inside a project):

**`gemini-settings.json`**

```json
{
  "mcpServers": {
    "tableau-demo": {
      "command": "npx",
      "args": ["-y", "@tableau/mcp-server@latest"],
      "env": {
        "SERVER": "https://demo-server.local",
        "SITE_NAME": "DemoSite",
        "PAT_NAME": "mcp-demo-pat",
        "PAT_VALUE": "<YOUR_PAT_VALUE>",
        "EXCLUDE_TOOLS": "pulse"
      },
      "timeout": 60000
    }
  }
}
```

For the shared server use `httpUrl` instead:

**`gemini-settings-http.json`**

```json
{
  "mcpServers": {
    "tableau-demo": {
      "httpUrl": "http://127.0.0.1:3927/tableau-mcp",
      "timeout": 60000
    }
  }
}
```

Start `gemini`, run `/mcp` to confirm the server is connected, then ask a question.

### Microsoft Copilot

**Copilot Studio (agents for Teams / M365):** Copilot Studio calls MCP servers over Streamable HTTP from Microsoft's cloud, so use the public HTTPS URL with OAuth.

1. **Open your agent** — › *Tools › Add a tool › Model Context Protocol*.
2. **Server URL** — `https://tableau-mcp.demo-company.local/tableau-mcp`, authentication *OAuth 2.0*. Fill the authorize / token endpoints shown by `https://tableau-mcp.demo-company.local/.well-known/oauth-authorization-server`.
3. **Add the tool to the agent** — , publish, and test in the test pane with *"Show me the list of Tableau workbooks."*

**GitHub Copilot in VS Code:** create `.vscode/mcp.json` in your workspace:

**`vscode-mcp.json`**

```json
{
  "servers": {
    "tableau-demo": {
      "type": "http",
      "url": "http://127.0.0.1:3927/tableau-mcp"
    }
  }
}
```

Open Copilot Chat in *Agent* mode; the Tableau tools appear in the tools picker.

> [!IMPORTANT]
> **Verify with current docs**
>
> Copilot Studio's MCP support and the exact authentication form fields are evolving. Check Microsoft Learn › Copilot Studio › "Add an MCP server" for the current steps.

## 4.4 Verify the connection

### From the MCP host

**`curl-ping.sh`**

```bash
curl -s -X POST http://127.0.0.1:3927/tableau-mcp \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":"1","method":"ping"}'
# healthy: {"jsonrpc":"2.0","id":"1","result":{}}
```

**`curl-init.sh`**

```bash
curl -s -X POST http://127.0.0.1:3927/tableau-mcp \
  -H 'accept: application/json, text/event-stream' \
  -H 'content-type: application/json' \
  -d '{
    "jsonrpc": "2.0", "id": 1, "method": "initialize",
    "params": {
      "protocolVersion": "2025-11-25",
      "capabilities": {},
      "clientInfo": { "name": "curl-check", "version": "1.0.0" }
    }
  }'
# No OAuth  -> {"result":{"serverInfo":{"name":"tableau-mcp",...}}}
# With OAuth -> {"error":"unauthorized","error_description":"Authorization required. Use OAuth 2.1 flow."}
```

### From the AI client

Ask, in order:

1. *"List my Tableau data sources."* → the client should call `list-datasources` and show names.
2. *"What fields are in the Sales data source?"* → `list-fields` (or `get-datasource-metadata`).
3. *"What were total sales by region last year?"* → `query-datasource` with a small aggregate query.

If step 1 works, authentication and networking are fine. If step 3 fails but 1–2 work, it is a permission (API access) or a field-name problem.

### Common errors and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Unauthorized` on every tool | Wrong `SERVER`/`SITE_NAME`, PAT expired, `PAT_NAME` set to username, Connected App disabled | Re-run the REST sign-in curl; regenerate the PAT; check the Connected App toggle |
| `403 Forbidden` on `query-datasource` only | User lacks "API access" / "Connect" on that data source | Grant the capability on the data source or project |
| `Method not allowed` when opening the URL in a browser | Normal: GET is not part of MCP | Use the curl `initialize` test |
| Client says "authorization required" and never opens a browser | Client does not support OAuth flow, or `OAUTH_ISSUER` does not match the public URL | Use `mcp-remote` for Claude Desktop; align `OAUTH_ISSUER`, `OAUTH_RESOURCE_URI` and the nginx `server_name` |
| OAuth sign-in loops or "redirect URI not allowed" | `tsm oauth.allowed_redirect_uri_hosts` not set or wrong host | Set it to the MCP host name, apply pending changes |
| Users must reconnect after every restart | Refresh tokens live in MCP process memory | Known limitation; raise `OAUTH_ACCESS_TOKEN_TIMEOUT_MS`, avoid unnecessary restarts |
| `self signed certificate` / TLS errors | Tableau Server uses an internal CA | Export the CA chain and set `NODE_EXTRA_CA_CERTS=/path/ca.pem` for the MCP process (in Docker, mount it and set the variable) |
| Tools list is empty in the client | Server started with a typo in `INCLUDE_TOOLS` | Check the startup log; tool names are case-sensitive |
| Model calls no tool and answers from memory | Client not in agent/tools mode, or a weak model | Enable tools for the chat; use a tool-capable model |
| Pulse tools appear and fail | Pulse is Tableau Cloud only | `EXCLUDE_TOOLS=pulse` |
| Very slow responses | Huge data sources; every query goes through VDS | Scope with `INCLUDE_DATASOURCE_IDS`; ask for aggregates, not row-level dumps |

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ **[Installation and configuration](04-installation.md)**
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🛡️ [Best practices, governance and security checklist](07-best-practices.md)
8. ❓ [FAQ and glossary](08-faq-glossary.md)
9. 🔗 [References](09-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Prerequisites](03-prerequisites.md) · [Next: Top 5 use cases ▶](05-use-cases.md) · [🇹🇭 ภาษาไทย](../th/04-installation.md)

<sub>Section 4 of 9 · Created by The Narit Lab</sub>
