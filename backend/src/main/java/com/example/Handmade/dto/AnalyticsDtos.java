package com.example.Handmade.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueChartResponse {
        private List<String> labels;
        private List<BigDecimal> gmvData;
        private List<BigDecimal> platformFeeData;
        private BigDecimal totalGmv;
        private BigDecimal totalFee;
        private String startDate;
        private String endDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryChartResponse {
        private List<String> labels;
        private List<BigDecimal> data;
        private List<String> colors;
        private BigDecimal totalAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyticsSummaryResponse {
        private BigDecimal totalGmv;
        private BigDecimal totalFee;
        private BigDecimal paidToArtisans;
        private Long totalOrders;
        private Long completedOrders;
        private Long totalUsers;
    }
}

