[🏠 Home](../../README.md) · [◀ Previous: Installation and configuration](04-installation.md) · [Next: Advanced: build a custom Web UI wrapper ▶](06-web-ui-wrapper.md) · [🇹🇭 ภาษาไทย](../th/05-use-cases.md)

---

# 💡 Top 5 use cases

`Section 5 of 9`

> Each use case builds on the previous one. Run them in order on a test site: by the fifth you will have a repeatable demo script and a clear picture of what the model can and cannot do with your data.

All examples assume a published data source called **Sales** in a project called **Demo Company** with fields such as `Order Date`, `Region`, `Category`, `Sales`, `Profit`, `Quantity`.

## 1. Find and understand content — 🟢 Basic

**Business goal.** Cut the time analysts spend hunting for the right workbook or data source.
**Who uses it.** Everyone, especially new joiners.
**Tools involved.** `search-content`, `list-workbooks`, `list-datasources`, `list-fields`.

### Sample prompts

- "Which workbooks mention *inventory*?"
- "Show me the data sources in the Demo Company project and who owns them."
- "Explain the fields in the Sales data source in plain language."

### Walkthrough

1. Ask *"What data sources do I have access to?"* The model calls `list-datasources`.
2. Ask *"Describe the Sales data source."* The model calls `list-fields` and summarises dimensions, measures and any calculated fields.
3. Ask *"Which workbooks use it?"* If the Metadata API is enabled the model can follow lineage.

**Expected output.** A short list with names, projects, owners and last-updated dates, plus a plain-language data dictionary.

**Pitfalls.** Field descriptions are only as good as what authors typed into Tableau: add descriptions and aliases to your published data sources or the AI will guess. Content search is scoped by permissions, so a "missing" workbook usually means the user cannot see it.

## 2. Ask a question of a data source — 🟢 Basic

**Business goal.** Answer "what was X by Y" questions without opening a dashboard.
**Who uses it.** Managers, sales, operations.
**Tools involved.** `query-datasource` (VizQL Data Service).

### Sample prompts

- "Total sales and profit by region for 2025."
- "Top 10 products by quantity sold in the West region last quarter."
- "Monthly sales trend for the Furniture category, 2024 vs 2025."

### Walkthrough

1. The model reads field metadata (from use case 1) and builds a VDS query: fields, aggregations, filters.
2. It calls `query-datasource` and receives a small table.
3. It formats a table and one or two observations.

**Expected output.** A table of a few rows with the numbers, and the model stating which data source and filters it used.

**Pitfalls.** Always ask for aggregates. "Give me all orders" will try to pull row-level data and either time out or exhaust context. Date filters are the most common error: check that the model used the right fiscal calendar. Numbers should be spot-checked against a dashboard the first few times.

> [!TIP]
> **Set expectations in a system prompt**
>
> In your custom portal (Section 6) tell the model to always state the data source and filters. In Claude Desktop, use a project instruction. This makes every answer auditable.

## 3. Executive summary of a dashboard — 🔵 Intermediate

**Business goal.** Turn a weekly dashboard into a written brief for leadership.
**Who uses it.** Analysts who prepare management updates.
**Tools involved.** `get-view-data`, `get-view-image`, `query-datasource`.

### Sample prompts

- "Summarise the *Sales Overview* dashboard as five bullet points for the CEO."
- "Compare this month with last month and highlight anything that moved more than 10 percent."
- "Write the summary in Thai and English."

### Walkthrough

1. Ask the model to fetch the view's data (`get-view-data`) rather than only the image: the image helps it describe layout, the data gives it real numbers.
2. Ask for the comparison. The model may issue a follow-up `query-datasource` to get the prior period.
3. Ask for the output format you need (bullets, email, slide notes).

**Expected output.** A short narrative with the actual figures, direction of change and a "what to watch" line.

**Pitfalls.** `get-view-data` returns the underlying summary data of the sheet; on dense dashboards pick a specific sheet. Images are useful for layout questions but cost many tokens. Do not let the model invent causes: ask it to separate "what changed" from "possible reasons".

## 4. Admin insights and housekeeping — 🔵 Intermediate

**Business goal.** Keep the server clean and licences well used without writing SQL against the repository.
**Who uses it.** Tableau Server administrators.
**Tools involved.** admin tool group (`get-stale-content-report`, `list-extract-refresh-tasks`, user and permission listing), `list-workbooks`.

### Sample prompts

- "Which workbooks have not been viewed in 180 days? Group by project and owner."
- "List extract refresh tasks that failed this week and their data sources."
- "Draft an email to each owner of stale content asking them to archive or confirm."

### Walkthrough

1. Run the stale content report through the AI; ask for a table grouped by owner.
2. Ask for failed refresh tasks and correlate with the same owners.
3. Ask the model to draft the outreach message. You send it: keep humans on the send button.

**Expected output.** Two tables and draft emails you can paste.

**Pitfalls.** Admin tools need a site or server administrator identity: with OAuth that means the signed-in admin; with Direct Trust set `JWT_SUB_CLAIM` to an admin only in a locked-down deployment. Consider `INCLUDE_TOOLS` to give admins the admin group and everyone else the `datasource` group by running two MCP instances on different ports.

## 5. Multi-step agentic analysis with lineage — 🟣 Advanced

**Business goal.** Investigate a business question end to end: find the right source, query it several ways, check where the numbers come from, and produce a recommendation.
**Who uses it.** Senior analysts, consultants building a proof of concept.
**Tools involved.** All of the above, plus lineage/metadata tools, run inside Claude Code, Gemini CLI or the custom portal where the model can take several tool steps per turn.

### Sample prompt

> "Profit margin in the Central region dropped last quarter. Using the Sales data source, find which categories and sub-categories drove the drop, check whether discounts increased, confirm which database tables the Sales source is built on, and give me a one-page finding with a recommendation."

### Walkthrough

1. **Discovery.** The model lists fields and lineage (`get-datasource-metadata`, lineage tools) and reports the upstream tables.
2. **Decomposition.** It queries margin by category, then sub-category, then discount rate, each as a separate `query-datasource` call.
3. **Validation.** It cross-checks totals against the dashboard sheet via `get-view-data`.
4. **Synthesis.** It writes the finding with numbers, method and caveats.

**Expected output.** A structured finding: headline, evidence table, method (which queries), caveats, recommendation.

**Pitfalls.** Cap the number of tool rounds (the portal in Section 6 uses 8) or a confused model can loop. Provide a clear definition of "margin" if the data source does not have a calculated field for it. Keep humans reviewing: the model is good at arithmetic on returned data and bad at knowing your business exceptions.

> [!TIP]
> **Turn this into a repeatable demo**
>
> Save the five prompts as a Claude project instruction or a Gemini `GEMINI.md`, with the Demo Company field names. A 15-minute customer demo then runs the same path every time.

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 **[Top 5 use cases](05-use-cases.md)**
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🛡️ [Best practices, governance and security checklist](07-best-practices.md)
8. ❓ [FAQ and glossary](08-faq-glossary.md)
9. 🔗 [References](09-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Installation and configuration](04-installation.md) · [Next: Advanced: build a custom Web UI wrapper ▶](06-web-ui-wrapper.md) · [🇹🇭 ภาษาไทย](../th/05-use-cases.md)

<sub>Section 5 of 9 · Created by The Narit Lab</sub>
