# Cow register


- เลือกสีวัว (White/Brown/Pink) แล้วเปิดหน้าลงทะเบียนแยก View ตามสี  
- ตรวจสอบ input ตามเงื่อนไขของแต่ละสี  
- ฟาร์ม 1 แห่งรับวัวได้ “สีเดียว” เท่านั้น  
- ลงทะเบียนเสร็จ แสดง “จำนวนวัวและสีของวัวในแต่ละฟาร์ม” แล้วกลับหน้าแรกได้

## Tech Stack

- Backend : Node.js
- Frontend : EJS, HTML, CSS
- Web Service : Express.js
- Database : MySQL
- Testing : Postman



## Project Structure

```
cow-register-mvc/
├── config/
│   └── db.js     
├── controllers/
│   └── cowController.js  
├── models/
│   ├── cowModel.js        
│   └── farmModel.js  
├── routes/
│   ├── api.js
│   └── web.js
├── routes/
│   ├── schema.sql
│   └── seed.sql
├── views/
│   ├── paritials/
│   │   ├── footer.ejs   
│   │   └── header.ejs   
│   ├── register_brown.ejs
│   ├── register_pink.ejs
│   ├── register_white.ejs
│   └── summary.ejs
├── README.md               
└── app.js           
```


## ER Diagram

```mermaid
erDiagram
    FARMS ||--o{ COWS : "has"
    COWS  ||--o{ COWS : "mother_of"

    FARMS {
      int farm_id PK
      enum color "White|Brown|Pink (nullable)"
    }

    COWS {
      char cow_id PK "8 chars"
      enum color "White|Brown|Pink"
      int  farm_id FK
      int  age_years "nullable"
      int  age_months "nullable"
      char mother_id FK "nullable -> COWS.cow_id"
      varchar owner_firstName "nullable"
      varchar owner_lastName "nullable"
    }
```


## Use cases diagram

![หน้าเลือกสี](docs/images/use-cases.png)