[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md) · [ถัดไป: คำถามที่พบบ่อยและอภิธานศัพท์ ▶](08-faq-glossary.md) · [🇺🇸 English](../en/07-best-practices.md)

---

# 🛡️ แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย

`ส่วนที่ 7 จาก 9`

> Tableau MCP สืบทอดโมเดลการกำกับดูแลของ Tableau ก็ต่อเมื่อคุณตั้งค่าให้เป็นอย่างนั้น รายการนี้คือสิ่งที่ควรเดินทีละข้อร่วมกับทีมความปลอดภัยของลูกค้าก่อน go-live

## 🚀 การติดตั้ง

- เริ่มจาก **stdio + PAT บนโน้ตบุ๊กเครื่องเดียว** สำหรับเดโม แล้วย้ายไป **VM แยกพร้อม OAuth** สำหรับทุกอย่างที่ใช้ร่วมกัน อย่าข้ามไป "บนเครื่อง Tableau node" เพียงเพราะสะดวก
- **ระบุเวอร์ชันตายตัว** ของแพ็กเกจ npm หรือ container image อัปเกรดตามรอบหลังอ่าน release notes เพราะชื่อและพฤติกรรมของ tool เปลี่ยนระหว่างเวอร์ชันย่อย
- ให้ MCP server **bind กับ localhost** และมี reverse proxy ที่ทำ TLS และ IP allow-list อยู่ข้างหน้า
- รันด้วย **service user ที่ไม่ใช่ root** และ file system อ่านอย่างเดียวยกเว้นโฟลเดอร์ log
- ตั้ง `PRODUCT_TELEMETRY_ENABLED=false` หากนโยบายห้ามส่ง product telemetry ออกนอก

## 🔐 ตัวตนและการเข้าถึง

- ใช้ **OAuth** (2025.3+) เป็นหลัก เพื่อให้ทุกการเรียก tool ระบุถึงผู้ใช้จริงและ RLS มีผล
- หากจำเป็นต้องใช้ service identity (Direct Trust หรือ PAT) ให้ **site role ต่ำสุดที่ทำงานได้** และเฉพาะ data source ที่จำเป็น ห้ามเป็น Server Administrator
- บันทึกว่า MCP แต่ละ instance ใช้ตัวตนใด รูปแบบที่สะอาดคือรันสอง instance: หนึ่งสำหรับ admin อีกหนึ่งสำหรับนักวิเคราะห์ โดยใช้ `INCLUDE_TOOLS` ต่างกัน
- หมุนเวียน PAT และ secret ของ Connected App ตามรอบเดียวกับข้อมูลรับรองบริการอื่น

## 🗄️ การกำกับดูแลข้อมูล

- **Certify** published data source ที่จะเปิดให้ใช้ และเพิ่ม **คำอธิบายฟิลด์และ alias** นี่คือ "prompt" ที่โมเดลอ่าน
- ใช้ `INCLUDE_TAGS=ai-ready` (หรือ project) เพื่อให้ AI เห็นเฉพาะเนื้อหาที่ตรวจทานแล้ว
- ทำ **row-level security** ใน data source ไม่ใช่ใน prompt เชื่อโมเดลให้กรองข้อมูลไม่ได้
- จัดชั้นความลับข้อมูล สิ่งใดที่ผู้ให้บริการ LLM ห้ามเห็น ต้อง query ไม่ได้ผ่าน MCP instance ที่ใช้ผู้ให้บริการนั้น
- **exclude Pulse** บน Server เสมอ เป็นฟีเจอร์ของ Cloud และให้แต่ข้อผิดพลาด

## 💬 การเขียน prompt และพฤติกรรมโมเดล

- ให้ system instruction แก่โมเดลว่า: ระบุ data source และตัวกรอง; ห้ามแต่งตัวเลข; เลือก aggregate; ถามกลับเมื่อฟิลด์กำกวม
- จำกัดรอบการเรียก tool ต่อหนึ่งคำถาม (8 เป็นค่าเริ่มต้นที่ดี) และตั้ง timeout
- ตรวจคำตอบช่วงแรกกับ dashboard เขียนปฏิทินบัญชีและนิยามทางธุรกิจที่โมเดลต้องใช้ไว้เป็นลายลักษณ์อักษร

## 📈 การปฏิบัติงาน

- เปิด `ENABLED_LOGGERS=fileLogger` และส่ง log ต่อ เชื่อมโยงกับ `audit.jsonl` ของ portal และ `http_requests` ของ Tableau Server เพื่อให้ได้ร่องรอยครบ
- เฝ้าระวัง: โปรเซสทำงาน, `ping` สำเร็จ, อัตรา 401/403, latency ของ tool ที่ p95, ค่าใช้จ่าย token รายผู้ใช้
- รู้จัก **สวิตช์ฉุกเฉิน**: `BREAK_GLASS_DISABLE_GLOBALLY=true` ทำให้บริการยังอยู่แต่ทุกการเรียก tool ล้มเหลว
- วางแผนรับมือ **ข้อจำกัดของ refresh token**: การ restart บังคับให้ผู้ใช้เชื่อมต่อใหม่ ให้ restart ในช่วง maintenance

## ✅ รายการตรวจสอบความปลอดภัย

| # | รายการ | ทำแล้ว |
|---|---|---|
| 1 | พอร์ต MCP เข้าถึงไม่ได้จากภายนอก reverse proxy | ☐ |
| 2 | TLS บน proxy; certificate จาก CA ภายในหรือสาธารณะ | ☐ |
| 3 | เปิด OAuth สำหรับการติดตั้งที่มีผู้ใช้มากกว่าหนึ่งคน | ☐ |
| 4 | ตั้ง `oauth.allowed_redirect_uri_hosts` เป็น host ของ MCP เท่านั้น | ☐ |
| 5 | RSA private key เก็บด้วยสิทธิ์ 600 หรือใน secrets manager | ☐ |
| 6 | service identity มี site role และสิทธิ์ data source ต่ำสุด | ☐ |
| 7 | `EXCLUDE_TOOLS=pulse` และไม่เปิด tool ที่เขียน/admin ให้ instance ของนักวิเคราะห์ | ☐ |
| 8 | จำกัดขอบเขต tool ไว้ที่ project, tag หรือ data source ที่ certify แล้ว | ☐ |
| 9 | ทดสอบ RLS โดยล็อกอินด้วยผู้ใช้สองคนที่มีสิทธิ์ต่างกัน | ☐ |
| 10 | เปิด server logging และส่งต่อ; เก็บ audit log ของ portal ตามนโยบาย | ☐ |
| 11 | ทบทวน DPA ของผู้ให้บริการ LLM; บันทึกการจัดชั้นข้อมูล | ☐ |
| 12 | ระบุเวอร์ชันตายตัว; เขียนขั้นตอนอัปเกรดและ rollback | ☐ |
| 13 | ทดสอบขั้นตอน break-glass แล้ว | ☐ |
| 14 | อบรมผู้ใช้ให้ตรวจตัวเลขกับ dashboard | ☐ |

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🛡️ **[แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md)**
8. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](08-faq-glossary.md)
9. 🔗 [เอกสารอ้างอิง](09-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md) · [ถัดไป: คำถามที่พบบ่อยและอภิธานศัพท์ ▶](08-faq-glossary.md) · [🇺🇸 English](../en/07-best-practices.md)

<sub>ส่วนที่ 7 จาก 9 · Created by The Narit Lab</sub>
