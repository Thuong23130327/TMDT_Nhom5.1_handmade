// ============================================================
// AuraCraft - home.js (Render Sản phẩm mới nhất & Xem nhiều nhất)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AURA_PRODUCTS === "undefined") return;

  const formatVND = (n) => Number(n).toLocaleString("vi-VN") + "đ";
  const resolveImg = (img) => {
    if (!img) return 'assets/img/products/bracelet_01.jpg';
    if (!window.location.pathname.includes('/pages/') && img.startsWith('../')) {
      return img.replace(/^\.\.\//, '');
    }
    return img;
  };

  // 1. Render Sản phẩm mới nhất (sắp xếp theo id giảm dần / mới ra mắt)
  const latestContainer = document.getElementById("latestProductsContainer");
  if (latestContainer) {
    const latestList = [...AURA_PRODUCTS]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);

    latestContainer.innerHTML = latestList.map(p => `
      <div class="home-product-card" onclick="window.location.href='pages/product-detail.html?id=${p.id}'">
        <div class="home-card-thumb-wrap">
          <span class="card-badge badge-new"><i class="fa-solid fa-sparkles"></i> Mới</span>
          <img src="${resolveImg(p.image)}" alt="${p.name}" onerror="this.src='https://placehold.co/300x220/f5ece8/7b5144?text=AuraCraft'">
        </div>
        <div class="home-card-body">
          <span class="home-card-shop"><i class="fa-solid fa-store"></i> ${p.shop}</span>
          <h3 class="home-card-title">${p.name}</h3>
          <div class="home-card-meta">
            <span class="home-card-rating">★ ${p.rating}</span>
            <span>Đã bán ${p.sold}</span>
          </div>
          <div class="home-card-price-row">
            <div>
              <span class="home-card-price">${formatVND(p.price)}</span>
              ${p.oldPrice ? `<span class="home-card-old-price">${formatVND(p.oldPrice)}</span>` : ""}
            </div>
            <span style="font-size:13px;color:var(--primary-blue);font-weight:700;">Chi tiết →</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  // 2. Render Sản phẩm được xem nhiều nhất (sắp xếp theo views giảm dần)
  const mostViewedContainer = document.getElementById("mostViewedProductsContainer");
  if (mostViewedContainer) {
    const mostViewedList = [...AURA_PRODUCTS]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);

    mostViewedContainer.innerHTML = mostViewedList.map(p => `
      <div class="home-product-card" onclick="window.location.href='pages/product-detail.html?id=${p.id}'">
        <div class="home-card-thumb-wrap">
          <span class="card-badge badge-hot"><i class="fa-solid fa-fire"></i> HOT</span>
          <span class="card-views-tag"><i class="fa-solid fa-eye"></i> ${(p.views || 1000).toLocaleString('vi-VN')}</span>
          <img src="${resolveImg(p.image)}" alt="${p.name}" onerror="this.src='https://placehold.co/300x220/f5ece8/7b5144?text=AuraCraft'">
        </div>
        <div class="home-card-body">
          <span class="home-card-shop"><i class="fa-solid fa-store"></i> ${p.shop}</span>
          <h3 class="home-card-title">${p.name}</h3>
          <div class="home-card-meta">
            <span class="home-card-rating">★ ${p.rating} (${p.reviews || 0})</span>
            <span>Đã bán ${p.sold}</span>
          </div>
          <div class="home-card-price-row">
            <div>
              <span class="home-card-price">${formatVND(p.price)}</span>
              ${p.oldPrice ? `<span class="home-card-old-price">${formatVND(p.oldPrice)}</span>` : ""}
            </div>
            <span style="font-size:13px;color:#c5221f;font-weight:700;">Xem ngay →</span>
          </div>
        </div>
      </div>
    `).join("");
  }
});
