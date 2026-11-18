package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    List<ProductDto.ProductResponse> getAllActiveProducts();
    List<ProductDto.ProductResponse> filterProducts(
            Long categoryId, String categorySlug,
            Long artisanId, String artisanName,
            BigDecimal minPrice, BigDecimal maxPrice,
            String search, String sort);
    ProductDto.ProductResponse getProductById(Long id);
    List<ProductDto.RecommendationResponse> getSimilarProductsCosine(Long productId, int limit);
    ProductDto.FrequentlyBoughtTogetherResponse getFrequentlyBoughtTogether(Long productId);
    List<ProductDto.ShopSummaryResponse> getShops(String search);
    ProductDto.ShopSummaryResponse getShopDetail(String shopIdentifier);
}
