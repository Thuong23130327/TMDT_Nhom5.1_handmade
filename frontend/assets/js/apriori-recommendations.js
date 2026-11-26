(function () {
  const API_BASE = window.API_BASE || "http://localhost:8080";

  function formatPrice(val) {
    if (val == null) return "0đ";
    return Number(val).toLocaleString("vi-VN") + "đ";
  }

  function resolveImg(url) {
    if (!url) return "https://placehold.co/200x200/f5ece8/7b5144?text=AuraCraft";
    if (url.startsWith("http") || url.startsWith("../")) return url;
    const isInPages = window.location.pathname.includes("/pages/");
    return isInPages ? "../" + url.replace(/^\/+/, "") : url.replace(/^\/+/, "");
  }

  function getCartProductIds() {
    try {
      const cart = JSON.parse(sessionStorage.getItem("auracraft_cart") || "{}");
      if (Array.isArray(cart.items)) {
        return new Set(cart.items.map((i) => Number(i.productId)));
      }
    } catch (_) {}
    return new Set();
  }

  function ensureModalStyles() {
    if (document.getElementById("apriori-modal-styles")) return;
    const style = document.createElement("style");
    style.id = "apriori-modal-styles";
    style.textContent = `
      .apriori-overlay {
        position: fixed; inset: 0; background: rgba(30, 20, 14, 0.55);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 16px;
      }
      .apriori-modal {
        background: #fff; border-radius: 14px; width: 100%; max-width: 960px;
        max-height: 90vh; display: flex; flex-direction: column;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25); overflow: hidden;
      }
      .apriori-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 22px; background: #faf6f4; border-bottom: 1px solid #eadfce;
      }
      .apriori-modal-title {
        margin: 0; font-size: 18px; font-weight: 700; color: #5a3e36;
      }
      .apriori-modal-close {
        background: none; border: none; font-size: 22px; color: #7b5144;
        cursor: pointer; padding: 4px 8px; border-radius: 6px; line-height: 1;
      }
      .apriori-modal-close:hover { background: #efe4dc; }
      .apriori-modal-body {
        padding: 20px 22px; overflow-y: auto; flex: 1;
      }
      .apriori-track {
        display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px;
      }
      .apriori-card {
        flex: 0 0 220px; border: 1px solid #eadfce; border-radius: 12px;
        background: #fff; display: flex; flex-direction: column; overflow: hidden;
      }
      .apriori-card.is-current {
        border: 2px solid #7b5144; background: #fdfaf8;
      }
      .apriori-card-badge {
        font-size: 11px; font-weight: 700; padding: 4px 10px;
        background: #7b5144; color: #fff; text-align: center;
      }
      .apriori-card-img {
        width: 100%; height: 150px; object-fit: cover; background: #f5ece8;
      }
      .apriori-card-body {
        padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1;
      }
      .apriori-card-name {
        font-size: 14px; font-weight: 600; color: #2f2114; line-height: 1.35;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      }
      .apriori-card-price {
        font-size: 15px; font-weight: 700; color: #a34d22;
      }
      .apriori-card-meta {
        font-size: 11.5px; color: #7a6652; line-height: 1.35;
      }
      .apriori-card-actions {
        margin-top: auto; padding-top: 8px; display: flex; flex-direction: column; gap: 6px;
      }
      .apriori-btn-add {
        width: 100%; padding: 8px 10px; border: none; border-radius: 7px;
        background: #7b5144; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
      }
      .apriori-btn-add:hover { background: #5a3e36; }
      .apriori-btn-add:disabled { background: #b8a398; cursor: not-allowed; }
      .apriori-btn-detail {
        display: block; text-align: center; padding: 6px 10px; border-radius: 7px;
        border: 1px solid #d9c5b8; color: #5a3e36; text-decoration: none;
        font-size: 12.5px; font-weight: 600; background: #fff;
      }
      .apriori-btn-detail:hover { background: #faf6f4; }
    `;
    document.head.appendChild(style);
  }

  function closeAprioriModal() {
    const overlay = document.getElementById("apriori-modal-overlay");
    if (overlay) overlay.remove();
    document.removeEventListener("keydown", onEscKey);
  }

  function onEscKey(e) {
    if (e.key === "Escape") closeAprioriModal();
  }

  window.openAprioriModal = async function (productId, productName, productPrice, productImg) {
    ensureModalStyles();
    closeAprioriModal();

    const overlay = document.createElement("div");
    overlay.id = "apriori-modal-overlay";
    overlay.className = "apriori-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="apriori-modal">
        <div class="apriori-modal-header">
          <h2 class="apriori-modal-title">Sản phẩm thường được mua kèm</h2>
          <button type="button" class="apriori-modal-close" aria-label="Đóng">&times;</button>
        </div>
        <div class="apriori-modal-body" id="apriori-modal-body">
          <p style="text-align:center;padding:32px;color:#888;">
            <i class="fa-solid fa-spinner fa-spin"></i> Đang tải gợi ý từ Apriori...
          </p>
        </div>
      </div>
    `;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAprioriModal();
    });
    overlay.querySelector(".apriori-modal-close").addEventListener("click", closeAprioriModal);
    document.addEventListener("keydown", onEscKey);
    document.body.appendChild(overlay);

    const bodyEl = document.getElementById("apriori-modal-body");

    try {
      const res = await fetch(`${API_BASE}/api/v1/recommendations/complementary/${productId}?limit=6`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const cartIds = getCartProductIds();
      const items = (json && Array.isArray(json.result) ? json.result : [])
        .filter((p) => Number(p.id) !== Number(productId) && !cartIds.has(Number(p.id)));

      if (items.length === 0) {
        bodyEl.innerHTML = `
          <div style="text-align:center;padding:30px 16px;color:#7a6652;">
            <i class="fa-solid fa-box-open" style="font-size:36px;color:#d9c5b8;margin-bottom:10px;"></i>
            <p style="margin:0;font-size:15px;">Chưa có gợi ý sản phẩm mua kèm phù hợp cho <strong>${productName}</strong>.</p>
          </div>`;
        return;
      }

      const track = document.createElement("div");
      track.className = "apriori-track";

      const currentCard = document.createElement("div");
      currentCard.className = "apriori-card is-current";
      currentCard.innerHTML = `
        <div class="apriori-card-badge">Đang trong giỏ hàng</div>
        <img class="apriori-card-img" src="${resolveImg(productImg)}" alt="${productName}">
        <div class="apriori-card-body">
          <div class="apriori-card-name">${productName}</div>
          <div class="apriori-card-price">${formatPrice(productPrice)}</div>
        </div>
      `;
      track.appendChild(currentCard);

      items.forEach((p) => {
        const card = document.createElement("div");
        card.className = "apriori-card";
        card.innerHTML = `
          <img class="apriori-card-img" src="${resolveImg(p.thumbnailUrl)}" alt="${p.name || ""}"
               onerror="this.src='https://placehold.co/200x200/f5ece8/7b5144?text=AuraCraft'">
          <div class="apriori-card-body">
            <div class="apriori-card-name">${p.name || ""}</div>
            <div class="apriori-card-price">${formatPrice(p.price)}</div>
            ${p.explanation ? `<div class="apriori-card-meta">${p.explanation}</div>` : ""}
            <div class="apriori-card-actions">
              <button type="button" class="apriori-btn-add" data-id="${p.id}">
                <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
              </button>
              <a class="apriori-btn-detail" href="product-detail.html?id=${p.id}">Xem chi tiết</a>
            </div>
          </div>
        `;

        const addBtn = card.querySelector(".apriori-btn-add");
        addBtn.addEventListener("click", async () => {
          if (!window.AuraCraft || !window.AuraCraft.isLoggedIn()) {
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
            return;
          }
          addBtn.disabled = true;
          addBtn.textContent = "Đang thêm...";
          try {
            await window.AuraCraft.apiPost("/cart", { productId: p.id, quantity: 1, customNotes: "" });
            addBtn.textContent = "Đã thêm vào giỏ!";
            if (typeof window.loadCart === "function") await window.loadCart();
            if (window.AuraCraft?.updateCartBadge) await window.AuraCraft.updateCartBadge();
          } catch (err) {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ';
            alert("Không thể thêm vào giỏ: " + (err.message || "Lỗi không xác định"));
          }
        });

        track.appendChild(card);
      });

      bodyEl.innerHTML = "";
      bodyEl.appendChild(track);
    } catch (err) {
      bodyEl.innerHTML = `
        <div style="text-align:center;padding:30px 16px;color:#c0392b;">
          <p style="margin:0;">Không thể tải gợi ý sản phẩm. Vui lòng thử lại sau.</p>
        </div>`;
    }
  };
})();
