(function () {
  const API_BASE = window.API_BASE || "http://localhost:8080";

  function formatPrice(val) {
    if (val == null) return "0 đ";
    return Number(val).toLocaleString("vi-VN") + " đ";
  }

  function resolveImg(url) {
    if (!url) return "https://via.placeholder.com/200?text=AuraCraft";
    if (url.startsWith("http")) return url;
    const isInPages = window.location.pathname.includes("/pages/");
    return isInPages ? "../" + url.replace(/^\/+/, "") : url.replace(/^\/+/, "");
  }

  function renderSection(title, items) {
    if (!Array.isArray(items) || items.length === 0) return;

    const existing = document.getElementById("apriori-rec-section");
    if (existing) existing.remove();

    const section = document.createElement("section");
    section.id = "apriori-rec-section";
    section.style.cssText = "max-width:1200px;margin:36px auto;padding:0 20px;";

    const heading = document.createElement("h2");
    heading.textContent = title;
    heading.style.cssText = "font-size:22px;font-weight:700;color:#3a2a1a;margin-bottom:16px;";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;";

    items.forEach((p) => {
      const card = document.createElement("a");
      card.href = `product-detail.html?id=${p.id}`;
      card.style.cssText =
        "display:flex;flex-direction:column;background:#fff;border:1px solid #eadfce;border-radius:12px;overflow:hidden;text-decoration:none;color:#2f2114;transition:transform 0.15s ease,box-shadow 0.15s ease;";
      card.innerHTML = `
        <img src="${resolveImg(p.thumbnailUrl)}" alt="${p.name || ""}" style="width:100%;height:180px;object-fit:cover;" />
        <div style="padding:12px;display:flex;flex-direction:column;gap:6px;flex:1;">
          <div style="font-size:14px;font-weight:600;line-height:1.35;">${p.name || ""}</div>
          <div style="font-size:14px;font-weight:700;color:#a34d22;">${formatPrice(p.price)}</div>
          ${p.explanation ? `<div style="font-size:11.5px;color:#7a6652;line-height:1.35;">✨ ${p.explanation}</div>` : ""}
        </div>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);

    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder && footerPlaceholder.parentNode) {
      footerPlaceholder.parentNode.insertBefore(section, footerPlaceholder);
    } else {
      document.body.appendChild(section);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;
    try {
      if (path.includes("product-detail.html")) {
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id || !/^\d+$/.test(id)) return;
        const res = await fetch(`${API_BASE}/api/v1/recommendations/complementary/${id}?limit=4`);
        const json = await res.json();
        if (json && json.result) {
          renderSection("Sản phẩm thường mua kèm (Apriori AI)", json.result);
        }
      } else if (path.includes("cart.html")) {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/v1/recommendations/cart?limit=4`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.result) {
          renderSection("Hoàn thiện bộ sưu tập của bạn (Apriori AI)", json.result);
        }
      }
    } catch (e) {
      console.warn("[AprioriUI] Không thể tải gợi ý:", e);
    }
  });
})();
