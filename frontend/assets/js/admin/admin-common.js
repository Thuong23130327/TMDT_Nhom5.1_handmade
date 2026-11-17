// --- LOAD ADMIN SIDEBAR & CHỨC NĂNG CHUNG ---
document.addEventListener("DOMContentLoaded", function() {
    const sidebarPlaceholder = document.getElementById('admin-sidebar-placeholder');
    if (sidebarPlaceholder) {
        fetch('../components/admin-sidebar.html')
            .then(response => response.text())
            .then(data => {
                sidebarPlaceholder.outerHTML = data;
                
                // Cập nhật trạng thái active cho menu dựa trên URL hiện tại
                setTimeout(() => {
                    const currentPage = window.location.pathname.split('/').pop();
                    const menuItems = document.querySelectorAll('.menu-item');
                    menuItems.forEach(item => {
                        item.classList.remove('active');
                        // So sánh href với URL trang hiện tại
                        if (item.getAttribute('href') === currentPage) {
                            item.classList.add('active');
                        }
                    });
                }, 100);
            }).catch(e => console.log('Lỗi tải sidebar:', e));
    }
});

// Xử lý sự kiện đăng xuất cho trang quản trị
document.addEventListener("click", function(e) {
    const btn = e.target.closest('[data-action="logout"]');
    if (btn) {
        e.preventDefault();
        if (window.AuraCraft && typeof window.AuraCraft.logout === 'function') {
            window.AuraCraft.logout();
        } else {
            localStorage.removeItem("auracraft_token");
            localStorage.removeItem("auracraft_refresh");
            localStorage.removeItem("auracraft_user");
            localStorage.removeItem("currentUser");
            sessionStorage.clear();
            window.location.href = "login.html";
        }
    }
});
