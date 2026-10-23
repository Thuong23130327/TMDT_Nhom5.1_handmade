package com.example.Handmade.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthenticationResponse {
    private final String accessToken;
    private final String refreshToken;

    @Builder.Default
    private final String tokenType = "Bearer";

    private final UserSummary userSummary;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserSummary {
        private final Long id;
        private final String username;
        private final String email;
        private final String fullName;
        private final String role;
    }
}
