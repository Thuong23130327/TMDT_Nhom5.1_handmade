package com.example.Handmade.service;

import com.example.Handmade.dto.AdminProductDtos.*;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.Product;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    // ==========================================
    // 1. LẤY DANH SÁCH SẢN PHẨM (KÈM LỌC & TÌM KIẾM)
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminProductItemResponse> getProducts(String status, String keyword) {
        // Lấy tất cả sản phẩm, sắp xếp ngày tạo mới nhất lên trước
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        return products.stream()
                // Lọc theo trạng thái (nếu status khác "all")
                .filter(p -> {
                    if (status == null || "all".equalsIgnoreCase(status)) return true;
                    return p.getStatus() != null && p.getStatus().name().equalsIgnoreCase(status);
                })
                // Lọc theo từ khóa tìm kiếm trong tên sản phẩm
                .filter(p -> {
                    if (keyword == null || keyword.trim().isEmpty()) return true;
                    return p.getName() != null && p.getName().toLowerCase().contains(keyword.trim().toLowerCase());
                })
                // Chuyển đổi từ Entity Product sang DTO AdminProductItemResponse
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 2. KHÓA / ẨN HOẶC MỞ LẠI SẢN PHẨM
    // ==========================================
    @Transactional
    public AdminProductItemResponse updateProductStatus(Long productId, String newStatus) {
        // Tìm sản phẩm trong DB, không có thì ném lỗi
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Kiểm tra tính hợp lệ của trạng thái gửi lên
        try {
            Product.ProductStatus statusEnum = Product.ProductStatus.valueOf(newStatus.toUpperCase().trim());
            product.setStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ! Chỉ chấp nhận: ACTIVE hoặc HIDDEN");
        }

        // Lưu trạng thái mới vào DB
        Product savedProduct = productRepository.save(product);
        return mapToItemResponse(savedProduct);
    }

    // ==========================================
    // 3. XÓA SẢN PHẨM VI PHẠM
    // ==========================================
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
    }

    // ==========================================
    // HÀM TIỆN ÍCH: CHUYỂN ENTITY -> DTO
    // ==========================================
    private AdminProductItemResponse mapToItemResponse(Product p) {
        String artisanName = (p.getArtisan() != null && p.getArtisan().getFullName() != null)
                ? p.getArtisan().getFullName() : "N/A";
        String artisanEmail = (p.getArtisan() != null && p.getArtisan().getEmail() != null)
                ? p.getArtisan().getEmail() : "N/A";

        return AdminProductItemResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .thumbnailUrl(p.getThumbnailUrl())
                .status(p.getStatus() != null ? p.getStatus().name() : "ACTIVE")
                .artisanName(artisanName)
                .artisanEmail(artisanEmail)
                .createdAt(p.getCreatedAt())
                .build();
    }
}