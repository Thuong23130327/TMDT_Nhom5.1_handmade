package com.example.Handmade.controller;

import com.example.Handmade.config.CurrentUserResolver;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.SellerDtos.*;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.UserRepository;
import com.example.Handmade.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final CurrentUserResolver currentUserResolver;
    private final UserRepository userRepository;

    private Long resolveArtisanId(Long artisanIdParam) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return currentUserResolver.getCurrentUser().getId();
        }
        if (artisanIdParam != null) {
            return artisanIdParam;
        }
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ARTISAN || u.getRole() == User.Role.ROLE_ARTISAN)
                .map(User::getId)
                .findFirst()
                .orElse(2L);
    }

    @GetMapping("/profile")
    public ApiResponse<SellerProfileResponse> getProfile(@RequestParam(required = false) Long artisanId) {
        return ApiResponse.ok("Lấy thông tin người bán thành công",
                sellerService.getSellerProfile(resolveArtisanId(artisanId)));
    }

    @PutMapping("/profile")
    public ApiResponse<SellerProfileResponse> updateProfile(
            @RequestParam(required = false) Long artisanId,
            @RequestBody UpdateSellerProfileRequest request) {
        return ApiResponse.ok("Cập nhật thông tin shop thành công",
                sellerService.updateSellerProfile(resolveArtisanId(artisanId), request));
    }

    @GetMapping("/revenue")
    public ApiResponse<SellerRevenueResponse> getRevenue(@RequestParam(required = false) Long artisanId) {
        return ApiResponse.ok("Lấy thống kê doanh thu shop thành công",
                sellerService.getSellerRevenue(resolveArtisanId(artisanId)));
    }

    @GetMapping("/orders")
    public ApiResponse<List<SellerOrderItemResponse>> getOrders(
            @RequestParam(required = false) Long artisanId,
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.ok("Lấy danh sách đơn hàng shop thành công",
                sellerService.getSellerOrders(resolveArtisanId(artisanId), status));
    }

    @PutMapping("/orders/{orderId}/status")
    public ApiResponse<SellerOrderItemResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam(required = false) Long artisanId,
            @RequestBody UpdateSellerOrderStatusRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ApiResponse.error(400, "Trạng thái mới không được để trống!", null);
        }
        try {
            SellerOrderItemResponse updated = sellerService.updateSellerOrderStatus(
                    resolveArtisanId(artisanId), orderId, request.getStatus());
            return ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công!", updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage(), null);
        }
    }
}

