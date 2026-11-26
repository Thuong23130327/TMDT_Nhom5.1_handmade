package com.example.Handmade.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminProductDtos {

    // 1. DTO hiển thị danh sách sản phẩm cho Admin xem
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminProductItemResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer stockQuantity;
        private String thumbnailUrl;
        private String status;           // "ACTIVE" hoặc "HIDDEN"
        private String artisanName;      // Tên thợ / Shop bán sản phẩm này
        private String artisanEmail;     // Email thợ để Admin liên hệ nhắc nhở
        private LocalDateTime createdAt;
    }

    // 2. DTO nhận yêu cầu cập nhật trạng thái từ Admin (Đổi thành ACTIVE hoặc HIDDEN)
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProductStatusRequest {
        private String status; // Giá trị gửi lên: "ACTIVE" hoặc "HIDDEN"
    }
}