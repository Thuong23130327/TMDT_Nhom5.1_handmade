-- ==============================================================================
-- DỰ ÁN THƯƠNG MẠI ĐIỆN TỬ ĐỒ THỦ CÔNG & HANDMADE — AURACRAFT
-- FILE SCRIPT TẠO CƠ SỞ DỮ LIỆU MYSQL HOÀN CHỈNH (14 BẢNG + DỮ LIỆU MẪU)
-- Hỗ trợ: Đầy đủ các phân hệ bán hàng, đặt làm custom và TÙY BIẾN KÉO THẢ (CHARM VÒNG TAY / GẤU BÔNG)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `auracraft_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `auracraft_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để xóa/tạo bảng theo bất kỳ thứ tự nào
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `disputes`;
DROP TABLE IF EXISTS `order_milestones`;
DROP TABLE IF EXISTS `custom_orders`;
DROP TABLE IF EXISTS `quotes`;
DROP TABLE IF EXISTS `custom_requests`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `custom_designs`;
DROP TABLE IF EXISTS `custom_materials`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- PHẦN 1: TẠO BẢNG CƠ SỞ DỮ LIỆU
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BẢNG users: Quản lý toàn bộ tài khoản (Khách mua, Thợ thủ công, Admin)
-- Do: BẠN 1 phụ trách chính (Phân hệ Tài khoản & Xác thực)
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã định danh duy nhất',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email đăng nhập (duy nhất)',
    `password` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu mã hóa BCrypt',
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên người dùng',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại liên hệ',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh đại diện',
    `role` ENUM('ROLE_BUYER', 'ROLE_ARTISAN', 'ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_BUYER' COMMENT 'Vai trò người dùng',
    `status` ENUM('ACTIVE', 'PENDING', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái hoạt động (PENDING dành cho thợ chờ duyệt)',
    `introduction` TEXT DEFAULT NULL COMMENT 'Giới thiệu về xưởng hoặc bản thân',
    `portfolio_url` VARCHAR(255) DEFAULT NULL COMMENT 'Link portfolio tác phẩm (Instagram, Behance...)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo tài khoản'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng và xưởng thủ công';

-- ------------------------------------------------------------------------------
-- 2. BẢNG categories: Danh mục phân loại các sản phẩm handmade
-- Do: BẠN 2 phụ trách (Catalog sản phẩm)
-- ------------------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã danh mục',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên danh mục (Vòng tay, Gốm sứ, Len móc...)',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Đường dẫn thân thiện (vong-tay-handmade)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục sản phẩm handmade';

-- ------------------------------------------------------------------------------
-- 3. BẢNG products: Sản phẩm có sẵn do các nghệ nhân đăng bán
-- Do: BẠN 2 phụ trách chính (Quản lý sản phẩm nghệ nhân & Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã sản phẩm',
    `artisan_id` BIGINT NOT NULL COMMENT 'Nghệ nhân tạo sản phẩm (FK trỏ tới users.id)',
    `category_id` INT NOT NULL COMMENT 'Danh mục sản phẩm (FK trỏ tới categories.id)',
    `name` VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
    `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết chất liệu, xuất xứ...',
    `price` DECIMAL(12,2) NOT NULL COMMENT 'Giá bán hiện tại (VNĐ)',
    `old_price` DECIMAL(12,2) DEFAULT NULL COMMENT 'Giá gốc trước khi giảm (nếu có)',
    `stock_quantity` INT NOT NULL DEFAULT 10 COMMENT 'Số lượng sản phẩm còn trong kho',
    `color` VARCHAR(50) DEFAULT NULL COMMENT 'Màu sắc chủ đạo',
    `thumbnail_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh đại diện chính của sản phẩm',
    `is_customizable` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Sản phẩm có cho phép tùy biến/gắp charm không (TRUE: hiện nút Tùy Chỉnh, FALSE: chỉ mua có sẵn)',
    `default_configuration_json` TEXT DEFAULT NULL COMMENT 'Cấu hình slot/layer mặc định của mẫu (chứa mảng vị trí các charm ban đầu để nạp vào Customizer khi khách bấm đổi chi tiết)',
    `status` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE: Đang bán, HIDDEN: Ẩn/Hết hàng',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày đăng bán',
    CONSTRAINT `fk_products_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sản phẩm đồ thủ công có sẵn và mẫu custom';

-- ------------------------------------------------------------------------------
-- 4. BẢNG product_images: Thư viện nhiều ảnh chi tiết cho 1 sản phẩm
-- Do: BẠN 2 phụ trách
-- ------------------------------------------------------------------------------
CREATE TABLE `product_images` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã ảnh',
    `product_id` BIGINT NOT NULL COMMENT 'Mã sản phẩm sở hữu ảnh này (FK trỏ tới products.id)',
    `image_url` VARCHAR(255) NOT NULL COMMENT 'Đường dẫn ảnh',
    `is_primary` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Có phải ảnh đại diện chính không',
    CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ảnh chi tiết sản phẩm';

-- ------------------------------------------------------------------------------
-- 5. BẢNG custom_materials: KHO NGUYÊN LIỆU TÙY CHỈNH KÉO THẢ CỦA TỪNG SHOP
-- Do: BẠN 4 & BẠN 2 phối hợp (Phục vụ bộ công cụ Customizer kéo-thả)
-- Thiết kế mở rộng: Dùng chung cho Charm Vòng tay, Phụ kiện Gấu bông, Móc khóa...
-- ------------------------------------------------------------------------------
CREATE TABLE `custom_materials` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã nguyên liệu',
    `artisan_id` BIGINT NOT NULL COMMENT 'Nguyên liệu thuộc kho của Shop/Thợ nào (FK trỏ tới users.id)',
    `product_type` VARCHAR(50) NOT NULL COMMENT 'Áp dụng cho loại sản phẩm nào (BRACELET, PLUSH_DOLL, PHONE_STRAP, NECKLACE...)',
    `part_type` VARCHAR(50) NOT NULL COMMENT 'Phân loại chi tiết (Vòng: CHARM, BASE; Gấu bông: OUTFIT, HAT, ACCESSORY)',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên nguyên liệu (Charm Chữ A, Áo len gấu bông, Mũ len mini, Charm tim...)',
    `price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Giá của nguyên liệu này khi khách chọn thêm (VNĐ)',
    `image_url` VARCHAR(255) NOT NULL COMMENT 'Ảnh PNG layer trong suốt chuẩn hóa kích thước để kéo-thả và render',
    `stock_quantity` INT NOT NULL DEFAULT 50 COMMENT 'Số lượng còn trong kho của shop',
    `status` ENUM('ACTIVE', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Còn hàng hay hết hàng',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo nguyên liệu',
    CONSTRAINT `fk_materials_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kho nguyên liệu tùy chỉnh kéo thả theo từng shop';

-- ------------------------------------------------------------------------------
-- 6. BẢNG custom_designs: BẢN THIẾT KẾ DO KHÁCH PHỐI RA (CÓ ẢNH MINH HỌA THỰC TẾ)
-- Do: BẠN 4 phụ trách chính
-- ------------------------------------------------------------------------------
CREATE TABLE `custom_designs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã thiết kế',
    `user_id` BIGINT DEFAULT NULL COMMENT 'Khách hàng tạo thiết kế (FK users.id, cho phép NULL nếu chưa đăng nhập)',
    `artisan_id` BIGINT NOT NULL COMMENT 'Shop nhận gia công mẫu này (FK users.id - đảm bảo đúng shop có nguyên liệu)',
    `base_product_id` BIGINT DEFAULT NULL COMMENT 'Nếu khách biến tấu từ mẫu có sẵn của shop (FK products.id), NULL nếu tự làm từ đầu',
    `product_type` VARCHAR(50) NOT NULL DEFAULT 'BRACELET' COMMENT 'Loại sản phẩm (BRACELET, PLUSH_DOLL...)',
    `title` VARCHAR(150) DEFAULT NULL COMMENT 'Tên bản thiết kế (vd: Vòng tay Khang & Lan, Gấu bông sinh nhật)',
    `total_price` DECIMAL(12,2) NOT NULL COMMENT 'Tổng số tiền tính toán = Phôi chính + Các nguyên liệu đã chọn',
    `preview_image_url` VARCHAR(255) NOT NULL COMMENT 'ẢNH MINH HỌA THỰC TẾ render từ Canvas (để khách & thợ cùng xem)',
    `configuration_json` TEXT NOT NULL COMMENT 'Mảng lưu vị trí các slot/layer dạng JSON để thợ mở ra nhặt đồ lắp ráp',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo thiết kế',
    CONSTRAINT `fk_designs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_designs_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_designs_base_product` FOREIGN KEY (`base_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bản thiết kế custom hoàn chỉnh của khách có ảnh render';

-- ------------------------------------------------------------------------------
-- 7. BẢNG cart_items: Giỏ hàng của người mua (hỗ trợ cả đồ có sẵn & đồ tự custom)
-- Do: BẠN 3 phụ trách (Giỏ hàng & Đơn hàng chuẩn)
-- ------------------------------------------------------------------------------
CREATE TABLE `cart_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã dòng giỏ hàng',
    `user_id` BIGINT NOT NULL COMMENT 'Người sở hữu giỏ hàng (FK trỏ tới users.id)',
    `product_id` BIGINT DEFAULT NULL COMMENT 'Sản phẩm có sẵn (FK trỏ tới products.id, NULL nếu là đồ custom)',
    `custom_design_id` BIGINT DEFAULT NULL COMMENT 'Bản thiết kế custom (FK trỏ tới custom_designs.id, NULL nếu là đồ có sẵn)',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT 'Số lượng mua',
    `custom_notes` VARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú thêm của khách (khắc tên, size cổ tay...)',
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_design` FOREIGN KEY (`custom_design_id`) REFERENCES `custom_designs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giỏ hàng người mua';

-- ------------------------------------------------------------------------------
-- 8. BẢNG orders: Đơn hàng thanh toán
-- Do: BẠN 3 phụ trách chính
-- ------------------------------------------------------------------------------
CREATE TABLE `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã đơn hàng nội bộ',
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã đơn hiển thị cho khách (vd: ORD-9805)',
    `buyer_id` BIGINT NOT NULL COMMENT 'Người đặt hàng (FK trỏ tới users.id)',
    `total_amount` DECIMAL(12,2) NOT NULL COMMENT 'Tổng số tiền thanh toán (VNĐ)',
    `recipient_name` VARCHAR(100) NOT NULL COMMENT 'Tên người nhận hàng',
    `recipient_phone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại nhận hàng',
    `shipping_address` TEXT NOT NULL COMMENT 'Địa chỉ giao hàng',
    `payment_method` ENUM('COD', 'VNPAY', 'MOMO', 'BANKING') NOT NULL DEFAULT 'COD' COMMENT 'Phương thức thanh toán',
    `payment_status` ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID' COMMENT 'Trạng thái thanh toán',
    `status` ENUM('PENDING', 'CRAFTING', 'SHIPPING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái giao hàng',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo đơn hàng',
    CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn hàng sản phẩm có sẵn hoặc tự custom';

-- ------------------------------------------------------------------------------
-- 9. BẢNG order_items: Chi tiết các món hàng trong một đơn hàng
-- Do: BẠN 3 phụ trách
-- ------------------------------------------------------------------------------
CREATE TABLE `order_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã chi tiết đơn',
    `order_id` BIGINT NOT NULL COMMENT 'Mã đơn hàng (FK trỏ tới orders.id)',
    `product_id` BIGINT DEFAULT NULL COMMENT 'Mã sản phẩm có sẵn (FK products.id, NULL nếu là đồ custom)',
    `custom_design_id` BIGINT DEFAULT NULL COMMENT 'Mã thiết kế custom (FK custom_designs.id - thợ bấm vào xem ảnh render & vị trí charm để làm)',
    `quantity` INT NOT NULL COMMENT 'Số lượng mua',
    `unit_price` DECIMAL(12,2) NOT NULL COMMENT 'Đơn giá tại thời điểm mua',
    `custom_notes` VARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú riêng cho sản phẩm này',
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_order_items_design` FOREIGN KEY (`custom_design_id`) REFERENCES `custom_designs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết các mặt hàng trong đơn';

-- ------------------------------------------------------------------------------
-- 10. BẢNG custom_requests: Khách đăng yêu cầu làm đồ theo mô tả riêng (Yêu cầu mở)
-- Do: BẠN 4 phụ trách chính
-- ------------------------------------------------------------------------------
CREATE TABLE `custom_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã yêu cầu custom',
    `buyer_id` BIGINT NOT NULL COMMENT 'Khách hàng tạo yêu cầu (FK trỏ tới users.id)',
    `product_type` VARCHAR(150) NOT NULL COMMENT 'Loại món đồ cần làm (Vòng tay resin, Túi len...)',
    `materials` VARCHAR(255) DEFAULT NULL COMMENT 'Chất liệu mong muốn (Bạc 925, charm đá, len cotton...)',
    `charm_description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết ý tưởng thiết kế',
    `budget` DECIMAL(12,2) DEFAULT NULL COMMENT 'Ngân sách dự kiến của khách (VNĐ)',
    `status` ENUM('OPEN', 'QUOTED', 'AWARDED', 'CANCELLED') NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN: Đang nhận báo giá, QUOTED: Đã có thợ báo giá, AWARDED: Đã chốt thợ làm',
    `design_image_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh phác thảo hoặc mẫu tham khảo',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày đăng yêu cầu',
    CONSTRAINT `fk_custom_requests_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu đặt làm đồ handmade theo mẫu riêng';

-- ------------------------------------------------------------------------------
-- 11. BẢNG quotes: Báo giá của các nghệ nhân gửi lại cho khách
-- Do: BẠN 4 phụ trách
-- ------------------------------------------------------------------------------
CREATE TABLE `quotes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã báo giá',
    `request_id` BIGINT NOT NULL COMMENT 'Yêu cầu custom cần báo giá (FK trỏ tới custom_requests.id)',
    `artisan_id` BIGINT NOT NULL COMMENT 'Nghệ nhân gửi báo giá (FK trỏ tới users.id)',
    `price` DECIMAL(12,2) NOT NULL COMMENT 'Mức giá nghệ nhân đề xuất (VNĐ)',
    `estimated_days` INT NOT NULL COMMENT 'Số ngày dự kiến để hoàn thành chế tác',
    `message` TEXT DEFAULT NULL COMMENT 'Lời nhắn gửi khách (kinh nghiệm, cam kết chất liệu)',
    `status` ENUM('SUBMITTED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED' COMMENT 'SUBMITTED: Chờ khách duyệt, ACCEPTED: Khách đồng ý chốt, REJECTED: Từ chối',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày gửi báo giá',
    CONSTRAINT `fk_quotes_request` FOREIGN KEY (`request_id`) REFERENCES `custom_requests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_quotes_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Báo giá nghệ nhân gửi lại cho khách';

-- ------------------------------------------------------------------------------
-- 12. BẢNG custom_orders: Hợp đồng gia công sau khi khách chấp nhận báo giá
-- Do: BẠN 4 phụ trách
-- ------------------------------------------------------------------------------
CREATE TABLE `custom_orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã đơn đặt làm custom',
    `request_id` BIGINT NOT NULL COMMENT 'Yêu cầu gốc (FK trỏ tới custom_requests.id)',
    `quote_id` BIGINT NOT NULL COMMENT 'Báo giá đã chọn (FK trỏ tới quotes.id)',
    `buyer_id` BIGINT NOT NULL COMMENT 'Khách đặt làm (FK trỏ tới users.id)',
    `artisan_id` BIGINT NOT NULL COMMENT 'Nghệ nhân nhận làm (FK trỏ tới users.id)',
    `agreed_price` DECIMAL(12,2) NOT NULL COMMENT 'Giá chốt cuối cùng (VNĐ)',
    `deadline` DATE DEFAULT NULL COMMENT 'Hạn chót bàn giao sản phẩm',
    `status` ENUM('CRAFTING', 'READY_TO_SHIP', 'SHIPPING', 'COMPLETED', 'LATE', 'CANCELLED') NOT NULL DEFAULT 'CRAFTING' COMMENT 'Tiến độ làm và giao hàng',
    `payment_status` ENUM('PAID', 'REFUND_DUE') NOT NULL DEFAULT 'PAID' COMMENT 'Khách đặt cọc/thanh toán sàn giữ tiền',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo đơn',
    CONSTRAINT `fk_custom_orders_request` FOREIGN KEY (`request_id`) REFERENCES `custom_requests` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_custom_orders_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_custom_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_custom_orders_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đơn hàng gia công đồ handmade theo yêu cầu';

-- ------------------------------------------------------------------------------
-- 13. BẢNG order_milestones: Theo dõi tiến độ chế tác từng giai đoạn kèm ảnh chụp thật
-- Do: BẠN 4 phụ trách
-- ------------------------------------------------------------------------------
CREATE TABLE `order_milestones` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã mốc tiến độ',
    `custom_order_id` BIGINT NOT NULL COMMENT 'Đơn đặt làm (FK trỏ tới custom_orders.id)',
    `title` VARCHAR(150) NOT NULL COMMENT 'Tiêu đề mốc (Vd: Hoàn thành đan thân túi, Đang đổ keo resin...)',
    `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết công việc đã làm',
    `photo_url` VARCHAR(255) DEFAULT NULL COMMENT 'Ảnh thợ chụp gửi khách xem tiến độ',
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đã hoàn thành mốc này chưa',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật',
    CONSTRAINT `fk_milestones_order` FOREIGN KEY (`custom_order_id`) REFERENCES `custom_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cập nhật tiến độ chế tác đồ handmade';

-- ------------------------------------------------------------------------------
-- 14. BẢNG disputes: Khiếu nại / Tranh chấp gửi Admin xử lý (hàng lỗi, trễ hẹn)
-- Do: BẠN 4 phụ trách (Module Khiếu nại & Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE `disputes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã khiếu nại',
    `custom_order_id` BIGINT DEFAULT NULL COMMENT 'Đơn hàng xảy ra tranh chấp (FK trỏ tới custom_orders.id)',
    `buyer_id` BIGINT NOT NULL COMMENT 'Người khiếu nại (FK trỏ tới users.id)',
    `artisan_id` BIGINT NOT NULL COMMENT 'Nghệ nhân bị khiếu nại (FK trỏ tới users.id)',
    `subject` VARCHAR(200) NOT NULL COMMENT 'Tiêu đề khiếu nại',
    `description` TEXT NOT NULL COMMENT 'Nội dung chi tiết khiếu nại',
    `status` ENUM('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN: Mới gửi, INVESTIGATING: Admin đang kiểm tra, RESOLVED: Đã giải quyết, REJECTED: Từ chối',
    `admin_note` TEXT DEFAULT NULL COMMENT 'Ghi chú phán quyết của Admin',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo khiếu nại',
    CONSTRAINT `fk_disputes_order` FOREIGN KEY (`custom_order_id`) REFERENCES `custom_orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_disputes_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_disputes_artisan` FOREIGN KEY (`artisan_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Khiếu nại và tranh chấp giao cho Admin xử lý';

-- ==============================================================================
-- PHẦN 2: DỮ LIỆU MẪU KHỞI TẠO (SEED MOCK DATA)
-- ==============================================================================

-- 1. Người dùng: Admin, 3 Shop thợ, 2 Khách mua
INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `avatar_url`, `role`, `status`, `introduction`, `portfolio_url`) VALUES
(1, 'admin@auracraft.vn', '123456', 'Quản Trị Viên', '0901234567', 'assets/images/admin-avatar.jpg', 'ROLE_ADMIN', 'ACTIVE', 'Quản trị viên hệ thống sàn thủ công AuraCraft.', NULL),
(2, 'anna@auracraft.vn', '123456', 'Anna Nguyễn', '0912345678', 'assets/images/artisan-anna.jpg', 'ROLE_ARTISAN', 'ACTIVE', 'Xưởng chế tác Charm Ý & Vòng tay kim loại cao cấp.', 'https://instagram.com/annacraft'),
(3, 'bao@auracraft.vn', '123456', 'Trần Bảo', '0923456789', 'assets/images/artisan-bao.jpg', 'ROLE_ARTISAN', 'ACTIVE', 'Xưởng gốm mỹ nghệ & phụ kiện custom Đà Nẵng.', 'https://facebook.com/baoceramics'),
(4, 'minh@artisan.vn', '123456', 'Vũ Đức Minh', '0945678901', 'assets/images/artisan-minh.jpg', 'ROLE_ARTISAN', 'ACTIVE', 'Xưởng đan len thủ công & Thú bông gấu len custom theo tên.', 'https://instagram.com/minhcrochet'),
(5, 'khang@gmail.com', '123456', 'Hoàng Khang', '0987654321', 'assets/images/buyer-khang.jpg', 'ROLE_BUYER', 'ACTIVE', 'Khách hàng thân thiết thích tự phối vòng tay tặng bạn gái.', NULL),
(6, 'lan@gmail.com', '123456', 'Mai Thị Lan', '0978123456', 'assets/images/buyer-lan.jpg', 'ROLE_BUYER', 'ACTIVE', 'Khách mua thích sưu tầm gấu bông len móc custom.', NULL);

-- 2. Danh mục sản phẩm
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Vòng tay Charm & Lắc tay', 'vong-tay-charm'),
(2, 'Gấu bông & Đồ len móc', 'gau-bong-len-moc'),
(3, 'Dây chuyền & Mặt đá', 'day-chuyen-mat-da'),
(4, 'Gốm sứ & Đất sét mỹ nghệ', 'gom-su-dat-set');

-- 3. Sản phẩm có sẵn & Mẫu custom (Shop Anna có vòng charm mẫu, Shop Minh có gấu bông mẫu)
INSERT INTO `products` (`id`, `artisan_id`, `category_id`, `name`, `description`, `price`, `old_price`, `stock_quantity`, `color`, `thumbnail_url`, `is_customizable`, `default_configuration_json`, `status`) VALUES
(1, 2, 1, 'Vòng Tay Charm Ý Romance Hoa Cúc', 'Vòng kim loại titan 16 mắt xích gắn sẵn charm hoa cúc và đá xanh. Khách có thể bấm nút Tùy Chỉnh để đổi charm theo ý thích.', 380000, 420000, 15, 'Bạc sáng', 'assets/images/bracelet-sample-1.jpg', TRUE, '{"base_material_id": 1, "slot_count": 16, "slots": [{"slot": 1, "material_id": 4}, {"slot": 2, "material_id": 2}, {"slot": 3, "material_id": 7}]}', 'ACTIVE'),
(2, 4, 2, 'Gấu Bông Len Móc Mini Đội Mũ', 'Gấu bông len cotton móc tay 100%, có thể custom thêm áo len, kính mắt hoặc thêu tên bé.', 220000, 250000, 20, 'Nâu sữa', 'assets/images/bear-sample-1.jpg', TRUE, '{"base_material_id": 8, "layers": [{"layer": "BASE", "material_id": 8}, {"layer": "HAT", "material_id": 10}, {"layer": "OUTFIT", "material_id": 9}]}', 'ACTIVE');

-- 4. KHO NGUYÊN LIỆU CUSTOM (Phân chia rõ ràng theo từng Shop & Loại sản phẩm)
INSERT INTO `custom_materials` (`id`, `artisan_id`, `product_type`, `part_type`, `name`, `price`, `image_url`, `stock_quantity`) VALUES
-- Kho của Shop Anna (artisan_id = 2) dành riêng cho VÒNG TAY CHARM Ý:
(1, 2, 'BRACELET', 'BASE', 'Phôi vòng kim loại Titan (16 mắt xích)', 50000, 'assets/images/charms/base-titan-16.png', 100),
(2, 2, 'BRACELET', 'CHARM', 'Charm Vuông Chữ K (Chữ Đen)', 15000, 'assets/images/charms/letter-k.png', 80),
(3, 2, 'BRACELET', 'CHARM', 'Charm Vuông Chữ L (Chữ Đen)', 15000, 'assets/images/charms/letter-l.png', 80),
(4, 2, 'BRACELET', 'CHARM', 'Charm Hoa Cúc Trắng Men Sứ', 35000, 'assets/images/charms/flower-daisy.png', 50),
(5, 2, 'BRACELET', 'CHARM', 'Charm Trái Tim Bạc S925', 40000, 'assets/images/charms/heart-silver.png', 45),
(6, 2, 'BRACELET', 'CHARM', 'Charm Cỏ 4 Lá May Mắn', 38000, 'assets/images/charms/clover-green.png', 60),
(7, 2, 'BRACELET', 'CHARM', 'Charm Đá Lấp Lánh Xanh Dương', 45000, 'assets/images/charms/stone-blue.png', 30),

-- Kho của Shop Minh (artisan_id = 4) dành riêng cho GẤU BÔNG LEN MÓC:
(8, 4, 'PLUSH_DOLL', 'BASE', 'Phôi thân gấu bông len trơn (Cao 20cm)', 120000, 'assets/images/bear/base-bear.png', 40),
(9, 4, 'PLUSH_DOLL', 'OUTFIT', 'Áo len sọc ngang đỏ trắng', 35000, 'assets/images/bear/outfit-stripes.png', 30),
(10, 4, 'PLUSH_DOLL', 'HAT', 'Mũ len nồi Pháp phong cách Vintage', 25000, 'assets/images/bear/hat-beret.png', 25),
(11, 4, 'PLUSH_DOLL', 'ACCESSORY', 'Kính mắt tròn Harry Potter tí hon', 20000, 'assets/images/bear/glasses-round.png', 50);

-- 5. BẢN THIẾT KẾ MẪU CỦA KHÁCH (Đã custom xong, có ảnh preview)
INSERT INTO `custom_designs` (`id`, `user_id`, `artisan_id`, `base_product_id`, `product_type`, `title`, `total_price`, `preview_image_url`, `configuration_json`) VALUES
(1, 5, 2, 1, 'BRACELET', 'Vòng tay đôi Khang & Lan', 430000, 'assets/images/custom-previews/bracelet-khang-lan.png', 
 '{"slots": [{"slot": 1, "material_id": 4}, {"slot": 2, "material_id": 2}, {"slot": 3, "material_id": 5}, {"slot": 4, "material_id": 3}, {"slot": 5, "material_id": 6}]}');

-- 6. Đơn hàng mua chiếc vòng tay custom trên
INSERT INTO `orders` (`id`, `order_code`, `buyer_id`, `total_amount`, `recipient_name`, `recipient_phone`, `shipping_address`, `payment_method`, `payment_status`, `status`) VALUES
(1, 'ORD-CUSTOM-01', 5, 430000, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'CRAFTING');

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `custom_design_id`, `quantity`, `unit_price`, `custom_notes`) VALUES
(1, 1, NULL, 1, 1, 430000, 'Gia công theo đúng ảnh render thiết kế của khách.');

-- 7. Yêu cầu làm riêng mở & Báo giá
INSERT INTO `custom_requests` (`id`, `buyer_id`, `product_type`, `materials`, `charm_description`, `budget`, `status`) VALUES
(1, 5, 'Vòng tay đôi phong thủy', 'Bạc 925, đá Lapis', 'Khắc ngày kỷ niệm 12/10', 800000, 'OPEN');

-- ==============================================================================
-- HOÀN TẤT KHỞI TẠO CƠ SỞ DỮ LIỆU AURACRAFT_DB
-- ==============================================================================
