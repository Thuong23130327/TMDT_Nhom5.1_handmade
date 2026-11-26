// ============================================================
// AuraCraft - cart.js (kết nối Backend API /api/cart)
// ============================================================

const SHIPPING_FEE = 25300;

function requireLogin() {
  if (!window.AuraCraft || !window.AuraCraft.isLoggedIn()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return false;
  }
  return true;
}

function formatVND(amount) {
  return Number(amount).toLocaleString("vi-VN") + "đ";
}

async function loadCart() {
  const container = document.querySelector(".cart-items");
  const summaryEl = document.querySelector(".cart-summary");

  if (!container) return;
  if (!requireLogin()) return;

  container.innerHTML = '<p class="loading-msg" style="text-align:center;padding:40px;color:#888"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải giỏ hàng...</p>';

  try {
    const cart = await window.AuraCraft.apiGet("/cart");
    renderCart(cart, container, summaryEl);
  } catch (err) {
    if (container) {
      if (err.message && (err.message.includes("đăng nhập") || err.message.includes("401"))) {
        container.innerHTML = `
          <div style="text-align:center;padding:50px 20px;">
            <i class="fa-solid fa-lock" style="font-size:48px;color:#c9a24b;margin-bottom:16px;"></i>
            <h3 style="color:#7b5144;margin-bottom:10px;">Chưa đăng nhập hoặc phiên đã hết hạn</h3>
            <p style="color:#888;margin-bottom:18px;">Vui lòng đăng nhập lại để xem và quản lý giỏ hàng của bạn.</p>
            <a href="login.html?redirect=cart.html" class="btn btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px;">Đăng nhập ngay</a>
          </div>`;
      } else {
        container.innerHTML = `<p style="text-align:center;padding:40px;color:#e55">Lỗi: ${err.message}</p>`;
      }
    }
  }
}

function renderCart(cart, container, summaryEl) {
  if (!container) return;

  if (!cart || !cart.items || cart.items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <i class="fa-solid fa-cart-shopping" style="font-size:64px;color:#ddd;margin-bottom:20px;"></i>
        <h3 style="color:#888;margin-bottom:12px;">Giỏ hàng của bạn đang trống</h3>
        <a href="products.html" class="btn btn-primary" style="display:inline-block;margin-top:10px;">Khám phá sản phẩm</a>
      </div>`;
    if (summaryEl) summaryEl.style.display = "none";
    if (window.AuraCraft?.updateCartBadge) window.AuraCraft.updateCartBadge();
    return;
  }

  const groups = {};
  cart.items.forEach(item => {
    const artisan = item.artisanName || "Shop AuraCraft";
    if (!groups[artisan]) groups[artisan] = [];
    groups[artisan].push(item);
  });

  let html = "";
  Object.entries(groups).forEach(([artisanName, items]) => {
    html += `<div class="cart-group">
      <div class="cart-shop-header">
        <i class="fa-solid fa-store"></i>
        <span>${artisanName}</span>
      </div>`;

    items.forEach(item => {
      const imgUrl = item.thumbnailUrl
        ? (item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `../${item.thumbnailUrl}`)
        : "https://placehold.co/80x80/f5ece8/7b5144?text=SP";

      html += `
      <div class="cart-item-content" data-id="${item.id}">
        <div class="cart-item-left">
          <img src="${imgUrl}" alt="${item.productName}" class="cart-item-img"
               onerror="this.src='https://placehold.co/80x80/f5ece8/7b5144?text=SP'">
          <div class="cart-item-info">
            <h3 class="cart-item-title">${item.productName}</h3>
            ${item.customNotes ? `<p class="cart-item-variant">Tùy biến: ${item.customNotes}</p>` : ""}
            <div class="cart-item-price-mobile">${formatVND(item.unitPrice)}</div>
            <button type="button" class="apriori-cart-btn"
                    data-product-id="${item.productId}"
                    data-product-name="${(item.productName || "").replace(/"/g, "&quot;")}"
                    data-product-price="${item.unitPrice}"
                    data-product-img="${imgUrl}"
                    style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:5px 12px;font-size:12.5px;font-weight:600;color:#7b5144;background:#faf6f4;border:1px solid #d9c5b8;border-radius:6px;cursor:pointer;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gợi ý sản phẩm mua kèm
            </button>
          </div>
        </div>
        <div class="cart-item-middle">
          <span class="unit-price">${formatVND(item.unitPrice)}</span>
          <div class="quantity-control">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-qty="${item.quantity}">-</button>
            <input type="number" class="qty-input" value="${item.quantity}" readonly>
            <button class="qty-btn" data-action="increase" data-id="${item.id}" data-qty="${item.quantity}">+</button>
          </div>
          <span class="subtotal-price">${formatVND(item.subtotal)}</span>
        </div>
        <div class="cart-item-right">
          <button class="remove-btn" data-id="${item.id}" title="Xóa sản phẩm">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;

  if (summaryEl) {
    const subtotal = cart.totalAmount || 0;
    const total = subtotal + SHIPPING_FEE;

    summaryEl.style.display = "";
    summaryEl.innerHTML = `
      <div class="summary-row">
        <span>Tạm tính (${cart.itemCount} sản phẩm):</span>
        <strong>${formatVND(subtotal)}</strong>
      </div>
      <div class="summary-row">
        <span><i class="fa-solid fa-truck-fast"></i> Phí vận chuyển:</span>
        <strong>${formatVND(SHIPPING_FEE)}</strong>
      </div>
      <div class="summary-row total-row">
        <span>Tổng cộng:</span>
        <strong class="total-price">${formatVND(total)}</strong>
      </div>
      <button class="btn btn-primary checkout-btn" onclick="proceedCheckout()">
        <i class="fa-solid fa-credit-card"></i> Tiến hành thanh toán
      </button>`;
  }

  sessionStorage.setItem("auracraft_cart", JSON.stringify(cart));
  if (window.AuraCraft?.updateCartBadge) window.AuraCraft.updateCartBadge();
  attachCartEvents();
}

function attachCartEvents() {
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      const currentQty = parseInt(btn.dataset.qty);
      const action = btn.dataset.action;
      const newQty = action === "increase" ? currentQty + 1 : currentQty - 1;

      if (newQty < 1) {
        if (confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?")) {
          await removeCartItem(id);
        }
        return;
      }

      try {
        btn.disabled = true;
        await window.AuraCraft.apiPut(`/cart/${id}`, { quantity: newQty });
        await loadCart();
        if (window.AuraCraft?.updateCartBadge) window.AuraCraft.updateCartBadge();
      } catch (err) {
        alert(err.message);
        btn.disabled = false;
      }
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      await removeCartItem(id);
    });
  });

  document.querySelectorAll(".apriori-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof window.openAprioriModal === "function") {
        window.openAprioriModal(
          parseInt(btn.dataset.productId, 10),
          btn.dataset.productName || "",
          Number(btn.dataset.productPrice || 0),
          btn.dataset.productImg || ""
        );
      }
    });
  });
}

async function removeCartItem(id) {
  try {
    await window.AuraCraft.apiDelete(`/cart/${id}`);
    await loadCart();
    if (window.AuraCraft?.updateCartBadge) window.AuraCraft.updateCartBadge();
  } catch (err) {
    alert("Không thể xóa sản phẩm: " + err.message);
  }
}

function proceedCheckout() {
  if (!requireLogin()) return;
  const cart = JSON.parse(sessionStorage.getItem("auracraft_cart") || "{}");
  if (!cart.items || cart.items.length === 0) {
    alert("Giỏ hàng trống, không thể thanh toán.");
    return;
  }
  window.location.href = "checkout.html";
}

window.AuraCraftCart = {
  async addProduct(productId, quantity = 1, notes = "") {
    if (!window.AuraCraft || !window.AuraCraft.isLoggedIn()) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      return false;
    }
    try {
      await window.AuraCraft.apiPost("/cart", { productId, quantity, customNotes: notes });
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
      if (window.AuraCraft?.updateCartBadge) {
        await window.AuraCraft.updateCartBadge();
      }
      return true;
    } catch (err) {
      alert("Không thể thêm vào giỏ: " + err.message);
      return false;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});
