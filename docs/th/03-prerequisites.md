[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: สถาปัตยกรรม](02-architecture.md) · [ถัดไป: การติดตั้งและตั้งค่า ▶](04-installation.md) · [🇺🇸 English](../en/03-prerequisites.md)

---

# ✅ สิ่งที่ต้องเตรียม

`ส่วนที่ 3 จาก 11`

> ตรวจสอบรายการเหล่านี้ก่อนติดตั้งอะไรทั้งสิ้น ความล้มเหลวครั้งแรกส่วนใหญ่มาจาก PAT หมดอายุ ขาดสิทธิ์ API access หรือ client เข้าถึง server ไม่ได้

## 📋 ตารางเวอร์ชัน

| องค์ประกอบ | ขั้นต่ำ | แนะนำ | หมายเหตุ |
|---|---|---|---|
| Tableau Server | เวอร์ชันที่ยังอยู่ในการ support | 2025.3 ขึ้นไป | 2025.3+ จำเป็นสำหรับ OAuth (ยืนยันตัวตนรายบุคคลบน HTTP) Tableau Agent สำหรับ Server ก็มาใน 2025.3 |
| Tableau MCP | 1.x | 3.6.x (ล่าสุด) | ใน production ให้ระบุเวอร์ชันตายตัว (`@tableau/mcp-server@3.6.0`, image tag `3.6.0`) |
| Node.js | 18 (stdio ผ่าน npx) | 22.7.5 ขึ้นไป | จำเป็นสำหรับการติดตั้งแบบ HTTP/enterprise ไม่จำเป็นหากใช้ Docker หรือ single-executable |
| Docker | 20+ | เวอร์ชัน stable ล่าสุด | ไม่บังคับ image: `ghcr.io/tableau/tableau-mcp` |
| REST API version | 3.x | ล่าสุดของ server คุณ | Tableau MCP เจรจาเวอร์ชันให้อัตโนมัติ |

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> ขั้นต่ำของ Node.js และ Tableau MCP เปลี่ยนทุกครั้งที่ออกเวอร์ชันใหม่ ตรวจฟิลด์ `engines` ในแพ็กเกจและคู่มือ enterprise deployment ก่อนกำหนดเวอร์ชัน

## 🪪 ลิขสิทธิ์

- **ลิขสิทธิ์ Tableau Server** Tableau MCP เป็น open source (Apache 2.0) ใช้ฟรี แต่ผู้ใช้ที่ query ผ่านมันใช้ลิขสิทธิ์ Tableau ตามปกติ (Creator, Explorer หรือ Viewer) Viewer อ่าน view ได้ ส่วนการ query published data source ต้องมีสิทธิ์ "Connect" บน data source
- **Usage-based licensing (UBL)** การใช้ตัวตนเดียว (PAT หรือ `JWT_SUB_CLAIM` คงที่) ให้คนจำนวนมากใช้ร่วมกัน เหมาะสมเฉพาะเมื่อสัญญาของคุณครอบคลุม UBL มิฉะนั้นให้ใช้ OAuth เพื่อให้ทุกคนเป็น named user
- **ค่าใช้จ่าย LLM** ผู้ให้บริการ AI แต่ละรายคิดเงินแยก เตรียมงบสำหรับ token: การ "query data source" หนึ่งรอบอาจใช้ metadata หลายพัน token

## 🔢 พอร์ต

| จาก | ไป | พอร์ต | วัตถุประสงค์ |
|---|---|---|---|
| เครื่องที่รัน MCP | Tableau Server gateway | 443 (หรือ 80) | REST API, VDS |
| AI client (โหมด HTTP) | Reverse proxy | 443 | Streamable HTTP MCP |
| Reverse proxy | Tableau MCP | 3927 | พอร์ตรับฟังเริ่มต้น bind ไว้ที่ localhost |
| Tableau Server | เครื่องที่รัน MCP | 443 | OAuth redirect กลับมายัง authorization server ในตัว |
| Portal (ส่วนที่ 6) | Tableau MCP | 3927 | server-to-server ภายในเท่านั้น |

## 🛠️ การตั้งค่าและสิทธิ์บน Tableau Server

1. **เปิดใช้ REST API** — เปิดอยู่โดยปริยาย ตรวจด้วย `tsm configuration get -k api.server.enabled` หากองค์กรปิดไว้ ให้ตั้งเป็น `true` แล้ว apply pending changes
2. **อนุญาต Personal Access Token** — ที่ site setting *Settings › General › Personal Access Tokens* ระดับ server: `tsm configuration get -k features.PersonalAccessTokensEnabled`
3. **สร้างผู้ใช้ Tableau เฉพาะสำหรับ MCP server** — สำหรับทดสอบ PAT หรือ Direct Trust ให้สร้าง `svc-mcp-reader` (site role Explorer หรือ Viewer หากต้องการแค่ดู view) ห้ามใช้บัญชี Server Administrator
4. **สิทธิ์ "View" และ "Connect" บน data source** — ทุกตัวที่ AI ควร query ได้ (VizQL Data Service ต้องการทั้งสองอย่าง) หากขาด "Connect" จะเห็น HTTP 403 ใน log ของ MCP รายละเอียดอยู่ในบทเรื่องสิทธิ์
5. **Connected Apps (สำหรับ Direct Trust หรือ portal)** — ที่ site setting *Settings › Connected Apps* ต้องเป็น site administrator จึงสร้างได้
6. **Metadata API (ไม่บังคับ)** — ช่วยให้ tool ด้าน lineage และค้นหาทำงานดีขึ้น เปิดด้วย `tsm maintenance metadata-services enable`
7. **OAuth redirect host (เฉพาะโหมด OAuth)** — `tsm configuration set -k oauth.allowed_redirect_uri_hosts -v tableau-mcp.demo-company.local` แล้ว `tsm pending-changes apply`

## 💻 ระบบปฏิบัติการของเครื่องที่รัน MCP

| สถานการณ์ | OS | หมายเหตุ |
|---|---|---|
| stdio บนเครื่องตัวเอง | Windows 10/11, macOS, Linux | ที่ไหนก็ได้ที่ AI client รันอยู่ ต้องมี Node.js 18+ บน PATH |
| HTTP ใช้ร่วมกัน | Linux (Rocky, Ubuntu, RHEL) | 1 vCPU / 1 GB RAM เพียงพอสำหรับทีม ใช้ Docker หรือ Node 22 + systemd |
| บนเครื่อง Tableau node | OS เดียวกับ Tableau Server | เฉพาะเมื่อขอ VM แยกไม่ได้ ระวังการแย่งทรัพยากร |

## 🤖 AI client

| Client | รันที่ไหน | Transport ที่ใช้ได้ | ต้องมี |
|---|---|---|---|
| Claude Desktop | เครื่องคุณ | stdio (หรือ HTTP ผ่าน `mcp-remote`) | แผนฟรีหรือเสียเงินที่เปิด MCP |
| Claude Code | เครื่องคุณ / server | stdio หรือ HTTP | Claude Code CLI |
| ChatGPT | คลาวด์ OpenAI | HTTP บน HTTPS สาธารณะพร้อม OAuth | แผนที่รองรับ custom connector / Developer mode |
| Gemini CLI | เครื่องคุณ | stdio หรือ HTTP | Gemini CLI + บัญชี Google |
| Microsoft Copilot Studio | คลาวด์ Microsoft | HTTP บน HTTPS สาธารณะ | ลิขสิทธิ์ Copilot Studio |
| VS Code (Copilot / Claude), Cursor | เครื่องคุณ | stdio หรือ HTTP | editor ที่รองรับ MCP |

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> แผนของ ChatGPT และ Copilot ที่อนุญาต custom MCP connector เปลี่ยนบ่อย ตรวจเอกสารปัจจุบันของผู้ให้บริการก่อนรับปากลูกค้า

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ **[สิ่งที่ต้องเตรียม](03-prerequisites.md)**
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🔐 [สิทธิ์ บทบาท และลิขสิทธิ์](07-permissions-security.md)
8. 📈 [ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](09-best-practices.md)
10. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md)
11. 🔗 [เอกสารอ้างอิง](11-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: สถาปัตยกรรม](02-architecture.md) · [ถัดไป: การติดตั้งและตั้งค่า ▶](04-installation.md) · [🇺🇸 English](../en/03-prerequisites.md)

<sub>ส่วนที่ 3 จาก 11 · Created by The Narit Lab</sub>
