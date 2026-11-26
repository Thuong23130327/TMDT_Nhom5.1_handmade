package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;

import java.util.List;

/**
 * FR-21: Dịch vụ khai phá luật kết hợp bằng thuật toán Apriori lai (Hybrid Apriori).
 * Học từ: Lịch sử đơn hàng đã thanh toán (PAID) + Giỏ hàng đã bỏ quên (ABANDONED).
 */
public interface AprioriMiningService {

    /**
     * Chạy thuật toán Apriori và lưu kết quả vào DB (association_rules).
     * Được gọi bởi Scheduled Job hoặc Admin API.
     */
    void runMiningAndSaveRules();

    /**
     * Lấy danh sách sản phẩm gợi ý mua kèm cho một sản phẩm cụ thể.
     * @param productId ID sản phẩm đang xem
     * @param limit     Số lượng gợi ý tối đa
     * @return Danh sách ProductDto.RecommendationItem
     */
    List<ProductDto.RecommendationItem> getRecommendationsForProduct(Long productId, int limit);

    /**
     * Lấy danh sách gợi ý hoàn thiện giỏ hàng (loại trừ sản phẩm đã có trong giỏ).
     * @param cartProductIds Danh sách product_id đang có trong giỏ
     * @param limit          Số lượng gợi ý tối đa
     * @return Danh sách ProductDto.RecommendationItem
     */
    List<ProductDto.RecommendationItem> getRecommendationsForCart(List<Long> cartProductIds, int limit);

    /**
     * Lấy giải thích chi tiết về một luật kết hợp cụ thể.
     * @param antecedentId ID sản phẩm tiền đề
     * @param consequentId ID sản phẩm hệ quả
     * @return Chuỗi giải thích hoặc null nếu không có luật
     */
    String getExplanation(Long antecedentId, Long consequentId);
}
