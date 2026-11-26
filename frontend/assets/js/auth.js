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
    updateCartBadge();
  } else {
    if (navLogin) navLogin.style.display = "";
    if (navProfile) navProfile.style.display = "none";
    if (navLogout) navLogout.style.display = "none";
    const badge = document.getElementById("cartBadge");
    if (badge) badge.style.display = "none";
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

  // ============================================================
  // QUY TRÌNH KHÔI PHỤC MẬT KHẨU (3 BƯỚC + THÀNH CÔNG)
  // ============================================================
  const forgotEmailForm = document.getElementById("forgotEmailForm");
  const verifyOtpForm = document.getElementById("verifyOtpForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  if (forgotEmailForm || verifyOtpForm || resetPasswordForm) {
    const API_BASE_AUTH = `${API_BASE}/auth`;
    let recoveryEmail = "";
    let verifiedOtpCode = "";
    let resendCountdown = 60;
    let resendTimerId = null;

    const stepEmail = document.getElementById("stepEmail");
    const stepOtp = document.getElementById("stepOtp");
    const stepReset = document.getElementById("stepReset");
    const stepSuccess = document.getElementById("stepSuccess");

    const emailInput = document.getElementById("recoveryEmail");
    const emailGroup = document.getElementById("emailGroup");
    const emailError = document.getElementById("emailError");
    const btnSendOtp = document.getElementById("btnSendOtp");
    const emailSpinner = document.getElementById("emailSpinner");

    const otpInput = document.getElementById("otpCode");
    const otpGroup = document.getElementById("otpGroup");
    const otpError = document.getElementById("otpError");
    const btnVerifyOtp = document.getElementById("btnVerifyOtp");
    const otpSpinner = document.getElementById("otpSpinner");
    const btnResendOtp = document.getElementById("btnResendOtp");
    const btnBackToEmail = document.getElementById("btnBackToEmail");
    const displayEmail = document.getElementById("displayEmail");

    const resetAccountEmail = document.getElementById("resetAccountEmail");
    const newPasswordInput = document.getElementById("newPassword");
    const newPassGroup = document.getElementById("newPassGroup");
    const newPassError = document.getElementById("newPassError");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const confirmPassGroup = document.getElementById("confirmPassGroup");
    const confirmPassError = document.getElementById("confirmPassError");
    const btnSubmitReset = document.getElementById("btnSubmitReset");
    const resetSpinner = document.getElementById("resetSpinner");
    const countdownRedirect = document.getElementById("countdownRedirect");

    function showStep(stepToShow) {
      if (stepEmail) stepEmail.style.display = stepToShow === "email" ? "block" : "none";
      if (stepOtp) stepOtp.style.display = stepToShow === "otp" ? "block" : "none";
      if (stepReset) stepReset.style.display = stepToShow === "reset" ? "block" : "none";
      if (stepSuccess) stepSuccess.style.display = stepToShow === "success" ? "block" : "none";
    }

    function startResendCountdown() {
      if (resendTimerId) clearInterval(resendTimerId);
      resendCountdown = 60;
      if (btnResendOtp) {
        btnResendOtp.disabled = true;
        btnResendOtp.innerHTML = `Gửi lại (<span id="resendTimer">${resendCountdown}</span>s)`;
      }
      resendTimerId = setInterval(() => {
        resendCountdown--;
        const timerSpan = document.getElementById("resendTimer");
        if (timerSpan) timerSpan.textContent = resendCountdown;
        if (resendCountdown <= 0) {
          clearInterval(resendTimerId);
          resendTimerId = null;
          if (btnResendOtp) {
            btnResendOtp.disabled = false;
            btnResendOtp.textContent = "Gửi lại mã OTP";
          }
        }
      }, 1000);
    }

    // Gửi yêu cầu OTP về email thật qua Backend API
    async function sendOtpRequest(emailVal) {
      let response;
      try {
        response = await fetch(`${API_BASE_AUTH}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailVal })
        });
      } catch (networkErr) {
        throw new Error("Không thể kết nối máy chủ Backend (cổng 8080). Vui lòng kiểm tra server.");
      }

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errMsg = data?.message || "Không thể gửi mã xác thực. Vui lòng kiểm tra lại.";
        throw new Error(errMsg);
      }
    }

    // ---- BƯỚC 1: XỬ LÝ GỬI OTP QUA EMAIL TÀI KHOẢN ĐĂNG KÝ ----
    if (forgotEmailForm) {
      forgotEmailForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailVal = emailInput.value.trim();

        if (!emailVal || !isValidEmail(emailVal)) {
          emailGroup.classList.add("invalid");
          emailError.textContent = "Vui lòng nhập địa chỉ email hợp lệ.";
          return;
        }
        emailGroup.classList.remove("invalid");

        if (btnSendOtp) btnSendOtp.disabled = true;
        if (emailSpinner) emailSpinner.style.display = "block";

        try {
          await sendOtpRequest(emailVal);
          recoveryEmail = emailVal;
          if (displayEmail) displayEmail.textContent = recoveryEmail;
          if (resetAccountEmail) resetAccountEmail.textContent = recoveryEmail;

          // Chuyển sang Bước 2: Nhập OTP
          showStep("otp");
          startResendCountdown();
          if (otpInput) {
            otpInput.value = "";
            otpInput.focus();
          }
        } catch (err) {
          emailGroup.classList.add("invalid");
          emailError.textContent = err.message || "Gửi OTP thất bại. Vui lòng thử lại.";
        } finally {
          if (btnSendOtp) btnSendOtp.disabled = false;
          if (emailSpinner) emailSpinner.style.display = "none";
        }
      });
    }

    // Nút gửi lại OTP ở Bước 2
    if (btnResendOtp) {
      btnResendOtp.addEventListener("click", async () => {
        if (!recoveryEmail || btnResendOtp.disabled) return;
        btnResendOtp.disabled = true;
        try {
          await sendOtpRequest(recoveryEmail);
          startResendCountdown();
          if (otpGroup) otpGroup.classList.remove("invalid");
          alert("Mã OTP mới đã được gửi về email " + recoveryEmail);
        } catch (err) {
          alert(err.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
          btnResendOtp.disabled = false;
        }
      });
    }

    // Nút quay lại nhập email
    if (btnBackToEmail) {
      btnBackToEmail.addEventListener("click", (e) => {
        e.preventDefault();
        showStep("email");
        if (emailInput) emailInput.focus();
      });
    }

    // ---- BƯỚC 2: XÁC THỰC MÃ OTP ----
    if (verifyOtpForm) {
      verifyOtpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otpVal = otpInput.value.trim();

        if (!/^\d{6}$/.test(otpVal)) {
          otpGroup.classList.add("invalid");
          otpError.textContent = "Mã OTP phải gồm 6 chữ số.";
          return;
        }
        otpGroup.classList.remove("invalid");

        if (btnVerifyOtp) btnVerifyOtp.disabled = true;
        if (otpSpinner) otpSpinner.style.display = "block";

        try {
          let response;
          try {
            response = await fetch(`${API_BASE_AUTH}/verify-otp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: recoveryEmail, otpCode: otpVal })
            });
          } catch (networkErr) {
            throw new Error("Không thể kết nối máy chủ Backend (cổng 8080). Vui lòng kiểm tra lại.");
          }

          const data = await response.json().catch(() => null);
          if (!response.ok) {
            const errMsg = data?.message || "Mã OTP không chính xác hoặc đã hết hiệu lực.";
            throw new Error(errMsg);
          }

          // OTP HỢP LỆ -> LƯU MÃ VÀ CHUYỂN SANG BƯỚC 3 (ĐẶT LẠI MẬT KHẨU)
          verifiedOtpCode = otpVal;
          showStep("reset");
          if (newPasswordInput) newPasswordInput.focus();

        } catch (err) {
          otpGroup.classList.add("invalid");
          otpError.textContent = err.message || "Mã OTP không chính xác hoặc đã hết hiệu lực.";
        } finally {
          if (btnVerifyOtp) btnVerifyOtp.disabled = false;
          if (otpSpinner) otpSpinner.style.display = "none";
        }
      });
    }

    // ---- BƯỚC 3: ĐẶT LẠI MẬT KHẨU (SAU KHI NHẬP ĐÚNG OTP MỚI ĐƯỢC CHUYỂN SANG ĐÂY) ----
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;
        let isValid = true;

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,72}$/;
        if (!passRegex.test(newPass)) {
          newPassGroup.classList.add("invalid");
          newPassError.textContent = "Mật khẩu phải từ 8 đến 72 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&).";
          isValid = false;
        } else {
          newPassGroup.classList.remove("invalid");
        }

        if (newPass !== confirmPass) {
          confirmPassGroup.classList.add("invalid");
          confirmPassError.textContent = "Mật khẩu xác nhận không khớp.";
          isValid = false;
        } else {
          confirmPassGroup.classList.remove("invalid");
        }

        if (!isValid) return;

        if (btnSubmitReset) btnSubmitReset.disabled = true;
        if (resetSpinner) resetSpinner.style.display = "block";

        try {
          let response;
          try {
            response = await fetch(`${API_BASE_AUTH}/reset-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: recoveryEmail,
                otpCode: verifiedOtpCode,
                newPassword: newPass,
                confirmPassword: confirmPass
              })
            });
          } catch (networkErr) {
            throw new Error("Không thể kết nối máy chủ Backend (cổng 8080). Vui lòng kiểm tra lại.");
          }

          const data = await response.json().catch(() => null);
          if (!response.ok) {
            const errMsg = data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
            throw new Error(errMsg);
          }

          // THÀNH CÔNG -> Chuyển sang Bước 4 (Success State)
          showStep("success");

          // Tự động chuyển về trang Đăng nhập sau 3 giây
          let secondsLeft = 3;
          if (countdownRedirect) countdownRedirect.textContent = secondsLeft;
          const redirectInterval = setInterval(() => {
            secondsLeft--;
            if (countdownRedirect) countdownRedirect.textContent = secondsLeft;
            if (secondsLeft <= 0) {
              clearInterval(redirectInterval);
              window.location.href = "login.html";
            }
          }, 1000);

        } catch (err) {
          newPassGroup.classList.add("invalid");
          newPassError.textContent = err.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
        } finally {
          if (btnSubmitReset) btnSubmitReset.disabled = false;
          if (resetSpinner) resetSpinner.style.display = "none";
        }
      });
    }
  }
});
