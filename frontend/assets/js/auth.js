const API_BASE = "http://localhost:8080/api";

function saveSession(data) {
  localStorage.setItem("auracraft_token", data.accessToken);
  localStorage.setItem("auracraft_refresh", data.refreshToken);
  localStorage.setItem("auracraft_user", JSON.stringify(data.userSummary));
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
  } catch (e) {
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
  sessionStorage.clear();

  const pathname = window.location.pathname;
  const isPagesDir = pathname.includes("/pages/");
  const needsAuthPage = pathname.includes("profile") || pathname.includes("checkout") || pathname.includes("admin") || pathname.includes("seller");

  if (needsAuthPage) {
    window.location.href = isPagesDir ? "login.html" : "pages/login.html";
  } else {
    window.location.reload();
  }
}

window.logout = logout;

window.AuraCraft = {
  API_BASE,
  getToken,
  getCurrentUser,
  isLoggedIn,
  logout,
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
    if (res.status === 401) {
      localStorage.removeItem("auracraft_token");
      localStorage.removeItem("auracraft_user");
      localStorage.removeItem("currentUser");
    }
    const msg = json?.message || `Lỗi ${res.status}`;
    throw new Error(msg);
  }
  return json.result;
}

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
  if (window.location.pathname.includes("/pages/")) {
    document.querySelectorAll('a[href="index.html"]').forEach(a => {
      a.setAttribute("href", "../index.html");
    });
  }

  const navLogin = document.getElementById("nav-login");
  const navProfile = document.getElementById("nav-profile");
  const navLogout = document.getElementById("nav-logout");

  if (isLoggedIn()) {
    if (navLogin) navLogin.style.display = "none";
    if (navProfile) {
      navProfile.style.display = "inline-flex";
      const user = getCurrentUser();
      if (user && user.fullName) {
        navProfile.setAttribute("title", user.fullName + " (" + (user.role || "") + ")");
      }
    }
    if (navLogout) navLogout.style.display = "inline-flex";
  } else {
    if (navLogin) navLogin.style.display = "";
    if (navProfile) navProfile.style.display = "none";
    if (navLogout) navLogout.style.display = "none";
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="logout"], .logout-item a, #nav-logout, #btnLogout');
  if (btn) {
    e.preventDefault();
    logout();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const hp = document.getElementById("header-placeholder");
  if (hp) {
    const observer = new MutationObserver(() => syncHeaderAuth());
    observer.observe(hp, { childList: true, subtree: true });
  }
  setTimeout(syncHeaderAuth, 300);
  setTimeout(syncHeaderAuth, 800);

  // Form dang nhap
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
          const msg = json?.message || "Tên đăng nhập hoặc mật khẩu không chính xác.";
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
        if (errEl) errEl.textContent = "Không thể kết nối máy chủ. Vui lòng thử lại.";
        emailInput.closest(".input-group").classList.add("invalid");
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  }

  // Form dang ky
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
          const msg = json?.message || "Đăng ký không thành công.";
          emailEl.closest(".input-group").classList.add("invalid");
          const errEl = emailEl.closest(".input-group").querySelector(".error-msg");
          if (errEl) errEl.textContent = msg;
          return;
        }

        saveSession(json.result);
        alert("Đăng ký tài khoản thành công!");
        window.location.href = "../index.html";
      } catch (err) {
        alert("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
      }
    });
  }

  // Form quen mat khau - Buoc 1: Gui OTP
  let currentRecoveryEmail = "";
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const recoveryEmail = document.getElementById("recoveryEmail");
      const emailGroup = document.getElementById("emailGroup");
      const submitBtn = document.getElementById("submitBtn");
      const btnSpinner = document.getElementById("btnSpinner");

      if (!isValidEmail(recoveryEmail.value.trim())) {
        emailGroup.classList.add("invalid");
        return;
      }

      emailGroup.classList.remove("invalid");
      currentRecoveryEmail = recoveryEmail.value.trim();

      if (submitBtn) submitBtn.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "block";

      try {
        await fetch(`${API_BASE}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentRecoveryEmail }),
        });

        const requestState = document.getElementById("requestState");
        const resetState = document.getElementById("resetState");
        const resetSubtitle = document.getElementById("resetSubtitle");

        if (requestState) requestState.style.display = "none";
        if (resetState) {
          resetState.style.display = "block";
          if (resetSubtitle) {
            resetSubtitle.textContent = `Mã xác thực OTP đã được gửi về email ${currentRecoveryEmail}. Vui lòng nhập mã và mật khẩu mới.`;
          }
        }
      } catch (err) {
        alert("Không thể gửi email xác thực: " + err.message);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  }

  // Form quen mat khau - Buoc 2: Nhap OTP va doi mat khau
  const resetForm = document.getElementById("resetForm");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otpCodeEl = document.getElementById("otpCode");
      const newPasswordEl = document.getElementById("newPassword");
      const confirmNewPasswordEl = document.getElementById("confirmNewPassword");
      const btnResetSubmit = document.getElementById("btnResetSubmit");
      const btnResetSpinner = document.getElementById("btnResetSpinner");

      let isValid = true;

      if (!otpCodeEl.value.trim() || otpCodeEl.value.trim().length < 4) {
        otpCodeEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        otpCodeEl.closest(".input-group").classList.remove("invalid");
      }

      if (newPasswordEl.value.length < 6) {
        newPasswordEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        newPasswordEl.closest(".input-group").classList.remove("invalid");
      }

      if (!confirmNewPasswordEl.value || confirmNewPasswordEl.value !== newPasswordEl.value) {
        confirmNewPasswordEl.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        confirmNewPasswordEl.closest(".input-group").classList.remove("invalid");
      }

      if (!isValid) return;

      if (btnResetSubmit) btnResetSubmit.disabled = true;
      if (btnResetSpinner) btnResetSpinner.style.display = "block";

      try {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentRecoveryEmail,
            otpCode: otpCodeEl.value.trim(),
            newPassword: newPasswordEl.value,
            confirmPassword: confirmNewPasswordEl.value,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          const msg = json?.message || "Đổi mật khẩu thất bại.";
          alert(msg);
          return;
        }

        const resetState = document.getElementById("resetState");
        const successState = document.getElementById("successState");
        if (resetState) resetState.style.display = "none";
        if (successState) successState.style.display = "block";
      } catch (err) {
        alert("Lỗi khi đặt lại mật khẩu: " + err.message);
      } finally {
        if (btnResetSubmit) btnResetSubmit.disabled = false;
        if (btnResetSpinner) btnResetSpinner.style.display = "none";
      }
    });
  }
});
