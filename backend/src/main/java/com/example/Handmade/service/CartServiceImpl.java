package com.example.Handmade.service;

import com.example.Handmade.config.CurrentUserResolver;
import com.example.Handmade.dto.CartDto;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.CartItem;
import com.example.Handmade.model.Product;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.CartItemRepository;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserResolver currentUserResolver;

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
        return toItemResponse(cartItemRepository.save(item));
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
        return toItemResponse(cartItemRepository.save(item));
    }

    @Override
    @Transactional
    public void removeItem(Long cartItemId) {
        User user = currentUserResolver.getCurrentUser();
        CartItem item = cartItemRepository.findByIdAndUser_Id(cartItemId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart() {
        User user = currentUserResolver.getCurrentUser();
        cartItemRepository.deleteAllByUser_Id(user.getId());
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
