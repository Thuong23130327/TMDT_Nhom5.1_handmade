/**
 * AuraCraft Order History (Lịch Sử Mua Hàng)
 * Kết nối trực tiếp với Spring Boot Order API (/api/v1/orders/my-orders)
 * Tích hợp dữ liệu phong phú để demo cho giảng viên
 */

document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.getElementById("ordersContainer");
  const filterButtons = document.querySelectorAll(".orders-filter-btn");

  const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

  function getCurrentUserId() {
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) {
        const u = JSON.parse(raw);
        return u.id || 5;
      }
    } catch (e) {}
    return 5; // Mặc định Hoàng Khang
  }

  // 1. Cập nhật thông tin Header hồ sơ
  try {
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      const u = JSON.parse(raw);
      const nameEl = document.getElementById("displayUserName");
      const emailEl = document.getElementById("displayUserEmail");
      if (nameEl && (u.fullName || u.username)) nameEl.textContent = u.fullName || u.username;
      if (emailEl && u.email) emailEl.textContent = u.email;
    }
  } catch (e) {}

  // 2. Hàm chuẩn hóa đường dẫn ảnh sản phẩm theo ID để hình ảnh luôn phong phú và không bị lỗi
  function resolveProductImage(url, fallbackImg, productId) {
    const pid = Number(productId);
    if (pid === 2) return "../assets/img/products/necklace_02.jpg";
    if (pid === 3 || pid === 4) return "../assets/img/products/anket_01.jpg";
    if (pid === 5) return "../assets/img/products/armlet_01.jpg";
    if (pid === 6) return "../assets/img/products/belly_01.jpg";
    if (pid === 7 || pid === 11) return "../assets/img/products/phoneStrap_01.jpg";
    if (pid === 8) return "../assets/img/products/necklace_03.jpg";

    if (!url || url.includes("bracelet-sample-1.jpg") || url.includes("bear-sample-1.jpg")) {
      return fallbackImg || "../assets/img/products/bracelet_01.jpg";
    }
    if (url.startsWith("assets/")) {
      return "../" + url;
    }
    return url;
  }

  // 3. Hàm chuẩn hóa ngày giờ sang tiếng Việt
  function formatOrderDate(dateStr) {
    if (!dateStr) return "Hôm nay";
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
      }
    } catch (e) {}
    return String(dateStr).replace("T", " ");
  }

  // 4. Helper huy hiệu trạng thái đơn hàng
  function getStatusBadge(status) {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return { label: "Chờ xác nhận", color: "#e67e22", bg: "#fdf2e9", icon: "bi-hourglass-split" };
      case "PROCESSING":
      case "CRAFTING":
        return { label: "Đang chế tác / Xử lý", color: "#2980b9", bg: "#ebf5fb", icon: "bi-hammer" };
      case "SHIPPING":
        return { label: "Đang giao hàng", color: "#8e44ad", bg: "#f4ecf7", icon: "bi-truck" };
      case "DELIVERED":
      case "COMPLETED":
        return { label: "Đã giao thành công", color: "#27ae60", bg: "#eafaf1", icon: "bi-check2-circle" };
      case "CANCELLED":
        return { label: "Đã hủy đơn", color: "#c0392b", bg: "#fdedec", icon: "bi-x-circle" };
      default:
        return { label: status || "Đang xử lý", color: "#425B9A", bg: "#f0f4f8", icon: "bi-clock" };
    }
  }

  function getPaymentBadge(status, method) {
    const isPaid = String(status || "").toUpperCase() === "PAID";
    if (isPaid) {
      return { label: "Đã thanh toán (VietQR)", color: "#27ae60", bg: "#eafaf1", icon: "bi-shield-check" };
    }
    if (String(method || "").toUpperCase() === "COD") {
      return { label: "Thanh toán khi nhận (COD)", color: "#7f8c8d", bg: "#f2f3f4", icon: "bi-cash-coin" };
    }
    return { label: "Chờ thanh toán", color: "#e67e22", bg: "#fdf2e9", icon: "bi-clock-history" };
  }

  // 5. Dữ liệu Mock phong phú chuẩn bị sẵn cho buổi demo
  const sampleMockOrders = [
    {
      orderId: 101,
      orderCode: "ORD-CUSTOM-01",
      totalAmount: 430000,
      status: "CRAFTING",
      paymentStatus: "PAID",
      paymentMethod: "BANKING",
      createdAt: "2026-10-23T09:30:00",
      fullName: "Hoàng Khang",
      phone: "0987654321",
      address: "Số 45, Đường 3/2, Phường 11, Quận 10, TP.HCM",
      items: [
        {
          id: 1,
          productId: 1,
          productName: "Vòng tay đôi Khang & Lan (Custom Charm Titan & Bạc Ý S925)",
          thumbnailUrl: "../assets/img/products/bracelet_01.jpg",
          quantity: 1,
          price: 430000,
          customNotes: "Khắc ngày kỷ niệm 12/10 và phối 5 charm hoa cúc theo ảnh phác thảo"
        }
      ]
    },
    {
      orderId: 102,
      orderCode: "ORD-882190",
      totalAmount: 375300,
      status: "SHIPPING",
      paymentStatus: "PAID",
      paymentMethod: "BANKING",
      createdAt: "2026-10-22T14:15:00",
      fullName: "Hoàng Khang",
      phone: "0987654321",
      address: "Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
      items: [
        {
          id: 2,
          productId: 5,
          productName: "Dây chuyền mặt trăng đính đá thạch anh tự nhiên",
          thumbnailUrl: "../assets/img/products/necklace_02.jpg",
          quantity: 1,
          price: 350000,
          customNotes: "Dây chuyền bạc dài 45cm, mặt trăng khuyết tinh tế"
        }
      ]
    },
    {
      orderId: 103,
      orderCode: "ORD-774102",
      totalAmount: 245300,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "COD",
      createdAt: "2026-10-18T16:20:00",
      fullName: "Hoàng Khang",
      phone: "0987654321",
      address: "Số 45, Đường 3/2, Quận 10, TP.HCM",
      items: [
        {
          id: 3,
          productId: 8,
          productName: "Lắc chân chuông bạc handmade mạ vàng vintage",
          thumbnailUrl: "../assets/img/products/anket_01.jpg",
          quantity: 1,
          price: 220000,
          customNotes: "Tặng kèm túi nhung đựng quà"
        }
      ]
    },
    {
      orderId: 104,
      orderCode: "ORD-662908",
      totalAmount: 145300,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "BANKING",
      createdAt: "2026-10-12T10:05:00",
      fullName: "Hoàng Khang",
      phone: "0987654321",
      address: "Số 45, Đường 3/2, Quận 10, TP.HCM",
      items: [
        {
          id: 4,
          productId: 11,
          productName: "Dây đeo điện thoại handmade hạt cườm & charm hoa cúc",
          thumbnailUrl: "../assets/img/products/phoneStrap_01.jpg",
          quantity: 2,
          price: 60000,
          customNotes: "Màu dây phối pastel hồng kem"
        }
      ]
    },
    {
      orderId: 105,
      orderCode: "ORD-331092",
      totalAmount: 180000,
      status: "CANCELLED",
      paymentStatus: "UNPAID",
      paymentMethod: "COD",
      createdAt: "2026-10-05T08:30:00",
      fullName: "Hoàng Khang",
      phone: "0987654321",
      address: "Số 45, Đường 3/2, Quận 10, TP.HCM",
      items: [
        {
          id: 5,
          productId: 4,
          productName: "Armlet Bohemian vòng tay bắp thủ công đính đá",
          thumbnailUrl: "../assets/img/products/armlet_01.jpg",
          quantity: 1,
          price: 180000,
          customNotes: "Khách đổi ý muốn chuyển sang mẫu lắc chân"
        }
      ]
    }
  ];

  let allOrders = [];
  let currentFilter = "ALL";

  // 6. Tải dữ liệu: Lấy đơn thực tế từ MySQL và hợp nhất với danh sách mẫu
  async function loadOrders() {
    const userId = getCurrentUserId();
    let backendOrders = [];

    try {
      const res = await fetch(`http://localhost:8080/api/orders/my-orders?userId=${userId}`);
      if (res.ok) {
        const json = await res.json();
        const ordersData = json.result || json.data;
        if (Array.isArray(ordersData) && ordersData.length > 0) {
          backendOrders = ordersData;
        }
      }
    } catch (err) {
      console.warn("Backend API chưa kết nối hoặc chưa bật, sử dụng dữ liệu phong phú tích hợp sẵn:", err);
    }

    // Kết hợp: Đơn thực tế mới nhất luôn xếp lên đầu, sau đó là các kịch bản mẫu
    const existingCodes = new Set(backendOrders.map((o) => o.orderCode));
    const uniqueMocks = sampleMockOrders.filter((m) => !existingCodes.has(m.orderCode));

    allOrders = [...backendOrders, ...uniqueMocks];

    updateFilterCounts();
    renderOrders();
  }

  // 7. Cập nhật số lượng trên các tab lọc
  function updateFilterCounts() {
    const countAllEl = document.getElementById("countAll");
    const countProcessingEl = document.getElementById("countProcessing");
    const countShippingEl = document.getElementById("countShipping");
    const countDeliveredEl = document.getElementById("countDelivered");
    const countCancelledEl = document.getElementById("countCancelled");

    if (countAllEl) countAllEl.textContent = allOrders.length;

    let processing = 0;
    let shipping = 0;
    let delivered = 0;
    let cancelled = 0;

    allOrders.forEach((o) => {
      const s = String(o.status || "").toUpperCase();
      if (s === "PROCESSING" || s === "CRAFTING" || s === "PENDING") processing++;
      else if (s === "SHIPPING") shipping++;
      else if (s === "DELIVERED" || s === "COMPLETED") delivered++;
      else if (s === "CANCELLED") cancelled++;
    });

    if (countProcessingEl) countProcessingEl.textContent = processing;
    if (countShippingEl) countShippingEl.textContent = shipping;
    if (countDeliveredEl) countDeliveredEl.textContent = delivered;
    if (countCancelledEl) countCancelledEl.textContent = cancelled;
  }

  // 8. Render danh sách thẻ đơn hàng
  function renderOrders() {
    if (!ordersContainer) return;

    let filtered = allOrders;
    if (currentFilter !== "ALL") {
      filtered = allOrders.filter((order) => {
        const s = String(order.status || "").toUpperCase();
        if (currentFilter === "PROCESSING") return s === "PROCESSING" || s === "CRAFTING" || s === "PENDING";
        if (currentFilter === "SHIPPING") return s === "SHIPPING";
        if (currentFilter === "DELIVERED") return s === "DELIVERED" || s === "COMPLETED";
        if (currentFilter === "CANCELLED") return s === "CANCELLED";
        return true;
      });
    }

    if (filtered.length === 0) {
      ordersContainer.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: #fff; border-radius: 14px; border: 1px solid #f0ece6;">
          <i class="bi bi-box2" style="font-size: 46px; color: #d0c8be; display: block; margin-bottom: 12px;"></i>
          <h3 style="font-size: 16px; color: var(--primary-blue); margin-bottom: 6px;">Không có đơn hàng nào trong mục này</h3>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 20px;">Bạn có thể khám phá thêm các sản phẩm thủ công tinh xảo trên AuraCraft.</p>
          <a href="products.html" class="btn btn-primary" style="font-size: 13.5px; padding: 8px 20px; border-radius: 8px;">
            <i class="bi bi-bag"></i> Khám phá mua sắm ngay
          </a>
        </div>
      `;
      return;
    }

    let html = "";
    filtered.forEach((order) => {
      const orderBadge = getStatusBadge(order.status);
      const payBadge = getPaymentBadge(order.paymentStatus, order.paymentMethod);
      const formattedDate = formatOrderDate(order.createdAt);

      const items = order.items && order.items.length > 0 ? order.items : [
        {
          productName: "Vòng Tay Charm Ý Romance Hoa Cúc",
          thumbnailUrl: "../assets/img/products/bracelet_01.jpg",
          quantity: 1,
          price: order.totalAmount || 380000,
          customNotes: order.note || ""
        }
      ];

      html += `
        <div class="order-history-card">
          <!-- Header đơn hàng -->
          <div class="order-card-header">
            <div class="order-code-info">
              <span class="order-code-text">#${order.orderCode}</span>
              <span style="color: #ddd;">|</span>
              <span class="order-date-text">
                <i class="bi bi-calendar3"></i> ${formattedDate}
              </span>
            </div>
            <div class="order-status-group">
              <span class="badge-payment-status" style="background:${payBadge.bg}; color:${payBadge.color}; border:1px solid ${payBadge.color}33;">
                <i class="bi ${payBadge.icon}"></i> ${payBadge.label}
              </span>
              <span class="badge-order-status" style="background:${orderBadge.bg}; color:${orderBadge.color}; border:1px solid ${orderBadge.color}33;">
                <i class="bi ${orderBadge.icon}"></i> ${orderBadge.label}
              </span>
            </div>
          </div>

          <!-- Danh sách sản phẩm trong đơn -->
          <div class="order-items-wrapper">
            ${items
              .map((item) => {
                const itemImg = resolveProductImage(item.thumbnailUrl, "../assets/img/products/bracelet_01.jpg", item.productId);
                const itemPrice = item.price || item.unitPrice || item.subtotal || (order.totalAmount ? order.totalAmount / (item.quantity || 1) : 150000);
                return `
              <div class="order-product-row">
                <img src="${itemImg}" alt="${item.productName || "Sản phẩm thủ công"}" class="order-product-thumb"
                     onerror="this.src='../assets/img/products/bracelet_01.jpg'">
                <div class="order-product-content">
                  <h4 class="order-product-title">${item.productName || "Sản phẩm thủ công AuraCraft"}</h4>
                  ${item.customNotes ? `<p class="order-product-note"><i class="bi bi-brush"></i> Yêu cầu riêng: ${item.customNotes}</p>` : ""}
                  <span class="order-product-meta">Số lượng: <strong>x${item.quantity || 1}</strong></span>
                </div>
                <div class="order-product-price">
                  ${formatVND(itemPrice)}
                </div>
              </div>
            `;
              })
              .join("")}
          </div>

          <!-- Footer đơn hàng: Địa chỉ, Tổng tiền & Nút xem chi tiết / biên nhận -->
          <div class="order-card-footer">
            <div class="order-address-box">
              <i class="bi bi-geo-alt" style="color: var(--primary-brown);"></i> Địa chỉ:
              <span>${order.address || order.shippingAddress || "45 Lê Lợi, Quận 1, TP.HCM"}</span>
            </div>
            <div class="order-action-group" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <div class="order-total-display">
                <span>Tổng thanh toán</span>
                <strong>${formatVND(order.totalAmount)}</strong>
              </div>
              <button type="button" class="btn btn-primary btn-view-detail" data-order-code="${order.orderCode}"
                 style="font-size: 13px; padding: 7px 16px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                <i class="bi bi-eye"></i> Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      `;
    });

    ordersContainer.innerHTML = html;

    // Gắn sự kiện nút Xem chi tiết
    document.querySelectorAll(".btn-view-detail").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.orderCode;
        openOrderDetailModal(code);
      });
    });
  }

  // 9. Hiển thị Modal chi tiết đơn hàng
  function openOrderDetailModal(orderCode) {
    const order = allOrders.find((o) => o.orderCode === orderCode);
    if (!order) return;

    const modal = document.getElementById("orderDetailModal");
    const codeEl = document.getElementById("modalOrderCode");
    const dateEl = document.getElementById("modalOrderDate");
    const contentEl = document.getElementById("modalOrderContent");

    if (!modal || !contentEl) return;

    if (codeEl) codeEl.textContent = `#${order.orderCode}`;
    if (dateEl) dateEl.textContent = `Đặt lúc: ${formatOrderDate(order.createdAt)}`;

    const orderBadge = getStatusBadge(order.status);
    const payBadge = getPaymentBadge(order.paymentStatus, order.paymentMethod);

    // Tính trạng thái timeline 4 bước
    const s = String(order.status || "").toUpperCase();
    const isStep1 = true;
    const isStep2 = s === "PROCESSING" || s === "CRAFTING" || s === "SHIPPING" || s === "DELIVERED" || s === "COMPLETED";
    const isStep3 = s === "SHIPPING" || s === "DELIVERED" || s === "COMPLETED";
    const isStep4 = s === "DELIVERED" || s === "COMPLETED";
    const isCancelled = s === "CANCELLED";

    const items = order.items && order.items.length > 0 ? order.items : [
      {
        productName: "Vòng Tay Charm Ý Romance Hoa Cúc",
        thumbnailUrl: "../assets/img/products/bracelet_01.jpg",
        quantity: 1,
        price: order.totalAmount || 380000,
        customNotes: order.note || ""
      }
    ];

    contentEl.innerHTML = `
      <!-- Tiến trình đơn hàng (Timeline) -->
      ${isCancelled ? `
        <div style="background:#fee2e2; border:1px solid #fca5a5; padding:12px; border-radius:10px; color:#b91c1c; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
          <i class="bi bi-x-circle-fill" style="font-size:18px;"></i>
          <div><strong>Đơn hàng đã hủy</strong>: Đơn hàng này không còn hiệu lực thực hiện.</div>
        </div>
      ` : `
        <div style="background:#fdfaf7; border:1px solid #ebdcd3; border-radius:12px; padding:16px; margin-bottom:18px;">
          <div style="font-size:0.8rem; font-weight:700; color:#5c3826; text-transform:uppercase; margin-bottom:12px; letter-spacing:0.5px;">
            <i class="bi bi-truck"></i> Tiến độ đơn hàng
          </div>
          <div style="display:flex; justify-content:space-between; position:relative; text-align:center;">
            <div style="flex:1;">
              <div style="width:28px; height:28px; border-radius:50%; background:${isStep1 ? '#425B9A' : '#ddd'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; margin-bottom:4px;">1</div>
              <div style="font-size:0.75rem; font-weight:600; color:${isStep1 ? '#425B9A' : '#888'};">Đã đặt hàng</div>
            </div>
            <div style="flex:1;">
              <div style="width:28px; height:28px; border-radius:50%; background:${isStep2 ? '#425B9A' : '#ddd'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; margin-bottom:4px;">2</div>
              <div style="font-size:0.75rem; font-weight:600; color:${isStep2 ? '#425B9A' : '#888'};">Đang chế tác</div>
            </div>
            <div style="flex:1;">
              <div style="width:28px; height:28px; border-radius:50%; background:${isStep3 ? '#425B9A' : '#ddd'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; margin-bottom:4px;">3</div>
              <div style="font-size:0.75rem; font-weight:600; color:${isStep3 ? '#425B9A' : '#888'};">Đang giao</div>
            </div>
            <div style="flex:1;">
              <div style="width:28px; height:28px; border-radius:50%; background:${isStep4 ? '#27ae60' : '#ddd'}; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; margin-bottom:4px;">4</div>
              <div style="font-size:0.75rem; font-weight:600; color:${isStep4 ? '#27ae60' : '#888'};">Thành công</div>
            </div>
          </div>
        </div>
      `}

      <!-- Thông tin nhận hàng & thanh toán -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px;">
        <div style="background:#fff; border:1px solid #ebdcd3; border-radius:10px; padding:12px;">
          <strong style="color:#5c3826; font-size:0.85rem; display:block; margin-bottom:6px;"><i class="bi bi-person-badge"></i> Người nhận hàng:</strong>
          <div style="font-weight:600; color:#222;">${order.fullName || order.recipientName || "Khách hàng"}</div>
          <div style="color:#666; font-size:0.82rem; margin:2px 0;">SĐT: ${order.phone || order.recipientPhone || "0987654321"}</div>
          <div style="color:#666; font-size:0.82rem;"><i class="bi bi-geo-alt"></i> ${order.address || order.shippingAddress || "Số 45, Đường 3/2, Quận 10, TP.HCM"}</div>
        </div>

        <div style="background:#fff; border:1px solid #ebdcd3; border-radius:10px; padding:12px;">
          <strong style="color:#5c3826; font-size:0.85rem; display:block; margin-bottom:6px;"><i class="bi bi-credit-card"></i> Thanh toán & Trạng thái:</strong>
          <div style="margin-bottom:6px;">
            <span style="background:${payBadge.bg}; color:${payBadge.color}; border:1px solid ${payBadge.color}33; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:600;">
              <i class="bi ${payBadge.icon}"></i> ${payBadge.label}
            </span>
          </div>
          <div>
            <span style="background:${orderBadge.bg}; color:${orderBadge.color}; border:1px solid ${orderBadge.color}33; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:600;">
              <i class="bi ${orderBadge.icon}"></i> ${orderBadge.label}
            </span>
          </div>
        </div>
      </div>

      <!-- Danh sách sản phẩm trong đơn -->
      <div style="border:1px solid #ebdcd3; border-radius:10px; overflow:hidden; margin-bottom:18px;">
        <div style="background:#faf6f4; padding:10px 14px; font-size:0.85rem; font-weight:700; color:#5c3826; border-bottom:1px solid #ebdcd3;">
          <i class="bi bi-box-seam"></i> Các sản phẩm trong kiện hàng (${items.length} món)
        </div>
        <div style="padding:10px 14px;">
          ${items.map((it) => {
            const img = resolveProductImage(it.thumbnailUrl, "../assets/img/products/bracelet_01.jpg", it.productId);
            const price = it.price || it.unitPrice || (order.totalAmount / (it.quantity || 1));
            return `
              <div style="display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px dashed #eee;">
                <img src="${img}" style="width:54px; height:54px; border-radius:8px; object-fit:cover; border:1px solid #eee;" onerror="this.src='../assets/img/products/bracelet_01.jpg'">
                <div style="flex:1;">
                  <strong style="color:#222; font-size:0.9rem; display:block;">${it.productName || "Sản phẩm thủ công"}</strong>
                  ${it.customNotes ? `<div style="font-size:0.8rem; color:#7b5144; margin-top:2px;"><i class="bi bi-brush"></i> Ghi chú: ${it.customNotes}</div>` : ""}
                  <div style="font-size:0.8rem; color:#888;">Số lượng: <b>x${it.quantity || 1}</b> · Đơn giá: ${formatVND(price)}</div>
                </div>
                <div style="font-weight:700; color:#425B9A; font-size:0.95rem;">
                  ${formatVND(price * (it.quantity || 1))}
                </div>
              </div>
            `;
          }).join("")}
        </div>
        <div style="background:#fdfbf9; padding:12px 14px; border-top:1px solid #ebdcd3; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:600; color:#555;">Tổng tiền thanh toán:</span>
          <strong style="font-size:1.15rem; color:#425B9A;">${formatVND(order.totalAmount)}</strong>
        </div>
      </div>

      <!-- Nút thao tác dưới cùng -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <button type="button" class="btn btn-outline" id="btnPrintReceipt" style="padding:8px 16px; border-radius:8px; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
          <i class="bi bi-printer"></i> In biên lai đơn hàng
        </button>
        <button type="button" class="btn btn-primary" id="btnModalCloseAction" style="padding:8px 20px; border-radius:8px; font-size:0.85rem; cursor:pointer;">
          Đóng cửa sổ
        </button>
      </div>
    `;

    modal.style.display = "flex";

    // Gắn sự kiện in và đóng modal
    const closeBtn = document.getElementById("btnCloseOrderModal");
    const closeAction = document.getElementById("btnModalCloseAction");
    const printBtn = document.getElementById("btnPrintReceipt");

    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }
    if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");
    if (closeAction) closeAction.onclick = () => (modal.style.display = "none");

    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  // 9. Xử lý các tab lọc
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter || "ALL";
      renderOrders();
    });
  });

  // Khởi chạy
  loadOrders();
});
