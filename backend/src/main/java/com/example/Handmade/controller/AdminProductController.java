package com.example.Handmade.controller;

import com.example.Handmade.dto.AdminProductDtos.*;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    // ==========================================
    // 1. API LẤY DANH SÁCH SẢN PHẨM (KÈM BỘ LỌC VÀ TÌM KIẾM)
    // URL: GET /api/v1/admin/products?status=all&keyword=vong
    // ==========================================
    @GetMapping
    public ApiResponse<List<AdminProductItemResponse>> getProducts(
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) String keyword) {

        List<AdminProductItemResponse> list = adminProductService.getProducts(status, keyword);
        return ApiResponse.ok("Lấy danh sách sản phẩm thành công!", list);
    }

    // ==========================================
    // 2. API CẬP NHẬT TRẠNG THÁI (KHÓA/ẨN HOẶC MỞ LẠI SẢN PHẨM)
    // URL: PUT /api/v1/admin/products/{id}/status
    // Body: { "status": "HIDDEN" }
    // ==========================================
    @PutMapping("/{id}/status")
    public ApiResponse<AdminProductItemResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateProductStatusRequest request) {

        if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ApiResponse.error(400, "Trạng thái mới không được để trống!", null);
        }

        try {
            AdminProductItemResponse updated = adminProductService.updateProductStatus(id, request.getStatus());
            return ApiResponse.ok("Cập nhật trạng thái sản phẩm thành công!", updated);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage(), null);
        }
    }

    // ==========================================
    // 3. API XÓA SẢN PHẨM VI PHẠM
    // URL: DELETE /api/v1/admin/products/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return ApiResponse.ok("Xóa sản phẩm thành công!", null);
    }
}