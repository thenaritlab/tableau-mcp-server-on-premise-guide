[🏠 Home](../../README.md) · [◀ Previous: Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md) · [Next: FAQ and glossary ▶](08-faq-glossary.md) · [🇹🇭 ภาษาไทย](../th/07-best-practices.md)

---

# 🛡️ Best practices, governance and security checklist

`Section 7 of 9`

> Tableau MCP inherits Tableau's governance model, but only if you configure it that way. This checklist is the one to walk through with a customer's security team before go-live.

## Deployment

- Start with **stdio + PAT on one laptop** for a demo, then move to a **dedicated VM with OAuth** for anything shared. Do not skip to "on the Tableau node" just because it is convenient.
- **Pin versions** of the npm package or container image. Upgrade on a schedule after reading the release notes: tool names and behaviour change between minor versions.
- Keep the MCP server **bound to localhost** and fronted by a reverse proxy with TLS and an IP allow-list.
- Run it as a **non-root service user** with a read-only file system except the log directory.
- Set `PRODUCT_TELEMETRY_ENABLED=false` if your policy forbids outbound product telemetry.

## Identity and access

- Prefer **OAuth** (2025.3+) so every tool call is attributed to a named user and RLS applies.
- If you must use a service identity (Direct Trust or PAT), give it the **lowest site role that works** and only the data sources it needs. Never a Server Administrator.
- Document which identity each MCP instance uses. Two instances, one for admins and one for analysts with different `INCLUDE_TOOLS`, is a clean pattern.
- Rotate PATs and Connected App secrets on the same schedule as other service credentials.

## Data governance

- **Certify** the published data sources you expose and add **field descriptions and aliases**; this is the "prompt" the model reads.
- Use `INCLUDE_TAGS=ai-ready` (or a project) so only reviewed content is visible to the AI.
- Apply **row-level security** in the data source, not in prompts. The model cannot be trusted to filter.
- Classify data. Anything the LLM vendor must not see should not be queryable through the MCP instance that uses that vendor.
- Keep **Pulse excluded** on Server; it is a Cloud feature and only produces errors.

## Prompting and model behaviour

- Give the model a system instruction that says: state the data source and filters; never invent numbers; prefer aggregates; ask when a field is ambiguous.
- Cap tool rounds per turn (8 is a good default) and set timeouts.
- Validate the first few answers against a dashboard; write down the fiscal calendar and any business definitions the model must use.

## Operations

- Enable `ENABLED_LOGGERS=fileLogger` and forward the logs. Correlate with the portal's `audit.jsonl` and Tableau Server's `http_requests` for a complete trail.
- Monitor: process up, `ping` succeeds, 401/403 rate, p95 tool latency, token spend per user.
- Know the **break-glass switch**: `BREAK_GLASS_DISABLE_GLOBALLY=true` keeps the service up but fails every tool call.
- Plan for the **refresh-token limitation**: a restart forces users to reconnect. Restart in maintenance windows.

## Security checklist

| # | Check | Done |
|---|---|---|
| 1 | MCP port not reachable from outside the reverse proxy | ☐ |
| 2 | TLS on the proxy; certificate from an internal or public CA | ☐ |
| 3 | OAuth enabled for any deployment used by more than one person | ☐ |
| 4 | `oauth.allowed_redirect_uri_hosts` set to the MCP host only | ☐ |
| 5 | RSA private key stored with 600 permissions or in a secrets manager | ☐ |
| 6 | Service identity has minimum site role and data source permissions | ☐ |
| 7 | `EXCLUDE_TOOLS=pulse` and write/admin tools excluded for analyst instances | ☐ |
| 8 | Tool scoping to certified projects, tags or data sources | ☐ |
| 9 | RLS validated by signing in as two users with different entitlements | ☐ |
| 10 | Server logging enabled and shipped; portal audit log retained per policy | ☐ |
| 11 | LLM vendor DPA reviewed; data classification documented | ☐ |
| 12 | Version pinned; upgrade and rollback procedure written | ☐ |
| 13 | Break-glass procedure tested | ☐ |
| 14 | Users trained to verify numbers against dashboards | ☐ |

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🛡️ **[Best practices, governance and security checklist](07-best-practices.md)**
8. ❓ [FAQ and glossary](08-faq-glossary.md)
9. 🔗 [References](09-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md) · [Next: FAQ and glossary ▶](08-faq-glossary.md) · [🇹🇭 ภาษาไทย](../th/07-best-practices.md)

<sub>Section 7 of 9 · Created by The Narit Lab</sub>
