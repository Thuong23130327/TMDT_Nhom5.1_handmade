package com.example.Handmade.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDto {

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
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

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecommendationResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private String thumbnailUrl;
        private String color;
        private String artisanName;
        private double similarityScore; // 0.0 -> 1.0
        private int matchPercent;       // e.g. 96 (%)
        private List<String> matchReasons; // e.g. ["Cùng danh mục", "Từ khóa tương đồng"]
        private String explanation;
    }

    // ===================================================
    // FR-21: Apriori Recommendation Item
    // ===================================================
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecommendationItem {
        private Long id;
        private String name;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private String thumbnailUrl;
        private String artisanName;
        private Integer stockQuantity;
        private Double confidenceValue;
        private Double liftValue;
        private Double supportValue;
        private String explanation;
    }
}
