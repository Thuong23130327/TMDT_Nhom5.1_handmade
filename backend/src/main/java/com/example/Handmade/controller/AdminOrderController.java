package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.OrderDto.OrderResponse;
import com.example.Handmade.model.Order;
import com.example.Handmade.repository.OrderRepository;
import com.example.Handmade.service.OrderService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class AdminOrderStatusStats {
        private long totalOrders;
        private long pendingOrders;
        private long craftingOrders;
        private long shippingOrders;
        private long completedOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue = BigDecimal.ZERO;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class UpdateOrderStatusRequest {
        private String status;
        private String note;
    }

    @GetMapping("/stats")
    public ApiResponse<AdminOrderStatusStats> getStats() {
        List<Order> allOrders = orderRepository.findAll();
        AdminOrderStatusStats stats = new AdminOrderStatusStats();
        stats.setTotalOrders(allOrders.size());

        BigDecimal revenue = BigDecimal.ZERO;

        for (Order o : allOrders) {
            String st = o.getStatus() != null ? o.getStatus().name() : "PENDING";
            if ("PENDING".equals(st)) {
                stats.setPendingOrders(stats.getPendingOrders() + 1);
            } else if ("CRAFTING".equals(st)) {
                stats.setCraftingOrders(stats.getCraftingOrders() + 1);
            } else if ("SHIPPING".equals(st)) {
                stats.setShippingOrders(stats.getShippingOrders() + 1);
            } else if ("COMPLETED".equals(st)) {
                stats.setCompletedOrders(stats.getCompletedOrders() + 1);
            } else if ("CANCELLED".equals(st)) {
                stats.setCancelledOrders(stats.getCancelledOrders() + 1);
            }

            if (!"CANCELLED".equals(st) && o.getTotalAmount() != null) {
                revenue = revenue.add(o.getTotalAmount());
            }
        }

        stats.setTotalRevenue(revenue);
        return ApiResponse.ok(stats);
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) String keyword) {

        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        String filterStatus = status != null ? status.trim().toUpperCase(Locale.ROOT) : "ALL";
        String kw = keyword != null ? keyword.trim().toLowerCase(Locale.ROOT) : null;

        List<OrderResponse> result = orders.stream()
                .filter(o -> {
                    if ("ALL".equals(filterStatus)) return true;
                    String st = o.getStatus() != null ? o.getStatus().name() : "PENDING";
                    if ("PENDING".equals(filterStatus)) return "PENDING".equals(st);
                    if ("CRAFTING".equals(filterStatus)) return "CRAFTING".equals(st);
                    if ("SHIPPING".equals(filterStatus)) return "SHIPPING".equals(st);
                    if ("COMPLETED".equals(filterStatus)) return "COMPLETED".equals(st);
                    if ("CANCELLED".equals(filterStatus)) return "CANCELLED".equals(st);
                    return st.equals(filterStatus);
                })
                .filter(o -> {
                    if (kw == null || kw.isEmpty()) return true;
                    boolean codeMatch = o.getOrderCode() != null && o.getOrderCode().toLowerCase(Locale.ROOT).contains(kw);
                    boolean nameMatch = o.getRecipientName() != null && o.getRecipientName().toLowerCase(Locale.ROOT).contains(kw);
                    boolean phoneMatch = o.getRecipientPhone() != null && o.getRecipientPhone().toLowerCase(Locale.ROOT).contains(kw);
                    return codeMatch || nameMatch || phoneMatch;
                })
                .map(o -> orderService.getOrderByCode(o.getOrderCode()))
                .collect(Collectors.toList());

        return ApiResponse.ok(result);
    }

    @PutMapping("/{orderCode}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable String orderCode,
            @RequestBody UpdateOrderStatusRequest request) {

        if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ApiResponse.error("Trạng thái mới không được để trống!");
        }

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng mã: " + orderCode));

        String newStatusStr = request.getStatus().trim().toUpperCase(Locale.ROOT);
        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(newStatusStr);
            order.setStatus(newStatus);

            if (newStatus == Order.OrderStatus.COMPLETED) {
                order.setPaymentStatus(Order.PaymentStatus.PAID);
            } else if (newStatus == Order.OrderStatus.CANCELLED && order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            }

            orderRepository.save(order);
            return ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công!", orderService.getOrderByCode(orderCode));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Trạng thái không hợp lệ: " + newStatusStr);
        }
    }
}

