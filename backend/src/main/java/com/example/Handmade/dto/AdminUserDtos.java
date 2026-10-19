package com.example.Handmade.dto;

import com.example.Handmade.model.User;
import lombok.*;

import java.time.LocalDateTime;

public class AdminUserDtos {

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserStatsResponse {
        private long totalUsers;
        private long buyerUsers;
        private long pendingArtisans;
        private long suspendedUsers;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserListItemResponse {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String avatarUrl;
        private String role;       // buyer, artisan, admin
        private String status;     // active, pending, suspended
        private String introduction;
        private String portfolio;
        private LocalDateTime createdAt;

        public static UserListItemResponse fromEntity(User user) {
            String roleStr = user.getRole() != null ? user.getRole().name().toLowerCase() : "";
            if (roleStr.startsWith("role_")) {
                roleStr = roleStr.substring(5);
            }
            String statusStr = user.getStatus() != null ? user.getStatus().name().toLowerCase() : "active";

            return UserListItemResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .avatarUrl(user.getAvatarUrl())
                    .role(roleStr)
                    .status(statusStr)
                    .introduction(user.getIntroduction())
                    .portfolio(user.getPortfolioUrl())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private String status; // active, pending, suspended
    }
}
