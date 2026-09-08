[🏠 Home](../../README.md) · [◀ Previous: Architecture](02-architecture.md) · [Next: Installation and configuration ▶](04-installation.md) · [🇹🇭 ภาษาไทย](../th/03-prerequisites.md)

---

# ✅ Prerequisites

`Section 3 of 11`

> Check these before you install anything. Most failed first attempts come from an expired PAT, a missing API-access permission, or a client that cannot reach the server.

## 📋 Version matrix

| Component | Minimum | Recommended | Notes |
|---|---|---|---|
| Tableau Server | Any currently supported release | 2025.3 or newer | 2025.3+ is required for OAuth (per-user auth on HTTP). Tableau Agent for Server also arrived in 2025.3. |
| Tableau MCP | 1.x | 3.6.x (latest) | Pin the version in production (`@tableau/mcp-server@3.6.0`, image tag `3.6.0`). |
| Node.js | 18 (stdio via npx) | 22.7.5 or newer | Required by the HTTP/enterprise deployment. Not needed if you use Docker or the single-executable build. |
| Docker | 20+ | Latest stable | Optional. Image: `ghcr.io/tableau/tableau-mcp`. |
| REST API version | 3.x | Latest on your server | Tableau MCP negotiates this automatically. |

> [!IMPORTANT]
> **Verify with current docs**
>
> Node.js and Tableau MCP minimums move with each release. Check the `engines` field in the package and the enterprise deployment guide before you pin versions.

## 🪪 Licensing

- **Tableau Server licence.** Tableau MCP itself is open source (Apache 2.0) and free. Users who query through it consume a normal Tableau licence (Creator, Explorer or Viewer). A Viewer can read views; querying published data sources needs the data source permission "Connect".
- **Usage-based licensing (UBL).** Running a shared identity (PAT or fixed `JWT_SUB_CLAIM`) for many people is only appropriate when your contract covers usage-based licensing. Otherwise use OAuth so each person is a named user.
- **LLM cost.** Each AI vendor charges separately. Budget for tokens: a single "query the data source" turn can carry several thousand tokens of metadata.

## 🔢 Ports

| From | To | Port | Purpose |
|---|---|---|---|
| MCP host | Tableau Server gateway | 443 (or 80) | REST API, VDS |
| AI client (HTTP mode) | Reverse proxy | 443 | Streamable HTTP MCP |
| Reverse proxy | Tableau MCP | 3927 | Default listening port; keep bound to localhost |
| Tableau Server | MCP host | 443 | OAuth redirect back to the embedded authorization server |
| Portal (Section 6) | Tableau MCP | 3927 | Server-to-server, internal only |

## 🛠️ Tableau Server settings and permissions

1. **REST API enabled** — It is on by default. Confirm with `tsm configuration get -k api.server.enabled`. If your organisation disabled it, set it to `true` and apply pending changes.
2. **Personal Access Tokens allowed** — Site setting *Settings › General › Personal Access Tokens*. Server-wide: `tsm configuration get -k features.PersonalAccessTokensEnabled`.
3. **A dedicated Tableau user for the MCP server** — For PAT or Direct Trust testing create `svc-mcp-reader` (site role Explorer, or Viewer if it only needs views). Do not use a Server Administrator account.
4. **Data source permissions "View" and "Connect"** — on every published data source the AI should query (VizQL Data Service needs both). A missing "Connect" capability shows up as HTTP 403 in the MCP logs. Full detail in the Permissions chapter.
5. **Connected Apps (for Direct Trust or the portal)** — Site setting *Settings › Connected Apps*. You need to be a site administrator to create one.
6. **Metadata API (optional)** — Improves lineage and search tools. Enable with `tsm maintenance metadata-services enable`.
7. **OAuth redirect host (for OAuth mode)** — `tsm configuration set -k oauth.allowed_redirect_uri_hosts -v tableau-mcp.demo-company.local` then `tsm pending-changes apply`.

## 💻 Operating system for the MCP host

| Scenario | OS | Notes |
|---|---|---|
| Local stdio | Windows 10/11, macOS, Linux | Wherever your AI client runs. Node.js 18+ on PATH. |
| Shared HTTP | Linux (Rocky, Ubuntu, RHEL) | 1 vCPU / 1 GB RAM is enough for a team. Docker or Node 22 + systemd. |
| On the Tableau node | Same OS as Tableau Server | Only if you cannot get a separate VM. Watch resource contention. |

## 🤖 AI clients

| Client | Where it runs | Transport that works | Needs |
|---|---|---|---|
| Claude Desktop | Your machine | stdio (or HTTP via `mcp-remote`) | Free or paid plan with MCP enabled |
| Claude Code | Your machine / server | stdio or HTTP | Claude Code CLI |
| ChatGPT | OpenAI cloud | HTTP over public HTTPS with OAuth | Plan with custom connectors / Developer mode |
| Gemini CLI | Your machine | stdio or HTTP | Gemini CLI + Google account |
| Microsoft Copilot Studio | Microsoft cloud | HTTP over public HTTPS | Copilot Studio licence |
| VS Code (Copilot / Claude), Cursor | Your machine | stdio or HTTP | Editor with MCP support |

> [!IMPORTANT]
> **Verify with current docs**
>
> Which ChatGPT and Copilot plans allow custom MCP connectors changes often. Check the vendor's current documentation before promising it to a customer.

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ **[Prerequisites](03-prerequisites.md)**
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🔐 [Permissions, roles and licences](07-permissions-security.md)
8. 📈 [Enterprise proposal: a BI + AI chat platform on Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [Best practices, governance and security checklist](09-best-practices.md)
10. ❓ [FAQ and glossary](10-faq-glossary.md)
11. 🔗 [References](11-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Architecture](02-architecture.md) · [Next: Installation and configuration ▶](04-installation.md) · [🇹🇭 ภาษาไทย](../th/03-prerequisites.md)

<sub>Section 3 of 11 · Created by The Narit Lab</sub>
