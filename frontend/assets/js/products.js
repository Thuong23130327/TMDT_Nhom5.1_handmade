/**
 * AuraCraft - Quản Lý Danh Sách & Bộ Lọc Sản Phẩm Đa Tiêu Chí
 * Module: Yến (Catalog, Danh mục, Lọc theo Loại, Thương hiệu/Shop, Giá, Đánh giá, Sắp xếp)
 * Tính năng nổi bật:
 *  - Bộ lọc Dropdown Multi-Select (chọn được NHIỀU loại, NHIỀU shop cùng lúc)
 *  - Gọn gàng, menu thả xuống có scroll và nút Chọn tất cả / Bỏ chọn
 *  - Tự động đóng khi click ra ngoài
 *  - Mặc định: Hiển thị TOÀN BỘ sản phẩm, bộ lọc clear sạch sẽ
 *  - Nút Xóa lọc khôi phục trạng thái ban đầu ngay lập tức
 */

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = "http://localhost:8080/api/products";
    const productGrid = document.getElementById('productGridContainer');
    const sortSelect = document.getElementById('sort-select');
    const btnClearFilters = document.getElementById('btn-clear-filters');
    const searchInput = document.getElementById('product-search-input');
    const btnSearch = document.getElementById('btn-product-search');
    const productCountEl = document.getElementById('product-count-display');

    // Các thành phần Multi-Select Loại sản phẩm
    const groupCat = document.getElementById('group-category');
    const boxCat = document.getElementById('box-category');
    const menuCat = document.getElementById('menu-category');
    const textCat = document.getElementById('text-category');
    const badgeCat = document.getElementById('badge-category');
    const listCat = document.getElementById('list-category');
    const btnSelectAllCat = document.getElementById('btn-select-all-cat');
    const btnClearCat = document.getElementById('btn-clear-cat');

    // Các thành phần Multi-Select Thương hiệu / Shop
    const groupBrand = document.getElementById('group-brand');
    const boxBrand = document.getElementById('box-brand');
    const menuBrand = document.getElementById('menu-brand');
    const textBrand = document.getElementById('text-brand');
    const badgeBrand = document.getElementById('badge-brand');
    const listBrand = document.getElementById('list-brand');
    const btnSelectAllBrand = document.getElementById('btn-select-all-brand');
    const btnClearBrand = document.getElementById('btn-clear-brand');

    // Bộ lọc Giá & Đánh giá
    const filterPriceSelect = document.getElementById('filter-price');
    const minPriceInput = document.getElementById('price-min-input');
    const maxPriceInput = document.getElementById('price-max-input');
    const btnApplyPrice = document.getElementById('btn-apply-price');
    const filterRatingSelect = document.getElementById('filter-rating');

    const formatVND = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') : parseInt(n || 0, 10).toLocaleString('vi-VN')) + ' đ';

    function normalizeImgPath(path) {
        if (!path) return '../assets/img/products/bracelet_01.jpg';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
        let clean = path.replace(/^\/+/, '');
        if (clean.startsWith('assets/')) return '../' + clean;
        if (clean.startsWith('./assets/')) return '../' + clean.slice(2);
        if (!clean.startsWith('../')) return '../' + clean;
        return clean;
    }

    let allProducts = [];

    // ==========================================
    // 1. TẢI DỮ LIỆU SẢN PHẨM (BACKEND + MOCK)
    // ==========================================
    await loadProducts();

    async function loadProducts() {
        if (productGrid) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 0;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #425B9A;"></i>
                    <p style="margin-top: 10px; color: #666;">Đang tải tác phẩm thủ công...</p>
                </div>
            `;
        }

        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const json = await res.json();
                const items = json.result || json.data;
                if (Array.isArray(items) && items.length > 0) {
                    allProducts = items.map(mapBackendProduct);
                }
            }
        } catch (e) {
            console.warn("Backend API offline hoặc chưa bật, sử dụng dữ liệu phong phú tích hợp sẵn:", e);
        }

        // Dữ liệu phong phú dự phòng (16 sản phẩm độc bản đầy đủ thể loại)
        if (allProducts.length === 0 && typeof AURA_PRODUCTS !== 'undefined') {
            allProducts = AURA_PRODUCTS.map(p => ({
                id: p.id,
                name: p.name,
                categorySlug: p.type || 'vong-tay',
                categoryName: p.typeLabel || 'Vòng tay',
                artisanName: p.shop || 'Xưởng Mộc An',
                price: p.price,
                oldPrice: p.oldPrice,
                rating: p.rating || 4.8,
                reviews: p.reviews || 45,
                sold: p.sold || 120,
                thumbnailUrl: normalizeImgPath(p.image || '../assets/img/products/bracelet_01.jpg'),
                isCustomizable: p.is_customizable !== false
            }));
        }

        // Đọc tham số URL nếu có (ví dụ từ trang chủ sang)
        checkUrlParams();

        // MẶC ĐỊNH: Hiển thị TOÀN BỘ sản phẩm ngay lập tức
        applyFilterAndRender();
    }

    function mapBackendProduct(p) {
        return {
            id: p.id,
            name: p.name,
            categorySlug: p.categorySlug || 'vong-tay-lac',
            categoryName: p.categoryName || 'Đồ thủ công',
            artisanId: p.artisanId,
            artisanName: p.artisanName || 'Nghệ nhân AuraCraft',
            price: Number(p.price) || 0,
            oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
            rating: p.rating || 4.9,
            reviews: p.reviewsCount || 48,
            sold: p.soldCount || 136,
            thumbnailUrl: normalizeImgPath(p.thumbnailUrl || (p.images && p.images[0])),
            isCustomizable: !!p.isCustomizable
        };
    }

    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category');
        const search = urlParams.get('search');
        const sort = urlParams.get('sort');

        if (cat && listCat) {
            const cbs = listCat.querySelectorAll('input[type="checkbox"]');
            cbs.forEach(cb => {
                if (cb.value.toLowerCase().includes(cat.toLowerCase())) {
                    cb.checked = true;
                }
            });
            updateCategoryDisplay();
        }

        if (search && searchInput) {
            searchInput.value = search.trim();
        }

        if (sort && sortSelect) {
            sortSelect.value = sort;
        }
    }

    // ==========================================
    // 2. XỬ LÝ DROPDOWN MULTI-SELECT GỌN GÀNG
    // ==========================================

    // Mở / Đóng dropdown Loại sản phẩm
    if (boxCat && menuCat) {
        boxCat.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuCat.classList.contains('is-show');
            closeAllDropdowns();
            if (!isOpen) {
                menuCat.classList.add('is-show');
                boxCat.classList.add('is-active');
            }
        });
    }

    // Mở / Đóng dropdown Thương hiệu / Shop
    if (boxBrand && menuBrand) {
        boxBrand.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuBrand.classList.contains('is-show');
            closeAllDropdowns();
            if (!isOpen) {
                menuBrand.classList.add('is-show');
                boxBrand.classList.add('is-active');
            }
        });
    }

    // Đóng tất cả dropdown
    function closeAllDropdowns() {
        if (menuCat) menuCat.classList.remove('is-show');
        if (boxCat) boxCat.classList.remove('is-active');
        if (menuBrand) menuBrand.classList.remove('is-show');
        if (boxBrand) boxBrand.classList.remove('is-active');
    }

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (groupCat && !groupCat.contains(e.target)) {
            if (menuCat) menuCat.classList.remove('is-show');
            if (boxCat) boxCat.classList.remove('is-active');
        }
        if (groupBrand && !groupBrand.contains(e.target)) {
            if (menuBrand) menuBrand.classList.remove('is-show');
            if (boxBrand) boxBrand.classList.remove('is-active');
        }
    });

    // Ngăn chặn đóng menu khi bấm vào trong menu
    if (menuCat) menuCat.addEventListener('click', (e) => e.stopPropagation());
    if (menuBrand) menuBrand.addEventListener('click', (e) => e.stopPropagation());

    // --- Cập nhật hiển thị text & badge cho Loại sản phẩm ---
    function updateCategoryDisplay() {
        if (!listCat || !textCat) return;
        const checkedList = Array.from(listCat.querySelectorAll('input[type="checkbox"]:checked'));
        const count = checkedList.length;

        if (count === 0) {
            textCat.textContent = '-- Tất cả loại sản phẩm --';
            if (badgeCat) badgeCat.style.display = 'none';
        } else if (count === 1) {
            const labelText = checkedList[0].parentElement.textContent.trim();
            textCat.textContent = labelText;
            if (badgeCat) {
                badgeCat.textContent = '1';
                badgeCat.style.display = 'inline-block';
            }
        } else {
            textCat.textContent = `Đã chọn (${count}) loại`;
            if (badgeCat) {
                badgeCat.textContent = count;
                badgeCat.style.display = 'inline-block';
            }
        }
    }

    // Sự kiện checkbox Loại sản phẩm
    if (listCat) {
        listCat.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                updateCategoryDisplay();
                applyFilterAndRender();
            });
        });
    }

    // Nút Chọn tất cả / Bỏ chọn Loại sản phẩm
    if (btnSelectAllCat && listCat) {
        btnSelectAllCat.addEventListener('click', () => {
            listCat.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateCategoryDisplay();
            applyFilterAndRender();
        });
    }
    if (btnClearCat && listCat) {
        btnClearCat.addEventListener('click', () => {
            listCat.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateCategoryDisplay();
            applyFilterAndRender();
        });
    }

    // --- Cập nhật hiển thị text & badge cho Thương hiệu / Shop ---
    function updateBrandDisplay() {
        if (!listBrand || !textBrand) return;
        const checkedList = Array.from(listBrand.querySelectorAll('input[type="checkbox"]:checked'));
        const count = checkedList.length;

        if (count === 0) {
            textBrand.textContent = '-- Tất cả thương hiệu / shop --';
            if (badgeBrand) badgeBrand.style.display = 'none';
        } else if (count === 1) {
            const labelText = checkedList[0].parentElement.textContent.trim();
            textBrand.textContent = labelText;
            if (badgeBrand) {
                badgeBrand.textContent = '1';
                badgeBrand.style.display = 'inline-block';
            }
        } else {
            textBrand.textContent = `Đã chọn (${count}) shop`;
            if (badgeBrand) {
                badgeBrand.textContent = count;
                badgeBrand.style.display = 'inline-block';
            }
        }
    }

    // Sự kiện checkbox Thương hiệu / Shop
    if (listBrand) {
        listBrand.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                updateBrandDisplay();
                applyFilterAndRender();
            });
        });
    }

    // Nút Chọn tất cả / Bỏ chọn Thương hiệu / Shop
    if (btnSelectAllBrand && listBrand) {
        btnSelectAllBrand.addEventListener('click', () => {
            listBrand.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateBrandDisplay();
            applyFilterAndRender();
        });
    }
    if (btnClearBrand && listBrand) {
        btnClearBrand.addEventListener('click', () => {
            listBrand.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateBrandDisplay();
            applyFilterAndRender();
        });
    }

    // ==========================================
    // 3. THUẬT TOÁN LỌC ĐA TIÊU CHÍ (MULTI-SELECT)
    // ==========================================
    function applyFilterAndRender() {
        // 1. Lấy mảng các Loại đã chọn
        const checkedCatBoxes = listCat ? Array.from(listCat.querySelectorAll('input[type="checkbox"]:checked')) : [];
        const selectedCatValues = checkedCatBoxes.map(cb => cb.value.toLowerCase());

        // 2. Lấy mảng các Shop đã chọn
        const checkedBrandBoxes = listBrand ? Array.from(listBrand.querySelectorAll('input[type="checkbox"]:checked')) : [];
        const selectedBrandValues = checkedBrandBoxes.map(cb => cb.value.toLowerCase());

        // 3. Tiêu chí giá & đánh giá & từ khóa
        const selectedPrice = filterPriceSelect ? filterPriceSelect.value.trim() : '';
        const minVal = minPriceInput && minPriceInput.value ? Number(minPriceInput.value) : null;
        const maxVal = maxPriceInput && maxPriceInput.value ? Number(maxPriceInput.value) : null;
        const selectedRating = filterRatingSelect ? parseFloat(filterRatingSelect.value || '0') : 0;
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

        let filtered = allProducts.filter(p => {
            // Lọc theo Loại sản phẩm (Nhiều lựa chọn - OR logic trong nhóm Loại)
            if (selectedCatValues.length > 0) {
                const pCat = ((p.categorySlug || '') + ' ' + (p.categoryName || '') + ' ' + (p.name || '')).toLowerCase();
                const matchAnyCat = selectedCatValues.some(valPattern => {
                    const parts = valPattern.split('|');
                    return parts.some(part => pCat.includes(part));
                });
                if (!matchAnyCat) return false;
            }

            // Lọc theo Thương hiệu / Shop (Nhiều lựa chọn - OR logic trong nhóm Shop)
            if (selectedBrandValues.length > 0) {
                const pShop = ((p.artisanName || '') + ' ' + (p.name || '')).toLowerCase();
                const matchAnyBrand = selectedBrandValues.some(valPattern => {
                    const parts = valPattern.split('|');
                    return parts.some(part => pShop.includes(part));
                });
                if (!matchAnyBrand) return false;
            }

            // Lọc theo Khoảng giá (Dropdown mẫu)
            if (selectedPrice) {
                const [min, max] = selectedPrice.split('-').map(Number);
                if (p.price < min || p.price > max) return false;
            }

            // Lọc theo Khoảng giá tự nhập (Custom min-max)
            if (minVal !== null && p.price < minVal) return false;
            if (maxVal !== null && p.price > maxVal) return false;

            // Lọc theo Đánh giá sao
            if (selectedRating > 0 && p.rating < selectedRating) return false;

            // Lọc theo Từ khóa tìm kiếm
            if (keyword) {
                const matchName = (p.name || '').toLowerCase().includes(keyword);
                const matchShop = (p.artisanName || '').toLowerCase().includes(keyword);
                const matchCat = (p.categoryName || '').toLowerCase().includes(keyword);
                if (!matchName && !matchShop && !matchCat) return false;
            }

            return true;
        });

        // Sắp xếp
        const sortVal = sortSelect ? sortSelect.value : 'default';
        if (sortVal === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortVal === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortVal === 'rating-desc') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortVal === 'popular') {
            filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        } else if (sortVal === 'newest') {
            filtered.sort((a, b) => b.id - a.id);
        }

        renderProducts(filtered);
    }

    // ==========================================
    // 4. HIỂN THỊ DANH SÁCH CARD SẢN PHẨM
    // ==========================================
    function renderProducts(products) {
        if (!productGrid) return;

        if (productCountEl) {
            productCountEl.textContent = `Hiển thị ${products.length} tác phẩm thủ công`;
        }

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px dashed #ebdcd3;">
                    <i class="fa-solid fa-box-open" style="font-size: 3rem; color: #a48c82; margin-bottom: 12px; display: block;"></i>
                    <h3 style="color: #2b1f1d; margin-bottom: 6px;">Không tìm thấy tác phẩm phù hợp</h3>
                    <p style="color: #776c69; margin: 0 0 16px; font-size: 0.9rem;">Vui lòng thử chọn lại loại sản phẩm, khoảng giá hoặc thương hiệu.</p>
                    <button type="button" class="btn btn-outline" id="btn-reset-empty" style="padding: 8px 18px; border-radius: 8px; cursor: pointer; border: 1px solid #425B9A; color: #425B9A; font-weight: 600;">
                        <i class="fa-solid fa-rotate-left"></i> Đặt lại toàn bộ bộ lọc
                    </button>
                </div>
            `;
            const btnResetEmpty = document.getElementById('btn-reset-empty');
            if (btnResetEmpty) btnResetEmpty.onclick = clearAllFilters;
            return;
        }

        productGrid.innerHTML = '';
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const oldPriceHtml = p.oldPrice && p.oldPrice > p.price
                ? `<span class="product-card-old-price">${formatVND(p.oldPrice)}</span>`
                : '';

            const customBadge = p.isCustomizable
                ? `<span class="badge-custom"><i class="fa-solid fa-wand-magic-sparkles"></i> Custom</span>`
                : '';

            card.innerHTML = `
                <div class="product-card-img-wrap">
                    ${customBadge}
                    <img src="${p.thumbnailUrl}" alt="${p.name}" onerror="this.src='../assets/img/products/bracelet_01.jpg'">
                </div>
                <div class="product-card-info">
                    <span class="product-card-cat">${p.categoryName}</span>
                    <h3 class="product-card-title">${p.name}</h3>
                    <div class="product-card-shop" style="cursor: pointer;" title="Xem gian hàng của ${p.artisanName}" onclick="event.stopPropagation(); window.location.href='shop-profile.html?shop=${encodeURIComponent(p.artisanName)}'">
                        <i class="fa-solid fa-store"></i> ${p.artisanName} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.72rem; margin-left: 3px; opacity: 0.7;"></i>
                    </div>
                    <div class="product-card-rating">
                        <i class="fa-solid fa-star"></i>
                        <span style="color: #333; font-weight: 600; margin-left: 2px;">${p.rating}</span>
                        <span style="color: #888; font-size: 0.78rem; margin-left: 4px;">(Đã bán ${p.sold})</span>
                    </div>
                    <div class="product-card-price-row">
                        <span class="product-card-price">${formatVND(p.price)}</span>
                        ${oldPriceHtml}
                    </div>
                </div>
            `;

            // Click card chuyển sang xem chi tiết sản phẩm
            card.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${p.id}`;
            });

            productGrid.appendChild(card);
        });
    }

    // ==========================================
    // 5. ĐẶT LẠI TOÀN BỘ BỘ LỌC (CLEAR ALL)
    // ==========================================
    function clearAllFilters() {
        // Bỏ chọn tất cả checkbox
        if (listCat) listCat.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        if (listBrand) listBrand.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Reset hiển thị text & badge
        updateCategoryDisplay();
        updateBrandDisplay();

        // Đóng các dropdown
        closeAllDropdowns();

        // Reset giá và đánh giá
        if (filterPriceSelect) filterPriceSelect.value = '';
        if (filterRatingSelect) filterRatingSelect.value = '0';
        if (minPriceInput) minPriceInput.value = '';
        if (maxPriceInput) maxPriceInput.value = '';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'default';

        window.history.replaceState({}, document.title, window.location.pathname);
        applyFilterAndRender();
    }

    // ==========================================
    // 6. GẮN SỰ KIỆN TƯƠNG TÁC
    // ==========================================
    if (filterPriceSelect) filterPriceSelect.addEventListener('change', applyFilterAndRender);
    if (filterRatingSelect) filterRatingSelect.addEventListener('change', applyFilterAndRender);
    if (sortSelect) sortSelect.addEventListener('change', applyFilterAndRender);

    if (btnApplyPrice) btnApplyPrice.addEventListener('click', applyFilterAndRender);
    if (btnClearFilters) btnClearFilters.addEventListener('click', clearAllFilters);

    if (searchInput) {
        searchInput.addEventListener('input', applyFilterAndRender);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') applyFilterAndRender();
        });
    }

    if (btnSearch) btnSearch.addEventListener('click', applyFilterAndRender);
});
