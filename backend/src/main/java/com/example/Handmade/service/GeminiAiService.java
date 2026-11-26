package com.example.Handmade.service;

import com.example.Handmade.dto.AiChatDto;

/**
 * Feature B: Interface cho dịch vụ AI Chatbot tiếng Việt (Gemini).
 */
public interface GeminiAiService {

    /**
     * Xử lý tin nhắn từ người dùng và trả về phản hồi tiếng Việt.
     * Stateless: client gửi kèm danh sách tối đa 8 tin nhắn gần nhất.
     */
    AiChatDto.ChatResponse chat(AiChatDto.ChatRequest request);
}
