# Quy tắc làm việc nhóm (Nhóm 5.1)

Để tránh conflict code và đảm bảo tiến độ, nhóm thống nhất các quy tắc sau:

## 1. Phân công công việc (Nhóm 4 người)
Có 2 cách chia, nhóm nên chọn 1 trong 2:
- **Cách 1 (Chuyên môn hóa - Khuyên dùng):** 2 bạn chuyên làm Frontend (giao diện, gọi API), 2 bạn chuyên làm Backend (Database, viết API xử lý logic).
- **Cách 2 (Cross-functional):** Chia theo chức năng. Mỗi bạn làm từ A-Z (cả HTML và Java) cho 1 chức năng (Ví dụ: Bạn A làm Đăng nhập, Bạn B làm Giỏ hàng...).

**Ưu tiên Tuần 1:**
- Không nên làm quá nhiều. Tập trung vào: Thiết kế Database (ERD), Hoàn thiện giao diện tĩnh (HTML/CSS), API Đăng nhập/Đăng ký. Các chức năng checkout, admin để tuần sau.

## 2. Quy trình làm việc với Git
- **KHÔNG BAO GIỜ** code trực tiếp và push lên nhánh `main`.
- Nhánh `main` chỉ chứa code hoàn chỉnh, không lỗi.
- Nhánh `dev` (hoặc `develop`) dùng để ghép code chung.
- Mỗi khi làm chức năng mới, tạo nhánh mới từ nhánh `dev`. (Ví dụ: `feature/login`, `feature/cart`).
- **Trước khi push / merge:**
  1. Commit code ở nhánh của mình.
  2. Chuyển sang nhánh `dev` và pull code mới nhất về (`git pull origin dev`).
  3. Merge nhánh `dev` vào nhánh của mình để kiểm tra conflict. NẾU CÓ CONFLICT, tự resolve ở máy local.
  4. Mọi thứ OK mới push lên và tạo Pull Request.

## 3. Quy tắc viết Code (Code Convention)
- **Tên biến, tên hàm (Java & JS):** Dùng `camelCase` (Ví dụ: `userName`, `getProductById`).
- **Tên Class (Java):** Dùng `PascalCase` (Ví dụ: `UserController`, `ProductService`).
- **Tên bảng/cột Database:** Dùng `snake_case` (Ví dụ: `user_account`, `created_at`).
- **Tên file HTML/CSS:** Dùng tiếng Anh, chữ thường, gạch ngang (Ví dụ: `product-detail.html`).
- Format code (Alt + Shift + F) trước khi commit.
- Chú thích (Comment) rõ ràng cho các hàm logic phức tạp.
- Sử dụng tiếng Anh cho tên biến, tên hàm.

## 4. Database
- Thống nhất sử dụng MySQL.
- Bắt buộc phải có file `.sql` (hoặc cấu hình tự động generate của Hibernate) lưu trữ lại các query tạo bảng để các thành viên khác có thể clone DB về máy dễ dàng.
