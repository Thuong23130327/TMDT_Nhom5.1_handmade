package com.example.Handmade.controller;

import com.example.Handmade.dto.AiChatDto;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Feature B: REST API endpoint cho AI Chatbot tiếng Việt.
 * POST /api/v1/ai/chat — không yêu cầu đăng nhập (permitAll).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final GeminiAiService geminiAiService;

    /**
     * POST /api/v1/ai/chat
     * Body: { messages: [{role, content}], currentProductId: null|Long }
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatDto.ChatResponse>> chat(
            @RequestBody AiChatDto.ChatRequest request) {

        log.debug("[AiChat] Nhận yêu cầu chat với {} tin nhắn, productId={}",
                request.getMessages() != null ? request.getMessages().size() : 0,
                request.getCurrentProductId());

        AiChatDto.ChatResponse response = geminiAiService.chat(request);
        return ResponseEntity.ok(ApiResponse.ok("Phản hồi thành công", response));
    }
}
