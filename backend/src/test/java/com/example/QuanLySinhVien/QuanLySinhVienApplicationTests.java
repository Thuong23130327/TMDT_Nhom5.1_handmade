package com.example.QuanLySinhVien;

import com.example.Handmade.config.JwtTokenProvider;
import com.example.Handmade.model.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class QuanLySinhVienApplicationTests {
    @Test
    void createsSignedAccessAndRefreshTokensWithDistinctTypes() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(
                "AuraCraft-test-signing-secret-at-least-32-bytes-long",
                86_400_000L,
                604_800_000L);
        User user = new User();
        user.setUsername("handmade_user");
        user.setRole(User.Role.ROLE_CUSTOMER);

        String accessToken = tokenProvider.createAccessToken(user);
        String refreshToken = tokenProvider.createRefreshToken(user);
        Claims accessClaims = tokenProvider.parseClaims(accessToken);
        Claims refreshClaims = tokenProvider.parseClaims(refreshToken);

        assertEquals("handmade_user", accessClaims.getSubject());
        assertEquals("access", accessClaims.get("type", String.class));
        assertEquals("ROLE_CUSTOMER", accessClaims.get("role", String.class));
        assertEquals("refresh", refreshClaims.get("type", String.class));
        assertNotEquals(accessToken, refreshToken);
    }
}
