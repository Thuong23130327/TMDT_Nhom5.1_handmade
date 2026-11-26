# THIẾT KẾ KIẾN TRÚC: HỆ THỐNG GỢI Ý SẢN PHẨM MUA KÈM BẰNG THUẬT TOÁN APRIORI LAI (HYBRID APRIORI) VÀ TRỢ LÝ AI MUA SẮM TIẾNG VIỆT CHO SÀN TMĐT AURACRAFT

**Mã tài liệu:** `AuraCraft-Spec-2026-11-26`  
**Ngày lập:** 26/11/2026  
**Dự án:** AuraCraft – Sàn thương mại điện tử Đồ thủ công mỹ nghệ (Handmade & Art Crafts)  
**Nhóm thực hiện:** Nhóm 5.1  
**Trạng thái:** Chờ phê duyệt (Pending Explicit Approval)  

---

## 1. BỐI CẢNH DỰ ÁN (PROJECT BACKGROUND)
AuraCraft là nền tảng thương mại điện tử chuyên biệt dành cho các sản phẩm thủ công, quà tặng nghệ thuật và các tác phẩm sáng tạo từ các nghệ nhân Việt Nam. Để tối ưu hóa trải nghiệm khách hàng và gia tăng giá trị đơn hàng trung bình (AOV - Average Order Value), nền tảng cần trang bị các công cụ trí tuệ nhân tạo có khả năng:
1. Gợi ý bán kèm thông minh (Cross-selling) dựa trên hành vi mua sắm tập thể trong quá khứ thông qua giải thuật Khai phá luật kết hợp (Association Rule Mining) chuẩn học thuật.
2. Cung cấp một Trợ lý ảo mua sắm giao tiếp tự nhiên bằng Tiếng Việt, có khả năng tra cứu thông tin sản phẩm thực tế từ kho dữ liệu và giải thích tường minh lý do tại sao một sản phẩm được hệ sinh thái đề xuất.

---

## 2. MỤC TIÊU CỦA KHÁCH HÀNG (CUSTOMER GOALS)
- **Người mua hàng (Buyers):** 
  - Khám phá các món đồ thủ công độc đáo một cách thuận tiện.
  - Được tư vấn quà tặng phù hợp theo nhu cầu, sở thích, chất liệu và mức giá bằng ngôn ngữ mẹ đẻ (Tiếng Việt tự nhiên).
  - Tìm thấy các phụ kiện hoặc sản phẩm phối kèm hoàn hảo (như *Vòng tay hạt gỗ* đi kèm với *Hạt charm bạc* hoặc *Hộp quà vintage*) ngay trên trang chi tiết sản phẩm và trang giỏ hàng.
- **Nghệ nhân & Quản trị sàn (Artisans & Admins):**
  - Tự động hóa quá trình bán chéo sản phẩm phụ kiện dựa trên dữ liệu giao dịch thực tế.
  - Báo cáo và giải trình được cơ chế gợi ý (Explainable AI) dựa trên các chỉ số toán học (Support, Confidence, Lift) thay vì các phỏng đoán ngẫu nhiên.

---

## 3. MỤC TIÊU TÍNH NĂNG (FEATURE OBJECTIVES)
1. **Tính năng A — FR-21: Khai phá luật kết hợp bán kèm bằng thuật toán Apriori lai (Hybrid Apriori):**
   - Đào dữ liệu từ 2 nguồn: Lịch sử phiên giỏ hàng (`cart_sessions`) và Đơn hàng đã thanh toán thành công (`orders` có `paymentStatus = PAID`).
   - Tính toán đầy đủ 3 độ đo: **Độ hỗ trợ (Support)**, **Độ tin cậy (Confidence)** và **Độ nâng (Lift)**.
   - Lưu trữ các luật kết hợp đã khai phá vào CSDL MySQL để phục vụ truy vấn thời gian thực (`< 50ms`) trên giao diện chi tiết sản phẩm và giỏ hàng.
2. **Tính năng B — Trợ lý ảo AI mua sắm thông minh hỗ trợ Tiếng Việt (Vietnamese Conversational AI Assistant):**
   - Tích hợp mô hình ngôn ngữ lớn (Google Gemini API qua `gemini-1.5-flash`).
   - Giao tiếp tự nhiên, thấu hiểu tiếng Việt có dấu, không dấu, từ lóng mua sắm, ngữ cảnh hội thoại.
   - Tra cứu dữ liệu trực tiếp từ CSDL backend (tồn kho, giá bán, mô tả, thông số) bằng cơ chế Tool/Function Calling an toàn.
   - Kết nối trực tiếp với Service Apriori để giải thích cho khách hàng lý do vì sao một phụ kiện được gợi ý mua kèm.

---

## 4. PHẠM VI VÀ CÁC MỤC TIÊU LOẠI TRỪ (SCOPE AND NON-GOALS)
- **Trong phạm vi (In-Scope):**
  - Cài đặt thuật toán Apriori thuần túy bằng Java 11 trong Spring Boot.
  - Cơ chế tự động khử trùng lặp (Deduplication) giữa giỏ hàng đã chuyển thành đơn hàng và bản thân đơn hàng đó.
  - Bộ API gợi ý sản phẩm mua kèm cho trang `product-detail.html` và `cart.html`.
  - Bộ điều khiển hội thoại (`AiChatController`, `GeminiAiService`), lưu trữ phiên chat ngắn hạn, bảo vệ khóa API và chống Prompt Injection.
  - Giao diện bong bóng chat nổi (Floating AI Widget) đồng bộ với hệ thống thiết kế AuraCraft.
- **Ngoài phạm vi (Non-Goals):**
  - **Không chỉnh sửa hoặc thay thế FR-22:** Thuật toán Cosine Similarity đo độ tương đồng đặc trưng sản phẩm trong `AiRecommendationService.java` tiếp tục được giữ nguyên vẹn.
  - **Không cho phép AI tự động chốt đơn hoặc trừ tiền:** Mọi thao tác đặt hàng và thanh toán bắt buộc phải do người dùng tự nhấn nút xác nhận trên màn hình `checkout.html`.
  - **Không cho phép LLM tự bịa đặt luật kết hợp hoặc sinh lệnh SQL trực tiếp.**

---

## 5. KẾT QUẢ KHẢO SÁT MÃ NGUỒN HIỆN TẠI (EXISTING ARCHITECTURE FINDINGS)
- **Spring Boot 2.7.18 + Java 11:** Mọi mã nguồn tạo mới phải hoàn toàn tương thích cú pháp Java 11.
- **Vòng đời giỏ hàng:** Khi người dùng gọi `POST /api/orders`, hàm `CartServiceImpl.clearCart()` sẽ xóa sạch `cart_items` hiện tại. Do đó, cần bổ sung bảng lưu vết phiên giỏ hàng để phục vụ huấn luyện Apriori.
- **Vòng đời đơn hàng:**
  - VNPay: `PaymentController.vnpayCallback()` cập nhật `paymentStatus = PAID` khi response code là `00`.
  - COD: `AdminOrderController.updateStatus()` cập nhật `paymentStatus = PAID` khi trạng thái đơn đổi thành `COMPLETED`.
  - Hủy đơn: Trạng thái đổi thành `CANCELLED` hoặc `REFUNDED` đối với đơn đã trả tiền.
- **Cơ chế xác thực:** JWT Bearer qua `JwtAuthenticationFilter`, thông tin người dùng được giải quyết qua `CurrentUserResolver`.

---

## 6. CÁC TỆP NGUỒN LIÊN QUAN THỰC TẾ
- **Backend Core:**
  - `backend/src/main/java/com/example/Handmade/model/Product.java`
  - `backend/src/main/java/com/example/Handmade/model/CartItem.java`
  - `backend/src/main/java/com/example/Handmade/model/Order.java`
  - `backend/src/main/java/com/example/Handmade/model/OrderItem.java`
  - `backend/src/main/java/com/example/Handmade/service/CartServiceImpl.java`
  - `backend/src/main/java/com/example/Handmade/service/OrderServiceImpl.java`
  - `backend/src/main/java/com/example/Handmade/service/AiRecommendationService.java` (FR-22 Cosine)
  - `backend/src/main/java/com/example/Handmade/config/SecurityConfig.java`
- **Frontend Pages & Scripts:**
  - `frontend/pages/product-detail.html`, `frontend/assets/js/product-detail.js`
  - `frontend/pages/cart.html`, `frontend/assets/js/cart.js`
  - `frontend/assets/js/auth.js` (quản lý session và API_BASE)

---

## 7. KIẾN TRÚC APRIORI LAI (HYBRID APRIORI ARCHITECTURE)
Hệ thống phân tách rành mạch thành 2 tầng xử lý:

```
+-----------------------------------------------------------------------------------+
|                           TẦNG NGOẠI TUYẾN (OFFLINE MINING)                      |
|                                                                                   |
|  [Đơn hàng đã thanh toán (PAID)]  +  [Phiên giỏ hàng lịch sử (Finalized Carts)]   |
|                                    |                                              |
|                                    v                                              |
|                    Bộ tiền xử lý & Khử trùng lặp Basket                            |
|                                    |                                              |
|                                    v                                              |
|              Thuật toán Apriori (Khai phá L_k tập mục phổ biến)                    |
|                                    |                                              |
|                                    v                                              |
|            Sinh luật kết hợp (X -> Y) & Tính toán Support, Confidence, Lift       |
|                                    |                                              |
|                                    v                                              |
|                     Bảng MySQL: `association_rules`                               |
+-----------------------------------------------------------------------------------+
                                     |
                                     v (Được nạp vào CSDL & Bộ nhớ đệm)
+-----------------------------------------------------------------------------------+
|                           TẦNG TRỰC TUYẾN (ONLINE RECOMMENDATION)                |
|                                                                                   |
| Khách xem Product Detail: ID=1  ---> Tra cứu luật: X={1} -> Lọc & Xếp hạng        |
| Khách xem Giỏ hàng: IDs={1, 3}  ---> Khớp tập luật con -> Loại trừ SP đã có       |
| Trợ lý AI tiếng Việt hỏi mua kèm ---> Gọi AprioriService -> Trả kết quả tư vấn    |
+-----------------------------------------------------------------------------------+
```

---

## 8. MÔ HÌNH DỮ LIỆU PHIÊN GIỎ HÀNG LỊCH SỬ (HISTORICAL CART MODEL)
Để thu thập giỏ hàng mà không làm chậm các thao tác thêm/xóa giỏ hằng ngày:
1. Tạo 2 bảng mới trong CSDL:
   - `cart_sessions`: `id`, `user_id`, `session_token`, `status` (`ACTIVE`, `CONVERTED_TO_ORDER`, `ABANDONED`), `order_id` (khóa ngoại trỏ đến `orders` nếu đã đặt hàng), `last_activity_at`, `created_at`.
   - `cart_session_items`: `id`, `cart_session_id`, `product_id`, `quantity`, `added_at`.
2. **Quy tắc chốt phiên giỏ hàng và đồng bộ hai chiều (Bi-directional Sync & Dedup):**
   - **Đồng bộ thời gian thực:** Mỗi khi người dùng gọi `addItem`, `updateItem`, `removeItem`, hệ thống đồng thời cập nhật phiên `cart_sessions` đang ở trạng thái `ACTIVE` của người dùng đó (hoặc tạo mới nếu chưa có).
   - **Chuyển đổi thành đơn hàng:** Khi khách đặt hàng thành công (`OrderServiceImpl.createOrder`): Phiên giỏ hàng đang hoạt động được cập nhật ngay lập tức thành `CONVERTED_TO_ORDER` và gán `order_id = savedOrder.getId()`.
   - **Xử lý phiên bỏ quên (Abandoned Cart):** Định kỳ (mỗi đêm), cron job quét các phiên `cart_sessions` có `status = 'ACTIVE'` nhưng `last_activity_at < NOW() - 24 HOURS` và chuyển trạng thái thành `ABANDONED`.
   - **Xử lý khách quay lại sau 24h:** Nếu khách quay lại giỏ hàng cũ và tiếp tục thao tác hoặc bấm thanh toán, phiên đó được kích hoạt lại và khi thanh toán thành công sẽ chuyển thành `CONVERTED_TO_ORDER`. Do đó, khi huấn luyện Apriori, truy vấn chỉ lọc `status = 'ABANDONED'` (đảm bảo phiên đã thanh toán không bao giờ bị đếm trùng với đơn hàng).

---

## 9. MÔ HÌNH GIAO DỊCH ĐƠN HÀNG ĐÃ THANH TOÁN (PAID ORDER TRANSACTION MODEL)
- Chỉ các đơn hàng thỏa mãn điều kiện kinh doanh thực tế mới được đưa vào tập giao dịch huấn luyện:
  - `orders.payment_status = 'PAID'` VÀ `orders.status != 'CANCELLED'`.
  - Bao gồm: Đơn thanh toán VNPay thành công, đơn COD đã giao thành công và thu tiền (`COMPLETED`).
  - Loại trừ: Đơn chưa thanh toán (`UNPAID`), đơn đang xử lý thanh toán dở dang, đơn đã hủy hoặc đơn đã hoàn tiền (`REFUNDED`).

---

## 10. CƠ CHẾ KHỬ TRÙNG LẶP GIỎ HÀNG VÀ ĐƠN HÀNG (DEDUPLICATION)
- **Nguyên tắc vàng:** Khi một giỏ hàng được khách hàng thanh toán thành công tạo ra đơn hàng, giỏ hàng và đơn hàng đó chứa cùng một tập sản phẩm. **Tuyệt đối không được tính 2 lần**.
- **Giải pháp kỹ thuật:**
  - Tập giao dịch $D$ được tổng hợp như sau:
    1. Lấy tất cả các giao dịch từ bảng `orders` hợp lệ (`payment_status = 'PAID'`).
    2. Lấy các giao dịch từ bảng `cart_sessions` có `status = 'ABANDONED'` (chưa từng chuyển đổi thành đơn hàng).
    3. Các `cart_sessions` có `status = 'CONVERTED_TO_ORDER'` hoặc đã có `order_id IS NOT NULL` sẽ bị **bỏ qua hoàn toàn** trong truy vấn nạp dữ liệu giỏ hàng, vì đơn hàng tương ứng đã đại diện cho giỏ hàng đó.
  - Nhờ vậy, đảm bảo tính đúng đắn 100% của mẫu số Support mà không cần so khớp mờ theo mốc thời gian.

---

## 11. XỬ LÝ SẢN PHẨM TÙY BIẾN (CUSTOM PRODUCTS)
- Trong bảng `order_items`, nếu một mặt hàng là thiết kế riêng (`custom_notes` hoặc thiết kế 2D không gắn với mã `product_id` catalog chuẩn, hoặc `product_id IS NULL`), mặt hàng đó sẽ bị bỏ qua khỏi danh sách mã sản phẩm của giao dịch.
- Giao dịch Apriori chỉ lưu giữ các `product_id` hợp lệ tồn tại trong bảng `products`.
- Nếu sau khi lọc, một giao dịch chỉ còn dưới 2 sản phẩm hợp lệ, giao dịch đó vẫn được tính vào tổng số giao dịch $N$ nhưng không sinh ra tập mục 2 phần tử trở lên.

---

## 12. THUẬT TOÁN APRIORI THUẦN TÚY (GENUINE APRIORI ALGORITHM)
Cài đặt thuật toán Apriori chuẩn trong service `AprioriMiningServiceImpl.java`:
1. **Phạm vi kích thước luật (Rule Cardinality):**
   - Hệ thống tập trung khai phá các luật kết hợp cặp đôi chuẩn hóa dạng $1 \Rightarrow 1$ ($A \Rightarrow B$ với $A \cap B = \emptyset$).
   - *Lý do kiến trúc:* Dạng luật $1 \Rightarrow 1$ tương thích hoàn hảo với cấu trúc bảng `association_rules` (`antecedent_product_id`, `consequent_product_id`), cho phép đánh chỉ mục B-Tree tốc độ cao (`< 10ms`).
   - *Áp dụng linh hoạt cho Giỏ hàng nhiều sản phẩm:* Khi giỏ hàng có nhiều sản phẩm $\{P_1, P_2, \dots, P_m\}$, hệ thống sẽ tìm hợp các hệ quả tương ứng: $\bigcup \{B \mid P_i \Rightarrow B\}$, sau đó loại bỏ các sản phẩm đã có trong giỏ hàng, gộp điểm và xếp hạng theo $\max(\text{Confidence})$ và $\text{Lift}$.
2. **Bước 1: Chuẩn bị dữ liệu:** Biểu diễn mỗi giao dịch là một `Set<Long>` các `product_id` đã được khử trùng lặp nội bộ trong giao dịch.
3. **Bước 2: Tìm tập 1 mục phổ biến ($L_1$):**
   - Đếm tần suất xuất hiện của từng sản phẩm trên toàn bộ $N$ giao dịch.
   - Loại bỏ các sản phẩm có $\text{Support} < \text{min\_support}$.
4. **Bước 3: Vòng lặp tìm tập 2 mục phổ biến ($L_2$):**
   - Sinh tập ứng viên $C_2$ từ $L_1 \times L_1$.
   - Quét tập giao dịch để tính Support thực tế cho các cặp ứng viên trong $C_2$.
   - Giữ lại các ứng viên đạt $\text{min\_support}$ để tạo thành $L_2$.
5. **Bước 4: Sinh luật kết hợp (Rule Generation):**
   - Với mỗi tập phổ biến $\{A, B\} \in L_2$, sinh 2 luật đối xứng: $A \Rightarrow B$ và $B \Rightarrow A$.
   - Tính toán $\text{Confidence}(A \Rightarrow B) = \frac{\text{Support}(\{A, B\})}{\text{Support}(A)}$.
   - Giữ lại các luật có $\text{Confidence} \ge \text{min\_confidence}$.
   - Tính toán $\text{Lift}(A \Rightarrow B) = \frac{\text{Confidence}(A \Rightarrow B)}{\text{Support}(B)}$. Lọc bỏ các luật có $\text{Lift} \le 1.0$ (chỉ giữ lại các luật có tương quan thuận tích cực).

---

## 13. CÔNG THỨC TOÁN HỌC & NGƯỠNG CẤU HÌNH (THRESHOLDS)
- **Công thức:**
  - $N$: Tổng số giao dịch hợp lệ (Paid Orders + Abandoned Carts).
  - $\text{Support}(X \Rightarrow Y) = \frac{\text{Count}(X \cup Y)}{N}$
  - $\text{Confidence}(X \Rightarrow Y) = \frac{\text{Count}(X \cup Y)}{\text{Count}(X)}$
  - $\text{Lift}(X \Rightarrow Y) = \frac{\text{Confidence}(X \Rightarrow Y)}{\text{Support}(Y)} = \frac{N \times \text{Count}(X \cup Y)}{\text{Count}(X) \times \text{Count}(Y)}$
- **Ngưỡng mặc định (Configurable qua `application.properties`):**
  - `auracraft.apriori.min-support=0.03` (3% - phù hợp cho sàn quy mô vừa và nhỏ)
  - `auracraft.apriori.min-confidence=0.40` (40%)
  - `auracraft.apriori.min-lift=1.05`
  - `auracraft.apriori.cron=0 0 2 * * ?` (Tự động chạy định kỳ vào 2 giờ sáng hằng ngày)

---

## 14. LƯU TRỮ VÀ LẬP LỊCH ĐÀO LUẬT (RULE PERSISTENCE & SCHEDULING)
- Bảng CSDL `association_rules`:
  - `id` (BIGINT AUTO_INCREMENT PK)
  - `antecedent_product_id` (BIGINT, Index) – Mã sản phẩm tiền đề $X$
  - `consequent_product_id` (BIGINT, Index) – Mã sản phẩm gợi ý mua kèm $Y$
  - `support_value` (DOUBLE)
  - `confidence_value` (DOUBLE)
  - `lift_value` (DOUBLE)
  - `rule_explanation` (VARCHAR 255) – Chuỗi mô tả ngắn gọn (VD: *"65% khách hàng mua vòng tay này đã chọn mua kèm charm hoa cúc (Lift 2.1x)"*)
  - `created_at` (TIMESTAMP)
- **Lập lịch chạy không gián đoạn:**
  - Khi thực hiện đào luật mới, kết quả được tính toán hoàn tất trong bộ nhớ, sau đó lưu vào bảng tạm hoặc thực hiện cập nhật theo Transaction để bảng `association_rules` luôn sẵn sàng phục vụ API trực tuyến mà không bị gián đoạn hay trả về rỗng.
  - Cung cấp API quản trị viên: `POST /api/v1/admin/apriori/refresh` (chỉ cho phép `ROLE_ADMIN`) để kích hoạt tính toán lại luật bất kỳ lúc nào.

---

## 15. THIẾT KẾ BỘ API GỢI Ý MUA KÈM (RECOMMENDATION APIS)
Tuân thủ chuẩn `ApiResponse<T>` của hệ thống:

1. **Gợi ý mua kèm trên trang Chi tiết sản phẩm:**
   - **Endpoint:** `GET /api/v1/recommendations/complementary/{productId}?limit=4`
   - **Xử lý:**
     - Tìm trong bảng `association_rules` các luật có `antecedent_product_id = productId`.
     - Sắp xếp theo: `Confidence DESC`, `Lift DESC`, `Support DESC`.
     - Loại bỏ các sản phẩm trùng lặp, sản phẩm có trạng thái `HIDDEN` hoặc hết hàng (`stockQuantity <= 0`).
     - Trả về danh sách `ProductDto.RecommendationResponse` kèm theo các chỉ số và chuỗi giải thích thân thiện.

2. **Gợi ý hoàn thiện giỏ hàng trên trang Giỏ hàng:**
   - **Endpoint:** `GET /api/v1/recommendations/cart?limit=4`
   - **Xác thực:** Yêu cầu Bearer Token của người dùng.
   - **Xử lý:**
     - Lấy danh sách `productId` đang có trong giỏ hàng của khách.
     - Tìm các luật kết hợp có tiền đề nằm trong giỏ hàng.
     - **Bộ lọc loại trừ:** Loại bỏ tất cả các sản phẩm đã có mặt trong giỏ hàng hiện tại.
     - Xếp hạng và trả về các phụ kiện hoàn thiện bộ sưu tập.

---

## 16. YÊU CẦU TRỢ LÝ ẢO AI TIẾNG VIỆT (FEATURE B REQUIREMENTS)
- **Hành vi ngôn ngữ:**
  - Mặc định 100% sử dụng Tiếng Việt trong sáng, thân thiện, xưng hô "AuraCraft" hoặc "Trợ lý AI" và "bạn".
  - Hiểu tốt tiếng Việt không dấu (VD: *"tim qua sinh nhat cho ban nu gia duoi 200k"*), tiếng lóng, viết tắt (*"sp", "đc", "ko"*).
  - Hiểu câu hỏi nối tiếp (Contextual Follow-up) dựa trên ngữ cảnh phiên làm việc.
  - Chỉ chuyển sang tiếng Anh khi khách hàng chủ động hỏi hoàn toàn bằng tiếng Anh.
- **Giao thức Stateless & Quản lý ngữ cảnh:**
  - Endpoint `POST /api/v1/ai/chat` được thiết kế theo mô hình **Stateless**: Phía Frontend gửi kèm payload gồm danh sách tối đa 8 tin nhắn gần nhất (`messages: [{role: "user"|"assistant", content: "..."}]`).
  - *Ưu điểm:* Backend không cần lưu trữ session state trong bộ nhớ, dễ dàng mở rộng và restart không mất ngữ cảnh đang chat của người dùng.
- **Cấu trúc dữ liệu phản hồi có định dạng chuẩn (Structured Response):**
  - Khi Trợ lý AI tư vấn sản phẩm hoặc gợi ý mua kèm, kết quả JSON trả về bao gồm:
    ```json
    {
      "code": 1000,
      "message": "Phản hồi thành công",
      "result": {
        "reply": "Dạ, chiếc vòng tay hạt gỗ thơm thường được các bạn trẻ mua kèm với Dây đeo điện thoại pastel để tạo điểm nhấn xinh xắn...",
        "suggestedProducts": [
          {
            "id": 7,
            "name": "Dây đeo điện thoại handmade pastel",
            "price": 90000.0,
            "thumbnailUrl": "assets/img/products/phoneStrap_01.jpg",
            "artisanName": "Phạm Quang Huy"
          }
        ]
      }
    }
    ```
  - Frontend chỉ cần render danh sách `suggestedProducts` thành các thẻ Mini Card trực quan, tránh lỗi hiển thị do phân tích chuỗi markdown.
- **Quy tắc trung thực (Grounding & Anti-Hallucination):**
  - Tuyệt đối không tự bịa đặt sản phẩm, giá bán hoặc số lượng tồn kho.
  - Mọi thông tin tư vấn phải dựa trên kết quả trả về từ CSDL AuraCraft thông qua các Tool nội bộ.
  - Khi được hỏi về sản phẩm mua kèm hoặc lý do gợi ý, Trợ lý phải gọi Service Apriori để trích xuất các sản phẩm thật và giải thích theo các chỉ số thực tế.

---

## 17. LỰA CHỌN CÔNG NGHỆ VÀ TÍCH HỢP AI (AI PROVIDER SELECTION)
- **Nhà cung cấp đã chọn:** **Google Gemini API** (mô hình `gemini-1.5-flash`).
- **Lý do lựa chọn:**
  - Hoàn toàn ăn khớp với định hướng đã nêu trong tài liệu đồ án của nhóm (`HUONG_DAN_FULLSTACK_AURACRAFT.md`).
  - Hỗ trợ tiếng Việt xuất sắc, độ trễ phản hồi cực thấp (thường `< 1.2s`).
  - Hỗ trợ định dạng JSON Mode và gọi hàm (Function Calling / Tool Use) chuẩn xác.
  - Có hạn mức miễn phí (Free Tier) dồi dào, phù hợp với môi trường đại học và đồ án môn học.
- **Quản lý khóa bí mật:**
  - Cấu hình khóa trong `application.properties`: `auracraft.ai.gemini.api-key=${GEMINI_API_KEY:}`
  - Tuyệt đối không để lộ API Key trên frontend.

---

## 18. TÍCH HỢP GIỮA TRỢ LÝ AI VÀ ENGINE APRIORI
Khi khách hàng đặt câu hỏi liên quan đến mua kèm (Cross-selling):
- **Ví dụ truy vấn:** *"Tôi đang xem vòng tay gỗ mã số 1, có món nào phối kèm đẹp không?"*
- **Quy trình xử lý:**
  1. Gemini Service phân tích ý định (Intent: `GET_COMPLEMENTARY_PRODUCTS`, `productId = 1`).
  2. Gemini kích hoạt gọi tool nội bộ hoặc backend Controller thực thi gọi trực tiếp `AprioriMiningService.getRecommendationsForProduct(1L)`.
  3. Kết quả trả về gồm danh sách sản phẩm mua kèm kèm theo chỉ số Confidence và Lift.
  4. Trợ lý AI tổng hợp thông tin và phản hồi:
     > *"Dạ, theo phân tích thói quen mua sắm tại AuraCraft, khách hàng khi chọn **Vòng tay hạt gỗ thơm** thường mua kèm với **Dây đeo điện thoại pastel** (tỉ lệ mua kèm lên đến 65%). Bạn có thể tham khảo chi tiết ngay bên dưới nhé!"*

---

## 19. TRÍCH XUẤT DỮ LIỆU SẢN PHẨM PHỤC VỤ TRỢ LÝ ẢO
Cung cấp các hàm dịch vụ nội bộ (Internal Tools) cho AI:
- `tool_searchProducts(keyword, categoryId, maxPrice)`: Tìm kiếm sản phẩm theo từ khóa và phân khúc giá.
- `tool_getProductDetail(productId)`: Lấy thông tin chi tiết, màu sắc, tồn kho, tên nghệ nhân chế tác.
- `tool_getComplementaryProducts(productId)`: Gọi Apriori để lấy danh sách mua kèm.
- `tool_getAprioriExplanation(antecedentId, consequentId)`: Lấy lý do giải thích xác suất mua kèm.

---

## 20. THIẾT KẾ GIAO DIỆN CHAT AI (FRONTEND UI DESIGN)
- **Bong bóng chat nổi (Floating AI Assistant Button):**
  - Vị trí: Góc dưới cùng bên phải màn hình (`bottom: 24px; right: 24px; z-index: 1000`).
  - Icon: Trí tuệ nhân tạo phát sáng nhẹ nhàng kèm nhãn *"Trợ lý AI"*.
- **Hộp thoại Chat (Expandable Chat Window):**
  - Kích thước: Rộng 380px, cao 520px, bo tròn góc 16px, hiệu ứng đổ bóng mượt mà.
  - Header: Logo AuraCraft, tên "Trợ lý AI Mua Sắm", nút thu nhỏ/đóng.
  - Khung tin nhắn:
    - Tin nhắn chào mừng mặc định tiếng Việt: *"Xin chào! Tôi là trợ lý AI của AuraCraft. Tôi có thể giúp bạn tìm kiếm món đồ handmade độc đáo, tư vấn quà tặng và gợi ý các sản phẩm phối kèm hoàn hảo."*
    - Hiển thị trực tiếp **Thẻ sản phẩm thu nhỏ (Mini Product Card)** ngay trong khung chat khi AI tư vấn (ảnh đại diện, tên, giá tiền, nút "Xem chi tiết" và nút "Thêm vào giỏ").
  - Thanh nhập liệu: Ô input hỗ trợ gõ tiếng Việt mượt mà, nút Gửi (icon máy bay giấy) và hiệu ứng Spinner đang gõ chữ.

---

## 21. CÁC THAY ĐỔI CƠ SỞ DỮ LIỆU (DATABASE SCHEMA CHANGES)
Tạo 3 bảng mới, bảo toàn 100% dữ liệu cũ:

```sql
-- 1. Bảng lưu trữ phiên giỏ hàng lịch sử
CREATE TABLE IF NOT EXISTS cart_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CONVERTED_TO_ORDER, ABANDONED
    order_id BIGINT NULL,
    last_activity_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_session_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_cart_session_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 2. Bảng chi tiết sản phẩm trong phiên giỏ hàng
CREATE TABLE IF NOT EXISTS cart_session_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_session_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_items_session FOREIGN KEY (cart_session_id) REFERENCES cart_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Bảng lưu trữ các luật kết hợp Apriori đã khai phá
CREATE TABLE IF NOT EXISTS association_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    antecedent_product_id BIGINT NOT NULL,
    consequent_product_id BIGINT NOT NULL,
    support_value DOUBLE NOT NULL,
    confidence_value DOUBLE NOT NULL,
    lift_value DOUBLE NOT NULL,
    rule_explanation VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_antecedent (antecedent_product_id),
    INDEX idx_consequent (consequent_product_id),
    CONSTRAINT fk_rule_antecedent FOREIGN KEY (antecedent_product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_rule_consequent FOREIGN KEY (consequent_product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## 22. BẢO MẬT, QUYỀN RIÊNG TƯ VÀ PHÂN QUYỀN KHÁCH VÃNG LAI (SECURITY, PRIVACY & GUEST ACCESS)
- **Chính sách phân quyền Khách vãng lai (Guest Users):**
  - Để tối ưu hóa trải nghiệm khám phá sản phẩm và chuyển đổi khách mua hàng:
    - Endpoint `POST /api/v1/ai/chat` và `GET /api/v1/recommendations/complementary/**` được mở công khai (`permitAll()` trong `SecurityConfig.java`). Khách vãng lai chưa đăng nhập hoàn toàn có thể sử dụng Trợ lý AI và xem gợi ý sản phẩm mua kèm.
    - Riêng endpoint `GET /api/v1/recommendations/cart` bắt buộc yêu cầu xác thực người dùng (`authenticated()`) vì gắn liền với giỏ hàng của từng tài khoản.
  - **Bảo vệ giỏ hàng cá nhân trong Chatbot:** Khi người dùng hỏi Trợ lý AI về giỏ hàng cá nhân (*"Giỏ hàng của tôi đang có những gì?"*), nếu chưa có JWT Token trong Authorization Header, Trợ lý AI sẽ lịch sự hướng dẫn: *"Bạn ơi, bạn vui lòng đăng nhập tài khoản để mình có thể kiểm tra giỏ hàng giúp bạn nhé!"*.
- **Bảo mật API Key:**
  - API Key của Gemini chỉ nằm tại biến môi trường backend (`application.properties`), tuyệt đối không bao giờ gửi về client.
- **Chống lạm dụng (Rate Limiting & Safety):**
  - Tích hợp bộ đệm giới hạn tần suất gọi chat cho mỗi địa chỉ IP (tối đa 15 yêu cầu / phút) để bảo vệ hạn mức Gemini API.
  - Lớp kiểm duyệt đầu vào (Input Sanitizer) ngăn chặn Prompt Injection và các câu lệnh cố tình ép AI can thiệp dữ liệu hoặc bộc lộ logic bảo mật nội bộ.

---

## 23. HIỆU NĂNG VÀ KHẢ NĂNG MỞ RỘNG (PERFORMANCE)
- Giai đoạn đào luật Apriori nặng về tính toán được thực hiện nền (Offline Background Job) lúc nửa đêm hoặc khi admin yêu cầu, hoàn toàn không ảnh hưởng đến khách hàng đang mua sắm.
- Các truy vấn gợi ý mua kèm trực tuyến chỉ là các câu lệnh `SELECT` theo chỉ mục `antecedent_product_id` trên bảng `association_rules`, thời gian phản hồi đạt dưới **20ms**.

---

## 24. CHIẾN LƯỢC KIỂM THỬ (TESTING STRATEGY)
- **Unit Test Apriori:** Kiểm thử với tập dữ liệu nhỏ giả lập có kết quả tính tay toán học xác thực (Support, Confidence, Lift chính xác 100%).
- **Integration Test Deduplication:** Xác minh giỏ hàng đã chuyển đổi thành đơn hàng không bị đếm trùng lặp 2 lần.
- **Mock AI Test:** Kiểm thử bộ điều khiển Chat với `MockGeminiService` để kiểm thử tự động `mvn test` luôn chạy xanh mà không phụ thuộc vào kết nối mạng ngoài.
- **Regression Test:** Đảm bảo toàn bộ 8 bài test cũ của `AuthServiceImplTest` và hệ thống giỏ hàng, đặt hàng, đăng nhập tiếp tục vượt qua 100%.

---

## 25. XỬ LÝ LỖI VÀ TÌNH HUỐNG BIÊN (EDGE CASES & FALLBACKS)
1. **Dữ liệu giao dịch ban đầu còn ít hoặc không có luật thỏa mãn ngưỡng:** 
   - Hệ thống không hiển thị thông tin rác. Nếu không có luật Apriori thỏa mãn, mục "Sản phẩm mua kèm" sẽ tự động ẩn hoặc gợi ý các sản phẩm phụ kiện bán chạy nhất của cùng danh mục.
2. **Khi Gemini API gặp sự cố mạng hoặc hết quota:**
   - Hệ thống tự động chuyển sang chế độ dự phòng thông minh (Rule-based Fallback) trả lời các câu hỏi phổ biến bằng tiếng Việt và hiển thị sản phẩm mua kèm theo thuật toán Apriori đã lưu trong CSDL.

---

## 26. CÁC PHƯƠNG ÁN ĐÃ CÂN NHẮC VÀ ĐÁNH ĐỔI (ALTERNATIVES CONSIDERED)
- **Phương án 1: Real-time Apriori (Tính Apriori trực tiếp mỗi lần khách mở trang)**
  - *Đánh giá:* Rất chậm, làm treo máy chủ khi lượng đơn hàng tăng lên hàng ngàn đơn. -> **Bác bỏ**.
- **Phương án 2: Batch Apriori thuần túy (Chỉ lấy đơn hàng, bỏ qua giỏ hàng)**
  - *Đánh giá:* Không tận dụng được dữ liệu giỏ hàng theo đúng yêu cầu đề bài của khách hàng. -> **Bác bỏ**.
- **Phương án 3: Hybrid Apriori (Lưu vết giỏ hàng + Đơn hàng PAID + Khử trùng lặp + Offline Mining + Online Serving)**
  - *Đánh giá:* Tối ưu nhất về mặt kiến trúc, chuẩn mực học thuật, đáp ứng trọn vẹn yêu cầu. -> **Được chọn**.

---

## 27. CÁC QUYẾT ĐỊNH ĐÃ ĐƯỢC NGƯỜI DÙNG XÁC NHẬN (DECISIONS MADE)
1. Lựa chọn giải thuật: **Hybrid Apriori** (kết hợp cả giỏ hàng lịch sử và đơn hàng đã thanh toán).
2. Lựa chọn trợ lý AI: **Hỗ trợ Tiếng Việt tự nhiên**, tích hợp **Google Gemini API**.
3. Giữ nguyên vẹn 100% tính năng **FR-22 Cosine Similarity** trong `AiRecommendationService.java`.

---

## 28. CÁC QUYẾT ĐỊNH KỸ THUẬT DO DEVELOPER ĐẢM NHẬN (BUILDER CALLS)
- Đặt tên Service khai phá: `AprioriMiningService` và `AprioriMiningServiceImpl`.
- Đặt tên Service AI: `GeminiAiService` và `GeminiAiServiceImpl`.
- Tạo Controller: `RecommendationController` cho API gợi ý mua kèm và `AiChatController` cho API trò chuyện.
- Tạo cấu trúc bảng `cart_sessions`, `cart_session_items`, `association_rules` tương thích hoàn toàn với MySQL Hibernate `ddl-auto=update`.

---
*Tài liệu này được biên soạn đầy đủ theo tiêu chuẩn của kỹ năng Brainstorming và sẵn sàng cho bước Review & Phê duyệt.*
