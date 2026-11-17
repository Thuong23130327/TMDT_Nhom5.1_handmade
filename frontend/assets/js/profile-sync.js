/**
 * AuraCraft - Tự động đồng bộ thông tin người dùng đang đăng nhập vào trang Hồ sơ
 * Đảm bảo khi login bằng bất kỳ tài khoản nào (Mai, Khang, Linh...), trang Hồ sơ luôn hiển thị đúng thông tin của tài khoản đó.
 */

(function syncUserProfile() {
  function applyUser() {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return;
      const u = JSON.parse(raw);
      const name = u.fullName || u.username || "Khách hàng AuraCraft";
      const email = u.email || "";
      const phone = u.phone || "0912 345 678";

      // 1. Cập nhật thẻ tên trên Header hồ sơ
      const nameEl = document.getElementById("displayUserName");
      if (nameEl) nameEl.textContent = name;
      document.querySelectorAll(".profile-user-info h2 span").forEach(el => {
        el.textContent = name;
      });

      // 2. Cập nhật email trên Header hồ sơ
      const emailEl = document.getElementById("displayUserEmail");
      if (emailEl) emailEl.textContent = email;
      document.querySelectorAll(".profile-user-info p").forEach(el => {
        el.textContent = email;
      });

      // 3. Cập nhật Avatar động theo tên người dùng
      const avatarImgs = document.querySelectorAll(".profile-avatar-wrap img");
      avatarImgs.forEach(img => {
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=425B9A&color=fff&size=128&bold=true`;
      });

      // 4. Cập nhật các ô input trong form thông tin cá nhân (profile-info.html)
      const inputName = document.getElementById("fullname");
      const inputEmail = document.getElementById("email");
      const inputPhone = document.getElementById("phone");
      if (inputName) inputName.value = name;
      if (inputEmail) inputEmail.value = email;
      if (inputPhone && u.phone) inputPhone.value = u.phone;

      // 5. Cập nhật tên trong Sổ địa chỉ giao hàng
      document.querySelectorAll(".address-item b").forEach(el => {
        el.textContent = name;
      });
    } catch (e) {
      console.warn("Lỗi sync user profile:", e);
    }
  }

  // Chạy ngay lập tức khi file script vừa tải
  applyUser();

  // Chạy lại khi DOM đã nạp
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyUser);
  }

  // Đảm bảo cập nhật lần cuối
  setTimeout(applyUser, 150);
  setTimeout(applyUser, 500);
})();
