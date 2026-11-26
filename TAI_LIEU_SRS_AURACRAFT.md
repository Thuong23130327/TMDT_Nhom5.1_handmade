# BÁO CÁO ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## HỆ THỐNG SÀN THƯƠNG MẠI ĐIỆN TỬ ĐỒ THỦ CÔNG & TÙY BIẾN THIẾT KẾ — AURACRAFT
**Môn học:** Thương Mại Điện Tử  
**Nhóm thực hiện:** Nhóm 5.1  
**Phiên bản:** 3.0 (Đầy đủ 26 chức năng theo Đề cương Đồ án)  

---

## 1. GIỚI THIỆU & BỐI CẢNH DỰ ÁN (PROJECT OVERVIEW)

### 1.1. Mục tiêu và Ý nghĩa đề tài
Thị trường đồ thủ công nghệ thuật (Handmade & Art Crafts) tại Việt Nam ngày càng phát triển nhưng còn phân tán, thiếu một sàn TMĐT chuyên biệt hỗ trợ tính năng **Tùy biến thiết kế trực quan (Customizer)** và **Chợ đấu thầu / Báo giá gia công theo yêu cầu (Request Quote / Bidding Market)**.

Dự án **AuraCraft** được xây dựng nhằm:
- Tạo cầu nối trực tiếp giữa Khách hàng và các Nghệ nhân thủ công mỹ nghệ.
- Ứng dụng công nghệ TMĐT hiện đại: Thanh toán trực tuyến VNPay, Xác thực bảo mật OAuth2/JWT, Gợi ý sản phẩm thông minh bằng AI (Khai phá luật kết hợp Apriori & Độ tương đồng Cosine).
- Tối ưu hóa trải nghiệm khách hàng với công cụ tự phối Charm/vòng tay 2D trực quan kèm cập nhật báo giá tức thời.

### 1.2. Các tác nhân trong hệ thống (Actors)
1. **Khách hàng (Buyer / Customer):** Tìm kiếm, lọc sản phẩm, xem gian hàng, tự custom sản phẩm, đăng yêu cầu lên Chợ báo giá, quản lý giỏ hàng, đặt hàng, thanh toán VNPay/COD, theo dõi lịch sử đơn và nhận gợi ý AI.
2. **Người bán / Nghệ nhân (Seller / Artisan):** Mở gian hàng (Shop Profile), đăng bán sản phẩm thủ công, tham gia đấu thầu báo giá trên Chợ báo giá, nhận đơn chế tác, cập nhật trạng thái đơn hàng, theo dõi doanh thu và rút tiền.
3. **Quản trị viên (Admin):** Quản lý toàn bộ người dùng, duyệt nghệ nhân, kiểm duyệt sản phẩm, quản lý đơn hàng toàn sàn, xem báo cáo KPI tài chính qua biểu đồ cột theo thời gian tùy chọn và biểu đồ tròn tỷ trọng danh mục.

---

## 2. DANH MỤC 26 YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### NHÓM I: XÁC THỰC & HỒ SƠ NGƯỜI DÙNG (AUTHENTICATION & PROFILE)
* **FR-01: Đăng ký tài khoản (gửi email xác thực):** Người dùng đăng ký vai trò Khách mua hoặc Người bán. Hệ thống gửi mã OTP/link xác thực về hòm thư qua Gmail SMTP để kích hoạt tài khoản.
* **FR-02: Đăng nhập hệ thống:** Đăng nhập bằng Email hoặc Username kèm Mật khẩu. Trả về JWT Access Token (24h) và Refresh Token (7 ngày). Tự động điều hướng theo Role (Admin, Artisan, Buyer).
* **FR-03: Đăng xuất:** Thu hồi Token trên server, xóa phiên làm việc trong `localStorage`/`sessionStorage`, hỗ trợ nút đăng xuất nhanh trên Header và Sidebar.
* **FR-04: Lấy lại mật khẩu qua OTP Email:** Quy trình 2 bước khép kín: Nhập Email nhận mã OTP 6 số (hạn 5 phút) -> Nhập OTP và Mật khẩu mới để cập nhật mật khẩu mã hóa BCrypt.
* **FR-05: Đăng nhập bằng Google (Google OAuth2):** Hỗ trợ đăng nhập nhanh bằng tài khoản Google (Gmail); tự động đồng bộ họ tên, avatar và tạo tài khoản nếu chưa tồn tại trong hệ thống.
* **FR-06: Cập nhật thông tin cá nhân:** Cho phép người dùng chỉnh sửa họ tên, số điện thoại, đổi mật khẩu, cập nhật ảnh đại diện (Avatar) và sổ địa chỉ giao hàng mặc định.

---

### NHÓM II: KHÁM PHÁ & TÌM KIẾM SẢN PHẨM (CATALOG & DISCOVERY)
* **FR-07: Hiển thị danh sách sản phẩm mới nhất trên trang chủ:** Tự động truy vấn và làm nổi bật các sản phẩm thủ công vừa được các nghệ nhân đăng tải (`ORDER BY created_at DESC`).
* **FR-08: Hiển thị danh sách sản phẩm được xem nhiều nhất trên trang chủ:** Thống kê lượt xem (View count) và lượt quan tâm của khách hàng để hiển thị các mặt hàng Hot/Bán chạy trên trang chủ.
* **FR-09: Xem chi tiết sản phẩm:** Hiển thị thư viện hình ảnh, tên, đơn giá, giá gốc (khuyến mãi), số lượng tồn kho, màu sắc, phân loại, mô tả quy trình chế tác và thông tin nghệ nhân.
* **FR-10: Lọc sản phẩm theo nhiều tiêu chí:** Bộ lọc đa năng (Multi-filter) cho phép lọc đồng thời theo Danh mục/Loại (Vòng tay, Đồ len, Đá phong thủy), Thương hiệu/Xưởng nghệ nhân, và Khoảng giá tiền (Min - Max).
* **FR-11: Sắp xếp thứ tự hiển thị sản phẩm:** Hỗ trợ sắp xếp linh hoạt theo: Giá tăng dần, Giá giảm dần, Sản phẩm mới nhất, Sản phẩm bán chạy nhất.
* **FR-12: Tìm kiếm gian hàng:** Khách hàng có thể tìm kiếm các xưởng thủ công hoặc nghệ nhân theo tên shop, lĩnh vực chuyên môn (Resin, Đan len, Gốm Bát Tràng...).
* **FR-13: Xem sản phẩm thuộc gian hàng (Shop Profile):** Xem trang cá nhân chuyên biệt của từng nghệ nhân: gồm banner xưởng, lời giới thiệu, đánh giá uy tín và toàn bộ danh mục sản phẩm của riêng nghệ nhân đó.

---

### NHÓM III: GIỎ HÀNG, ĐẶT HÀNG & THANH TOÁN (SHOPPING & PAYMENT)
* **FR-14: Quản lý giỏ hàng:** Thêm sản phẩm vào giỏ kèm ghi chú tùy biến; tự động kiểm tra tồn kho và cộng dồn số lượng nếu đã có; hỗ trợ tăng/giảm số lượng (+/-) và xóa sản phẩm theo thời gian thực.
* **FR-15: Đặt hàng (Checkout):** Tự động điền thông tin người nhận; kiểm tra hợp lệ định dạng số điện thoại và địa chỉ nhận hàng; sinh mã đơn duy nhất dạng `AC-YYYYMMDDHHmmss-XXX`; tự động trừ tồn kho và làm sạch giỏ hàng.
* **FR-16: Thanh toán trực tuyến (VNPay Sandbox):** Hỗ trợ thanh toán COD và Cổng thanh toán VNPay Sandbox; mã hóa tham số bảo mật HMAC-SHA512; tự động nhận callback cập nhật trạng thái đơn thành **PAID (Đã thanh toán)** và trả lời hóa đơn chi tiết.
* **FR-17: Xem lịch sử mua hàng:** Khách hàng theo dõi toàn bộ đơn hàng mình đã mua kèm mã đơn, thời gian đặt, tổng tiền, phương thức thanh toán và trạng thái xử lý đơn.
* **FR-18: Cập nhật trạng thái đơn hàng:** Hỗ trợ quy trình luân chuyển đơn hàng: `PENDING (Chờ duyệt)` ➔ `CRAFTING (Đang chế tác thủ công)` ➔ `SHIPPING (Đang giao hàng)` ➔ `COMPLETED (Hoàn thành)` hoặc `CANCELLED (Đã hủy)`.

---

### NHÓM IV: CHỢ BÁO GIÁ & TÙY BIẾN THIẾT KẾ THỦ CÔNG (CUSTOM & MARKETPLACE)
* **FR-19: Chợ báo giá (Request for Quote / Đấu thầu chế tác):** 
  - Người mua đăng tải hình ảnh mẫu thiết kế, bản vẽ hoặc ý tưởng muốn làm kèm ngân sách mong muốn và hạn chót nhận hàng.
  - Các nghệ nhân trên sàn xem danh sách yêu cầu, gửi báo giá (Giá tiền + Thời gian hoàn thành dự kiến + Lời nhắn chế tác).
  - Người mua so sánh các báo giá của các thợ và bấm chọn nghệ nhân phù hợp nhất để chốt đơn gia công.
* **FR-20: Custom đồ handmade trực tiếp trên web, cập nhật báo giá tức thời:**
  - Công cụ thiết kế trực quan 2D: Khách hàng tự chọn loại dây (dây da, bạc 925, titan), tự gắp/thả các mắt xích và hạt charm (charm hoa, chữ cái, đá phong thủy).
  - Hệ thống tự động tính toán cộng dồn giá trị của từng bộ phận và **cập nhật tổng giá tiền tức thời (Real-time Pricing)** ngay trên màn hình thiết kế.
  - Bấm "Cho vào giỏ hàng" để lưu cấu hình thiết kế vừa tạo.

---

### NHÓM V: TRÍ TUỆ NHÂN TẠO GỢI Ý MUA SẮM (AI RECOMMENDATION)
* **FR-21: AI gợi ý sản phẩm mua kèm (Trích xuất luật kết hợp - Association Rule Mining / Apriori):**
  - Dựa trên lịch sử giỏ hàng và các đơn hàng đã thanh toán, thuật toán phân tích tập mục phổ biến (Frequent Itemsets) với các chỉ số Support, Confidence, Lift.
  - Tự động gợi ý các sản phẩm thường được mua cùng nhau (Ví dụ: Khách mua Vòng tay handmade ➔ AI gợi ý mua kèm Hạt charm bạc hoặc Hộp quà handmade vintage).
* **FR-22: AI gợi ý sản phẩm tương tự (Độ tương đồng Cosine - Cosine Similarity):**
  - Biểu diễn đặc trưng sản phẩm (Chất liệu, màu sắc, phong cách, phân loại, khoảng giá) dưới dạng véc-tơ thuộc tính.
  - Khi khách hàng đang xem một sản phẩm, thuật toán tính toán góc Cosine giữa véc-tơ sản phẩm hiện tại với kho sản phẩm để gợi ý danh sách các món đồ thủ công có nét tương đồng cao nhất.

---

### NHÓM VI: QUẢN TRỊ & BÁO CÁO THỐNG KÊ (ADMIN & SELLER MANAGEMENT)
* **FR-23: Thống kê biểu đồ cột theo tùy chọn thời gian (Revenue Bar Chart by Date Range):**
  - Cho phép chọn linh hoạt: **Từ ngày nào đến ngày nào** (`startDate` - `endDate`) hoặc chọn nhanh (7 ngày, 30 ngày, 90 ngày, Toàn thời gian).
  - Biểu đồ cột trực quan vẽ bằng Chart.js hiển thị song song: Cột Doanh thu tổng (GMV) và Cột Phí sàn thu được (10%). Tự động gom nhóm theo ngày hoặc tháng.
* **FR-24: Thống kê biểu đồ tròn tỷ trọng danh mục (Category Pie Chart):**
  - Biểu đồ tròn (Doughnut) phân tích cơ cấu doanh số bán hàng giữa các nhóm sản phẩm (Vòng tay & Lắc, Đồ len móc, Dây chuyền đá quý, Phụ kiện thủ công...), hiển thị tỷ lệ % trực quan.
* **FR-25: Admin quản lý cơ bản (Người dùng, Sản phẩm, Đơn hàng):**
  - *Người dùng:* Quản lý danh sách tài khoản, khóa/mở khóa người dùng vi phạm, duyệt nghệ nhân mới.
  - *Sản phẩm:* Duyệt sản phẩm đăng bán, kiểm soát nội dung và hình ảnh.
  - *Đơn hàng:* Theo dõi toàn bộ dòng tiền và trạng thái giao hàng trên toàn sàn.
* **FR-26: Người bán quản lý cơ bản (Sản phẩm, Doanh thu, Đơn hàng):**
  - *Sản phẩm:* Đăng bán món mới, sửa giá, cập nhật số lượng tồn kho.
  - *Doanh thu:* Xem tổng tiền bán được, tiền thực nhận sau khi sàn khấu trừ 10% hoa hồng, quản lý yêu cầu rút tiền về tài khoản ngân hàng.
  - *Đơn hàng:* Tiếp nhận các đơn chế tác thuộc gian hàng mình và cập nhật tiến độ chế tác/giao hàng.

---

## 3. DANH MỤC YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### NFR-01: Bảo Mật & An Toàn Thông Tin (Security)
- **Mã hóa mật khẩu:** Băm mật khẩu người dùng bằng thuật toán **BCrypt** độ phức tạp (cost) = 10, chống giải mã ngược.
- **Xác thực phiên làm việc:** Cơ chế **Stateless JWT** (JSON Web Token), chữ ký HMAC-SHA256, Access Token (hạn 24h), Refresh Token (hạn 7 ngày) được mã hóa dấu vân tay (Fingerprint SHA-256) trong CSDL.
- **Bảo mật cổng thanh toán:** Sử dụng chữ ký số bảo mật chuẩn **HMAC-SHA512** đối soát toàn vẹn dữ liệu đơn hàng gửi sang cổng VNPay.
- **Chống gian lận & Tấn công:** Sử dụng cơ chế PreparedStatement của Hibernate/JPA chống triệt để tấn công SQL Injection; Cấu hình CORS chặt chẽ kiểm soát domain gọi API.

### NFR-02: Tính Toàn Vẹn Giao Dịch & Dữ Liệu (Data Integrity & ACID)
- **Quản lý Transaction (`@Transactional`):** Đảm bảo quy trình Đặt hàng - Trừ tồn kho - Xóa giỏ hàng diễn ra theo nguyên tắc nguyên tử (All or Nothing). Nếu xảy ra lỗi giữa chừng, toàn bộ thay đổi sẽ được Rollback ngay lập tức.
- **Chống tranh chấp tồn kho (Race Condition):** Kiểm tra số lượng tồn kho tức thời tại thời điểm chốt đơn để ngăn chặn bán vượt số lượng thực tế.
- **Khóa bi quan (`@Lock(PESSIMISTIC_WRITE)`):** Áp dụng khi sinh và kiểm tra OTP email nhằm chống hành vi gửi yêu cầu liên tục (Spam OTP).

### NFR-03: Hiệu Năng & Khả Năng Mở Rộng (Performance & Scalability)
- **Thời gian đáp ứng (Response Time):** Thời gian phản hồi của các API xem sản phẩm, giỏ hàng đạt dưới **500ms**; thời gian tải trang thiết kế Customizer đạt dưới **1 giây**.
- **Tối ưu hóa CSDL (Indexing):** Đánh chỉ mục Index trên các khóa tra cứu thường xuyên: `users(email, username)`, `orders(order_code, created_at, buyer_id)`, `products(category_id, artisan_id, status)`.
- **Cơ chế Fallback & Dự phòng:** Biểu đồ tài chính và các thuật toán gợi ý AI luôn có khối dữ liệu dự phòng đồng bộ, đảm bảo giao diện luôn hiển thị đầy đủ ngay cả khi dữ liệu mới nạp.

### NFR-04: Tính Khả Dụng & Trải Nghiệm Người Dùng (Usability & UX)
- **Tự động bắt lỗi form:** Kiểm tra hợp lệ định dạng số điện thoại Việt Nam (10 số), email hợp chuẩn, mật khẩu tối thiểu 6 ký tự và báo lỗi tiếng Việt tức thì dưới ô nhập.
- **Tương thích đa thiết bị (Responsive Design):** Bố cục giao diện hiển thị tối ưu trên Máy tính (Desktop/Laptop), Máy tính bảng (Tablet) và Điện thoại di động (Smartphone).
- **Trải nghiệm tương tác mượt mà:** Thanh Header tự động nhận diện trạng thái đăng nhập; các nút thao tác nhanh (Đăng xuất, Xem giỏ, Báo giá) được bố trí thuận tiện.

### NFR-05: Khả Năng Bảo Trì & Kiến Trúc Phần Mềm (Maintainability)
- **Kiến trúc phân tầng chuẩn:** Tách bạch 4 tầng rõ ràng (Controller ➔ Service ➔ Repository ➔ Model/DTO), chuẩn hóa định dạng phản hồi JSON qua lớp `ApiResponse<T>`.
- **Dễ dàng cấu hình:** Toàn bộ thông số kết nối Database, cổng thanh toán VNPay Sandbox, tài khoản Gmail SMTP và khóa bí mật JWT được gom gọn trong file `application.properties`.

---

## 4. BẢNG TÀI KHOẢN MẪU ĐỂ TEST HỆ THỐNG
> **Mật khẩu dùng chung cho toàn bộ tài khoản:** `123456`

| Vai trò | Email đăng nhập | Username | Mô tả |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@auracraft.vn` | `admin` | Quản trị sàn, xem báo cáo biểu đồ, duyệt đơn/người dùng |
| **Nghệ nhân** | `anna@auracraft.vn` | `anna` | Thợ chuyên Charm bạc 925 & Resin (Shop Anna) |
| **Nghệ nhân** | `bao@auracraft.vn` | `bao` | Nghệ nhân đồ gỗ & phong cảnh (Shop Trần Bảo) |
| **Khách hàng** | `khang@gmail.com` | `khang` | Khách mua hàng mẫu (thường dùng test mua sắm & VNPay) |
| **Khách hàng** | `lan@gmail.com` | `lan` | Khách mua hàng mẫu |
