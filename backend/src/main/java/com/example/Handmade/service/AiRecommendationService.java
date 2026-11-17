package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.model.Product;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiRecommendationService {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "và", "của", "từ", "cho", "có", "thể", "được", "với", "hàng", "tại", "theo",
            "đến", "các", "những", "một", "này", "đó", "khi", "làm", "thủ", "công", "là",
            "như", "rất", "nhiều", "bạn", "trong", "ngoài", "phù", "hợp", "shop", "tiệm"
    ));

    private static final Pattern WORD_SPLIT = Pattern.compile("[\\s,\\.\\?!\\-_/]+");

    /**
     * Gợi ý sản phẩm tương tự bằng thuật toán Cosine Similarity
     */
    public List<ProductDto.RecommendationResponse> recommendSimilarProducts(
            Product target, List<Product> allCandidates, int limit) {

        if (target == null || allCandidates == null || allCandidates.isEmpty()) {
            return Collections.emptyList();
        }

        // Lọc bỏ sản phẩm mục tiêu ra khỏi tập ứng viên
        List<Product> candidates = allCandidates.stream()
                .filter(p -> !p.getId().equals(target.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Thu thập văn bản của tất cả sản phẩm để trích xuất tập từ vựng (Vocabulary)
        List<Product> universe = new ArrayList<>(candidates);
        universe.add(target);

        Map<Long, List<String>> productTokens = new HashMap<>();
        Map<String, Integer> docFrequency = new HashMap<>();

        for (Product p : universe) {
            List<String> tokens = extractTokens(p);
            productTokens.put(p.getId(), tokens);

            Set<String> uniqueInDoc = new HashSet<>(tokens);
            for (String term : uniqueInDoc) {
                docFrequency.put(term, docFrequency.getOrDefault(term, 0) + 1);
            }
        }

        List<String> vocabulary = new ArrayList<>(docFrequency.keySet());
        Collections.sort(vocabulary);

        int totalDocs = universe.size();
        Map<String, Double> idfMap = new HashMap<>();
        for (String term : vocabulary) {
            double df = docFrequency.getOrDefault(term, 1);
            // IDF công thức làm mịn: ln(1 + N / df)
            idfMap.put(term, Math.log(1.0 + ((double) totalDocs / df)));
        }

        // 2. Xây dựng vector đặc trưng cho từng sản phẩm
        Map<Long, double[]> vectorMap = new HashMap<>();
        for (Product p : universe) {
            vectorMap.put(p.getId(), buildProductVector(p, productTokens.get(p.getId()), vocabulary, idfMap));
        }

        double[] targetVector = vectorMap.get(target.getId());

        // 3. Tính độ tương đồng Cosine giữa sản phẩm mục tiêu và từng ứng viên
        List<CandidateScore> scoredList = new ArrayList<>();
        for (Product candidate : candidates) {
            double[] candVector = vectorMap.get(candidate.getId());
            double cosine = calculateCosine(targetVector, candVector);

            // Phân tích các đặc trưng tương đồng cao nhất
            List<String> reasons = extractMatchReasons(target, candidate, productTokens.get(target.getId()), productTokens.get(candidate.getId()));

            scoredList.add(new CandidateScore(candidate, cosine, reasons));
        }

        // 4. Sắp xếp điểm số giảm dần
        scoredList.sort((a, b) -> Double.compare(b.cosine, a.cosine));

        // 5. Chuyển đổi sang RecommendationResponse
        return scoredList.stream()
                .limit(Math.max(1, limit))
                .map(cs -> {
                    Product p = cs.product;
                    int percent = Math.min(99, Math.max(50, (int) Math.round(cs.cosine * 100)));
                    return ProductDto.RecommendationResponse.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .description(p.getDescription())
                            .price(p.getPrice())
                            .oldPrice(p.getOldPrice())
                            .thumbnailUrl(p.getThumbnailUrl())
                            .color(p.getColor())
                            .artisanName(p.getArtisan() != null ? p.getArtisan().getFullName() : null)
                            .similarityScore(Math.round(cs.cosine * 1000.0) / 1000.0)
                            .matchPercent(percent)
                            .matchReasons(cs.reasons)
                            .explanation("Độ tương đồng Cosine: " + percent + "% dựa trên phân tích đặc trưng văn bản, danh mục và mức giá.")
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Trích xuất token từ tên, mô tả, màu sắc, danh mục, nghệ nhân
     */
    private List<String> extractTokens(Product p) {
        StringBuilder sb = new StringBuilder();
        if (p.getName() != null) sb.append(p.getName()).append(" ").append(p.getName()).append(" "); // nhân đôi trọng số tên
        if (p.getDescription() != null) sb.append(p.getDescription()).append(" ");
        if (p.getColor() != null) sb.append(p.getColor()).append(" ");
        if (p.getArtisan() != null && p.getArtisan().getFullName() != null) sb.append(p.getArtisan().getFullName()).append(" ");

        String[] rawTokens = WORD_SPLIT.split(sb.toString().toLowerCase());
        List<String> result = new ArrayList<>();
        for (String t : rawTokens) {
            t = t.trim();
            if (t.length() > 1 && !STOP_WORDS.contains(t)) {
                result.add(t);
            }
        }
        return result;
    }

    /**
     * Xây dựng vector đặc trưng kết hợp TF-IDF văn bản + Phân khúc giá + Danh mục
     */
    private double[] buildProductVector(
            Product p, List<String> tokens, List<String> vocabulary, Map<String, Double> idfMap) {

        int textDim = vocabulary.size();
        // Vector gồm: [textDim phần tử TF-IDF, 1 phần tử danh mục chuẩn hóa, 1 phần tử mức giá chuẩn hóa]
        double[] vector = new double[textDim + 2];

        // Đếm tần suất từ (Term Frequency)
        Map<String, Integer> tf = new HashMap<>();
        for (String t : tokens) {
            tf.put(t, tf.getOrDefault(t, 0) + 1);
        }
        int totalTokens = Math.max(1, tokens.size());

        for (int i = 0; i < textDim; i++) {
            String word = vocabulary.get(i);
            int count = tf.getOrDefault(word, 0);
            if (count > 0) {
                double termFreq = (double) count / totalTokens;
                double idf = idfMap.getOrDefault(word, 1.0);
                vector[i] = termFreq * idf * 2.0; // Trọng số ngữ nghĩa TF-IDF
            }
        }

        // Đặc trưng danh mục (Category)
        if (p.getCategoryId() != null) {
            vector[textDim] = p.getCategoryId().doubleValue() * 0.8;
        }

        // Đặc trưng phân khúc giá (Price log-scaled)
        if (p.getPrice() != null && p.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            vector[textDim + 1] = Math.log10(p.getPrice().doubleValue()) * 0.5;
        }

        return vector;
    }

    /**
     * Tính toán Cosine Similarity giữa 2 vector:
     * cos(A, B) = (A . B) / (||A|| * ||B||)
     */
    public double calculateCosine(double[] vecA, double[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length) return 0.0;

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    /**
     * Rút trích các lý do đối sánh nổi bật cho giải thích AI
     */
    private List<String> extractMatchReasons(
            Product target, Product candidate, List<String> targetTokens, List<String> candTokens) {

        List<String> reasons = new ArrayList<>();

        // 1. Kiểm tra cùng nghệ nhân / xưởng
        if (target.getArtisan() != null && candidate.getArtisan() != null
                && Objects.equals(target.getArtisan().getId(), candidate.getArtisan().getId())) {
            reasons.add("Cùng nghệ nhân: " + target.getArtisan().getFullName());
        }

        // 2. Kiểm tra cùng danh mục
        if (Objects.equals(target.getCategoryId(), candidate.getCategoryId())) {
            reasons.add("Cùng phân loại sản phẩm");
        }

        // 3. Kiểm tra các từ khóa chung có ý nghĩa nhất
        Set<String> sharedTokens = new LinkedHashSet<>(targetTokens);
        sharedTokens.retainAll(candTokens);
        if (!sharedTokens.isEmpty()) {
            List<String> topShared = sharedTokens.stream().limit(3).collect(Collectors.toList());
            reasons.add("Từ khóa chung: " + String.join(", ", topShared));
        }

        // 4. Kiểm tra mức giá tương đồng
        if (target.getPrice() != null && candidate.getPrice() != null) {
            double p1 = target.getPrice().doubleValue();
            double p2 = candidate.getPrice().doubleValue();
            double diffRatio = Math.abs(p1 - p2) / Math.max(p1, p2);
            if (diffRatio <= 0.25) {
                reasons.add("Phân khúc giá tương đương");
            }
        }

        if (reasons.isEmpty()) {
            reasons.add("Phong cách thiết kế tương đồng");
        }

        return reasons;
    }

    private static class CandidateScore {
        final Product product;
        final double cosine;
        final List<String> reasons;

        CandidateScore(Product product, double cosine, List<String> reasons) {
            this.product = product;
            this.cosine = cosine;
            this.reasons = reasons;
        }
    }
}
