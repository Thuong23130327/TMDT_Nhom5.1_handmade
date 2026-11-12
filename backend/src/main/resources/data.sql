-- Dữ liệu mẫu khởi tạo tài khoản cho AuraCraft
-- Mật khẩu gốc là: 123456
-- BCrypt hash ($2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy) = BCrypt("123456", strength=10)
INSERT IGNORE INTO users (id, username, email, password, full_name, phone, avatar_url, role, status, otp_attempts, introduction, portfolio_url, created_at)
VALUES 
(1, 'admin',  'admin@auracraft.vn',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Quản Trị Viên',   '0901234567', NULL, 'ROLE_ADMIN',    'ACTIVE',    0, 'Quản trị viên hệ thống sàn thủ công AuraCraft.',                                                   NULL,                              NOW()),
(2, 'anna',   'anna@auracraft.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anna Nguyễn',     '0912345678', NULL, 'ROLE_ARTISAN',  'ACTIVE',    0, 'Chuyên chế tác Resin và Charm bạc thủ công Ý 925.',                                                'https://instagram.com/annacraft', NOW()),
(3, 'bao',    'bao@auracraft.vn',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Bảo',        '0923456789', NULL, 'ROLE_ARTISAN',  'ACTIVE',    0, 'Nghệ nhân Resin Art Đà Nẵng, chuyên mặt dây chuyền phong cảnh đại dương.',                         'https://facebook.com/resinart',   NOW()),
(4, 'huy',    'huy@craft.vn',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm Quang Huy',  '0934567890', NULL, 'ROLE_ARTISAN',  'PENDING',   0, 'Thợ chạm khắc gỗ nghệ thuật Vintage phong cách mộc mạc.',                                          'https://instagram.com/huywood',   NOW()),
(5, 'trang',  'trang@craft.vn',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Đỗ Thảo Trang',   '0934567891', NULL, 'ROLE_ARTISAN',  'PENDING',   0, 'Nghệ nhân gốm thủ công vuốt tay Bát Tràng, nhận nặn cốc và lọ vẽ hoa văn custom.',                'https://behance.net/trangpottery', NOW()),
(6, 'minh',   'minh@artisan.vn',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vũ Đức Minh',     '0945678901', NULL, 'ROLE_ARTISAN',  'SUSPENDED', 0, 'Thợ đan len thủ công và thú bông len móc theo yêu cầu.',                                           NULL,                              NOW()),
(7, 'khang',  'khang@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoàng Khang',     '0987654321', NULL, 'ROLE_BUYER',    'ACTIVE',    0, 'Khách hàng thân thiết thích tự phối vòng tay tặng bạn gái.',                                       NULL,                              NOW()),
(8, 'lan',    'lan@gmail.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai Thị Lan',     '0978123456', NULL, 'ROLE_BUYER',    'ACTIVE',    0, 'Khách mua thích sưu tầm gấu bông len móc custom.',                                                 NULL,                              NOW());


-- Dữ liệu mẫu bổ sung cho bảng products (1-12)
INSERT IGNORE INTO products (id, artisan_id, category_id, name, description, price, old_price, stock_quantity, color, thumbnail_url, is_customizable, status)
VALUES
(3, 2, 1, 'Vòng tay charm trái tim', 'Vòng tay dây da phối charm trái tim bạc, nhỏ gọn tinh tế, custom được vị trí charm.', 110000, NULL, 25, '#E9C7C2', 'assets/images/bracelet-sample-1.jpg', 1, 'ACTIVE'),
(4, 3, 3, 'Dây chuyền charm cỏ 4 lá', 'Dây chuyền bạc 925 đính charm cỏ 4 lá may mắn, custom được độ dài dây và loại charm.', 150000, 180000, 30, '#C9D6C0', 'assets/images/necklace-sample-1.jpg', 1, 'ACTIVE'),
(5, 3, 3, 'Dây chuyền mặt trăng đá tự nhiên', 'Mặt dây chuyền hình trăng khuyết đính đá thạch anh tự nhiên, có thể custom loại đá và dây.', 210000, NULL, 15, '#B9C4DE', 'assets/images/necklace-sample-2.jpg', 1, 'ACTIVE'),
(6, 2, 1, 'Nhẫn bạc khắc tên theo yêu cầu', 'Nhẫn bạc 925 có thể khắc tên hoặc ngày kỷ niệm riêng, custom size và nội dung khắc.', 180000, 220000, 20, '#DAD2C8', 'assets/images/ring-sample-1.jpg', 1, 'ACTIVE'),
(7, 2, 1, 'Nhẫn đôi trơn tối giản', 'Thiết kế nhẫn đôi trơn, phong cách tối giản, phù hợp làm quà tặng, custom được size 2 nhẫn.', 160000, NULL, 20, '#EADFD0', 'assets/images/ring-sample-2.jpg', 1, 'ACTIVE'),
(8, 4, 2, 'Móc khóa điện thoại gấu bông mini', 'Móc khóa điện thoại hình gấu bông len, mềm mại, nhiều màu - hàng có sẵn tại shop.', 65000, NULL, 40, '#F0C9A0', 'https://myumemories.com/wp-content/uploads/2026/01/2-11-300x300.png', 0, 'ACTIVE'),
(9, 4, 2, 'Móc khóa điện thoại hoa cúc', 'Móc khóa len móc thủ công hình hoa cúc, đính charm nhỏ - hàng có sẵn tại shop.', 55000, 70000, 50, '#F5D6E0', 'https://myumemories.com/wp-content/uploads/2026/01/3-10-300x300.png', 0, 'ACTIVE'),
(10, 4, 2, 'Móc khóa điện thoại ngôi sao', 'Móc khóa hình ngôi sao lấp lánh, có thể đính thêm chuông nhỏ - hàng có sẵn tại shop.', 60000, NULL, 35, '#D8E4F0', 'https://myumemories.com/wp-content/uploads/2026/01/8-10-300x300.png', 0, 'ACTIVE'),
(11, 4, 2, 'Móc khóa điện thoại mèo cam', 'Móc khóa hình mèo cam len móc tay, đi kèm dây đeo chắc chắn - hàng có sẵn tại shop.', 58000, NULL, 40, '#F3DCA8', 'https://myumemories.com/wp-content/uploads/2026/02/2-1-300x300.png', 0, 'ACTIVE'),
(12, 3, 3, 'Dây chuyền charm ngôi sao mini', 'Dây chuyền bạc mảnh phối charm ngôi sao mini, custom được số lượng charm.', 135000, NULL, 25, '#CFE0DA', 'assets/images/necklace-sample-3.jpg', 1, 'ACTIVE');
