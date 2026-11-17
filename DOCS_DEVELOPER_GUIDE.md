# CẨM NANG PHÁT TRIỂN & HƯỚNG DẪN CODE CHO NHÓM (DEVELOPER GUIDE)
## DỰ ÁN SÀN THƯƠNG MẠI ĐIỆN TỬ AURACRAFT — NHÓM 5.1

> **Phiên bản:** 3.0 (Cập nhật đầy đủ 26 tính năng)  
> **Dành cho:** Tất cả 5 thành viên trong nhóm 5.1 cùng đọc để phối hợp code, hiểu rõ luồng xử lý (Code Flow) từ Frontend xuống Backend và phân chia công việc rõ ràng.

---

## 1. TỔNG QUAN 26 TÍNH NĂNG CỦA DỰ ÁN

Dự án AuraCraft bao gồm 26 tính năng chia làm 6 cụm phân hệ:

1. **Xác thực & Hồ sơ:** (1) Đăng ký gửi email xác thực, (2) Đăng nhập, (3) Đăng xuất, (4) Lấy lại mật khẩu, (5) Đăng nhập Google, (6) Cập nhật thông tin cá nhân.
2. **Khám phá & Tìm kiếm:** (7) SP mới nhất trên trang chủ, (8) SP xem nhiều nhất trên trang chủ, (9) Xem chi tiết SP, (10) Lọc SP theo nhiều tiêu chí (loại, giá, xưởng), (11) Sắp xếp thứ tự hiển thị, (12) Tìm kiếm gian hàng, (13) Xem sản phẩm thuộc gian hàng.
3. **Giỏ hàng & Đặt hàng:** (14) Quản lý giỏ hàng, (15) Đặt hàng, (16) Thanh toán trực tuyến VNPay, (17) Xem lịch sử mua hàng, (18) Cập nhật trạng thái đơn hàng.
4. **Tùy biến & Chợ báo giá:** (19) Chợ báo giá (RFQ / Đấu thầu gia công), (20) Custom đồ handmade trực tiếp trên web cập nhật báo giá tức thời.
5. **Trí tuệ nhân tạo (AI):** (21) AI gợi ý sản phẩm mua kèm (Trích luật Apriori), (22) AI gợi ý sản phẩm tương tự (Độ tương đồng Cosine).
6. **Quản trị & Báo cáo:** (23) Thống kê biểu đồ cột theo thời gian tùy chọn, (24) Thống kê biểu đồ tròn tỷ trọng danh mục, (25) Admin quản lý cơ bản (user, SP, đơn hàng), (26) Người bán quản lý cơ bản (SP, doanh thu, đơn hàng).

---

## 2. HƯỚNG DẪN MÔI TRƯỜNG & KHỞI CHẠY HỆ THỐNG

### 2.1. Yêu cầu môi trường
- **Java:** OpenJDK 11 (hoặc Oracle JDK 11).
- **IDE:** IntelliJ IDEA (hoặc VS Code / Eclipse).
- **Cơ sở dữ liệu:** MySQL Server 8.x (cổng 3306), database `auracraft_db`.
- **Cấu hình MySQL:** User `root`, password để trống (nếu máy bạn có mật khẩu, sửa dòng `spring.datasource.password=` trong `application.properties`).

### 2.2. Khởi chạy 2 bước
1. **Khởi động Backend:** Mở thư mục `backend` bằng IntelliJ -> Chọn JDK 11 -> Run file `HandmadeApplication.java`. Server sẽ chạy tại cổng `http://localhost:8080`.
   - *Lưu ý:* Cơ chế `spring.sql.init.mode=always` sẽ tự động tạo bảng và nạp sẵn dữ liệu hạt giống (users, products, categories) từ `data.sql` vào MySQL.
2. **Mở Frontend:** Mở thư mục `frontend` trên trình duyệt qua built-in server của IntelliJ (`http://localhost:63342/...`) hoặc Live Server (port 5500).

### 2.3. Danh sách tài khoản thử nghiệm (Mật khẩu: `123456`)
- **Admin:** `admin@auracraft.vn` (username: `admin`)
- **Khách mua hàng:** `khang@gmail.com` (username: `khang`), `lan@gmail.com` (username: `lan`)
- **Nghệ nhân:** `anna@auracraft.vn` (username: `anna`), `bao@auracraft.vn` (username: `bao`)

---

## 3. BẢN ĐỒ LUỒNG CODE (CODE FLOW) THEO TỪNG CỤM TÍNH NĂNG

### Cụm 1: Xác thực & Tài khoản (FR-01 đến FR-06)
- **Đăng nhập & Đăng xuất:**
  - `login.html` ➔ `auth.js` ➔ `POST /api/auth/login`.
  - `AuthServiceImpl` tìm user trong `UserRepository` theo Email/Username, so khớp BCrypt, sinh JWT Token.
  - Khi bấm **Đăng xuất** (trên header hoặc profile/admin sidebar): Gọi `logout()`, xóa `localStorage`/`sessionStorage` và chuyển về `login.html`.
- **Lấy lại mật khẩu qua OTP Email:**
  - `forgot.html` ➔ `POST /api/auth/forgot-password` (nhận mã OTP 6 số qua Gmail SMTP).
  - Khách nhập OTP và Mật khẩu mới ➔ `POST /api/auth/reset-password` để cập nhật mật khẩu mới.
- **Đăng ký tài khoản gửi email xác thực:**
  - `register.html` ➔ `POST /api/auth/register`: Băm mật khẩu BCrypt, lưu tài khoản và kích hoạt phiên.
- **Cập nhật thông tin cá nhân:**
  - `profile-info.html` ➔ `profile-sync.js`: Đọc và cập nhật họ tên, số điện thoại, avatar động (`ui-avatars.com`).

---

### Cụm 2: Khám phá, Tìm kiếm & Gian hàng (FR-07 đến FR-13)
- **Trang chủ (Sản phẩm mới nhất & Xem nhiều nhất):**
  - `index.html`: Hiển thị danh mục sản phẩm mới (`created_at DESC`) và sản phẩm nổi bật/bán chạy.
- **Xem chi tiết sản phẩm:**
  - `product-detail.html` ➔ `product-detail.js`: Đọc tham số `id` trên URL, hiển thị hình ảnh, giá, mô tả, thông tin nghệ nhân và nút "Thêm vào giỏ hàng".
- **Lọc và Sắp xếp sản phẩm:**
  - `products.html`: Bộ lọc kết hợp theo Danh mục (loại), Nghệ nhân (thương hiệu/xưởng) và Khoảng giá (min - max).
  - Sự kiện `sort-select` sắp xếp thứ tự: Giá tăng dần, Giá giảm dần, Hàng mới, Bán chạy.
- **Tìm kiếm gian hàng & Xem trang shop:**
  - `choose-seller.html` và `shop-profile.html`: Tìm kiếm các xưởng thủ công, xem toàn bộ sản phẩm của riêng thợ đó.

---

### Cụm 3: Giỏ hàng, Đặt hàng & Thanh toán VNPay (FR-14 đến FR-18)
- **Quản lý giỏ hàng:**
  - `cart.html` ➔ `cart.js` ➔ `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/{id}`, `DELETE /api/cart/{id}`.
  - `CartServiceImpl` tự động lấy user từ JWT token qua `CurrentUserResolver`, kiểm tra tồn kho và cộng dồn số lượng.
- **Đặt hàng (Checkout):**
  - `checkout.html` ➔ `checkout.js` ➔ `POST /api/orders`.
  - `OrderServiceImpl` tạo đơn hàng dạng `AC-YYYYMMDDHHmmss-XXX`, trừ số lượng tồn kho sản phẩm, dọn sạch giỏ hàng.
- **Thanh toán trực tuyến VNPay:**
  - Nếu chọn VNPay: `PaymentController.createVNPayPayment()` tạo link thanh toán sandbox kèm chữ ký SHA-512.
  - Khách hàng thanh toán trên cổng VNPay Sandbox.
  - VNPay gọi IPN callback: `GET /api/payment/vnpay-callback` -> Kiểm tra chữ ký -> cập nhật `paymentStatus = PAID` -> chuyển về `success.html?orderId=...&vnpayStatus=SUCCESS`.
- **Xem lịch sử mua hàng:**
  - `profile.html` ➔ `profile-orders.js`: Gọi API lấy danh sách đơn của user đang đăng nhập kèm trạng thái chi tiết.

---

### Cụm 4: Chợ báo giá & Custom đồ handmade (FR-19 & FR-20)
- **Chợ báo giá (Request for Quote / Đấu thầu):**
  - `buyer-requests.html` & `buyer-request-form.html`: Người mua đăng tải ảnh mẫu và mô tả yêu cầu gia công.
  - `seller-dashboard.html`: Các thợ vào xem danh sách yêu cầu, nhập giá tiền và thời gian dự kiến hoàn thành để gửi báo giá. Người mua chọn thợ ưng ý nhất để chốt đơn.
- **Custom đồ handmade trực tiếp trên web, cập nhật báo giá tức thời:**
  - `customizer.html` ➔ `styleCustomizer.css`: Màn hình đồ họa 2D.
  - Khách hàng bấm chọn chất liệu dây, gắp/thả các hạt charm (charm bạc hoa, đá xanh, trái tim...).
  - Hàm JavaScript tự động tính toán tổng tiền của các phụ kiện đã chọn và cập nhật hiển thị giá tiền ngay lập tức (**Real-time Price Update**).
  - Bấm nút "Thêm vào giỏ" để chuyển toàn bộ cấu hình thiết kế vào giỏ hàng.

---

### Cụm 5: Trí tuệ nhân tạo gợi ý mua sắm (FR-21 & FR-22)
- **AI gợi ý sản phẩm mua kèm (Trích xuất luật kết hợp - Apriori):**
  - Phân tích giỏ hàng và lịch sử đơn hàng để tìm luật kết hợp dạng: `{Vòng tay} ➔ {Hạt charm bạc, Hộp quà vintage}`.
  - Đánh giá bằng các độ đo: Độ hỗ trợ (Support), Độ tin cậy (Confidence), Độ nâng (Lift).
  - Hiển thị khối "Sản phẩm thường mua kèm" tại trang chi tiết sản phẩm và giỏ hàng.
- **AI gợi ý sản phẩm tương tự (Độ tương đồng Cosine - Cosine Similarity):**
  - Mỗi sản phẩm được biểu diễn bằng véc-tơ thuộc tính: $[x_1, x_2, ..., x_n]$ tương ứng với Danh mục, Chất liệu, Màu sắc, Khoảng giá.
  - Khi xem sản phẩm $A$, hệ thống tính $\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$ với các sản phẩm $B$ khác trong kho.
  - Hiển thị danh sách top 4 sản phẩm có độ tương đồng cao nhất tại mục "Sản phẩm tương tự bạn có thể thích".

---

### Cụm 6: Quản trị Admin & Người bán (FR-23 đến FR-26)
- **Thống kê biểu đồ cột theo thời gian tùy chọn:**
  - `admin-finance.html` ➔ `admin-finance.js` ➔ `/api/v1/admin/analytics/revenue-chart`.
  - Nhận tham số `startDate` và `endDate`, gom nhóm theo ngày/tháng, vẽ biểu đồ cột kép: Doanh thu tổng (GMV) và Phí sàn thu được (10%).
- **Thống kê biểu đồ tròn tỷ trọng danh mục:**
  - `/api/v1/admin/analytics/category-chart`: Truy vấn doanh thu theo danh mục sản phẩm, tính toán % và vẽ biểu đồ Doughnut kèm chú giải chi tiết.
- **Admin quản lý cơ bản:**
  - `admin-users.html`: Quản lý danh sách người dùng, trạng thái tài khoản.
  - `admin-orders.html`: Quản lý đơn hàng toàn sàn, cập nhật tiến độ xử lý đơn.
- **Người bán quản lý cơ bản:**
  - `seller-dashboard.html` & `seller-products.html`: Quản lý kho hàng của thợ, xem doanh thu thực nhận, gửi yêu cầu rút tiền.

---

## 4. BẢNG PHÂN CÔNG NHIỆM VỤ GỢI Ý CHO 5 THÀNH VIÊN

| Thành viên | Phụ trách chính | Nhiệm vụ cụ thể | Các file đảm nhiệm |
| :---: | :--- | :--- | :--- |
| **Bạn 1** | Module Xác thực & Tài khoản | Đăng nhập, Đăng xuất, Đăng ký (gửi mail xác thực), Quên mật khẩu OTP, Đăng nhập Google, Cập nhật thông tin cá nhân | `AuthController.java`, `AuthServiceImpl.java`, `JwtTokenProvider.java`, `login.html`, `register.html`, `forgot.html`, `profile-info.html`, `auth.js` |
| **Bạn 2** | Module Khám phá & Giỏ hàng | Trang chủ (SP mới, SP xem nhiều), Chi tiết SP, Lọc & Sắp xếp SP, Quản lý giỏ hàng (thêm, sửa số lượng, xóa) | `CartController.java`, `CartServiceImpl.java`, `Product.java`, `index.html`, `products.html`, `product-detail.html`, `cart.html`, `cart.js` |
| **Bạn 3** | Module Đặt hàng & Thanh toán VNPay | Quy trình Đặt hàng, Tích hợp cổng VNPay Sandbox, Xử lý callback cập nhật trạng thái đơn, Xem lịch sử mua hàng | `OrderController.java`, `OrderServiceImpl.java`, `PaymentController.java`, `checkout.html`, `success.html`, `profile.html`, `checkout.js` |
| **Bạn 4** | Module Customizer & Chợ báo giá | Công cụ tự thiết kế handmade 2D cập nhật giá tức thời, Chợ đấu thầu báo giá (người mua đăng mẫu, thợ báo giá) | `customizer.html`, `buyer-requests.html`, `buyer-request-form.html`, `styleCustomizer.css` |
| **Bạn 5** | Module Quản lý (Admin/Seller) & AI Gợi ý | Biểu đồ cột lọc theo ngày, Biểu đồ tròn danh mục, Admin quản lý (user/SP/đơn), Người bán quản lý, AI gợi ý Apriori & Cosine | `AdminAnalyticsController.java`, `AnalyticsServiceImpl.java`, `AdminOrderController.java`, `admin-finance.html`, `admin-orders.html`, `seller-dashboard.html` |
