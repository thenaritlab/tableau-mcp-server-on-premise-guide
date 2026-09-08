[🏠 หน้าแรก](../../README.md) · [◀ ก่อนหน้า: แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md) · [ถัดไป: เอกสารอ้างอิง ▶](09-references.md) · [🇺🇸 English](../en/08-faq-glossary.md)

---

# ❓ คำถามที่พบบ่อยและอภิธานศัพท์

`ส่วนที่ 8 จาก 9`

## คำถามที่พบบ่อย

<details><summary>ผู้ให้บริการ AI เห็นฐานข้อมูลของฉันไหม</summary>

ไม่เห็น โมเดลได้รับเฉพาะสิ่งที่ Tableau MCP ส่งกลับจากการเรียก tool: metadata และผล query แบบ aggregate ของเนื้อหาที่ตัวตนที่ล็อกอินเข้าถึงได้ โมเดลไม่เคยติดต่อฐานข้อมูลของคุณ แต่ผลลัพธ์เหล่านั้นออกจากเครือข่ายของคุณ เว้นแต่โฮสต์โมเดลเอง

</details>

<details><summary>ต้องมี Tableau Cloud หรือ Tableau+ ไหม</summary>

ไม่ต้อง Tableau MCP เป็น open source และใช้กับ Tableau Server ได้ Tableau Cloud มีบริการ MCP แบบโฮสต์ให้และ tool ของ Pulse เพิ่มเติม บน Server ให้ exclude group `pulse`

</details>

<details><summary>ต้องใช้ Tableau Server เวอร์ชันไหน</summary>

เวอร์ชันที่ยัง support ใดก็ได้สำหรับ PAT หรือ Direct Trust ส่วน OAuth (ยืนยันตัวตนรายบุคคลบน HTTP transport) ต้องใช้ 2025.3 ขึ้นไป

</details>

<details><summary>Viewer ใช้ได้ไหม</summary>

Viewer อ่าน view ได้ (`get-view-data`, `get-view-image`) หากมีสิทธิ์ การ query published data source ต้องมีสิทธิ์ "Connect" และ "API access" ซึ่งปกติให้กับ Explorer และ Creator

</details>

<details><summary>ทำไม ChatGPT บอกว่าเข้าถึง server ของฉันไม่ได้</summary>

ChatGPT รันบนคลาวด์ของ OpenAI มองไม่เห็น `127.0.0.1` หรือชื่อเครื่องภายใน ต้องใช้การติดตั้งแบบ HTTP บน HTTPS URL สาธารณะพร้อม OAuth สำหรับเดโมใช้ tunnel ได้ สำหรับ production ใช้ reverse proxy ใน DMZ ของคุณ

</details>

<details><summary>สองคนใช้ PAT เดียวกันได้ไหม</summary>

ทางเทคนิครันได้ แต่ PAT ไม่ปลอดภัยเมื่อใช้พร้อมกัน และทุกคนกลายเป็นตัวตนเดียว ซึ่งทำให้ RLS พังและอาจขัดกับเงื่อนไขลิขสิทธิ์ ให้ใช้ OAuth

</details>

<details><summary>Row-level security ทำงานไหม</summary>

ทำงาน เมื่อ Tableau เห็นผู้ใช้ที่ถูกต้อง ใช้ OAuth จะอัตโนมัติ ใช้ Direct Trust ผู้ใช้คือค่าที่ใส่ใน `JWT_SUB_CLAIM` ใช้ PAT ผู้ใช้คือเจ้าของ PAT

</details>

<details><summary>หนึ่ง query ใช้ token เท่าไร</summary>

การแสดงรายการฟิลด์ของ data source ที่กว้างอาจใช้ 2–5k token ผล aggregate เล็กๆ ใช้ไม่กี่ร้อย การวิเคราะห์แบบ agentic ห้าขั้นโดยทั่วไปใช้ 20–40k token จำกัดขอบเขต tool และ data source เพื่อคุมค่านี้

</details>

<details><summary>AI แก้ไขอะไรบน server ได้ไหม</summary>

บาง tool สั่ง refresh extract หรือสร้างรายงาน admin ได้ สำหรับ instance ที่ให้นักวิเคราะห์ใช้ ให้ exclude group เหล่านั้นด้วย `INCLUDE_TOOLS=datasource`

</details>

<details><summary>แล้ว Tableau Agent กับ Tableau Next ล่ะ</summary>

Tableau Agent คือผู้ช่วยในตัวผลิตภัณฑ์ของ Tableau (มีบน Server ตั้งแต่ 2025.3) Tableau MCP มีไว้นำข้อมูล Tableau ออกไปใช้ในเครื่องมือ AI *ภายนอก* และแอปที่สร้างเอง ทั้งสองเสริมกัน

</details>

## อภิธานศัพท์

| คำศัพท์ | ไทย | English |
|---|---|---|
| MCP | โปรโตคอลมาตรฐานเปิดให้ AI client เรียกใช้เครื่องมือภายนอก | Model Context Protocol – an open standard for AI clients to call external tools |
| MCP host / client | แอป AI ที่เรียกเครื่องมือ (Claude Desktop, ChatGPT…) | The AI application that calls tools |
| MCP server | โปรแกรมที่เปิดเครื่องมือให้เรียก ในที่นี้คือ Tableau MCP | The program exposing tools; here, Tableau MCP |
| Tool | ฟังก์ชันที่มีชื่อและ JSON schema ให้โมเดลเรียก | A named function with a JSON schema the model can call |
| stdio | การเชื่อมต่อแบบ client เปิดโปรเซส server เองบนเครื่องเดียวกัน | Transport where the client launches the server as a child process |
| Streamable HTTP | การเชื่อมต่อผ่าน HTTP สำหรับ MCP server ที่ใช้ร่วมกันหรืออยู่ไกล | Transport over HTTP for shared, remote MCP servers |
| PAT | โทเคนส่วนบุคคลอายุยาวที่เข้าสู่ระบบแทนผู้ใช้หนึ่งคน | Personal Access Token |
| Connected App | ฟีเจอร์ของ Tableau ที่เชื่อถือ JWT ที่ลงนามด้วย secret ที่แชร์กัน (Direct Trust) หรือ IdP ภายนอก (OAuth 2.0 Trust) | Tableau feature that trusts signed JWTs |
| Direct Trust | โหมด Connected App ที่ Tableau แชร์ secret กับแอปของคุณ | Connected App mode with a shared secret |
| JWT | โทเคนที่ลงนามซึ่งระบุผู้ใช้ (`sub`) และสิทธิ์ | JSON Web Token |
| JWE | โทเคนที่เข้ารหัสซึ่งใช้โดย OAuth server ในตัวของ Tableau MCP | JSON Web Encryption |
| OAuth 2.1 | กระบวนการอนุญาตที่ผู้ใช้ล็อกอินแล้ว client ได้รับ access/refresh token | Authorisation flow |
| VDS | API ของ Tableau สำหรับรัน query กับ published data source | VizQL Data Service |
| Published data source | แหล่งข้อมูลบน server ที่มีสิทธิ์ สูตรคำนวณ และ RLS ของตัวเอง | A data source on the server with its own permissions |
| RLS | การจำกัดข้อมูลระดับแถวตามผู้ใช้ | Row-level security |
| LUID | รหัสประจำวัตถุ (GUID) ของ Tableau | Locally unique identifier |
| Tool scoping | ตัวแปรสภาพแวดล้อมที่จำกัด project, tag, data source หรือ workbook ที่ tool เข้าถึงได้ | Env vars restricting what tools may touch |
| Agentic loop | วงจรที่โมเดลเรียกเครื่องมือซ้ำจนกว่าจะตอบได้ | Model calls tools repeatedly until it can answer |
| UBL | การคิดค่าลิขสิทธิ์ตามการใช้งาน | Usage-based licensing |

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md)
8. ❓ **[คำถามที่พบบ่อยและอภิธานศัพท์](08-faq-glossary.md)**
9. 🔗 [เอกสารอ้างอิง](09-references.md)

</details>

[🏠 หน้าแรก](../../README.md) · [◀ ก่อนหน้า: แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](07-best-practices.md) · [ถัดไป: เอกสารอ้างอิง ▶](09-references.md) · [🇺🇸 English](../en/08-faq-glossary.md)

<sub>ส่วนที่ 8 จาก 9 · Created by The Narit Lab</sub>
