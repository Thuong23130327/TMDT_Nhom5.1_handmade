// ============================================================
// AuraCraft — checkout.js (kết nối Backend API /api/orders & VNPay Sandbox)
// ============================================================

const SHIPPING_FEE = 25300;

function formatVND(amount) {
  return Number(amount).toLocaleString("vi-VN") + "đ";
}

document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkoutForm");
  if (!checkoutForm) return;

  // ---- Kiểm tra đăng nhập ----
  if (!window.AuraCraft || !window.AuraCraft.isLoggedIn()) {
    window.location.href = "login.html?redirect=checkout.html";
    return;
  }

  // ---- Pre-fill thông tin từ user đang đăng nhập ----
  const user = window.AuraCraft.getCurrentUser();
  if (user) {
    const nameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    if (nameEl && !nameEl.value) nameEl.value = user.fullName || "";
    if (emailEl && !emailEl.value) emailEl.value = user.email || "";
  }

  // ---- Tải dữ liệu giỏ hàng từ sessionStorage (đã lưu bởi cart.js) ----
  let cart = null;
  try {
    const stored = sessionStorage.getItem("auracraft_cart");
    cart = stored ? JSON.parse(stored) : null;
  } catch (e) {}

  if (!cart || !cart.items || cart.items.length === 0) {
    loadCartFromAPI();
  } else {
    renderOrderSummary(cart);
  }

  // ---- Xử lý chọn phương thức thanh toán ----
  const paymentCards = document.querySelectorAll(".payment-method-card");
  paymentCards.forEach((card) => {
    const radio = card.querySelector('input[type="radio"]');
    if (!radio) return;
    radio.addEventListener("change", () => {
      paymentCards.forEach((c) => c.classList.remove("active"));
      if (radio.checked) card.classList.add("active");
    });
  });

  // ---- Submit đặt hàng ----
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullNameEl = document.getElementById("fullName");
    const phoneEl = document.getElementById("phone");
    const addressEl = document.getElementById("address");
    const noteEl = document.getElementById("orderNote");
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');

    let isValid = true;

    if (!fullNameEl.value.trim()) {
      fullNameEl.closest(".form-group").classList.add("invalid");
      isValid = false;
    } else {
      fullNameEl.closest(".form-group").classList.remove("invalid");
    }

    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneEl.value.trim() || !phoneRegex.test(phoneEl.value.trim().replace(/\s/g, ""))) {
      phoneEl.closest(".form-group").classList.add("invalid");
      isValid = false;
    } else {
      phoneEl.closest(".form-group").classList.remove("invalid");
    }

    if (!addressEl.value.trim()) {
      addressEl.closest(".form-group").classList.add("invalid");
      isValid = false;
    } else {
      addressEl.closest(".form-group").classList.remove("invalid");
    }

    if (!isValid) {
      document.querySelector(".form-group.invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const isVNPay = paymentRadio && paymentRadio.value === "vnpay";
    const paymentMethod = isVNPay ? "VNPAY" : "COD";

    await submitOrder(fullNameEl, phoneEl, addressEl, noteEl, paymentMethod);
  });
});

async function loadCartFromAPI() {
  try {
    const cart = await window.AuraCraft.apiGet("/cart");
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("Giỏ hàng trống. Vui lòng thêm sản phẩm trước.");
      window.location.href = "cart.html";
      return;
    }
    sessionStorage.setItem("auracraft_cart", JSON.stringify(cart));
    renderOrderSummary(cart);
  } catch (err) {
    alert("Không thể tải giỏ hàng: " + err.message);
    window.location.href = "cart.html";
  }
}

function renderOrderSummary(cart) {
  const productsList = document.querySelector(".summary-products-list");
  if (productsList) {
    productsList.innerHTML = cart.items.map(item => {
      const img = item.thumbnailUrl
        ? (item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `../${item.thumbnailUrl}`)
        : "https://placehold.co/60x60/f5ece8/7b5144?text=SP";
      return `
        <div class="summary-product-item">
          <img src="${img}" alt="${item.productName}" class="summary-product-thumb"
               onerror="this.src='https://placehold.co/60x60/f5ece8/7b5144?text=SP'">
          <div class="summary-product-details">
            <h3 class="summary-product-title">${item.productName}</h3>
            <p class="summary-product-meta">Số lượng: ${item.quantity}</p>
          </div>
          <span class="summary-product-price">${formatVND(item.subtotal)}</span>
        </div>`;
    }).join("");
  }

  const subtotal = Number(cart.total);
  const total = subtotal + SHIPPING_FEE;

  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingEl = document.getElementById("summaryShipping");
  const totalEl = document.getElementById("summaryTotal");

  if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);
  if (shippingEl) shippingEl.textContent = formatVND(SHIPPING_FEE);
  if (totalEl) totalEl.textContent = formatVND(total);

  window._checkoutTotal = total;
  window._checkoutSubtotal = subtotal;
}

async function submitOrder(fullNameEl, phoneEl, addressEl, noteEl, paymentMethod) {
  const btnConfirm = document.getElementById("btnConfirmOrder");
  const btnText = document.getElementById("btnConfirmText");

  if (btnConfirm) btnConfirm.disabled = true;
  if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo đơn hàng...';

  try {
    const orderData = await window.AuraCraft.apiPost("/orders", {
      recipientName: fullNameEl.value.trim(),
      recipientPhone: phoneEl.value.trim(),
      shippingAddress: addressEl.value.trim(),
      paymentMethod: paymentMethod,
      orderNote: noteEl ? noteEl.value.trim() : "",
    });

    sessionStorage.setItem("auracraft_latest_order", JSON.stringify({
      orderId: orderData.orderCode,
      fullName: fullNameEl.value.trim(),
      phone: phoneEl.value.trim(),
      address: addressEl.value.trim(),
      note: noteEl ? noteEl.value.trim() : "",
      paymentMethod: paymentMethod === "VNPAY" ? "Thanh toán trực tuyến (VNPay)" : "Thanh toán khi nhận hàng (COD)",
      shippingFee: formatVND(SHIPPING_FEE),
      subtotal: formatVND(window._checkoutSubtotal || 0),
      total: formatVND(window._checkoutTotal || 0),
      createdAt: new Date().toLocaleString("vi-VN"),
    }));

    sessionStorage.removeItem("auracraft_cart");

    if (paymentMethod === "VNPAY") {
      // Chuyển hướng sang Cổng thanh toán VNPay Sandbox thực tế!
      if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang chuyển hướng sang cổng VNPay...';
      const payRes = await window.AuraCraft.apiGet(`/payment/create-vnpay?orderCode=${encodeURIComponent(orderData.orderCode)}`);
      if (payRes && payRes.paymentUrl) {
        window.location.href = payRes.paymentUrl;
        return;
      }
    }

    window.location.href = `success.html?orderId=${encodeURIComponent(orderData.orderCode)}`;
  } catch (err) {
    alert("Đặt hàng thất bại: " + err.message);
    if (btnConfirm) btnConfirm.disabled = false;
    if (btnText) btnText.innerHTML = "Xác nhận đặt hàng";
  }
}
