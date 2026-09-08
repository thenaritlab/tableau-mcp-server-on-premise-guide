[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: สิ่งที่ต้องเตรียม](03-prerequisites.md) · [ถัดไป: 5 use case ยอดนิยม ▶](05-use-cases.md) · [🇺🇸 English](../en/04-installation.md)

---

# ⚙️ การติดตั้งและตั้งค่า

`ส่วนที่ 4 จาก 9`

> แบ่งเป็นสี่ส่วน: เตรียม Tableau Server, รัน Tableau MCP (เริ่มจาก stdio บนเครื่องตัวเอง แล้วค่อยเป็น HTTP server ใช้ร่วมกัน), เชื่อม AI client แต่ละตัว และตรวจสอบ ทุกคำสั่งใช้ชื่อตัวอย่าง ให้แทนด้วยค่าของคุณเอง

## 🛠️ 4.1 เตรียม Tableau Server

### สร้าง Personal Access Token (สำหรับทดสอบบนเครื่องตัวเอง)

1. **เข้าสู่ระบบ Tableau Server** — ด้วยผู้ใช้ที่ MCP server จะทำงานแทน ทดสอบเร็วๆ ใช้บัญชีตัวเองได้ แต่ถ้าใช้ร่วมกันให้ใช้ผู้ใช้เฉพาะ เช่น `svc-mcp-reader`
2. **เปิดการตั้งค่าบัญชี** — คลิกรูปโปรไฟล์ (มุมขวาบน) › *My Account Settings* › เลื่อนไปที่ *Personal Access Tokens*
3. **สร้างโทเคน** — ตั้งชื่อ `mcp-demo-pat` › *Create Token* คัดลอก secret ทันที เพราะแสดงครั้งเดียว ค่าที่ใส่ใน `PAT_NAME` คือชื่อโทเคน ไม่ใช่ชื่อผู้ใช้
4. **จด content URL ของ site** — คือส่วนหลัง `/#/site/` ใน URL ของเบราว์เซอร์ เช่น `DemoSite` ถ้าเป็น Default site ให้เว้น `SITE_NAME` ว่าง
5. **พิสูจน์ว่า PAT ใช้ได้** — ก่อนเกี่ยวข้องกับ MCP:

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
> **PAT หมดอายุได้**
>
> PAT ที่ไม่ได้ใช้ 15 วันจะถูกเพิกถอน (site admin ปรับช่วงเวลาได้) ถ้าระบบที่เคยใช้ได้กลับได้ 401 หลังหยุดยาว สาเหตุมักเป็นข้อนี้

### สร้าง Connected App (สำหรับ Direct Trust หรือ portal)

1. **ไปที่** — *Settings › Connected Apps › New Connected App › Direct Trust* (ต้องเป็น site administrator)
2. **ตั้งชื่อ** — `mcp-direct-trust` ระดับการเข้าถึง: *All projects* หรือระบุ project เดียวหากต้องการจำกัด AI ไว้ Domain allow-list ปล่อยค่าเริ่มต้นสำหรับการใช้ฝั่ง server
3. **สร้าง secret** — แล้วบันทึก *Client ID*, *Secret ID* และ *Secret value*
4. **เปิดใช้งานแอป** — สวิตช์จะปิดอยู่หลังสร้าง Connected App ที่ปิดอยู่จะให้ 401 พร้อมข้อผิดพลาด JWT ใน log

### อนุญาต OAuth redirect (เฉพาะโหมด OAuth, 2025.3+)

รันบน Tableau Server node ในฐานะผู้ดูแล TSM:

**`tsm-oauth.sh`**

```bash
# Run on a Tableau Server node as a TSM admin. Value = MCP host WITHOUT protocol or trailing slash.
tsm configuration set -k oauth.allowed_redirect_uri_hosts -v tableau-mcp.demo-company.local
tsm pending-changes apply
```

## 📦 4.2 ติดตั้งและรัน Tableau MCP

### ทางเลือก A – stdio บนเครื่องตัวเอง (5 นาที)

ไม่ต้องติดตั้งอะไร AI client จะรัน `npx -y @tableau/mcp-server@latest` และส่งตัวแปรสภาพแวดล้อมให้เอง ต้องการแค่ Node.js 18+ บน PATH ข้ามไป 4.3 แล้วใช้ config แบบ *stdio* ของ client ที่ใช้

ตรวจ Node.js:

```bash
node -v      # v18 ขึ้นไป
npx -y @tableau/mcp-server@latest --help
```

### ทางเลือก B – HTTP server ใช้ร่วมกันด้วย Docker (30 นาที)

1. **เตรียมโฟลเดอร์** — บนเครื่องที่รัน MCP: `sudo mkdir -p /opt/tableau-mcp && cd /opt/tableau-mcp`
2. **เลือกโหมด auth แล้วเขียน `.env`** — เลือกไฟล์ใดไฟล์หนึ่งด้านล่าง เริ่มจาก PAT บนเครื่องที่แยกเครือข่าย แล้วย้ายไป OAuth ก่อนให้คนอื่นเชื่อมต่อ

<details><summary>.env – PAT (ทดสอบเท่านั้น)</summary>

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

<details><summary>.env – OAuth (แนะนำสำหรับทีม)</summary>

สร้าง RSA key ก่อน:

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
> **ตรวจสอบกับเอกสารล่าสุด**
>
> พอร์ตรับฟังเริ่มต้นคือ `3927` ตรวจชื่อตัวแปรสภาพแวดล้อมที่ใช้เปลี่ยนพอร์ตในหน้า Configuration › Environment variables ของเอกสาร Tableau MCP ฉบับปัจจุบันก่อนพึ่งพา `PORT`

3. **รันคอนเทนเนอร์**

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

หรือใช้ Docker Compose (bind กับ localhost เพื่อให้เฉพาะ reverse proxy เข้าถึงได้):

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

4. **มองหาบรรทัดพร้อมใช้งาน** — ใน log: `tableau-mcp v3.6.0 streamable HTTP server available at http://localhost:3927/tableau-mcp`

### ทางเลือก C – HTTP server ใช้ร่วมกันด้วย Node.js และ systemd

ใช้ `.env` เดียวกับทางเลือก B

**`run-npx.sh`**

```bash
# Runs in the folder that contains your .env file
cd /opt/tableau-mcp
npx -y @tableau/mcp-server@latest
# expected: tableau-mcp vX.Y.Z streamable HTTP server available at http://localhost:3927/tableau-mcp
```

สำหรับรันเป็น service ถาวร:

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

### วาง TLS และ allow-list ไว้ข้างหน้า (ทางเลือก B และ C)

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

เมื่อตั้งค่านี้แล้ว URL ที่ผู้ใช้ตั้งค่าคือ `https://tableau-mcp.demo-company.local/tableau-mcp` และ `OAUTH_ISSUER` / `OAUTH_RESOURCE_URI` ใน `.env` ต้องตรงกับ `https://tableau-mcp.demo-company.local`

### จำกัดสิ่งที่ AI มองเห็น (ไม่บังคับแต่แนะนำ)

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

tool group ที่ใช้บ่อย: `datasource` (metadata + query), `workbook`, `view`, `pulse` (ควร exclude บน Server), `admin` รายการเต็มอยู่ใน `src/tools/web/toolName.ts` ของ repo

## 🤖 4.3 เชื่อม AI client แต่ละตัว

### Claude Desktop

1. **เปิดไฟล์ config** — Claude Desktop › *Settings › Developer › Edit Config* ตำแหน่งไฟล์: Windows `%APPDATA%\Claude\claude_desktop_config.json`, macOS `~/Library/Application Support/Claude/claude_desktop_config.json`
2. **เพิ่ม server (stdio)**

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

หรือชี้ Claude Desktop ไปยัง HTTP server ที่ใช้ร่วมกันผ่านตัวกลาง `mcp-remote` (จัดการหน้าต่างล็อกอิน OAuth ให้):

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

3. **ปิดแล้วเปิด Claude Desktop ใหม่ทั้งหมด** — (บน Windows ให้ Quit จาก tray) ไอคอน tools ใต้ช่องพิมพ์ควรแสดง `tableau-demo`
4. **ทดสอบ** — ด้วย *"List my Tableau data sources."*

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

จากนั้นใน session ของ Claude Code พิมพ์ `/mcp` เพื่อดูสถานะการเชื่อมต่อ และล็อกอินหากเปิด OAuth ไว้

### ChatGPT

ChatGPT รันบนคลาวด์ของ OpenAI จึงต้องใช้การติดตั้งแบบ HTTP ที่เข้าถึงได้ผ่าน HTTPS URL สาธารณะและเปิด OAuth (ทางเลือก B/C + reverse proxy หรือ tunnel สำหรับเดโม)

1. **เปิด developer mode** — *Settings › Connectors › Advanced › Developer mode* (ชื่อและตำแหน่งต่างกันตามแผน)
2. **สร้าง connector** — *Connectors › Create* ตั้งชื่อ `Tableau Demo`, MCP server URL `https://tableau-mcp.demo-company.local/tableau-mcp`, authentication *OAuth* ChatGPT จะค้นพบ authorization server ในตัวโดยอัตโนมัติ
3. **อนุญาตสิทธิ์** — ระบบจะพาไปหน้าล็อกอินของ Tableau Server แล้วกลับมา
4. **ใช้งาน** — ในแชทใหม่เปิด *Tools* › เปิด `Tableau Demo` แล้วถาม *"Which published data sources can I query?"*

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> หน้าจอ connector และแผนที่รองรับใน ChatGPT เปลี่ยนบ่อย ตรวจขั้นตอนปัจจุบันใน Help Center ของ OpenAI ก่อนเดโมให้ลูกค้า

### Gemini CLI

แก้ไข `~/.gemini/settings.json` (หรือ `.gemini/settings.json` ในโปรเจกต์):

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

สำหรับ server ที่ใช้ร่วมกันให้ใช้ `httpUrl` แทน:

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

เปิด `gemini` แล้วรัน `/mcp` เพื่อยืนยันว่าเชื่อมต่อแล้ว จากนั้นถามคำถาม

### Microsoft Copilot

**Copilot Studio (agent สำหรับ Teams / M365):** Copilot Studio เรียก MCP server ผ่าน Streamable HTTP จากคลาวด์ของ Microsoft จึงต้องใช้ HTTPS URL สาธารณะพร้อม OAuth

1. **เปิด agent ของคุณ** — › *Tools › Add a tool › Model Context Protocol*
2. **Server URL** — `https://tableau-mcp.demo-company.local/tableau-mcp`, authentication *OAuth 2.0* กรอก authorize / token endpoint ตามที่แสดงใน `https://tableau-mcp.demo-company.local/.well-known/oauth-authorization-server`
3. **เพิ่ม tool เข้า agent** — publish แล้วทดสอบใน test pane ด้วย *"Show me the list of Tableau workbooks."*

**GitHub Copilot ใน VS Code:** สร้าง `.vscode/mcp.json` ใน workspace:

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

เปิด Copilot Chat ในโหมด *Agent* จะเห็น tool ของ Tableau ในตัวเลือก tools

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> การรองรับ MCP ของ Copilot Studio และช่องกรอก authentication ยังเปลี่ยนแปลงอยู่ ตรวจ Microsoft Learn › Copilot Studio › "Add an MCP server" สำหรับขั้นตอนปัจจุบัน

## 🧪 4.4 ตรวจสอบการเชื่อมต่อ

### จากเครื่องที่รัน MCP

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

### จาก AI client

ถามตามลำดับ:

1. *"List my Tableau data sources."* → client ควรเรียก `list-datasources` และแสดงชื่อ
2. *"What fields are in the Sales data source?"* → `list-fields` (หรือ `get-datasource-metadata`)
3. *"What were total sales by region last year?"* → `query-datasource` ด้วย query แบบ aggregate เล็กๆ

ถ้าข้อ 1 ผ่าน แปลว่า authentication และเครือข่ายเรียบร้อย ถ้าข้อ 3 ล้มเหลวแต่ 1–2 ผ่าน เป็นปัญหาสิทธิ์ (API access) หรือชื่อฟิลด์

### ข้อผิดพลาดที่พบบ่อยและวิธีแก้

| อาการ | สาเหตุที่น่าจะเป็น | วิธีแก้ |
|---|---|---|
| `401 Unauthorized` ทุก tool | `SERVER`/`SITE_NAME` ผิด, PAT หมดอายุ, ใส่ชื่อผู้ใช้ใน `PAT_NAME`, Connected App ปิดอยู่ | รัน curl sign-in REST ซ้ำ; สร้าง PAT ใหม่; ตรวจสวิตช์ Connected App |
| `403 Forbidden` เฉพาะ `query-datasource` | ผู้ใช้ไม่มี "API access" / "Connect" บน data source นั้น | ให้สิทธิ์บน data source หรือ project |
| `Method not allowed` เมื่อเปิด URL ในเบราว์เซอร์ | ปกติ: GET ไม่ใช่ส่วนหนึ่งของ MCP | ใช้ curl ทดสอบ `initialize` |
| Client บอก "authorization required" แต่ไม่เปิดเบราว์เซอร์ | client ไม่รองรับ OAuth flow หรือ `OAUTH_ISSUER` ไม่ตรงกับ URL สาธารณะ | ใช้ `mcp-remote` กับ Claude Desktop; ปรับ `OAUTH_ISSUER`, `OAUTH_RESOURCE_URI` และ `server_name` ใน nginx ให้ตรงกัน |
| ล็อกอิน OAuth วนซ้ำ หรือ "redirect URI not allowed" | ยังไม่ตั้ง `tsm oauth.allowed_redirect_uri_hosts` หรือใส่ host ผิด | ตั้งเป็นชื่อเครื่อง MCP แล้ว apply pending changes |
| ผู้ใช้ต้องเชื่อมต่อใหม่ทุกครั้งที่ restart | refresh token เก็บในหน่วยความจำของโปรเซส MCP | ข้อจำกัดที่รู้อยู่แล้ว; เพิ่ม `OAUTH_ACCESS_TOKEN_TIMEOUT_MS`, หลีกเลี่ยง restart ที่ไม่จำเป็น |
| `self signed certificate` / TLS error | Tableau Server ใช้ CA ภายใน | export CA chain แล้วตั้ง `NODE_EXTRA_CA_CERTS=/path/ca.pem` ให้โปรเซส MCP (ใน Docker ให้ mount ไฟล์และตั้งตัวแปร) |
| รายการ tool ใน client ว่างเปล่า | server เริ่มด้วย `INCLUDE_TOOLS` ที่พิมพ์ผิด | ดู log ตอนเริ่ม; ชื่อ tool แยกตัวพิมพ์เล็กใหญ่ |
| โมเดลไม่เรียก tool เลย ตอบจากความจำ | client ไม่ได้อยู่ในโหมด agent/tools หรือโมเดลอ่อน | เปิด tools ให้แชท; ใช้โมเดลที่รองรับ tool |
| tool ของ Pulse ปรากฏและล้มเหลว | Pulse มีเฉพาะ Tableau Cloud | `EXCLUDE_TOOLS=pulse` |
| ตอบช้ามาก | data source ใหญ่มาก ทุก query ผ่าน VDS | จำกัดด้วย `INCLUDE_DATASOURCE_IDS`; ขอ aggregate ไม่ใช่ข้อมูลระดับแถว |

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ **[การติดตั้งและตั้งค่า](04-installation.md)**
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md)
8. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](08-faq-glossary.md)
9. 🔗 [เอกสารอ้างอิง](09-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: สิ่งที่ต้องเตรียม](03-prerequisites.md) · [ถัดไป: 5 use case ยอดนิยม ▶](05-use-cases.md) · [🇺🇸 English](../en/04-installation.md)

<sub>ส่วนที่ 4 จาก 9 · Created by The Narit Lab</sub>
