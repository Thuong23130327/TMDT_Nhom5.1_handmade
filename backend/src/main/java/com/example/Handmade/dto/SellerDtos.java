package com.example.Handmade.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SellerDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SellerProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private String introduction;
        private String portfolioUrl;
        private String avatarUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateSellerProfileRequest {
        private String fullName;
        private String phone;
        private String introduction;
        private String portfolioUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SellerRevenueResponse {
        private BigDecimal completedRevenue;
        private BigDecimal totalRevenue;
        private Long completedOrdersCount;
        private Long totalOrdersCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SellerOrderItemResponse {
        private Long orderId;
        private String orderCode;
        private String recipientName;
        private String recipientPhone;
        private String shippingAddress;
        private String orderStatus;
        private String paymentStatus;
        private BigDecimal shopAmount;
        private LocalDateTime createdAt;
        private List<String> productNames;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class UpdateSellerOrderStatusRequest {
        private String status;
    }
}

