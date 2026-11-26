package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.CartDto;
import com.example.Handmade.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartDto.CartResponse> getCart() {
        return ApiResponse.ok("Lấy giỏ hàng thành công", cartService.getCart());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CartDto.CartItemResponse> addItem(@Valid @RequestBody CartDto.AddItemRequest request) {
        return ApiResponse.ok("Thêm vào giỏ hàng thành công", cartService.addItem(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<CartDto.CartItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody CartDto.UpdateItemRequest request) {
        return ApiResponse.ok("Cập nhật giỏ hàng thành công", cartService.updateItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ApiResponse.ok("Xóa sản phẩm khỏi giỏ hàng thành công", null);
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart() {
        cartService.clearCart();
        return ApiResponse.ok("Đã xóa toàn bộ giỏ hàng", null);
    }
}
