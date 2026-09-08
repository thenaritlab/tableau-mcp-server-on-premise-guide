[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md) · [ถัดไป: ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP ▶](08-enterprise-proposal.md) · [🇺🇸 English](../en/07-permissions-security.md)

---

# 🔐 สิทธิ์ บทบาท และลิขสิทธิ์

`ส่วนที่ 7 จาก 11`

> Tableau MCP ไม่มีระบบความปลอดภัยของตัวเอง แต่สืบทอดจาก Tableau ทั้งหมด นี่คือจุดแข็งที่สุด แต่จะได้ประโยชน์ก็ต่อเมื่อคุณเข้าใจว่าลิขสิทธิ์ site role สิทธิ์ระดับ project ความสามารถ (capability) ระดับเนื้อหา และ row-level security ซ้อนกันอย่างไร และ MCP tool แต่ละตัวต้องใช้ capability อะไรจริงๆ

## 🧱 ห้าชั้นของการควบคุม

![fig-permission-stack](../assets/diagrams/fig-permission-stack.svg)

*รูปที่ 1 ห้าชั้นระหว่างคำถามของ AI กับข้อมูลหนึ่งแถว Tableau บังคับใช้ชั้น 1–4 ส่วน Tableau MCP เพิ่มชั้นที่ 5 เป็นรั้วอีกชั้น*

## 🪪 ชั้นที่ 1 – ลิขสิทธิ์และ site role

ประเภทลิขสิทธิ์คือสิ่งที่คุณซื้อ ส่วน **site role** คือสิ่งที่ผู้ดูแลกำหนดให้ผู้ใช้บน site แต่ละแห่ง ภายในขอบเขตของลิขสิทธิ์ site role คือ *เพดาน*: สิทธิ์ใดๆ ไม่สามารถให้มากกว่าที่ role อนุญาต

| Site role | ลิขสิทธิ์ | ดูเนื้อหา | query published data source (Connect) | ดาวน์โหลดข้อมูลเต็ม | publish / web edit | ตัวตน AI ที่มักใช้ |
|---|---|---|---|---|---|---|
| Viewer | Viewer | ✅ | ✅ ถ้าได้รับสิทธิ์ | ❌ (เฉพาะสรุป) | ❌ | ผู้จัดการถามผ่าน portal |
| Explorer | Explorer | ✅ | ✅ | ✅ ถ้าได้รับสิทธิ์ | web edit ได้ publish ไม่ได้ | นักวิเคราะห์ใช้ Claude / Gemini สำรวจข้อมูล |
| Explorer (can publish) | Explorer | ✅ | ✅ | ✅ | ✅ | power user ที่สร้าง certified source |
| Creator | Creator | ✅ | ✅ | ✅ | ✅ + Desktop / Prep | ทีมข้อมูล, service identity ของ MCP สำหรับงาน admin |
| Site Administrator Explorer / Creator | Explorer / Creator | ✅ ทั้งหมด | ✅ | ✅ | ✅ | รัน admin tool group (stale content, refresh task) |
| Server Administrator | Creator | ✅ ทุกอย่าง ทุก site | ✅ | ✅ | ✅ | **ห้าม**ใช้เป็นตัวตนของ MCP เด็ดขาด |
| Unlicensed | — | ❌ | ❌ | ❌ | ❌ | AI ไม่ได้อะไรเลย sign-in ล้มเหลว |

> [!NOTE]
> **Viewer กับสิทธิ์ "Connect"**
>
> Viewer ถือ capability *Connect* บน published data source ได้ Tableau ใช้สิทธิ์นี้เพื่อให้ Viewer เปิด workbook ที่สร้างบน source นั้น และมันทำให้ VizQL Data Service (จึงรวมถึง `query-datasource`) รันให้ Viewer ได้ด้วย สิ่งที่ Viewer ทำไม่ได้คือเชื่อมจาก Tableau Desktop และดาวน์โหลดข้อมูลเต็ม ตรวจสัญญาลิขสิทธิ์ก่อนพึ่งพา Viewer สำหรับการ query ผ่าน AI แบบหนัก

> [!IMPORTANT]
> **ตรวจสอบกับเอกสารล่าสุด**
>
> ชื่อ site role และสิ่งที่อนุญาตค่อนข้างนิ่งแต่ไม่ตายตัว Tableau เคยปรับความสามารถของ Viewer มาแล้ว ตรวจกับหน้า "Site roles and permissions" ของเวอร์ชัน server ที่ใช้

## 📁 ชั้นที่ 2 – Project

Project คือโฟลเดอร์ที่เนื้อหาอยู่ การตั้งค่าสองอย่างสำคัญที่สุดสำหรับการเข้าถึงของ AI:

- **View project** – ถ้าผู้ใช้มองไม่เห็น project AI ก็แสดงรายการหรือ query อะไรข้างในไม่ได้ `search-content` และ `list-datasources` จะข้ามไปเงียบๆ
- **Locked permissions (Content Permissions › Locked)** – ทุกรายการสืบทอดกฎสิทธิ์ของ project และเจ้าของแก้ทับไม่ได้ นี่คือการตั้งค่าที่ทำให้ project "AI-ready" เชื่อถือได้: สิ่งที่ทีมข้อมูล certify จะถูกล็อกไว้ตามที่ตั้งเสมอ

โครงสร้างที่แนะนำ:

```text
📁 Certified (locked)            ← published data source สำหรับ AI + dashboard; ทีมข้อมูลเท่านั้นที่ publish
   📁 Sales
   📁 Finance                    ← เฉพาะกลุ่ม finance
   📁 HR (restricted)            ← เฉพาะกลุ่ม HR, บังคับ RLS
📁 Departmental (locked)         ← workbook ของทีมที่สร้างบน certified source
📁 Sandbox (customizable)        ← สำรวจส่วนตัว; อยู่นอกขอบเขต MCP
📁 Admin                         ← รายงาน admin, server admin เท่านั้น
```

## 🔑 ชั้นที่ 3 – Capability ระดับเนื้อหา

สิทธิ์กำหนดให้ **กลุ่ม** (แนะนำ) หรือผู้ใช้ เป็น *Allowed / Denied / Unspecified* ต่อ capability Denied ชนะ Allowed เสมอ ส่วน Unspecified จะถอยไปใช้กฎถัดไปและสุดท้ายคือ "ไม่ได้"

### Capability ของ workbook

| Capability | อนุญาตให้ | MCP tool ที่ต้องใช้ |
|---|---|---|
| View | เห็น workbook และ view | `list-workbooks`, `list-views`, `get-workbook` |
| Filter | เปลี่ยน filter และ parameter | `get-view-data` พร้อม filter, `get-view-image` พร้อม filter |
| Download Image/PDF | export ภาพ view | `get-view-image` |
| Download Summary Data | ข้อมูลรวมเบื้องหลัง view | `get-view-data` (summary) |
| Download Full Data | ข้อมูลระดับแถวเบื้องหลัง view | `get-view-data` เมื่อโมเดลขอข้อมูลดิบ |
| Web Edit, Download Workbook, Overwrite, Move, Delete, Set Permissions | แก้ไขและดูแล | AI แบบอ่านอย่างเดียวไม่ใช้ — deny ให้กลุ่ม AI |

### Capability ของ data source

| Capability | อนุญาตให้ | MCP tool ที่ต้องใช้ |
|---|---|---|
| View | เห็น data source ในรายการ | `list-datasources`, `search-content` |
| Connect | query ได้ (Desktop, web authoring, **VizQL Data Service**) | `list-fields`, `get-datasource-metadata`, `query-datasource` |
| Download Data Source / Save a Copy | ได้ไฟล์ .tdsx | ไม่จำเป็น — deny ให้กลุ่ม AI |
| Overwrite, Delete, Set Permissions | ดูแล | deny ให้กลุ่ม AI |
| (Extract refresh: เจ้าของหรือ project leader) | สั่ง / ตั้งเวลา refresh | `list-extract-refresh-tasks`, tool refresh — เฉพาะ instance ของ admin |

### แม่แบบสิทธิ์สำหรับกลุ่ม AI

| กลุ่ม | วัตถุประสงค์ | Workbook | Data source | Site role |
|---|---|---|---|---|
| `ai-viewers` | ถามคำถามผ่าน portal | View, Filter, Download Summary Data | View, Connect | Viewer |
| `ai-analysts` | สำรวจด้วย Claude / Gemini / VS Code | + Download Full Data, Download Image | View, Connect | Explorer |
| `ai-admins` | งานดูแลระบบด้วย admin tool group | ทั้งหมด | ทั้งหมด | Site Administrator Explorer |
| `svc-mcp-portal` (service) | ตัวตน Direct Trust ของ portal | View, Filter, Download Summary Data | View, Connect | Viewer หรือ Explorer |

ตั้งค่าเหล่านี้บน project *Certified* โดยล็อกสิทธิ์ แล้วทั้ง tree จะตามไปเอง

## 🔒 ชั้นที่ 4 – Row-level security

Capability ตัดสินว่าผู้ใช้ query data source ได้*หรือไม่* RLS ตัดสินว่าได้*แถวไหน* Tableau ใช้ RLS ตามตัวตนที่ MCP server ล็อกอิน ดังนั้นโหมด auth จากบทสถาปัตยกรรมจึงสำคัญ:

| MCP auth | ตัวตนที่ Tableau เห็น | ผลของ RLS |
|---|---|---|
| OAuth | ผู้ใช้จริง | ✅ ถูกต้องรายบุคคล |
| Direct Trust กับ `JWT_SUB_CLAIM={OAUTH_USERNAME}` (รูปแบบ portal) | ผู้ใช้จริง | ✅ ถูกต้องรายบุคคล |
| Direct Trust กับ `JWT_SUB_CLAIM` คงที่ | service user หนึ่งคน | ⚠️ ทุกคนได้แถวของ service user |
| PAT | เจ้าของ PAT | ⚠️ ทุกคนได้แถวของเจ้าของ |

สี่วิธีทำ RLS บน Tableau Server จากง่ายสุดถึงขยายได้มากสุด:

1. **User filter ใน workbook** – `USERNAME()` หรือ `ISMEMBEROF('group')` ใน calculated filter เร็ว แต่อยู่ในแต่ละ workbook; AI ที่ query *data source* โดยตรงจะข้ามมันไป ใช้ได้เฉพาะ use case ที่อิง view
2. **Calculated filter ใน published data source** – ฟังก์ชันเดียวกัน แต่ใส่ที่ data source ทำให้ทุก workbook *และ* ทุกการเรียก `query-datasource` สืบทอดไปด้วย นี่คือขั้นต่ำสำหรับ AI
3. **Join ตาราง entitlement** – ตารางสิทธิ์ (`user`, `region`, `cost_center`) join เข้า data source พร้อม filter `USERNAME() = [user]` รองรับผู้ใช้หลายพันคน จัดการด้วยข้อมูล ไม่ใช่แก้สูตร
4. **Virtual Connection กับ data policy** – กำหนด RLS ครั้งเดียวที่ระดับ connection บังคับใช้กับทุก data source ที่สร้างบนมัน ต้องมี Data Management เป็นคำตอบที่สะอาดที่สุดสำหรับการเข้าถึงของ AI ระดับองค์กร

> [!WARNING]
> **ทดสอบ RLS ด้วยผู้ใช้สองคนก่อน go-live**
>
> ล็อกอิน MCP server ด้วยคนสองคนที่มีสิทธิ์ต่างกันแล้วถามคำถามเดียวกัน ถ้าได้ตัวเลขเท่ากัน แปลว่า RLS ไปไม่ถึงเส้นทางของ AI ตรวจโหมด auth ก่อน แล้วดูว่า filter อยู่ที่ data source ไม่ใช่ workbook

## 🧭 ชั้นที่ 5 – การจำกัดขอบเขตของ Tableau MCP

ตัวแปร `INCLUDE_*` / `EXCLUDE_*` ของ Tableau MCP (การติดตั้ง § 4.2) คือรั้ว*รอบ*สิทธิ์ของ Tableau ช่วยกัน AI ไม่ให้เห็นเนื้อหาที่ทางเทคนิคเห็นได้ — มีประโยชน์ในการกัน Sandbox ออก หรือเปิดเฉพาะ tool `datasource` — แต่ไม่ใช่สิ่งทดแทนสิทธิ์: ผู้ใช้ยังเข้าถึงเนื้อหานั้นผ่านหน้าจอ Tableau ได้อยู่

การจับคู่ที่พบบ่อย:

| MCP instance | `INCLUDE_TOOLS` | `INCLUDE_PROJECT_IDS` / `INCLUDE_TAGS` | ใครเชื่อมต่อ |
|---|---|---|---|
| `mcp-analysts` (พอร์ต 3927) | `datasource,workbook,view` | project Certified · tag `ai-ready` | ai-analysts, ai-viewers ผ่าน OAuth |
| `mcp-portal` (พอร์ต 3928, localhost เท่านั้น) | `datasource` | project Certified | service identity ของ portal |
| `mcp-admin` (พอร์ต 3929) | `admin,workbook,datasource` | (ทั้งหมด) | ai-admins ผ่าน OAuth |

## 🛡️ แนวปฏิบัติที่ดีในการออกแบบความปลอดภัย

### ตัวตน

- หนึ่งตัวตนต่อคน (OAuth) สำหรับทุกอย่างที่โต้ตอบกับผู้ใช้; หนึ่ง service identity ต่อระบบ (portal, agent ตามกำหนดเวลา) พร้อม Connected App ของตัวเอง
- กลุ่ม sync จาก Active Directory / SAML; ไม่กำหนดสิทธิ์ให้ผู้ใช้รายคน
- Site Administrator เฉพาะ instance admin ของ MCP; Server Administrator ไม่ใช้เด็ดขาด

### ข้อมูล

- Certify published data source ที่ AI ใช้ได้ และเพิ่มคำอธิบายฟิลด์ — คำอธิบาย*คือ* prompt ของ AI
- RLS ใน data source หรือ virtual connection ไม่ใช่ใน workbook หรือ system prompt
- จัดชั้นข้อมูล: **Public / Internal / Confidential / Restricted** เฉพาะ Public และ Internal ผ่าน LLM บนคลาวด์; Confidential ต้องใช้โมเดลโฮสต์เองหรือในภูมิภาค; Restricted (PII, เงินเดือน, ข้อมูลสุขภาพ) อยู่นอกขอบเขต MCP ทั้งหมด
- Mask หรือรวมค่าคอลัมน์อ่อนไหวใน certified source (เช่น ช่วงเงินเดือนแทนเงินเดือน)

### เครือข่ายและแพลตฟอร์ม

- MCP bind กับ localhost หลัง TLS reverse proxy ที่มี IP allow-list; แยก instance สำหรับนักวิเคราะห์ portal และ admin
- Secret ใน vault; RSA key สำหรับ OAuth สิทธิ์ 600; หมุนเวียน secret ของ Connected App ทุกไตรมาส
- ระบุเวอร์ชันตายตัว; patch ตามรอบ; ทดสอบอัปเกรดบน site pilot ก่อน

### การควบคุมเฉพาะ AI

- instance อ่านอย่างเดียวสำหรับทุกคนยกเว้น admin: ไม่มี refresh, overwrite, permission tool
- จำกัดรอบ tool และขนาดผลลัพธ์; ปฏิเสธ query ที่คืนเกิน N แถวโดยไม่ aggregate
- system prompt ห้ามเปิดเผย URL, LUID และโทเคน; ตัดออกจากผลลัพธ์ tool ใน portal
- ตระหนักเรื่อง prompt injection: คำอธิบายฟิลด์และชื่อ workbook คือ*อินพุตของโมเดล* — เฉพาะผู้เขียนที่ได้รับการ certify เท่านั้นที่แก้ได้

### Audit และการเฝ้าระวัง

- `http_requests` ของ Tableau Server + file logger ของ MCP + audit log ของ portal เชื่อมกันด้วยผู้ใช้และเวลา
- ทบทวนรายสัปดาห์: ผู้ใช้สูงสุด data source ที่ใช้มากสุด 403 พุ่ง (ช่องว่างสิทธิ์หรือการลองสุ่ม) จำนวนแถวผิดปกติ
- เก็บตามนโยบาย; แจ้งเตือนเมื่อเนื้อหา tag Restricted ปรากฏใน log ของ MCP

### Checklist ก่อน go-live (ทีมความปลอดภัย)

| # | รายการตรวจ | ✓ |
|---|---|---|
| 1 | project Certified ล็อกแล้ว; เฉพาะทีมข้อมูล publish ได้ | ☐ |
| 2 | มีกลุ่ม `ai-*` sync จาก directory และใช้แม่แบบสิทธิ์แล้ว | ☐ |
| 3 | data source ที่เปิดให้ AI ทุกตัวมี View + Connect สำหรับกลุ่มที่ถูกต้องและไม่มีอย่างอื่น | ☐ |
| 4 | RLS ทำใน data source หรือ virtual connection; ทดสอบสองผู้ใช้ผ่านแล้ว | ☐ |
| 5 | โหมด auth ส่งผู้ใช้จริงให้ Tableau (OAuth หรือ `{OAUTH_USERNAME}`) | ☐ |
| 6 | ข้อมูล Restricted ไม่อยู่ในขอบเขต `INCLUDE_*` ใดๆ; ยืนยันด้วยการให้ AI แสดงรายการ data source | ☐ |
| 7 | การจัดชั้นข้อมูลกำหนดว่า instance ใดใช้ LLM endpoint ใด | ☐ |
| 8 | admin tool เฉพาะ instance admin; instance ของนักวิเคราะห์มี `EXCLUDE_TOOLS=pulse,admin` | ☐ |
| 9 | log ไหลเข้า SIEM พร้อมระบุผู้ใช้ | ☐ |
| 10 | มีผู้รับผิดชอบทบทวนสิทธิ์และ secret ทุกไตรมาส | ☐ |

---

<details>
<summary>📚 สารบัญ</summary>

1. 📖 [ภาพรวม](01-overview.md)
2. 🏗️ [สถาปัตยกรรม](02-architecture.md)
3. ✅ [สิ่งที่ต้องเตรียม](03-prerequisites.md)
4. ⚙️ [การติดตั้งและตั้งค่า](04-installation.md)
5. 💡 [5 use case ยอดนิยม](05-use-cases.md)
6. 🖥️ [ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md)
7. 🔐 **[สิทธิ์ บทบาท และลิขสิทธิ์](07-permissions-security.md)**
8. 📈 [ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP](08-enterprise-proposal.md)
9. 🛡️ [แนวปฏิบัติที่ดี การกำกับดูแล และรายการตรวจสอบความปลอดภัย](09-best-practices.md)
10. ❓ [คำถามที่พบบ่อยและอภิธานศัพท์](10-faq-glossary.md)
11. 🔗 [เอกสารอ้างอิง](11-references.md)

</details>

[🏠 หน้าแรก](../../README.th.md) · [◀ ก่อนหน้า: ขั้นสูง: สร้าง Web UI ครอบ Tableau Server](06-web-ui-wrapper.md) · [ถัดไป: ข้อเสนอโครงการ: แพลตฟอร์ม BI + AI Chat สำหรับองค์กรบน Tableau MCP ▶](08-enterprise-proposal.md) · [🇺🇸 English](../en/07-permissions-security.md)

<sub>ส่วนที่ 7 จาก 11 · Created by The Narit Lab</sub>
