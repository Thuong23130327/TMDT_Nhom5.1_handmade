package com.example.Handmade.service;

import com.example.Handmade.dto.ProductDto;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.Category;
import com.example.Handmade.model.Product;
import com.example.Handmade.model.ProductImage;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.CategoryRepository;
import com.example.Handmade.repository.ProductImageRepository;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final AiRecommendationService aiRecommendationService;
    private final AprioriMiningService aprioriMiningService;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.ProductResponse> getAllActiveProducts() {
        return productRepository.findAllByStatus(Product.ProductStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto.ProductResponse> filterProducts(
            Long categoryId, String categorySlug,
            Long artisanId, String artisanName,
            BigDecimal minPrice, BigDecimal maxPrice,
            String search, String sort) {
        List<ProductDto.ProductResponse> list = getAllActiveProducts();

        // 1. Lọc theo danh mục / loại (Category)
        if (categoryId != null) {
            list = list.stream().filter(p -> categoryId.equals(p.getCategoryId())).collect(Collectors.toList());
        } else if (categorySlug != null && !categorySlug.isBlank()) {
            String slugLower = categorySlug.toLowerCase().trim();
            list = list.stream().filter(p -> p.getCategorySlug() != null && 
                    (p.getCategorySlug().toLowerCase().contains(slugLower) || slugLower.contains(p.getCategorySlug().toLowerCase())))
                    .collect(Collectors.toList());
        }

        // 2. Lọc theo nghệ nhân / thương hiệu (Artisan / Brand)
        if (artisanId != null) {
            list = list.stream().filter(p -> artisanId.equals(p.getArtisanId())).collect(Collectors.toList());
        } else if (artisanName != null && !artisanName.isBlank()) {
            String artLower = artisanName.toLowerCase().trim();
            list = list.stream().filter(p -> p.getArtisanName() != null && 
                    p.getArtisanName().toLowerCase().contains(artLower))
                    .collect(Collectors.toList());
        }

        // 3. Lọc theo mức giá (minPrice, maxPrice)
        if (minPrice != null) {
            list = list.stream().filter(p -> p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0)
                    .collect(Collectors.toList());
        }
        if (maxPrice != null) {
            list = list.stream().filter(p -> p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0)
                    .collect(Collectors.toList());
        }

        // 4. Tìm kiếm từ khóa (Search theo tên hoặc mô tả)
        if (search != null && !search.isBlank()) {
            String keyword = search.toLowerCase().trim();
            list = list.stream().filter(p -> 
                    (p.getName() != null && p.getName().toLowerCase().contains(keyword)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(keyword)) ||
                    (p.getCategoryName() != null && p.getCategoryName().toLowerCase().contains(keyword)) ||
                    (p.getArtisanName() != null && p.getArtisanName().toLowerCase().contains(keyword))
            ).collect(Collectors.toList());
        }

        // 5. Sắp xếp (Sort)
        if ("price-asc".equalsIgnoreCase(sort)) {
            list = list.stream().sorted((a, b) -> a.getPrice().compareTo(b.getPrice())).collect(Collectors.toList());
        } else if ("price-desc".equalsIgnoreCase(sort)) {
            list = list.stream().sorted((a, b) -> b.getPrice().compareTo(a.getPrice())).collect(Collectors.toList());
        } else if ("rating-desc".equalsIgnoreCase(sort)) {
            list = list.stream().sorted((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0, 
                    a.getRating() != null ? a.getRating() : 0)).collect(Collectors.toList());
        } else if ("popular".equalsIgnoreCase(sort) || "sold-desc".equalsIgnoreCase(sort)) {
            list = list.stream().sorted((a, b) -> Integer.compare(
                    b.getSoldCount() != null ? b.getSoldCount() : 0, 
                    a.getSoldCount() != null ? a.getSoldCount() : 0)).collect(Collectors.toList());
        } else if ("newest".equalsIgnoreCase(sort)) {
            list = list.stream().sorted((a, b) -> {
                if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }).collect(Collectors.toList());
        }

        return list;
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

    @Override
    @Transactional(readOnly = true)
    public ProductDto.FrequentlyBoughtTogetherResponse getFrequentlyBoughtTogether(Long productId) {
        Product target = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return aprioriMiningService.mineFrequentlyBoughtTogether(target, toResponse(target));
    }

    private ProductDto.ProductResponse toResponse(Product p) {
        // Lấy thông tin danh mục
        String categoryName = "Đồ thủ công";
        String categorySlug = "handmade";
        if (p.getCategoryId() != null) {
            Category cat = categoryRepository.findById(p.getCategoryId()).orElse(null);
            if (cat != null) {
                categoryName = cat.getName();
                categorySlug = cat.getSlug();
            }
        }

        // Lấy thư viện hình ảnh (gallery)
        List<String> images = new ArrayList<>();
        List<ProductImage> dbImages = productImageRepository.findByProductId(p.getId());
        if (dbImages != null && !dbImages.isEmpty()) {
            for (ProductImage img : dbImages) {
                images.add(img.getImageUrl());
            }
        } else if (p.getThumbnailUrl() != null && !p.getThumbnailUrl().isBlank()) {
            images.add(p.getThumbnailUrl());
        }

        User artisan = p.getArtisan();
        String artisanName = artisan != null ? artisan.getFullName() : "Nghệ nhân AuraCraft";
        String artisanAvatar = artisan != null ? artisan.getAvatarUrl() : null;
        String artisanPhone = artisan != null ? artisan.getPhone() : null;
        String artisanIntro = artisan != null ? artisan.getIntroduction() : null;

        return ProductDto.ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .oldPrice(p.getOldPrice())
                .stockQuantity(p.getStockQuantity())
                .color(p.getColor())
                .thumbnailUrl(p.getThumbnailUrl())
                .images(images)
                .isCustomizable(p.getIsCustomizable())
                .status(p.getStatus().name())
                .categoryId(p.getCategoryId())
                .categoryName(categoryName)
                .categorySlug(categorySlug)
                .artisanId(artisan != null ? artisan.getId() : null)
                .artisanName(artisanName)
                .artisanAvatar(artisanAvatar)
                .artisanPhone(artisanPhone)
                .artisanIntroduction(artisanIntro)
                .rating(4.9)
                .reviewsCount(48)
                .soldCount(136)
                .createdAt(p.getCreatedAt())
                .build();
    }

    @Override
    public List<ProductDto.ShopSummaryResponse> getShops(String search) {
        List<ProductDto.ProductResponse> allProducts = getAllActiveProducts();
        List<ProductDto.ShopSummaryResponse> shops = buildShopList();

        // Gắn số lượng sản phẩm và danh sách ảnh top sản phẩm động cho từng shop
        shops.forEach(shop -> {
            List<ProductDto.ProductResponse> shopProducts = allProducts.stream()
                    .filter(p -> p.getArtisanName() != null && 
                            (p.getArtisanName().equalsIgnoreCase(shop.getName()) || 
                             shop.getName().toLowerCase().contains(p.getArtisanName().toLowerCase()) ||
                             p.getArtisanName().toLowerCase().contains(shop.getName().toLowerCase())))
                    .collect(Collectors.toList());

            if (!shopProducts.isEmpty()) {
                shop.setProductCount(shopProducts.size());
                List<String> topImages = shopProducts.stream()
                        .map(ProductDto.ProductResponse::getThumbnailUrl)
                        .filter(img -> img != null && !img.isBlank())
                        .limit(4)
                        .collect(Collectors.toList());
                if (!topImages.isEmpty()) {
                    shop.setTopProductImages(topImages);
                }
            }
        });

        // Lọc theo từ khóa tìm kiếm nếu có
        if (search != null && !search.isBlank()) {
            String kw = search.toLowerCase().trim();
            shops = shops.stream().filter(s -> 
                    s.getName().toLowerCase().contains(kw) ||
                    (s.getSpecialty() != null && s.getSpecialty().toLowerCase().contains(kw)) ||
                    (s.getIntroduction() != null && s.getIntroduction().toLowerCase().contains(kw))
            ).collect(Collectors.toList());
        }

        return shops;
    }

    @Override
    public ProductDto.ShopSummaryResponse getShopDetail(String shopIdentifier) {
        List<ProductDto.ShopSummaryResponse> shops = getShops(null);
        if (shopIdentifier == null || shopIdentifier.isBlank()) {
            return shops.get(0);
        }

        String target = shopIdentifier.toLowerCase().trim();
        return shops.stream()
                .filter(s -> s.getName().toLowerCase().contains(target) ||
                             (s.getSlug() != null && s.getSlug().toLowerCase().contains(target)) ||
                             String.valueOf(s.getId()).equals(target))
                .findFirst()
                .orElse(shops.get(0));
    }

    private List<ProductDto.ShopSummaryResponse> buildShopList() {
        List<ProductDto.ShopSummaryResponse> list = new ArrayList<>();

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(2L)
                .name("Shop Anna (Charm Ý S925)")
                .slug("shop-anna")
                .avatar("A")
                .specialty("Charm Ý S925 & Vòng tay Titan độc bản")
                .introduction("Chuyên chế tác Resin và Charm bạc Ý S925 thủ công cao cấp. Nhận phối charm và khắc tên độc bản theo ảnh phác thảo của khách hàng.")
                .bannerText("Tự do phối charm hoa cúc, đá xanh và các mắt xích bạc Ý tinh xảo tại xưởng chế tác của Anna.")
                .rating(4.9)
                .reviewsCount(148)
                .productCount(3)
                .customOrdersCount(92)
                .joinedYear(2023)
                .topProductImages(List.of("assets/img/products/bracelet_01.jpg", "assets/img/products/bracelet_02.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(4L)
                .name("Xưởng Mộc An (Gỗ trầm)")
                .slug("xuong-moc-an")
                .avatar("M")
                .specialty("Gỗ trầm hương thiên nhiên & Chuỗi hạt phong thủy")
                .introduction("Chạm khắc gỗ trầm thiên nhiên, chuỗi hạt phong thủy và vòng chỉ đỏ may mắn nguyên bản, tôn vinh nghệ thuật truyền thống Việt Nam.")
                .bannerText("Tự tay thiết kế chuỗi hạt gỗ trầm hương mang dấu ấn riêng với công cụ kéo thả trực quan độc quyền của Mộc An.")
                .rating(4.9)
                .reviewsCount(126)
                .productCount(4)
                .customOrdersCount(82)
                .joinedYear(2023)
                .topProductImages(List.of("assets/img/products/bracelet_01.jpg", "assets/img/products/bracelet_03.jpg", "assets/img/products/bracelet_04.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(10L)
                .name("Silver Soul Studio (Bạc Ý)")
                .slug("silver-soul-studio")
                .avatar("S")
                .specialty("Trang sức Bạc Ý & Đá thạch anh thiên nhiên")
                .introduction("Chuyên thiết kế dây chuyền bạc 925 và đá thạch anh thanh khiết, kết hợp hài hòa giữa nét đẹp hiện đại và vẻ thanh lịch cổ điển.")
                .bannerText("Đón nhận năng lượng bình an cùng các mẫu đá thạch anh tự nhiên đính bạc Ý nguyên chất.")
                .rating(5.0)
                .reviewsCount(96)
                .productCount(2)
                .customOrdersCount(65)
                .joinedYear(2024)
                .topProductImages(List.of("assets/img/products/necklace_02.jpg", "assets/img/products/necklace_04.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(11L)
                .name("Handmade By My (Lắc chân)")
                .slug("handmade-by-my")
                .avatar("H")
                .specialty("Lắc chân chuông bạc & Phong cách Bohemian")
                .introduction("Lắc chân vintage đính chuông đồng, vỏ ốc tự nhiên bện sợi thủ công chống nước cho phong cách du mục Bohemian phóng khoáng.")
                .bannerText("Mang thanh âm trong trẻo của chuông gió và biển khơi trong từng bước đi của bạn.")
                .rating(4.6)
                .reviewsCount(72)
                .productCount(3)
                .customOrdersCount(48)
                .joinedYear(2024)
                .topProductImages(List.of("assets/img/products/anket_01.jpg", "assets/img/products/anket_02.jpg", "assets/img/products/anket_03.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(12L)
                .name("Vintage Vibes (Armlet)")
                .slug("vintage-vibes")
                .avatar("V")
                .specialty("Vòng bắp tay Armlet & Đồng thau cổ điển")
                .introduction("Vòng đeo bắp tay phong cách Hy Lạp cổ đại, chế tác từ đồng cổ uốn lượn sắc sảo, tự do điều chỉnh độ rộng ôm sát cánh tay.")
                .bannerText("Khẳng định phong cách độc bản đầy ấn tượng với các mẫu vòng bắp tay Hy Lạp thần thoại.")
                .rating(4.8)
                .reviewsCount(54)
                .productCount(2)
                .customOrdersCount(35)
                .joinedYear(2023)
                .topProductImages(List.of("assets/img/products/armlet_01.jpg", "assets/img/products/armlet_02.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(13L)
                .name("Beachy Crafts (Đi biển)")
                .slug("beachy-crafts")
                .avatar("B")
                .specialty("Vòng bụng hạt cườm & Ngọc trai đi biển")
                .introduction("Chuỗi vòng bụng hạt cườm rực rỡ và ngọc trai nhân tạo tôn dáng eo thon trong các kỳ nghỉ dưỡng biển hè.")
                .bannerText("Tỏa sáng dưới ánh nắng mùa hè với bộ sưu tập phụ kiện đi biển nhiệt đới độc bản.")
                .rating(4.5)
                .reviewsCount(60)
                .productCount(2)
                .customOrdersCount(42)
                .joinedYear(2024)
                .topProductImages(List.of("assets/img/products/belly_01.jpg", "assets/img/products/belly_02.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(14L)
                .name("Cute Phone (Dây strap)")
                .slug("cute-phone")
                .avatar("C")
                .specialty("Dây đeo điện thoại handmade pastel")
                .introduction("Dây strap treo điện thoại đính hạt cườm hoa cúc, trái tim pastel và ngôi sao dạ quang phát sáng nhẹ ban đêm.")
                .bannerText("Biến chiếc điện thoại thân yêu thành món trang sức ngọt ngào chuẩn phong cách Y2K.")
                .rating(4.9)
                .reviewsCount(150)
                .productCount(2)
                .customOrdersCount(110)
                .joinedYear(2024)
                .topProductImages(List.of("assets/img/products/phoneStrap_01.jpg", "assets/img/products/phoneStrap_02.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(3L)
                .name("Trần Bảo (Resin Art)")
                .slug("tran-bao")
                .avatar("T")
                .specialty("Nghệ thuật Resin hoa khô & Cảnh biển")
                .introduction("Nghệ nhân Resin Art Đà Nẵng, chuyên mặt dây chuyền phong cảnh đại dương và hoa khô ép tự nhiên lồng trong khối pha lê trong suốt.")
                .bannerText("Lưu giữ khoảnh khắc kỳ diệu của thiên nhiên và đại dương sâu thẳm trong từng giọt Resin trong vắt.")
                .rating(4.8)
                .reviewsCount(85)
                .productCount(1)
                .customOrdersCount(58)
                .joinedYear(2023)
                .topProductImages(List.of("assets/img/products/necklace_03.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(6L)
                .name("Vũ Đức Minh (Gấu len)")
                .slug("vu-duc-minh")
                .avatar("M")
                .specialty("Thú bông len móc thủ công & Mũ len mini")
                .introduction("Thợ đan len thủ công và thú bông len móc theo yêu cầu, tạo hình gấu mini, móc khóa len ấm áp tỉ mỉ từng mũi kim.")
                .bannerText("Gửi gắm sự ấm áp và yêu thương qua từng món quà len móc tay mềm mại.")
                .rating(4.9)
                .reviewsCount(42)
                .productCount(1)
                .customOrdersCount(39)
                .joinedYear(2024)
                .topProductImages(List.of("assets/img/products/bracelet_02.jpg"))
                .build());

        list.add(ProductDto.ShopSummaryResponse.builder()
                .id(15L)
                .name("Ngọc Craft (Đá quý)")
                .slug("ngoc-craft")
                .avatar("N")
                .specialty("Đá quý thiên nhiên đa giác & Dây chuyền bạc")
                .introduction("Chế tác đá quý thạch anh khói, thạch anh tím đa giác cắt lấp lánh phối bạc 925 thủ công cao cấp.")
                .bannerText("Khơi dậy vẻ đẹp tự nhiên vĩnh cửu của đá quý đất trời.")
                .rating(4.9)
                .reviewsCount(75)
                .productCount(1)
                .customOrdersCount(45)
                .joinedYear(2023)
                .topProductImages(List.of("assets/img/products/necklace_03.jpg"))
                .build());

        return list;
    }
}
