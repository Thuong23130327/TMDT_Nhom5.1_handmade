// ============================================================
// AuraCraft - AI Recommendation Engine (Cosine Similarity)
// Thuật toán đo lường độ tương đồng Cosine dựa trên đặc trưng sản phẩm
// ============================================================

window.AuraCraftAI = (function () {
  const STOP_WORDS = new Set([
    "và", "của", "từ", "cho", "có", "thể", "được", "với", "hàng", "tại", "theo",
    "đến", "các", "những", "một", "này", "đó", "khi", "làm", "thủ", "công", "là",
    "như", "rất", "nhiều", "bạn", "trong", "ngoài", "phù", "hợp", "shop", "tiệm",
    "chiếc", "mẫu", "loại", "sản", "phẩm"
  ]);

  /**
   * Tách từ và chuẩn hóa chuỗi tiếng Việt thành danh sách token
   */
  function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()?\+@\[\]"']/g, " ")
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !STOP_WORDS.has(w));
  }

  /**
   * Trích xuất các token đặc trưng của một sản phẩm
   */
  function extractProductTokens(product) {
    const textPieces = [
      product.name || "",
      product.name || "", // Nhân đôi trọng số cho tên sản phẩm
      product.typeLabel || "",
      product.typeLabel || "",
      product.type || "",
      product.desc || "",
      product.color || "",
      product.shop || ""
    ];
    return tokenize(textPieces.join(" "));
  }

  /**
   * Tính toán bảng tần số tài liệu nghịch đảo (IDF) trên toàn bộ kho sản phẩm
   * IDF(t) = ln(1 + N / DF(t))
   */
  function computeIdfMap(products) {
    const docCount = products.length;
    const docFrequency = {};

    products.forEach(p => {
      const tokens = new Set(extractProductTokens(p));
      tokens.forEach(term => {
        docFrequency[term] = (docFrequency[term] || 0) + 1;
      });
    });

    const vocabulary = Object.keys(docFrequency).sort();
    const idfMap = {};
    vocabulary.forEach(term => {
      const df = docFrequency[term] || 1;
      idfMap[term] = Math.log(1 + docCount / df);
    });

    return { vocabulary, idfMap };
  }

  /**
   * Xây dựng Vector đặc trưng số học cho 1 sản phẩm:
   * [TF-IDF tokens, trọng số phân loại, trọng số phân khúc giá]
   */
  function buildFeatureVector(product, vocabulary, idfMap) {
    const tokens = extractProductTokens(product);
    const tokenCounts = {};
    tokens.forEach(t => {
      tokenCounts[t] = (tokenCounts[t] || 0) + 1;
    });
    const totalTokens = Math.max(1, tokens.length);

    // 1. TF-IDF vector
    const vector = vocabulary.map(term => {
      const count = tokenCounts[term] || 0;
      if (count === 0) return 0;
      const tf = count / totalTokens;
      const idf = idfMap[term] || 1.0;
      return tf * idf * 2.5; // Trọng số từ vựng ngữ nghĩa
    });

    // 2. Thêm thành phần danh mục (Category component)
    const typeWeights = { bracelet: 1.5, necklace: 2.5, ring: 3.5, charm: 4.5 };
    vector.push((typeWeights[product.type] || 1.0) * 1.5);

    // 3. Thêm thành phần phân khúc giá log10
    const priceVal = Number(product.price) || 50000;
    vector.push(Math.log10(priceVal) * 0.8);

    return vector;
  }

  /**
   * Tính toán độ tương đồng Cosine (Cosine Similarity):
   * cos(theta) = (A . B) / (||A|| * ||B||)
   */
  function calculateCosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Rút trích các lý do giải thích AI cho người dùng
   */
  function extractReasons(target, candidate) {
    const reasons = [];

    // Cùng loại sản phẩm
    if (target.type === candidate.type) {
      reasons.push(`Cùng kiểu dáng ${target.typeLabel || "sản phẩm"}`);
    }

    // Cùng nghệ nhân / shop
    if (target.shop && candidate.shop && target.shop === candidate.shop) {
      reasons.push(`Cùng xưởng chế tác (${target.shop})`);
    }

    // Từ khóa chung
    const tTokens = new Set(tokenize(target.name + " " + (target.desc || "")));
    const cTokens = new Set(tokenize(candidate.name + " " + (candidate.desc || "")));
    const shared = [];
    tTokens.forEach(t => {
      if (cTokens.has(t) && shared.length < 2) shared.push(t);
    });
    if (shared.length > 0) {
      reasons.push(`Đặc trưng chung: ${shared.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(", ")}`);
    }

    // Mức giá tương đồng
    const p1 = Number(target.price) || 0;
    const p2 = Number(candidate.price) || 0;
    if (p1 > 0 && p2 > 0) {
      const diff = Math.abs(p1 - p2) / Math.max(p1, p2);
      if (diff <= 0.3) {
        reasons.push("Mức giá tương đương");
      }
    }

    if (reasons.length === 0) {
      reasons.push("Phong cách thẩm mỹ tương đồng");
    }

    return reasons;
  }

  /**
   * Hàm cốt lõi: Gợi ý N sản phẩm tương tự dựa trên Cosine Similarity
   */
  function getRecommendations(targetProduct, allProducts, limit = 4) {
    if (!targetProduct || !allProducts || allProducts.length <= 1) return [];

    const candidates = allProducts.filter(p => p.id !== targetProduct.id);
    const universe = [...candidates, targetProduct];

    const { vocabulary, idfMap } = computeIdfMap(universe);

    const targetVector = buildFeatureVector(targetProduct, vocabulary, idfMap);

    const scored = candidates.map(candidate => {
      const candVector = buildFeatureVector(candidate, vocabulary, idfMap);
      const score = calculateCosineSimilarity(targetVector, candVector);
      
      // Chuyển score cosine thành phần trăm hiển thị (50% - 99%)
      const matchPercent = Math.min(99, Math.max(55, Math.round(score * 100)));
      const reasons = extractReasons(targetProduct, candidate);

      return {
        product: candidate,
        score: score,
        matchPercent: matchPercent,
        reasons: reasons,
        targetVector,
        candVector,
        vocabulary
      };
    });

    // Sắp xếp giảm dần theo điểm Cosine Similarity
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }

  /**
   * Khởi tạo giao diện AI Recommendations trên trang chi tiết sản phẩm
   */
  function renderRecommendations(targetProduct, allProducts) {
    const container = document.getElementById("aiRecommendationsGrid");
    const section = document.getElementById("aiRecommendationsSection");
    if (!container || !section) return;

    const recommendations = getRecommendations(targetProduct, allProducts, 4);
    if (!recommendations || recommendations.length === 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    const formatVND = n => Number(n).toLocaleString("vi-VN") + "đ";

    container.innerHTML = recommendations.map(item => {
      const p = item.product;
      const reasonsHtml = item.reasons.map(r => `
        <span class="ai-reason-pill"><i class="fa-solid fa-check"></i> ${r}</span>
      `).join("");

      return `
        <article class="ai-recommend-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
          <div class="ai-card-thumb-wrap">
            <span class="ai-cosine-badge">
              <i class="fa-solid fa-brain"></i> AI Match: ${item.matchPercent}%
            </span>
            <img src="${p.image || '../assets/img/products/bracelet_01.jpg'}" alt="${p.name}" onerror="this.src='https://placehold.co/300x220/f5ece8/7b5144?text=AuraCraft'">
          </div>
          <div class="ai-card-body">
            <div class="ai-card-meta">
              <span class="ai-card-shop"><i class="fa-solid fa-store"></i> ${p.shop}</span>
              <span class="ai-card-rating">★ ${p.rating}</span>
            </div>
            <h3 class="ai-card-title">${p.name}</h3>
            <div class="ai-card-reasons">
              ${reasonsHtml}
            </div>
            <div class="ai-card-price-row">
              <div>
                <span class="ai-card-price">${formatVND(p.price)}</span>
                ${p.oldPrice ? `<span class="ai-card-old-price">${formatVND(p.oldPrice)}</span>` : ""}
              </div>
              <span class="ai-btn-view">Xem ngay →</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Lưu dữ liệu để hiển thị Modal giải thích thuật toán
    window._latestAiRecommendations = recommendations;
    window._latestAiTargetProduct = targetProduct;

    // Gắn sự kiện nút mở Modal giải thích
    setupExplainModal();
  }

  /**
   * Gắn sự kiện cho Modal giải thích thuật toán Cosine Similarity
   */
  function setupExplainModal() {
    const btnExplain = document.getElementById("btnAiExplain");
    const modal = document.getElementById("aiExplainModal");
    const closeBtn = document.getElementById("aiExplainClose");

    if (btnExplain && modal) {
      btnExplain.onclick = () => {
        openExplainModal();
      };
    }

    if (closeBtn && modal) {
      closeBtn.onclick = () => {
        modal.classList.remove("active");
      };
    }

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
      };
    }
  }

  /**
   * Mở modal và hiển thị bảng phân tích Vector Cosine chi tiết
   */
  function openExplainModal() {
    const modal = document.getElementById("aiExplainModal");
    const content = document.getElementById("aiExplainContent");
    if (!modal || !content) return;

    const target = window._latestAiTargetProduct;
    const recs = window._latestAiRecommendations || [];

    if (!target || recs.length === 0) return;

    const topRec = recs[0];

    content.innerHTML = `
      <div class="ai-modal-intro">
        <div class="ai-modal-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Recommendation System</div>
        <h4>Công thức tính độ tương đồng góc Cosine</h4>
        <div class="ai-formula-box">
          <div class="ai-formula-math" style="padding:12px;background:#fff;border-radius:8px;font-size:1.15rem;font-weight:600;color:#6c35de;letter-spacing:0.5px;">
            $$\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}$$
            <div style="margin-top:6px;font-size:0.95rem;color:#333;font-family:sans-serif;font-weight:normal;">
              <code>cos(θ) = ( Vector A · Vector B ) / ( ||A|| × ||B|| )</code>
            </div>
          </div>
          <p class="ai-formula-desc">
            Trong đó: <b>Vector A</b> biểu diễn sản phẩm đang xem (<strong>${target.name}</strong>), <b>Vector B</b> biểu diễn sản phẩm ứng viên trong kho hàng. Góc Cosine càng gần 1 (100%), hai sản phẩm càng tương đồng.
          </p>
        </div>

        <h4>Các chiều đặc trưng trong không gian Vector AI</h4>
        <div class="ai-features-grid">
          <div class="ai-feature-card">
            <div class="feat-icon"><i class="fa-solid fa-font"></i></div>
            <div class="feat-info">
              <strong>1. TF-IDF Ngữ nghĩa</strong>
              <span>Tên, chất liệu, màu sắc và mô tả tác phẩm (Bạc, da, charm, gỗ thơm...)</span>
            </div>
          </div>
          <div class="ai-feature-card">
            <div class="feat-icon"><i class="fa-solid fa-layer-group"></i></div>
            <div class="feat-info">
              <strong>2. Danh mục &amp; Kiểu dáng</strong>
              <span>Định vị chủng loại: Vòng tay, Dây chuyền, Nhẫn, Móc khóa charm</span>
            </div>
          </div>
          <div class="ai-feature-card">
            <div class="feat-icon"><i class="fa-solid fa-tag"></i></div>
            <div class="feat-info">
              <strong>3. Phân khúc mức giá</strong>
              <span>Khoảng giá logarit giúp gợi ý các mẫu phù hợp ngân sách tương đương</span>
            </div>
          </div>
        </div>

        <h4>Bảng đối sánh với sản phẩm có độ tương đồng cao nhất (${topRec.matchPercent}%)</h4>
        <table class="ai-compare-table">
          <thead>
            <tr>
              <th>Đặc trưng đối sánh</th>
              <th>Sản phẩm hiện tại</th>
              <th>Top 1 AI Đề xuất</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tên sản phẩm</strong></td>
              <td>${target.name}</td>
              <td>${topRec.product.name}</td>
            </tr>
            <tr>
              <td><strong>Danh mục</strong></td>
              <td><span class="tag-match">${target.typeLabel || target.type}</span></td>
              <td><span class="tag-match">${topRec.product.typeLabel || topRec.product.type}</span></td>
            </tr>
            <tr>
              <td><strong>Giá bán</strong></td>
              <td>${Number(target.price).toLocaleString('vi-VN')}đ</td>
              <td>${Number(topRec.product.price).toLocaleString('vi-VN')}đ</td>
            </tr>
            <tr>
              <td><strong>Xưởng chế tác</strong></td>
              <td>${target.shop || "---"}</td>
              <td>${topRec.product.shop || "---"}</td>
            </tr>
            <tr>
              <td><strong>Hệ số góc Cosine</strong></td>
              <td colspan="2" style="text-align:center;font-weight:700;color:var(--primary-color,#7b5144);">
                cos(θ) = ${topRec.score.toFixed(4)} → Độ tương đồng: ${topRec.matchPercent}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    modal.classList.add("active");
  }

  return {
    tokenize,
    extractProductTokens,
    buildFeatureVector,
    calculateCosineSimilarity,
    getRecommendations,
    renderRecommendations
  };
})();
