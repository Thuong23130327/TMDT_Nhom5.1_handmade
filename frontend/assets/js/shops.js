/**
 * AuraCraft - Tìm Kiếm & Khám Phá Gian Hàng Nghệ Nhân (Shops Directory)
 * Module: Yến (Catalog, Shop / Artisan, Khám phá & Kết nối Nghệ nhân)
 * Tích hợp Backend API (/api/products/shops) + Dữ liệu phong phú chuẩn bị sẵn cho buổi demo
 */

document.addEventListener('DOMContentLoaded', async () => {
    const API_SHOPS = "http://localhost:8080/api/products/shops";
    const shopsGrid = document.getElementById('shopsGridContainer');
    const searchInput = document.getElementById('shopSearchInput');
    const btnClearSearch = document.getElementById('btnClearShopSearch');
    const sortSelect = document.getElementById('shopSortSelect');
    const specialtyPills = document.querySelectorAll('.filter-pill-btn');
    const countDisplay = document.getElementById('shopsCountDisplay');
    const statTotalShops = document.getElementById('statTotalShops');

    let allShops = [];
    let currentSpecialty = 'ALL';
    let currentKeyword = '';
    let currentSort = 'rating';

    // Dữ liệu Mock 10 Gian hàng nghệ nhân đồng bộ với data.sql & AURA_PRODUCTS
    const mockShops = [
        {
            id: 2,
            name: "Shop Anna (Charm Ý S925)",
            slug: "shop-anna",
            avatar: "A",
            specialty: "Charm Ý S925 & Vòng tay Titan độc bản",
            specialtyCategory: "CHARM",
            introduction: "Chuyên chế tác Resin và Charm bạc Ý S925 thủ công cao cấp. Nhận phối charm và khắc tên độc bản theo yêu cầu khách hàng.",
            rating: 4.9,
            reviewsCount: 148,
            productCount: 3,
            customOrdersCount: 92,
            joinedYear: 2023,
            topProductImages: [
                "../assets/img/products/bracelet_01.jpg",
                "../assets/img/products/bracelet_02.jpg"
            ]
        },
        {
            id: 4,
            name: "Xưởng Mộc An (Gỗ trầm)",
            slug: "xuong-moc-an",
            avatar: "M",
            specialty: "Gỗ trầm hương thiên nhiên & Chuỗi hạt phong thủy",
            specialtyCategory: "WOOD",
            introduction: "Chạm khắc gỗ trầm thiên nhiên, chuỗi hạt phong thủy và vòng chỉ đỏ may mắn nguyên bản, tôn vinh nghệ thuật truyền thống Việt Nam.",
            rating: 4.9,
            reviewsCount: 126,
            productCount: 4,
            customOrdersCount: 82,
            joinedYear: 2023,
            topProductImages: [
                "../assets/img/products/bracelet_01.jpg",
                "../assets/img/products/bracelet_03.jpg",
                "../assets/img/products/bracelet_04.jpg"
            ]
        },
        {
            id: 10,
            name: "Silver Soul Studio (Bạc Ý)",
            slug: "silver-soul-studio",
            avatar: "S",
            specialty: "Trang sức Bạc Ý & Đá thạch anh thiên nhiên",
            specialtyCategory: "CHARM",
            introduction: "Chuyên thiết kế dây chuyền bạc 925 và đá thạch anh thanh khiết, kết hợp hài hòa giữa nét đẹp hiện đại và vẻ thanh lịch cổ điển.",
            rating: 5.0,
            reviewsCount: 96,
            productCount: 2,
            customOrdersCount: 65,
            joinedYear: 2024,
            topProductImages: [
                "../assets/img/products/necklace_02.jpg",
                "../assets/img/products/necklace_04.jpg"
            ]
        },
        {
            id: 11,
            name: "Handmade By My (Lắc chân)",
            slug: "handmade-by-my",
            avatar: "H",
            specialty: "Lắc chân chuông bạc & Phong cách Bohemian",
            specialtyCategory: "BEACH",
            introduction: "Lắc chân vintage đính chuông đồng, vỏ ốc tự nhiên bện sợi thủ công chống nước cho phong cách du mục Bohemian phóng khoáng.",
            rating: 4.6,
            reviewsCount: 72,
            productCount: 3,
            customOrdersCount: 48,
            joinedYear: 2024,
            topProductImages: [
                "../assets/img/products/anket_01.jpg",
                "../assets/img/products/anket_02.jpg",
                "../assets/img/products/anket_03.jpg"
            ]
        },
        {
            id: 12,
            name: "Vintage Vibes (Armlet)",
            slug: "vintage-vibes",
            avatar: "V",
            specialty: "Vòng bắp tay Armlet & Đồng thau cổ điển",
            specialtyCategory: "BEACH",
            introduction: "Vòng đeo bắp tay phong cách Hy Lạp cổ đại, chế tác từ đồng cổ uốn lượn sắc sảo, tự do điều chỉnh độ rộng ôm sát cánh tay.",
            rating: 4.8,
            reviewsCount: 54,
            productCount: 2,
            customOrdersCount: 35,
            joinedYear: 2023,
            topProductImages: [
                "../assets/img/products/armlet_01.jpg",
                "../assets/img/products/armlet_02.jpg"
            ]
        },
        {
            id: 13,
            name: "Beachy Crafts (Đi biển)",
            slug: "beachy-crafts",
            avatar: "B",
            specialty: "Vòng bụng hạt cườm & Ngọc trai đi biển",
            specialtyCategory: "BEACH",
            introduction: "Chuỗi vòng bụng hạt cườm rực rỡ và ngọc trai nhân tạo tôn dáng eo thon trong các kỳ nghỉ dưỡng biển hè.",
            rating: 4.5,
            reviewsCount: 60,
            productCount: 2,
            customOrdersCount: 42,
            joinedYear: 2024,
            topProductImages: [
                "../assets/img/products/belly_01.jpg",
                "../assets/img/products/belly_02.jpg"
            ]
        },
        {
            id: 14,
            name: "Cute Phone (Dây strap)",
            slug: "cute-phone",
            avatar: "C",
            specialty: "Dây đeo điện thoại handmade pastel",
            specialtyCategory: "KNIT",
            introduction: "Dây strap treo điện thoại đính hạt cườm hoa cúc, trái tim pastel và ngôi sao dạ quang phát sáng nhẹ ban đêm.",
            rating: 4.9,
            reviewsCount: 150,
            productCount: 2,
            customOrdersCount: 110,
            joinedYear: 2024,
            topProductImages: [
                "../assets/img/products/phoneStrap_01.jpg",
                "../assets/img/products/phoneStrap_02.jpg"
            ]
        },
        {
            id: 3,
            name: "Trần Bảo (Resin Art)",
            slug: "tran-bao",
            avatar: "T",
            specialty: "Nghệ thuật Resin hoa khô & Cảnh biển",
            specialtyCategory: "RESIN",
            introduction: "Nghệ nhân Resin Art Đà Nẵng, chuyên mặt dây chuyền phong cảnh đại dương và hoa khô ép tự nhiên lồng trong khối pha lê trong suốt.",
            rating: 4.8,
            reviewsCount: 85,
            productCount: 1,
            customOrdersCount: 58,
            joinedYear: 2023,
            topProductImages: [
                "../assets/img/products/necklace_03.jpg"
            ]
        },
        {
            id: 6,
            name: "Vũ Đức Minh (Gấu len)",
            slug: "vu-duc-minh",
            avatar: "M",
            specialty: "Thú bông len móc thủ công & Mũ len mini",
            specialtyCategory: "KNIT",
            introduction: "Thợ đan len thủ công và thú bông len móc theo yêu cầu, tạo hình gấu mini, móc khóa len ấm áp tỉ mỉ từng mũi kim.",
            rating: 4.9,
            reviewsCount: 42,
            productCount: 1,
            customOrdersCount: 39,
            joinedYear: 2024,
            topProductImages: [
                "../assets/img/products/bracelet_02.jpg"
            ]
        },
        {
            id: 15,
            name: "Ngọc Craft (Đá quý)",
            slug: "ngoc-craft",
            avatar: "N",
            specialty: "Đá quý thiên nhiên đa giác & Dây chuyền bạc",
            specialtyCategory: "CHARM",
            introduction: "Chế tác đá quý thạch anh khói, thạch anh tím đa giác cắt giác lấp lánh phối bạc 925 thủ công cao cấp.",
            rating: 4.9,
            reviewsCount: 75,
            productCount: 1,
            customOrdersCount: 45,
            joinedYear: 2023,
            topProductImages: [
                "../assets/img/products/necklace_03.jpg"
            ]
        }
    ];

    function normalizeImgPath(path) {
        if (!path) return '../assets/img/products/bracelet_01.jpg';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
        let clean = path.replace(/^\/+/, '');
        if (clean.startsWith('assets/')) return '../' + clean;
        if (clean.startsWith('./assets/')) return '../' + clean.slice(2);
        if (!clean.startsWith('../')) return '../' + clean;
        return clean;
    }

    // Helper quản lý danh sách shop đã theo dõi
    function getFollowedShops() {
        try {
            return JSON.parse(localStorage.getItem('auraFollowedShops') || '[]');
        } catch (e) {
            return [];
        }
    }

    function toggleFollowShop(shopName) {
        let followed = getFollowedShops();
        const index = followed.indexOf(shopName);
        if (index > -1) {
            followed.splice(index, 1);
        } else {
            followed.push(shopName);
        }
        localStorage.setItem('auraFollowedShops', JSON.stringify(followed));
        return followed.includes(shopName);
    }

    // 1. Tải danh sách gian hàng
    await loadShops();

    async function loadShops() {
        if (shopsGrid) {
            shopsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 0;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #425B9A;"></i>
                    <p style="margin-top: 10px; color: #666;">Đang kết nối danh sách gian hàng nghệ nhân...</p>
                </div>
            `;
        }

        try {
            const res = await fetch(API_SHOPS);
            if (res.ok) {
                const json = await res.json();
                const data = json.result || json.data;
                if (Array.isArray(data) && data.length > 0) {
                    allShops = data.map(s => {
                        const matchedMock = mockShops.find(m => m.id === s.id || m.name.toLowerCase().includes(s.name.toLowerCase()));
                        return {
                            ...s,
                            specialtyCategory: matchedMock ? matchedMock.specialtyCategory : 'CHARM',
                            topProductImages: s.topProductImages && s.topProductImages.length > 0 ? s.topProductImages.map(normalizeImgPath) : (matchedMock ? matchedMock.topProductImages : ['../assets/img/products/bracelet_01.jpg'])
                        };
                    });
                }
            }
        } catch (e) {
            console.warn("Backend API offline hoặc chưa bật, sử dụng danh mục xưởng phong phú:", e);
        }

        if (allShops.length === 0) {
            allShops = mockShops;
        }

        if (statTotalShops) {
            statTotalShops.textContent = allShops.length;
        }

        // Đọc URL query search nếu có (ví dụ từ search box header)
        const params = new URLSearchParams(window.location.search);
        const searchQ = params.get('search');
        if (searchQ && searchInput) {
            searchInput.value = searchQ;
            currentKeyword = searchQ.trim().toLowerCase();
            if (btnClearSearch) btnClearSearch.style.display = 'block';
        }

        applyFilterAndRender();
    }

    // 2. Thuật toán Tìm kiếm & Lọc gian hàng
    function applyFilterAndRender() {
        let filtered = allShops.filter(shop => {
            // Lọc theo Specialty Category (Pill)
            if (currentSpecialty !== 'ALL') {
                const cat = shop.specialtyCategory || 'CHARM';
                if (cat !== currentSpecialty) return false;
            }

            // Lọc theo từ khóa tìm kiếm
            if (currentKeyword) {
                const name = (shop.name || '').toLowerCase();
                const spec = (shop.specialty || '').toLowerCase();
                const intro = (shop.introduction || '').toLowerCase();
                const match = name.includes(currentKeyword) || spec.includes(currentKeyword) || intro.includes(currentKeyword);
                if (!match) return false;
            }

            return true;
        });

        // Sắp xếp
        if (currentSort === 'rating') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (currentSort === 'custom') {
            filtered.sort((a, b) => (b.customOrdersCount || 0) - (a.customOrdersCount || 0));
        } else if (currentSort === 'products') {
            filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
        } else if (currentSort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        renderShops(filtered);
    }

    // 3. Render Lưới Gian Hàng
    function renderShops(shops) {
        if (!shopsGrid) return;

        if (countDisplay) {
            countDisplay.textContent = `Tìm thấy ${shops.length} gian hàng xưởng chế tác`;
        }

        if (shops.length === 0) {
            shopsGrid.innerHTML = `
                <div class="empty-shops-state">
                    <i class="fa-solid fa-store-slash"></i>
                    <h3>Không tìm thấy gian hàng phù hợp</h3>
                    <p>Không có xưởng chế tác nào khớp với từ khóa "<strong>${escapeHtml(currentKeyword)}</strong>" hoặc thể loại đã chọn.</p>
                    <button type="button" class="btn btn-primary" id="btnResetShopFilter" style="padding: 9px 20px; border-radius: 8px;">
                        <i class="fa-solid fa-rotate-left"></i> Đặt lại tìm kiếm
                    </button>
                </div>
            `;
            const btnReset = document.getElementById('btnResetShopFilter');
            if (btnReset) {
                btnReset.onclick = () => {
                    if (searchInput) searchInput.value = '';
                    currentKeyword = '';
                    currentSpecialty = 'ALL';
                    specialtyPills.forEach(p => p.classList.toggle('active', p.dataset.specialty === 'ALL'));
                    if (btnClearSearch) btnClearSearch.style.display = 'none';
                    applyFilterAndRender();
                };
            }
            return;
        }

        const followedList = getFollowedShops();

        let html = '';
        shops.forEach(shop => {
            const isFollowed = followedList.includes(shop.name);
            const avatarChar = shop.avatar || (shop.name ? shop.name.trim().charAt(0).toUpperCase() : 'A');
            const thumbs = shop.topProductImages && shop.topProductImages.length > 0
                ? shop.topProductImages
                : ['../assets/img/products/bracelet_01.jpg', '../assets/img/products/bracelet_02.jpg'];

            const thumbsHtml = thumbs.map((imgSrc, idx) => `
                <div class="preview-thumb-item" title="Xem sản phẩm tiêu biểu của ${escapeHtml(shop.name)}">
                    <img src="${normalizeImgPath(imgSrc)}" alt="Sản phẩm của ${escapeHtml(shop.name)}" onerror="this.src='../assets/img/products/bracelet_01.jpg'">
                </div>
            `).join('');

            const shopProfileUrl = `shop-profile.html?shop=${encodeURIComponent(shop.name)}`;

            html += `
                <div class="shop-card">
                    <!-- Top: Avatar + Tên + Thông số -->
                    <div class="shop-card-top">
                        <div class="shop-avatar-circle" title="${escapeHtml(shop.name)}">
                            ${avatarChar}
                        </div>
                        <div class="shop-card-info">
                            <div class="shop-card-header-line">
                                <h3 class="shop-card-title" onclick="window.location.href='${shopProfileUrl}'">
                                    ${escapeHtml(shop.name)}
                                </h3>
                                <span class="badge-verified-artisan">
                                    <i class="fa-solid fa-circle-check"></i> Nghệ nhân chính thức
                                </span>
                            </div>
                            <div class="shop-card-specialty">
                                <i class="fa-solid fa-gem"></i> ${escapeHtml(shop.specialty || 'Thủ công mỹ nghệ')}
                            </div>
                            <div class="shop-card-stats">
                                <span class="star-rating"><i class="fa-solid fa-star"></i> ${shop.rating || 4.9} (${shop.reviewsCount || 100}+)</span>
                                <span>•</span>
                                <span><i class="fa-solid fa-box-open"></i> ${shop.productCount || 3} tác phẩm</span>
                                <span>•</span>
                                <span><i class="fa-solid fa-wand-magic-sparkles"></i> ${shop.customOrdersCount || 50}+ đơn Custom</span>
                            </div>
                        </div>
                    </div>

                    <!-- Body: Tiểu sử + Ảnh sản phẩm preview -->
                    <div class="shop-card-body">
                        <p class="shop-card-intro">
                            ${escapeHtml(shop.introduction || 'Xưởng chế tác thủ công độc bản, mang đến những tác phẩm trang sức tinh tế và cá nhân hóa.')}
                        </p>

                        <div class="shop-products-preview">
                            <div class="preview-title">
                                <span>Tác phẩm tiêu biểu</span>
                                <span style="font-size: 0.72rem; color: #425B9A; cursor: pointer;" onclick="window.location.href='${shopProfileUrl}'">Xem tất cả →</span>
                            </div>
                            <div class="preview-thumbs-grid">
                                ${thumbsHtml}
                            </div>
                        </div>
                    </div>

                    <!-- Footer: Nút Theo dõi + Ghé thăm gian hàng -->
                    <div class="shop-card-footer">
                        <button type="button" class="btn-follow-shop ${isFollowed ? 'is-following' : ''}" data-shop-name="${escapeHtml(shop.name)}">
                            <i class="fa-${isFollowed ? 'solid' : 'regular'} fa-heart" style="${isFollowed ? 'color:#dc2626;' : ''}"></i>
                            <span class="btn-follow-text">${isFollowed ? 'Đã theo dõi' : 'Theo dõi xưởng'}</span>
                        </button>
                        <a href="${shopProfileUrl}" class="btn-visit-shop">
                            <i class="fa-solid fa-store"></i> Ghé thăm gian hàng
                        </a>
                    </div>
                </div>
            `;
        });

        shopsGrid.innerHTML = html;

        // Gắn sự kiện nút theo dõi
        document.querySelectorAll('.btn-follow-shop').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shopName = btn.dataset.shopName;
                const nowFollowed = toggleFollowShop(shopName);
                btn.classList.toggle('is-following', nowFollowed);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('.btn-follow-text');
                if (nowFollowed) {
                    icon.className = 'fa-solid fa-heart';
                    icon.style.color = '#dc2626';
                    text.textContent = 'Đã theo dõi';
                } else {
                    icon.className = 'fa-regular fa-heart';
                    icon.style.color = '';
                    text.textContent = 'Theo dõi xưởng';
                }
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 4. Gắn sự kiện Tìm kiếm, Lọc Pill & Sắp xếp
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentKeyword = e.target.value.trim().toLowerCase();
            if (btnClearSearch) {
                btnClearSearch.style.display = currentKeyword ? 'block' : 'none';
            }
            applyFilterAndRender();
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentKeyword = '';
            btnClearSearch.style.display = 'none';
            applyFilterAndRender();
        });
    }

    specialtyPills.forEach(pill => {
        pill.addEventListener('click', () => {
            specialtyPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentSpecialty = pill.dataset.specialty || 'ALL';
            applyFilterAndRender();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilterAndRender();
        });
    }
});

