package com.example.Handmade.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private int code;
    private String message;
    private T result;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(1000, "Thành công", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(1000, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(9999, message, null);
    }

    public static <T> ApiResponse<T> error(int code, String message, T result) {
        return new ApiResponse<>(code, message, result);
    }
}