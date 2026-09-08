[🏠 Home](../../README.md) · [◀ Previous: Permissions, roles and licences](07-permissions-security.md) · [Next: Best practices, governance and security checklist ▶](09-best-practices.md) · [🇹🇭 ภาษาไทย](../th/08-enterprise-proposal.md)

---

# 📈 Enterprise proposal: a BI + AI chat platform on Tableau MCP

`Section 8 of 11`

> A ready-to-adapt proposal for IT and development teams. Replace "Demo Company" with your organisation, adjust the numbers, and take it to the steering committee. Everything technical it promises is covered in the earlier chapters.

> [!TIP]
> **How to use this chapter**
>
> Sections 1–4 are for executives (problem, vision, value). Sections 5–9 are for IT (architecture, roadmap, team, cost, risk). Section 10 is the decision you are asking for. Keep it to eight pages when you present it.

## 🎯 1. Executive summary

Demo Company already runs Tableau Server on-premise with certified data sources and dashboards. Today, getting an answer that is not on a dashboard means a ticket to the BI team and a wait of days. This proposal adds a governed **AI chat layer** on top of the existing Tableau investment using Tableau MCP, so employees can ask business questions in plain language — in Claude, Microsoft Copilot, LINE, Teams or a company portal — and receive answers computed from the same certified data, under the same permissions.

- **No new data platform.** Reuses published data sources, permissions and row-level security already in Tableau.
- **Data stays on-premise.** Only governed query results reach the AI model, and the model endpoint is chosen per data classification.
- **Three phases over six months**, starting with a four-week pilot on two data sources.
- **Target outcome:** cut ad-hoc report requests by 30 %, reduce time-to-answer from days to minutes, and free roughly one analyst FTE per department for higher-value work.

## 🩺 2. The problem today

| Symptom | Evidence to collect | Cost |
|---|---|---|
| Ad-hoc report backlog | BI ticket queue, average lead time | Analyst hours, delayed decisions |
| Dashboards answer yesterday's questions | Number of "can you add a filter for…" requests | Every variant becomes a new dashboard |
| Excel exports and shadow BI | Count of "Download Full Data" events per month | Uncontrolled copies of sensitive data |
| Executives depend on a few people | Who gets called on Sunday night? | Key-person risk |
| Generic AI tools used without data | Staff pasting exports into public chatbots | Data-leak risk, unverifiable numbers |

## 🔭 3. Vision and guiding principles

> Any employee can ask a business question and get a trustworthy, permission-aware answer from certified company data in under a minute — from the tool they already use.

1. **One semantic layer.** Certified Tableau data sources are the single vocabulary for humans, dashboards and AI.
2. **Governance travels with the question.** The AI never sees more than the user could see in Tableau.
3. **Meet people where they work.** Copilot for the Microsoft crowd, LINE or Teams for field staff, a portal for everyone else.
4. **Humans decide.** The AI explains, cites the data source and filters, and never triggers a business action on its own.
5. **Start small, prove value, then scale.** Every phase has a measurable gate.

## 💼 4. Use cases and business impact

| Department | Question people actually ask | Today | With BI + AI chat | Impact metric |
|---|---|---|---|---|
| Sales | "Which accounts in the East slipped more than 15 % this quarter and who owns them?" | Wait for weekly report | Answer in chat, with owner list | Faster follow-up; pipeline slippage caught weeks earlier |
| Finance | "Explain the variance in logistics cost vs budget by cost centre." | Analyst builds a one-off pivot | Variance table + narrative in 1 minute | Month-end commentary time −50 % |
| Operations / Supply chain | "Which SKUs will stock out in 14 days at current run-rate?" | Excel model maintained by one person | Recurring agentic check with alert to LINE | Stock-out incidents −20 % |
| Retail / Branch | "Sales today vs same day last year for my branch." | Branch manager opens a dashboard on a laptop | Ask in LINE from the shop floor | Adoption among non-desk staff |
| HR | "Headcount and attrition by unit, last 12 months." (RLS-restricted) | HRBP requests report | Self-service for authorised managers only | Report requests −70 % for HR analytics |
| Executive | "Give me five bullet points on last week's performance for the board." | Analyst writes a memo | Draft generated from the Executive dashboard, human edits | Board-prep time −60 % |
| BI / IT | "Which dashboards has nobody opened in 90 days?" | Repository SQL by an admin | Admin insight tools via chat | Licence and server clean-up |

**Quantifying value** (fill with your numbers):

```text
Ad-hoc requests per month          ×  hours per request  ×  analyst hourly cost  =  A
Decision delay days avoided        ×  value per day (e.g. stock-out, discount)   =  B
Licence / server clean-up savings                                               =  C
Annual value ≈ 12 × (A + B) + C      vs      annual run cost (Section 8)
```

## 🏗️ 5. Target architecture

![fig-portal](../assets/diagrams/fig-portal.svg)

*Figure 1. Target state: one governed Tableau MCP service behind the company portal and the users' existing AI clients. Detail in the Architecture and Web UI chapters.*

| Layer | Component | Choice for Demo Company |
|---|---|---|
| Data | Tableau Server 2025.3+ (existing), certified sources in a locked project, RLS via entitlement table / virtual connection | Existing licence; Data Management add-on if virtual connections are used |
| Access broker | Tableau MCP, three instances (analysts / portal / admin) on a dedicated Linux VM, Docker, TLS reverse proxy | Section 4 patterns |
| Identity | OAuth against Tableau (SAML SSO behind it); Connected App for the portal | Section 7 |
| Model | Phase 1–2: cloud LLM for Public/Internal data; Phase 3: self-hosted or in-region model for Confidential | Data classification decides |
| Channels | Claude Desktop / Copilot for analysts; company portal with chat box + embedded dashboards; LINE / Teams bot calling the portal API | Section 6 for the portal |
| Operations | File logger + portal audit → SIEM; usage dashboard in Tableau; cost dashboard for tokens | Section 9 |

## 🗓️ 6. Roadmap

![fig-roadmap](../assets/diagrams/fig-roadmap.svg)

*Figure 2. Four phases, each with an exit gate. Do not start the next phase until the gate is met.*

| Phase | Duration | Scope | Exit gate |
|---|---|---|---|
| 0 · Pilot | 4 weeks | 1 site, 2 certified data sources (Sales, Finance), 5 users, stdio + PAT, use cases 1–2 | ≥ 80 % of 50 test questions match dashboard numbers; security review of findings |
| 1 · Shared service | 2 months | Dedicated VM, OAuth, RLS tested, `ai-ready` certification process, 30–50 users in 2 departments | Security sign-off; ≥ 3 queries per user per week; zero permission incidents |
| 2 · Portal & channels | 3 months | Web portal with AI chat + embedded dashboards, SSO, audit, LINE / Teams bot, use cases 3–5, all business units | NPS ≥ 40; ad-hoc report tickets −30 %; portal availability ≥ 99.5 % |
| 3 · Scale & optimise | ongoing | Self-hosted / in-region model for Confidential data, agentic alerts, admin automation, token-cost governance | Run-rate within budget; quarterly KPI review |

## 👥 7. Team and responsibilities

| Role | Phase 0–1 | Phase 2–3 | Responsibilities |
|---|---|---|---|
| Executive sponsor | 0.05 FTE | 0.05 FTE | Removes blockers, owns the KPI |
| Product owner (BI lead) | 0.3 FTE | 0.5 FTE | Prioritises use cases, certifies data sources, owns prompts and definitions |
| Tableau administrator | 0.3 FTE | 0.3 FTE | Projects, permissions, RLS, MCP instances |
| Platform / DevOps engineer | 0.3 FTE | 0.3 FTE | VM, Docker, TLS, secrets, logging |
| Full-stack developer | — | 1 FTE (Phase 2) | Portal, chat box, LINE / Teams bot |
| Security / compliance | 0.1 FTE | 0.1 FTE | Data classification, reviews, sign-off gates |
| Department champions (×4) | 0.1 FTE each | 0.1 FTE each | Test questions, adoption, feedback |
| External partner (optional) | Accelerator for Phase 0–1 | Portal build support | Tableau MCP setup, training, portal starter |

## 💰 8. Effort and cost structure

Fill in local rates; the structure is what matters.

| Item | Phase 0 | Phase 1 | Phase 2 | Run / year |
|---|---|---|---|---|
| Internal effort (person-days) | 15 | 40 | 120 | 60 |
| Infrastructure (VM, TLS, storage) | — | 1 small VM | 2 VMs (MCP, portal) | ✱ |
| Tableau licences | Existing | Existing (+ Viewer seats for new users) | + Viewer seats; Data Management if virtual connections | ✱ |
| LLM usage | Trial credits | ~30k tokens per analysis × queries per month | Per-user quota, e.g. 200 queries/month | ✱ |
| Self-hosted model (Phase 3) | — | — | — | GPU host or in-region managed endpoint |
| External services (optional) | Setup + training | Security review | Portal starter kit | Support retainer |

✱ enter your figures. Typical ratio: LLM usage is small compared with people cost; the largest cost line is Phase 2 development.

## ⚠️ 9. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Wrong answers trusted blindly | Medium | High | Every answer cites data source and filters; pilot accuracy gate; "verify with dashboard" training |
| Sensitive data reaches a cloud model | Low with controls | High | Data classification; Restricted out of MCP scope; Confidential only via self-hosted model; DPA with vendor |
| Permission gaps expose data | Medium | High | Locked certified project, group templates, two-user RLS test, 403 monitoring (Chapter 7) |
| Low adoption | Medium | Medium | Champions per department, channels people already use (LINE / Teams / Copilot), quick-win use cases first |
| Token cost creep | Medium | Low | Quotas, scoping, aggregates-only prompting, monthly cost dashboard |
| Vendor / version churn (Tableau MCP, AI clients) | High | Low | Pinned versions, quarterly upgrade window, "verify with docs" items reviewed each release |
| Key-person dependency on the developer | Medium | Medium | Portal built from the documented starter (Chapter 6), code in company repo, runbook |

## ✅ 10. Decision requested

1. Approve **Phase 0 pilot** (4 weeks, 15 person-days, no new licences).
2. Nominate the **product owner** and two **department champions**.
3. Confirm the **data classification** rules for AI access (Public / Internal via cloud model; Confidential requires Phase 3).
4. Agree the **gate criteria** above as the go / no-go for Phase 1.

## 📎 Appendix – Pilot test-question set (template)

| # | Department | Question | Expected source | Dashboard to verify against |
|---|---|---|---|---|
| 1 | Sales | Total sales by region, last quarter | Sales | Sales Overview |
| 2 | Sales | Top 10 products by quantity, West, last quarter | Sales | Product Detail |
| 3 | Finance | Logistics cost vs budget by cost centre, YTD | Finance | Budget vs Actual |
| 4 | Finance | Which cost centres exceeded budget by more than 10 %? | Finance | Budget vs Actual |
| 5 | Ops | SKUs with fewer than 14 days of cover | Inventory | Stock Cover |
| … | | 50 questions in total, 10 per department | | |

Score each answer: ✅ matches dashboard · ⚠️ right method, wrong filter · ❌ wrong. Gate: ≥ 80 % ✅.

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🔐 [Permissions, roles and licences](07-permissions-security.md)
8. 📈 **[Enterprise proposal: a BI + AI chat platform on Tableau MCP](08-enterprise-proposal.md)**
9. 🛡️ [Best practices, governance and security checklist](09-best-practices.md)
10. ❓ [FAQ and glossary](10-faq-glossary.md)
11. 🔗 [References](11-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Permissions, roles and licences](07-permissions-security.md) · [Next: Best practices, governance and security checklist ▶](09-best-practices.md) · [🇹🇭 ภาษาไทย](../th/08-enterprise-proposal.md)

<sub>Section 8 of 11 · Created by The Narit Lab</sub>
