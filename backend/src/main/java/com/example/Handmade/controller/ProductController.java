package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<List<ProductDto.ProductResponse>> getAll() {
        return ApiResponse.ok("Lấy danh sách sản phẩm thành công", productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDto.ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok("Lấy thông tin sản phẩm thành công", productService.getProductById(id));
    }
}
