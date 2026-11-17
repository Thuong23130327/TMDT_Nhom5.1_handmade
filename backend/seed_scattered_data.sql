USE auracraft_db;

-- 1. Thêm các sản phẩm phong phú nếu chưa có
INSERT IGNORE INTO products (id, artisan_id, category_id, name, description, price, old_price, stock_quantity, color, thumbnail_url, status, is_customizable, created_at)
VALUES 
(3, 2, 3, 'Dây chuyền mặt trăng thạch anh', 'Mặt trăng khuyết bạc Ý đính đá thạch anh tự nhiên thanh khiết.', 350000.00, 390000.00, 15, 'Bạc sáng', 'assets/img/products/necklace_02.jpg', 'ACTIVE', 1, '2026-10-05 10:00:00'),
(4, 2, 1, 'Lắc chân chuông bạc handmade mạ vàng', 'Lắc chân vintage đính chuông bạc phong thủy kêu leng keng vui tai.', 220000.00, 260000.00, 20, 'Vàng kim', 'assets/img/products/anket_01.jpg', 'ACTIVE', 1, '2026-10-06 11:30:00'),
(5, 4, 1, 'Armlet Bohemian Vintage bắp tay', 'Vòng đeo bắp tay phong cách Bohemian cá tính, chế tác từ đồng cổ uốn lượn sắc sảo.', 180000.00, 210000.00, 18, 'Đồng cổ', 'assets/img/products/armlet_01.jpg', 'ACTIVE', 0, '2026-10-07 09:15:00'),
(6, 2, 1, 'Vòng bụng hạt cườm đi biển Beachy', 'Vòng bụng hạt cườm sắc màu rực rỡ, thích hợp cho các chuyến du lịch biển mùa hè.', 130000.00, 160000.00, 30, 'Pastel', 'assets/img/products/belly_01.jpg', 'ACTIVE', 1, '2026-10-08 14:20:00'),
(7, 4, 1, 'Dây đeo điện thoại handmade pastel', 'Dây strap treo điện thoại đính hạt cườm hoa cúc và trái tim pastel siêu dễ thương.', 90000.00, 110000.00, 50, 'Hồng kem', 'assets/img/products/phoneStrap_01.jpg', 'ACTIVE', 1, '2026-10-09 16:45:00'),
(8, 2, 3, 'Dây chuyền đá quý thạch anh khói', 'Dây chuyền bạc 925 đính đá quý thạch anh khói chế tác đa giác cắt lấp lánh.', 450000.00, 500000.00, 10, 'Nâu khói', 'assets/img/products/necklace_03.jpg', 'ACTIVE', 1, '2026-10-10 13:10:00');

-- 2. Cập nhật ngày tháng các đơn hàng test ban đầu cho rải rác
UPDATE orders SET created_at = '2026-10-23 09:30:00', total_amount = 430000.00 WHERE id = 1;
UPDATE orders SET created_at = '2026-10-22 14:15:00', total_amount = 750000.00 WHERE id = 2;
UPDATE orders SET created_at = '2026-10-20 16:20:00', total_amount = 540000.00 WHERE id = 3;
UPDATE orders SET created_at = '2026-10-18 10:05:00', total_amount = 920000.00 WHERE id = 4;

-- 3. Bổ sung các đơn hàng trải đều các ngày từ 10/10 đến 23/10 để biểu đồ cột đẹp mắt và phong phú
INSERT IGNORE INTO orders (id, order_code, buyer_id, total_amount, recipient_name, recipient_phone, shipping_address, payment_method, payment_status, status, created_at)
VALUES
(10, 'ORD-20261010-01', 5, 890000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'COMPLETED', '2026-10-10 10:20:00'),
(11, 'ORD-20261011-01', 3, 620000.00, 'Nguyễn Thảo', '0912345678', '12 Nguyễn Trãi, Quận 5, TP.HCM', 'BANKING', 'PAID', 'COMPLETED', '2026-10-11 11:45:00'),
(12, 'ORD-20261013-01', 5, 350000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'COD', 'PAID', 'COMPLETED', '2026-10-13 15:30:00'),
(13, 'ORD-20261014-01', 3, 580000.00, 'Trần Minh', '0933221144', '88 Cầu Giấy, Hà Nội', 'BANKING', 'PAID', 'COMPLETED', '2026-10-14 09:10:00'),
(14, 'ORD-20261015-01', 5, 960000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'COMPLETED', '2026-10-15 14:00:00'),
(15, 'ORD-20261016-01', 3, 420000.00, 'Lê Hương', '0977665544', '24 Lý Tự Trọng, Quận 1, TP.HCM', 'COD', 'PAID', 'COMPLETED', '2026-10-16 16:50:00'),
(16, 'ORD-20261017-01', 5, 1320000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'COMPLETED', '2026-10-17 11:15:00'),
(17, 'ORD-20261019-01', 3, 880000.00, 'Phạm Duy', '0909090909', '50 Hùng Vương, Đà Nẵng', 'BANKING', 'PAID', 'COMPLETED', '2026-10-19 13:40:00'),
(18, 'ORD-20261021-01', 5, 1150000.00, 'Hoàng Khang', '0987654321', 'Số 45, Đường 3/2, Quận 10, TP.HCM', 'BANKING', 'PAID', 'SHIPPING', '2026-10-21 10:05:00');

-- 4. Bổ sung chi tiết đơn hàng cho các đơn vừa thêm
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, custom_notes)
VALUES
(10, 10, 1, 2, 380000.00, 'Khắc chữ kỷ niệm Khang & Lan'),
(11, 11, 2, 1, 220000.00, 'Thêu tên bé Bông'),
(12, 12, 3, 1, 350000.00, 'Dây dài 45cm'),
(13, 13, 4, 2, 220000.00, 'Tặng kèm hộp quà vintage'),
(14, 14, 8, 2, 450000.00, 'Đá thạch anh tuyển chọn loại 1'),
(15, 15, 5, 2, 180000.00, 'Khắc hoa văn rồng cổ'),
(16, 16, 1, 3, 380000.00, 'Set quà tặng bạn thân 3 người'),
(17, 17, 3, 2, 350000.00, 'Đính đá tự nhiên'),
(18, 18, 4, 3, 220000.00, 'Chuông bạc phong thủy');
