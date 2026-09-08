[🏠 หน้าแรก](../../README.th.md) · [ถัดไป: สถาปัตยกรรม ▶](02-architecture.md) · [🇺🇸 English](../en/01-overview.md)

---

# 📖 ภาพรวม

`ส่วนที่ 1 จาก 9`

> Tableau MCP ทำให้ผู้ช่วย AI อย่าง Claude, ChatGPT, Gemini หรือ Microsoft Copilot อ่านเนื้อหาบน Tableau Server และ query แหล่งข้อมูลที่เผยแพร่ (published data source) ของคุณได้ ผ่านช่องทางที่มีการกำกับดูแลและเคารพสิทธิ์ผู้ใช้ คู่มือนี้พาคุณตั้งแต่ทดสอบครั้งแรกบนเครื่องตัวเอง ไปจนถึงการติดตั้งแบบหลายผู้ใช้ที่ปลอดภัย และการสร้างหน้าเว็บของคุณเองครอบไว้อีกชั้น

## 🔌 Tableau MCP คืออะไร

Model Context Protocol (MCP) คือมาตรฐานเปิดที่ให้แอปพลิเคชัน AI (เรียกว่า "MCP host" หรือ "client") เรียกใช้ **tool** ที่โปรแกรมภายนอก ("MCP server") เปิดให้ Tableau MCP คือ MCP server อย่างเป็นทางการของ Tableau เป็นแอป Node.js ขนาดเล็กที่:

- เปิด tool ชุดหนึ่งให้ AI เรียก เช่น *แสดงรายการ data source*, *ดู metadata ของฟิลด์*, *query data source*, *ค้นหาเนื้อหา*, *ดึงภาพ view*, *แสดงรายการ workbook*, *สั่ง refresh extract* และ tool ด้าน admin insight
- แปลงการเรียก tool แต่ละครั้งเป็นการเรียก **REST API** และ **VizQL Data Service (VDS)** ของ Tableau Server
- เข้าสู่ระบบ Tableau Server ด้วยข้อมูลรับรองที่คุณควบคุมเอง ได้แก่ Personal Access Token (PAT), Connected App (Direct Trust JWT) หรือบน Tableau Server 2025.3 ขึ้นไปใช้ OAuth ให้ผู้ใช้แต่ละคนทำงานในนามตัวเอง

โมเดล AI ไม่เคยคุยกับฐานข้อมูลของคุณโดยตรง มันเห็นเฉพาะสิ่งที่ Tableau อนุญาตให้ผู้ใช้ที่ล็อกอินอยู่เห็น ซึ่งถูกกรองด้วยสิทธิ์ระดับ project สิทธิ์ของ data source และ row-level security

## 🏢 ทำไมต้องใช้กับ Tableau Server on-premise

| เหตุผล | ความหมายสำหรับคุณ |
|---|---|
| ข้อมูลอยู่หลัง firewall เหมือนเดิม | MCP server รันบนเครือข่ายของคุณ มีเพียง *ผลลัพธ์* ของ query ที่ผ่านการกำกับแล้วเท่านั้นที่ส่งไปยังโมเดล และคุณเป็นผู้เลือกว่าใช้โมเดลไหน |
| ใช้ semantic layer ที่สร้างไว้แล้วซ้ำได้ | published data source ที่มี calculated field, alias และ RLS กลายเป็น "คลังคำศัพท์" ที่ AI ใช้ query ไม่ต้องสร้าง business logic ซ้ำอีกชุด |
| การกำกับดูแลติดไปกับทุกคำขอ | เมื่อใช้ OAuth ทุกการเรียก tool ทำงานในนามผู้ใช้จริง สิทธิ์ของ Tableau และ RLS จึงมีผลอัตโนมัติ |
| ใช้ได้กับ client ที่รองรับ MCP ทุกตัว | Claude Desktop, Claude Code, ChatGPT, Gemini CLI, Copilot Studio, VS Code, Cursor และแอปที่เขียนเอง ใช้ server ตัวเดียวกัน |
| ต่อยอดสู่ conversational analytics แบบฝังตัว | เมื่อ server ทำงานได้แล้ว การเชื่อมต่อเดียวกันนี้ใช้ขับเคลื่อนหน้าเว็บ portal พร้อมช่องแชท (ส่วนที่ 6) ได้ทันที |

## 👥 คู่มือนี้เหมาะกับใคร

- **ผู้ดูแล Tableau Server** ที่ต้องติดตั้งและทำให้ MCP server ปลอดภัย
- **Solution consultant และนักพัฒนา BI** ที่จะสร้าง use case, prompt และเดโมบนนั้น
- **นักพัฒนา** ที่ต้องการทำหน้าเว็บของตัวเองครอบ Tableau Server พร้อมช่องแชท AI

คุณควรรู้พื้นฐาน Tableau Server อยู่แล้ว (site, project, published data source, permission) ไม่จำเป็นต้องมีประสบการณ์ MCP หรือการเชื่อมต่อ LLM มาก่อน

## 🗺️ โครงสร้างของคู่มือ

1. **สถาปัตยกรรม** แสดงองค์ประกอบทั้งหมดและทางเลือกการยืนยันตัวตนสามแบบ
2. **สิ่งที่ต้องเตรียม** รายการเวอร์ชัน พอร์ต และสิทธิ์
3. **การติดตั้งและตั้งค่า** พาเตรียม Tableau Server รัน Tableau MCP เชื่อม AI client แต่ละตัว และแก้ปัญหา
4. **5 use case** ตั้งแต่ "หาเนื้อหาของฉัน" ไปจนถึงการวิเคราะห์หลายขั้นแบบ agentic
5. **Web UI wrapper** สร้าง portal ด้วย Node.js + Express + React พร้อมช่องแชท AI
6. **แนวปฏิบัติที่ดี, FAQ และเอกสารอ้างอิง** ปิดท้าย

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> Tableau MCP ออกเวอร์ชันใหม่บ่อย และ Tableau Server เพิ่มความสามารถทุกไตรมาส เนื้อหาที่มีกล่องสีม่วงแบบนี้อาจเปลี่ยนไปแล้ว คู่มือนี้เขียนอิงจาก Tableau MCP **3.6.x** และ Tableau Server **2025.3+** (กันยายน 2569)

> [!NOTE]
> **ชื่อตัวอย่างที่ใช้ตลอดคู่มือ**
>
> `demo-server.local` คือ Tableau Server ของคุณ, `DemoSite` คือ content URL ของ site, `<YOUR_PAT_VALUE>` และค่าที่อยู่ในวงเล็บแหลมทั้งหมดต้องแทนด้วยค่าของคุณเอง "Demo Company" คือองค์กรสมมติ

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 **[ภาพรวม](01-overview.md)**
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md)
8. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](08-faq-glossary.md)
9. 🔗 [เอกสารอ้างอิง](09-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [ถัดไป: สถาปัตยกรรม ▶](02-architecture.md) · [🇺🇸 English](../en/01-overview.md)

<sub>ส่วนที่ 1 จาก 9 · Created by The Narit Lab</sub>
