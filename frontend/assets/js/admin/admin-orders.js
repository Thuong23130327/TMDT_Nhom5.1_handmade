document.addEventListener("DOMContentLoaded", () => {
  const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

  const API_ORDERS = "http://localhost:8080/api/v1/admin/orders";

  const orderListContainer = document.getElementById("adminOrdersContainer");
  const searchInput = document.getElementById("searchInput");
  const filterSort = document.getElementById("filterSort");
  const feedbackEl = document.getElementById("orderFeedback");

  const countAll = document.getElementById("countAll");
  const countPending = document.getElementById("countPending");
  const countCrafting = document.getElementById("countCrafting");
  const countShipping = document.getElementById("countShipping");
  const countCompleted = document.getElementById("countCompleted");
  const countCancelled = document.getElementById("countCancelled");

  const statTotal = document.getElementById("statTotalOrders");
  const statPending = document.getElementById("statPendingOrders");
  const statInProcess = document.getElementById("statInProcessOrders");
  const statRevenue = document.getElementById("statTotalRevenue");

  let currentTab = "all";
  let searchDebounce = null;
  let allOrdersCache = [];

  const statusBadgeMap = {
    PENDING: { label: "Chờ xác nhận", class: "badge late", icon: "fa-regular fa-clock" },
    CONFIRMED: { label: "Đã xác nhận", class: "badge shipping", icon: "fa-solid fa-check" },
    CRAFTING: { label: "Đang chế tác", class: "badge crafting", icon: "fa-solid fa-hammer" },
    SHIPPING: { label: "Đang giao hàng", class: "badge shipping", icon: "fa-solid fa-truck" },
    COMPLETED: { label: "Đã hoàn thành", class: "badge done", icon: "fa-solid fa-circle-check" },
    DELIVERED: { label: "Đã giao hàng", class: "badge done", icon: "fa-solid fa-circle-check" },
    CANCELLED: { label: "Đã hủy", class: "badge danger", icon: "fa-solid fa-ban" }
  };

  function resolveImg(src) {
    if (!src || src.includes("sample")) return "../assets/img/products/bracelet_01.jpg";
    if (src.startsWith("../assets/")) return src;
    if (src.startsWith("assets/")) return "../" + src;
    return src;
  }

  // 1. Tải số liệu thống kê
  async function loadStats() {
    try {
      const res = await fetch(`${API_ORDERS}/stats`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.result;
        if (data) {
          if (statTotal) statTotal.textContent = data.totalOrders ?? 0;
          if (statPending) statPending.textContent = data.pendingOrders ?? 0;
          if (statInProcess) statInProcess.textContent = (data.craftingOrders || 0) + (data.shippingOrders || 0);
          if (statRevenue) statRevenue.textContent = formatVND(data.totalRevenue ?? 0);

          if (countAll) countAll.textContent = data.totalOrders ?? 0;
          if (countPending) countPending.textContent = data.pendingOrders ?? 0;
          if (countCrafting) countCrafting.textContent = data.craftingOrders ?? 0;
          if (countShipping) countShipping.textContent = data.shippingOrders ?? 0;
          if (countCompleted) countCompleted.textContent = data.completedOrders ?? 0;
          if (countCancelled) countCancelled.textContent = data.cancelledOrders ?? 0;
        }
      }
    } catch (e) {
      console.warn("Không thể tải thống kê đơn hàng:", e);
    }
  }

  // 2. Tải danh sách đơn hàng
  async function loadOrders() {
    if (orderListContainer) {
      orderListContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color:#7f8c8d;">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p style="margin-top:10px;">Đang tải danh sách đơn hàng từ cơ sở dữ liệu...</p>
        </div>
      `;
    }

    const keyword = searchInput ? searchInput.value.trim() : "";

    try {
      const url = new URL(API_ORDERS);
      if (currentTab !== "all") {
        url.searchParams.append("status", currentTab.toUpperCase());
      }
      if (keyword) {
        url.searchParams.append("keyword", keyword);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        const orders = json.data || json.result || [];
        allOrdersCache = orders;
        renderOrders(orders);
      } else {
        throw new Error("Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      if (orderListContainer) {
        orderListContainer.innerHTML = `
          <div style="text-align:center; padding: 40px; color:#e74c3c;">
            <i class="fa-solid fa-circle-exclamation fa-2x"></i>
            <p style="margin-top:10px;">Lỗi kết nối máy chủ: ${err.message}</p>
          </div>
        `;
      }
    }
  }

  // 3. Render danh sách đơn hàng
  function renderOrders(orders) {
    if (!orderListContainer) return;

    if (!orders || orders.length === 0) {
      orderListContainer.innerHTML = `
        <div class="empty-state" style="text-align:center; padding: 60px 20px; background:#fff; border-radius:12px; border:1px dashed #ddd; margin-top:20px;">
          <i class="fa-regular fa-folder-open fa-3x" style="color:#bdc3c7;"></i>
          <p style="margin-top:15px; color:#7f8c8d; font-size:15px;">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
        </div>
      `;
      return;
    }

    // Sắp xếp
    const sortVal = filterSort ? filterSort.value : "newest";
    let sorted = [...orders];
    if (sortVal === "oldest") {
      sorted.reverse();
    } else if (sortVal === "high_price") {
      sorted.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    }

    orderListContainer.innerHTML = sorted.map(order => {
      const st = (order.status || "PENDING").toUpperCase();
      const badgeInfo = statusBadgeMap[st] || { label: st, class: "badge shipping", icon: "fa-regular fa-circle" };

      const isPaid = order.paymentStatus === "PAID";
      const isVietQr = order.paymentMethod === "BANKING";
      const payLabel = isVietQr ? "VietQR (Chuyển khoản)" : "COD (Thu tiền khi giao)";
      const payBadge = isPaid
        ? `<span style="display:inline-flex; align-items:center; gap:4px; background:#e8f8f5; color:#27ae60; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Đã thanh toán</span>`
        : `<span style="display:inline-flex; align-items:center; gap:4px; background:#fef5e7; color:#e67e22; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;"><i class="fa-regular fa-clock"></i> Chưa thanh toán</span>`;

      // Ngày đặt
      let dateFormatted = "Mới đây";
      if (order.createdAt) {
        try {
          const d = new Date(order.createdAt);
          if (!isNaN(d.getTime())) {
            dateFormatted = d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
          }
        } catch (e) {}
      }

      // Danh sách sản phẩm tóm tắt
      const items = order.items || [];
      const itemsHtml = items.length > 0 ? items.map(item => `
        <div style="display:flex; align-items:center; gap:12px; padding:6px 0;">
          <img src="${resolveImg(item.thumbnailUrl)}" alt="" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #eee;">
          <div style="flex:1;">
            <div style="font-weight:600; font-size:14px; color:#2c3e50;">${item.productName || "Sản phẩm thủ công"}</div>
            <div style="font-size:12px; color:#7f8c8d;">
              Số lượng: <strong>x${item.quantity || 1}</strong> &bull; Đơn giá: ${formatVND(item.unitPrice || 0)}
              ${item.customNotes ? `<span style="color:#d35400; margin-left:6px;"><i class="fa-solid fa-pen-nib"></i> ${item.customNotes}</span>` : ""}
            </div>
          </div>
          <div style="font-weight:600; color:#2c3e50; font-size:14px;">
            ${formatVND((item.unitPrice || 0) * (item.quantity || 1))}
          </div>
        </div>
      `).join("") : `<div style="font-size:13px; color:#95a5a6; font-style:italic;">Đơn hàng thủ công cá nhân hóa</div>`;

      // Nút hành động theo trạng thái
      let actionButtons = `
        <button class="btn btn-outline btn-sm" onclick="openOrderModal('${order.orderCode}')" style="font-size:13px;">
          <i class="fa-regular fa-eye"></i> Chi tiết
        </button>
      `;

      if (st === "PENDING") {
        actionButtons += `
          <button class="btn btn-sm" onclick="updateOrderStatus('${order.orderCode}', 'CRAFTING')" style="background:#f39c12; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; cursor:pointer;">
            <i class="fa-solid fa-hammer"></i> Bắt đầu chế tác
          </button>
          <button class="btn btn-sm" onclick="updateOrderStatus('${order.orderCode}', 'CANCELLED')" style="background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; cursor:pointer;">
            <i class="fa-solid fa-ban"></i> Hủy đơn
          </button>
        `;
      } else if (st === "CRAFTING" || st === "CONFIRMED") {
        actionButtons += `
          <button class="btn btn-sm" onclick="updateOrderStatus('${order.orderCode}', 'SHIPPING')" style="background:#2980b9; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; cursor:pointer;">
            <i class="fa-solid fa-truck-fast"></i> Bàn giao vận chuyển
          </button>
        `;
      } else if (st === "SHIPPING") {
        actionButtons += `
          <button class="btn btn-sm" onclick="updateOrderStatus('${order.orderCode}', 'COMPLETED')" style="background:#27ae60; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:13px; cursor:pointer;">
            <i class="fa-solid fa-check"></i> Hoàn thành đơn
          </button>
        `;
      }

      return `
        <div class="order-card" style="background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); border:1px solid #eef2f5; margin-bottom:16px; overflow:hidden;">
          <!-- Order Card Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:#fafbfc; border-bottom:1px solid #f0f3f6; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-weight:700; color:#2c3e50; font-size:15px;">#${order.orderCode}</span>
              <span style="font-size:12px; color:#7f8c8d;"><i class="fa-regular fa-calendar"></i> ${dateFormatted}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              ${payBadge}
              <span class="${badgeInfo.class}" style="padding:4px 10px; font-size:12px; border-radius:6px;">
                <i class="${badgeInfo.icon}"></i> ${badgeInfo.label}
              </span>
            </div>
          </div>

          <!-- Order Card Body -->
          <div style="padding:16px 20px;">
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:12px;">
              <div>
                <div style="font-size:12px; text-transform:uppercase; color:#95a5a6; font-weight:700; margin-bottom:6px;">Sản phẩm đặt mua</div>
                <div style="border-top:1px dashed #eee; padding-top:4px;">
                  ${itemsHtml}
                </div>
              </div>
              <div style="background:#fcfcfc; padding:12px; border-radius:8px; border:1px solid #f5f5f5; font-size:13px;">
                <div style="font-weight:700; color:#2c3e50; margin-bottom:6px;">Người nhận: ${order.recipientName || "Khách hàng"}</div>
                <div style="color:#555; margin-bottom:4px;"><i class="fa-solid fa-phone" style="width:16px; color:#7f8c8d;"></i> ${order.recipientPhone || "N/A"}</div>
                <div style="color:#555; margin-bottom:6px;"><i class="fa-solid fa-location-dot" style="width:16px; color:#7f8c8d;"></i> ${order.shippingAddress || "N/A"}</div>
                <div style="color:#7f8c8d; font-size:12px; border-top:1px solid #eee; padding-top:6px;">
                  PTTT: <strong>${payLabel}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Card Footer -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:#fff; border-top:1px solid #f0f3f6; flex-wrap:wrap; gap:10px;">
            <div style="font-size:14px; color:#7f8c8d;">
              Tổng thanh toán: <strong style="font-size:18px; color:#e74c3c;">${formatVND(order.totalAmount || 0)}</strong>
            </div>
            <div style="display:flex; gap:8px;">
              ${actionButtons}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // 4. Cập nhật trạng thái đơn hàng
  window.updateOrderStatus = async function(orderCode, newStatus) {
    const statusTextMap = {
      CRAFTING: "bắt đầu chế tác",
      SHIPPING: "bàn giao vận chuyển",
      COMPLETED: "hoàn thành đơn hàng",
      CANCELLED: "hủy đơn hàng này"
    };

    const confirmMsg = `Bạn có chắc chắn muốn chuyển trạng thái đơn #${orderCode} sang "${statusTextMap[newStatus] || newStatus}"?`;
    if (!confirm(confirmMsg)) return;

    try {
      if (feedbackEl) {
        feedbackEl.style.color = "#2980b9";
        feedbackEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang cập nhật trạng thái đơn #${orderCode}...`;
      }

      const res = await fetch(`${API_ORDERS}/${orderCode}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const json = await res.json();
      if (res.ok && (json.code === 1000 || json.success)) {
        if (feedbackEl) {
          feedbackEl.style.color = "#27ae60";
          feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã cập nhật thành công đơn #${orderCode}!`;
        }
        await loadStats();
        await loadOrders();
      } else {
        throw new Error(json.message || "Cập nhật thất bại.");
      }
    } catch (e) {
      if (feedbackEl) {
        feedbackEl.style.color = "#c0392b";
        feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Lỗi: ${e.message}`;
      }
    }
  };

  // 5. Mở Modal Chi tiết đơn hàng
  window.openOrderModal = function(orderCode) {
    const order = allOrdersCache.find(o => o.orderCode === orderCode);
    if (!order) return;

    const modal = document.getElementById("orderModal");
    if (!modal) return;

    const idEl = document.getElementById("modalOrderId");
    const buyerEl = document.getElementById("modalBuyer");
    const dateEl = document.getElementById("modalDate");
    const addressEl = document.getElementById("modalAddress");
    const priceEl = document.getElementById("modalPrice");
    const feeEl = document.getElementById("modalFee");
    const productEl = document.getElementById("modalProduct");

    if (idEl) idEl.textContent = "#" + order.orderCode;
    if (buyerEl) buyerEl.textContent = `${order.recipientName || "Khách"} (${order.recipientPhone || ""})`;
    if (dateEl) dateEl.textContent = order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "Hôm nay";
    if (addressEl) addressEl.textContent = order.shippingAddress || "Tại cửa hàng";
    if (priceEl) priceEl.textContent = formatVND(order.totalAmount || 0);

    const fee = (order.totalAmount || 0) * 0.1;
    if (feeEl) feeEl.textContent = "-" + formatVND(fee) + " (10%)";

    if (productEl && order.items && order.items.length > 0) {
      productEl.innerHTML = order.items.map(it => `
        <div style="margin-bottom:4px;">
          &bull; <strong>${it.productName}</strong> (x${it.quantity}) - ${formatVND(it.unitPrice)}
        </div>
      `).join("");
    } else if (productEl) {
      productEl.textContent = "Sản phẩm chế tác thủ công";
    }

    modal.classList.add("active");
  };

  window.closeOrderDetail = function() {
    const modal = document.getElementById("orderModal");
    if (modal) modal.classList.remove("active");
  };

  // Lắng nghe Tab
  const tabs = document.querySelectorAll(".tab-item");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.getAttribute("data-tab") || "all";
      loadOrders();
    });
  });

  // Tìm kiếm
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(loadOrders, 350);
    });
  }

  // Sắp xếp
  if (filterSort) {
    filterSort.addEventListener("change", () => {
      renderOrders(allOrdersCache);
    });
  }

  // Khởi động
  loadStats();
  loadOrders();
});
