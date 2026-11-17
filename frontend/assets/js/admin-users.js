/**
 * AuraCraft Admin - Quản lý Thợ & Tài khoản
 * Kết nối trực tiếp với Spring Boot Admin User API (/api/v1/admin/users)
 * Tối ưu giao diện: Trực quan, hiện đại, loại bỏ hoàn toàn [Mở portfolio]
 */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("userSearch");
  const roleFilter = document.getElementById("roleFilter");
  const statusFilter = document.getElementById("statusFilter");
  const emptyState = document.getElementById("emptyUsers");
  const feedback = document.getElementById("userFeedback");

  const API_BASE = "http://localhost:8080/api/v1/admin/users";
  let isBackendOnline = false;
  let debounceTimeout = null;

  const roleLabels = { 
    buyer: "Người mua", 
    customer: "Người mua",
    artisan: "Thợ thủ công",
    admin: "Quản trị viên"
  };

  const statusLabels = {
    active: "Đang hoạt động",
    pending: "Chờ duyệt",
    suspended: "Tạm khóa"
  };

  // Helper tạo thẻ td
  function createCell(content, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    return cell;
  }

  // 1. Tạo ô Tài khoản (Avatar + Tên + Email + SĐT)
  function createAccountCell(user) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "12px";

    const name = user.fullName || user.username || "Chưa có tên";
    const initial = name.trim().charAt(0).toUpperCase();

    // Avatar tròn sinh động
    const avatar = document.createElement("div");
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    avatar.style.borderRadius = "50%";
    avatar.style.backgroundColor = getAvatarColor(name);
    avatar.style.color = "#ffffff";
    avatar.style.display = "flex";
    avatar.style.alignItems = "center";
    avatar.style.justifyContent = "center";
    avatar.style.fontWeight = "700";
    avatar.style.fontSize = "16px";
    avatar.style.flexShrink = "0";
    avatar.textContent = initial;

    const info = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.style.fontWeight = "600";
    nameEl.style.color = "#2c3e50";
    nameEl.textContent = name;

    const emailEl = document.createElement("div");
    emailEl.style.fontSize = "12px";
    emailEl.style.color = "#7f8c8d";
    emailEl.textContent = user.email || user.username || "";

    info.append(nameEl, emailEl);
    if (user.phone) {
      const phoneEl = document.createElement("div");
      phoneEl.style.fontSize = "11px";
      phoneEl.style.color = "#95a5a6";
      phoneEl.innerHTML = `<i class="fa-solid fa-phone" style="font-size:10px;"></i> ${user.phone}`;
      info.append(phoneEl);
    }

    wrapper.append(avatar, info);
    return wrapper;
  }

  // Màu sắc ngẫu nhiên nhưng ổn định theo tên
  function getAvatarColor(str) {
    const colors = ["#3498db", "#9b59b6", "#e67e22", "#1abc9c", "#e74c3c", "#2ecc71", "#f39c12", "#34495e"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // 2. Tạo ô Hồ sơ / Giới thiệu (ĐÃ BỎ HOÀN TOÀN [Mở portfolio])
  function createProfileCell(user) {
    const wrapper = document.createElement("div");
    wrapper.style.maxWidth = "320px";
    wrapper.style.fontSize = "13px";
    wrapper.style.lineHeight = "1.5";
    wrapper.style.color = "#555";

    const intro = user.introduction ? user.introduction.trim() : "";
    if (intro) {
      wrapper.textContent = intro;
    } else {
      const cleanRole = (user.role || "").toLowerCase().replace("role_", "");
      if (cleanRole === "artisan") {
        wrapper.innerHTML = `<span style="color:#bdc3c7; font-style:italic;">Thợ chế tác thủ công AuraCraft</span>`;
      } else {
        wrapper.innerHTML = `<span style="color:#bdc3c7; font-style:italic;">Khách hàng mua sắm</span>`;
      }
    }

    return wrapper;
  }

  // 3. Tạo ô Trạng thái & Thao tác nhanh
  function createStatusCell(user) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.flexWrap = "wrap";

    const currentStatus = (user.status || "active").toLowerCase();

    // Selectbox trạng thái
    const select = document.createElement("select");
    select.className = "filter-select";
    select.style.padding = "5px 10px";
    select.style.fontSize = "13px";
    select.style.borderRadius = "6px";
    select.style.border = "1px solid #ced4da";
    select.style.background = "#fff";
    select.setAttribute("aria-label", `Trạng thái ${user.email}`);

    Object.entries(statusLabels).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = currentStatus === value;
      select.append(option);
    });

    select.addEventListener("change", async () => {
      await updateStatus(user, select.value);
    });

    wrapper.append(select);

    // Nút duyệt nhanh nếu là thợ đang chờ duyệt
    const cleanRole = (user.role || "").toLowerCase().replace("role_", "");
    if (cleanRole === "artisan" && currentStatus === "pending") {
      const approveBtn = document.createElement("button");
      approveBtn.className = "btn btn-sm";
      approveBtn.style.padding = "4px 8px";
      approveBtn.style.fontSize = "12px";
      approveBtn.style.background = "#27ae60";
      approveBtn.style.color = "#fff";
      approveBtn.style.border = "none";
      approveBtn.style.borderRadius = "4px";
      approveBtn.style.cursor = "pointer";
      approveBtn.title = "Duyệt nhanh thợ này";
      approveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Duyệt`;
      approveBtn.addEventListener("click", async () => {
        select.value = "active";
        await updateStatus(user, "active");
      });
      wrapper.append(approveBtn);
    }

    return wrapper;
  }

  // Hàm gọi API cập nhật trạng thái
  async function updateStatus(user, newStatus) {
    try {
      feedback.style.color = "#2980b9";
      feedback.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang cập nhật trạng thái cho ${user.fullName || user.email}...`;

      const res = await fetch(`${API_BASE}/${user.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      const json = await res.json();
      if (res.ok && (json.code === 1000 || json.success)) {
        feedback.style.color = "#27ae60";
        feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã cập nhật trạng thái của <strong>${user.fullName || user.email}</strong> thành "<strong>${statusLabels[newStatus]}</strong>".`;
        user.status = newStatus;
        await fetchStats();
        await fetchUsers();
      } else {
        throw new Error(json.message || "Không thể cập nhật trạng thái.");
      }
    } catch (err) {
      feedback.style.color = "#c0392b";
      feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Lỗi: ${err.message}`;
    }
  }

  function updateStatsUI(stats) {
    document.getElementById("totalUsers").textContent = stats.totalUsers ?? 0;
    document.getElementById("buyerUsers").textContent = stats.buyerUsers ?? 0;
    document.getElementById("pendingArtisans").textContent = stats.pendingArtisans ?? 0;
    document.getElementById("suspendedUsers").textContent = stats.suspendedUsers ?? 0;
  }

  function renderTableRows(users) {
    tableBody.replaceChildren();

    if (!users || users.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    users.forEach((user) => {
      const row = document.createElement("tr");

      // Badge Vai trò
      const role = document.createElement("span");
      const cleanRole = (user.role || "").toLowerCase().replace("role_", "");

      if (cleanRole === "artisan") {
        role.className = "badge crafting";
        role.innerHTML = `<i class="fa-solid fa-hammer" style="margin-right:4px;"></i> Thợ thủ công`;
      } else if (cleanRole === "admin") {
        role.className = "badge done";
        role.innerHTML = `<i class="fa-solid fa-shield-halved" style="margin-right:4px;"></i> Quản trị viên`;
      } else {
        role.className = "badge shipping";
        role.innerHTML = `<i class="fa-solid fa-user" style="margin-right:4px;"></i> Người mua`;
      }

      // Ngày tạo
      let createdAtText = "Hôm nay";
      if (user.createdAt) {
        try {
          const d = new Date(user.createdAt);
          if (!isNaN(d.getTime())) {
            createdAtText = d.toLocaleDateString("vi-VN");
          }
        } catch (e) {}
      }

      row.append(
        createCell(createAccountCell(user)),
        createCell(role),
        createCell(createProfileCell(user)),
        createCell(createdAtText),
        createCell(createStatusCell(user))
      );
      tableBody.append(row);
    });
  }

  // 1. Lấy dữ liệu 4 thẻ thống kê
  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.result;
        if (data) {
          updateStatsUI(data);
          return true;
        }
      }
    } catch (err) {}
    return false;
  }

  // 2. Lấy danh sách tài khoản kèm bộ lọc
  async function fetchUsers() {
    const keyword = searchInput.value.trim();
    const role = roleFilter.value;
    const status = statusFilter.value;

    try {
      const url = new URL(API_BASE);
      if (role !== "all") url.searchParams.append("role", role);
      if (status !== "all") url.searchParams.append("status", status);
      if (keyword) url.searchParams.append("keyword", keyword);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json.result;
        if (Array.isArray(data)) {
          isBackendOnline = true;
          renderTableRows(data);
          return true;
        }
      }
    } catch (err) {}
    return false;
  }

  // Khởi tạo
  async function init() {
    const statsOk = await fetchStats();
    const usersOk = await fetchUsers();

    if (statsOk && usersOk) {
      isBackendOnline = true;
      feedback.style.display = "none";
      feedback.innerHTML = "";
    } else {
      feedback.style.display = "block";
      feedback.style.color = "#c0392b";
      feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Không thể kết nối với máy chủ Backend. Vui lòng kiểm tra cổng 8080.';
    }
  }

  function handleFilterChange() {
    fetchUsers();
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(handleFilterChange, 300);
  });

  roleFilter.addEventListener("change", handleFilterChange);
  statusFilter.addEventListener("change", handleFilterChange);

  init();
});