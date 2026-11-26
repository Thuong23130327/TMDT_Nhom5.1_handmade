package com.example.Handmade.controller;

import com.example.Handmade.config.CurrentUserResolver;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.dto.RecommendationDto;
import com.example.Handmade.model.CartItem;
import com.example.Handmade.repository.CartItemRepository;
import com.example.Handmade.service.AprioriMiningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * FR-21: REST API cho tính năng gợi ý sản phẩm mua kèm.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final AprioriMiningService aprioriMiningService;
    private final CurrentUserResolver currentUserResolver;
    private final CartItemRepository cartItemRepository;

    /**
     * GET /api/v1/recommendations/complementary/{productId}?limit=4
     * Gợi ý sản phẩm mua kèm cho trang product-detail.
     * Không yêu cầu đăng nhập (permitAll).
     */
    @GetMapping("/complementary/{productId}")
    public ResponseEntity<ApiResponse<List<ProductDto.RecommendationItem>>> getComplementary(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit) {

        List<ProductDto.RecommendationItem> result =
                aprioriMiningService.getRecommendationsForProduct(productId, Math.min(limit, 8));
        return ResponseEntity.ok(ApiResponse.ok("Gợi ý sản phẩm mua kèm", result));
    }

    /**
     * GET /api/v1/recommendations/cart?limit=4
     * Gợi ý hoàn thiện giỏ hàng. Yêu cầu đăng nhập.
     */
    @GetMapping("/cart")
    public ResponseEntity<ApiResponse<List<ProductDto.RecommendationItem>>> getCartRecommendations(
            @RequestParam(defaultValue = "4") int limit) {

        // Lấy danh sách product_id trong giỏ hàng hiện tại
        Long userId = currentUserResolver.getCurrentUser().getId();
        List<Long> cartProductIds = cartItemRepository.findAllByUser_Id(userId)
                .stream()
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toList());

        List<ProductDto.RecommendationItem> result =
                aprioriMiningService.getRecommendationsForCart(cartProductIds, Math.min(limit, 8));
        return ResponseEntity.ok(ApiResponse.ok("Gợi ý hoàn thiện giỏ hàng", result));
    }

    /**
     * GET /api/v1/recommendations/explanation?antecedentId=1&consequentId=7
     * Giải thích lý do gợi ý. Dùng bởi AI chatbot.
     */
    @GetMapping("/explanation")
    public ResponseEntity<ApiResponse<RecommendationDto.RuleExplanationResponse>> getExplanation(
            @RequestParam Long antecedentId,
            @RequestParam Long consequentId) {

        String explanation = aprioriMiningService.getExplanation(antecedentId, consequentId);
        RecommendationDto.RuleExplanationResponse response = RecommendationDto.RuleExplanationResponse.builder()
                .antecedentProductId(antecedentId)
                .consequentProductId(consequentId)
                .explanation(explanation != null ? explanation : "Chưa có dữ liệu luật kết hợp giữa hai sản phẩm này.")
                .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
