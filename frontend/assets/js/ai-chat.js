(function () {
  if (window.__auraCraftAiChatLoaded) return;
  window.__auraCraftAiChatLoaded = true;

  const API_BASE = window.API_BASE || "http://localhost:8080";
  const STORAGE_KEY = "auracraft_ai_chat_history";

  // Đọc CSS tự động nếu trang chưa nhúng
  if (!document.querySelector('link[href*="ai-chat.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    const isInPages = window.location.pathname.includes("/pages/");
    link.href = (isInPages ? "../assets/css/ai-chat.css" : "assets/css/ai-chat.css");
    document.head.appendChild(link);
  }

  function getCurrentProductId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id && /^\d+$/.test(id) ? Number(id) : null;
  }

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(-8) : [];
    } catch {
      return [];
    }
  }

  function saveHistory(messages) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-8)));
    } catch {}
  }

  function formatPrice(val) {
    if (val == null) return "0 đ";
    return Number(val).toLocaleString("vi-VN") + " đ";
  }

  function resolveImg(url) {
    if (!url) return "https://via.placeholder.com/80?text=AuraCraft";
    if (url.startsWith("http")) return url;
    const isInPages = window.location.pathname.includes("/pages/");
    return isInPages ? "../" + url.replace(/^\/+/, "") : url.replace(/^\/+/, "");
  }

  function resolveDetailUrl(id) {
    const isInPages = window.location.pathname.includes("/pages/");
    return (isInPages ? "product-detail.html?id=" : "pages/product-detail.html?id=") + id;
  }

  // Tạo DOM widget
  const launcher = document.createElement("button");
  launcher.className = "ac-ai-launcher";
  launcher.type = "button";
  launcher.innerHTML = '<span>✨</span><span>Trợ lý AI AuraCraft</span>';

  const panel = document.createElement("div");
  panel.className = "ac-ai-panel";
  panel.innerHTML = `
    <div class="ac-ai-header">
      <div class="ac-ai-header-title">
        <strong>Trợ lý AI AuraCraft</strong>
        <span>Tư vấn quà tặng & gợi ý mua kèm</span>
      </div>
      <button class="ac-ai-close" type="button" aria-label="Đóng">×</button>
    </div>
    <div class="ac-ai-messages" id="acAiMessages"></div>
    <div class="ac-ai-suggestions">
      <button class="ac-ai-chip" type="button">Gợi ý quà tặng handmade</button>
      <button class="ac-ai-chip" type="button">Sản phẩm nào thường mua kèm?</button>
      <button class="ac-ai-chip" type="button">Sản phẩm này còn hàng không?</button>
    </div>
    <form class="ac-ai-input-row" id="acAiForm">
      <input class="ac-ai-input" id="acAiInput" type="text" placeholder="Hỏi trợ lý AI bằng tiếng Việt..." autocomplete="off" />
      <button class="ac-ai-send" id="acAiSend" type="submit">Gửi</button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector("#acAiMessages");
  const formEl = panel.querySelector("#acAiForm");
  const inputEl = panel.querySelector("#acAiInput");
  const sendBtn = panel.querySelector("#acAiSend");
  const closeBtn = panel.querySelector(".ac-ai-close");

  let history = loadHistory();
  if (history.length === 0) {
    history = [
      {
        role: "assistant",
        content: "Xin chào! Mình là Trợ lý AI AuraCraft 🌸. Bạn đang tìm quà tặng handmade hay muốn xem các sản phẩm thường mua kèm?",
      },
    ];
    saveHistory(history);
  }

  function renderMessages(suggestedProductsMap) {
    messagesEl.innerHTML = "";
    history.forEach((m, idx) => {
      const div = document.createElement("div");
      div.className = "ac-ai-msg " + (m.role === "user" ? "user" : "assistant");
      div.textContent = m.content;
      messagesEl.appendChild(div);

      const prods = suggestedProductsMap && suggestedProductsMap[idx];
      if (Array.isArray(prods) && prods.length > 0) {
        const list = document.createElement("div");
        list.className = "ac-ai-products";
        prods.forEach((p) => {
          const card = document.createElement("a");
          card.className = "ac-ai-product-card";
          card.href = resolveDetailUrl(p.id);
          card.innerHTML = `
            <img src="${resolveImg(p.thumbnailUrl)}" alt="${p.name || ""}" />
            <div class="ac-ai-product-info">
              <div class="ac-ai-product-name">${p.name || ""}</div>
              <div class="ac-ai-product-price">${formatPrice(p.price)}</div>
            </div>
          `;
          list.appendChild(card);
        });
        messagesEl.appendChild(list);
      }
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  const productCardsByMsgIdx = {};
  renderMessages(productCardsByMsgIdx);

  launcher.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  panel.querySelectorAll(".ac-ai-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      inputEl.value = chip.textContent;
      formEl.dispatchEvent(new Event("submit"));
    });
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    history.push({ role: "user", content: text });
    history = history.slice(-8);
    saveHistory(history);
    renderMessages(productCardsByMsgIdx);

    sendBtn.disabled = true;
    const typingEl = document.createElement("div");
    typingEl.className = "ac-ai-msg assistant";
    typingEl.textContent = "Đang suy nghĩ...";
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          currentProductId: getCurrentProductId(),
        }),
      });
      const json = await res.json();
      const result = json && json.result ? json.result : {};
      const reply = result.reply || "Xin lỗi, mình chưa thể phản hồi lúc này.";
      history.push({ role: "assistant", content: reply });
      history = history.slice(-8);
      saveHistory(history);
      if (Array.isArray(result.suggestedProducts) && result.suggestedProducts.length > 0) {
        productCardsByMsgIdx[history.length - 1] = result.suggestedProducts;
      }
    } catch (err) {
      history.push({
        role: "assistant",
        content: "Không thể kết nối tới máy chủ AI. Bạn vui lòng kiểm tra backend đã chạy chưa nhé.",
      });
      history = history.slice(-8);
      saveHistory(history);
    } finally {
      sendBtn.disabled = false;
      renderMessages(productCardsByMsgIdx);
    }
  });
})();
