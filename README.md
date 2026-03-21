# CPR Gifted Program Database

ระบบบริหารจัดการฐานข้อมูลนักเรียนและคะแนนสอบสำหรับโปรแกรม Gifted โรงเรียนจตุรพักตรพิมานรัชดาภิเษก

## คุณสมบัติเด่น
- **ระบบล็อกอิน:** รองรับ 3 สถานะ (Admin, Teacher, Student)
- **ตารางคะแนน:** แสดงคะแนนสอบแยกรายวิชา พร้อมระบบเปรียบเทียบค่าเฉลี่ยห้อง (Trend Indicators)
- **สรุปผลการเรียน:** แสดงคะแนนเฉลี่ยแยกตามรายวิชาในรูปแบบการ์ดสรุปผล
- **ระบบจัดการข้อมูล:** รองรับการอัปโหลดไฟล์ตารางคะแนน (Excel) และการส่งออกรายงาน (PDF)
- **คลังความรู้:** ระบบแชร์ไฟล์ประกอบการเรียนการสอนจาก Google Drive

## การติดตั้งและใช้งาน (Local Development)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. ตั้งค่า Environment Variables:
   สร้างไฟล์ `.env.local` และกำหนดค่าดังนี้:
   ```env
   NEXT_PUBLIC_GAS_URL=... (URL ของ Google Apps Script)
   NEXT_PUBLIC_DRIVE_FOLDER_ID=... (ID ของโฟลเดอร์ Google Drive)
   ```

3. รันโปรเจกต์:
   ```bash
   npm run dev
   ```

## การ Deployment

แนะนำให้ทำการ Deploy ผ่าน **Vercel** โดยมีขั้นตอนดังนี้:
1. อัปโหลดโค้ดขึ้น GitHub
2. เชื่อมต่อ Repository กับ Vercel
3. ตั้งค่า Environment Variables ใน Vercel Dashboard

---
พัฒนาโดย CPR Gifted Program Team
