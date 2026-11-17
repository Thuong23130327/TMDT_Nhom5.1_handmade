package com.example.Handmade.service;

import com.example.Handmade.dto.AnalyticsDtos.AnalyticsSummaryResponse;
import com.example.Handmade.dto.AnalyticsDtos.CategoryChartResponse;
import com.example.Handmade.dto.AnalyticsDtos.RevenueChartResponse;

import java.time.LocalDate;

public interface AnalyticsService {
    RevenueChartResponse getRevenueBarChart(LocalDate startDate, LocalDate endDate);
    CategoryChartResponse getCategoryPieChart();
    AnalyticsSummaryResponse getSummary();
}

