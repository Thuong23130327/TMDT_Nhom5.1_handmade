package com.example.Handmade.controller;

import com.example.Handmade.dto.AnalyticsDtos.AnalyticsSummaryResponse;
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

    // 1. Thống kê biểu đồ cột theo tuỳ chọn thời gian
    @GetMapping("/revenue-chart")
    public ApiResponse<RevenueChartResponse> getRevenueBarChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ApiResponse.ok(analyticsService.getRevenueBarChart(startDate, endDate));
    }

    // 2. Thống kê biểu đồ tròn tỷ trọng danh mục
    @GetMapping("/category-chart")
    public ApiResponse<CategoryChartResponse> getCategoryPieChart() {
        return ApiResponse.ok(analyticsService.getCategoryPieChart());
    }

    // 3. Số liệu tổng quan GMV & đơn hàng
    @GetMapping("/summary")
    public ApiResponse<AnalyticsSummaryResponse> getSummary() {
        return ApiResponse.ok(analyticsService.getSummary());
    }
}

