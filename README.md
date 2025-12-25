# Cow Register MVC (Exit Exam - ข้อ 2)

ทำตามโจทย์ข้อที่ 2:  
- เลือกสีวัว (White/Brown/Pink) แล้วเปิดหน้าลงทะเบียนแยก View ตามสี  
- ตรวจสอบ input ตามเงื่อนไขของแต่ละสี  
- ฟาร์ม 1 แห่งรับวัวได้ “สีเดียว” เท่านั้น  
- ลงทะเบียนเสร็จ แสดง “จำนวนวัวและสีของวัวในแต่ละฟาร์ม” แล้วกลับหน้าแรกได้

เทคโนโลยี: Node.js + Express + EJS + MySQL (MVC)

---

## 1) โครงสร้าง MVC

- `models/`
  - `farmModel.js` จัดการข้อมูลตาราง farms (อ่าน/อัปเดตสี/สรุปจำนวน)
  - `cowModel.js` จัดการข้อมูลตาราง cows (เช็ค/อ่าน/เพิ่มข้อมูลวัว)
- `controllers/`
  - `cowController.js` รับ request, validate, เรียก model, และ render view / ส่ง JSON
- `views/`
  - `index.ejs` หน้าเลือกสี
  - `register_white.ejs`, `register_brown.ejs`, `register_pink.ejs` หน้า form แยกสี
  - `summary.ejs` หน้าสรุปฟาร์ม
- `routes/`
  - `web.js` route สำหรับหน้าเว็บ
  - `api.js` route สำหรับทดสอบ API (JSON)
- `config/db.js` connection pool (mysql2)
- `sql/schema.sql`, `sql/seed.sql` สคริปต์สร้าง/seed DB (อ้างอิงจากไฟล์ที่คุณให้มา)

---

## 2) Setup Database

> คุณบอกว่าสร้าง DB แล้ว: ถ้าสร้างแล้ว “ข้าม” ได้  
แต่ถ้าจะรันใหม่:

```sql
SOURCE sql/schema.sql;
SOURCE sql/seed.sql;
```

ฐานข้อมูลที่ใช้คือ `cow_register`

---

## 3) Run Project

1) ติดตั้งแพ็กเกจ
```bash
npm install
```

2) ตั้งค่า env
```bash
cp .env.example .env
# แก้ DB_HOST/DB_USER/DB_PASSWORD/DB_NAME ให้ถูกกับเครื่องคุณ
```

3) รัน
```bash
npm start
# หรือโหมด dev
npm run dev
```

เข้าเว็บ: http://localhost:3000

---

## 4) วิธีทดสอบการทำงาน (GUI)

1) ไปหน้า `/` เลือกสี  
2) ใส่ข้อมูลตามฟอร์ม
- ทุกสีต้องกรอก: `cow_id` (8 หลัก ไม่ขึ้นต้นด้วย 0) + `farm_id` (1-9)
- White: `age_years` 0-10 และ `age_months` 0-11 (จำนวนเต็ม)
- Brown: `mother_id` ต้องเป็น cow_id ที่มีอยู่แล้ว (ลงทะเบียนแม่ก่อนลูก)
- Pink: `owner_firstName`, `owner_lastName` ต้องเป็น a-z ตัวเล็ก ยาวไม่เกิน 8

3) กดลงทะเบียน → ระบบจะแสดงหน้า Summary (จำนวนวัวในฟาร์ม)

กรณีทดสอบเงื่อนไข “ฟาร์มรับได้สีเดียว”:
- ลงทะเบียนวัวสี White เข้า farm 1
- ลองลงทะเบียนวัวสี Pink เข้า farm 1 อีกครั้ง → จะถูกปฏิเสธและแจ้งข้อความ

---

## 5) วิธีทดสอบ API (Postman / curl)

### 5.1 ดูสรุปฟาร์ม
```bash
curl http://localhost:3000/api/farms/summary
```

### 5.2 ลงทะเบียนวัวสีขาว (White)
```bash
curl -X POST http://localhost:3000/api/cows/white \
  -H "Content-Type: application/json" \
  -d '{"cow_id":"12345678","farm_id":"1","age_years":2,"age_months":5}'
```

### 5.3 ลงทะเบียนวัวสีน้ำตาล (Brown) (ต้องมีแม่ก่อน)
1) ลงทะเบียนแม่ (ตัวอย่างใช้สีขาวเป็นแม่)
```bash
curl -X POST http://localhost:3000/api/cows/white \
  -H "Content-Type: application/json" \
  -d '{"cow_id":"87654321","farm_id":"2","age_years":3,"age_months":1}'
```
2) ลงทะเบียนลูกสีน้ำตาล โดยอ้างแม่
```bash
curl -X POST http://localhost:3000/api/cows/brown \
  -H "Content-Type: application/json" \
  -d '{"cow_id":"23456789","farm_id":"2","mother_id":"87654321"}'
```

### 5.4 ลงทะเบียนวัวสีชมพู (Pink)
```bash
curl -X POST http://localhost:3000/api/cows/pink \
  -H "Content-Type: application/json" \
  -d '{"cow_id":"34567890","farm_id":"3","owner_firstName":"john","owner_lastName":"doe"}'
```

---

## 6) หมายเหตุเรื่องภาพหน้าจอ (ตามโจทย์)
เวลาเตรียมส่ง ให้จับภาพอย่างน้อย 3 รูป เช่น
1) หน้าเลือกสี
2) หน้าลงทะเบียนสีใดสีหนึ่ง
3) หน้าสรุปฟาร์ม หรือภาพ error ตอนฟาร์มสีไม่ตรง

