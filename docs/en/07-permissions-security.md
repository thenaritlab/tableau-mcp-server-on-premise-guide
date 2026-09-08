[🏠 Home](../../README.md) · [◀ Previous: Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md) · [Next: Enterprise proposal: a BI + AI chat platform on Tableau MCP ▶](08-enterprise-proposal.md) · [🇹🇭 ภาษาไทย](../th/07-permissions-security.md)

---

# 🔐 Permissions, roles and licences

`Section 7 of 11`

> Tableau MCP does not add a security model of its own: it inherits Tableau's. That is its biggest strength, but only if you understand how licences, site roles, project permissions, content capabilities and row-level security stack up — and which capability each MCP tool actually needs.

## 🧱 The five layers

![fig-permission-stack](../assets/diagrams/fig-permission-stack.svg)

*Figure 1. Five layers between an AI question and a row of data. Tableau enforces 1–4; Tableau MCP adds 5 as an extra fence.*

## 🪪 Layer 1 – Licences and site roles

A licence type is what you buy; a **site role** is what an administrator assigns to a user on a site, bounded by the licence. The site role is the *ceiling*: permissions can never grant more than the role allows.

| Site role | Licence | Can view content | Can query a published data source via AI (View + Connect + API Access) | Can download full data | Can publish / web edit | Typical AI persona |
|---|---|---|---|---|---|---|
| Viewer | Viewer | ✅ | ✅ if granted | ❌ (summary only) | ❌ | Manager asking questions through the portal |
| Explorer | Explorer | ✅ | ✅ | ✅ if granted | Web edit, no publish | Analyst using Claude / Gemini for exploration |
| Explorer (can publish) | Explorer | ✅ | ✅ | ✅ | ✅ | Power user building certified sources |
| Creator | Creator | ✅ | ✅ | ✅ | ✅ + Desktop / Prep | Data team, MCP service identity for admin tasks |
| Site Administrator Explorer / Creator | Explorer / Creator | ✅ all | ✅ | ✅ | ✅ | Runs admin tool group (stale content, refresh tasks) |
| Server Administrator | Creator | ✅ everything, all sites | ✅ | ✅ | ✅ | **Never** use as an MCP identity |
| Unlicensed | — | ❌ | ❌ | ❌ | ❌ | AI gets nothing; sign-in fails |

> [!NOTE]
> **Viewer is the minimum role — API Access is the usual blocker**
>
> A Viewer can hold *View*, *Connect* and *API Access* on a published data source, which is everything `query-datasource` needs. *API Access* is a separate capability that is **off by default**; the owner or project leader must allow it. What Viewers cannot do is download full data, web edit, or connect from Tableau Desktop. Check your licence agreement before relying on Viewers for heavy ad-hoc AI querying.
>
> Source: Tableau Help › VizQL Data Service › Configuration ("To query a data source with VDS, you must first assign the API Access capability"); Permission Capabilities and Templates.

> [!IMPORTANT]
> **Verify with current docs**
>
> Site-role names and what they allow are stable but not frozen: Tableau has adjusted Viewer capabilities in the past. Confirm against the "Site roles and permissions" page for your server version.

## 📁 Layer 2 – Projects

Projects are the folders content lives in. Two settings matter most for AI access:

- **View project** – if the user cannot see the project, the AI cannot list or query anything inside it. `search-content` and `list-datasources` silently omit it.
- **Locked permissions (Content Permissions › Locked)** – every item inherits the project's permission rules and owners cannot override them. This is the setting that makes an "AI-ready" project trustworthy: whatever the data team certifies stays locked down the way they set it.

Recommended structure:

```text
📁 Certified (locked)            ← published data sources for AI + dashboards; only data team publishes
   📁 Sales
   📁 Finance                    ← finance group only
   📁 HR (restricted)            ← HR group only, RLS mandatory
📁 Departmental (locked)         ← team workbooks on certified sources
📁 Sandbox (customizable)        ← personal exploration; excluded from MCP scope
📁 Admin                         ← admin reports, server admins only
```

## 🔑 Layer 3 – Content capabilities

Permissions are granted to **groups** (preferably) or users as *Allowed / Denied / Unspecified* per capability. Denied always wins over Allowed; Unspecified falls back to the next rule and finally to "no".

### Workbook capabilities

| Capability | What it allows | MCP tools that need it |
|---|---|---|
| View | See the workbook and its views | `list-workbooks`, `list-views`, `get-workbook` |
| Filter | Change filters and parameters | `get-view-data` with filters, `get-view-image` with filters |
| Download Image/PDF | Export view image | `get-view-image` |
| Download Summary Data | Aggregated data behind a view | `get-view-data` (summary) |
| Download Full Data | Row-level data behind a view | `get-view-data` when the model asks for underlying rows |
| API Access + Full Data Query (FDQ) | Let an API or agent query the workbook's data on the user's behalf; FDQ enforces user filters only when they are data-source filters | Querying a *workbook* data source via VDS; Tableau Agent in dashboards |
| Web Edit, Download Workbook, Overwrite, Move, Delete, Set Permissions | Editing and administration | Not used by read-only AI instances — deny for AI groups |

### Data source capabilities

| Capability | What it allows | MCP tools that need it |
|---|---|---|
| View | See the data source in lists | `list-datasources`, `search-content` |
| Connect | Connect to it (Desktop, web authoring, and as the upstream source of a workbook queried by VDS) | `list-fields`, `get-datasource-metadata`, `query-datasource` |
| **API Access** | Query it programmatically with **VizQL Data Service** — off by default | `query-datasource` (required), `get-datasource-metadata` via VDS |
| Create Metric Definitions | Build Tableau Pulse metrics on it (Cloud) | Pulse tools (Cloud only) |
| Download Data Source / Save a Copy | Get the .tdsx | Not needed — deny for AI groups |
| Overwrite, Delete, Set Permissions | Administration | Deny for AI groups |
| (Extract refresh: owner or project leader) | Trigger / schedule refresh | `list-extract-refresh-tasks`, refresh tools — admin instance only |

### Permission templates for AI groups

| Group | Purpose | Workbook | Data source | Site role |
|---|---|---|---|---|
| `ai-viewers` | Ask questions through the portal | View, Filter, Download Summary Data | View, Connect, API Access | Viewer |
| `ai-analysts` | Explore with Claude / Gemini / VS Code | + Download Full Data, Download Image | View, Connect, API Access | Explorer |
| `ai-admins` | Housekeeping with the admin tool group | All | All | Site Administrator Explorer |
| `svc-mcp-portal` (service) | Portal's Direct Trust identity | View, Filter, Download Summary Data | View, Connect, API Access | Viewer or Explorer |

Set these on the *Certified* project with permissions locked, and the whole tree follows.

## 🔒 Layer 4 – Row-level security

Capabilities decide *whether* a user can query a data source; RLS decides *which rows* they get. Tableau applies RLS by the identity the MCP server signs in as, so the auth mode from the Architecture chapter matters:

| MCP auth | Identity Tableau sees | RLS result |
|---|---|---|
| OAuth | The real user | ✅ Correct per user |
| Direct Trust with `JWT_SUB_CLAIM={OAUTH_USERNAME}` (portal pattern) | The real user | ✅ Correct per user |
| Direct Trust with a fixed `JWT_SUB_CLAIM` | One service user | ⚠️ Everyone gets the service user's rows |
| PAT | PAT owner | ⚠️ Everyone gets the owner's rows |

Four ways to implement RLS on Tableau Server, from simplest to most scalable:

1. **User filter in the workbook** – `USERNAME()` or `ISMEMBEROF('group')` in a calculated filter. Quick, but lives in each workbook; the AI querying the *data source* directly bypasses it. Use only for view-based use cases.
2. **Calculated filter in the published data source** – same functions, applied to the data source so every workbook *and* every `query-datasource` call inherits it. Minimum for AI.
3. **Entitlement table join** – a security table (`user`, `region`, `cost_center`) joined into the data source with a filter `USERNAME() = [user]`. Scales to thousands of users; managed by data, not by editing calculations.
4. **Virtual Connection with a data policy** – RLS defined once at the connection level, enforced for every data source built on it. Requires Data Management. The cleanest answer for enterprise AI access.

> [!WARNING]
> **Test RLS with two users before go-live**
>
> Sign in to the MCP server as two people with different entitlements and ask the same question. If both get the same numbers, RLS is not reaching the AI path. Check the auth mode first, then whether the filter is on the data source rather than the workbook.

## 🧭 Layer 5 – Tableau MCP scoping

Tableau MCP's `INCLUDE_*` / `EXCLUDE_*` variables (Installation § 4.2) are a fence *around* Tableau permissions. They stop the AI from seeing content it technically could — useful for keeping Sandbox out of scope or exposing only `datasource` tools — but they are not a substitute for permissions: a user could still reach the content through the Tableau UI.

Typical mapping:

| MCP instance | `INCLUDE_TOOLS` | `INCLUDE_PROJECT_IDS` / `INCLUDE_TAGS` | Who connects |
|---|---|---|---|
| `mcp-analysts` (port 3927) | `datasource,workbook,view` | Certified project · tag `ai-ready` | ai-analysts, ai-viewers via OAuth |
| `mcp-portal` (port 3928, localhost only) | `datasource` | Certified project | Portal service identity |
| `mcp-admin` (port 3929) | `admin,workbook,datasource` | (all) | ai-admins via OAuth |

## 🧩 Tableau APIs behind Tableau MCP (developer reference)

Tableau MCP is a thin layer over Tableau's public APIs. Knowing which API each tool calls tells you which permission applies, which logs to read, and what you could call directly from your own code.

| API | What it does | Auth | Used by these MCP tools | Notes |
|---|---|---|---|---|
| **REST API** | Sign-in, list / search / manage sites, projects, users, groups, workbooks, data sources, views, permissions, extract refresh tasks, view images and view data | PAT, JWT (Connected App), username/password | `list-datasources`, `list-workbooks`, `list-views`, `get-view-image`, `get-view-data`, `search-content`, `list-extract-refresh-tasks`, `start-extract-refresh`, admin tools | Versioned (3.x); Tableau MCP negotiates the version. Every call is logged in `http_requests`. |
| **VizQL Data Service (VDS)** | Programmatic query of a published data source or a workbook's data source: read metadata (fields, types, default aggregation) and run aggregated queries with filters, sorts, TOP N | Session from REST sign-in (PAT / JWT) | `get-datasource-metadata`, `list-fields`, `query-datasource`, admin-insight queries | Requires **API Access** on the data source; on Cloud since 2024.3, on Server 2025.1+. 30 s timeout on interactive workbook sources. |
| **Metadata API (GraphQL)** | Lineage and catalog: which tables feed which data sources, which workbooks use them, field lineage, certifications, data quality warnings | Same REST session | Lineage / search tools when enabled | Must be enabled on Server (`tsm maintenance metadata-services enable`). Richer with Data Management. |
| **Tableau Pulse API** | Metric definitions, metrics, insights, digests | REST session | `pulse` tool group | Tableau Cloud only — exclude on Server. |
| **Connected Apps (JWT)** | Trust framework: Direct Trust (shared secret) or OAuth 2.0 Trust (external IdP) lets an app mint a JWT that signs in as any user without a password | JWT with `sub`, `aud`, `jti`, scopes | MCP `AUTH=direct-trust`; the portal's embed token | Scopes such as `tableau:views:embed`, `tableau:content:read`. |
| **Embedding API v3** | Embed views and dashboards in a web page (`<tableau-viz>`), pass filters and parameters, listen to events, get the VDS session for the embedded viz | Connected App JWT or SSO | Not used by MCP; used by the portal in Section 6 | `getVizQLDataServiceSessionInfo()` links an embedded viz to VDS queries. |
| **Extensions API** | Dashboard / viz extensions running inside Tableau, can read worksheet data and react to selections | Runs inside the user's session | Not used by MCP | Alternative to an external portal when the chat should live *inside* a dashboard. |
| **Hyper API** | Create and update `.hyper` extract files programmatically | Local library | Not used by MCP | Data preparation pipelines feeding published sources. |
| **Tableau Server Client (TSC)** | Python library wrapping the REST API | PAT / JWT | Not used by MCP | Handy for scripting the permission templates in this chapter. |
| **Webhooks** | Server pushes events (workbook published, refresh failed) to your endpoint | Configured via REST | Not used by MCP | Trigger an agentic check (use case 5) when a refresh completes. |

> [!IMPORTANT]
> **Verify with current docs**
>
> API availability differs between Tableau Cloud and Tableau Server versions (VDS, Pulse, Tableau Agent). Check the "What's new" page of each API for your release. Tool names in Tableau MCP change between minor versions — confirm against `src/tools/web/toolName.ts`.

Sources: Tableau REST API reference; VizQL Data Service docs (Setup, Configuration, What's new); Metadata API docs; Connected Apps (Direct Trust) docs; Embedding API v3 docs; Tableau MCP tool docs. Links in the References chapter.

## 📊 Site role capability matrix for developers

Use this to pick the lowest role that satisfies a use case. ✅ = allowed by the role (if content permission is also granted) · ⚙️ = only if the capability is granted · ❌ = the role can never do it.

| Action | Viewer | Explorer | Explorer (can publish) | Creator | Site Admin Explorer | Site Admin Creator |
|---|---|---|---|---|---|---|
| Create a Personal Access Token | ✅ * | ✅ * | ✅ * | ✅ * | ✅ | ✅ |
| View workbooks / views, filter, comment, subscribe | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download image / PDF, summary data | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| Download **full** data from a view | ❌ | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| Connect to a published data source (web authoring / VDS upstream) | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| **Query a published data source with VDS / `query-datasource`** (needs API Access) | ⚙️ | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| Query a workbook's data source with VDS (API Access + Full Data Query) | ❌ ** | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| Web edit an existing workbook | ❌ | ⚙️ | ⚙️ | ⚙️ | ✅ | ✅ |
| Save / publish workbooks (Overwrite, Save a Copy) | ❌ | ❌ | ⚙️ | ⚙️ | ✅ | ✅ |
| Publish or download data sources | ❌ | ❌ | ⚙️ | ⚙️ | ✅ | ✅ |
| Connect to external data / create new data sources, use Desktop and Prep | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Trigger extract refresh (`start-extract-refresh`) | ❌ | ⚙️ owner / project leader | ⚙️ | ⚙️ | ✅ | ✅ |
| Set permissions, project leader duties | ❌ | ⚙️ if project leader | ⚙️ | ⚙️ | ✅ | ✅ |
| Manage users and groups on the site | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Run Tableau MCP **admin** tools (stale content, admin insights) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Tableau Pulse: view metrics / digests (Cloud) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tableau Pulse: create metric definitions (Cloud) | ❌ | ❌ | ⚙️ | ⚙️ | ⚙️ | ✅ |
| Server Administrator tasks (TSM, all sites) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (Server Admin only) |

\* unless the site administrator has disabled PATs for the site or the user. &nbsp; \*\* Full Data Query is a full-data capability, which Viewers cannot hold.

**Recommended minimum role per AI scenario**

| Scenario | Minimum role | Content capabilities to grant |
|---|---|---|
| Ask questions of certified data sources through Claude Desktop / portal | **Viewer** | Data source: View, Connect, API Access |
| Also summarise dashboards (`get-view-data`, `get-view-image`) | Viewer | + Workbook: View, Filter, Download Image, Download Summary Data |
| Row-level exploration, export underlying rows | Explorer | + Download Full Data (workbook) |
| Build and certify the `ai-ready` data sources the AI uses | Explorer (can publish) or Creator | Publish on the Certified project |
| Housekeeping with admin tools, admin insights | Site Administrator Explorer | (site role is sufficient) |
| MCP service identity for the portal (Direct Trust) | Viewer or Explorer, never admin | Same as scenario 1–2 |

Sources: Tableau Help › Permissions ("Explorer or Viewer site roles can't publish, overwrite, or save a copy"); Permission Capabilities and Templates; Tableau pricing page (Viewer: download summary data; Explorer: download full data); VizQL Data Service Configuration; Tableau MCP admin-insight tool docs (admin gate rejects roles below Site Administrator). Links in the References chapter.

## 🛡️ Security design best practices

### Identity

- One identity per human (OAuth) for anything interactive; one dedicated service identity per system (portal, scheduled agent) with its own Connected App.
- Groups synced from Active Directory / SAML; never assign permissions to individual users.
- Site Administrator only for the admin MCP instance; Server Administrator never.

### Data

- Certify the published data sources the AI may use; add field descriptions — the description *is* the AI's prompt.
- RLS in the data source or virtual connection, not in workbooks or system prompts.
- Classify data: **Public / Internal / Confidential / Restricted**. Only Public and Internal go through a cloud LLM; Confidential requires a self-hosted or in-region model; Restricted (PII, salary, medical) stays out of MCP scope entirely.
- Mask or aggregate sensitive columns in the certified source (e.g. salary bands instead of salary).

### Network and platform

- MCP bound to localhost, behind TLS reverse proxy with IP allow-list; separate instances for analysts, portal and admins.
- Secrets in a vault; RSA key for OAuth with 600 permissions; rotate Connected App secrets quarterly.
- Pin versions; patch on a schedule; test upgrades on the pilot site first.

### AI-specific controls

- Read-only instances for everyone except admins: no refresh, no overwrite, no permission tools.
- Cap tool rounds and result sizes; reject queries that return more than N rows unaggregated.
- System prompt forbids revealing URLs, LUIDs and tokens; strip them from tool results in the portal.
- Prompt-injection awareness: field descriptions and workbook names are *inputs to the model* — only certified authors may edit them.

### Audit and monitoring

- Tableau Server `http_requests` + MCP file logger + portal audit log, joined by user and timestamp.
- Weekly review: top users, top data sources, 403 spikes (permission gaps or probing), unusual row counts.
- Retention per policy; alert on Restricted-tagged content appearing in any MCP log.

### Go-live checklist (security team)

| # | Check | ✓ |
|---|---|---|
| 1 | Certified project locked; only data team can publish | ☐ |
| 2 | `ai-*` groups exist, synced from directory, permission templates applied | ☐ |
| 3 | Every AI-exposed data source has View + Connect + API Access for the right group and nothing more | ☐ |
| 4 | RLS implemented in data source or virtual connection; two-user test passed | ☐ |
| 5 | Auth mode gives Tableau the real user (OAuth or `{OAUTH_USERNAME}`) | ☐ |
| 6 | Restricted data not in any `INCLUDE_*` scope; verified by listing data sources through the AI | ☐ |
| 7 | Data classification decides which LLM endpoint each instance uses | ☐ |
| 8 | Admin tools only on the admin instance; analysts' instance has `EXCLUDE_TOOLS=pulse,admin` | ☐ |
| 9 | Logs flowing to SIEM with user attribution | ☐ |
| 10 | Owner named for quarterly permission and secret review | ☐ |

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🔐 **[Permissions, roles and licences](07-permissions-security.md)**
8. 📈 [Enterprise proposal: a BI + AI chat platform on Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [Best practices, governance and security checklist](09-best-practices.md)
10. ❓ [FAQ and glossary](10-faq-glossary.md)
11. 🔗 [References](11-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md) · [Next: Enterprise proposal: a BI + AI chat platform on Tableau MCP ▶](08-enterprise-proposal.md) · [🇹🇭 ภาษาไทย](../th/07-permissions-security.md)

<sub>Section 7 of 11 · Created by The Narit Lab</sub>
