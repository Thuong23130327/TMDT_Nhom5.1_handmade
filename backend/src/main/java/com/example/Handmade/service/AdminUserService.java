package com.example.Handmade.service;

import com.example.Handmade.dto.AdminUserDtos.*;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    // 1. Thống kê 4 số thẻ trên đầu trang
    public UserStatsResponse getStats() {
        List<User.Role> buyerRoles = Arrays.asList(User.Role.BUYER, User.Role.ROLE_BUYER);
        List<User.Role> artisanRoles = Arrays.asList(User.Role.ARTISAN, User.Role.ROLE_ARTISAN);

        long total = userRepository.count();
        long buyers = userRepository.countByRoleIn(buyerRoles);
        long pendingArtisans = userRepository.countByRoleInAndStatus(artisanRoles, User.UserStatus.PENDING);
        long suspended = userRepository.countByStatus(User.UserStatus.SUSPENDED);

        return UserStatsResponse.builder()
                .totalUsers(total)
                .buyerUsers(buyers)
                .pendingArtisans(pendingArtisans)
                .suspendedUsers(suspended)
                .build();
    }

    // 2. Tìm kiếm và lọc danh sách người dùng
    public List<UserListItemResponse> getUsers(String roleStr, String statusStr, String keyword) {
        List<User.Role> roles = null;
        if (roleStr != null && !roleStr.trim().isEmpty() && !roleStr.equalsIgnoreCase("all")) {
            String cleanRole = roleStr.trim().toUpperCase().replace("ROLE_", "");
            roles = new ArrayList<>();
            try {
                roles.add(User.Role.valueOf(cleanRole));
            } catch (IllegalArgumentException ignored) {}
            try {
                roles.add(User.Role.valueOf("ROLE_" + cleanRole));
            } catch (IllegalArgumentException ignored) {}
        }

        User.UserStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !statusStr.equalsIgnoreCase("all")) {
            try {
                status = User.UserStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return userRepository.searchUsers(roles, status, searchKeyword)
                .stream()
                .map(UserListItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 3. Cập nhật trạng thái người dùng (Duyệt thợ / Tạm khóa)
    @Transactional
    public UserListItemResponse updateUserStatus(Long userId, String newStatusStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có ID: " + userId));

        String cleanStatus = newStatusStr.trim().toUpperCase();
        User.UserStatus newStatus = User.UserStatus.valueOf(cleanStatus);
        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        return UserListItemResponse.fromEntity(savedUser);
    }
}
