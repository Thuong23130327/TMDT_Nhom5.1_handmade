# 📜 KỊCH BẢN THUYẾT TRÌNH DEMO HỆ THỐNG AURACRAFT (FULLSTACK HANDMADE PLATFORM)
> **Dành cho buổi báo cáo & nghiệm thu đồ án môn Thương Mại Điện Tử / Công Nghệ Phần Mềm**  
> **Đề tài:** Sàn Thương Mại Điện Tử Thủ Công Mỹ Nghệ & Chế Tác Độc Bản AuraCraft  
> **Kiến trúc:** Spring Boot 2.7 (Java 11) + MySQL Database + RESTful APIs + Clean URLs + Vanilla JS/CSS Luxury Minimal + Bootstrap Icons & FontAwesome + Chart.js + Cổng thanh toán VietQR Napas 247

---

## 🔑 1. DANH SÁCH TÀI KHOẢN DEMO & HỆ THỐNG URL CHUẨN THỰC TẾ

### 1.1. Tài khoản thực nghiệm trong hệ thống

| Phân quyền | Tên tài khoản / Email | Mật khẩu | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Khách hàng mẫu (Buyer)** | `khang@gmail.com` | `123456` | Demo toàn bộ luồng mua sắm, giỏ hàng, đặt hàng VietQR & lịch sử đơn hàng |
| **Khách hàng mới tạo** | Tự tạo trực tiếp tại trang `/register` | Mật khẩu tùy chọn | Chứng minh tính năng Đăng ký tài khoản mới lưu trực tiếp vào CSDL MySQL |
| **Quản trị viên (Admin)** | `admin@auracraft.vn` | `123456` | Demo Quản lý đơn hàng toàn sàn, Quản lý thợ/tài khoản và Thống kê doanh thu |

### 1.2. Bảng định tuyến Clean URLs (Chuẩn thực tế - Không lộ đuôi `.html`)

| Chức năng | Đường dẫn Clean URL (Khuyên dùng khi demo) | Đường dẫn file gốc tương thích |
| :--- | :--- | :--- |
| **Trang chủ sàn** | `http://localhost:8080/` | `http://localhost:8080/index.html` |
| **Danh sách sản phẩm** | `http://localhost:8080/products` | `http://localhost:8080/pages/products.html` |
| **Chi tiết sản phẩm** | `http://localhost:8080/product-detail?id=1` | `http://localhost:8080/pages/product-detail.html?id=1` |
| **Giỏ hàng** | `http://localhost:8080/cart` | `http://localhost:8080/pages/cart.html` |
| **Đặt hàng & Thanh toán** | `http://localhost:8080/checkout` | `http://localhost:8080/pages/checkout.html` |
| **Hồ sơ & Lịch sử đơn** | `http://localhost:8080/profile` | `http://localhost:8080/pages/profile.html` |
| **Đăng nhập** | `http://localhost:8080/login` | `http://localhost:8080/pages/login.html` |
| **Đăng ký tài khoản** | `http://localhost:8080/register` | `http://localhost:8080/pages/register.html` |
| **Admin - Quản lý đơn hàng**| `http://localhost:8080/admin/orders` | `http://localhost:8080/pages/admin-orders.html` |
| **Admin - Quản lý thợ & User**| `http://localhost:8080/admin/users` | `http://localhost:8080/pages/admin-users.html` |
| **Admin - Báo cáo & Biểu đồ**| `http://localhost:8080/pages/admin-finance.html` | `http://localhost:8080/pages/admin-finance.html` |

---

## 🎬 2. KỊCH BẢN DEMO CHI TIẾT THEO CÁC FLOW (TỪ A ĐẾN Z)

```
[FLOW 1: Đăng ký & Đăng nhập] ➔ [FLOW 2: Khám phá & Lọc sản phẩm] ➔ [FLOW 3: Chi tiết sản phẩm]
       ➔ [FLOW 4: Giỏ hàng] ➔ [FLOW 5: Đặt hàng & VietQR] ➔ [FLOW 6: Lịch sử đơn hàng]
       ➔ [FLOW 7: Admin Quản lý đơn hàng] ➔ [FLOW 8: Admin Quản lý Thợ & User] ➔ [FLOW 9: Admin Báo cáo Biểu đồ]
```

---

### 🌟 FLOW 1: ĐĂNG KÝ TÀI KHOẢN MỚI & ĐĂNG NHẬP HỆ THỐNG
- **Đường dẫn Clean URL:** `http://localhost:8080/register` và `http://localhost:8080/login`
- **Mục tiêu chứng minh:** Hệ thống xác thực người dùng hoàn chỉnh, mã hóa mật khẩu BCrypt, cấp JWT Token và lưu trữ trực tiếp vào bảng `users` trong MySQL (Đã fix hoàn toàn lỗi `role` trước đó).

#### 📌 Thao tác trình chiếu:
1. Mở trình duyệt vào `http://localhost:8080/register`.
2. Điền thông tin tạo tài khoản khách hàng mới:
   - Tên đăng nhập: `mai_customer`
   - Họ và tên: `Nguyễn Thị Mai`
   - Email: `nhthuong.1305@gmail.com` *(hoặc bất kỳ email nào để xem email gửi thật đến điện thoại/laptop)*
   - Số điện thoại: `0918234567`
   - Mật khẩu: `AuraCraft@2026`
   - Xác nhận mật khẩu: `AuraCraft@2026`
3. Bấm **"Tiếp Tục & Nhận Mã OTP"**:
   - Màn hình chuyển sang giao diện **Xác thực mã OTP** với đồng hồ đếm ngược thời hạn 5 phút (`05:00` ➔ `00:00`) và nút đếm ngược gửi lại mã 60s.
   - Hệ thống kết nối Gmail SMTP và **gửi email thật 100%** đến hòm thư người dùng với tiêu đề: *"Mã xác thực đăng ký tài khoản AuraCraft: XXXXXX"*.
   - Mở hòm thư Gmail (hoặc tab cửa sổ console backend) để lấy mã OTP 6 số.
4. Nhập mã OTP và bấm **"Xác Nhận & Kích Hoạt Tài Khoản"**:
   - Hệ thống hiển thị thông báo thành công: `✓ Xác thực OTP thành công! Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng...`.
   - Bản ghi được tạo ngay trong database MySQL với trạng thái `ACTIVE` và vai trò `ROLE_CUSTOMER`, đồng thời tự động đăng nhập cấp JWT tokens.

#### 🎙️ Lời thoại với cô giáo:
> *"Dạ thưa cô, đầu tiên là phân hệ Quản lý tài khoản & Xác thực người dùng.*  
> *Để đảm bảo tính bảo mật và định danh khách hàng chuẩn như các sàn thương mại điện tử lớn, nhóm em đã tích hợp quy trình xác thực 2 bước (2-Step Verification) qua mã OTP gửi về Email thực tế.*  
> *Khi khách hàng điền thông tin đăng ký, Backend Spring Boot sẽ kiểm tra tính duy nhất, tạo mã OTP ngẫu nhiên 6 chữ số có thời hạn hiệu lực chính xác trong 5 phút, và kết nối với dịch vụ SMTP để gửi thư trực tiếp đến hòm thư của khách hàng.*  
> *Khách hàng chỉ có 5 lần thử; nếu hết 5 phút hoặc nhập sai quá số lần, mã sẽ bị vô hiệu hóa để chống tấn công brute-force. Khi nhập đúng mã OTP, tài khoản sẽ được kích hoạt, mật khẩu được băm an toàn bằng BCrypt và người dùng được cấp JSON Web Token (JWT) để đăng nhập ngay lập tức."*

---

### 🌟 FLOW 2: KHÁM PHÁ DANH SÁCH SẢN PHẨM (LỌC, SẮP XẾP & PHÂN TRANG TỪ DATABASE)
- **Đường dẫn Clean URL:** `http://localhost:8080/products`
- **Mục tiêu chứng minh:** Danh sách sản phẩm được tải động từ REST API `GET /api/v1/products` kết nối MySQL Database, có đầy đủ các tính năng Lọc danh mục, Lọc giá, Lọc đánh giá sao, Sắp xếp và Phân trang (8 sản phẩm/trang).

#### 📌 Thao tác trình chiếu:
1. Mở trang `http://localhost:8080/products` (hoặc click vào menu **"Sản phẩm"** trên thanh Header).
2. Quan sát: Hệ thống nạp 16 sản phẩm thủ công từ database.
   - Badge số lượng thông báo: `Hiển thị 8 trong tổng số 16 sản phẩm (Trang 1/2)`.
3. **Thử nghiệm Bộ lọc Danh mục (Category Filter):**
   - Click chọn checkbox **"Vòng tay Charm & Lắc tay"** ➔ Bấm **"Áp dụng bộ lọc"**: Danh sách tự động lọc đúng các sản phẩm vòng tay và lắc tay.
   - Click nút **"Đặt lại bộ lọc"**: Danh sách khôi phục đầy đủ 16 sản phẩm.
4. **Thử nghiệm Bộ lọc Mức giá (Price Range Filter):**
   - Chọn khoảng giá **"100.000đ - 300.000đ"** ➔ Bấm Áp dụng: Chỉ hiển thị các sản phẩm có giá trong khoảng này (VD: Lắc chân 220k, Armlet 180k, Vòng bụng 130k).
5. **Thử nghiệm Sắp xếp (Sorting):**
   - Chọn dropdown **"Giá: Thấp đến Cao"** ➔ Các sản phẩm giá rẻ như Dây đeo điện thoại (85k, 90k), Vòng chỉ đỏ (99k) lập tức nhảy lên đầu.
   - Chọn **"Giá: Cao đến Thấp"** ➔ Dây chuyền cỏ 4 lá (550k), Dây chuyền thạch anh khói (450k) lên đầu.
6. **Thử nghiệm Phân trang (Pagination):**
   - Nhìn xuống cuối trang thấy thanh phân trang `[1] [2] [Trang sau >]`.
   - Bấm sang **Trang 2** ➔ Màn hình cuộn mượt mà lên đầu và hiển thị 8 sản phẩm tiếp theo (từ sản phẩm số 9 đến 16).

#### 🎙️ Lời thoại với cô giáo:
> *"Thưa cô, đây là trang Danh sách sản phẩm của sàn AuraCraft.*  
> *Thay vì sử dụng dữ liệu tĩnh hardcoded, toàn bộ 16 sản phẩm này được nạp động từ CSDL MySQL thông qua REST API `GET /api/v1/products`.*  
> *Trang tích hợp bộ lọc đa tiêu chí gồm: Danh mục, Khoảng giá, Đánh giá sao, kết hợp bộ sắp xếp giá tăng/giảm và cơ chế phân trang 8 sản phẩm/trang nhằm tối ưu tốc độ tải trang và trải nghiệm người dùng."*

---

### 🌟 FLOW 3: XEM CHI TIẾT SẢN PHẨM KHỚP 100% (PRODUCT DETAIL)
- **Đường dẫn Clean URL:** `http://localhost:8080/product-detail?id=3` (hoặc id bất kỳ)
- **Mục tiêu chứng minh:** Đã giải quyết triệt để lỗi "bấm sản phẩm nào cũng ra hoa cúc". Giờ đây bấm bất kỳ sản phẩm nào từ trang danh sách đều mở ra **chính xác 100% hình ảnh, tiêu đề, mức giá, số lượng tồn kho và nghệ nhân của sản phẩm đó**.

#### 📌 Thao tác trình chiếu:
1. Từ trang danh sách sản phẩm, click vào thẻ sản phẩm **"Dây chuyền mặt trăng thạch anh"** (hoặc gõ `http://localhost:8080/product-detail?id=3`).
2. Quan sát trang chi tiết:
   - Tên sản phẩm: `Dây chuyền mặt trăng thạch anh`
   - Danh mục: `Dây chuyền & Mặt đá`
   - Giá bán: `350.000 ₫` (Giá cũ: 390.000 ₫)
   - Nghệ nhân chế tác: `Anna Nguyễn`
   - Thư viện hình ảnh: Hiển thị đúng bộ ảnh mặt trăng thạch anh khói lung linh.
3. Quay lại danh sách, click thử sản phẩm khác: **"Gấu Bông Len Móc Mini Đội Mũ"** (`?id=2`) hoặc **"Lắc chân chuông bạc"** (`?id=4`):
   - Màn hình lập tức đổi sang đúng ảnh gấu len / lắc chân, giá tiền và thông tin tương ứng.
4. Tại ô số lượng, chọn: `2`.
5. Bấm nút **"Thêm vào giỏ"**:
   - Nút chuyển trạng thái `<span class="spinner"></span> Đang thêm...` ➔ Đổi thành `✓ Đã thêm vào giỏ!`.
   - Thông báo popup: `Đã thêm 2 x "Dây chuyền mặt trăng thạch anh" vào giỏ hàng thành công!`.
   - Dữ liệu được đồng bộ đồng thời lên API backend `POST /api/v1/cart` và LocalStorage.

#### 🎙️ Lời thoại với cô giáo:
> *"Dạ thưa cô, nhóm em đã đồng bộ cơ chế định tuyến dữ liệu theo `id` sản phẩm giữa CSDL MySQL và Client.*  
> *Khi người dùng click vào bất kỳ sản phẩm nào trên sàn, trang chi tiết sẽ gọi API `GET /api/v1/products/{id}` để nạp đúng thông số, thư viện ảnh và thông tin nghệ nhân chế tác.*  
> *Khách hàng có thể tùy chọn số lượng và bấm 'Thêm vào giỏ' hoặc 'Mua ngay' với phản hồi giao diện tức thì."*

---

### 🌟 FLOW 4: QUẢN LÝ GIỎ HÀNG (CART MANAGEMENT)
- **Đường dẫn Clean URL:** `http://localhost:8080/cart`
- **Mục tiêu chứng minh:** Quản lý giỏ hàng trực quan, hỗ trợ tăng giảm số lượng, xóa món hàng, tự động tính tổng tiền theo thời gian thực (real-time calculation).

#### 📌 Thao tác trình chiếu:
1. Click vào biểu tượng **Giỏ hàng** trên Header (hoặc vào `http://localhost:8080/cart`).
2. Quan sát danh sách món hàng vừa thêm:
   - Hiển thị ảnh sản phẩm, tên, đơn giá, số lượng và thành tiền.
3. **Thao tác tăng/giảm số lượng:**
   - Bấm nút **`+`** tại sản phẩm ➔ Số lượng tăng từ 2 lên 3, thành tiền của món và Tổng cộng của giỏ hàng tự động nhảy tăng chính xác.
   - Bấm nút **`-`** ➔ Số lượng giảm về 2.
4. Bấm nút **"Tiến hành thanh toán"** ➔ Hệ thống tự động chuyển hướng mượt mà sang trang Checkout.

#### 🎙️ Lời thoại với cô giáo:
> *"Tại trang Giỏ hàng, hệ thống kết nối với REST API `/api/v1/cart`.*  
> *Khách hàng có thể điều chỉnh số lượng sản phẩm tùy thích. Mỗi thao tác bấm tăng, giảm hay xóa đều kích hoạt hàm tính toán tự động cập nhật tổng giá trị giỏ hàng ngay lập tức mà không làm gián đoạn trải nghiệm của người dùng."*

---

### 🌟 FLOW 5: ĐẶT HÀNG & THANH TOÁN VIETQR / COD (CHECKOUT FLOW)
- **Đường dẫn Clean URL:** `http://localhost:8080/checkout`
- **Mục tiêu chứng minh:** Luồng đặt hàng chuyên nghiệp. Hỗ trợ 2 phương thức: COD và Chuyển khoản VietQR Napas 247. Đã hoàn thiện cơ chế an toàn: **Hủy/thoát modal VietQR sẽ KHÔNG bị báo thành công ảo mà giữ nguyên đơn ở trạng thái Chờ thanh toán**.

#### 📌 Thao tác trình chiếu:
1. Mở trang `http://localhost:8080/checkout`.
2. Kiểm tra thông tin nhận hàng:
   - Họ và tên, Số điện thoại và Email được tự động điền (Pre-filled) từ tài khoản đang đăng nhập.
   - Nhập địa chỉ nhận hàng: `123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh`.
   - Nhập ghi chú: `Giao giờ hành chính, đóng gói hộp quà giúp mình nhé`.
3. Kiểm tra tóm tắt đơn hàng ở cột bên phải:
   - Tạm tính sản phẩm, phí vận chuyển toàn quốc (`25.000 đ`) và Tổng thanh toán.
4. **Trường hợp A: Thử nghiệm phương thức Chuyển khoản VietQR:**
   - Chọn radio button: **"Chuyển khoản trực tuyến qua VietQR (Napas 247)"**.
   - Bấm nút **"Xác nhận đặt hàng"**:
     + Backend tạo đơn hàng trong MySQL, sinh mã đơn dạng `#ORD-XXXXXX` với trạng thái `PENDING` (Chờ thanh toán).
     + Modal VietQR xuất hiện ngay giữa màn hình với **mã QR động chuẩn VietQR**, hiển thị rõ: Tên ngân hàng thụ hưởng, Số tài khoản, Tên chủ tài khoản, Số tiền chính xác và Nội dung chuyển khoản mã đơn.
   - **Demo tình huống Khách hàng bấm Đóng / Hủy Modal (Chứng minh không còn báo thành công ảo):**
     + Bấm nút **"Hủy bỏ"** hoặc dấu **X** đóng modal.
     + Hệ thống thông báo rõ ràng:  
       `"Đã đóng cửa sổ thanh toán. Đơn hàng #ORD-... đã được ghi nhận ở trạng thái Chờ thanh toán. Bạn có thể thanh toán sau trong mục Quản lý đơn hàng."`
     + Trình duyệt KHÔNG tự ý chuyển sang trang thành công giả tạo!
   - **Demo tình huống Khách hàng Chuyển khoản thành công:**
     + Mở lại thanh toán hoặc bấm **"Tôi đã chuyển khoản thành công"** ➔ Gọi API `POST /confirm-payment` ➔ Cập nhật trạng thái `PAID` ➔ Chuyển hướng sang trang [success.html](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/frontend/pages/success.html) hiển thị biên lai điện tử đẹp mắt.
5. **Trường hợp B: Phương thức Thanh toán khi nhận hàng (COD):**
   - Đặt đơn hàng mới với tùy chọn COD ➔ Đơn hàng được tạo với trạng thái `PENDING` và phương thức COD thành công.

#### 🎙️ Lời thoại với cô giáo:
> *"Dạ thưa cô, đây là điểm nhấn công nghệ quan trọng của đề tài: Tích hợp cổng thanh toán trực tuyến VietQR chuẩn liên ngân hàng Napas 247.*  
> *Khi đơn hàng được khởi tạo qua API `POST /api/v1/orders`, hệ thống tự sinh mã QR động chứa đầy đủ thông tin giao dịch.*  
> *Nhóm em đã xử lý chặt chẽ logic nghiệp vụ: Nếu khách hàng thoát hoặc đóng cửa sổ quét mã QR, hệ thống tuyệt đối không báo thành công ảo, mà giữ nguyên đơn ở trạng thái 'Chờ thanh toán' trong cơ sở dữ liệu để khách hàng có thể kiểm tra và thanh toán lại sau trong Hồ sơ cá nhân."*

---

### 🌟 FLOW 6: XEM LỊCH SỬ MUA HÀNG (ORDER HISTORY IN PROFILE)
- **Đường dẫn Clean URL:** `http://localhost:8080/profile`
- **Mục tiêu chứng minh:** Khách hàng theo dõi được toàn bộ đơn hàng của mình từ CSDL MySQL theo từng giai đoạn vòng đời đồ handmade.

#### 📌 Thao tác trình chiếu:
1. Mở trang `http://localhost:8080/profile` (hoặc click icon Avatar trên Header).
2. Chọn tab **"Lịch sử đơn hàng"**:
   - Hệ thống gọi API `GET /api/v1/orders?userId=...` nạp toàn bộ danh sách đơn hàng thực tế của khách hàng.
   - Đơn hàng vừa đặt ở Flow 5 hiển thị ngay trên cùng với đầy đủ: Mã đơn `#ORD-...`, Ngày giờ đặt, Danh sách sản phẩm kèm ảnh thu nhỏ, Tổng tiền thanh toán và Trạng thái `Chờ xác nhận`.
3. Bấm vào các tab lọc trạng thái: **"Chờ xác nhận"**, **"Đang chế tác"**, **"Đang giao"**, **"Đã giao"**, **"Đã hủy"** ➔ Danh sách lọc mượt mà theo từng chu kỳ đơn hàng.
4. Bấm nút **"Xem biên nhận"** ➔ Xem hóa đơn điện tử chi tiết có thể in hoặc lưu trữ.

#### 🎙️ Lời thoại với cô giáo:
> *"Tại trang Hồ sơ cá nhân, tab Lịch sử đơn hàng phản ánh chính xác trạng thái đơn hàng được đồng bộ thời gian thực từ cơ sở dữ liệu.*  
> *Giao diện được thiết kế phẳng, gọn gàng, chia theo từng nấc vòng đời đặc trưng của sản phẩm handmade từ lúc đặt cọc chế tác đến khi nhận hàng."*

---

### 🌟 FLOW 7: QUẢN TRỊ ADMIN - GIÁM SÁT & QUẢN LÝ ĐƠN HÀNG TOÀN SÀN
- **Đường dẫn Clean URL:** `http://localhost:8080/admin/orders`
- **Mục tiêu chứng minh:** Phân hệ Admin hoàn chỉnh mới xây dựng, kết nối trực tiếp với Database thông qua `AdminOrderController`. Cho phép Admin xem 4 thẻ KPI, lọc đơn theo trạng thái và cập nhật trạng thái đơn hàng thời gian thực.

#### 📌 Thao tác trình chiếu:
1. Mở trang Quản trị Đơn hàng: `http://localhost:8080/admin/orders`.
2. **Quan sát 4 Thẻ KPI thống kê trên cùng:**
   - 📦 **Tổng Đơn Hàng**: Đếm tự động từ DB (VD: 15 đơn hàng).
   - ⏳ **Chờ Xử Lý**: Số lượng đơn `PENDING` khách vừa đặt.
   - 🚚 **Đang Chế Tác & Giao**: Số lượng đơn đang trong quy trình làm đồ và vận chuyển.
   - 💰 **Doanh Thu Toàn Sàn**: Tổng tiền các đơn hợp lệ (VD: `10.790.000 đ`).
3. **Thao tác lọc Tab:**
   - Bấm vào Tab **"Chờ xác nhận"**: Lập tức lọc ra các đơn mới đặt.
   - Thử tìm kiếm tại ô Search: Gõ mã đơn `#ORD-701100` hoặc tên khách hàng ➔ Bảng hiển thị ngay đơn hàng cần tìm.
4. **Demo cập nhật trạng thái đơn hàng thời gian thực (Real-time Workflow):**
   - Tại đơn hàng `Chờ xác nhận`, bấm nút **"Bắt đầu chế tác"**:
     + Hộp thoại xác nhận xuất hiện ➔ Bấm OK.
     + Hệ thống gọi API `PUT /api/v1/admin/orders/{code}/status` chuyển trạng thái sang `CRAFTING`.
     + Thẻ đơn hàng lập tức đổi badge sang màu vàng cam: `🔨 Đang chế tác`. Thẻ KPI tự động cập nhật số liệu mới!
   - Tiếp tục bấm nút **"Bàn giao vận chuyển"** ➔ Trạng thái đổi sang `🚚 Đang giao hàng` (Xanh dương).
   - Khi giao thành công, bấm **"Hoàn thành đơn"** ➔ Đơn chuyển sang `✓ Đã hoàn thành` (Xanh lá) và thanh toán tự động cập nhật `Đã thanh toán`.
5. Bấm nút **"Chi tiết"** trên thẻ đơn hàng:
   - Modal hiển thị thông tin người nhận, SĐT, địa chỉ, danh sách món hàng, tổng tiền và mức phí hoa hồng sàn (10%).

#### 🎙️ Lời thoại với cô giáo:
> *"Dạ thưa cô, đây là phân hệ Quản trị Đơn hàng dành cho Ban quản trị sàn AuraCraft.*  
> *Toàn bộ dữ liệu hiển thị được nạp trực tiếp từ MySQL thông qua REST API `/api/v1/admin/orders` và `/api/v1/admin/orders/stats`.*  
> *Admin có thể theo dõi tổng quan số lượng đơn hàng, doanh thu và thực hiện điều phối chu trình chế tác trực tiếp: Từ tiếp nhận đơn, giao cho thợ chế tác, bàn giao đơn vị vận chuyển cho đến khi hoàn tất đơn hàng với phản hồi thời gian thực."*

---

### 🌟 FLOW 8: QUẢN TRỊ ADMIN - QUẢN LÝ THỢ THỦ CÔNG & TÀI KHOẢN
- **Đường dẫn Clean URL:** `http://localhost:8080/admin/users`
- **Mục tiêu chứng minh:** Đã tối ưu giao diện sạch đẹp, tinh tế; **loại bỏ hoàn toàn phần `[Mở portfolio]`** theo đúng yêu cầu; hiển thị phân loại vai trò rõ ràng và hỗ trợ Duyệt thợ 1 chạm.

#### 📌 Thao tác trình chiếu:
1. Mở trang: `http://localhost:8080/admin/users`.
2. Quan sát 4 thẻ thống kê: Tổng tài khoản, Người mua, Thợ chờ duyệt, Tài khoản tạm khóa.
3. Quan sát bảng danh sách tài khoản:
   - **Avatar & Thông tin:** Avatar tròn màu sắc sinh động theo tên, hiển thị Họ tên in đậm, email và SĐT.
   - **Vai trò:** Phân định rõ ràng: `🔨 Thợ thủ công` (Vàng kim), `👤 Người mua` (Xanh ngọc), `🛡️ Quản trị viên` (Tím).
   - **Hồ sơ / Giới thiệu:** Trình bày ngắn gọn, thanh lịch, **không còn chữ [Mở portfolio] rườm rà**.
4. **Demo Duyệt thợ 1 chạm (Quick Approve):**
   - Với tài khoản Thợ thủ công đang ở trạng thái *Chờ duyệt (`PENDING`)*, click vào nút **"Duyệt" (màu xanh lá)**:
     + Trạng thái lập tức đổi sang `Đang hoạt động`.
     + Thẻ thống kê *Thợ chờ duyệt* tự động giảm từ 1 về 0.
5. Thử đổi dropdown trạng thái của một tài khoản sang `Tạm khóa` ➔ Hệ thống lưu trực tiếp vào CSDL MySQL.

#### 🎙️ Lời thoại với cô giáo:
> *"Ở phân hệ Quản lý Thợ & Người dùng, nhóm đã thiết kế giao diện theo tiêu chuẩn Admin Dashboard hiện đại: Phân loại vai trò trực quan bằng hệ thống màu sắc nhận diện.*  
> *Đặc biệt đối với mô hình sàn thủ công, Admin có tính năng 'Duyệt nhanh thợ thủ công' chỉ với 1 click để kiểm duyệt chất lượng nghệ nhân trước khi họ được phép đăng bán sản phẩm lên sàn."*

---

### 🌟 FLOW 9: QUẢN TRỊ ADMIN - BÁO CÁO TÀI CHÍNH & BIỂU ĐỒ DOANH THU
- **Đường dẫn:** `http://localhost:8080/pages/admin-finance.html`
- **Mục tiêu chứng minh:** Khả năng thống kê phân tích kinh doanh thông minh với Biểu đồ cột lọc theo khoảng thời gian tùy chọn và Biểu đồ tròn cơ cấu ngành hàng.

#### 📌 Thao tác trình chiếu:
1. Mở trang: `http://localhost:8080/pages/admin-finance.html`.
2. **Quan sát Biểu đồ cột (Bar Chart) - Doanh thu theo thời gian:**
   - Dữ liệu đơn hàng rải rác đều đặn qua các ngày từ 10/10 đến 23/10, tạo các cột cao thấp tự nhiên, chân thực.
   - Bấm các nút lọc nhanh: **"7 ngày qua"**, **"30 ngày qua"**, **"Tất cả"** ➔ Biểu đồ Chart.js tự động co giãn và vẽ lại dữ liệu ngay lập tức.
   - **Lọc theo khoảng ngày tùy chọn:** Chọn Từ ngày `2026-10-15` Đến ngày `2026-10-23` ➔ Bấm **"Lọc dữ liệu"**: Biểu đồ hiển thị chính xác số liệu trong khoảng thời gian đã chọn.
3. **Quan sát Biểu đồ tròn (Doughnut Chart) - Tỷ trọng theo danh mục:**
   - Hiển thị tỷ trọng doanh thu thực tế giữa: *Vòng tay Charm & Lắc tay (72%)*, *Dây chuyền & Mặt đá (25%)*, *Gấu bông & Đồ len móc (3%)*.
4. Bảng kê đối soát giải ngân hoa hồng cho từng shop nghệ nhân với mức phí sàn 10%.

#### 🎙️ Lời thoại với cô giáo:
> *"Dạ thưa cô, phân hệ Báo cáo Tài chính tích hợp thư viện Chart.js kết nối với REST API `/api/v1/admin/analytics/revenue-chart` và `/category-chart`.*  
> *Hệ thống tự động trích xuất phí hoa hồng sàn 10% trên mỗi đơn hàng thành công và cho phép người quản trị linh hoạt chọn bất kỳ khoảng thời gian nào để kiểm toán dòng tiền và đánh giá sức mua của từng ngành hàng thủ công."*

---

## 💡 3. BỘ CÂU HỎI PHẢN BIỆN THƯỜNG GẶP CỦA GIẢNG VIÊN & CÁCH TRẢ LỜI XUẤT SẮC

### ❓ Câu 1: Hệ thống của em lưu trữ dữ liệu ở đâu? Có kết nối Database thật không?
> **Trả lời:**  
> *"Dạ thưa cô, toàn bộ hệ thống lưu trữ trên cơ sở dữ liệu quan hệ MySQL với 14 bảng quan hệ chuẩn (users, products, categories, orders, order_items, payments, artisans...). Backend Spring Boot sử dụng Spring Data JPA / Hibernate để ORM ánh xạ thực thể. Mọi thao tác từ Đăng ký tài khoản, Thêm giỏ hàng, Đặt đơn hàng, Cập nhật trạng thái đều thực thi câu lệnh SQL thật và lưu vĩnh viễn vào MySQL Database."*

### ❓ Câu 2: Tại sao các đường dẫn trên thanh địa chỉ lại không có đuôi `.html`?
> **Trả lời:**  
> *"Dạ thưa cô, trong môi trường sản phẩm thực tế, không có sàn TMĐT nào để lộ đuôi file `.html`. Nhóm em đã cấu hình `ViewControllerRegistry` trong `WebConfig.java` và cấp quyền truy cập trong `SecurityConfig.java` của Spring Boot để định tuyến Clean URLs (Friendly URLs). Điều này giúp URL ngắn gọn, chuyên nghiệp, bảo mật cấu trúc thư mục máy chủ và tối ưu hóa SEO."*

### ❓ Câu 3: Cơ chế thanh toán VietQR hoạt động như thế nào và nếu khách thoát thì xử lý ra sao?
> **Trả lời:**  
> *"Dạ thưa cô, hệ thống tích hợp chuẩn VietQR Napas 247. Khi khách đặt hàng, Backend tạo đơn hàng `PENDING` và sinh mã QR động chứa sẵn: Số tài khoản sàn, Mã ngân hàng, Số tiền và Nội dung `ORD-MãĐơn`. Nếu khách quét mã và thanh toán, đơn sẽ chuyển sang `PAID`. Còn nếu khách đóng modal QR hoặc chưa thanh toán, hệ thống ghi nhận đơn ở trạng thái Chờ thanh toán, tuyệt đối không báo thành công ảo, giúp bảo toàn tính toàn vẹn dữ liệu kế toán của sàn."*

### ❓ Câu 4: Làm thế nào để Admin cập nhật trạng thái đơn hàng thời gian thực?
> **Trả lời:**  
> *"Dạ thưa cô, ở trang Quản lý đơn hàng Admin, mỗi nút bấm thao tác (Bắt đầu chế tác, Bàn giao vận chuyển, Hoàn thành, Hủy đơn) đều gọi trực tiếp REST API `PUT /api/v1/admin/orders/{orderCode}/status`. Backend kiểm tra tính hợp lệ của chu trình đơn, cập nhật vào database và trả về dữ liệu mới để giao diện thay đổi badge màu sắc ngay lập tức mà không cần reload trang."*
