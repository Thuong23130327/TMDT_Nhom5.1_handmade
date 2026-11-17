// Dữ liệu tài khoản mặc định phục vụ kiểm thử phân quyền
const MOCK_USERS = [
  {
    email: "admin@auracraft.com",
    password: "password123",
    role: "admin",
    fullName: "Quản Trị Viên",
  },
  {
    email: "artisan@auracraft.com",
    password: "password123",
    role: "artisan",
    fullName: "Thợ Thủ Công",
  },
  {
    email: "buyer@auracraft.com",
    password: "password123",
    role: "buyer",
    fullName: "Khách Hàng",
  },
];

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

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("email");
      const passInput = document.getElementById("password");
      let isValid = true;

      const emailVal = emailInput.value.trim();
      const passVal = passInput.value;

      // Validate email/username
      if (!emailVal) {
        emailInput.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        emailInput.closest(".input-group").classList.remove("invalid");
      }

      // Validate password length
      if (passVal.length < 6) {
        passInput.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        passInput.closest(".input-group").classList.remove("invalid");
      }

      if (!isValid) return;

      const btnSubmit = document.getElementById("btnSubmit");
      const btnSpinner = document.getElementById("btnSpinner");
      if (btnSubmit) btnSubmit.disabled = true;
      if (btnSpinner) btnSpinner.style.display = "block";

      try {
        // Thử kết nối API Backend trước
        let loginSuccess = false;
        try {
          const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameOrEmail: emailVal, password: passVal }),
          });
          const json = await res.json().catch(() => null);

          if (!res.ok) {
            const msg = json?.message || "Tài khoản hoặc mật khẩu không chính xác.";
            emailInput.closest(".input-group").classList.add("invalid");
            const errEl = emailInput.closest(".input-group").querySelector(".error-msg");
            if (errEl) errEl.textContent = msg;
            return;
          }

          if (json && json.result) {
            const authData = json.result;
            if (authData.accessToken) localStorage.setItem("auracraft_token", authData.accessToken);
            if (authData.refreshToken) localStorage.setItem("auracraft_refresh", authData.refreshToken);
            const userSummary = authData.userSummary || {};
            const cleanRole = (userSummary.role || "ROLE_BUYER").replace("ROLE_", "").toLowerCase();
            const currentUser = {
              fullName: userSummary.fullName || emailVal,
              email: userSummary.email || emailVal,
              role: cleanRole
            };
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            loginSuccess = true;

            alert(`Đăng nhập thành công! Chào mừng ${currentUser.fullName}.`);
            switch (currentUser.role) {
              case "admin":
                window.location.href = "admin-orders.html";
                break;
              case "artisan":
                window.location.href = "seller-dashboard.html";
                break;
              case "buyer":
              default:
                window.location.href = "../index.html";
                break;
            }
            return;
          }
        } catch (apiErr) {
          // Backend offline -> Fallback vào LocalStorage / Mock
          console.warn("[AuraCraft] Backend offline, chuyển sang kiểm tra tài khoản cục bộ:", apiErr);
        }

        // Lấy danh sách user đã đăng ký (từ localStorage) kết hợp với tài khoản mặc định
        const registeredUsers =
          JSON.parse(localStorage.getItem("AuraCraftUsers")) || [];
        const allUsers = [...MOCK_USERS, ...registeredUsers];

        // Tìm kiếm user phù hợp
        const matchedUser = allUsers.find(
          (u) =>
            u.email.toLowerCase() === emailVal.toLowerCase() &&
            u.password === passVal,
        );

        if (!matchedUser) {
          emailInput.closest(".input-group").classList.add("invalid");
          const errorMsg = emailInput
            .closest(".input-group")
            .querySelector(".error-msg");
          if (errorMsg)
            errorMsg.textContent = "Tài khoản hoặc mật khẩu không chính xác.";
          return;
        }

        // Lưu thông tin phiên đăng nhập (Session)
        const currentUser = {
          fullName: matchedUser.fullName,
          email: matchedUser.email,
          role: matchedUser.role,
        };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        alert(`Đăng nhập thành công! Chào mừng ${currentUser.fullName}.`);

        // Điều hướng dựa trên vai trò (Role-based Routing)
        switch (currentUser.role) {
          case "admin":
            window.location.href = "admin-orders.html";
            break;
          case "artisan":
            window.location.href = "seller-dashboard.html";
            break;
          case "buyer":
          default:
            window.location.href = "../index.html";
            break;
        }
      } finally {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  }

  // Khởi tạo hệ thống quản lý user giả lập cho trang đăng ký
  window.AuraCraftUsers = {
    create: (newUser) => {
      const existingUsers =
        JSON.parse(localStorage.getItem("AuraCraftUsers")) || [];
      const isExist = [...MOCK_USERS, ...existingUsers].some(
        (u) => u.email.toLowerCase() === newUser.email.toLowerCase(),
      );

      if (isExist) {
        throw new Error("Email này đã được sử dụng.");
      }

      existingUsers.push(newUser);
      localStorage.setItem("AuraCraftUsers", JSON.stringify(existingUsers));
      return newUser;
    },
  };

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const accountRole = document.getElementById("accountRole");
    const artisanFields = document.getElementById("artisanFields");
    const updateArtisanFields = () => {
      if (!accountRole || !artisanFields) return;
      const isArtisan = accountRole.value === "artisan";
      artisanFields.hidden = !isArtisan;
      const intro = document.getElementById("introduction");
      const port = document.getElementById("portfolio");
      if (intro) intro.required = isArtisan;
      if (port) port.required = isArtisan;
    };

    if (accountRole) {
      accountRole.addEventListener("change", updateArtisanFields);
      updateArtisanFields();
    }

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("fullName");
      const email = document.getElementById("email");
      const password = document.getElementById("password");
      const confirmPassword = document.getElementById("confirmPassword");
      const accountRole = document.getElementById("accountRole");
      const introduction = document.getElementById("introduction");
      const portfolio = document.getElementById("portfolio");
      let isValid = true;

      if (!fullName.value.trim()) {
        fullName.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        fullName.closest(".input-group").classList.remove("invalid");
      }

      if (!isValidEmail(email.value.trim())) {
        email.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        email.closest(".input-group").classList.remove("invalid");
        email.closest(".input-group").querySelector(".error-msg").textContent = "Vui lòng nhập email hợp lệ.";
      }

      if (password.value.length < 6) {
        password.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        password.closest(".input-group").classList.remove("invalid");
      }

      if (!confirmPassword.value || confirmPassword.value !== password.value) {
        confirmPassword.closest(".input-group").classList.add("invalid");
        isValid = false;
      } else {
        confirmPassword.closest(".input-group").classList.remove("invalid");
      }

      if (accountRole && accountRole.value === "artisan") {
        const introductionGroup = introduction.closest(".input-group");
        const portfolioGroup = portfolio.closest(".input-group");
        const validPortfolio = portfolio.checkValidity();
        introductionGroup.classList.toggle(
          "invalid",
          !introduction.value.trim(),
        );
        portfolioGroup.classList.toggle("invalid", !validPortfolio);
        isValid =
          Boolean(introduction.value.trim()) && validPortfolio && isValid;
      }

      if (isValid) {
        try {
          const user = window.AuraCraftUsers.create({
            fullName: fullName.value,
            email: email.value,
            password: password.value,
            role: accountRole ? accountRole.value : "buyer",
            introduction: introduction ? introduction.value : "",
            portfolio: portfolio ? portfolio.value : "",
          });
          const successMessage =
            user.role === "artisan"
              ? "Đăng ký thành công. Tài khoản thợ đang chờ admin duyệt trước khi nhận đơn."
              : "Đăng ký thành công. Vui lòng đăng nhập.";
          alert(successMessage);
          window.location.href = "login.html";
        } catch (error) {
          const emailGroup = email.closest(".input-group");
          emailGroup.classList.add("invalid");
          const errEl = emailGroup.querySelector(".error-msg");
          if (errEl) errEl.textContent = error.message;
          email.focus();
        }
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
    const API_BASE_AUTH = "http://localhost:8080/api/auth";
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
