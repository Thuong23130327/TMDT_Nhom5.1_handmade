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
3. [Phân Chia 4 Module Fullstack Cho 4 Thành Viên](#3-phân-chia-4-module-fullstack-cho-4-thành-viên)
4. [Quy Tắc Thống Nhất Khi Code (Conventions & Git Workflow)](#4-quy-tắc-thống-nhất-khi-code-conventions--git-workflow)
5. [Giải Thích Flow Code & Hướng Dẫn Chi Tiết Ví Dụ Mẫu (Admin Users)](#5-giải-thích-flow-code--hướng-dẫn-chi-tiết-ví-dụ-mẫu-admin-users)
   - [5.1. Kiến trúc 3 tầng chuẩn Spring Boot](#51-kiến-trúc-3-tầng-chuẩn-spring-boot)
   - [5.2. Luồng dữ liệu chạy thực tế (End-to-End Flow)](#52-luồng-dữ-liệu-chạy-thực-tế-end-to-end-flow)
   - [5.3. Chi tiết mã nguồn từng file mẫu](#53-chi-tiết-mã-nguồn-từng-file-mẫu)
   - [5.4. Công thức 5 bước nhân bản cho mọi tính năng mới](#54-công-thức-5-bước-nhân-bản-cho-mọi-tính-năng-mới)
6. [Những Lưu Ý Sống Còn Khi Code (Tránh Lỗi Phổ Biến)](#6-những-lưu-ý-sống-còn-khi-code-tránh-lỗi-phổ-biến)
7. [Bảng Phân Loại File: Chỗ Cần Sửa Cho Hợp Máy & File TUYỆT ĐỐI CẤM SỬA](#7-bảng-phân-loại-file-chỗ-cần-sửa-cho-hợp-máy--file-tuyệt-đối-cấm-sửa)
8. [Quy Định Commit Git: File Nào Được Commit, File Nào CẤM Commit & .gitignore](#8-quy-định-commit-git-file-nào-được-commit-file-nào-cấm-commit--gitignore)

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

## 3. Phân Chia 4 Module Fullstack Cho 4 Thành Viên

Mỗi thành viên sở hữu trọn vẹn 1 phân hệ xuyên suốt từ CSDL, Backend Spring Boot đến Giao diện Frontend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      HỆ THỐNG AURACRAFT (4 MODULE)                     │
├───────────────────┬───────────────────┬──────────────────┬─────────────┤
│     BẠN 1         │     BẠN 2         │     BẠN 3        │    BẠN 4    │
│  Tài khoản &      │  Sản phẩm có sẵn  │  Giỏ hàng &      │  Customized │
│  Hồ sơ cá nhân    │  (Catalog & Shop) │  Đơn hàng chuẩn  │  Handmade   │
└───────────────────┴───────────────────┴──────────────────┴─────────────┘
```

| Thành viên | Tên Phân Hệ | Các Bảng CSDL | Các Class Backend (Java) | Các Trang Giao Diện (FE) |
|---|---|---|---|---|
| **BẠN 1** | **Tài khoản & Xác thực** *(Auth & Profile)* | `users` | `User`, `LoginRequest`, `RegisterRequest`, `UserRepository`, `UserService`, `AuthController` | `login.html`, `register.html`, `forgot.html`, `profile.html`, `profile-info.html`, `shop-profile.html` |
| **BẠN 2** | **Danh mục & Sản phẩm có sẵn** *(Catalog & Seller Products)* | `categories`, `products`, `product_images` | `Category`, `Product`, `ProductImage`, `ProductRepository`, `ProductService`, `ProductController` | `index.html`, `products.html`, `product-detail.html`, `seller-products.html`, `seller-product-form.html` |
| **BẠN 3** | **Giỏ hàng & Đơn hàng chuẩn** *(Cart & Checkout)* | `cart_items`, `orders`, `order_items` | `CartItem`, `Order`, `OrderItem`, `CartRepository`, `OrderRepository`, `OrderService`, `OrderController` | `cart.html`, `checkout.html`, `success.html`, `order-management.html` |
| **BẠN 4** | **Đặt làm đồ Custom & Admin** *(Custom Workflow & Admin)* | `custom_requests`, `quotes`, `custom_orders`, `order_milestones`, `disputes` | `CustomRequest`, `Quote`, `CustomOrder`, `Dispute`, `AdminUserService`, `AdminUserController`, `DisputeService` | `customizer.html`, `buyer-request-form.html`, `buyer-requests.html`, `admin-users.html`, `admin-orders.html`, `admin-disputes.html` |

---

## 4. Quy Tắc Thống Nhất Khi Code (Conventions & Git Workflow)

### 4.1. Quy tắc Git nhánh (Tuyệt đối không push đè `main`)
1. Nhánh `main`: Chỉ dùng để lưu bản hoàn thiện cuối cùng khi nộp bài.
2. Nhánh `develop`: Là nhánh tích hợp chung của cả nhóm.
3. Mỗi thành viên tạo nhánh tính năng riêng từ `develop`:
   - Bạn 1: `feature/auth-profile`
   - Bạn 2: `feature/catalog-product`
   - Bạn 3: `feature/cart-order`
   - Bạn 4: `feature/custom-admin`
4. Khi làm xong, tạo **Pull Request (PR)** để ghép vào nhánh `develop`.

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

### 5.1. Kiến trúc 3 tầng chuẩn Spring Boot
Hệ thống Backend được phân chia nhiệm vụ giống như một **Nhà hàng ẩm thực**:

```
[NGƯỜI DÙNG BẤM CLICK TRÊN WEB]
               │
               ▼
[FRONTEND: admin-users.html + admin-users.js]
               │ (1) Gửi yêu cầu qua mạng: fetch("http://localhost:8080/api/v1/admin/users")
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND SPRING BOOT (Cổng 8080)                │
│                                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 1. Controller           │  (LỄ TÂN): Nhận HTTP Request,       │
│  │ (AdminUserController)   │  kiểm tra tham số và trả ApiResponse│
│  └────────────┬────────────┘                                     │
│               ▼                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 2. Service              │  (BẾP TRƯỞNG): Xử lý logic nghiệp   │
│  │ (AdminUserService)      │  vụ, tính toán thống kê, đổi status │
│  └────────────┬────────────┘                                     │
│               ▼                                                  │
│  ┌─────────────────────────┐                                     │
│  │ 3. Repository           │  (THỦ KHO): Chuyên giao tiếp với DB,│
│  │ (UserRepository)        │  thực thi câu lệnh SQL SELECT/UPDATE│
│  └────────────┬────────────┘                                     │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │ (2) Truy vấn SQL
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

## 6. Những Lưu Ý Sống Còn Khi Code (Tránh Lỗi Phổ Biến)

> [!WARNING]
> Cả 4 bạn cần đọc kỹ 5 lỗi kinh điển sau để không mất hàng giờ sửa lỗi:

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
> **MẸO VÀNG GIT (CHỐNG COMMIT ĐÈ MẬT KHẨU CÁ NHÂN):**  
> Sau khi bạn đã sửa `application.properties` cho khớp mật khẩu trên máy mình, hãy mở Terminal gõ lệnh sau:  
> ```bash
> git update-index --assume-unchanged backend/src/main/resources/application.properties
> ```
> 👉 **Tác dụng**: Lệnh này báo Git bỏ qua mọi thay đổi ở file cấu hình này trên máy bạn. Bạn có thể thoải mái `git add .` và `git commit` mà không bao giờ sợ vô tình đẩy mật khẩu máy mình lên làm lỗi máy các bạn khác!

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

### 🟡 NHÓM 3: File Phân Quyền Sở Hữu Theo Module (Chỉ người phụ trách mới được code)

Để tránh bị **Merge Conflict** khi ghép nhánh Git, quy định quyền viết code như sau:

- **Bạn 1**: Chỉ tạo/sửa các file liên quan đến User & Auth (`User.java`, `UserRepository.java`, `UserService.java`, `AuthController.java`, `login.html`, `profile.html`...).
- **Bạn 2**: Chỉ tạo/sửa các file liên quan đến Sản phẩm & Danh mục (`Product.java`, `Category.java`, `ProductRepository.java`, `ProductController.java`, `products.html`, `product-detail.html`, `seller-products.html`...).
- **Bạn 3**: Chỉ tạo/sửa các file liên quan đến Giỏ hàng & Đơn hàng (`CartItem.java`, `Order.java`, `OrderItem.java`, `CartController.java`, `OrderController.java`, `cart.html`, `checkout.html`...).
- **Bạn 4**: Chỉ tạo/sửa các file liên quan đến Custom Handmade, Tranh chấp & Admin (`CustomRequest.java`, `Quote.java`, `CustomOrder.java`, `Dispute.java`, `AdminUserController.java`, `customizer.html`, `admin-*.html`...).

> ⚠️ **Nguyên tắc vàng**: *"Code module của ai thì người đó viết. Tuyệt đối không sửa chéo file của nhau khi chưa thống nhất!"*

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

# Bước 4: Đẩy lên nhánh tính năng riêng của bạn (KHÔNG push len main)
git push origin feature/ten-nhanh-cua-ban
```

---

### 🆘 8.5. Cách Cấp Cứu Khi Lỡ Tay Commit Nhầm File Rác Hoặc File Nặng

Nếu bạn lỡ thêm nhầm file vào Git:

1. **Trường hợp 1 (Mới gõ `git add .` nhưng CHƯA gõ `git commit`):**
   ```bash
   git reset HEAD <duong_dan_file_bi_nham>
   ```
2. **Trường hợp 2 (Đã lỡ gõ `git commit` nhưng CHƯA gõ `git push`):**
   Xóa file khỏi Git mà vẫn giữ nguyên file trên máy tính của bạn:
   ```bash
   git rm --cached <duong_dan_file_bi_nham>
   git commit --amend -C HEAD
   ```
3. **Trường hợp 3 (File cài đặt `.exe` quá nặng vô tình nằm trong thư mục ảnh):**
   Hãy tìm và xóa thẳng tay file `.exe` đó ra khỏi thư mục dự án (hoặc di chuyển ra màn hình Desktop).


