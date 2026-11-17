# Dự Án Thương Mại Điện Tử Đồ Thủ Công Nghệ Thuật — AuraCraft (Nhóm 5.1)

## 📌 Giới Thiệu Dự Án
Hệ thống sàn thương mại điện tử chuyên biệt dành cho các sản phẩm thủ công nghệ thuật và tùy biến thiết kế (Charm vòng tay Ý, Thú len móc, Trang sức bạc 925 & đá quý, Gốm mỹ nghệ Bát Tràng...).

Dự án triển khai trọn vẹn **26 chức năng nghiệp vụ**, bao gồm các tính năng đột phá:
- Công cụ **Custom đồ handmade 2D trực tiếp trên web cập nhật báo giá tức thời**.
- **Chợ báo giá (Request for Quote):** Người mua đăng mẫu cần làm, các nghệ nhân tham gia đấu thầu báo giá.
- **AI gợi ý mua sắm thông minh:** Gợi ý mua kèm (Trích luật Apriori) và Gợi ý sản phẩm tương tự (Độ tương đồng Cosine).
- **Thanh toán trực tuyến VNPay Sandbox:** Bảo mật bằng chữ ký số HMAC-SHA512.
- **Báo cáo tài chính Admin trực quan:** Biểu đồ cột lọc theo khoảng thời gian tùy chọn và Biểu đồ tròn tỷ trọng danh mục.

---

## 📚 BỘ TÀI LIỆU DỰ ÁN CHO CẢ NHÓM (DOCUMENTATION)

1. **[Tài liệu Đặc tả Yêu cầu Phần mềm (SRS - 26 chức năng)](TAI_LIEU_SRS_AURACRAFT.md):**
   - Đặc tả chi tiết 26 chức năng từ FR-01 đến FR-26 chia làm 6 cụm phân hệ.
   - Các yêu cầu phi chức năng (NFR-01 đến NFR-05): Bảo mật JWT/BCrypt, ACID Transaction, Indexing hiệu năng, Responsive UX.
   - Tài khoản mẫu để kiểm thử hệ thống (Mật khẩu mặc định: `123456`).
   - Dùng để làm nội dung Báo cáo Đồ án nộp cho Giảng viên.

2. **[Cẩm nang Phát triển & Luồng Code cho Nhóm (Developer Guide)](DOCS_DEVELOPER_GUIDE.md):**
   - Hướng dẫn cài đặt môi trường (JDK 11, Spring Boot 2.7.18, MySQL).
   - Bản đồ luồng code (Code Flow) chi tiết từng bước cho cả 26 tính năng.
   - Bảng phân công nhiệm vụ cụ thể cho 5 thành viên trong nhóm.
   - Quy tắc phối hợp trên Git để không bị conflict mã nguồn.

3. **[Kịch bản Thuyết trình & Demo Đồ án](KICH_BAN_DEMO_AURA_CRAFT.md):**
   - Kịch bản demo từng bước để trình bày trước lớp và hội đồng bảo vệ đồ án.

---

## 🛠 Công Nghệ Sử Dụng
- **Frontend:** HTML5, CSS3, JavaScript ES6+ (kết hợp kiến trúc Thymeleaf Layout).
- **Backend:** Java Spring Boot 2.7.18 (Java 11, Spring Security, Spring Data JPA, JavaMailSender, Lombok).
- **Database:** MySQL 8.x (Hỗ trợ UTF-8mb4, database `auracraft_db`).
- **Thanh toán:** Cổng thanh toán trực tuyến VNPay Sandbox (HMAC-SHA512).
- **Email Service:** Gmail SMTP tích hợp gửi OTP khôi phục tài khoản.

---

## 🚀 Khởi Chạy Nhanh Dự Án
1. **Khởi động MySQL:** Đảm bảo MySQL chạy tại cổng 3306, tạo database rỗng `auracraft_db`.
2. **Khởi động Backend:** 
   - Mở thư mục `backend` bằng IntelliJ IDEA (chọn JDK 11).
   - Chạy file `HandmadeApplication.java`.
   - Spring Boot sẽ tự nạp dữ liệu mẫu từ `data.sql` vào MySQL.
   - Cổng chạy: `http://localhost:8080`.
3. **Mở Frontend:**
   - Mở `frontend/index.html` hoặc `frontend/pages/login.html` bằng trình duyệt (hoặc qua built-in server của IntelliJ).
