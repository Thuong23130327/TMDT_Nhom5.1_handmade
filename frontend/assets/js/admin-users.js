document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("userSearch");
  const roleFilter = document.getElementById("roleFilter");
  const statusFilter = document.getElementById("statusFilter");
  const emptyState = document.getElementById("emptyUsers");
  const feedback = document.getElementById("userFeedback");

  // Địa chỉ API Spring Boot Backend
  const API_BASE = "http://localhost:8080/api/v1/admin/users";
  let isBackendOnline = false;
  let debounceTimeout = null;

  const roleLabels = { 
    buyer: "Người mua", 
    artisan: "Thợ thủ công",
    admin: "Quản trị viên"
  };

  const statusLabels = {
    active: "Đang hoạt động",
    pending: "Chờ duyệt",
    suspended: "Tạm khóa"
  };

  function createCell(content, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    return cell;
  }

  function createAccountCell(user) {
    const content = document.createElement("div");
    const name = document.createElement("span");
    const email = document.createElement("span");
    name.className = "user-name";
    name.textContent = user.fullName || "Chưa có tên";
    email.className = "user-email";
    email.textContent = user.email || "Chưa có email";
    content.append(name, email);
    return content;
  }

  function createProfileCell(user) {
    const content = document.createElement("div");
    content.className = "user-profile-summary";
    content.textContent = user.introduction || "Chưa có thông tin giới thiệu.";

    const portfolioUrl = user.portfolio || user.portfolioUrl;
    if (portfolioUrl) {
      try {
        const parsedUrl = new URL(portfolioUrl);
        if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
          const link = document.createElement("a");
          link.className = "user-portfolio";
          link.href = parsedUrl.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Mở portfolio";
          content.append(document.createElement("br"), link);
        }
      } catch (error) {
        // Bỏ qua nếu url không đúng định dạng
      }
    }

    return content;
  }

  function createStatusSelect(user) {
    const select = document.createElement("select");
    select.className = "filter-select";
    select.style.padding = "6px 12px";
    select.style.fontSize = "13px";
    select.style.borderRadius = "6px";
    select.setAttribute("aria-label", `Trạng thái tài khoản ${user.email}`);

    const currentStatus = (user.status || "active").toLowerCase();

    Object.entries(statusLabels).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = currentStatus === value;
      select.append(option);
    });

    select.addEventListener("change", async () => {
      const newStatus = select.value;
      if (isBackendOnline) {
        // GỌI API PUT THẬT VỀ SPRING BOOT
        try {
          feedback.style.color = "#2980b9";
          feedback.textContent = `Đang cập nhật trạng thái cho ${user.email}...`;

          const res = await fetch(`${API_BASE}/${user.id}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
          });

          const json = await res.json();
          if (json.success) {
            feedback.style.color = "#27ae60";
            feedback.textContent = `✓ Đã cập nhật trạng thái của ${user.email} thành "${statusLabels[newStatus]}".`;
            user.status = newStatus;
            // Làm mới lại 4 số thẻ thống kê và danh sách
            await fetchStats();
            await fetchUsers();
          } else {
            throw new Error(json.message || "Cập nhật thất bại");
          }
        } catch (error) {
          feedback.style.color = "#c0392b";
          feedback.textContent = `✕ Lỗi cập nhật: ${error.message}`;
          select.value = currentStatus; // Phục hồi giá trị cũ
        }
      } else {
        // DỰ PHÒNG NẾU CHƯA BẬT BACKEND: Cập nhật qua localStorage
        try {
          if (window.AuraCraftUsers && window.AuraCraftUsers.updateStatus(user.id, newStatus)) {
            feedback.style.color = "#e67e22";
            feedback.textContent = `[Dữ liệu mẫu] Đã đổi trạng thái ${user.email} thành "${statusLabels[newStatus]}".`;
            loadLocalData();
          }
        } catch (err) {
          feedback.textContent = err.message;
        }
      }
    });

    return select;
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
      const role = document.createElement("span");
      const cleanRole = (user.role || "").toLowerCase().replace("role_", "");

      if (cleanRole === "artisan") {
        role.className = "badge crafting";
        role.textContent = "Thợ thủ công";
      } else if (cleanRole === "admin") {
        role.className = "badge done";
        role.textContent = "Quản trị viên";
      } else {
        role.className = "badge shipping";
        role.textContent = "Người mua";
      }

      const createdAt = user.createdAt
        ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(user.createdAt))
        : "Không rõ";

      row.append(
        createCell(createAccountCell(user)),
        createCell(role),
        createCell(createProfileCell(user)),
        createCell(createdAt),
        createCell(createStatusSelect(user))
      );
      tableBody.append(row);
    });
  }

  // 1. Gọi API Backend lấy 4 số thẻ thống kê
  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        updateStatsUI(json.data);
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  }

  // 2. Gọi API Backend lấy danh sách người dùng kèm bộ lọc
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        isBackendOnline = true;
        renderTableRows(json.data);
        return true;
      }
    } catch (err) {
      isBackendOnline = false;
      return false;
    }
    return false;
  }

  // Cơ chế dự phòng khi Backend chưa bật (dùng localStorage để giao diện vẫn hiển thị đẹp)
  function loadLocalData() {
    if (!window.AuraCraftUsers) return;
    const users = window.AuraCraftUsers.getAll();
    const keyword = searchInput.value.trim().toLowerCase();
    const visibleUsers = users
      .filter((user) => {
        const searchableText = `${user.fullName || ""} ${user.email || ""}`.toLowerCase();
        return searchableText.includes(keyword)
          && (roleFilter.value === "all" || user.role === roleFilter.value)
          && (statusFilter.value === "all" || user.status === statusFilter.value);
      })
      .sort((first, second) => (second.createdAt || "").localeCompare(first.createdAt || ""));

    updateStatsUI({
      totalUsers: users.length,
      buyerUsers: users.filter((u) => u.role === "buyer").length,
      pendingArtisans: users.filter((u) => u.role === "artisan" && u.status === "pending").length,
      suspendedUsers: users.filter((u) => u.status === "suspended").length
    });

    renderTableRows(visibleUsers);
  }

  // Khởi động trang web: Ưu tiên gọi API Backend, nếu chưa bật thì fallback
  async function init() {
    const statsOk = await fetchStats();
    const usersOk = await fetchUsers();

    if (statsOk && usersOk) {
      isBackendOnline = true;
      feedback.style.color = "#27ae60";
      feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đang kết nối trực tiếp CSDL MySQL qua Spring Boot API (cổng 8080).';
    } else {
      isBackendOnline = false;
      feedback.style.color = "#e67e22";
      feedback.innerHTML = '<i class="fa-solid fa-circle-info"></i> Đang chạy chế độ dữ liệu xem trước. Bật Spring Boot (cổng 8080) để kết nối MySQL thực tế!';
      loadLocalData();
    }
  }

  // Lắng nghe sự kiện tìm kiếm và bộ lọc
  function handleFilterChange() {
    if (isBackendOnline) {
      fetchUsers();
    } else {
      loadLocalData();
    }
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(handleFilterChange, 300);
  });

  roleFilter.addEventListener("change", handleFilterChange);
  statusFilter.addEventListener("change", handleFilterChange);

  // Chạy khởi tạo
  init();
});