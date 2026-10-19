-- Dữ liệu mẫu khởi tạo tài khoản cho AuraCraft
INSERT IGNORE INTO users (id, email, password, full_name, phone, avatar_url, role, status, introduction, portfolio_url, created_at)
VALUES 
(1, 'admin@auracraft.vn', '123456', 'Quản Trị Viên', '0901234567', NULL, 'ROLE_ADMIN', 'ACTIVE', 'Quản trị viên hệ thống sàn thủ công AuraCraft.', NULL, NOW()),
(2, 'anna@auracraft.vn', '123456', 'Anna Nguyễn', '0912345678', NULL, 'ROLE_ARTISAN', 'ACTIVE', 'Chuyên chế tác Resin và Charm bạc thủ công Ý 925.', 'https://instagram.com/annacraft', NOW()),
(3, 'bao@auracraft.vn', '123456', 'Trần Bảo', '0923456789', NULL, 'ROLE_ARTISAN', 'ACTIVE', 'Nghệ nhân Resin Art Đà Nẵng, chuyên mặt dây chuyền phong cảnh đại dương.', 'https://facebook.com/resinart', NOW()),
(4, 'huy@craft.vn', '123456', 'Phạm Quang Huy', '0934567890', NULL, 'ROLE_ARTISAN', 'PENDING', 'Thợ chạm khắc gỗ nghệ thuật Vintage phong cách mộc mạc.', 'https://instagram.com/huywood', NOW()),
(5, 'trang@craft.vn', '123456', 'Đỗ Thảo Trang', '0934567891', NULL, 'ROLE_ARTISAN', 'PENDING', 'Nghệ nhân gốm thủ công vuốt tay Bát Tràng, nhận nặn cốc và lọ vẽ hoa văn custom.', 'https://behance.net/trangpottery', NOW()),
(6, 'minh@artisan.vn', '123456', 'Vũ Đức Minh', '0945678901', NULL, 'ROLE_ARTISAN', 'SUSPENDED', 'Thợ đan len thủ công và thú bông len móc theo yêu cầu.', NULL, NOW()),
(7, 'khang@gmail.com', '123456', 'Hoàng Khang', '0987654321', NULL, 'ROLE_BUYER', 'ACTIVE', 'Khách hàng thân thiết thích tự phối vòng tay tặng bạn gái.', NULL, NOW()),
(8, 'lan@gmail.com', '123456', 'Mai Thị Lan', '0978123456', NULL, 'ROLE_BUYER', 'ACTIVE', 'Khách mua thích sưu tầm gấu bông len móc custom.', NULL, NOW());
