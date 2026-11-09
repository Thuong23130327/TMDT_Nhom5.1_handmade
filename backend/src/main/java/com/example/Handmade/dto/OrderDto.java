package com.example.Handmade.dto;

import lombok.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Getter @Setter
    public static class CreateOrderRequest {
        @NotBlank(message = "Họ tên người nhận không được để trống")
        private String recipientName;

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(0[3|5|7|8|9])[0-9]{8}$", message = "Số điện thoại không hợp lệ")
        private String recipientPhone;

        @NotBlank(message = "Địa chỉ giao hàng không được để trống")
        private String shippingAddress;

        private String paymentMethod = "COD"; // COD hoặc VNPAY
        private String orderNote;
    }

    @Getter @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String thumbnailUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Getter @Builder
    public static class OrderResponse {
        private Long id;
        private String orderCode;
        private BigDecimal totalAmount;
        private String recipientName;
        private String recipientPhone;
        private String shippingAddress;
        private String paymentMethod;
        private String paymentStatus;
        private String status;
        private LocalDateTime createdAt;
        private List<OrderItemResponse> items;
    }
}
