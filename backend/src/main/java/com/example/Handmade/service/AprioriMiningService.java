package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.model.Product;

import java.util.List;

/**
 * FR-21: Dịch vụ khai phá luật kết hợp bằng thuật toán Apriori lai (Hybrid Apriori)
 * & Combo thường mua cùng nhau (Frequently Bought Together).
 */
public interface AprioriMiningService {

    void runMiningAndSaveRules();

    List<ProductDto.RecommendationItem> getRecommendationsForProduct(Long productId, int limit);

    List<ProductDto.RecommendationItem> getRecommendationsForCart(List<Long> cartProductIds, int limit);

    String getExplanation(Long antecedentId, Long consequentId);

    ProductDto.FrequentlyBoughtTogetherResponse mineFrequentlyBoughtTogether(
            Product target, ProductDto.ProductResponse targetDto);
}