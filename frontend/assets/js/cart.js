// ============================================================
// AuraCraft - cart.js (kết nối Backend API /api/cart)
// ============================================================

const SHIPPING_FEE = 25300;

// Dùng helper từ auth.js
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

// --- Render giỏ hàng ---
async function loadCart() {
  const container = document.querySelector(".cart-items");
  const summaryEl = document.querySelector(".cart-summary");

  // Nếu không phải trang giỏ hàng (không có .cart-items) thì không chạy tiếp
  if (!container) return;

  if (!requireLogin()) return;

  container.innerHTML = '<p class="loading-msg" style="text-align:center;padding:40px;color:#888"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải giỏ hàng...</p>';

  try {
    const cart = await window.AuraCraft.apiGet("/cart");
    renderCart(cart, container, summaryEl);
  } catch (err) {
    container.innerHTML = `<p style="text-align:center;padding:40px;color:#e55">Lỗi: ${err.message}</p>`;
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

  // Nhóm sản phẩm theo artisan
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
          <img src="${imgUrl}" alt="${item.productName}" onerror="this.src='https://placehold.co/80x80/f5ece8/7b5144?text=SP'">
          <div class="item-info">
            <h3>${item.productName}</h3>
            ${item.customNotes ? `<p class="item-category">Ghi chú: ${item.customNotes}</p>` : ""}
            <p class="item-price">${formatVND(item.unitPrice)}</p>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="item-quantity">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-qty="${item.quantity}">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}" data-qty="${item.quantity}">+</button>
          </div>
          <div class="item-subtotal">${formatVND(item.subtotal)}</div>
          <div class="item-actions">
            <button class="action-btn remove-btn" data-id="${item.id}">Xóa</button>
          </div>
        </div>
      </div>`;
    });

    html += `</div>`; // end cart-group
  });

  container.innerHTML = html;

  // Render summary
  const subtotal = cart.total;
  const total = Number(subtotal) + SHIPPING_FEE;
  if (summaryEl) {
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

  // Lưu cartData vào sessionStorage để checkout.js dùng
  sessionStorage.setItem("auracraft_cart", JSON.stringify(cart));

  // Cập nhật số lượng trên icon giỏ hàng
  if (window.AuraCraft?.updateCartBadge) window.AuraCraft.updateCartBadge();

  // Gắn event listeners
  attachCartEvents();
}

function attachCartEvents() {
  // Nút tăng/giảm số lượng
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

  // Nút xóa
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id);
      await removeCartItem(id);
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

// Hàm global để product-detail.js / products.js gọi
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
