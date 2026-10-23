package com.example.Handmade.dto.request;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;
}
