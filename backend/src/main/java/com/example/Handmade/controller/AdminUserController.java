package com.example.Handmade.controller;

import com.example.Handmade.dto.AdminUserDtos.*;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // API 1: Lấy dữ liệu 4 thẻ thống kê
    @GetMapping("/stats")
    public ApiResponse<UserStatsResponse> getStats() {
        return ApiResponse.ok(adminUserService.getStats());
    }

    // API 2: Lấy danh sách người dùng kèm bộ lọc vai trò, trạng thái, tìm kiếm
    @GetMapping
    public ApiResponse<List<UserListItemResponse>> getUsers(
            @RequestParam(required = false, defaultValue = "all") String role,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(adminUserService.getUsers(role, status, keyword));
    }

    // API 3: Cập nhật trạng thái người dùng (Duyệt thợ: PENDING -> ACTIVE, hoặc Khóa: SUSPENDED)
    @PutMapping("/{id}/status")
    public ApiResponse<UserListItemResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ApiResponse.error("Trạng thái mới không được để trống!");
        }
        try {
            UserListItemResponse updatedUser = adminUserService.updateUserStatus(id, request.getStatus());
            return ApiResponse.ok("Cập nhật trạng thái người dùng thành công!", updatedUser);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("Trạng thái không hợp lệ! Chỉ chấp nhận: ACTIVE, PENDING, SUSPENDED");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}
