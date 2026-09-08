[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ภาพรวม](01-overview.md) · [ถัดไป: สิ่งที่ต้องเตรียม ▶](03-prerequisites.md) · [🇺🇸 English](../en/02-architecture.md)

---

# 🏗️ สถาปัตยกรรม

`ส่วนที่ 2 จาก 11`

> สามองค์ประกอบ สองช่วงการเชื่อมต่อ AI client คุยกับ Tableau MCP server ด้วยโปรโตคอล MCP ส่วน MCP server คุยกับ REST API ของ Tableau Server ผ่าน HTTPS ทุกอย่างที่อยู่ทางขวาของ MCP server คือระบบ on-premise ที่คุณมีอยู่แล้ว

## 🧩 มุมมององค์ประกอบ

![fig-components](../assets/diagrams/fig-components.svg)

*รูปที่ 1 มุมมององค์ประกอบ (ป้ายในแผนภาพเป็นศัพท์เทคนิคภาษาอังกฤษ) LLM ไม่เคยเชื่อมต่อ Tableau Server โดยตรง ทุกการเข้าถึงข้อมูลคือการเรียก tool ผ่าน Tableau MCP*

### ข้อมูลไหลอย่างไร

1. ผู้ใช้พิมพ์คำถามใน AI client
2. LLM อ่านรายการ tool ที่ MCP server ประกาศไว้ แล้วตัดสินใจ เช่น เรียก `list-datasources` ตามด้วย `query-datasource`
3. MCP server แปลงการเรียก tool แต่ละครั้งเป็นคำขอ REST API / VDS โดยลงนามด้วยข้อมูลรับรองที่ตั้งค่าไว้
4. Tableau Server บังคับใช้สิทธิ์และ RLS รัน query แล้วส่งข้อมูลกลับ
5. MCP server ส่งผลลัพธ์ของ tool กลับไปยัง client แล้ว LLM เขียนคำตอบ

> [!WARNING]
> **ข้อมูลออกจากเครือข่ายที่ขั้นตอนที่ 5**
>
> ผลลัพธ์ของ tool (metadata และผล query) ถูกส่งไปยัง LLM ที่ client ใช้อยู่ หากโมเดลเป็น SaaS API สาธารณะ ข้อมูลนั้นออกจากเครือข่ายของคุณ ใช้ tool scoping, RLS และนโยบายจัดชั้นความลับข้อมูลเพื่อควบคุมว่าอะไร query ได้ ถ้าต้องการ on-premise ทั้งหมด ให้ชี้หน้าเว็บที่คุณสร้างเอง (ส่วนที่ 6) ไปยังโมเดลที่โฮสต์เอง

## 🔐 ทางเลือกการยืนยันตัวตน

![fig-auth](../assets/diagrams/fig-auth.svg)

*รูปที่ 2 สามวิธีที่ Tableau MCP ใช้เข้าสู่ระบบ Tableau Server หากมีคนใช้ร่วมกันมากกว่าหนึ่งคน ให้เลือก C*

| | A · PAT | B · Connected App | C · OAuth |
|---|---|---|---|
| เหมาะกับ | ทดสอบส่วนตัว, stdio | service identity, portal แบบฝัง, UBL ที่มีสัญญารองรับ | การติดตั้งแบบ HTTP ใช้ร่วมกัน |
| ตัวตนที่ Tableau เห็น | เจ้าของ PAT | ค่าใน `JWT_SUB_CLAIM` (หรือผู้ใช้ OAuth เมื่อใช้ `{OAUTH_USERNAME}`) | ผู้ใช้ที่ล็อกอิน |
| ใช้พร้อมกันหลายคน | ไม่ปลอดภัย | ได้ | ได้ |
| เวอร์ชัน Tableau Server | เวอร์ชันที่ยัง support | เวอร์ชันที่ยัง support | 2025.3 ขึ้นไป |
| ตั้งค่าเพิ่ม | ไม่มี | สร้างและเปิดใช้ Connected App | RSA key + `tsm` ตั้ง redirect host |
| Row-level security | ตามเจ้าของ PAT | ตามผู้ใช้ใน `sub` | รายบุคคล อัตโนมัติ |

## 🚀 รูปแบบการติดตั้ง

![fig-deploy](../assets/diagrams/fig-deploy.svg)

*รูปที่ 3 สี่รูปแบบการติดตั้ง องค์กรส่วนใหญ่เริ่มจากแบบที่ 1 สำหรับเดโม แล้วย้ายไปแบบที่ 4 สำหรับ production*

| แบบ | คำอธิบาย | Auth | ผู้ใช้ | ข้อควรระวัง |
|---|---|---|---|---|
| 1 · Local (stdio) | AI client บนโน้ตบุ๊กเปิดโปรเซส `npx @tableau/mcp-server` เอง | PAT | 1 คน | เริ่มตรงนี้ ใช้เวลา 5 นาที |
| 2 · Docker (HTTP) | คอนเทนเนอร์ `ghcr.io/tableau/tableau-mcp` พอร์ต 3927 บน Docker host ใดก็ได้ | OAuth / Direct Trust | ทีม | อัปเกรดง่ายที่สุด |
| 3 · บนเครื่อง Tableau node | Node.js service หรือคอนเทนเนอร์อยู่ข้าง TSM เรียก REST ผ่าน localhost | ทุกแบบ | ทีม | แย่ง CPU / RAM กับ Tableau |
| 4 · VM แยก | Linux VM ขนาดเล็ก + systemd หรือ Docker + nginx TLS + firewall allow-list | OAuth | ทั้งองค์กร | ตัวเลือกสำหรับ production |

### ขอบเขตเครือข่ายและความปลอดภัย

- **ขอบเขตที่ 1 – client ถึง MCP** แบบ stdio ไม่มีเครือข่าย AI client เปิด server เป็นโปรเซสลูกบนเครื่องเดียวกัน แบบ HTTP ให้ bind server ไว้ที่ `127.0.0.1` แล้ววาง TLS reverse proxy พร้อม IP allow-list ไว้ข้างหน้า ห้ามเปิดสู่อินเทอร์เน็ต และห้ามเด็ดขาดหากปิด OAuth
- **ขอบเขตที่ 2 – MCP ถึง Tableau Server** HTTPS มาตรฐานไปยัง gateway (443) เครื่องที่รัน MCP ต้องมีเส้นทางถึง Tableau Server และต้องเชื่อถือ TLS certificate ของมัน (หรือส่ง CA bundle ให้)
- **ขอบเขตที่ 3 – client ถึง LLM** เป็นของผู้ให้บริการ AI (Anthropic, OpenAI, Google, Microsoft) หรือของคุณเองหากโฮสต์เอง ผลลัพธ์ของ tool ข้ามขอบเขตนี้

> [!TIP]
> **AI client ที่อยู่บนคลาวด์ต้องการ URL ที่เข้าถึงได้**
>
> ChatGPT และ Copilot Studio รันบนคลาวด์ของผู้ให้บริการ จึงเข้าถึง `127.0.0.1` ไม่ได้ สำหรับ client เหล่านี้ต้องใช้แบบที่ 2, 3 หรือ 4 ที่มี URL เข้าถึงได้จากอินเทอร์เน็ต (ผ่าน reverse proxy หรือ tunnel) และเปิด OAuth ส่วน Claude Desktop, Claude Code และ Gemini CLI รันบนเครื่องคุณ ใช้ stdio ได้เลย

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ **[สถาปัตยกรรม](02-architecture.md)**
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🔐 [สิทธิ์ บทบาท และลิขสิทธิ์](07-permissions-security.md)
8. 📈 [ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](09-best-practices.md)
10. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md)
11. 🔗 [เอกสารอ้างอิง](11-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ภาพรวม](01-overview.md) · [ถัดไป: สิ่งที่ต้องเตรียม ▶](03-prerequisites.md) · [🇺🇸 English](../en/02-architecture.md)

<sub>ส่วนที่ 2 จาก 11 · Created by The Narit Lab</sub>
