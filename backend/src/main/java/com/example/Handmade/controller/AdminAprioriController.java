package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.RecommendationDto;
import com.example.Handmade.repository.AssociationRuleRepository;
import com.example.Handmade.service.AprioriMiningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Admin API cho tính năng Apriori (FR-21).
 * Chỉ dành cho ROLE_ADMIN.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/apriori")
@RequiredArgsConstructor
public class AdminAprioriController {

    private final AprioriMiningService aprioriMiningService;
    private final AssociationRuleRepository associationRuleRepository;

    /**
     * POST /api/v1/admin/apriori/refresh
     * Kích hoạt tính toán lại luật kết hợp ngay lập tức.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RecommendationDto.MiningStatusResponse>> triggerMining() {
        log.info("[AdminApriori] Admin kích hoạt khai phá luật kết hợp thủ công.");
        aprioriMiningService.runMiningAndSaveRules();
        long totalRules = associationRuleRepository.count();
        RecommendationDto.MiningStatusResponse response = RecommendationDto.MiningStatusResponse.builder()
                .status("SUCCESS")
                .message("Khai phá luật kết hợp hoàn tất thành công.")
                .totalRules((int) totalRules)
                .lastRunAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Khai phá hoàn tất", response));
    }

    /**
     * GET /api/v1/admin/apriori/status
     * Kiểm tra trạng thái hiện tại.
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<RecommendationDto.MiningStatusResponse>> getStatus() {
        long totalRules = associationRuleRepository.count();
        RecommendationDto.MiningStatusResponse response = RecommendationDto.MiningStatusResponse.builder()
                .status("OK")
                .message("Hệ thống đang hoạt động bình thường.")
                .totalRules((int) totalRules)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
