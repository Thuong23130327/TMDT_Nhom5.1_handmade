package com.example.Handmade.controller;

import com.example.Handmade.dto.AnalyticsDtos.CategoryChartResponse;
import com.example.Handmade.dto.AnalyticsDtos.RevenueChartResponse;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    // 1. API BIỂU ĐỒ CỘT
    // URL: GET /api/v1/admin/analytics/revenue-chart?startDate=2026-11-01&endDate=2026-11-20
    @GetMapping("/revenue-chart")
    public ApiResponse<RevenueChartResponse> getRevenueBarChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Gọi Service tính toán và bọc vào ApiResponse.ok() để trả về code: 200
        return ApiResponse.ok(analyticsService.getRevenueBarChart(startDate, endDate));
    }

    // 2. API BIỂU ĐỒ TRÒN
    // URL: GET /api/v1/admin/analytics/category-chart
    @GetMapping("/category-chart")
    public ApiResponse<CategoryChartResponse> getCategoryPieChart() {
        return ApiResponse.ok(analyticsService.getCategoryPieChart());
    }
}