package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping({"/api/products", "/api/v1/products"})
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ApiResponse<List<ProductDto.ProductResponse>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long artisanId,
            @RequestParam(required = false) String artisan,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "default") String sort) {
        List<ProductDto.ProductResponse> results = productService.filterProducts(
                categoryId, category, artisanId, artisan, minPrice, maxPrice, search, sort);
        return ApiResponse.ok("Lấy danh sách sản phẩm thành công", results);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDto.ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok("Lấy thông tin chi tiết sản phẩm thành công", productService.getProductById(id));
    }

    @GetMapping("/{id}/similar-cosine")
    public ApiResponse<List<ProductDto.RecommendationResponse>> getSimilarProductsCosine(
            @PathVariable Long id,
            @RequestParam(value = "limit", defaultValue = "4") int limit) {
        return ApiResponse.ok("Gợi ý AI sản phẩm tương tự (Cosine Similarity)", 
                productService.getSimilarProductsCosine(id, limit));
    }

    @GetMapping("/{id}/frequently-bought-together")
    public ApiResponse<ProductDto.FrequentlyBoughtTogetherResponse> getFrequentlyBoughtTogether(
            @PathVariable Long id) {
        return ApiResponse.ok("Combo thường mua cùng nhau (Khai phá dữ liệu Apriori)", 
                productService.getFrequentlyBoughtTogether(id));
    }

    @GetMapping("/shops")
    public ApiResponse<List<ProductDto.ShopSummaryResponse>> getShops(
            @RequestParam(required = false) String search) {
        return ApiResponse.ok("Lấy danh sách gian hàng thành công", productService.getShops(search));
    }

    @GetMapping("/shops/{shopIdentifier}")
    public ApiResponse<ProductDto.ShopSummaryResponse> getShopDetail(
            @PathVariable String shopIdentifier) {
        return ApiResponse.ok("Lấy thông tin chi tiết gian hàng thành công", productService.getShopDetail(shopIdentifier));
    }
}
