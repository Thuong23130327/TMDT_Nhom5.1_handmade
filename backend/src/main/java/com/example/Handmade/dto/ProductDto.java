package com.example.Handmade.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {

    @Getter @Builder
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private Integer stockQuantity;
        private String color;
        private String thumbnailUrl;
        private Boolean isCustomizable;
        private String status;
        private Long artisanId;
        private String artisanName;
        private LocalDateTime createdAt;
    }
}
