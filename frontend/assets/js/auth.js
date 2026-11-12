// ============================================================
// AuraCraft — auth.js (kết nối với Backend API thật)
// ============================================================

const API_BASE = "http://localhost:8080/api";

// ---- Helper: Lưu / Đọc session ----
function saveSession(data) {
  localStorage.setItem("auracraft_token", data.accessToken);
  localStorage.setItem("auracraft_refresh", data.refreshToken);
  localStorage.setItem("auracraft_user", JSON.stringify(data.userSummary));
  // Đồng bộ thêm để tương thích ngược với code cũ
  localStorage.setItem("currentUser", JSON.stringify({
    fullName: data.userSummary.fullName,
    email: data.userSummary.email,
    role: (data.userSummary.role || "").replace("ROLE_", "").toLowerCase()
  }));
}

function getToken() {
  return localStorage.getItem("auracraft_token");
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("auracraft_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken() && !!getCurrentUser();
}

function logout() {
  const token = localStorage.getItem("auracraft_refresh");
  if (token) {
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify({ refreshToken: token })
    }).catch(() => {});
  }
  localStorage.removeItem("auracraft_token");
  localStorage.removeItem("auracraft_refresh");
  localStorage.removeItem("auracraft_user");
  localStorage.removeItem("currentUser");
  window.location.reload();
}

// ---- Cập nhật số lượng sản phẩm trên icon Giỏ hàng ----
async function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (!isLoggedIn()) {
    badge.style.display = "none";
    badge.textContent = "0";
    return;
  }
  try {
    const res = await apiFetch("GET", "/cart");
    if (res && res.items && res.items.length > 0) {
      const totalQty = res.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      if (totalQty > 0) {
        badge.textContent = totalQty > 99 ? "99+" : totalQty;
        badge.style.display = "inline-block";
      } else {
        badge.style.display = "none";
        badge.textContent = "0";
      }
    } else {
      badge.style.display = "none";
      badge.textContent = "0";
    }
  } catch (e) {
    badge.style.display = "none";
  }
}

// ---- Expose global API helper ----
window.AuraCraft = {
  API_BASE,
  getToken,
  getCurrentUser,
  isLoggedIn,
  logout,
  updateCartBadge,
  apiGet: (path) => apiFetch("GET", path),
  apiPost: (path, body) => apiFetch("POST", path, body),
  apiPut: (path, body) => apiFetch("PUT", path, body),
  apiDelete: (path) => apiFetch("DELETE", path),
};

async function apiFetch(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.message || `Lỗi ${res.status}`;
    throw new Error(msg);
  }
  return json.result;
}

// ---- Toggle hiện/ẩn mật khẩu ----
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.className = "fa-regular fa-eye-slash";
  } else {
    input.type = "password";
    if (icon) icon.className = "fa-regular fa-eye";
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Điều hướng theo role hoặc tham số redirect ----
function redirectByRole(role) {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (redirect) {
    window.location.href = redirect;
    return;
  }
  const r = (role || "").toUpperCase();
  if (r === "ROLE_ADMIN") {
    window.location.href = "admin-orders.html";
  } else if (r === "ROLE_ARTISAN") {
    window.location.href = "seller-dashboard.html";
  } else {
    window.location.href = "../index.html";
  }
}

function syncHeaderAuth() {
  const navLogin = document.getElementById("nav-login");
  const navProfile = document.getElementById("nav-profile");
  if (!navLogin && !navProfile) return;
  if (isLoggedIn()) {
    if (navLogin) navLogin.style.display = "none";
    if (navProfile) {
      navProfile.style.display = "inline-flex";
      const user = getCurrentUser();
      if (user && user.fullName) {
        navProfile.setAttribute("title", user.fullName + " (" + (user.role || "") + ")");
      }
    }
    updateCartBadge();
  } else {
    if (navLogin) navLogin.style.display = "";
    if (navProfile) navProfile.style.display = "none";
    const badge = document.getElementById("cartBadge");
    if (badge) badge.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Đồng bộ header
  const hp = document.getElementById("header-placeholder");
  if (hp) {
    const observer = new MutationObserver(() => syncHeaderAuth());
    observer.observe(hp, { childList: true, subtree: true });
  }
  setTimeout(syncHeaderAuth, 300);
  setTimeout(syncHeaderAuth, 800);

  // ==============================
  // FORM ĐĂNG NHẬP
  // ==============================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("email");
      const passInput = document.getElementById("password");
      const btnSubmit = document.getElementById("btnSubmit");
      const btnSpinner = document.getElementById("btnSpinner");

      const emailVal = emailInput.value.trim();
      const passVal = passInput.value;
      let isValid = true;

      if (!emailVal) {
        emailInput.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        emailInput.closest(".input-group").classList.remove("invalid");
      }

      if (passVal.length < 6) {
        passInput.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        passInput.closest(".input-group").classList.remove("invalid");
      }

      if (!isValid) return;

      if (btnSubmit) btnSubmit.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "block";

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernameOrEmail: emailVal, password: passVal }),
        });
        const json = await res.json();

        if (!res.ok) {
          const msg = json?.message || "Tài khoản hoặc mật khẩu không chính xác.";
          emailInput.closest(".input-group").classList.add("invalid");
          const errEl = emailInput.closest(".input-group").querySelector(".error-msg");
          if (errEl) errEl.textContent = msg;
          return;
        }

        saveSession(json.result);
        const user = json.result.userSummary;
        redirectByRole(user.role);
      } catch (err) {
        const errEl = emailInput.closest(".input-group").querySelector(".error-msg");
        if (errEl) errEl.textContent = "Không thể kết nối server (Spring Boot port 8080). Vui lòng thử lại.";
        emailInput.closest(".input-group").classList.add("invalid");
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  }

  // ==============================
  // FORM ĐĂNG KÝ
  // ==============================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const accountRole = document.getElementById("accountRole");
    const artisanFields = document.getElementById("artisanFields");

    function updateArtisanFields() {
      if (!accountRole || !artisanFields) return;
      const isArtisan = accountRole.value === "artisan";
      artisanFields.hidden = !isArtisan;
      const intro = document.getElementById("introduction");
      const port = document.getElementById("portfolio");
      if (intro) intro.required = isArtisan;
      if (port) port.required = isArtisan;
    }

    if (accountRole) {
      accountRole.addEventListener("change", updateArtisanFields);
      updateArtisanFields();
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullNameEl = document.getElementById("fullName");
      const emailEl = document.getElementById("email");
      const passwordEl = document.getElementById("password");
      const confirmPasswordEl = document.getElementById("confirmPassword");
      const usernameEl = document.getElementById("username");
      const phoneEl = document.getElementById("phone");
      let isValid = true;

      if (!fullNameEl.value.trim()) {
        fullNameEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        fullNameEl.closest(".input-group").classList.remove("invalid");
      }

      if (!isValidEmail(emailEl.value.trim())) {
        emailEl.closest(".input-group").classList.add("invalid");
        const errEl = emailEl.closest(".input-group").querySelector(".error-msg");
        if (errEl) errEl.textContent = "Vui lòng nhập email hợp lệ.";
        isValid = false;
      } else {
        emailEl.closest(".input-group").classList.remove("invalid");
      }

      if (passwordEl.value.length < 6) {
        passwordEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        passwordEl.closest(".input-group").classList.remove("invalid");
      }

      if (!confirmPasswordEl.value || confirmPasswordEl.value !== passwordEl.value) {
        confirmPasswordEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        confirmPasswordEl.closest(".input-group").classList.remove("invalid");
      }

      if (!isValid) return;

      const usernameVal = usernameEl && usernameEl.value.trim() 
        ? usernameEl.value.trim() 
        : emailEl.value.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);

      const payload = {
        username: usernameVal,
        email: emailEl.value.trim(),
        password: passwordEl.value,
        fullName: fullNameEl.value.trim(),
        phone: phoneEl ? phoneEl.value.trim() : "",
      };

      const btnSubmit = document.getElementById("btnSubmit");
      if (btnSubmit) btnSubmit.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (!res.ok) {
          const msg = json?.message || "Đăng ký thất bại.";
          emailEl.closest(".input-group").classList.add("invalid");
          const errEl = emailEl.closest(".input-group").querySelector(".error-msg");
          if (errEl) errEl.textContent = msg;
          return;
        }

        saveSession(json.result);
        alert("Đăng ký tài khoản thành công! Dữ liệu đã được lưu vào cơ sở dữ liệu.");
        window.location.href = "../index.html";
      } catch (err) {
        alert("Không thể kết nối server (Spring Boot port 8080). Vui lòng thử lại.");
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
      }
    });
  }

  // ==============================
  // FORM QUÊN MẬT KHẨU
  // ==============================
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const recoveryEmail = document.getElementById("recoveryEmail");
      const emailGroup = document.getElementById("emailGroup");

      if (!isValidEmail(recoveryEmail.value.trim())) {
        emailGroup.classList.add("invalid");
        return;
      }

      emailGroup.classList.remove("invalid");

      try {
        await fetch(`${API_BASE}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail.value.trim() }),
        });
      } catch (err) {
      }

      const requestState = document.getElementById("requestState");
      const successState = document.getElementById("successState");
      if (requestState) requestState.style.display = "none";
      if (successState) successState.style.display = "block";
    });
  }
});
