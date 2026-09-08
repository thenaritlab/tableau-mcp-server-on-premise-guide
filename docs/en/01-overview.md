[🏠 Home](../../README.md) · [Next: Architecture ▶](02-architecture.md) · [🇹🇭 ภาษาไทย](../th/01-overview.md)

---

# 📖 Overview

`Section 1 of 9`

> Tableau MCP lets an AI assistant such as Claude, ChatGPT, Gemini or Microsoft Copilot read your Tableau Server content and query your published data sources through a governed, permission-aware interface. This guide takes you from a first local test to a hardened, multi-user deployment and a custom web front end.

## What is Tableau MCP?

The Model Context Protocol (MCP) is an open standard that lets an AI application ("MCP host" or "client") call **tools** exposed by an external program ("MCP server"). Tableau MCP is Tableau's official MCP server. It is a small Node.js application that:

- exposes a set of tools such as *list data sources*, *get field metadata*, *query a data source*, *search content*, *get view image*, *list workbooks*, *trigger an extract refresh* and admin-insight tools;
- translates each tool call into calls to the Tableau Server **REST API** and **VizQL Data Service (VDS)**;
- signs in to Tableau Server with a credential you control: a Personal Access Token (PAT), a Connected App (Direct Trust JWT), or, on Tableau Server 2025.3 and later, OAuth so each user acts as themselves.

The AI model never talks to your database. It only sees what Tableau lets the signed-in user see, filtered by project permissions, data source permissions and row-level security.

## Why pair it with Tableau Server on-premise?

| Reason | What it means for you |
|---|---|
| Data stays behind your firewall | The MCP server runs on your network. Only the *results* of a governed query travel to the model, and you decide which model. |
| Reuse the semantic layer you already built | Published data sources with calculated fields, aliases and RLS become the "vocabulary" the AI queries. No second copy of business logic. |
| Governance travels with the request | With OAuth, every tool call runs as the actual user, so Tableau permissions and row-level security apply automatically. |
| Any MCP-capable client | Claude Desktop, Claude Code, ChatGPT, Gemini CLI, Copilot Studio, VS Code, Cursor and custom apps all use the same server. |
| A path to embedded conversational analytics | Once the server works, the same connection powers a custom web portal with a chat box (Section 6). |

## Who this guide is for

- **Tableau Server administrators** who need to deploy and secure the MCP server.
- **Solution consultants and BI developers** who will build use cases, prompts and demos on top of it.
- **Developers** who want to put a custom web UI in front of Tableau Server with an AI chat box.

You should already know Tableau Server basics (sites, projects, published data sources, permissions). No prior MCP or LLM-integration experience is assumed.

## How the guide is organised

1. **Architecture** shows the moving parts and the three authentication options.
2. **Prerequisites** lists versions, ports and permissions.
3. **Installation and configuration** walks through Tableau Server preparation, running Tableau MCP, connecting each AI client, and troubleshooting.
4. **Top 5 use cases** go from "find my content" to multi-step agentic analysis.
5. **Web UI wrapper** builds a Node.js + Express + React portal with an AI chat box.
6. **Best practices, FAQ and references** close the loop.

> [!IMPORTANT]
> **Verify with current docs**
>
> Tableau MCP ships new versions frequently and Tableau Server releases add capabilities every quarter. Anything in this guide marked with this purple box may have changed. This guide was written against Tableau MCP **3.6.x** and Tableau Server **2025.3+** (September 2026).

> [!NOTE]
> **Placeholders used throughout**
>
> `demo-server.local` is your Tableau Server, `DemoSite` is the site content URL, `<YOUR_PAT_VALUE>` and similar angle-bracket values must be replaced with your own. "Demo Company" is a fictional organisation.

---

<details>
<summary>📚 Contents</summary>

1. 📖 **[Overview](01-overview.md)**
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🛡️ [Best practices, governance and security checklist](07-best-practices.md)
8. ❓ [FAQ and glossary](08-faq-glossary.md)
9. 🔗 [References](09-references.md)

</details>

[🏠 Home](../../README.md) · [Next: Architecture ▶](02-architecture.md) · [🇹🇭 ภาษาไทย](../th/01-overview.md)

<sub>Section 1 of 9 · Created by The Narit Lab</sub>
