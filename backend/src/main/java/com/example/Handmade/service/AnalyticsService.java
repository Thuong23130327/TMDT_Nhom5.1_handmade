package com.example.Handmade.service;

import com.example.Handmade.dto.AnalyticsDtos.CategoryChartResponse;
import com.example.Handmade.dto.AnalyticsDtos.RevenueChartResponse;
import com.example.Handmade.model.Order;
import com.example.Handmade.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private static final BigDecimal FEE_RATE = new BigDecimal("0.10"); // Phí sàn 10%

    // ==========================================
    // 1. XỬ LÝ BIỂU ĐỒ CỘT DOANH THU THEO NGÀY
    // ==========================================
    @Transactional(readOnly = true)
    public RevenueChartResponse getRevenueBarChart(LocalDate startDate, LocalDate endDate) {
        // Mặc định lấy 14 ngày gần nhất nếu không chọn ngày
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.minusDays(14);

        // 1.1 Khởi tạo sẵn khung ngày (LinkedHashMap giữ đúng thứ tự từ ngày cũ đến mới)
        Map<String, BigDecimal> gmvMap = new LinkedHashMap<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("dd/MM");
        LocalDate current = start;
        while (!current.isAfter(end)) {
            gmvMap.put(current.format(dayFormatter), BigDecimal.ZERO);
            current = current.plusDays(1);
        }

        // 1.2 Lấy đơn hàng từ DB trong khoảng ngày (từ 00:00:00 của start đến 23:59:59 của end)
        List<Order> orders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(
                start.atStartOfDay(), end.atTime(23, 59, 59));

        // Cộng dồn tiền vào ngày tương ứng
        for (Order o : orders) {
            if (o.getCreatedAt() != null && o.getTotalAmount() != null) {
                String key = o.getCreatedAt().format(dayFormatter);
                if (gmvMap.containsKey(key)) {
                    gmvMap.put(key, gmvMap.get(key).add(o.getTotalAmount()));
                }
            }
        }

        // 1.3 Tách dữ liệu thành 2 danh sách riêng biệt: labels và data
        List<String> labels = new ArrayList<>(gmvMap.keySet());
        List<BigDecimal> gmvData = new ArrayList<>();
        List<BigDecimal> feeData = new ArrayList<>();
        BigDecimal totalGmv = BigDecimal.ZERO;

        for (String label : labels) {
            BigDecimal gmv = gmvMap.get(label);
            BigDecimal fee = gmv.multiply(FEE_RATE).setScale(0, RoundingMode.HALF_UP);
            gmvData.add(gmv);
            feeData.add(fee);
            totalGmv = totalGmv.add(gmv);
        }

        BigDecimal totalFee = totalGmv.multiply(FEE_RATE).setScale(0, RoundingMode.HALF_UP);

        // Đóng gói DTO trả về
        return RevenueChartResponse.builder()
                .labels(labels)
                .gmvData(gmvData)
                .platformFeeData(feeData)
                .totalGmv(totalGmv)
                .totalFee(totalFee)
                .startDate(start.toString())
                .endDate(end.toString())
                .build();
    }

    // ==========================================
    // 2. XỬ LÝ BIỂU ĐỒ TRÒN TỶ TRỌNG DANH MỤC
    // ==========================================
    @Transactional(readOnly = true)
    public CategoryChartResponse getCategoryPieChart() {
        // Lấy kết quả GROUP BY từ Repository
        List<Object[]> rawList = orderRepository.getRevenueByCategory();
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (rawList != null) {
            for (Object[] row : rawList) {
                String catName = row[0] != null ? row[0].toString() : "Khác";
                BigDecimal amount = new BigDecimal(row[1].toString());

                labels.add(catName);
                data.add(amount);
                totalAmount = totalAmount.add(amount);
            }
        }

        // Bảng màu cho từng miếng bánh
        List<String> colors = Arrays.asList("#425B9A", "#D4AF37", "#2ECC71", "#E74C3C", "#9B59B6", "#1ABC9C");

        return CategoryChartResponse.builder()
                .labels(labels)
                .data(data)
                .colors(colors)
                .totalAmount(totalAmount)
                .build();
    }
}