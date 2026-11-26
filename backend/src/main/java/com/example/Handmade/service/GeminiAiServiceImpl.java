package com.example.Handmade.service;

import com.example.Handmade.dto.AiChatDto;
import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.model.Product;
import com.example.Handmade.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Feature B: Trợ lý ảo AI mua sắm hỗ trợ tiếng Việt.
 * Tích hợp Google Gemini API (gemini-1.5-flash) qua HTTP.
 * Stateless: client gửi kèm 8 tin nhắn gần nhất.
 * Có Tool Calling nội bộ: searchProducts, getProductDetail, getComplementaryProducts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiAiServiceImpl implements GeminiAiService {

    private final WebClient.Builder webClientBuilder;
    private final ProductRepository productRepository;
    private final AprioriMiningService aprioriMiningService;
    private final ObjectMapper objectMapper;

    @Value("${auracraft.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${auracraft.ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${auracraft.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Value("${auracraft.ai.gemini.max-output-tokens:1024}")
    private int maxOutputTokens;

    private volatile long geminiBlockedUntilMs = 0L;

    // Chống Prompt Injection — từ khóa nguy hiểm
    private static final List<String> INJECTION_PATTERNS = Arrays.asList(
            "ignore previous", "bỏ qua hướng dẫn", "system prompt", "act as",
            "pretend you are", "you are now", "forget everything"
    );

    @Override
    public AiChatDto.ChatResponse chat(AiChatDto.ChatRequest request) {
        // Kiểm tra API key
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return AiChatDto.ChatResponse.builder()
                    .reply("Xin lỗi bạn, tính năng AI Trợ lý chưa được cấu hình (thiếu GEMINI_API_KEY). " +
                           "Vui lòng liên hệ quản trị viên AuraCraft để được hỗ trợ! 😊")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }

        // Lấy tin nhắn cuối cùng của user
        List<AiChatDto.ChatMessage> messages = request.getMessages();
        if (messages == null || messages.isEmpty()) {
            return AiChatDto.ChatResponse.builder()
                    .reply("Chào bạn! Tôi là Trợ lý AI của AuraCraft. Tôi có thể giúp gì cho bạn hôm nay? 🌸")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }

        // Chống Prompt Injection
        String lastUserMsg = messages.stream()
                .filter(m -> "user".equals(m.getRole()))
                .reduce((first, second) -> second)
                .map(AiChatDto.ChatMessage::getContent)
                .orElse("");

        if (isInjectionAttempt(lastUserMsg)) {
            return AiChatDto.ChatResponse.builder()
                    .reply("Xin lỗi bạn, tôi không thể thực hiện yêu cầu đó. " +
                           "Hãy để tôi giúp bạn tìm sản phẩm handmade phù hợp nhé! 😊")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }

        // Thực thi Tool Calling nội bộ trước khi gọi Gemini
        List<ProductDto.RecommendationItem> suggestedProducts = new ArrayList<>();
        String toolContext = executeInternalTools(lastUserMsg, request.getCurrentProductId(), suggestedProducts);

        if (System.currentTimeMillis() < geminiBlockedUntilMs) {
            return AiChatDto.ChatResponse.builder()
                    .reply(buildFallbackReply(lastUserMsg, toolContext, suggestedProducts))
                    .suggestedProducts(suggestedProducts)
                    .build();
        }

        try {
            String geminiReply = callGeminiApi(messages, toolContext, request.getCurrentProductId());
            return AiChatDto.ChatResponse.builder()
                    .reply(geminiReply)
                    .suggestedProducts(suggestedProducts)
                    .build();
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("403")) {
                // Tam ngung goi Gemini 5 phut de tranh spam log 403 khi project chua co quota/billing
                geminiBlockedUntilMs = System.currentTimeMillis() + 300_000L;
                log.warn("[GeminiAI] Gemini API 403 Forbidden (Free tier/Billing unavailable). Tam chuyen sang che do tra loi du phong noi bo trong 5 phut.");
            } else {
                log.warn("[GeminiAI] Khong the ket noi Gemini API: {}", e.getMessage());
            }
            String fallbackReply = buildFallbackReply(lastUserMsg, toolContext, suggestedProducts);
            return AiChatDto.ChatResponse.builder()
                    .reply(fallbackReply)
                    .suggestedProducts(suggestedProducts)
                    .build();
        }
    }

    // ===================================================
    // INTERNAL TOOL CALLING
    // ===================================================
    private String executeInternalTools(String userMessage, Long currentProductId,
                                         List<ProductDto.RecommendationItem> suggestedProducts) {
        StringBuilder context = new StringBuilder();
        String msgLower = userMessage.toLowerCase();

        // Tool: getProductDetail — khi user hỏi về sản phẩm đang xem
        if (currentProductId != null) {
            productRepository.findById(currentProductId).ifPresent(p -> {
                context.append("\n[THÔNG TIN SẢN PHẨM ĐANG XEM]\n");
                context.append("ID: ").append(p.getId()).append("\n");
                context.append("Tên: ").append(p.getName()).append("\n");
                context.append("Giá: ").append(formatPrice(p.getPrice())).append(" VNĐ\n");
                context.append("Tồn kho: ").append(p.getStockQuantity()).append(" cái\n");
                if (p.getDescription() != null && !p.getDescription().isEmpty()) {
                    String desc = p.getDescription().length() > 200
                            ? p.getDescription().substring(0, 200) + "..." : p.getDescription();
                    context.append("Mô tả: ").append(desc).append("\n");
                }
                if (p.getArtisan() != null) {
                    context.append("Nghệ nhân: ").append(p.getArtisan().getFullName()).append("\n");
                }
            });
        }

        // Tool: getComplementaryProducts — khi user hỏi về sản phẩm mua kèm
        boolean askingComplementary = msgLower.contains("mua kèm") || msgLower.contains("kết hợp")
                || msgLower.contains("đi kèm") || msgLower.contains("phối cùng")
                || msgLower.contains("gợi ý") || msgLower.contains("hay mua")
                || msgLower.contains("thường mua") || msgLower.contains("combo");

        if (askingComplementary && currentProductId != null) {
            List<ProductDto.RecommendationItem> recs =
                    aprioriMiningService.getRecommendationsForProduct(currentProductId, 4);
            if (!recs.isEmpty()) {
                suggestedProducts.addAll(recs);
                context.append("\n[GỢI Ý MUA KÈM TỪ APRIORI]\n");
                for (ProductDto.RecommendationItem item : recs) {
                    context.append("- ").append(item.getName())
                           .append(" (").append(formatPrice(item.getPrice())).append(" VNĐ")
                           .append(", ").append(item.getExplanation()).append(")\n");
                }
            } else {
                context.append("\n[GỢI Ý MUA KÈM] Chưa có đủ dữ liệu để đưa ra gợi ý mua kèm cho sản phẩm này.\n");
            }
        }

        // Tool: searchProducts — khi user tìm kiếm sản phẩm
        boolean askingSearch = msgLower.contains("tìm") || msgLower.contains("tim ")
                || msgLower.contains("có") && (msgLower.contains("sản phẩm") || msgLower.contains("sp"))
                || msgLower.contains("quà") || msgLower.contains("vòng") || msgLower.contains("hộp")
                || msgLower.contains("nhẫn") || msgLower.contains("túi") || msgLower.contains("tranh")
                || msgLower.contains("giá") || msgLower.contains("bao nhiêu");

        if (askingSearch) {
            List<Product> products = productRepository.findAll(PageRequest.of(0, 5)).getContent();
            List<Product> activeProducts = products.stream()
                    .filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE)
                    .collect(Collectors.toList());
            if (!activeProducts.isEmpty()) {
                context.append("\n[MỘT SỐ SẢN PHẨM NỔI BẬT CỦA AURACRAFT]\n");
                for (Product p : activeProducts) {
                    context.append("- ID:").append(p.getId())
                           .append(" | ").append(p.getName())
                           .append(" | Giá: ").append(formatPrice(p.getPrice())).append(" VNĐ")
                           .append(" | Còn: ").append(p.getStockQuantity()).append(" cái\n");
                }
            }
        }

        return context.toString();
    }

    // ===================================================
    // GEMINI API CALL
    // ===================================================
    private String callGeminiApi(List<AiChatDto.ChatMessage> messages,
                                   String toolContext, Long currentProductId) throws Exception {

        String systemPrompt = buildSystemPrompt(toolContext);
        String endpoint = geminiBaseUrl + "/models/" + geminiModel + ":generateContent";

        // Xây dựng request body theo format Gemini API
        ObjectNode requestBody = objectMapper.createObjectNode();

        // System instruction
        ObjectNode systemInstruction = objectMapper.createObjectNode();
        ObjectNode systemPart = objectMapper.createObjectNode();
        systemPart.put("text", systemPrompt);
        systemInstruction.set("parts", objectMapper.createArrayNode().add(systemPart));
        requestBody.set("systemInstruction", systemInstruction);

        // Conversation history (tối đa 8 tin nhắn)
        ArrayNode contents = objectMapper.createArrayNode();
        int startIdx = Math.max(0, messages.size() - 8);
        for (int i = startIdx; i < messages.size(); i++) {
            AiChatDto.ChatMessage msg = messages.get(i);
            ObjectNode content = objectMapper.createObjectNode();
            content.put("role", "user".equals(msg.getRole()) ? "user" : "model");
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", sanitize(msg.getContent()));
            content.set("parts", objectMapper.createArrayNode().add(part));
            contents.add(content);
        }
        requestBody.set("contents", contents);

        // Generation config
        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("maxOutputTokens", maxOutputTokens);
        generationConfig.put("temperature", 0.7);
        requestBody.set("generationConfig", generationConfig);

        // Safety settings — tắt bộ lọc quá chặt cho tiếng Việt
        ArrayNode safetySettings = objectMapper.createArrayNode();
        String[] categories = {"HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"};
        for (String category : categories) {
            ObjectNode setting = objectMapper.createObjectNode();
            setting.put("category", category);
            setting.put("threshold", "BLOCK_ONLY_HIGH");
            safetySettings.add(setting);
        }
        requestBody.set("safetySettings", safetySettings);

        String requestJson = objectMapper.writeValueAsString(requestBody);

        WebClient client = webClientBuilder.build();
        String responseJson = client.post()
                .uri(endpoint)
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", geminiApiKey)
                .bodyValue(requestJson)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();

        return extractTextFromGeminiResponse(responseJson);
    }

    private String buildSystemPrompt(String toolContext) {
        return "Bạn là Trợ lý AI mua sắm của AuraCraft — sàn thương mại điện tử chuyên về đồ handmade và thủ công mỹ nghệ Việt Nam.\n\n" +
               "NGUYÊN TẮC QUAN TRỌNG:\n" +
               "1. Luôn giao tiếp bằng tiếng Việt tự nhiên, thân thiện, xưng là 'Trợ lý AI AuraCraft'.\n" +
               "2. TUYỆT ĐỐI không tự bịa đặt sản phẩm, giá, tồn kho — chỉ dùng thông tin trong [DỮ LIỆU THỰC TẾ].\n" +
               "3. Nếu không có thông tin, hãy nói thật và đề nghị khách xem thêm trên website.\n" +
               "4. Giải thích gợi ý mua kèm bằng thống kê thực tế (Confidence, Lift) từ [GỢI Ý MUA KÈM TỪ APRIORI].\n" +
               "5. Không thực hiện đặt hàng, thanh toán, hay bất kỳ thao tác tài chính nào.\n" +
               "6. Trả lời ngắn gọn, dễ đọc (tối đa 200 chữ), dùng emoji phù hợp 😊🌸✨.\n\n" +
               (toolContext.isEmpty() ? "" : "[DỮ LIỆU THỰC TẾ TỪ AURACRAFT]\n" + toolContext);
    }

    private String extractTextFromGeminiResponse(String responseJson) throws Exception {
        if (responseJson == null || responseJson.isEmpty()) {
            throw new RuntimeException("Gemini API trả về response rỗng");
        }
        JsonNode root = objectMapper.readTree(responseJson);

        // Kiểm tra lỗi từ Gemini
        if (root.has("error")) {
            String errorMsg = root.path("error").path("message").asText("Unknown error");
            log.error("[GeminiAI] API Error: {}", errorMsg);
            throw new RuntimeException("Gemini API lỗi: " + errorMsg);
        }

        // Trích xuất text từ candidates
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.path("content");
            JsonNode parts = content.path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText("Xin lỗi, tôi không thể trả lời ngay lúc này.");
            }
        }

        throw new RuntimeException("Không thể trích xuất text từ response Gemini");
    }

    private boolean isInjectionAttempt(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase();
        return INJECTION_PATTERNS.stream().anyMatch(lower::contains);
    }

    private String sanitize(String text) {
        if (text == null) return "";
        // Giới hạn độ dài mỗi tin nhắn
        return text.length() > 1000 ? text.substring(0, 1000) + "..." : text;
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) return "0";
        return String.format("%,.0f", price);
    }

    private String buildFallbackReply(String userMessage, String toolContext,
                                      List<ProductDto.RecommendationItem> suggestedProducts) {
        String msgLower = userMessage != null ? userMessage.toLowerCase() : "";
        if (suggestedProducts != null && !suggestedProducts.isEmpty()) {
            StringBuilder sb = new StringBuilder("Dựa trên dữ liệu mua sắm thực tế của AuraCraft (Apriori), các sản phẩm thường được mua kèm gồm:\n");
            for (ProductDto.RecommendationItem item : suggestedProducts) {
                sb.append("• ").append(item.getName())
                  .append(" (").append(formatPrice(item.getPrice())).append(" đ)");
                if (item.getExplanation() != null) {
                    sb.append(" — ").append(item.getExplanation());
                }
                sb.append("\n");
            }
            sb.append("Bạn có thể bấm vào thẻ sản phẩm bên dưới để xem chi tiết nhé! 🌸");
            return sb.toString();
        }
        if (toolContext != null && !toolContext.isEmpty()) {
            return "Thông tin sản phẩm hiện có tại AuraCraft:\n" + toolContext.trim();
        }
        if (msgLower.contains("quà") || msgLower.contains("tặng") || msgLower.contains("gợi ý")) {
            List<Product> products = productRepository.findAll(PageRequest.of(0, 4)).getContent();
            if (!products.isEmpty()) {
                StringBuilder sb = new StringBuilder("Gợi ý một số món quà handmade nổi bật tại AuraCraft:\n");
                for (Product p : products) {
                    if (p.getStatus() == Product.ProductStatus.ACTIVE) {
                        sb.append("• ").append(p.getName())
                          .append(" — ").append(formatPrice(p.getPrice())).append(" đ (Còn ")
                          .append(p.getStockQuantity()).append(")\n");
                    }
                }
                return sb.toString().trim();
            }
        }
        return "Chào bạn! Mình là Trợ lý AI AuraCraft 🌸. Bạn có thể hỏi về sản phẩm handmade, giá cả, tồn kho hoặc bấm các nút gợi ý bên dưới để xem sản phẩm mua kèm nhé!";
    }
}
