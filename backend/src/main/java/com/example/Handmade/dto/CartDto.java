package com.example.Handmade.dto;

import lombok.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Getter @Setter
    public static class AddItemRequest {
        @NotNull(message = "productId không được để trống")
        private Long productId;
        @Min(value = 1, message = "Số lượng phải >= 1")
        private int quantity = 1;
        private String customNotes;
    }

    @Getter @Setter
    public static class UpdateItemRequest {
        @Min(value = 1, message = "Số lượng phải >= 1")
        private int quantity;
    }

    @Getter @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String thumbnailUrl;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private String customNotes;
        private String artisanName;
    }

    @Getter @Builder
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal total;
        private int itemCount;
    }
}
