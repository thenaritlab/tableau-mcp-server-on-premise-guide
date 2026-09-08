[🏠 Home](../../README.md) · [◀ Previous: Best practices, governance and security checklist](07-best-practices.md) · [Next: References ▶](09-references.md) · [🇹🇭 ภาษาไทย](../th/08-faq-glossary.md)

---

# ❓ FAQ and glossary

`Section 8 of 9`

## ❓ FAQ

<details><summary>Does the AI vendor see my database?</summary>

No. The model only receives what Tableau MCP returns from a tool call: metadata and aggregated query results for content the signed-in identity can access. Your database is never contacted by the model. The results do, however, leave your network unless you self-host the model.

</details>

<details><summary>Do I need Tableau Cloud or Tableau+ for this?</summary>

No. Tableau MCP is open source and works with Tableau Server. Tableau Cloud gets an additional hosted MCP service and Pulse tools; on Server exclude the `pulse` group.

</details>

<details><summary>Which Tableau Server version do I need?</summary>

Any supported version for PAT or Direct Trust. OAuth (per-user auth on the HTTP transport) needs 2025.3 or newer.

</details>

<details><summary>Can Viewers use it?</summary>

Viewers can read views (`get-view-data`, `get-view-image`) if they have permission. Querying a published data source requires the "Connect" and "API access" capabilities, which are usually granted to Explorers and Creators.

</details>

<details><summary>Why does ChatGPT say it cannot reach my server?</summary>

ChatGPT runs in OpenAI's cloud; it cannot see `127.0.0.1` or an internal host name. You need the HTTP deployment on a public HTTPS URL with OAuth. For a demo a tunnel works; for production use your DMZ reverse proxy.

</details>

<details><summary>Can two people share one PAT?</summary>

Technically it runs, but PATs are not concurrency-safe and everyone becomes one identity, which breaks RLS and, depending on your contract, licensing. Use OAuth.

</details>

<details><summary>Does row-level security work?</summary>

Yes, when Tableau sees the right user. With OAuth that is automatic. With Direct Trust, whatever you put in `JWT_SUB_CLAIM` is the user. With a PAT it is the PAT owner.

</details>

<details><summary>How much does a query cost in tokens?</summary>

Listing fields for a wide data source can be 2–5k tokens; a small aggregate result is a few hundred. A five-step agentic analysis is typically 20–40k tokens. Scope tools and data sources to keep this down.

</details>

<details><summary>Can the AI change anything on the server?</summary>

Some tools can trigger extract refreshes or produce admin reports. Exclude those groups for analyst-facing instances with `INCLUDE_TOOLS=datasource`.

</details>

<details><summary>What about Tableau Agent and Tableau Next?</summary>

Tableau Agent is Tableau's built-in assistant inside the product (available on Server from 2025.3). Tableau MCP is for bringing Tableau data into *external* AI tools and custom apps. They complement each other.

</details>

## 📚 Glossary

| Term | English | ไทย |
|---|---|---|
| MCP | Model Context Protocol – an open standard for AI clients to call external tools | โปรโตคอลมาตรฐานเปิดให้ AI เรียกใช้เครื่องมือภายนอก |
| MCP host / client | The AI application that calls tools (Claude Desktop, ChatGPT…) | แอป AI ที่เรียกเครื่องมือ |
| MCP server | The program exposing tools; here, Tableau MCP | โปรแกรมที่เปิดเครื่องมือให้เรียก ในที่นี้คือ Tableau MCP |
| Tool | A named function with a JSON schema the model can call | ฟังก์ชันที่มีชื่อและ schema ให้โมเดลเรียก |
| stdio | Transport where the client launches the server as a child process | การเชื่อมต่อแบบ client เปิดโปรเซสเซิร์ฟเวอร์เอง |
| Streamable HTTP | Transport over HTTP for shared, remote MCP servers | การเชื่อมต่อผ่าน HTTP สำหรับเซิร์ฟเวอร์ที่ใช้ร่วมกัน |
| PAT | Personal Access Token – long-lived token that signs in as one user | โทเคนส่วนบุคคลสำหรับเข้าสู่ระบบแทนผู้ใช้หนึ่งคน |
| Connected App | Tableau feature that trusts JWTs signed with a shared secret (Direct Trust) or an external IdP (OAuth 2.0 Trust) | ฟีเจอร์ของ Tableau ที่เชื่อถือ JWT ที่ลงนามด้วย secret |
| Direct Trust | Connected App mode where Tableau shares a secret with your app | โหมด Connected App ที่ Tableau แชร์ secret กับแอปของคุณ |
| JWT | JSON Web Token – signed token carrying the user (`sub`) and scopes | โทเคนที่ลงนามซึ่งระบุผู้ใช้และสิทธิ์ |
| JWE | JSON Web Encryption – encrypted token used by the embedded OAuth server | โทเคนที่เข้ารหัสซึ่งใช้โดยเซิร์ฟเวอร์ OAuth ในตัว |
| OAuth 2.1 | Authorisation flow where the user signs in and the client gets access/refresh tokens | กระบวนการอนุญาตที่ผู้ใช้ล็อกอินแล้ว client ได้รับโทเคน |
| VDS | VizQL Data Service – Tableau API that runs queries against published data sources | API ของ Tableau สำหรับ query แหล่งข้อมูลที่เผยแพร่ |
| Published data source | A data source on the server with its own permissions, calculations and RLS | แหล่งข้อมูลบนเซิร์ฟเวอร์ที่มีสิทธิ์ สูตร และ RLS ของตัวเอง |
| RLS | Row-level security – filters rows by user | การจำกัดข้อมูลระดับแถวตามผู้ใช้ |
| LUID | Locally unique identifier – the GUID of a Tableau object | รหัสประจำวัตถุใน Tableau |
| Tool scoping | Env vars that restrict which projects, tags, data sources or workbooks tools may touch | การจำกัดขอบเขตเครื่องมือด้วยตัวแปรสภาพแวดล้อม |
| Agentic loop | Model calls tools repeatedly until it can answer | วงจรที่โมเดลเรียกเครื่องมือซ้ำจนตอบได้ |
| UBL | Usage-based licensing | การคิดค่าลิขสิทธิ์ตามการใช้งาน |

---

<details>
<summary>📚 Contents</summary>

1. 📖 [Overview](01-overview.md)
2. 🏗️ [Architecture](02-architecture.md)
3. ✅ [Prerequisites](03-prerequisites.md)
4. ⚙️ [Installation and configuration](04-installation.md)
5. 💡 [Top 5 use cases](05-use-cases.md)
6. 🖥️ [Advanced: build a custom Web UI wrapper](06-web-ui-wrapper.md)
7. 🛡️ [Best practices, governance and security checklist](07-best-practices.md)
8. ❓ **[FAQ and glossary](08-faq-glossary.md)**
9. 🔗 [References](09-references.md)

</details>

[🏠 Home](../../README.md) · [◀ Previous: Best practices, governance and security checklist](07-best-practices.md) · [Next: References ▶](09-references.md) · [🇹🇭 ภาษาไทย](../th/08-faq-glossary.md)

<sub>Section 8 of 9 · Created by The Narit Lab</sub>
