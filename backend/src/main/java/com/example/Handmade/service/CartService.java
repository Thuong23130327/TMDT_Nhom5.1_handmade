package com.example.Handmade.service;

import com.example.Handmade.dto.CartDto;

public interface CartService {
    CartDto.CartResponse getCart();
    CartDto.CartItemResponse addItem(CartDto.AddItemRequest request);
    CartDto.CartItemResponse updateItem(Long cartItemId, CartDto.UpdateItemRequest request);
    void removeItem(Long cartItemId);
    void clearCart();
}
