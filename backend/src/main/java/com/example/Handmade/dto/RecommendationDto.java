package com.example.Handmade.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO bổ sung cho tính năng AI Recommendation (FR-21).
 * Giữ ProductDto.java hiện có nguyên vẹn — chỉ thêm inner class mới.
 */
public class RecommendationDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ComplementaryRequest {
        private List<Long> productIds;
        private Integer limit;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RuleExplanationResponse {
        private Long antecedentProductId;
        private String antecedentProductName;
        private Long consequentProductId;
        private String consequentProductName;
        private Double support;
        private Double confidence;
        private Double lift;
        private String explanation;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MiningStatusResponse {
        private String status;
        private String message;
        private Integer totalRules;
        private String lastRunAt;
    }
}
