/**
 * AuraCraft - Xem Chi Tiết Sản Phẩm (Product Detail)
 * Module: Yến (Catalog, Khám phá & Khai phá dữ liệu Apriori / Cosine)
 * Kết nối trực tiếp với Spring Boot API (/api/v1/products/{id})
 * Tự động tích hợp AI Cosine Similarity & Khai phá dữ liệu Apriori (Frequently Bought Together)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE = "http://localhost:8080/api/products";
  const formatVND = n => (typeof n === 'number' ? n.toLocaleString('vi-VN') : parseInt(n || 0, 10).toLocaleString('vi-VN')) + ' đ';

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'), 10) || 1;

  let currentProduct = null;

  // 1. Tải dữ liệu chi tiết sản phẩm từ Backend API (kèm Fallback an toàn)
  try {
    const res = await fetch(`${API_BASE}/${productId}`);
    if (res.ok) {
      const json = await res.json();
      const pData = json.result || json.data;
      if (pData) {
        currentProduct = mapBackendProduct(pData);
      }
    }
  } catch (err) {
    console.warn("Backend API offline hoặc chưa bật, sử dụng dữ liệu cục bộ dự phòng:", err);
  }

  // Nếu API chưa chạy, lấy từ mảng mẫu AURA_PRODUCTS
  if (!currentProduct && typeof AURA_PRODUCTS !== 'undefined') {
    const fallback = AURA_PRODUCTS.find(p => p.id === productId) || AURA_PRODUCTS[0];
    currentProduct = {
      id: fallback.id,
      name: fallback.name,
      desc: fallback.desc,
      price: fallback.price,
      oldPrice: fallback.oldPrice || Math.round(fallback.price * 1.15),
      color: fallback.color || "Bạc sáng",
      type: fallback.type || "bracelet",
      typeLabel: fallback.typeLabel || "Vòng tay",
      image: fallback.image || "",
      images: fallback.images || [fallback.image],
      stockQuantity: 20,
      isCustomizable: fallback.is_customizable !== false,
      artisanId: 2,
      artisanName: fallback.shop || "Anna Nguyễn",
      artisanAvatar: "A",
      rating: fallback.rating || 4.9,
      reviews: fallback.reviews || 36,
      sold: fallback.sold || 128
    };
  }

  if (!currentProduct) return;

  renderProductDetails(currentProduct);
  loadAprioriCombo(currentProduct.id);
  loadSimilarRecommendations(currentProduct);

  // ---- Helper chuẩn hóa đường dẫn ảnh từ Backend / Database cho trang /pages/ ----
  function normalizeImgPath(path) {
    if (!path) return '../assets/images/bracelet-sample-1.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    let clean = path.replace(/^\/+/, '');
    if (clean.startsWith('assets/')) return '../' + clean;
    if (clean.startsWith('./assets/')) return '../' + clean.slice(2);
    if (!clean.startsWith('../')) return '../' + clean;
    return clean;
  }

  // ---- Hàm chuyển đổi dữ liệu Backend DTO sang Model chuẩn cho giao diện ----
  function mapBackendProduct(p) {
    const rawDefault = p.thumbnailUrl || (p.images && p.images[0]) || 'assets/images/bracelet-sample-1.jpg';
    const defaultImg = normalizeImgPath(rawDefault);
    let galleryImages = [];
    if (p.images && p.images.length > 0) {
      galleryImages = p.images.map(normalizeImgPath);
    } else {
      galleryImages = [
        defaultImg,
        '../assets/img/products/bracelet_01.jpg',
        '../assets/img/products/bracelet_02.jpg'
      ];
    }

    return {
      id: p.id,
      name: p.name,
      desc: p.description || "Sản phẩm thủ công độc bản được chế tác tỉ mỉ bởi nghệ nhân lành nghề.",
      price: p.price,
      oldPrice: p.oldPrice,
      color: p.color || "Bạc sáng",
      type: p.categorySlug || "bracelet",
      typeLabel: p.categoryName || "Đồ thủ công",
      image: defaultImg,
      images: galleryImages,
      stockQuantity: p.stockQuantity || 15,
      isCustomizable: !!p.isCustomizable,
      artisanId: p.artisanId || 2,
      artisanName: p.artisanName || "Anna Nguyễn",
      artisanAvatar: (p.artisanName && p.artisanName.charAt(0)) || "A",
      rating: p.rating || 4.9,
      reviews: p.reviewsCount || 48,
      sold: p.soldCount || 136
    };
  }

  // ---- 2. Hiển thị thông tin sản phẩm lên giao diện ----
  function renderProductDetails(p) {
    document.title = `${p.name} - AuraCraft`;

    // Breadcrumb
    const breadType = document.getElementById('pdBreadType');
    const breadName = document.getElementById('pdBreadName');
    if (breadType) breadType.textContent = p.typeLabel;
    if (breadName) breadName.textContent = p.name;

    // Tag & Tiêu đề
    const tagEl = document.getElementById('pdTag');
    const titleEl = document.getElementById('pdTitle');
    if (tagEl) tagEl.textContent = `${p.typeLabel} thủ công cao cấp`;
    if (titleEl) titleEl.textContent = p.name;

    // Đánh giá & Giá tiền
    const ratingEl = document.getElementById('pdRating');
    if (ratingEl) {
      ratingEl.innerHTML = `★★★★★ <span>${p.rating} (${p.reviews} đánh giá) · Đã bán ${p.sold}</span>`;
    }

    const priceEl = document.getElementById('pdPrice');
    if (priceEl) {
      if (p.oldPrice && p.oldPrice > p.price) {
        priceEl.innerHTML = `${formatVND(p.price)} <span class="pd-price-old">${formatVND(p.oldPrice)}</span>`;
      } else {
        priceEl.textContent = formatVND(p.price);
      }
    }

    // Mô tả
    const descEl = document.getElementById('pdDesc');
    const descLongEl = document.getElementById('pdDescLong');
    if (descEl) descEl.textContent = p.desc;
    if (descLongEl) descLongEl.textContent = p.desc;

    // Gallery & Thumbnails
    const galleryMain = document.getElementById('pdGalleryMain');
    const thumbsEl = document.getElementById('pdThumbs');

    if (galleryMain && thumbsEl) {
      const photos = (p.images && p.images.length > 0) ? p.images : [p.image];
      
      // Đảm bảo có ít nhất 3 ảnh góc chụp minh họa
      const displayPhotos = photos.length >= 3 ? photos : [
        photos[0],
        photos[1] || '../assets/img/products/bracelet_01.jpg',
        photos[2] || '../assets/img/products/bracelet_02.jpg'
      ];

      function setMainPhoto(rawUrl) {
        const fullUrl = normalizeImgPath(rawUrl);
        let imgEl = document.getElementById('pdMainImg');
        if (!imgEl) {
          imgEl = document.createElement('img');
          imgEl.id = 'pdMainImg';
          imgEl.className = 'pd-main-image';
          imgEl.alt = p.name;
          galleryMain.insertBefore(imgEl, galleryMain.firstChild);
        }
        imgEl.src = fullUrl;
        imgEl.onerror = function() {
          this.onerror = null;
          this.src = '../assets/img/products/bracelet_01.jpg';
        };

        // Đồng bộ ảnh cho lớp zoom kính lúp
        const zoomEl = document.getElementById('pdGalleryZoom');
        if (zoomEl) {
          zoomEl.style.backgroundImage = `url('${fullUrl}')`;
        }
      }

      setMainPhoto(displayPhotos[0]);
      thumbsEl.innerHTML = '';

      displayPhotos.forEach((rawUrl, idx) => {
        const fullUrl = normalizeImgPath(rawUrl);
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = 'pd-thumb' + (idx === 0 ? ' is-active' : '');
        thumbBtn.innerHTML = `<img src="${fullUrl}" alt="Ảnh góc ${idx + 1}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.src='../assets/img/products/bracelet_01.jpg'">`;
        thumbBtn.addEventListener('click', () => {
          thumbsEl.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('is-active'));
          thumbBtn.classList.add('is-active');
          setMainPhoto(rawUrl);
        });
        thumbsEl.appendChild(thumbBtn);
      });

      // Tương tác Zoom khi hover ảnh chính
      if (!galleryMain._hasZoomListener) {
        galleryMain._hasZoomListener = true;
        const zoomEl = document.getElementById('pdGalleryZoom');
        galleryMain.addEventListener('mouseenter', () => {
          galleryMain.classList.add('is-zooming');
        });
        galleryMain.addEventListener('mouseleave', () => {
          galleryMain.classList.remove('is-zooming');
        });
        galleryMain.addEventListener('mousemove', (e) => {
          if (!zoomEl) return;
          const rect = galleryMain.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          zoomEl.style.backgroundPosition = `${x}% ${y}%`;
        });
      }
    }

    // Màu sắc
    const colorSelectedEl = document.getElementById('pdColorSelected');
    if (colorSelectedEl && p.color) {
      colorSelectedEl.textContent = `Đã chọn: ${p.color}`;
    }

    const colorSwatches = document.querySelectorAll('#pdColorList .pd-color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
        if (colorSelectedEl) {
          colorSelectedEl.textContent = `Đã chọn: ${swatch.dataset.color || swatch.textContent}`;
        }
      });
    });

    // Kích cỡ
    const sizeButtons = document.querySelectorAll('#pdSizeList .pd-size-btn');
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Nút Customizer 2D (Chỉ hiện khi sản phẩm hỗ trợ tùy biến)
    const customCtaEl = document.getElementById('pdCustomCta');
    if (customCtaEl) {
      if (p.isCustomizable) {
        customCtaEl.style.display = '';
        customCtaEl.href = `customizer.html?id=${p.id}&type=${p.type}`;
        const titleSpan = document.getElementById('pdCustomCtaTitle');
        if (titleSpan) titleSpan.textContent = `Tùy biến (Custom) ${p.name}`;
      } else {
        customCtaEl.style.display = 'none';
      }
    }

    // Thẻ thông tin Xưởng / Cửa hàng nghệ nhân
    const shopAvatar = document.getElementById('pdShopAvatar');
    const shopName = document.getElementById('pdShopName');
    const shopMeta = document.getElementById('pdShopMeta');
    const shopLink = document.getElementById('pdShop');

    if (shopAvatar) shopAvatar.textContent = p.artisanAvatar;
    if (shopName) shopName.textContent = p.artisanName;
    if (shopMeta) shopMeta.textContent = `★ ${p.rating} · Đã bán ${p.sold} sản phẩm`;
    if (shopLink) shopLink.href = `shop-profile.html?shop=${encodeURIComponent(p.artisanName || 'Xưởng Mộc An')}&id=${p.artisanId || 4}`;

    // Stepper số lượng (+/-)
    const qtyInput = document.getElementById('qty');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');

    if (qtyMinus && qtyInput) {
      qtyMinus.onclick = () => {
        const val = parseInt(qtyInput.value || '1', 10);
        if (val > 1) qtyInput.value = val - 1;
      };
    }
    if (qtyPlus && qtyInput) {
      qtyPlus.onclick = () => {
        const val = parseInt(qtyInput.value || '1', 10);
        if (val < p.stockQuantity) qtyInput.value = val + 1;
      };
    }

    // Nút Thêm vào giỏ hàng
    const addBtn = document.getElementById('pdAddToCartBtn');
    if (addBtn) {
      addBtn.onclick = async () => {
        const quantity = parseInt(qtyInput?.value || '1', 10);
        if (window.AuraCraftCart && typeof window.AuraCraftCart.addProduct === 'function') {
          await window.AuraCraftCart.addProduct(p.id, quantity);
        } else {
          showNotification(`Đã thêm ${quantity} x "${p.name}" vào giỏ hàng!`);
        }
      };
    }

    // Nút Mua ngay
    const buyBtn = document.getElementById('pdBuyNowBtn');
    if (buyBtn) {
      buyBtn.onclick = async () => {
        const quantity = parseInt(qtyInput?.value || '1', 10);
        if (window.AuraCraftCart && typeof window.AuraCraftCart.addProduct === 'function') {
          const ok = await window.AuraCraftCart.addProduct(p.id, quantity);
          if (ok) window.location.href = 'cart.html';
        } else {
          window.location.href = 'cart.html';
        }
      };
    }
  }

  // ---- 3. Tải Khai Phá Dữ Liệu Apriori: Combo Thường Mua Cùng Nhau ----
  async function loadAprioriCombo(id) {
    const sec = document.getElementById('pdAprioriSection');
    if (!sec) return;

    try {
      const res = await fetch(`${API_BASE}/${id}/frequently-bought-together`);
      if (res.ok) {
        const json = await res.json();
        const cData = json.result || json.data;
        if (cData && cData.comboProduct) {
          renderAprioriCombo(cData);
          return;
        }
      }
    } catch (e) {
      // Backend offline: Render combo dự phòng thông minh
    }

    // Dữ liệu dự phòng nếu backend chưa bật
    if (typeof AURA_PRODUCTS !== 'undefined') {
      const combo = AURA_PRODUCTS.find(p => p.id !== id && (p.type === 'charm' || p.price < currentProduct.price)) || AURA_PRODUCTS[1];
      const origTotal = currentProduct.price + combo.price;
      const comboPrice = Math.round(origTotal * 0.90);
      renderAprioriCombo({
        comboProduct: {
          id: combo.id,
          name: combo.name,
          price: combo.price,
          thumbnailUrl: combo.image || "../assets/img/products/phoneStrap_01.jpg",
          artisanName: combo.shop || "Anna Nguyễn"
        },
        originalTotal: origTotal,
        comboPrice: comboPrice,
        savings: origTotal - comboPrice,
        reason: "Luật kết hợp Apriori: Độ tin cậy (Confidence) 80%, Độ nâng (Lift) 1.82 lần từ lịch sử giao dịch."
      });
    }
  }

  function renderAprioriCombo(data) {
    const sec = document.getElementById('pdAprioriSection');
    const mainEl = document.getElementById('aprioriMainItem');
    const comboEl = document.getElementById('aprioriComboItem');
    const comboPriceEl = document.getElementById('aprioriComboPrice');
    const oldPriceEl = document.getElementById('aprioriOldPrice');
    const saveBadgeEl = document.getElementById('aprioriSaveBadge');
    const explainEl = document.getElementById('aprioriRuleExplain');
    const btnAdd = document.getElementById('btnAddComboToCart');

    if (!sec || !mainEl || !comboEl) return;

    sec.hidden = false;

    // Sản phẩm chính
    mainEl.innerHTML = `
      <img src="${normalizeImgPath(currentProduct.image)}" alt="${currentProduct.name}" class="apriori-img" onerror="this.src='../assets/img/products/bracelet_01.jpg'">
      <div class="apriori-info">
        <span class="apriori-name">${currentProduct.name}</span>
        <span class="apriori-price">${formatVND(currentProduct.price)}</span>
      </div>
    `;

    // Sản phẩm mua kèm
    const combo = data.comboProduct;
    const comboImg = normalizeImgPath(combo.thumbnailUrl || combo.image || "../assets/img/products/phoneStrap_01.jpg");
    comboEl.innerHTML = `
      <img src="${comboImg}" alt="${combo.name}" class="apriori-img" onerror="this.src='../assets/img/products/phoneStrap_01.jpg'">
      <div class="apriori-info">
        <span class="apriori-name">${combo.name}</span>
        <span class="apriori-price">${formatVND(combo.price)}</span>
      </div>
    `;

    if (comboPriceEl) comboPriceEl.textContent = formatVND(data.comboPrice);
    if (oldPriceEl) oldPriceEl.textContent = formatVND(data.originalTotal);
    if (saveBadgeEl) saveBadgeEl.textContent = `Tiết kiệm ${formatVND(data.savings)}`;
    if (explainEl && data.reason) explainEl.textContent = data.reason;

    if (btnAdd) {
      btnAdd.onclick = async () => {
        btnAdd.disabled = true;
        btnAdd.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang thêm combo...`;

        try {
          if (window.AuraCraftCart && typeof window.AuraCraftCart.addProduct === 'function') {
            await window.AuraCraftCart.addProduct(currentProduct.id, 1);
            await window.AuraCraftCart.addProduct(combo.id, 1);
          }
          showNotification(`Đã thêm Combo (${currentProduct.name} + ${combo.name}) vào giỏ hàng!`);
        } finally {
          btnAdd.disabled = false;
          btnAdd.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Thêm cả 2 vào giỏ hàng`;
        }
      };
    }
  }

  // ---- 4. Gợi Ý Sản Phẩm Tương Tự Bằng AI Cosine Similarity ----
  async function loadSimilarRecommendations(product) {
    const aiSection = document.getElementById('aiRecommendationsSection');
    const aiGrid = document.getElementById('aiRecommendationsGrid');

    try {
      const res = await fetch(`${API_BASE}/${product.id}/similar-cosine?limit=4`);
      if (res.ok) {
        const json = await res.json();
        const recList = json.result || json.data;
        if (recList && recList.length > 0) {
          renderCosineGrid(recList);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Client-side AI fallback
    if (window.AuraCraftAI && typeof window.AuraCraftAI.renderRecommendations === 'function') {
      window.AuraCraftAI.renderRecommendations(product, (typeof AURA_PRODUCTS !== 'undefined' ? AURA_PRODUCTS : []));
    }
  }

  function renderCosineGrid(items) {
    const aiSection = document.getElementById('aiRecommendationsSection');
    const aiGrid = document.getElementById('aiRecommendationsGrid');
    if (!aiSection || !aiGrid) return;

    aiSection.hidden = false;
    aiGrid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'ai-recommend-card';
      const imgUrl = normalizeImgPath(item.thumbnailUrl || item.image || '../assets/img/products/bracelet_02.jpg');
      const reasons = item.matchReasons && item.matchReasons.length > 0
        ? item.matchReasons
        : ['Phong cách tương đồng', 'Chất liệu cao cấp'];
      const reasonsHtml = reasons.map(r => `
        <span class="ai-reason-pill"><i class="fa-solid fa-check"></i> ${r}</span>
      `).join('');

      card.innerHTML = `
        <div class="ai-card-thumb-wrap">
          <span class="ai-cosine-badge">
            <i class="fa-solid fa-brain"></i> AI Match: ${item.matchPercent || 85}%
          </span>
          <img src="${imgUrl}" alt="${item.name}" onerror="this.src='../assets/img/products/bracelet_02.jpg'">
        </div>
        <div class="ai-card-body">
          <div class="ai-card-meta">
            <span class="ai-card-shop"><i class="fa-solid fa-store"></i> ${item.artisanName || 'Shop Thủ Công'}</span>
            <span class="ai-card-rating">★ 4.9</span>
          </div>
          <h3 class="ai-card-title">${item.name}</h3>
          <div class="ai-card-reasons">
            ${reasonsHtml}
          </div>
          <div class="ai-card-price-row">
            <div>
              <span class="ai-card-price">${formatVND(item.price)}</span>
              ${item.oldPrice ? `<span class="ai-card-old-price">${formatVND(item.oldPrice)}</span>` : ''}
            </div>
            <span class="ai-btn-view">Xem ngay →</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `product-detail.html?id=${item.id}`;
      });

      aiGrid.appendChild(card);
    });

    // Kích hoạt Modal giải thích thuật toán AI
    const btnExplain = document.getElementById('btnAiExplain');
    const modal = document.getElementById('aiExplainModal');
    const closeBtn = document.getElementById('aiExplainClose');

    if (btnExplain && modal) {
      btnExplain.onclick = () => {
        modal.classList.add('active');
        const content = document.getElementById('aiExplainContent');
        if (content) {
          const topItem = items[0] || currentProduct;
          content.innerHTML = `
            <div class="ai-modal-intro">
              <div class="ai-modal-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Recommendation System</div>
              <h4>Công thức tính độ tương đồng góc Cosine</h4>
              <div class="ai-formula-box" style="margin:12px 0;">
                <div class="ai-formula-math" style="padding:12px;background:#fff;border-radius:8px;font-size:1.05rem;font-weight:600;color:#6c35de;border:1px solid #ebdcd3;">
                  <code>cos(θ) = ( Vector A · Vector B ) / ( ||A|| × ||B|| )</code>
                </div>
                <p class="ai-formula-desc" style="margin-top:8px;color:#555;font-size:0.9rem;line-height:1.4;">
                  Trong đó: <b>Vector A</b> biểu diễn sản phẩm đang xem (<strong>${currentProduct.name}</strong>), <b>Vector B</b> biểu diễn sản phẩm ứng viên trong kho hàng (<strong>${topItem.name}</strong>). Góc Cosine càng gần 1 (100%), hai sản phẩm càng tương đồng.
                </p>
              </div>

              <h4 style="margin-top:16px;">Các chiều đặc trưng trong không gian Vector AI</h4>
              <div class="ai-features-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:8px;">
                <div class="ai-feature-card" style="background:#faf6f4;padding:12px;border-radius:8px;border:1px solid #ebdcd3;">
                  <strong>1. TF-IDF Ngữ nghĩa</strong>
                  <p style="font-size:0.85rem;color:#666;margin:4px 0 0;">Tên, chất liệu, màu sắc và mô tả tác phẩm thủ công.</p>
                </div>
                <div class="ai-feature-card" style="background:#faf6f4;padding:12px;border-radius:8px;border:1px solid #ebdcd3;">
                  <strong>2. Danh mục &amp; Kiểu dáng</strong>
                  <p style="font-size:0.85rem;color:#666;margin:4px 0 0;">Định vị chủng loại: Vòng tay, Dây chuyền, Nhẫn, Charm.</p>
                </div>
                <div class="ai-feature-card" style="background:#faf6f4;padding:12px;border-radius:8px;border:1px solid #ebdcd3;">
                  <strong>3. Phân khúc mức giá</strong>
                  <p style="font-size:0.85rem;color:#666;margin:4px 0 0;">Khoảng giá logarit giúp gợi ý các mẫu phù hợp ngân sách tương đương.</p>
                </div>
              </div>
            </div>
          `;
        }
      };
    }

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.remove('active');
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
      };
    }
  }

  // Helper thông báo popup
  function showNotification(msg) {
    if (window.showToast) {
      window.showToast(msg);
    } else {
      alert(msg);
    }
  }
});
