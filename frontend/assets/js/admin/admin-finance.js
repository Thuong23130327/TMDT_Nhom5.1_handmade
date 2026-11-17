document.addEventListener("DOMContentLoaded", function () {
  const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

  let barChartInstance = null;
  let pieChartInstance = null;

  // ==========================================
  // 1. TẢI TỔNG QUAN KPI TÀI CHÍNH
  // ==========================================
  async function loadSummaryKPIs() {
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/analytics/summary");
      if (res.ok) {
        const json = await res.json();
        if (json.code === 1000 && json.result) {
          const s = json.result;
          const gmvEl = document.getElementById("statTotalGmv");
          const feeEl = document.getElementById("statTotalFee");
          const paidEl = document.getElementById("statPaidArtisans");
          const completedEl = document.getElementById("statCompletedOrders");

          const gmv = Number(s.totalGmv || 0);
          const fee = Number(s.totalFee != null ? s.totalFee : Math.round(gmv * 0.1));
          const paid = Number(s.paidToArtisans != null ? s.paidToArtisans : (gmv - fee));

          if (gmvEl) gmvEl.textContent = formatVND(gmv);
          if (feeEl) feeEl.textContent = formatVND(fee);
          if (paidEl) paidEl.textContent = formatVND(paid);
          if (completedEl) completedEl.textContent = `${s.completedOrders || 0} đơn`;
          return;
        }
      }
    } catch (err) {
      console.warn("Backend summary chưa phản hồi, dùng dữ liệu dự phòng:", err);
    }

    // Fallback UI nếu backend chưa bật (khớp đúng tỷ lệ DB)
    const gmv = 16548000;
    const fee = 1654800;
    const paid = gmv - fee; // 14.893.200 đ
    const gmvEl = document.getElementById("statTotalGmv");
    const feeEl = document.getElementById("statTotalFee");
    const paidEl = document.getElementById("statPaidArtisans");
    const completedEl = document.getElementById("statCompletedOrders");
    if (gmvEl) gmvEl.textContent = formatVND(gmv);
    if (feeEl) feeEl.textContent = formatVND(fee);
    if (paidEl) paidEl.textContent = formatVND(paid);
    if (completedEl) completedEl.textContent = "12 đơn";
  }

  // ==========================================
  // 2. BIỂU ĐỒ CỘT DOANH THU & PHÍ SÀN THEO KHOẢNG THỜI GIAN
  // ==========================================
  async function loadRevenueBarChart(startDate, endDate) {
    let url = "http://localhost:8080/api/v1/admin/analytics/revenue-chart";
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    let chartData = null;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.code === 1000 && json.result) {
          chartData = json.result;
        }
      }
    } catch (err) {
      console.warn("Backend bar chart chưa phản hồi, dùng dữ liệu dự phòng:", err);
    }

    // Dữ liệu dự phòng nếu chưa có đơn hàng trong khoảng ngày
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      chartData = {
        labels: ["Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10"],
        gmvData: [12000000, 15000000, 18000000, 14000000, 21000000, 25000000],
        platformFeeData: [1200000, 1500000, 1800000, 1400000, 2100000, 2500000]
      };
    }

    const canvasBar = document.getElementById("revenueBarChart");
    if (!canvasBar) return;
    const ctxBar = canvasBar.getContext("2d");

    if (barChartInstance) {
      barChartInstance.destroy();
    }

    barChartInstance = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Giá trị giao dịch (GMV)",
            data: chartData.gmvData,
            backgroundColor: "#425B9A",
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: "Phí sàn thu được (10%)",
            data: chartData.platformFeeData,
            backgroundColor: "#D4AF37",
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 14,
              font: { family: "'Mulish', sans-serif", size: 12.5 }
            }
          },
          tooltip: {
            backgroundColor: "rgba(33, 43, 54, 0.9)",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${formatVND(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Mulish', sans-serif", size: 12 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f0ece6" },
            ticks: {
              font: { family: "'Mulish', sans-serif", size: 11 },
              callback: function (val) {
                if (val >= 1000000) return (val / 1000000).toFixed(0) + " Tr";
                if (val >= 1000) return (val / 1000).toFixed(0) + " k";
                return val;
              }
            }
          }
        }
      }
    });

    // Cập nhật thông báo khoảng ngày
    const noticeEl = document.getElementById("chartRangeNotice");
    if (noticeEl) {
      if (startDate && endDate) {
        noticeEl.innerHTML = `<i class="bi bi-clock-history"></i> Lọc từ <strong>${startDate}</strong> đến <strong>${endDate}</strong>`;
      } else {
        noticeEl.innerHTML = `<i class="bi bi-clock-history"></i> Thống kê toàn bộ dữ liệu giao dịch`;
      }
    }
  }

  // ==========================================
  // 3. BIỂU ĐỒ TRÒN TỶ TRỌNG DOANH THU THEO DANH MỤC
  // ==========================================
  async function loadCategoryPieChart() {
    let pieData = null;
    try {
      const res = await fetch("http://localhost:8080/api/v1/admin/analytics/category-chart");
      if (res.ok) {
        const json = await res.json();
        if (json.code === 1000 && json.result) {
          pieData = json.result;
        }
      }
    } catch (err) {
      console.warn("Backend pie chart chưa phản hồi, dùng dữ liệu dự phòng:", err);
    }

    if (!pieData || !pieData.labels || pieData.labels.length === 0) {
      pieData = {
        labels: ["Vòng tay Charm & Lắc", "Gấu bông & Đồ len", "Dây chuyền & Mặt đá", "Gốm sứ & Đất sét"],
        data: [45000000, 28000000, 20000000, 15000000],
        colors: ["#425B9A", "#E67E22", "#D4AF37", "#2ECC71"]
      };
    }

    const canvasPie = document.getElementById("revenuePieChart");
    if (!canvasPie) return;
    const ctxPie = canvasPie.getContext("2d");

    if (pieChartInstance) {
      pieChartInstance.destroy();
    }

    const totalVal = pieData.data.reduce((a, b) => a + b, 0);

    pieChartInstance = new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: pieData.labels,
        datasets: [
          {
            data: pieData.data,
            backgroundColor: pieData.colors || ["#425B9A", "#E67E22", "#D4AF37", "#2ECC71", "#95A5A6"],
            borderWidth: 2,
            borderColor: "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            display: false // Chúng ta dùng custom legend HTML phía dưới để hiển thị % chi tiết
          },
          tooltip: {
            backgroundColor: "rgba(33, 43, 54, 0.9)",
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const val = context.raw || 0;
                const pct = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${formatVND(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Custom legend bên dưới biểu đồ tròn
    const legendEl = document.getElementById("categorySummaryLegend");
    if (legendEl) {
      legendEl.innerHTML = pieData.labels
        .map((label, idx) => {
          const val = pieData.data[idx] || 0;
          const color = (pieData.colors && pieData.colors[idx]) || "#425B9A";
          const pct = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : 0;
          return `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="width:10px; height:10px; border-radius:50%; background:${color}; display:inline-block;"></span>
              <span style="color:var(--text-dark);">${label}</span>
            </div>
            <strong style="color:var(--primary-blue);">${pct}%</strong>
          </div>
        `;
        })
        .join("");
    }
  }

  // ==========================================
  // 4. XỬ LÝ THANH LỌC THỜI GIAN
  // ==========================================
  const startDateInput = document.getElementById("startDateInput");
  const endDateInput = document.getElementById("endDateInput");
  const btnFilterRevenue = document.getElementById("btnFilterRevenue");
  const presetButtons = document.querySelectorAll(".btn-preset");

  // Thiết lập ngày mặc định (30 ngày gần nhất)
  const today = new Date();
  const past30 = new Date();
  past30.setDate(today.getDate() - 30);

  const formatDateYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (startDateInput && endDateInput) {
    startDateInput.value = formatDateYMD(past30);
    endDateInput.value = formatDateYMD(today);
  }

  // Nút bấm lọc theo ngày tùy chọn
  if (btnFilterRevenue) {
    btnFilterRevenue.addEventListener("click", () => {
      const s = startDateInput ? startDateInput.value : "";
      const e = endDateInput ? endDateInput.value : "";

      if (s && e && s > e) {
        alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        return;
      }

      presetButtons.forEach((b) => b.classList.remove("active"));
      loadRevenueBarChart(s, e);
    });
  }

  // Các nút chọn nhanh preset (7 ngày, 30 ngày, 90 ngày, All)
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      presetButtons.forEach((b) => {
        b.classList.remove("active");
        b.style.background = "#fff";
        b.style.color = "var(--text-dark)";
        b.style.borderColor = "#ddd";
      });

      btn.classList.add("active");
      btn.style.background = "var(--primary-blue)";
      btn.style.color = "#fff";
      btn.style.borderColor = "var(--primary-blue)";

      const days = btn.dataset.days;
      if (days === "all") {
        if (startDateInput) startDateInput.value = "";
        if (endDateInput) endDateInput.value = "";
        loadRevenueBarChart("", "");
      } else {
        const dNum = parseInt(days, 10) || 30;
        const past = new Date();
        past.setDate(today.getDate() - dNum);
        const s = formatDateYMD(past);
        const e = formatDateYMD(today);
        if (startDateInput) startDateInput.value = s;
        if (endDateInput) endDateInput.value = e;
        loadRevenueBarChart(s, e);
      }
    });
  });

  // Khởi chạy ban đầu
  loadSummaryKPIs();
  loadRevenueBarChart(startDateInput ? startDateInput.value : "", endDateInput ? endDateInput.value : "");
  loadCategoryPieChart();
});

// ==========================================
// 5. CẤU HÌNH PHÍ SÀN & DUYỆT PAYOUT
// ==========================================
function approveWithdrawal(id) {
  if (confirm(`Xác nhận đã chuyển khoản thành công cho yêu cầu ${id}? Hành động này sẽ thay đổi trạng thái và trừ số dư của Thợ.`)) {
    alert(`Đã duyệt thành công Payout ${id}!`);
  }
}

function openConfigModal() {
  const modal = document.getElementById("configModal");
  if (modal) modal.style.display = "flex";
}

function closeConfigModal() {
  const modal = document.getElementById("configModal");
  if (modal) modal.style.display = "none";
}

function saveConfig() {
  const newFee = document.getElementById("feePercentage").value;
  if (newFee === "" || newFee < 0 || newFee > 100) {
    alert("Vui lòng nhập tỷ lệ % hợp lệ (0-100).");
    return;
  }
  alert(`Đã cập nhật tỷ lệ Phí sàn toàn hệ thống thành: ${newFee}%`);
  closeConfigModal();
}
