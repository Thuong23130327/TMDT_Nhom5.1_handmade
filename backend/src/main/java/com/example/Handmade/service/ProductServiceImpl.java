package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.Product;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final AiRecommendationService aiRecommendationService;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.ProductResponse> getAllActiveProducts() {
        return productRepository.findAllByStatus(Product.ProductStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto.ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.RecommendationResponse> getSimilarProductsCosine(Long productId, int limit) {
        Product target = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        List<Product> allActive = productRepository.findAllByStatus(Product.ProductStatus.ACTIVE);
        return aiRecommendationService.recommendSimilarProducts(target, allActive, limit);
    }

    private ProductDto.ProductResponse toResponse(Product p) {
        return ProductDto.ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .oldPrice(p.getOldPrice())
                .stockQuantity(p.getStockQuantity())
                .color(p.getColor())
                .thumbnailUrl(p.getThumbnailUrl())
                .isCustomizable(p.getIsCustomizable())
                .status(p.getStatus().name())
                .artisanId(p.getArtisan() != null ? p.getArtisan().getId() : null)
                .artisanName(p.getArtisan() != null ? p.getArtisan().getFullName() : null)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
