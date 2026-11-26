-- Dữ liệu mẫu khởi tạo tài khoản và sản phẩm AuraCraft
-- Mật khẩu mặc định cho tất cả tài khoản: 123456

-- 1. BẢNG TÀI KHOẢN NGƯỜI DÙNG (USERS)
INSERT IGNORE INTO users (id, username, email, password, full_name, phone, avatar_url, role, status, otp_attempts, introduction, portfolio_url, created_at)
VALUES 
(1, 'admin',  'admin@auracraft.vn',  '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Quản Trị Viên',   '0901234567', NULL, 'ROLE_ADMIN',    'ACTIVE',    0, 'Quản trị viên hệ thống sàn thủ công AuraCraft.',                                                   NULL,                              NOW()),
(2, 'anna',   'anna@auracraft.vn',   '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Anna Nguyễn',     '0912345678', NULL, 'ROLE_ARTISAN',  'ACTIVE',    0, 'Chuyên chế tác Resin và Charm bạc thủ công Ý 925.',                                                'https://instagram.com/annacraft', NOW()),
(3, 'bao',    'bao@auracraft.vn',    '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Trần Bảo',        '0923456789', NULL, 'ROLE_ARTISAN',  'ACTIVE',    0, 'Nghệ nhân Resin Art Đà Nẵng, chuyên mặt dây chuyền phong cảnh đại dương.',                         'https://facebook.com/resinart',   NOW()),
(4, 'huy',    'huy@craft.vn',        '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Phạm Quang Huy',  '0934567890', NULL, 'ROLE_ARTISAN',  'PENDING',   0, 'Thợ chạm khắc gỗ nghệ thuật Vintage phong cách mộc mạc.',                                          'https://instagram.com/huywood',   NOW()),
(5, 'trang',  'trang@craft.vn',      '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Đỗ Thảo Trang',   '0934567891', NULL, 'ROLE_ARTISAN',  'PENDING',   0, 'Nghệ nhân gốm thủ công vuốt tay Bát Tràng, nhận nặn cốc và lọ vẽ hoa văn custom.',                'https://behance.net/trangpottery', NOW()),
(6, 'minh',   'minh@artisan.vn',     '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Vũ Đức Minh',     '0945678901', NULL, 'ROLE_ARTISAN',  'SUSPENDED', 0, 'Thợ đan len thủ công và thú bông len móc theo yêu cầu.',                                           NULL,                              NOW()),
(7, 'khang',  'khang@gmail.com',     '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Hoàng Khang',     '0987654321', NULL, 'ROLE_BUYER',    'ACTIVE',    0, 'Khách hàng thân thiết thích tự phối vòng tay.',                                                    NULL,                              NOW()),
(8, 'lan',    'lan@gmail.com',       '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm', 'Mai Thị Lan',     '0978123456', NULL, 'ROLE_BUYER',    'ACTIVE',    0, 'Khách mua thích sưu tầm đồ len móc thủ công.',                                                     NULL,                              NOW());

UPDATE users SET password = '$2a$10$WJwoxip.dLnk3Fs9dy15ae2AzwzbeHzMVy6Ojp1MZHCtW.C/vj8Vm' WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);
UPDATE users SET username = 'admin' WHERE id = 1 AND (username IS NULL OR username = '');
UPDATE users SET username = 'anna' WHERE id = 2 AND (username IS NULL OR username = '');
UPDATE users SET username = 'bao' WHERE id = 3 AND (username IS NULL OR username = '');
UPDATE users SET username = 'huy' WHERE id = 4 AND (username IS NULL OR username = '');
UPDATE users SET username = 'trang' WHERE id = 5 AND (username IS NULL OR username = '');
UPDATE users SET username = 'minh' WHERE id = 6 AND (username IS NULL OR username = '');
UPDATE users SET username = 'khang' WHERE id = 7 AND (username IS NULL OR username = '');
UPDATE users SET username = 'lan' WHERE id = 8 AND (username IS NULL OR username = '');

-- 2. BẢNG DANH MỤC SẢN PHẨM (CATEGORIES)
INSERT IGNORE INTO categories (id, name, slug) VALUES
(1, 'Vòng tay & Lắc', 'vong-tay-lac'),
(2, 'Gấu bông & Đồ len', 'gau-bong-do-len'),
(3, 'Dây chuyền & Mặt đá', 'day-chuyen-mat-da'),
(4, 'Phụ kiện Handmade', 'phu-kien-handmade');

-- 3. BẢNG SẢN PHẨM THỦ CÔNG (PRODUCTS)
INSERT IGNORE INTO products (id, artisan_id, category_id, name, description, price, old_price, stock_quantity, color, thumbnail_url, status, is_customizable, created_at)
VALUES 
(1, 2, 1, 'Vòng tay hạt gỗ thơm & Charm bạc', 'Vòng tay làm thủ công từ hạt gỗ trầm thơm tự nhiên, phối cùng charm bạc 925.', 120000.00, 150000.00, 25, 'Nâu gỗ', 'assets/img/products/bracelet_01.jpg', 'ACTIVE', 1, '2026-10-01 08:30:00'),
(2, 2, 1, 'Vòng tay dây da charm hoa', 'Dây da bò thật phối charm hoa mini, dễ phối đồ hằng ngày.', 95000.00, NULL, 30, 'Nâu pastel', 'assets/img/products/bracelet_02.jpg', 'ACTIVE', 0, '2026-10-03 09:15:00'),
(3, 2, 3, 'Dây chuyền mặt trăng thạch anh', 'Mặt trăng khuyết bạc Ý đính đá thạch anh tự nhiên thanh khiết.', 350000.00, 390000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_02.jpg', 'ACTIVE', 1, '2026-10-05 10:00:00'),
(4, 2, 1, 'Lắc chân chuông bạc handmade mạ vàng', 'Lắc chân vintage đính chuông bạc phong thủy kêu leng keng vui tai.', 220000.00, 260000.00, 20, 'Vàng kim', 'assets/img/products/anket_01.jpg', 'ACTIVE', 1, '2026-10-06 11:30:00'),
(5, 4, 1, 'Armlet Bohemian Vintage bắp tay', 'Vòng đeo bắp tay phong cách Bohemian cá tính, chế tác từ đồng cổ uốn lượn sắc sảo.', 180000.00, 210000.00, 18, 'Đồng cổ', 'assets/img/products/armlet_01.jpg', 'ACTIVE', 0, '2026-10-07 09:15:00'),
(6, 2, 1, 'Vòng bụng hạt cườm đi biển Beachy', 'Vòng bụng hạt cườm sắc màu rực rỡ, thích hợp cho các chuyến du lịch biển mùa hè.', 130000.00, 160000.00, 30, 'Pastel', 'assets/img/products/belly_01.jpg', 'ACTIVE', 1, '2026-10-08 14:20:00'),
(7, 4, 4, 'Dây đeo điện thoại handmade pastel', 'Dây strap treo điện thoại đính hạt cườm hoa cúc và trái tim pastel siêu dễ thương.', 90000.00, 110000.00, 50, 'Hồng kem', 'assets/img/products/phoneStrap_01.jpg', 'ACTIVE', 1, '2026-10-09 16:45:00'),
(8, 2, 3, 'Dây chuyền đá quý thạch anh khói', 'Dây chuyền bạc 925 đính đá quý thạch anh khói chế tác đa giác cắt lấp lánh.', 450000.00, 500000.00, 10, 'Nâu khói', 'assets/img/products/necklace_03.jpg', 'ACTIVE', 1, '2026-10-10 13:10:00'),
(9, 2, 1, 'Lắc chân biển vỏ ốc & chuông đồng', 'Lắc chân bện sợi chống nước phối vỏ ốc tự nhiên và chuông đồng vintage.', 190000.00, 220000.00, 22, 'Nâu vỏ ốc', 'assets/img/products/anket_02.jpg', 'ACTIVE', 0, '2026-10-10 14:00:00'),
(10, 4, 1, 'Vòng tay bắp cá tính mạ vàng cổ', 'Armlet xoắn ốc phong cách Hy Lạp cổ đại, điều chỉnh độ rộng linh hoạt.', 210000.00, 250000.00, 16, 'Vàng cổ', 'assets/img/products/armlet_02.jpg', 'ACTIVE', 0, '2026-10-11 15:30:00'),
(11, 2, 1, 'Vòng bụng đi biển ngọc trai nhân tạo', 'Chuỗi vòng bụng ngọc trai nhỏ duyên dáng tôn vòng eo phái đẹp.', 145000.00, 170000.00, 25, 'Trắng kem', 'assets/img/products/belly_02.jpg', 'ACTIVE', 1, '2026-10-12 16:15:00'),
(12, 4, 4, 'Dây đeo điện thoại hạt cườm ngôi sao', 'Dây treo điện thoại đính hạt cườm ngôi sao dạ quang phát sáng nhẹ ban đêm.', 85000.00, 100000.00, 35, 'Xanh pastel', 'assets/img/products/phoneStrap_02.jpg', 'ACTIVE', 0, '2026-10-13 17:00:00'),
(13, 2, 1, 'Vòng tay chỉ đỏ may mắn charm tỳ hưu', 'Vòng chỉ đỏ may mắn tết thủ công cầu bình an tài lộc, đính tỳ hưu bạc.', 99000.00, 120000.00, 40, 'Đỏ ruby', 'assets/img/products/bracelet_03.jpg', 'ACTIVE', 1, '2026-10-14 09:20:00'),
(14, 2, 3, 'Dây chuyền bạc 925 cỏ 4 lá may mắn', 'Dây chuyền sợi mảnh thanh lịch, mặt cỏ bốn lá xoay tròn đính đá zircon lấp lánh.', 550000.00, 620000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_04.jpg', 'ACTIVE', 1, '2026-10-15 10:45:00'),
(15, 2, 1, 'Lắc chân vintage đính chuông gió', 'Lắc chân bạc phong cách mộc mạc nhẹ nhàng, tôn dáng cổ chân thon thả.', 160000.00, 190000.00, 19, 'Bạc mờ', 'assets/img/products/anket_03.jpg', 'ACTIVE', 0, '2026-10-16 11:10:00'),
(16, 2, 1, 'Vòng tay ngọc trai nước ngọt baroque', 'Vòng tay chuỗi ngọc trai nuôi nước ngọt dáng baroque tự nhiên độc bản, khóa bạc 925.', 320000.00, 380000.00, 11, 'Trắng ngọc', 'assets/img/products/bracelet_04.jpg', 'ACTIVE', 1, '2026-10-17 14:00:00');

-- 4. BẢNG ĐƠN HÀNG MẪU (ORDERS) TRẢI DÀI PHỤC VỤ BIỂU ĐỒ & AI
INSERT IGNORE INTO orders (id, order_code, buyer_id, total_amount, recipient_name, recipient_phone, shipping_address, payment_method, payment_status, status, created_at)
VALUES
(1, 'ORD-20261010-01', 7, 890000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-10 10:20:00'),
(2, 'ORD-20261011-01', 8, 620000.00, 'Mai Thị Lan', '0978123456', '12 Nguyễn Trãi, Quận 5, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-11 11:45:00'),
(3, 'ORD-20261013-01', 7, 350000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'COD', 'PAID', 'COMPLETED', '2026-10-13 15:30:00'),
(4, 'ORD-20261014-01', 8, 580000.00, 'Mai Thị Lan', '0978123456', '88 Cầu Giấy, Hà Nội', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-14 09:10:00'),
(5, 'ORD-20261015-01', 7, 960000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-15 14:00:00'),
(6, 'ORD-20261016-01', 8, 420000.00, 'Mai Thị Lan', '0978123456', '24 Lý Tự Trọng, Quận 1, TP.HCM', 'COD', 'PAID', 'COMPLETED', '2026-10-16 16:50:00'),
(7, 'ORD-20261017-01', 7, 1320000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-17 11:15:00'),
(8, 'ORD-20261019-01', 8, 880000.00, 'Mai Thị Lan', '0978123456', '50 Hùng Vương, Đà Nẵng', 'VNPAY', 'PAID', 'COMPLETED', '2026-10-19 13:40:00'),
(9, 'ORD-20261021-01', 7, 1150000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'SHIPPING', '2026-10-21 10:05:00');

-- 5. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS) - TẠO CÁC MẪU MUA KÈM CHO THUẬT TOÁN APRIORI
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, custom_notes)
VALUES
(1, 1, 1, 2, 120000.00, 'Charm hoa cúc Ý'),
(2, 1, 7, 1, 90000.00, 'Tặng kèm bạn gái'),
(3, 2, 3, 1, 350000.00, 'Dây dài 45cm'),
(4, 2, 4, 1, 220000.00, 'Lắc chân chuông bạc phong thủy'),
(5, 3, 1, 1, 120000.00, 'Gỗ trầm thơm tự nhiên'),
(6, 3, 7, 1, 90000.00, 'Dây đeo pastel'),
(7, 4, 8, 1, 450000.00, 'Thạch anh khói phong thủy'),
(8, 5, 1, 2, 120000.00, 'Khắc chữ Khang'),
(9, 5, 7, 2, 90000.00, 'Dây đeo điện thoại đôi'),
(10, 6, 4, 1, 220000.00, 'Lắc chuông vintage'),
(11, 7, 14, 2, 550000.00, 'Cỏ 4 lá may mắn'),
(12, 8, 1, 2, 120000.00, 'Vòng tay charm bạc'),
(13, 8, 7, 1, 90000.00, 'Dây treo điện thoại'),
(14, 9, 16, 3, 320000.00, 'Ngọc trai nuôi baroque');
