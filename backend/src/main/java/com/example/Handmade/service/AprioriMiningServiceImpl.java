package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.model.AssociationRule;
import com.example.Handmade.model.CartSession;
import com.example.Handmade.model.Order;
import com.example.Handmade.model.Product;
import com.example.Handmade.repository.AssociationRuleRepository;
import com.example.Handmade.repository.CartSessionRepository;
import com.example.Handmade.repository.OrderRepository;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * FR-21: Triển khai thuật toán Apriori lai (Hybrid Apriori).
 * Nguồn dữ liệu:
 *  1. Đơn hàng đã thanh toán (payment_status = PAID, status != CANCELLED)
 *  2. Phiên giỏ hàng đã bỏ quên (status = ABANDONED)
 *
 * Chỉ khai phá luật dạng 1→1 (A → B), lưu kết quả vào bảng association_rules.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AprioriMiningServiceImpl implements AprioriMiningService {

    private final OrderRepository orderRepository;
    private final CartSessionRepository cartSessionRepository;
    private final AssociationRuleRepository associationRuleRepository;
    private final ProductRepository productRepository;

    @Value("${auracraft.apriori.min-support:0.03}")
    private double minSupport;

    @Value("${auracraft.apriori.min-confidence:0.40}")
    private double minConfidence;

    @Value("${auracraft.apriori.min-lift:1.05}")
    private double minLift;

    // ===================================================
    // SCHEDULED JOB: chạy mỗi đêm lúc 02:00
    // ===================================================
    @Scheduled(cron = "${auracraft.apriori.cron:0 0 2 * * ?}")
    public void scheduledMining() {
        log.info("[Apriori] Bắt đầu chạy khai phá luật kết hợp theo lịch...");
        runMiningAndSaveRules();
    }

    // ===================================================
    // SCHEDULED JOB: đánh dấu giỏ hàng bỏ quên mỗi 1 giờ
    // ===================================================
    @Scheduled(fixedDelayString = "PT1H")
    @Transactional
    public void markAbandonedSessions() {
        try {
            int hours = 24;
            LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);
            List<CartSession> staleSessions = cartSessionRepository.findStaleActiveSessions(cutoff);
            for (CartSession session : staleSessions) {
                session.setStatus(CartSession.CartSessionStatus.ABANDONED);
            }
            if (!staleSessions.isEmpty()) {
                cartSessionRepository.saveAll(staleSessions);
                log.info("[Apriori] Đánh dấu {} phiên giỏ hàng bỏ quên.", staleSessions.size());
            }
        } catch (Exception e) {
            log.warn("[Apriori] markAbandonedSessions lỗi: {}", e.getMessage());
        }
    }

    // ===================================================
    // CORE: Chạy thuật toán Apriori và lưu kết quả
    // ===================================================
    @Override
    @Transactional
    public void runMiningAndSaveRules() {
        try {
            // === BƯỚC 1: Thu thập tập giao dịch D ===
            List<Set<Long>> transactions = collectTransactions();
            int N = transactions.size();
            log.info("[Apriori] Tổng số giao dịch hợp lệ: {}", N);

            if (N == 0) {
                log.warn("[Apriori] Không có dữ liệu giao dịch. Dừng thuật toán.");
                return;
            }

            // === BƯỚC 2: Tìm L1 — tập 1 mục phổ biến ===
            Map<Long, Integer> itemCount = new HashMap<>();
            for (Set<Long> tx : transactions) {
                for (Long pid : tx) {
                    itemCount.merge(pid, 1, Integer::sum);
                }
            }

            int minSupportCount = (int) Math.ceil(minSupport * N);
            Set<Long> frequentItems = new HashSet<>();
            for (Map.Entry<Long, Integer> entry : itemCount.entrySet()) {
                if (entry.getValue() >= minSupportCount) {
                    frequentItems.add(entry.getKey());
                }
            }
            log.info("[Apriori] L1 — Tập 1 mục phổ biến: {} items (min_support_count={})",
                    frequentItems.size(), minSupportCount);

            // === BƯỚC 3: Tìm L2 — tập 2 mục phổ biến ===
            List<Long> frequentList = new ArrayList<>(frequentItems);
            Map<String, Integer> pairCount = new HashMap<>();

            for (Set<Long> tx : transactions) {
                // Chỉ xét các sản phẩm thuộc L1 trong giao dịch này
                List<Long> validItems = tx.stream()
                        .filter(frequentItems::contains)
                        .sorted()
                        .collect(Collectors.toList());

                // Sinh các cặp từ validItems
                for (int i = 0; i < validItems.size(); i++) {
                    for (int j = i + 1; j < validItems.size(); j++) {
                        String key = validItems.get(i) + "_" + validItems.get(j);
                        pairCount.merge(key, 1, Integer::sum);
                    }
                }
            }

            // Lọc L2
            List<long[]> frequentPairs = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : pairCount.entrySet()) {
                if (entry.getValue() >= minSupportCount) {
                    String[] parts = entry.getKey().split("_");
                    frequentPairs.add(new long[]{
                            Long.parseLong(parts[0]),
                            Long.parseLong(parts[1]),
                            entry.getValue()
                    });
                }
            }
            log.info("[Apriori] L2 — Tập 2 mục phổ biến: {} cặp", frequentPairs.size());

            // === BƯỚC 4: Sinh luật kết hợp A→B và B→A ===
            List<AssociationRule> newRules = new ArrayList<>();
            // Tải sẵn thông tin sản phẩm để tạo explanation
            Map<Long, Product> productMap = loadProductMap(frequentItems);

            for (long[] pair : frequentPairs) {
                long itemA = pair[0];
                long itemB = pair[1];
                int pairSupport = (int) pair[2];

                double supportAB = (double) pairSupport / N;
                int countA = itemCount.getOrDefault(itemA, 0);
                int countB = itemCount.getOrDefault(itemB, 0);

                if (countA == 0 || countB == 0) continue;

                double supportA = (double) countA / N;
                double supportB = (double) countB / N;

                // Luật A → B
                double confidenceAB = supportAB / supportA;
                double liftAB = confidenceAB / supportB;
                if (confidenceAB >= minConfidence && liftAB >= minLift) {
                    AssociationRule rule = buildRule(itemA, itemB, supportAB, confidenceAB, liftAB, productMap);
                    newRules.add(rule);
                }

                // Luật B → A
                double confidenceBA = supportAB / supportB;
                double liftBA = confidenceBA / supportA;
                if (confidenceBA >= minConfidence && liftBA >= minLift) {
                    AssociationRule rule = buildRule(itemB, itemA, supportAB, confidenceBA, liftBA, productMap);
                    newRules.add(rule);
                }
            }

            log.info("[Apriori] Sinh được {} luật kết hợp hợp lệ.", newRules.size());

            // === BƯỚC 5: Lưu kết quả vào DB (xóa cũ, chèn mới) ===
            associationRuleRepository.deleteAll();
            associationRuleRepository.saveAll(newRules);

            log.info("[Apriori] ✅ Khai phá hoàn tất. Đã lưu {} luật vào DB lúc {}",
                    newRules.size(), LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        } catch (Exception e) {
            log.error("[Apriori] ❌ Lỗi khi chạy thuật toán: {}", e.getMessage(), e);
        }
    }

    // ===================================================
    // API: Gợi ý sản phẩm mua kèm cho product-detail
    // ===================================================
    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.RecommendationItem> getRecommendationsForProduct(Long productId, int limit) {
        List<AssociationRule> rules = associationRuleRepository
                .findByAntecedentProductIdOrderByScore(productId);

        return rules.stream()
                .limit(limit)
                .map(rule -> toRecommendationItem(rule))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    // ===================================================
    // API: Gợi ý hoàn thiện giỏ hàng (loại trừ sản phẩm đã có)
    // ===================================================
    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.RecommendationItem> getRecommendationsForCart(List<Long> cartProductIds, int limit) {
        if (cartProductIds == null || cartProductIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<AssociationRule> rules = associationRuleRepository
                .findByAntecedentProductIdIn(cartProductIds);

        Set<Long> cartSet = new HashSet<>(cartProductIds);
        Map<Long, Double> bestConfidence = new LinkedHashMap<>();
        Map<Long, AssociationRule> bestRule = new LinkedHashMap<>();

        // Gom nhóm theo consequentProductId, lấy luật có confidence cao nhất
        for (AssociationRule rule : rules) {
            Long consequentId = rule.getConsequentProductId();
            if (cartSet.contains(consequentId)) continue; // Bỏ qua nếu đã có trong giỏ
            if (!bestConfidence.containsKey(consequentId) ||
                    rule.getConfidenceValue() > bestConfidence.get(consequentId)) {
                bestConfidence.put(consequentId, rule.getConfidenceValue());
                bestRule.put(consequentId, rule);
            }
        }

        // Sắp xếp theo confidence DESC, lift DESC
        return bestRule.values().stream()
                .sorted(Comparator.comparingDouble(AssociationRule::getConfidenceValue).reversed()
                        .thenComparingDouble(AssociationRule::getLiftValue).reversed())
                .limit(limit)
                .map(rule -> toRecommendationItem(rule))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    // ===================================================
    // API: Giải thích một luật kết hợp cụ thể
    // ===================================================
    @Override
    @Transactional(readOnly = true)
    public String getExplanation(Long antecedentId, Long consequentId) {
        return associationRuleRepository
                .findByAntecedentProductIdAndConsequentProductId(antecedentId, consequentId)
                .map(AssociationRule::getRuleExplanation)
                .orElse(null);
    }

    // ===================================================
    // PRIVATE HELPERS
    // ===================================================

    /**
     * Thu thập tập giao dịch D từ 2 nguồn:
     * 1. Paid orders (payment_status = PAID, status != CANCELLED)
     * 2. Abandoned carts (status = ABANDONED) — không trùng với paid orders
     */
    private List<Set<Long>> collectTransactions() {
        List<Set<Long>> transactions = new ArrayList<>();

        // Nguồn 1: Đơn hàng đã thanh toán
        List<Order> paidOrders = orderRepository.findAllPaidAndNotCancelled();
        for (Order order : paidOrders) {
            Set<Long> productIds = order.getItems().stream()
                    .filter(item -> item.getProduct() != null)
                    .map(item -> item.getProduct().getId())
                    .collect(Collectors.toSet());
            if (productIds.size() >= 2) {
                transactions.add(productIds);
            } else if (!productIds.isEmpty()) {
                transactions.add(productIds); // Tính vào N nhưng không sinh L2
            }
        }

        // Nguồn 2: Giỏ hàng bỏ quên (ABANDONED) — không có orderId → chưa chuyển thành đơn
        List<CartSession> abandonedSessions = cartSessionRepository.findAllAbandonedWithItems();
        for (CartSession session : abandonedSessions) {
            Set<Long> productIds = session.getItems().stream()
                    .filter(item -> item.getProduct() != null)
                    .map(item -> item.getProduct().getId())
                    .collect(Collectors.toSet());
            if (!productIds.isEmpty()) {
                transactions.add(productIds);
            }
        }

        return transactions;
    }

    private Map<Long, Product> loadProductMap(Set<Long> productIds) {
        Map<Long, Product> map = new HashMap<>();
        if (productIds.isEmpty()) return map;
        List<Product> products = productRepository.findAllById(new ArrayList<>(productIds));
        for (Product p : products) {
            map.put(p.getId(), p);
        }
        return map;
    }

    private AssociationRule buildRule(Long antecedentId, Long consequentId,
                                      double support, double confidence, double lift,
                                      Map<Long, Product> productMap) {
        Product antecedent = productMap.get(antecedentId);
        Product consequent = productMap.get(consequentId);

        String antName = antecedent != null ? antecedent.getName() : "Sản phẩm #" + antecedentId;
        String consName = consequent != null ? consequent.getName() : "Sản phẩm #" + consequentId;

        String explanation = String.format(
                "%.0f%% khách hàng mua '%s' đã mua kèm '%s' (Lift %.1fx)",
                confidence * 100, antName, consName, lift);

        return AssociationRule.builder()
                .antecedentProductId(antecedentId)
                .consequentProductId(consequentId)
                .supportValue(support)
                .confidenceValue(confidence)
                .liftValue(lift)
                .ruleExplanation(explanation)
                .build();
    }

    private ProductDto.RecommendationItem toRecommendationItem(AssociationRule rule) {
        Optional<Product> productOpt = productRepository.findById(rule.getConsequentProductId());
        if (!productOpt.isPresent()) return null;
        Product p = productOpt.get();

        // Chỉ gợi ý sản phẩm đang hoạt động và còn hàng
        if (p.getStatus() != Product.ProductStatus.ACTIVE || p.getStockQuantity() <= 0) {
            return null;
        }

        return ProductDto.RecommendationItem.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .oldPrice(p.getOldPrice())
                .thumbnailUrl(p.getThumbnailUrl())
                .artisanName(p.getArtisan() != null ? p.getArtisan().getFullName() : null)
                .stockQuantity(p.getStockQuantity())
                .confidenceValue(rule.getConfidenceValue())
                .liftValue(rule.getLiftValue())
                .supportValue(rule.getSupportValue())
                .explanation(rule.getRuleExplanation())
                .build();
    }
}
