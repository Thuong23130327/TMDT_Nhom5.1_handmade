package com.example.Handmade.service;

import com.example.Handmade.config.CurrentUserResolver;
import com.example.Handmade.dto.CartDto;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.*;
import com.example.Handmade.repository.CartItemRepository;
import com.example.Handmade.repository.CartSessionItemRepository;
import com.example.Handmade.repository.CartSessionRepository;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserResolver currentUserResolver;
    private final CartSessionRepository cartSessionRepository;
    private final CartSessionItemRepository cartSessionItemRepository;

    @Override
    @Transactional(readOnly = true)
    public CartDto.CartResponse getCart() {
        User user = currentUserResolver.getCurrentUser();
        List<CartItem> items = cartItemRepository.findAllByUser_Id(user.getId());
        List<CartDto.CartItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse).collect(Collectors.toList());
        BigDecimal total = itemResponses.stream()
                .map(CartDto.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CartDto.CartResponse.builder()
                .items(itemResponses)
                .total(total)
                .itemCount(itemResponses.size())
                .build();
    }

    @Override
    @Transactional
    public CartDto.CartItemResponse addItem(CartDto.AddItemRequest request) {
        User user = currentUserResolver.getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if (product.getStatus() != Product.ProductStatus.ACTIVE) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        // Nếu đã có trong giỏ thì cộng thêm số lượng
        Optional<CartItem> existing = cartItemRepository.findByUser_IdAndProduct_Id(user.getId(), product.getId());
        CartItem item;
        if (existing.isPresent()) {
            item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > product.getStockQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            item.setQuantity(newQty);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            item = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .customNotes(request.getCustomNotes())
                    .build();
        }
        CartItem saved = cartItemRepository.save(item);
        // Sync tới cart_sessions để thu thập dữ liệu cho Apriori
        syncCartSession(user);
        return toItemResponse(saved);
    }

    @Override
    @Transactional
    public CartDto.CartItemResponse updateItem(Long cartItemId, CartDto.UpdateItemRequest request) {
        User user = currentUserResolver.getCurrentUser();
        CartItem item = cartItemRepository.findByIdAndUser_Id(cartItemId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        if (request.getQuantity() > item.getProduct().getStockQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }
        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        syncCartSession(user);
        return toItemResponse(item);
    }

    @Override
    @Transactional
    public void removeItem(Long cartItemId) {
        User user = currentUserResolver.getCurrentUser();
        CartItem item = cartItemRepository.findByIdAndUser_Id(cartItemId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        cartItemRepository.delete(item);
        syncCartSession(user);
    }

    @Override
    @Transactional
    public void clearCart() {
        User user = currentUserResolver.getCurrentUser();
        cartItemRepository.deleteAllByUser_Id(user.getId());
        // Không xóa cart_session ở đây — OrderService sẽ mark CONVERTED_TO_ORDER
    }

    // =====================================================
    // CART SESSION SYNC — Thu thập dữ liệu cho Apriori
    // =====================================================
    public void syncCartSession(User user) {
        try {
            // Lấy giỏ hàng hiện tại
            List<CartItem> currentItems = cartItemRepository.findAllByUser_Id(user.getId());

            // Tìm hoặc tạo CartSession ACTIVE
            CartSession session = cartSessionRepository
                    .findByUser_IdAndStatus(user.getId(), CartSession.CartSessionStatus.ACTIVE)
                    .orElseGet(() -> {
                        CartSession newSession = CartSession.builder()
                                .user(user)
                                .status(CartSession.CartSessionStatus.ACTIVE)
                                .lastActivityAt(LocalDateTime.now())
                                .build();
                        return cartSessionRepository.save(newSession);
                    });

            // Cập nhật lastActivityAt
            session.setLastActivityAt(LocalDateTime.now());

            // Xóa toàn bộ items cũ và ghi lại từ cart_items hiện tại
            cartSessionItemRepository.deleteAllByCartSession_Id(session.getId());
            session.getItems().clear();

            for (CartItem cartItem : currentItems) {
                CartSessionItem si = CartSessionItem.builder()
                        .cartSession(session)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .build();
                session.getItems().add(si);
            }

            cartSessionRepository.save(session);
        } catch (Exception e) {
            // Không được để lỗi sync làm hỏng thao tác giỏ hàng chính
            log.warn("CartSession sync failed for user {}: {}", user.getId(), e.getMessage());
        }
    }

    // =====================================================
    // Đánh dấu CartSession đã được chuyển thành đơn hàng
    // =====================================================
    public void markSessionConverted(Long userId, Long orderId) {
        try {
            cartSessionRepository.findByUser_IdAndStatus(userId, CartSession.CartSessionStatus.ACTIVE)
                    .ifPresent(session -> {
                        session.setStatus(CartSession.CartSessionStatus.CONVERTED_TO_ORDER);
                        session.setOrderId(orderId);
                        cartSessionRepository.save(session);
                    });
        } catch (Exception e) {
            log.warn("CartSession mark-converted failed for user {}: {}", userId, e.getMessage());
        }
    }

    private CartDto.CartItemResponse toItemResponse(CartItem item) {
        Product p = item.getProduct();
        BigDecimal price = p != null ? p.getPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartDto.CartItemResponse.builder()
                .id(item.getId())
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : "Sản phẩm không xác định")
                .thumbnailUrl(p != null ? p.getThumbnailUrl() : null)
                .unitPrice(price)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .customNotes(item.getCustomNotes())
                .artisanName(p != null && p.getArtisan() != null ? p.getArtisan().getFullName() : null)
                .build();
    }
}
