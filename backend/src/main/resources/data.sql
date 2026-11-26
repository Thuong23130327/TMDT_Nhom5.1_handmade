-- Dữ liệu mẫu khởi tạo tài khoản, sản phẩm, đơn hàng và dữ liệu huấn luyện AI AuraCraft
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

-- 3. BẢNG SẢN PHẨM THỦ CÔNG (20 SẢN PHẨM ĐA DẠNG CHO COSINE SIMILARITY)
INSERT IGNORE INTO products (id, artisan_id, category_id, name, description, price, old_price, stock_quantity, color, thumbnail_url, status, is_customizable, created_at)
VALUES 
(1, 2, 1, 'Vòng tay hạt gỗ thơm & Charm bạc', 'Vòng tay làm thủ công từ hạt gỗ trầm thơm tự nhiên, phối cùng charm bạc 925.', 120000.00, 150000.00, 25, 'Nâu gỗ', 'assets/img/products/bracelet_01.jpg', 'ACTIVE', 1, '2026-10-01 08:30:00'),
(2, 2, 1, 'Vòng tay dây da charm hoa', 'Dây da bò thật phối charm hoa mini, dễ phối đồ hằng ngày phong cách vintage.', 95000.00, NULL, 30, 'Nâu pastel', 'assets/img/products/bracelet_02.jpg', 'ACTIVE', 0, '2026-10-03 09:15:00'),
(3, 2, 3, 'Dây chuyền mặt trăng thạch anh', 'Mặt trăng khuyết bạc Ý 925 đính đá thạch anh tự nhiên thanh khiết.', 350000.00, 390000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_02.jpg', 'ACTIVE', 1, '2026-10-05 10:00:00'),
(4, 2, 1, 'Lắc chân chuông bạc handmade mạ vàng', 'Lắc chân vintage đính chuông bạc phong thủy kêu leng keng vui tai.', 220000.00, 260000.00, 20, 'Vàng kim', 'assets/img/products/anket_01.jpg', 'ACTIVE', 1, '2026-10-06 11:30:00'),
(5, 4, 1, 'Armlet Bohemian Vintage bắp tay', 'Vòng đeo bắp tay phong cách Bohemian cá tính, chế tác từ đồng cổ uốn lượn sắc sảo.', 180000.00, 210000.00, 18, 'Đồng cổ', 'assets/img/products/armlet_01.jpg', 'ACTIVE', 0, '2026-10-07 09:15:00'),
(6, 2, 1, 'Vòng bụng hạt cườm đi biển Beachy', 'Vòng bụng hạt cườm sắc màu rực rỡ, thích hợp cho các chuyến du lịch biển mùa hè.', 130000.00, 160000.00, 30, 'Pastel', 'assets/img/products/belly_01.jpg', 'ACTIVE', 1, '2026-10-08 14:20:00'),
(7, 4, 4, 'Dây đeo điện thoại handmade pastel', 'Dây strap treo điện thoại đính hạt cườm hoa cúc và trái tim pastel siêu dễ thương.', 90000.00, 110000.00, 50, 'Hồng kem', 'assets/img/products/phoneStrap_01.jpg', 'ACTIVE', 1, '2026-10-09 16:45:00'),
(8, 2, 3, 'Dây chuyền đá quý thạch anh khói', 'Dây chuyền bạc 925 đính đá quý thạch anh khói chế tác đa giác cắt lấp lánh.', 450000.00, 500000.00, 10, 'Nâu khói', 'assets/img/products/necklace_03.jpg', 'ACTIVE', 1, '2026-10-10 13:10:00'),
(9, 2, 1, 'Lắc chân biển vỏ ốc & chuông đồng', 'Lắc chân bện sợi chống nước phối vỏ ốc tự nhiên và chuông đồng vintage đi biển.', 190000.00, 220000.00, 22, 'Nâu vỏ ốc', 'assets/img/products/anket_02.jpg', 'ACTIVE', 0, '2026-10-10 14:00:00'),
(10, 4, 1, 'Vòng tay bắp cá tính mạ vàng cổ', 'Armlet xoắn ốc phong cách Hy Lạp cổ đại Bohemian, điều chỉnh độ rộng linh hoạt.', 210000.00, 250000.00, 16, 'Vàng cổ', 'assets/img/products/armlet_02.jpg', 'ACTIVE', 0, '2026-10-11 15:30:00'),
(11, 2, 1, 'Vòng bụng đi biển ngọc trai nhân tạo', 'Chuỗi vòng bụng ngọc trai nhỏ duyên dáng tôn vòng eo phái đẹp đi biển.', 145000.00, 170000.00, 25, 'Trắng kem', 'assets/img/products/belly_02.jpg', 'ACTIVE', 1, '2026-10-12 16:15:00'),
(12, 4, 4, 'Dây đeo điện thoại hạt cườm ngôi sao', 'Dây treo điện thoại đính hạt cườm ngôi sao dạ quang pastel phát sáng nhẹ ban đêm.', 85000.00, 100000.00, 35, 'Xanh pastel', 'assets/img/products/phoneStrap_02.jpg', 'ACTIVE', 0, '2026-10-13 17:00:00'),
(13, 2, 1, 'Vòng tay chỉ đỏ may mắn charm tỳ hưu', 'Vòng chỉ đỏ may mắn tết thủ công cầu bình an tài lộc, đính charm tỳ hưu bạc 925.', 99000.00, 120000.00, 40, 'Đỏ ruby', 'assets/img/products/bracelet_03.jpg', 'ACTIVE', 1, '2026-10-14 09:20:00'),
(14, 2, 3, 'Dây chuyền bạc 925 cỏ 4 lá may mắn', 'Dây chuyền sợi mảnh thanh lịch, mặt cỏ bốn lá may mắn xoay tròn đính đá zircon lấp lánh.', 550000.00, 620000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_04.jpg', 'ACTIVE', 1, '2026-10-15 10:45:00'),
(15, 2, 1, 'Lắc chân vintage đính chuông gió', 'Lắc chân bạc phong cách mộc mạc nhẹ nhàng, tôn dáng cổ chân thon thả.', 160000.00, 190000.00, 19, 'Bạc mờ', 'assets/img/products/anket_03.jpg', 'ACTIVE', 0, '2026-10-16 11:10:00'),
(16, 2, 1, 'Vòng tay ngọc trai nước ngọt baroque', 'Vòng tay chuỗi ngọc trai nuôi nước ngọt dáng baroque tự nhiên độc bản, khóa bạc 925.', 320000.00, 380000.00, 11, 'Trắng ngọc', 'assets/img/products/bracelet_04.jpg', 'ACTIVE', 1, '2026-10-17 14:00:00'),
(17, 3, 2, 'Gấu bông len móc thỏ tai dài pastel', 'Thú bông đan móc thủ công bằng len milk cotton mềm mịn an toàn cho da, quà tặng sinh nhật.', 250000.00, 290000.00, 20, 'Kem sữa', 'assets/img/products/bracelet_05.jpg', 'ACTIVE', 1, '2026-10-18 09:00:00'),
(18, 3, 2, 'Móc khóa gấu bông len mini dễ thương', 'Móc khóa thú len móc tay hình gấu nhỏ xinh treo balo, túi xách, quà tặng bạn thân.', 75000.00, 95000.00, 45, 'Nâu sữa', 'assets/img/products/phoneStrap_03.jpg', 'ACTIVE', 0, '2026-10-19 10:00:00'),
(19, 3, 2, 'Bó hoa len hướng dương móc tay', 'Hoa hướng dương đan móc len thủ công bền đẹp mãi mãi, gói giấy kraft vintage tặng người thương.', 185000.00, 220000.00, 18, 'Vàng nâu', 'assets/img/products/necklace_05.jpg', 'ACTIVE', 1, '2026-10-20 11:00:00'),
(20, 3, 4, 'Kẹp tóc hoa len móc pastel handmade', 'Bộ kẹp tóc hoa cúc đan len nhiều màu pastel nhẹ nhàng phong cách Hàn Quốc.', 65000.00, 80000.00, 60, 'Hồng pastel', 'assets/img/products/belly_03.jpg', 'ACTIVE', 0, '2026-10-21 12:00:00');

-- 4. BẢNG ĐƠN HÀNG MẪU (22 ĐƠN HÀNG TRẢI ĐỀU THÁNG 10 & THÁNG 11 PHỤC VỤ BIỂU ĐỒ & APRIORI)
INSERT IGNORE INTO orders (id, order_code, buyer_id, total_amount, recipient_name, recipient_phone, shipping_address, payment_method, payment_status, status, created_at)
VALUES
(1,  'ORD-20261010-01', 7, 330000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-12 10:20:00'),
(2,  'ORD-20261011-01', 8, 570000.00,  'Mai Thị Lan', '0978123456', '12 Nguyễn Trãi, Quận 5, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-13 11:45:00'),
(3,  'ORD-20261013-01', 7, 210000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'COD',   'PAID', 'COMPLETED', '2026-11-14 15:30:00'),
(4,  'ORD-20261014-01', 8, 1000000.00, 'Mai Thị Lan', '0978123456', '88 Cầu Giấy, Hà Nội', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-15 09:10:00'),
(5,  'ORD-20261015-01', 7, 420000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-16 14:00:00'),
(6,  'ORD-20261016-01', 8, 410000.00,  'Mai Thị Lan', '0978123456', '24 Lý Tự Trọng, Quận 1, TP.HCM', 'COD',   'PAID', 'COMPLETED', '2026-11-17 16:50:00'),
(7,  'ORD-20261017-01', 7, 649000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-18 11:15:00'),
(8,  'ORD-20261019-01', 8, 330000.00,  'Mai Thị Lan', '0978123456', '50 Hùng Vương, Đà Nẵng', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-19 13:40:00'),
(9,  'ORD-20261021-01', 7, 415000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'SHIPPING',  '2026-11-20 10:05:00'),
(10, 'ORD-20261121-01', 8, 325000.00,  'Mai Thị Lan', '0978123456', '12 Nguyễn Trãi, Quận 5, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-21 09:30:00'),
(11, 'ORD-20261121-02', 7, 275000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'MOMO',  'PAID', 'COMPLETED', '2026-11-21 14:20:00'),
(12, 'ORD-20261122-01', 8, 390000.00,  'Mai Thị Lan', '0978123456', '88 Cầu Giấy, Hà Nội', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-22 10:15:00'),
(13, 'ORD-20261122-02', 7, 649000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'COMPLETED', '2026-11-22 17:45:00'),
(14, 'ORD-20261123-01', 8, 1000000.00, 'Mai Thị Lan', '0978123456', '24 Lý Tự Trọng, Quận 1, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-23 11:00:00'),
(15, 'ORD-20261123-02', 7, 325000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'MOMO',  'PAID', 'COMPLETED', '2026-11-23 19:20:00'),
(16, 'ORD-20261124-01', 8, 250000.00,  'Mai Thị Lan', '0978123456', '50 Hùng Vương, Đà Nẵng', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-24 08:45:00'),
(17, 'ORD-20261124-02', 7, 570000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'COD',   'PAID', 'CRAFTING',  '2026-11-24 15:10:00'),
(18, 'ORD-20261125-01', 8, 410000.00,  'Mai Thị Lan', '0978123456', '12 Nguyễn Trãi, Quận 5, TP.HCM', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-25 10:30:00'),
(19, 'ORD-20261125-02', 7, 175000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'MOMO',  'PAID', 'COMPLETED', '2026-11-25 16:00:00'),
(20, 'ORD-20261125-03', 8, 275000.00,  'Mai Thị Lan', '0978123456', '88 Cầu Giấy, Hà Nội', 'VNPAY', 'PAID', 'COMPLETED', '2026-11-25 20:15:00'),
(21, 'ORD-20261126-01', 7, 649000.00,  'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'VNPAY', 'PAID', 'PENDING',   '2026-11-26 09:00:00'),
(22, 'ORD-20261126-02', 8, 390000.00,  'Mai Thị Lan', '0978123456', '24 Lý Tự Trọng, Quận 1, TP.HCM', 'BANKING', 'PAID', 'CRAFTING',  '2026-11-26 11:30:00');

-- 5. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS) - ĐA DẠNG CÁC CẶP MUA KÈM CHO THUẬT TOÁN APRIORI
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, custom_notes)
VALUES
-- Cặp (1, 7) xuất hiện 4 lần
(1,  1,  1,  2, 120000.00, 'Charm hoa cúc Ý'),
(2,  1,  7,  1,  90000.00, 'Tặng kèm bạn gái'),
-- Cặp (3, 4) xuất hiện 3 lần
(3,  2,  3,  1, 350000.00, 'Dây dài 45cm'),
(4,  2,  4,  1, 220000.00, 'Lắc chân chuông bạc'),
(5,  3,  1,  1, 120000.00, 'Gỗ trầm thơm tự nhiên'),
(6,  3,  7,  1,  90000.00, 'Dây đeo pastel'),
-- Cặp (8, 14) xuất hiện 2 lần
(7,  4,  8,  1, 450000.00, 'Thạch anh khói'),
(8,  4, 14,  1, 550000.00, 'Cỏ 4 lá may mắn'),
(9,  5,  1,  2, 120000.00, 'Khắc chữ Khang'),
(10, 5,  7,  2,  90000.00, 'Dây đeo điện thoại đôi'),
-- Cặp (4, 9) xuất hiện 2 lần
(11, 6,  4,  1, 220000.00, 'Lắc chuông vintage'),
(12, 6,  9,  1, 190000.00, 'Lắc vỏ ốc biển'),
-- Cặp (13, 14) xuất hiện 3 lần
(13, 7, 13,  1,  99000.00, 'Vòng chỉ đỏ tỳ hưu'),
(14, 7, 14,  1, 550000.00, 'Cỏ 4 lá may mắn'),
(15, 8,  1,  2, 120000.00, 'Vòng tay charm bạc'),
(16, 8,  7,  1,  90000.00, 'Dây treo điện thoại'),
-- Cặp (2, 16) xuất hiện 2 lần
(17, 9,  2,  1,  95000.00, 'Dây da charm hoa'),
(18, 9, 16,  1, 320000.00, 'Ngọc trai baroque'),
-- Cặp (17, 18) xuất hiện 2 lần (Danh mục Gấu bông & Đồ len)
(19, 10, 17, 1, 250000.00, 'Thỏ len pastel'),
(20, 10, 18, 1,  75000.00, 'Móc khóa gấu len'),
-- Cặp (6, 11) xuất hiện 2 lần (Set đi biển)
(21, 11,  6, 1, 130000.00, 'Vòng bụng hạt cườm'),
(22, 11, 11, 1, 145000.00, 'Vòng bụng ngọc trai'),
-- Cặp (5, 10) xuất hiện 2 lần (Set Armlet Bohemian)
(23, 12,  5, 1, 180000.00, 'Armlet Bohemian'),
(24, 12, 10, 1, 210000.00, 'Armlet xoắn ốc'),
(25, 13, 13, 1,  99000.00, 'Chỉ đỏ may mắn'),
(26, 13, 14, 1, 550000.00, 'Dây chuyền cỏ 4 lá'),
(27, 14,  8, 1, 450000.00, 'Thạch anh khói'),
(28, 14, 14, 1, 550000.00, 'Dây chuyền bạc 925'),
(29, 15, 17, 1, 250000.00, 'Gấu len thỏ'),
(30, 15, 18, 1,  75000.00, 'Móc khóa gấu mini'),
-- Cặp (19, 20) xuất hiện 2 lần (Quà tặng hoa len + kẹp tóc)
(31, 16, 19, 1, 185000.00, 'Hoa hướng dương len'),
(32, 16, 20, 1,  65000.00, 'Kẹp tóc hoa len'),
(33, 17,  3, 1, 350000.00, 'Mặt trăng thạch anh'),
(34, 17,  4, 1, 220000.00, 'Lắc chân chuông bạc'),
(35, 18,  4, 1, 220000.00, 'Lắc chân chuông bạc'),
(36, 18,  9, 1, 190000.00, 'Lắc chân vỏ ốc'),
-- Cặp (7, 12) xuất hiện 2 lần (Phụ kiện dây đeo điện thoại)
(37, 19,  7, 1,  90000.00, 'Dây đeo pastel'),
(38, 19, 12, 1,  85000.00, 'Dây đeo ngôi sao'),
(39, 20,  6, 1, 130000.00, 'Vòng bụng Beachy'),
(40, 20, 11, 1, 145000.00, 'Vòng bụng ngọc trai'),
(41, 21, 13, 1,  99000.00, 'Chỉ đỏ may mắn'),
(42, 21, 14, 1, 550000.00, 'Dây chuyền cỏ 4 lá'),
(43, 22,  5, 1, 180000.00, 'Armlet Bohemian'),
(44, 22, 10, 1, 210000.00, 'Armlet xoắn ốc');

-- 6. BẢNG GIỎ HÀNG BỎ QUÊN (CART_SESSIONS) PHỤC VỤ HYBRID APRIORI CỦA PHONG
INSERT IGNORE INTO cart_sessions (id, user_id, status, order_id, last_activity_at, created_at)
VALUES
(1, 7, 'ABANDONED', NULL, '2026-11-22 20:00:00', '2026-11-22 19:30:00'),
(2, 8, 'ABANDONED', NULL, '2026-11-23 21:15:00', '2026-11-23 20:45:00'),
(3, 7, 'ABANDONED', NULL, '2026-11-24 18:00:00', '2026-11-24 17:30:00');

INSERT IGNORE INTO cart_session_items (id, cart_session_id, product_id, quantity, added_at)
VALUES
(1, 1, 19, 1, '2026-11-22 19:31:00'),
(2, 1, 20, 1, '2026-11-22 19:32:00'),
(3, 2,  7, 1, '2026-11-23 20:46:00'),
(4, 2, 12, 1, '2026-11-23 20:47:00'),
(5, 3, 15, 1, '2026-11-24 17:31:00'),
(6, 3,  4, 1, '2026-11-24 17:32:00');
