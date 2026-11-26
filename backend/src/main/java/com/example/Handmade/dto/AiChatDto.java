package com.example.Handmade.dto;

import lombok.*;
import java.util.List;

/**
 * DTO cho AI Chat API (Feature B — Vietnamese AI Shopping Assistant).
 */
public class AiChatDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatMessage {
        /** "user" hoặc "assistant" */
        private String role;
        private String content;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatRequest {
        /** Danh sách tối đa 8 tin nhắn gần nhất (stateless) */
        private List<ChatMessage> messages;
        /** Product ID đang xem (nếu có) — để chatbot biết context */
        private Long currentProductId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChatResponse {
        /** Câu trả lời bằng tiếng Việt từ AI */
        private String reply;
        /** Danh sách sản phẩm gợi ý kèm theo (nếu có) */
        private List<ProductDto.RecommendationItem> suggestedProducts;
    }
}
