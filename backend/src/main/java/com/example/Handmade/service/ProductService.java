package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto.ProductResponse> getAllActiveProducts();
    ProductDto.ProductResponse getProductById(Long id);
    List<ProductDto.RecommendationResponse> getSimilarProductsCosine(Long productId, int limit);
}
