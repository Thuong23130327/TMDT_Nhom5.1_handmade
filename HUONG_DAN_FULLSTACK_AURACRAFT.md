# CẨM NANG HƯỚNG DẪN DỰ ÁN AURACRAFT — TÀI LIỆU FULLSTACK MASTER (A-Z)

> **Dành cho**: Cả 4 thành viên nhóm 5.1 — Thương mại điện tử đồ thủ công & Handmade AuraCraft.  
> **Mục tiêu**: Một tài liệu duy nhất tổng hợp toàn bộ thỏa thuận phiên bản, hướng dẫn cài đặt môi trường từ A đến Z, quy tắc code, phân chia 4 module và phân tích chi tiết luồng code mẫu Fullstack (Admin Users) để cả nhóm làm theo.

---

## MỤC LỤC
1. [Thống Nhất Phiên Bản & Môi Trường Kỹ Thuật (Chống Xung Đột)](#1-thống-nhất-phiên-bản--môi-trường-kỹ-thuật-chống-xung-đột)
2. [Hướng Dẫn Cài Đặt Môi Trường Từ A Đến Z](#2-hướng-dẫn-cài-đặt-môi-trường-từ-a-đến-z)
   - [Bước 1: Cài đặt và cấu hình WampServer (MySQL)](#bước-1-cài-đặt-và-cấu-hình-wampserver-mysql)
   - [Bước 2: Tạo CSDL & Import dữ liệu mẫu](#bước-2-tạo-csdl--import-dữ-liệu-mẫu)
   - [Bước 3: Mở & Cấu hình Backend trên IntelliJ IDEA](#bước-3-mở--cấu-hình-backend-trên-intellij-idea)
   - [Bước 4: Mở Frontend trên Trình duyệt / Live Server](#bước-4-mở-frontend-trên-trình-duyệt--live-server)
3. [Kiến Trúc Phân Hệ, Phân Công Trách Nhiệm & Tích Hợp Kỹ Thuật (Data Mining & AI)](#3-kiến-trúc-phân-hệ-phân-công-trách-nhiệm--tích-hợp-kỹ-thuật-data-mining--ai)
4. [Quy Tắc Thống Nhất Khi Code (Conventions & Git Workflow)](#4-quy-tắc-thống-nhất-khi-code-conventions--git-workflow)
5. [Giải Thích Flow Code & Hướng Dẫn Chi Tiết Ví Dụ Mẫu (Admin Users)](#5-giải-thích-flow-code--hướng-dẫn-chi-tiết-ví-dụ-mẫu-admin-users)
   - [5.1. Kiến trúc phân tầng chuẩn Spring Boot (3-Tier Enterprise Architecture)](#51-kiến-trúc-phân-tầng-chuẩn-spring-boot-3-tier-enterprise-architecture)
   - [5.2. Luồng dữ liệu chạy thực tế (End-to-End Flow)](#52-luồng-dữ-liệu-chạy-thực-tế-end-to-end-flow)
   - [5.3. Chi tiết mã nguồn từng file mẫu](#53-chi-tiết-mã-nguồn-từng-file-mẫu)
   - [5.4. Công thức 5 bước nhân bản cho mọi tính năng mới](#54-công-thức-5-bước-nhân-bản-cho-mọi-tính-năng-mới)
6. [Các Lưu Ý Kỹ Thuật Quan Trọng & Phòng Ngừa Sự Cố](#6-các-lưu-ý-kỹ-thuật-quan-trọng--phòng-ngừa-sự-cố)
7. [Bảng Phân Loại File: Chỗ Cần Sửa Cho Hợp Máy & File TUYỆT ĐỐI CẤM SỬA](#7-bảng-phân-loại-file-chỗ-cần-sửa-cho-hợp-máy--file-tuyệt-đối-cấm-sửa)
8. [Quy Định Commit Git: File Nào Được Commit, File Nào CẤM Commit & .gitignore](#8-quy-định-commit-git-file-nào-được-commit-file-nào-cấm-commit--gitignore)
9. [Hướng Dẫn Sử Dụng Sourcetree Từ A Đến Z (Clone, Mở Dự Án, Add, Commit, Push, Pull & Tạo Nhánh)](#9-hướng-dẫn-sử-dụng-sourcetree-từ-a-đến-z-clone-mở-dự-án-add-commit-push-pull--tạo-nhánh)

---

## 1. Thống Nhất Phiên Bản & Môi Trường Kỹ Thuật (Chống Xung Đột)

Để code của 4 thành viên chạy đồng nhất và **không bị lỗi xung đột phiên bản**, cả nhóm bắt buộc tuân theo bảng thông số sau:

| Thành phần | Phiên bản chuẩn | Ghi chú quan trọng |
|---|:---:|---|
| **Java JDK** | **Java 11 (LTS)** | Khuyên dùng: `Microsoft OpenJDK 11` hoặc `Amazon Corretto 11`. |
| **Spring Boot** | **2.7.18** | Đã khai báo chuẩn trong `backend/pom.xml`. Sử dụng Maven Wrapper kèm sẵn (`.\mvnw.cmd`). |
| **Hệ quản trị CSDL** | **MySQL 8.x** | Cài qua **WampServer 3.x** (hoặc XAMPP). Chạy trên cổng **`3306`**. |
| **User / Password DB** | `root` / **(ĐỂ TRỐNG)** | **Mật khẩu rỗng `""`**, không đặt `123456` vì WampServer mặc định không có mật khẩu. |
| **Tên Database** | **`auracraft_db`** | Bảng mã bắt buộc: **`utf8mb4`**, Collation: **`utf8mb4_unicode_ci`**. |
| **Cổng Backend API** | **`8080`** | Địa chỉ gốc: `http://localhost:8080/api/v1/...` |
| **Cổng Frontend Web** | **`5500` / `63342`** | `5500` (VS Code Live Server) hoặc `63342` (máy chủ nội bộ IntelliJ IDEA). |
| **Lombok Plugin** | Tích hợp sẵn | Bắt buộc bật **Annotation Processing** trong IntelliJ để không bị lỗi Getter/Setter. |

---

## 2. Hướng Dẫn Cài Đặt Môi Trường Từ A Đến Z

### Bước 1: Cài đặt và cấu hình WampServer (MySQL)
1. Tải và cài đặt **WampServer 64-bit** (bản chuẩn ~374MB).
2. Khởi động WampServer và nhìn xuống thanh Taskbar (góc phải màn hình):
   - Chờ biểu tượng chữ **`W`** chuyển sang **MÀU XANH LÁ CÂY** (Green) ➔ Apache và MySQL đã chạy tốt.
   - Đảm bảo MySQL đang chạy ở cổng **`3306`**.

### Bước 2: Tạo CSDL & Import dữ liệu mẫu
1. Mở công cụ quản trị (Navicat, HeidiSQL hoặc phpMyAdmin tại `http://localhost/phpmyadmin`):
   - **Host**: `localhost`
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: *Để trống hoàn toàn*
2. Tạo Database mới:
   - Tên database: **`auracraft_db`**
   - Bảng mã (Character set): **`utf8mb4`**
   - Collation: **`utf8mb4_unicode_ci`**
3. Mở file [DATABASE_SCHEMA_AURACRAFT.sql](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/DATABASE_SCHEMA_AURACRAFT.sql) trong thư mục dự án và thực thi (Execute) vào database `auracraft_db` vừa tạo. Toàn bộ 14 bảng và dữ liệu khởi tạo sẽ được nạp đầy đủ.

### Bước 3: Mở & Cấu hình Backend trên IntelliJ IDEA
1. Khởi động IntelliJ IDEA ➔ Bấm **Open** ➔ Chọn thư mục **`TMDT_Nhom5.1_handmade/backend`**.
2. Kiểm tra JDK:
   - Vào `File` ➔ `Project Structure` ➔ mục `Project`: Chọn **SDK 11**.
3. **Bật Annotation Processing cho Lombok (Rất quan trọng):**
   - Vào `File` ➔ `Settings` (phím tắt `Ctrl + Alt + S`).
   - Tìm kiếm: `Annotation Processors` (nằm trong `Build, Execution, Deployment` ➔ `Compiler`).
   - Tích chọn ô: **`Enable annotation processing`** ➔ Bấm **OK**.
4. Kiểm tra file [application.properties](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/resources/application.properties):
   ```properties
   server.port=8080
   spring.datasource.url=jdbc:mysql://localhost:3306/auracraft_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
   spring.datasource.username=root
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   ```
5. Chạy Backend: Mở file [HandmadeApplication.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/HandmadeApplication.java) ➔ Bấm nút **Run (▶)** (hoặc `Shift + F10`).
   - Khi console hiện: `Tomcat started on port(s): 8080 (http)` ➔ Backend đã chạy thành công!

### Bước 4: Mở Frontend trên Trình duyệt / Live Server
- **Cách 1 (Mở bằng IntelliJ):** Mở file [admin-users.html](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/frontend/pages/admin-users.html) ➔ Di chuột góc trên cùng bên phải khung code ➔ Bấm icon **Chrome**.
- **Cách 2 (Mở bằng VS Code):** Click chuột phải vào `admin-users.html` ➔ Chọn **Open with Live Server**.
- Khi mở lên, dòng trạng thái báo: **`✓ Đang kết nối trực tiếp CSDL MySQL qua Spring Boot API (cổng 8080)`** cùng 8 tài khoản mẫu hiển thị đầy đủ là bạn đã thiết lập hoàn tất 100%!

---

## 3. Kiến Trúc Phân Hệ, Phân Công Trách Nhiệm & Tích Hợp Kỹ Thuật (Data Mining & AI)

> [!NOTE]
> **Ranh Giới Phạm Vi Dự Án (Project Scope Boundary):**
> Nhóm tập trung triển khai đầy đủ và hoàn thiện các chức năng theo đúng đề cương yêu cầu (bao gồm 13 chức năng bắt buộc, 10 chức năng tự chọn và 1 phân hệ tùy biến sản phẩm 2D). Dự án tích hợp các giải thuật từ môn **Khai phá dữ liệu (Data Mining - Apriori)** và **Trí tuệ nhân tạo (Google Gemini AI)** nhằm giải quyết bài toán gợi ý thông minh và hỗ trợ phân tích quản trị. Các tính năng nằm ngoài phạm vi đề tài (như WebSocket Chat thời gian thực hay Livestream) được loại trừ để tối ưu chất lượng kiểm thử và tiến độ dự án.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      HỆ THỐNG AURACRAFT — PHÂN CHIA 4 THÀNH VIÊN                       │
├─────────────────────┬─────────────────────┬────────────────────┬───────────────────────┤
│      PHONG          │       YẾN           │       PHÁT         │      THƯƠNG           │
│  Xác thực, Auth &   │  Danh mục, SP &     │  Giỏ hàng, Đơn &   │  Quản trị Admin,      │
│  Customizer 2D      │  Khai phá dữ liệu   │  Thanh toán online │  Thống kê & Trí tuệ   │
│                     │  (Data Mining)      │                    │  nhân tạo (AI Engine) │
│  Nhánh: `phong`     │  Nhánh: `yen`       │  Nhánh: `phat`     │  Nhánh: `thuong`      │
└─────────────────────┴─────────────────────┴────────────────────┴───────────────────────┘
```

---

### 📋 BẢNG PHÂN CHIA CHI TIẾT THEO YÊU CẦU ĐỀ TÀI

| Thành viên & Nhánh Git | Chức năng BẮT BUỘC đảm nhận | Chức năng TỰ CHỌN đảm nhận | Tính năng NÂNG CAO & KỸ THUẬT CHUYÊN SÂU | Tập tin Backend & Frontend chính |
|---|---|---|---|---|
| **PHONG**<br>`phong` | 1. Đăng ký tài khoản (gửi email xác thực)<br>2. Đăng nhập hệ thống<br>3. Đăng xuất an toàn<br>4. Khôi phục mật khẩu qua email<br>5. Xem lịch sử mua hàng cá nhân | 1. Đăng nhập liên kết Google (OAuth2)<br>2. Cập nhật thông tin hồ sơ cá nhân (Avatar, SĐT, địa chỉ) | **Nâng cấp Customizer 2D trực quan**: Tự phối charm vòng tay theo slot, tính giá tức thời (Real-time Pricing), lưu cấu hình JSON xuống CSDL | • `User.java`, `UserRepository.java`<br>• `CustomMaterial.java`, `CustomDesign.java`<br>• `AuthService.java`, `UserService.java`<br>• `CustomDesignService.java`<br>• `AuthController.java`, `CustomDesignController.java`<br>• `login.html`, `register.html`, `forgot.html`, `profile.html`, `customizer.html` |
| **YẾN**<br>`yen` | 1. Xem chi tiết sản phẩm (gallery hình ảnh, biến thể màu sắc/kích thước, thông số) | 1. Lọc sản phẩm đa tiêu chí (danh mục, khoảng giá, chất liệu)<br>2. Sắp xếp thứ tự hiển thị (giá tăng/giảm, bán chạy, mới nhất, lượt xem)<br>3. Tìm kiếm gian hàng nghệ nhân<br>4. Xem sản phẩm theo gian hàng (`shop-profile.html`)<br>5. Hiển thị trang chủ: Sản phẩm mới nhất & Sản phẩm xem nhiều nhất | **Khai phá dữ liệu (Data Mining - Apriori Algorithm)**: Khai phá tập mục phổ biến và luật kết hợp từ lịch sử đơn hàng nhằm xây dựng cụm sản phẩm "Thường được mua cùng nhau" (Market Basket Analysis) | • `Category.java`, `Product.java`, `ProductImage.java`<br>• `ProductRepository.java`<br>• `ProductService.java`, `AprioriMiningService.java`<br>• `ProductController.java`<br>• `index.html`, `products.html`, `product-detail.html`, `shop-profile.html` |
| **PHÁT**<br>`phat` | 1. Quản lý giỏ hàng (thêm, cập nhật số lượng, xóa sản phẩm)<br>2. Đặt hàng (Checkout - nhập địa chỉ nhận hàng, ghi chú)<br>3. Thanh toán trực tuyến (tích hợp mã VietQR động / VNPay Sandbox) | 1. Cập nhật trạng thái vòng đời đơn hàng (PENDING ➔ CRAFTING ➔ SHIPPING ➔ COMPLETED ➔ CANCELLED) | Tự động sinh mã thanh toán QR theo định dạng chuẩn EMVCo kèm mã đơn hàng | • `CartItem.java`, `Order.java`, `OrderItem.java`<br>• `OrderRepository.java`, `CartRepository.java`<br>• `OrderService.java`, `PaymentService.java`<br>• `OrderController.java`, `CartController.java`<br>• `cart.html`, `checkout.html`, `success.html`, `order-detail.html` |
| **THƯƠNG**<br>`thuong` | 1. Admin quản lý cơ bản: Người dùng *(đã có code mẫu)*, Sản phẩm, Đơn hàng<br>2. Quản lý cơ bản của người bán (Seller Dashboard: kho sản phẩm, doanh thu xưởng, tiến độ đơn)<br>3. Thống kê biểu đồ cột theo khoảng thời gian tùy chọn (từ ngày... đến ngày...)<br>4. Thống kê biểu đồ tròn phân tích tỷ trọng doanh thu theo danh mục | 1. Chợ tiếp nhận báo giá (Khách hàng đăng tải thiết kế yêu cầu, các thợ thủ công gửi báo giá) | **Tích hợp Trí tuệ nhân tạo (Google Gemini AI Engine)**: Trợ lý tư vấn chọn quà thông minh cho khách hàng (AI Stylist) và Trợ lý phân tích insight doanh số kinh doanh cho Admin (AI Executive Insights) | • `CustomRequest.java`, `Quote.java`<br>• `AdminUserController.java`, `AdminAnalyticsController.java`<br>• `GeminiAiService.java`, `AnalyticsService.java`<br>• `buyer-request-form.html`, `seller-dashboard.html`, `admin-*.html` |

---

### 🧠 ĐẶC TẢ KỸ THUẬT: KHAI PHÁ DỮ LIỆU (DATA MINING) & TRÍ TUỆ NHÂN TẠO (AI)

Hệ thống ứng dụng các phương pháp học thuật nhằm giải quyết các bài toán thực tiễn trong thương mại điện tử đồ thủ công:

#### 1. Khai phá dữ liệu: Thuật toán Apriori (Phân tích giỏ hàng - Market Basket Analysis)
* **Mục tiêu bài toán**: Xác định các mẫu sản phẩm thường xuyên được mua cùng nhau trong các giao dịch đơn hàng để đưa ra khuyến nghị bán kèm (Cross-selling).
* **Cơ sở lý thuyết**:
  - Tập dữ liệu giao dịch: $D = \{T_1, T_2, \dots, T_n\}$ trích xuất từ bảng `order_items` theo từng `order_id`.
  - Một luật kết hợp có dạng $X \Rightarrow Y$, trong đó $X, Y \subset I$ và $X \cap Y = \emptyset$.
  - Các độ đo thống kê được tính toán:
    $$\text{Support}(X \Rightarrow Y) = \frac{|\{T \in D \mid X \cup Y \subseteq T\}|}{|D|}$$
    $$\text{Confidence}(X \Rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$$
    $$\text{Lift}(X \Rightarrow Y) = \frac{\text{Confidence}(X \Rightarrow Y)}{\text{Support}(Y)}$$
* **Quy trình triển khai (Thành viên phụ trách: Yến)**:
  1. Service `AprioriMiningService.java` định kỳ xử lý các giao dịch hoàn tất từ `order_items`.
  2. Lọc các tập mục phổ biến đạt ngưỡng hỗ trợ tối thiểu ($\text{min\_sup} \ge 5\%$) và sinh luật kết hợp với độ tin cậy tối thiểu ($\text{min\_conf} \ge 50\%$).
  3. Cung cấp API `GET /api/v1/products/{id}/frequently-bought-together` để giao diện [product-detail.html](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/frontend/pages/product-detail.html) hiển thị cụm **"Combo thường được mua cùng nhau"** kèm nút thêm nhanh cả 2 sản phẩm vào giỏ hàng.

#### 2. Học máy: Đo lường độ tương đồng Cosine (Content-Based Recommendation)
* **Mục tiêu bài toán**: Tìm kiếm các sản phẩm có đặc trưng kỹ thuật và phân khúc tương đồng để hiển thị tại mục "Sản phẩm tương tự".
* **Cơ sở lý thuyết**: Biểu diễn sản phẩm dưới dạng vector đặc trưng $\vec{V} = [w_1 \cdot \text{CategoryId}, w_2 \cdot \text{NormalizedPrice}, w_3 \cdot \text{MaterialScore}]$. Độ tương đồng giữa hai sản phẩm $A$ và $B$ được xác định theo công thức góc Cosine:
  $$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$

#### 3. Ứng Dụng Trí Tuệ Nhân Tạo: Google Gemini AI (Thành viên phụ trách: Thương)
Dự án tích hợp mô hình ngôn ngữ lớn (Google Gemini API) vào Spring Boot thông qua lớp dịch vụ `GeminiAiService.java`:
* **Phân hệ Khách hàng (AI Gift Stylist)**:
  - Tiếp nhận truy vấn tự nhiên từ người dùng (ví dụ: *"Tìm quà kỷ niệm tặng bạn gái mệnh Mộc, ngân sách dưới 300.000đ"*).
  - Hệ thống kết hợp System Prompt định dạng chuẩn JSON và danh mục sản phẩm hiện có trong CSDL để Gemini phân tích và trả về 2 sản phẩm phù hợp nhất kèm lý do tư vấn chuyên môn.
* **Phân hệ Quản trị (AI Executive Insights)**:
  - Tự động phân tích các chỉ số doanh thu tổng hợp từ bảng `orders` theo mốc thời gian.
  - Sinh báo cáo nhận định kinh doanh tóm tắt: các mặt hàng tăng trưởng tốt, danh mục cần đẩy mạnh truyền thông và cảnh báo các sản phẩm tồn kho cần xử lý.

---

### 🎨 ĐẶC TẢ PHÂN HỆ TÙY BIẾN SẢN PHẨM 2D (CUSTOMIZER) & BÁO GIÁ TỨC THỜI (Thành viên phụ trách: Phong)

Phân hệ Customizer trực quan trên web giải quyết bài toán đặt chế tác đồ thủ công cá nhân hóa:

1. **Mô hình linh kiện theo vị trí (Slot Component Model)**:
   - Giao diện [customizer.html](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/frontend/pages/customizer.html) trực quan hóa phôi vòng tay với 16 vị trí mắt xích (16 Slots).
   - Người dùng lựa chọn linh kiện/charm từ thư viện nguyên liệu (`custom_materials`) để gán trực tiếp vào từng slot tọa độ.
2. **Cơ chế tính toán chi phí tức thời (Real-time Cost Calculation Engine)**:
   - Tổng chi phí sản phẩm được cập nhật theo thời gian thực tại phía Client:
     $$\text{Tổng giá} = \text{Giá phôi cơ sở} + \sum_{k=1}^{N} \text{Giá linh kiện slot}_k$$
3. **Mô hình lưu trữ cấu hình JSON xuống CSDL**:
   - Khi hoàn tất, cấu hình được tuần tự hóa (serialize) thành chuỗi JSON:
     `{"base_id": 1, "slots": [{"slot_index": 1, "material_id": 4, "price": 25000}, ...]}`
   - Dữ liệu được lưu vào trường `configuration_json` trong bảng `custom_designs`. Xưởng thủ công truy cập Seller Dashboard để xem chính xác bản vẽ phối màu và tiến hành gia công thực tế.

---

## 4. Quy Tắc Thống Nhất Khi Code (Conventions & Git Workflow)

### 4.1. Quy tắc Git nhánh theo tên thành viên (Tuyệt đối không push đè `main`)
1. Nhánh `main`: Chỉ dùng để lưu bản hoàn thiện cuối cùng khi nộp bài.
2. Nhánh `develop`: Là nhánh tích hợp chung của cả nhóm.
3. **Mỗi thành viên tạo và làm việc trên nhánh mang tên mình** (tách từ `develop`):
   - **Phong**: `phong` *(Module Xác thực người dùng & Customizer 2D trực quan)*
   - **Yến**: `yen` *(Module Danh mục, Sản phẩm & Khai phá dữ liệu - Catalog & Data Mining)*
   - **Phát**: `phat` *(Module Giỏ hàng, Đặt hàng & Thanh toán trực tuyến - Cart, Order & Payment)*
   - **Thương**: `thuong` *(Module Quản trị hệ thống, Thống kê biểu đồ & Trí tuệ nhân tạo - Admin & AI Engine)*
4. Khi hoàn thành một tính năng, tạo **Pull Request (PR)** từ nhánh của mình vào nhánh `develop` để cả nhóm cùng kiểm tra.

### 4.2. Chuẩn định dạng phản hồi API (`ApiResponse<T>`)
Tất cả API Backend đều phải bọc trong class [ApiResponse.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/dto/ApiResponse.java):
```json
// Khi thành công:
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... } // hoặc danh sách [ ... ]
}

// Khi có lỗi:
{
  "success": false,
  "message": "Chi tiết câu thông báo lỗi",
  "data": null
}
```

### 4.3. Quy chuẩn đặt tên (Naming Conventions)
- **Tên Class Java**: PascalCase (`ProductService`, `OrderController`, `UserRepository`).
- **Tên Biến & Hàm Java**: camelCase (`totalUsers`, `getUserById()`, `updateStatus()`).
- **Tên Cột trong CSDL**: snake_case (`full_name`, `created_at`, `portfolio_url`).
- **Đường dẫn REST API**: kebab-case kèm phiên bản (`/api/v1/products`, `/api/v1/admin/users/stats`).
- **Frontend JavaScript**: Dùng `async/await` và `fetch()`, luôn có `try...catch` để bắt lỗi và hiển thị thông báo phản hồi (Feedback) cho người dùng.

---

## 5. Giải Thích Flow Code & Hướng Dẫn Chi Tiết Ví Dụ Mẫu (Admin Users)

Chức năng **Quản lý tài khoản Admin (Admin Users)** đã được cài đặt mẫu hoàn chỉnh 100% để cả nhóm nhìn vào học theo.

### 5.1. Kiến trúc phân tầng chuẩn Spring Boot (3-Tier Enterprise Architecture)
Hệ thống Backend được thiết kế theo mô hình 3 tầng phân tách rõ ràng trách nhiệm (Separation of Concerns):

```
[NGƯỜI DÙNG TƯƠNG TÁC TRÊN TRÌNH DUYỆT]
               │
               ▼
[FRONTEND: admin-users.html + admin-users.js]
               │ (1) Gửi HTTP Request: fetch("http://localhost:8080/api/v1/admin/users")
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND SPRING BOOT (Cổng 8080)                │
│                                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 1. Presentation Layer   │  (AdminUserController): Tiếp nhận   │
│  │    (Controller)         │  HTTP Request, validate tham số     │
│  │                         │  và trả về ApiResponse<T> chuẩn hóa │
│  └────────────┬────────────┘                                     │
│               ▼                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 2. Business Logic Layer │  (AdminUserService): Thực thi các quy│
│  │    (Service)            │  tắc nghiệp vụ, xử lý logic dữ liệu │
│  │                         │  và quản lý Transaction             │
│  └────────────┬────────────┘                                     │
│               ▼                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 3. Data Access Layer    │  (UserRepository): Thực thi truy vấn│
│  │    (Repository)         │  CSDL thông qua JPA & Hibernate ORM │
│  └────────────┬────────────┘                                     │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │ (2) Truy vấn CSDL
                ▼
       [DATABASE: MySQL (auracraft_db)]
```

### 5.2. Luồng dữ liệu chạy thực tế (End-to-End Flow)
Khi Admin vào trang web và đổi trạng thái của một thợ từ **"Chờ duyệt" (PENDING)** sang **"Đang hoạt động" (ACTIVE)**:
1. **Frontend**: Người dùng chọn dropdown ➔ `admin-users.js` gửi lệnh:
   ```javascript
   PUT http://localhost:8080/api/v1/admin/users/7/status
   Body: { "status": "active" }
   ```
2. **Controller**: `AdminUserController.updateStatus()` tiếp nhận ID `7` và request body.
3. **Service**: `AdminUserService.updateUserStatus()` tìm kiếm User ID 7 trong DB, gán `user.setStatus(ACTIVE)` và gọi lưu.
4. **Repository**: `UserRepository.save(user)` thực thi câu lệnh SQL `UPDATE users SET status = 'ACTIVE' WHERE id = 7;`.
5. **Phản hồi**: Backend trả về JSON:
   `{"success": true, "message": "Cập nhật trạng thái thành công!", "data": {...}}`.
6. **Frontend cập nhật UI**: `admin-users.js` nhận phản hồi thành công ➔ Gọi lại `fetchStats()` để cập nhật 4 thẻ thống kê trên đầu trang ngay lập tức mà không cần F5 trình duyệt!

---

### 5.3. Chi tiết mã nguồn từng file mẫu

#### 1. Entity: [User.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/model/User.java)
Ánh xạ trực tiếp tới bảng `users` trong MySQL. Dùng Lombok để tự động sinh Getter, Setter, Builder:
```java
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // BUYER, ARTISAN, ADMIN, ROLE_BUYER, ROLE_ARTISAN, ROLE_ADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // ACTIVE, PENDING, SUSPENDED

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Role { BUYER, ARTISAN, ADMIN, ROLE_BUYER, ROLE_ARTISAN, ROLE_ADMIN }
    public enum UserStatus { ACTIVE, PENDING, SUSPENDED }
}
```

#### 2. Repository: [UserRepository.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/repository/UserRepository.java)
Kế thừa `JpaRepository` để tự động có các hàm CRUD (`findAll`, `findById`, `save`, `deleteById`) và định nghĩa thêm hàm tìm kiếm/đếm số lượng:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    long countByRoleIn(List<User.Role> roles);
    long countByRoleInAndStatus(List<User.Role> roles, User.UserStatus status);
    long countByStatus(User.UserStatus status);

    @Query("SELECT u FROM User u WHERE " +
           "(:roles IS NULL OR u.role IN :roles) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchUsers(@Param("roles") List<User.Role> roles,
                           @Param("status") User.UserStatus status,
                           @Param("keyword") String keyword);
}
```

#### 3. DTOs: [AdminUserDtos.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/dto/AdminUserDtos.java)
Định dạng dữ liệu trả về cho Frontend, không để lộ mật khẩu người dùng:
```java
public class AdminUserDtos {
    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class UserStatsResponse {
        private long totalUsers;
        private long buyerUsers;
        private long pendingArtisans;
        private long suspendedUsers;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class UserListItemResponse {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String status;
        private String introduction;
        private String portfolio;
        private LocalDateTime createdAt;

        public static UserListItemResponse fromEntity(User user) { ... }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateStatusRequest {
        private String status;
    }
}
```

#### 4. Service: [AdminUserService.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/service/AdminUserService.java)
Xử lý toàn bộ nghiệp vụ thống kê, tìm kiếm lọc và cập nhật:
```java
@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;

    public UserStatsResponse getStats() { ... }
    public List<UserListItemResponse> getUsers(String roleStr, String statusStr, String keyword) { ... }

    @Transactional
    public UserListItemResponse updateUserStatus(Long userId, String newStatusStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + userId));
        user.setStatus(User.UserStatus.valueOf(newStatusStr.trim().toUpperCase()));
        return UserListItemResponse.fromEntity(userRepository.save(user));
    }
}
```

#### 5. Controller: [AdminUserController.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/controller/AdminUserController.java)
Định nghĩa 3 REST API rõ ràng:
```java
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping("/stats")
    public ApiResponse<UserStatsResponse> getStats() {
        return ApiResponse.ok(adminUserService.getStats());
    }

    @GetMapping
    public ApiResponse<List<UserListItemResponse>> getUsers(
            @RequestParam(required = false, defaultValue = "all") String role,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(adminUserService.getUsers(role, status, keyword));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<UserListItemResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái thành công!", 
                              adminUserService.updateUserStatus(id, request.getStatus()));
    }
}
```

#### 6. Frontend: [admin-users.js](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/frontend/assets/js/admin-users.js)
Gọi API qua `fetch()`, xử lý lọc tìm kiếm có debounce và tự động fallback sang `localStorage` nếu Backend chưa bật.

---

### 5.4. Công thức 5 bước nhân bản cho mọi tính năng mới

Khi bạn làm các chức năng tiếp theo (Danh mục, Sản phẩm, Giỏ hàng, Đơn hàng, Customizer), cứ làm **đúng 5 bước sau theo thứ tự**:

1. **Bước 1 (Entity)**: Tạo class trong `com.example.Handmade.model` gắn nhãn `@Entity` và `@Table`.
2. **Bước 2 (Repository)**: Tạo interface trong `com.example.Handmade.repository` kế thừa `JpaRepository<Entity, Long>`.
3. **Bước 3 (DTOs)**: Tạo request/response class trong `com.example.Handmade.dto`.
4. **Bước 4 (Service)**: Tạo class trong `com.example.Handmade.service` gắn `@Service`, viết hàm xử lý logic.
5. **Bước 5 (Controller & FE)**: Tạo class trong `com.example.Handmade.controller` gắn `@RestController`, rồi mở file JS tương ứng trong `frontend/assets/js/` thay thế mock data bằng lệnh `fetch('http://localhost:8080/api/v1/...')`.

---

## 6. Các Lưu Ý Kỹ Thuật Quan Trọng & Phòng Ngừa Sự Cố

> [!WARNING]
> Các thành viên cần nắm vững 5 lưu ý kỹ thuật sau nhằm đảm bảo hệ thống vận hành ổn định và đồng nhất:

1. **Lỗi `Access denied for user 'root'@'localhost'`:**
   - *Nguyên nhân*: Do điền mật khẩu trong `application.properties`.
   - *Khắc phục*: MySQL của WampServer **mặc định không có mật khẩu**. Luôn để `spring.datasource.password=` (để trống).

2. **Lỗi chữ tiếng Việt bị dấu hỏi chấm (`?`):**
   - *Khắc phục*: URL kết nối trong `application.properties` phải có đuôi: `characterEncoding=UTF-8` và database tạo với bảng mã `utf8mb4`.

3. **Lỗi CORS (`Blocked by CORS policy`):**
   - *Nguyên nhân*: Do trình duyệt chặn JavaScript gọi API khác port (5500 gọi 8080).
   - *Khắc phục*: Dự án đã có file [WebConfig.java](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/backend/src/main/java/com/example/Handmade/config/WebConfig.java) mở cổng cho tất cả origin. **Tuyệt đối không xóa file này!**

4. **Lỗi không gọi được Getter / Setter dù đã viết `@Getter @Setter`:**
   - *Nguyên nhân*: Chưa bật Annotation Processing của Lombok trong IntelliJ.
   - *Khắc phục*: Vào `Settings ➔ Build, Execution, Deployment ➔ Compiler ➔ Annotation Processors` ➔ Tích chọn **Enable annotation processing**.

5. **Lỗi kiểu dữ liệu ID:**
   - Trong CSDL `id` là `BIGINT AUTO_INCREMENT` ➔ Trong Entity Java bắt buộc dùng kiểu **`Long`** (ví dụ `private Long id;`), không dùng `int` hay `Integer`.

---

## 7. Bảng Phân Loại File: Chỗ Cần Sửa Cho Hợp Máy & File TUYỆT ĐỐI CẤM SỬA

Để tránh trường hợp một bạn sửa nhầm làm hỏng code của cả nhóm hoặc vô tình commit mật khẩu cá nhân lên GitHub, cả nhóm lưu ý quy tắc phân loại 3 nhóm file sau:

### 🟢 NHÓM 1: File CẦN / ĐƯỢC PHÉP SỬA để phù hợp với máy cá nhân

| Tên File | Vị trí dòng cần sửa | Trường hợp cần sửa & Hướng dẫn sửa |
|---|---|---|
| `backend/src/main/resources/application.properties` | `spring.datasource.password=` | • Nếu bạn dùng **WampServer/XAMPP mặc định**: Giữ nguyên **để trống**.<br>• Nếu máy bạn khi cài MySQL có đặt mật khẩu riêng (vd: `root`, `123456`, `admin`): Điền mật khẩu của bạn vào sau dấu `=` (ví dụ `spring.datasource.password=123456`). |
| `backend/src/main/resources/application.properties` | `spring.datasource.url=...localhost:3306...` | • Nếu MySQL máy bạn chạy cổng `3306`: Giữ nguyên.<br>• Nếu WampServer của bạn báo MySQL chạy cổng khác (vd: `3307` hoặc `3308` do trùng cổng): Đổi số `3306` thành `3307` hoặc `3308`. |
| `frontend/assets/js/...` | `const API_BASE = "http://localhost:8080/..."` | • Mặc định giữ nguyên cổng `8080`.<br>• Chỉ sửa nếu máy bạn bị phần mềm khác chiếm mất cổng `8080` và buộc phải đổi cổng Backend sang `8081` trong `application.properties`. |

> [!TIP]
> **CẤU HÌNH GIT LOCAL (BẢO VỆ TẬP TIN CẤU HÌNH CÁ NHÂN):**  
> Sau khi đã sửa `application.properties` phù hợp với máy cá nhân, thực thi lệnh sau trên Terminal để ngăn Git theo dõi thay đổi cục bộ:  
> ```bash
> git update-index --assume-unchanged backend/src/main/resources/application.properties
> ```
> Lệnh này giúp quá trình `git add .` và `git commit` không ghi nhận các thông số kết nối cục bộ của máy bạn lên kho lưu trữ chung.

---

### 🔴 NHÓM 2: File CỐT LÕI HỆ THỐNG — TUYỆT ĐỐI CẤM SỬA / CẤM XÓA

Những file này là "xương sống" dùng chung cho cả 4 thành viên. **Nếu một người sửa hoặc xóa, toàn bộ dự án của cả 4 bạn sẽ lập tức bị lỗi:**

| File cấm sửa | Lý do cấm sửa / hậu quả nếu sửa sai |
|---|---|
| 🚫 `backend/pom.xml` | • **CẤM** đổi version Java (giữ đúng `11`).<br>• **CẤM** đổi version Spring Boot (giữ đúng `2.7.18`).<br>• **CẤM** xóa các dependency: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `mysql-connector-j`, `lombok`.<br>*(Nếu muốn thêm thư viện mới, bắt buộc phải họp báo trước cho cả nhóm).* |
| 🚫 `backend/.../config/WebConfig.java` | • **CẤM XÓA VÀ CẤM SỬA**.<br>• Đây là file mở chốt bảo mật CORS (`allowedOrigins("*")`). Nếu xóa file này, trình duyệt sẽ chặn đứng toàn bộ Frontend (cổng 5500), không cho gọi bất kỳ API nào từ Backend (cổng 8080)! |
| 🚫 `backend/.../dto/ApiResponse.java` | • **CẤM SỬA** cấu trúc `{ success, message, data }`.<br>• Đây là hợp đồng định dạng JSON chung (API Contract). Mọi hàm Javascript của cả 4 bạn đều dựa vào `json.success` và `json.data` để render giao diện. |
| 🚫 `backend/.../HandmadeApplication.java` | • Giữ nguyên class chính chứa hàm `main` khởi động Spring Boot. |
| 🚫 `DATABASE_SCHEMA_AURACRAFT.sql` | • **CẤM tự ý xóa bảng, đổi tên bảng hoặc đổi tên cột** thuộc module của bạn khác.<br>• Nếu module của bạn cần thêm cột mới, hãy trao đổi trong nhóm trước khi cập nhật. |

---

### 🟡 NHÓM 3: File Phân Quyền Sở Hữu Theo Phân Hệ (Trách Nhiệm Riêng Biệt)

Để phòng ngừa **Merge Conflict** khi hợp nhất các nhánh Git, quy định quyền truy cập và chỉnh sửa mã nguồn như sau:

- **Phong** (`phong`): Phụ trách tạo và chỉnh sửa các tập tin thuộc phân hệ Xác thực, Người dùng & Customizer 2D (`User.java`, `UserRepository.java`, `UserService.java`, `CustomMaterial.java`, `CustomDesign.java`, `AuthController.java`, `CustomDesignController.java`, `login.html`, `register.html`, `forgot.html`, `profile.html`, `customizer.html`...).
- **Yến** (`yen`): Phụ trách tạo và chỉnh sửa các tập tin thuộc phân hệ Danh mục, Sản phẩm, Gian hàng & Khai phá dữ liệu (`Category.java`, `Product.java`, `ProductImage.java`, `ProductRepository.java`, `ProductService.java`, `AprioriMiningService.java`, `ProductController.java`, `index.html`, `products.html`, `product-detail.html`, `shop-profile.html`...).
- **Phát** (`phat`): Phụ trách tạo và chỉnh sửa các tập tin thuộc phân hệ Giỏ hàng, Đơn hàng & Thanh toán (`CartItem.java`, `Order.java`, `OrderItem.java`, `CartRepository.java`, `OrderRepository.java`, `CartService.java`, `OrderService.java`, `PaymentService.java`, `CartController.java`, `OrderController.java`, `cart.html`, `checkout.html`, `success.html`, `order-detail.html`...).
- **Thương** (`thuong`): Phụ trách tạo và chỉnh sửa các tập tin thuộc phân hệ Quản trị Admin, Quản trị Seller, Chợ báo giá, Thống kê & Trí tuệ nhân tạo (`CustomRequest.java`, `Quote.java`, `AdminUserController.java`, `AdminAnalyticsController.java`, `AnalyticsService.java`, `GeminiAiService.java`, `buyer-request-form.html`, `seller-dashboard.html`, `admin-*.html`...).

> ⚠️ **Nguyên tắc làm việc**: *"Mỗi thành viên chỉ chỉnh sửa các tập tin thuộc phạm vi phân hệ được phân công. Không chỉnh sửa chéo tập tin ngoài phạm vi khi chưa có sự thống nhất chung của nhóm!"*

---

## 8. Quy Định Commit Git: File Nào Được Commit, File Nào CẤM Commit & .gitignore

Để kho chứa GitHub của nhóm luôn sạch sẽ, dung lượng nhẹ và không bao giờ bị lỗi xung đột hoặc bị GitHub từ chối do file quá nặng, cả nhóm bắt buộc tuân theo quy định sau:

### ✅ 8.1. Danh Sách File ĐƯỢC PHÉP COMMIT (Mã nguồn & Tài nguyên chuẩn)

Chỉ commit những file phục vụ trực tiếp cho việc chạy ứng dụng:

| Thư mục / Loại file | Định dạng file | Mục đích |
|---|---|---|
| `backend/src/main/java/**` | `*.java` | Toàn bộ mã nguồn backend (Entity, DTO, Service, Controller, Config). |
| `backend/src/main/resources/**` | `*.properties`, `*.sql` | File cấu hình chung và file nạp dữ liệu mẫu `data.sql`. |
| `backend/` | `pom.xml`, `mvnw`, `mvnw.cmd` | File quản lý thư viện Maven và script chạy Maven Wrapper. |
| `frontend/pages/**` | `*.html` | 28 màn hình giao diện web của các phân hệ. |
| `frontend/assets/css/**` | `*.css` | Mã nguồn định kiểu giao diện. |
| `frontend/assets/js/**` | `*.js` | Mã nguồn xử lý tương tác và gọi API Backend. |
| `frontend/assets/img/**` | `*.jpg`, `*.png`, `*.webp`, `*.svg` | Ảnh sản phẩm, avatar, banner thực tế của web *(Dung lượng nhỏ < 2MB)*. |
| Gốc dự án | `DATABASE_SCHEMA_AURACRAFT.sql` | Kịch bản tạo 14 bảng MySQL dùng chung cho nhóm. |
| Gốc dự án | `.gitignore`, `README.md`, `HUONG_DAN_*.md` | File loại trừ rác Git và tài liệu hướng dẫn nhóm. |

---

### ❌ 8.2. Danh Sách File TUYỆT ĐỐI CẤM COMMIT (Đã được chặn bởi `.gitignore`)

Những file sau đây tuyệt đối **không được xuất hiện** trên GitHub:

| Loại file cấm commit | Ví dụ cụ thể | Vì sao cấm commit? |
|---|---|---|
| **Thư mục build & file biên dịch** | `backend/target/`, `*.class`, `*.jar`, `*.war` | Đây là sản phẩm máy tính tự sinh ra sau khi chạy lệnh `mvn compile`. Nó chứa hàng ngàn file rác, nặng hàng trăm MB và gây xung đột Git liên tục. |
| **Cấu hình cá nhân IDE** | `.idea/`, `*.iml`, `.vscode/`, `.settings/`, `.classpath` | Mỗi máy tính cài JDK ở ổ đĩa khác nhau (`C:\` hoặc `D:\`). Nếu bạn commit file `.idea` hoặc `.iml`, khi bạn khác pull về sẽ bị **hỏng toàn bộ cài đặt IntelliJ** và không thể chạy được! |
| **File cài đặt phần mềm & File nén lớn** | `*.exe`, `*.msi`, `*.dmg`, `*.zip`, `*.rar`, `*.iso` | **ĐẶC BIỆT NGUY HIỂM**: GitHub **CẤM** tải file nặng hơn **100MB**. Nếu bạn để quên file installer (ví dụ file cài đặt WebStorm ~880MB) vào thư mục ảnh, GitHub sẽ **KHÓA CHẶT** lệnh `git push` của bạn! |
| **File rác của hệ điều hành** | `Thumbs.db`, `desktop.ini`, `.DS_Store` | File rác tự sinh ngầm của Windows và macOS khi mở thư mục xem ảnh. |
| **File Log & File tạm** | `*.log`, `*.tmp`, `*.bak` | Nhật ký chạy ứng dụng của máy cá nhân. |

---

### 🛡️ 8.3. File `.gitignore` Chuẩn Đã Được Tạo Ở Thư Mục Gốc

Dự án đã có sẵn file [.gitignore](file:///d:/Thuong_Study/Nhom5.1%20TMDT/TMDT_Nhom5.1_handmade/.gitignore) ở thư mục gốc để tự động bảo vệ bạn. Nội dung file đã cấu hình lọc sạch:
```gitignore
# 1. Chặn toàn bộ file cài đặt nặng
*.exe
*.msi
*.dmg
*.zip
*.rar

# 2. Chặn toàn bộ thư mục build Java
target/
**/target/
*.class
*.jar

# 3. Chặn cấu hình IDE cá nhân
.idea/
*.iml
*.iws
.vscode/
.settings/
.classpath
.project

# 4. Chặn file rác hệ điều hành & logs
Thumbs.db
desktop.ini
.DS_Store
*.log
```

---

### 💻 8.4. Quy Trình 4 Bước Commit Chuẩn Mỗi Khi Làm Xong Code

Mỗi khi bạn hoàn thành một tính năng trên nhánh của mình, hãy gõ 4 lệnh sau:

```bash
# Bước 1: Kiểm tra xem có file lạ nào không
git status

# Bước 2: Thêm tất cả thay đổi hợp lệ vào vùng chuẩn bị
git add .

# Bước 3: Ghi chú rõ ràng việc bạn vừa làm (dùng tiếng Việt không dấu hoặc tiếng Anh)
git commit -m "feat(admin): hoan thanh ket noi api admin users"

# Bước 4: Đẩy lên nhánh riêng của bạn (KHÔNG push len main)
git push origin ten-nhanh-cua-ban    # Ví dụ: git push origin thuong
```

---

### 8.5. Quy Trình Xử Lý Sự Cố Khi Commit Sai Tập Tin

Trường hợp vô tình đưa các tập tin cấu hình cá nhân hoặc tập tin không hợp lệ vào Git:

1. **Trường hợp 1 (Đã thực hiện `git add .` nhưng chưa thực hiện `git commit`):**
   Hủy đưa tập tin vào hàng đợi chuẩn bị lưu:
   ```bash
   git reset HEAD <duong_dan_file>
   ```
2. **Trường hợp 2 (Đã thực hiện `git commit` nhưng chưa thực hiện `git push`):**
   Loại bỏ tập tin khỏi chỉ mục của Git và giữ lại tập tin trên hệ thống tập tin cục bộ:
   ```bash
   git rm --cached <duong_dan_file>
   git commit --amend -C HEAD
   ```
3. **Trường hợp 3 (Tập tin nhị phân dung lượng lớn vô tình nằm trong thư mục dự án):**
   Di chuyển tập tin ra ngoài cây thư mục của dự án và kiểm tra lại trạng thái bằng lệnh `git status`.

---

## 9. Hướng Dẫn Sử Dụng Sourcetree Từ A Đến Z (Clone, Mở Dự Án, Add, Commit, Push, Pull & Tạo Nhánh)

**Sourcetree** là phần mềm giao diện đồ họa (GUI) trực quan giúp cả nhóm quản lý Git bằng chuột, xem sơ đồ nhánh và lịch sử code rõ ràng mà không cần phải nhớ các câu lệnh gõ trong Terminal.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      SƠ ĐỒ THAO TÁC CƠ BẢN TRÊN SOURCETREE                             │
│                                                                                        │
│  [GitHub Remote] ──(Clone / Pull)──> [Máy tính cá nhân]                                │
│                                            │                                           │
│                                      (Code & Sửa file)                                 │
│                                            │                                           │
│                                            ▼                                           │
│  [Unstaged Files] ────(Stage / Add)───> [Staged Files]                                 │
│                                            │                                           │
│                                        (Commit)                                        │
│                                            │                                           │
│                                            ▼                                           │
│  [Local Repository] ─────(Push)──────> [GitHub: thuong, yen, phong, phat]      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🟢 9.1. Cách Mở Dự Án Đã Có Sẵn Trên Máy Vào Sourcetree

Nếu bạn đã tải (clone) thư mục dự án về máy rồi (ví dụ nằm tại `D:\Thuong_Study\Nhom5.1 TMDT\TMDT_Nhom5.1_handmade`), bạn **không cần Clone lại**, mà chỉ cần mở nó lên trong Sourcetree bằng 1 trong 2 cách cực kỳ đơn giản sau:

#### Cách 1: Kéo thả trực tiếp (Nhanh nhất - 3 giây)
1. Khởi động phần mềm **Sourcetree**.
2. Mở cửa sổ **File Explorer** của Windows (`Windows + E`), tìm đến thư mục chứa dự án: `TMDT_Nhom5.1_handmade`.
3. Nhấn giữ chuột trái vào thư mục `TMDT_Nhom5.1_handmade` và **kéo thả trực tiếp** vào màn hình chính của Sourcetree!
4. Sourcetree sẽ nhận diện thư mục ẩn `.git` và mở ngay dự án ra cho bạn làm việc.

#### Cách 2: Dùng nút "Add" trên thanh công cụ
1. Mở **Sourcetree** ➔ Nhìn lên thanh tab trên cùng, bấm vào dấu **`+`** (Tab mới).
2. Ở menu các thẻ ngang, chọn tab **`Add`** (hoặc `Add Existing Local Repository`).
3. Tại ô **Working Directory**, bấm nút **`Browse...`** (Duyệt thư mục).
4. Điều hướng và chọn đúng thư mục dự án của bạn: `D:\Thuong_Study\Nhom5.1 TMDT\TMDT_Nhom5.1_handmade`.
5. Sourcetree sẽ hiện dòng chữ màu xanh lá xác nhận: *"This is a valid Git repository"*.
6. Bấm nút **`Add`** ở góc dưới bên phải. Dự án sẽ xuất hiện ngay trong danh sách, bấm đúp chuột vào là mở ra toàn bộ lịch sử!

---

### 🌐 9.2. Cách Clone Dự Án Từ GitHub Về Máy

Các bạn mới chưa có mã nguồn trên máy chỉ cần thực hiện 4 bước sau để tải toàn bộ dự án về:

1. Khởi động **Sourcetree** ➔ Bấm vào dấu **`+`** trên thanh tab ➔ Chọn tab **`Clone`**.
2. Điền các thông tin:
   - **Source Path / URL**: Dán chính xác đường link GitHub của nhóm:
     ```
     https://github.com/Thuong23130327/TMDT_Nhom5.1_handmade.git
     ```
   - **Destination Path**: Bấm nút **`Browse...`** và chọn thư mục trên máy bạn muốn lưu dự án (Ví dụ: `D:\Nhom5_Handmade\TMDT_Nhom5.1_handmade`).
   - **Name**: Để tên mặc định là `TMDT_Nhom5.1_handmade`.
3. Chờ 3-5 giây để Sourcetree kiểm tra đường truyền và hiện dòng thông báo: *"This is a Git repository"*.
4. Bấm nút **`Clone`** ở góc dưới. Toàn bộ mã nguồn, cấu hình CSDL và giao diện sẽ được tải về máy bạn 100%!

---

### 🌿 9.3. Tạo & Chuyển Sang Nhánh Riêng Của Bạn (`thuong`, `yen`, `phong`, `phat`)

Để không bị đè code lên nhau, mỗi bạn bắt buộc tạo nhánh riêng mang tên mình:

1. Trong giao diện dự án trên Sourcetree, nhìn lên thanh công cụ (Toolbar) trên cùng, bấm vào nút **`Branch`** (Biểu tượng nhánh cây).
2. Hộp thoại tạo nhánh xuất hiện:
   - Tại ô **New Branch**: Nhập đúng tên nhánh phân công của bạn:
     - Thương: `thuong`
     - Yến: `yen`
     - Phong: `phong`
     - Phát: `phat`
   - Đảm bảo ô vuông **"Checkout new branch"** đã được **tích chọn** (để sau khi tạo xong sẽ tự động chuyển sang làm việc trên nhánh này ngay).
3. Bấm nút **`Create Branch`**.
4. Nhìn sang cột bên trái (Mục **BRANCHES**): Bạn sẽ thấy tên nhánh của mình đang được **in đậm kèm một chấm tròn nhỏ** bên cạnh ➔ Bạn đã ở trên nhánh riêng an toàn!

---

### 📝 9.4. Cách Xem File Thay Đổi & Đưa File Vào Hàng Đợi (Stage / Add)

Mỗi khi bạn vừa tạo file mới hoặc sửa code trên máy mình:

1. Nhìn sang menu bên trái, bấm vào mục **`File Status`** (Trạng thái file).
2. Màn hình sẽ chia làm 2 khu vực rõ ràng:
   - **Unstaged files** (Khu vực dưới): Danh sách các file bạn vừa thay đổi nhưng chưa đưa vào hàng đợi lưu.
   - **Staged files** (Khu vực trên): Các file đã sẵn sàng để lưu lại (commit).
3. Cách đưa file lên chuẩn bị commit:
   - **Cách 1 (Lưu toàn bộ)**: Bấm nút **`Stage All`** (hoặc tích vào ô vuông trên cùng của khung Unstaged files). Toàn bộ file sẽ nhảy lên khung Staged files.
   - **Cách 2 (Lưu từng file cụ thể)**: Tích vào ô vuông nhỏ trước từng file bạn muốn lưu.
   - Khi bấm vào tên một file, khung bên phải sẽ hiển thị chi tiết màu xanh lá (dòng code mới viết thêm) và màu đỏ (dòng code vừa xóa đi) cực kỳ trực quan!

---

### 💾 9.5. Cách Commit (Lưu Mốc Làm Việc Trên Máy Cá Nhân)

Sau khi các file cần lưu đã nằm gọn gàng trong khung **Staged files**:

1. Nhìn xuống khung soạn thảo văn bản ở góc dưới cùng màn hình Sourcetree.
2. Gõ dòng thông điệp mô tả ngắn gọn việc bạn vừa làm (Commit Message), ví dụ:
   - `feat(catalog): hoan thanh giao dien trang chi tiet san pham`
   - `feat(cart): viet api them san pham vao gio hang`
   - `feat(auth): hoan thanh dang nhap bang google`
3. Bấm nút **`Commit`** ở góc dưới cùng bên phải màn hình.
4. Mốc làm việc đã được lưu trữ an toàn vào lịch sử Git cục bộ trên máy tính của bạn!

---

### 🚀 9.6. Cách Push (Đẩy Code Lên GitHub Cho Cả Nhóm Cùng Thấy)

Sau khi bấm Commit, mốc code mới chỉ nằm trên máy bạn. Để đưa lên GitHub:

1. Nhìn lên thanh công cụ trên cùng, bạn sẽ thấy nút **`Push`** (Biểu tượng mũi tên chỉ lên) xuất hiện số `1` (báo hiệu có 1 mốc commit đang chờ đẩy).
2. Bấm vào nút **`Push`**.
3. Một bảng danh sách các nhánh sẽ hiện ra:
   - Tìm đến đúng dòng mang **tên nhánh của bạn** (ví dụ `thuong`, `yen`, `phong`, `phat`).
   - **Tích chọn ô vuông** ở cột *Push* tương ứng với nhánh của bạn.
   - *(Lưu ý: Không tích vào nhánh `main` khi chưa họp nhóm).*
4. Bấm nút **`Push`** ở góc dưới cùng.
5. Chờ 3 giây khi thanh tiến trình chạy xong là code của bạn đã lên GitHub an toàn!

---

### 📥 9.7. Cách Pull (Đồng Bộ Mã Nguồn Mới Nhất Về Máy Cục Bộ)

> [!TIP]
> **QUY TRÌNH ĐỒNG BỘ ĐẦU PHIÊN LÀM VIỆC**: Trước khi bắt đầu làm việc, thành viên luôn thực hiện thao tác **Pull** trên Sourcetree nhằm đảm bảo mã nguồn cục bộ đồng bộ với kho lưu trữ chung, hạn chế nguy cơ xung đột (conflict).

1. Nhìn lên thanh công cụ trên cùng, bấm nút **`Pull`** (Biểu tượng mũi tên chỉ xuống).
2. Hộp thoại hiện ra: Giữ nguyên các tùy chọn mặc định.
3. Bấm nút **`OK`** (hoặc *Pull*).
4. Sourcetree sẽ tự động tải các cập nhật mới nhất từ GitHub về máy bạn, giúp dự án luôn đồng bộ với các bạn trong nhóm!

---

### ⚠️ 9.8. Các Nguyên Tắc Phòng Ngừa Xung Đột Mã Nguồn (Merge Conflict)

1. **Tuyệt đối không commit trực tiếp vào nhánh `main`**: Luôn làm việc và commit trên nhánh cá nhân được phân công (`phong`, `yen`, `phat`, `thuong`).
2. **Tuân thủ quyền sở hữu tập tin**: Mỗi thành viên chỉ thao tác trên các tập tin thuộc phân hệ của mình (theo phân quyền tại Mục 7).
3. **Quy trình xử lý xung đột**: Trường hợp Sourcetree thông báo xung đột (Merge Conflict), cần thông báo cho nhóm để cùng đối chiếu và chọn phương án hợp nhất chính xác.



