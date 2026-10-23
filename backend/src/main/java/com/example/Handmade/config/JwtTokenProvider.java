package com.example.Handmade.config;

import com.example.Handmade.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {
    private final SecretKey signingKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(
            @Value("${auth.jwt.secret}") String secret,
            @Value("${auth.jwt.access-expiration-ms:86400000}") long accessExpirationMs,
            @Value("${auth.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String createAccessToken(User user) {
        return createToken(user, "access", accessExpirationMs);
    }

    public String createRefreshToken(User user) {
        return createToken(user, "refresh", refreshExpirationMs);
    }

    private String createToken(User user, String type, long expirationMs) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setId(UUID.randomUUID().toString())
                .claim("type", type)
                .claim("role", toAuthority(user.getRole()))
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isAccessToken(String token) {
        return "access".equals(parseClaims(token).get("type", String.class));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(parseClaims(token).get("type", String.class));
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public static String toAuthority(User.Role role) {
        if (role == null) {
            return "ROLE_CUSTOMER";
        }
        String name = role.name();
        if (name.startsWith("ROLE_")) {
            return name;
        }
        if ("BUYER".equals(name) || "ROLE_BUYER".equals(name)) {
            return "ROLE_CUSTOMER";
        }
        return "ROLE_" + name;
    }
}
