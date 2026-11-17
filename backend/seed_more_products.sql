USE auracraft_db;

INSERT IGNORE INTO products (id, artisan_id, category_id, name, description, price, old_price, stock_quantity, color, thumbnail_url, status, is_customizable, created_at)
VALUES 
(9, 2, 1, 'Lắc chân biển vỏ ốc & chuông đồng', 'Lắc chân bện sợi chống nước phối vỏ ốc tự nhiên và chuông đồng vintage.', 190000.00, 220000.00, 22, 'Nâu vỏ ốc', 'assets/img/products/anket_02.jpg', 'ACTIVE', 0, '2026-10-10 14:00:00'),
(10, 4, 1, 'Vòng tay bắp cá tính mạ vàng cổ', 'Armlet xoắn ốc phong cách Hy Lạp cổ đại, điều chỉnh độ rộng linh hoạt.', 210000.00, 250000.00, 16, 'Vàng cổ', 'assets/img/products/armlet_02.jpg', 'ACTIVE', 0, '2026-10-11 15:30:00'),
(11, 2, 1, 'Vòng bụng đi biển ngọc trai nhân tạo', 'Chuỗi vòng bụng ngọc trai nhỏ duyên dáng tôn vòng eo phái đẹp.', 145000.00, 170000.00, 25, 'Trắng kem', 'assets/img/products/belly_02.jpg', 'ACTIVE', 1, '2026-10-12 16:15:00'),
(12, 4, 2, 'Dây đeo điện thoại hạt cườm ngôi sao', 'Dây treo điện thoại đính hạt cườm ngôi sao dạ quang phát sáng nhẹ ban đêm.', 85000.00, 100000.00, 35, 'Xanh pastel', 'assets/img/products/phoneStrap_02.jpg', 'ACTIVE', 0, '2026-10-13 17:00:00'),
(13, 2, 1, 'Vòng tay chỉ đỏ may mắn charm tỳ hưu', 'Vòng chỉ đỏ may mắn tết thủ công cầu bình an tài lộc, đính tỳ hưu bạc.', 99000.00, 120000.00, 40, 'Đỏ ruby', 'assets/img/products/bracelet_03.jpg', 'ACTIVE', 1, '2026-10-14 09:20:00'),
(14, 2, 3, 'Dây chuyền bạc 925 cỏ 4 lá may mắn', 'Dây chuyền sợi mảnh thanh lịch, mặt cỏ bốn lá xoay tròn đính đá zircon lấp lánh.', 550000.00, 620000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_04.jpg', 'ACTIVE', 1, '2026-10-15 10:45:00'),
(15, 2, 1, 'Lắc chân vintage đính chuông gió', 'Lắc chân bạc phong cách mộc mạc nhẹ nhàng, tôn dáng cổ chân thon thả.', 160000.00, 190000.00, 19, 'Bạc mờ', 'assets/img/products/anket_03.jpg', 'ACTIVE', 0, '2026-10-16 11:10:00'),
(16, 2, 1, 'Vòng tay ngọc trai nước ngọt baroque', 'Vòng tay chuỗi ngọc trai nuôi nước ngọt dáng baroque tự nhiên độc bản, khóa bạc 925.', 320000.00, 380000.00, 11, 'Trắng ngọc', 'assets/img/products/bracelet_04.jpg', 'ACTIVE', 1, '2026-10-17 14:00:00');
