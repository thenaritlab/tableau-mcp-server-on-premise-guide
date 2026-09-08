[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md) · [🇺🇸 English](../en/11-references.md)

---

# 🔗 เอกสารอ้างอิง

`ส่วนที่ 11 จาก 11`

แหล่งข้อมูลทางการมาก่อน ลิงก์ทั้งหมดใช้ได้ ณ กันยายน 2569 เอกสารมีการย้ายที่ หากลิงก์เสียให้ค้นหาในเว็บไซต์นั้น

## 🔌 Tableau MCP

- เอกสาร Tableau MCP — <https://tableau.github.io/tableau-mcp/>
- Getting started (npx, source, Docker) — <https://tableau.github.io/tableau-mcp/docs/getting-started>
- คู่มือ deployment สำหรับลูกค้า Tableau Server — <https://tableau.github.io/tableau-mcp/docs/enterprise/tableau-server>
- การตั้งค่าและตัวแปรสภาพแวดล้อม — <https://tableau.github.io/tableau-mcp/docs/configuration>
- รายการ tool — <https://tableau.github.io/tableau-mcp/docs/category/tools>
- ซอร์สโค้ด, releases, รายชื่อ tool — <https://github.com/tableau/tableau-mcp>
- แพ็กเกจ npm — <https://www.npmjs.com/package/@tableau/mcp-server>
- Container image — <https://github.com/tableau/tableau-mcp/pkgs/container/tableau-mcp>

## 🏢 Tableau Server

- Personal Access Tokens — <https://help.tableau.com/current/server/en-us/security_personal_access_tokens.htm>
- ตั้งค่า Connected Apps แบบ Direct Trust — <https://help.tableau.com/current/server/en-us/connected_apps_direct.htm>
- REST API authentication (PAT, JWT) — <https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api_ref_authentication.htm>
- VizQL Data Service — <https://help.tableau.com/current/api/vizql-data-service/en-us/>
- Embedding API v3 — <https://help.tableau.com/current/api/embedding_api/en-us/>
- tsm configuration set — <https://help.tableau.com/current/server/en-us/cli_configuration-set_tsm.htm>
- Basic product data (telemetry) — <https://help.tableau.com/current/server/en-us/usage_data_basic_product_data.htm>

## สิทธิ์ site role และ API (แหล่งอ้างอิงของบทที่ 7)

- Permission Capabilities and Templates (API Access, Full Data Query, capability ของ data source) — <https://help.tableau.com/current/server/en-us/permissions_capabilities.htm>
- ภาพรวมสิทธิ์และข้อจำกัดของ site role (Cloud) — <https://help.tableau.com/current/online/en-us/permissions.htm>
- Site role และลิขสิทธิ์ — <https://help.tableau.com/current/server/en-us/users_site_roles.htm>
- VizQL Data Service: Setup (สิทธิ์, PAT/JWT) — <https://help.tableau.com/current/api/vizql-data-service/en-us/docs/vds_setup.html>
- VizQL Data Service: Configuration (API Access, data source ของ workbook, FDQ) — <https://help.tableau.com/current/api/vizql-data-service/en-us/docs/vds_configuration.html>
- VizQL Data Service: What's new — <https://help.tableau.com/current/api/vizql-data-service/en-us/docs/vds_whats_new.html>
- บล็อก Tableau: สิทธิ์ API Access สำหรับ VDS บน Tableau Cloud (2024.3) — <https://www.tableau.com/blog/use-vizql-data-service-tableau-cloud-site>
- Metadata API — <https://help.tableau.com/current/api/metadata_api/en-us/>
- ภาพรวม Connected Apps — <https://help.tableau.com/current/server/en-us/connected_apps.htm>
- Embedding API v3 reference — <https://help.tableau.com/current/api/embedding_api/en-us/reference/index.html>
- Extensions API — <https://tableau.github.io/extensions-api/>
- Hyper API — <https://tableau.github.io/hyper-db/>
- Tableau Server Client (Python) — <https://tableau.github.io/server-client-python/>
- Webhooks — <https://help.tableau.com/current/developer/webhooks/en-us/>
- เอกสาร tool ของ Tableau MCP รวม admin-insight tool และ role gate — <https://tableau.github.io/tableau-mcp/docs/category/tools>
- ประเภทลิขสิทธิ์ Tableau (ความสามารถของ Creator / Explorer / Viewer) — <https://www.tableau.com/pricing/teams-orgs>

## 📐 ข้อกำหนด MCP และ client

- ข้อกำหนด Model Context Protocol — <https://modelcontextprotocol.io/specification/>
- MCP TypeScript SDK — <https://github.com/modelcontextprotocol/typescript-sdk>
- ตั้งค่า MCP ใน Claude Desktop — <https://support.claude.com/> (ค้นหา "MCP")
- Claude Code MCP — <https://docs.claude.com/en/docs/claude-code/mcp>
- Anthropic API tool use — <https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview>
- OpenAI ChatGPT connectors และ MCP — <https://platform.openai.com/docs/mcp>
- Gemini CLI MCP servers — <https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md>
- Microsoft Copilot Studio: เพิ่ม MCP server — <https://learn.microsoft.com/microsoft-copilot-studio/agent-extend-action-mcp>
- VS Code MCP servers — <https://code.visualstudio.com/docs/copilot/chat/mcp-servers>

## 🌱 โปรเจกต์ตัวอย่างจากชุมชน

- Tableau MCP starter kit (LangChain) — <https://github.com/wjsutton/tableau_mcp_starter_kit>
- MCPJam inspector (ดีบัก OAuth) — <https://www.mcpjam.com/>

---

Created by The Narit Lab ชื่อเครื่อง โทเคน และชื่อบริษัททั้งหมดในคู่มือนี้เป็นค่าตัวอย่าง

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🔐 [สิทธิ์ บทบาท และลิขสิทธิ์](07-permissions-security.md)
8. 📈 [ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](09-best-practices.md)
10. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md)
11. 🔗 **[เอกสารอ้างอิง](11-references.md)**

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md) · [🇺🇸 English](../en/11-references.md)

<sub>ส่วนที่ 11 จาก 11 · Created by The Narit Lab</sub>
