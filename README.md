# Dự án Thương Mại Điện Tử - Bán Đồ Handmade (Nhóm 5.1)

## 1. Giới thiệu
Dự án website thương mại điện tử chuyên cung cấp và bán các sản phẩm handmade.

## 2. Công nghệ sử dụng
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Java Spring Boot 2.7.x (Java 11)
- **Database:** MySQL
- **Quản lý source code:** Git & GitHub

## 3. Cấu trúc thư mục dự án
Để tránh conflict và dễ quản lý, dự án chia làm 2 phần (khuyên dùng):
```text
TMDT_Nhom5.1_handmade/
│
├── frontend/               # (Đổi tên từ folder Handmade hiện tại)
│   ├── index.html          
│   ├── assets/             
│   ├── pages/              
│   └── components/         
│
├── backend/                # Server & API (Tạo folder này và đưa code Spring Boot vào)
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── README.md               # Thông tin dự án
└── CONVENTIONS.md          # Quy tắc làm việc nhóm
```
*Lưu ý: Bạn nên tạo 2 thư mục `frontend` và `backend`, sau đó di chuyển các file tương ứng vào để source code được sạch sẽ.*

## 4. Hướng dẫn chạy dự án
### Backend
1. Mở thư mục `backend` bằng IntelliJ IDEA.
2. Cấu hình Database kết nối MySQL trong file `src/main/resources/application.properties`.
3. Chạy class chứa hàm `main` (có `@SpringBootApplication`).

### Frontend
1. Cài đặt VS Code.
2. Cài extension **Live Server**.
3. Mở folder `frontend`, click chuột phải vào `index.html` (hoặc các file HTML khác) và chọn "Open with Live Server".