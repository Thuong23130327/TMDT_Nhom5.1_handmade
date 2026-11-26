package com.example.Handmade.service;

import com.example.Handmade.dto.SellerDtos.*;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.Order;
import com.example.Handmade.model.OrderItem;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.OrderRepository;
import com.example.Handmade.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public SellerProfileResponse getSellerProfile(Long artisanId) {
        User seller = userRepository.findById(artisanId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return mapToProfileResponse(seller);
    }

    @Transactional
    public SellerProfileResponse updateSellerProfile(Long artisanId, UpdateSellerProfileRequest req) {
        User seller = userRepository.findById(artisanId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (req.getFullName() != null && !req.getFullName().trim().isEmpty()) {
            seller.setFullName(req.getFullName().trim());
        }
        if (req.getPhone() != null) {
            seller.setPhone(req.getPhone().trim());
        }
        if (req.getIntroduction() != null) {
            seller.setIntroduction(req.getIntroduction().trim());
        }
        if (req.getPortfolioUrl() != null) {
            seller.setPortfolioUrl(req.getPortfolioUrl().trim());
        }

        User saved = userRepository.save(seller);
        return mapToProfileResponse(saved);
    }

    @Transactional(readOnly = true)
    public SellerRevenueResponse getSellerRevenue(Long artisanId) {
        BigDecimal completedRev = orderRepository.calculateCompletedRevenueByArtisanId(artisanId);
        BigDecimal totalRev = orderRepository.calculateTotalRevenueByArtisanId(artisanId);
        List<Order> orders = orderRepository.findOrdersByArtisanId(artisanId);

        long completedCount = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .count();

        long nonCancelledCount = orders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .count();

        return SellerRevenueResponse.builder()
                .completedRevenue(completedRev != null ? completedRev : BigDecimal.ZERO)
                .totalRevenue(totalRev != null ? totalRev : BigDecimal.ZERO)
                .completedOrdersCount(completedCount)
                .totalOrdersCount(nonCancelledCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SellerOrderItemResponse> getSellerOrders(Long artisanId, String status) {
        List<Order> orders = orderRepository.findOrdersByArtisanId(artisanId);

        return orders.stream()
                .filter(o -> {
                    if (status == null || "all".equalsIgnoreCase(status)) return true;
                    return o.getStatus() != null && o.getStatus().name().equalsIgnoreCase(status);
                })
                .map(o -> mapToSellerOrderResponse(o, artisanId))
                .collect(Collectors.toList());
    }

    @Transactional
    public SellerOrderItemResponse updateSellerOrderStatus(Long artisanId, Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        boolean belongsToArtisan = order.getItems() != null && order.getItems().stream()
                .anyMatch(item -> item.getProduct() != null
                        && item.getProduct().getArtisan() != null
                        && item.getProduct().getArtisan().getId().equals(artisanId));

        if (!belongsToArtisan) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        Order.OrderStatus statusEnum;
        try {
            statusEnum = Order.OrderStatus.valueOf(newStatus.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ! Chỉ chấp nhận: PENDING, CRAFTING, SHIPPING, COMPLETED, CANCELLED");
        }

        order.setStatus(statusEnum);
        Order saved = orderRepository.save(order);
        return mapToSellerOrderResponse(saved, artisanId);
    }

    private SellerProfileResponse mapToProfileResponse(User u) {
        return SellerProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .introduction(u.getIntroduction())
                .portfolioUrl(u.getPortfolioUrl())
                .avatarUrl(u.getAvatarUrl())
                .build();
    }

    private SellerOrderItemResponse mapToSellerOrderResponse(Order o, Long artisanId) {
        BigDecimal shopAmount = BigDecimal.ZERO;
        List<String> productNames = new ArrayList<>();

        if (o.getItems() != null) {
            for (OrderItem item : o.getItems()) {
                if (item.getProduct() != null && item.getProduct().getArtisan() != null
                        && item.getProduct().getArtisan().getId().equals(artisanId)) {
                    BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    shopAmount = shopAmount.add(lineTotal);
                    productNames.add(item.getProduct().getName() + " (x" + item.getQuantity() + ")");
                }
            }
        }

        return SellerOrderItemResponse.builder()
                .orderId(o.getId())
                .orderCode(o.getOrderCode())
                .recipientName(o.getRecipientName())
                .recipientPhone(o.getRecipientPhone())
                .shippingAddress(o.getShippingAddress())
                .orderStatus(o.getStatus() != null ? o.getStatus().name() : "PENDING")
                .paymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "UNPAID")
                .shopAmount(shopAmount)
                .createdAt(o.getCreatedAt())
                .productNames(productNames)
                .build();
    }
}

