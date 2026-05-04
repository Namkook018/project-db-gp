# TCAS Score Manager — GAS Web App

ระบบจัดเก็บและวิเคราะห์คะแนนสอบ TCAS (TGAT · TPAT · A-Level · NETSAT)  
พร้อม Admin Dashboard — ขับเคลื่อนด้วย Google Apps Script + Google Sheets

---

## ✨ ฟีเจอร์

| นักเรียน | แอดมิน |
|----------|--------|
| บันทึกคะแนน TGAT / TPAT / A-Level | Dashboard สรุปภาพรวมชั้นเรียน |
| NETSAT สูงสุด 4 รอบ + เลือก best อัตโนมัติ | กราฟกระจาย & ค่าเฉลี่ยรายวิชา |
| แสดง Overview คะแนนรวม | Top 10 Leaderboard |
| ข้อมูลบันทึกใน Google Sheets | CRUD นักเรียน (เพิ่ม / แก้ไข / ลบ) |
| ใช้งานได้ทั้ง Desktop & Mobile | Export CSV · เปิด Spreadsheet โดยตรง |

---

## 📁 โครงสร้างไฟล์

```
TCAS/
├── Code.gs          ← Google Apps Script backend
├── index.html       ← Frontend ทั้งหมด (student + admin)
└── appsscript.json  ← GAS project manifest
```

---

## 🚀 วิธี Deploy บน Google Apps Script

### ขั้นตอนที่ 1 — สร้าง Project ใหม่

1. เปิด [script.google.com](https://script.google.com)
2. คลิก **"New project"** (มุมซ้ายบน)
3. ตั้งชื่อ project เช่น `TCAS Score Manager`

---

### ขั้นตอนที่ 2 — วางโค้ด

**ไฟล์ Code.gs**
1. ใน editor จะมี `Code.gs` ให้อยู่แล้ว
2. ลบโค้ดเดิมออกทั้งหมด แล้ว **copy** เนื้อหาจาก `TCAS/Code.gs` วางแทน
3. บันทึก (Ctrl+S)

**ไฟล์ index.html**
1. คลิก **➕** ข้างๆ Files → เลือก **"HTML"**
2. ตั้งชื่อว่า `index` (ไม่ต้องพิมพ์ `.html` — GAS เติมให้)
3. ลบเนื้อหาเดิมออก แล้ว **copy** เนื้อหาจาก `TCAS/index.html` วางแทน
4. บันทึก (Ctrl+S)

> **หมายเหตุ**: ชื่อต้องเป็น `index` ตรงๆ เพราะ `Code.gs` เรียก `createHtmlOutputFromFile('index')`

---

### ขั้นตอนที่ 3 — เปลี่ยนรหัสผ่าน Admin (แนะนำ)

ใน `Code.gs` บรรทัดแรก:
```javascript
const ADMIN_PW = 'tcas2025'; // ← เปลี่ยนที่นี่
```

---

### ขั้นตอนที่ 4 — Deploy เป็น Web App

1. คลิก **"Deploy"** (มุมขวาบน) → **"New deployment"**
2. คลิกไอคอน ⚙️ ข้าง **"Select type"** → เลือก **"Web app"**
3. ตั้งค่าดังนี้:

   | ฟิลด์ | ค่าที่ต้องเลือก |
   |-------|----------------|
   | Description | `v1` (หรืออะไรก็ได้) |
   | Execute as | **Me** |
   | Who has access | **Anyone** |

4. คลิก **"Deploy"**
5. อนุญาต permissions ที่ Google ขอ (Sheets, Script Properties)
6. **Copy URL** ที่ได้ — นี่คือ URL ของ Web App

---

### ขั้นตอนที่ 5 — ทดสอบ

เปิด URL ที่ได้ในเบราว์เซอร์ → ควรเห็นหน้า Landing ของ TCAS Score Manager

ครั้งแรกที่มีการบันทึกข้อมูล GAS จะ **สร้าง Google Sheet ใหม่อัตโนมัติ** ชื่อว่า `TCAS Score Manager — Data` ใน Google Drive ของคุณ

---

## 🔄 การอัปเดต (Re-deploy)

เมื่อแก้ไขโค้ดแล้วต้องการ deploy เวอร์ชันใหม่:

1. Deploy → **"Manage deployments"**
2. คลิกดินสอ ✏️ ข้างๆ deployment เดิม
3. Version → เลือก **"New version"**
4. คลิก **"Deploy"**

> URL จะยังเป็นเดิม ไม่ต้องแจ้งนักเรียนใหม่

---

## 🗄️ โครงสร้าง Google Sheet

Sheet ชื่อ `Students` มีคอลัมน์ดังนี้:

| id | name | scores | nscores | created_at | updated_at |
|----|------|--------|---------|------------|------------|
| timestamp | ชื่อนักเรียน | JSON คะแนน TGAT/TPAT/A-Level | JSON คะแนน NETSAT 4 รอบ | ISO datetime | ISO datetime |

ตัวอย่าง `scores`:
```json
{"tgat1": 120, "tgat2": 90, "tgat3": 60, "tpat1": 200, "alevel_math1": 100}
```

ตัวอย่าง `nscores`:
```json
{
  "0": {"netsat_math": 85, "netsat_sci": 70},
  "1": {"netsat_math": 90, "netsat_sci": 75},
  "2": {},
  "3": {}
}
```

---

## 🔒 ความปลอดภัย

- รหัสผ่าน Admin ถูก verify ใน server-side (Code.gs) เท่านั้น
- เปลี่ยน `ADMIN_PW` ใน Code.gs ก่อน deploy จริง
- ข้อมูลทั้งหมดอยู่ใน Google Sheet ของเจ้าของ account

---

## 💡 Tips

- **Local testing**: เปิด `index.html` ตรงๆ ในเบราว์เซอร์ได้เลย — จะใช้ `localStorage` แทน GAS โดยอัตโนมัติ
- **Import ข้อมูล**: Admin สามารถ Import JSON หรือ paste ข้อมูลจาก localStorage version ได้
- **Export**: Admin → ปุ่ม Export CSV สามารถ export ข้อมูลนักเรียนทั้งหมดได้
