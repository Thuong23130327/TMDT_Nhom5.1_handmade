package com.example.Handmade.service;

import com.example.Handmade.config.CurrentUserResolver;
import com.example.Handmade.dto.OrderDto;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.*;
import com.example.Handmade.repository.CartItemRepository;
import com.example.Handmade.repository.OrderRepository;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    @Transactional
    public OrderDto.OrderResponse createOrder(OrderDto.CreateOrderRequest request) {
        User user = currentUserResolver.getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findAllByUser_Id(user.getId());
        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // Tính tổng và kiểm tra stock
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product == null || product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            if (item.getQuantity() > product.getStockQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Tạo order code
        String orderCode = "AC-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + "-" + (100 + (int)(Math.random() * 900));

        // Tạo Order entity
        Order order = Order.builder()
                .orderCode(orderCode)
                .buyer(user)
                .totalAmount(total)
                .recipientName(request.getRecipientName().trim())
                .recipientPhone(request.getRecipientPhone().trim())
                .shippingAddress(request.getShippingAddress().trim())
                .paymentMethod(parsePaymentMethod(request.getPaymentMethod()))
                .paymentStatus(Order.PaymentStatus.UNPAID)
                .status(Order.OrderStatus.PENDING)
                .build();

        // Tạo OrderItems và trừ stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .customNotes(cartItem.getCustomNotes())
                    .build();
            order.getItems().add(orderItem);
            // Trừ stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        Order saved = orderRepository.save(order);
        // Xóa giỏ hàng sau khi đặt
        cartItemRepository.deleteAllByUser_Id(user.getId());

        return toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto.OrderResponse> getMyOrders() {
        User user = currentUserResolver.getCurrentUser();
        return orderRepository.findAllByBuyer_IdWithItems(user.getId())
                .stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByCode(String orderCode) {
        User user = currentUserResolver.getCurrentUser();
        Order order = orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }
        return toOrderResponse(order);
    }

    private Order.PaymentMethod parsePaymentMethod(String method) {
        try {
            return Order.PaymentMethod.valueOf(method.toUpperCase());
        } catch (Exception e) {
            return Order.PaymentMethod.COD;
        }
    }

    private OrderDto.OrderResponse toOrderResponse(Order order) {
        List<OrderDto.OrderItemResponse> items = order.getItems().stream()
                .map(item -> {
                    Product p = item.getProduct();
                    return OrderDto.OrderItemResponse.builder()
                            .id(item.getId())
                            .productId(p != null ? p.getId() : null)
                            .productName(p != null ? p.getName() : "Sản phẩm không còn tồn tại")
                            .thumbnailUrl(p != null ? p.getThumbnailUrl() : null)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build();
                }).collect(Collectors.toList());

        return OrderDto.OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
