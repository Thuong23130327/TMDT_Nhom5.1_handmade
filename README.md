# Dự Án Thương Mại Điện Tử Đồ Handmade — AuraCraft (Nhóm 5.1)

## 📌 Giới Thiệu Dự Án
Hệ thống website thương mại điện tử chuyên biệt dành cho các sản phẩm thủ công nghệ thuật và tùy biến thiết kế (Charm vòng tay Ý, Thú len móc, Gốm mỹ nghệ...).

👉 **TÀI LIỆU HƯỚNG DẪN DỰ ÁN CHI TIẾT TỪ A ĐẾN Z (MASTER GUIDE):**  
Xem ngay file **[HUONG_DAN_FULLSTACK_AURACRAFT.md](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/HUONG_DAN_FULLSTACK_AURACRAFT.md)** — Bao gồm:
1. Thống nhất phiên bản công nghệ chuẩn (JDK 11, Spring Boot 2.7.18, MySQL 8.x).
2. Hướng dẫn cài đặt WampServer, CSDL và chạy dự án từ A - Z.
3. Bảng phân chia 4 module Fullstack cho 4 thành viên.
4. Quy tắc Git và chuẩn API `ApiResponse`.
5. Phân tích chi tiết flow code & hướng dẫn ví dụ mẫu (Admin Users).
6. Các lưu ý quan trọng tránh lỗi khi code.

---

## 🛠 Công Nghệ Sử Dụng
- **Frontend:** HTML5, CSS3, JavaScript ES6+ (Fetch API).
- **Backend:** Java Spring Boot 2.7.18 (Java 11, Spring Data JPA, Lombok).
- **Database:** MySQL 8.x (WampServer 64-bit, port 3306, DB `auracraft_db`).
- **Quản lý mã nguồn:** Git & GitHub (nhánh chung `develop`, nhánh riêng `thuong`, `yen`, `phong`, `phat`).

---

## 📂 Cấu Trúc Dự Án
```text
TMDT_Nhom5.1_handmade/
│
├── frontend/                              # Giao diện Client (HTML/CSS/JS)
│   ├── index.html                         # Trang chủ
│   ├── pages/                             # 28 trang giao diện cho Khách, Thợ, Admin
│   ├── assets/                            # CSS, JS, hình ảnh sản phẩm
│   └── components/                        # Header, Footer, Sidebar dùng chung
│
├── backend/                               # Máy chủ API (Spring Boot)
│   ├── src/main/java/com/example/Handmade/
│   │   ├── config/WebConfig.java          # Cấu hình CORS
│   │   ├── model/                         # Entity JPA (User, Product, Order...)
│   │   ├── repository/                    # Giao tiếp CSDL (UserRepository...)
│   │   ├── dto/                           # ApiResponse, DTOs request/response
│   │   ├── service/                       # Logic nghiệp vụ (AdminUserService...)
│   │   └── controller/                    # REST API (AdminUserController...)
│   └── src/main/resources/
│       ├── application.properties         # Cấu hình kết nối MySQL và Hibernate
│       └── data.sql                       # Dữ liệu hạt giống khởi tạo
│
├── DATABASE_SCHEMA_AURACRAFT.sql          # File tạo 14 bảng MySQL và dữ liệu mẫu
├── HUONG_DAN_FULLSTACK_AURACRAFT.md       # CẨM NANG MASTER TOÀN TẬP CHO CẢ NHÓM
└── README.md                              # Giới thiệu dự án
```

---

## 🚀 Khởi Chạy Nhanh Dự Án
1. **Khởi động MySQL:** Bật WampServer (đảm bảo icon W màu xanh lá, cổng 3306). Import file `DATABASE_SCHEMA_AURACRAFT.sql` vào database `auracraft_db`.
2. **Khởi động Backend:** Mở thư mục `backend` bằng IntelliJ IDEA (SDK 11) ➔ Run `HandmadeApplication.java` ➔ Chạy tại cổng `http://localhost:8080`.
3. **Mở Frontend:** Mở `frontend/pages/admin-users.html` bằng Live Server (port 5500) hoặc bấm biểu tượng Chrome trong IntelliJ ➔ Xem ngay dữ liệu live từ MySQL!