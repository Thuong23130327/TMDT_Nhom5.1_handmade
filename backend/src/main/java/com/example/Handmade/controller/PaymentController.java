package com.example.Handmade.controller;

import com.example.Handmade.config.VNPayConfig;
import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.Order;
import com.example.Handmade.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;

    @Value("${app.frontend.success-url:http://localhost:5500/frontend/pages/success.html}")
    private String frontendSuccessUrl;

    // Lưu trữ URL frontend của phiên checkout theo orderCode
    private static final Map<String, String> orderFrontendUrlMap = new ConcurrentHashMap<>();

    @GetMapping("/create-vnpay")
    public ApiResponse<Map<String, String>> createVNPayPayment(
            @RequestParam("orderCode") String orderCode,
            @RequestParam(value = "frontendUrl", required = false) String frontendUrl,
            HttpServletRequest request) throws UnsupportedEncodingException {

        Order order = orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (frontendUrl != null && !frontendUrl.isBlank()) {
            orderFrontendUrlMap.put(orderCode, frontendUrl);
        }

        long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = order.getOrderCode();
        String vnp_IpAddr = getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.getVnpTmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang AuraCraft: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        result.put("orderCode", orderCode);
        return ApiResponse.ok("Tạo liên kết thanh toán VNPay thành công", result);
    }

    @GetMapping(value = "/vnpay-callback", produces = MediaType.TEXT_HTML_VALUE + ";charset=UTF-8")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> allParams) {
        String vnp_SecureHash = allParams.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(allParams);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String signValue = VNPayConfig.hashAllFields(fields, vnPayConfig.getVnpHashSecret());
        String orderCode = allParams.get("vnp_TxnRef");
        String responseCode = allParams.get("vnp_ResponseCode");
        String transactionNo = allParams.get("vnp_TransactionNo");

        boolean isSuccess = "00".equals(responseCode) && signValue.equalsIgnoreCase(vnp_SecureHash);

        if (orderCode != null) {
            orderRepository.findByOrderCodeWithItems(orderCode).ifPresent(order -> {
                if (isSuccess) {
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    orderRepository.save(order);
                }
            });
        }

        String targetUrl = orderCode != null ? orderFrontendUrlMap.remove(orderCode) : null;
        if (targetUrl == null || targetUrl.isBlank()) {
            targetUrl = frontendSuccessUrl;
        }

        String queryParams = "?orderId=" + (orderCode != null ? orderCode : "")
                + "&vnpayStatus=" + (isSuccess ? "SUCCESS" : "FAILED")
                + "&transactionNo=" + (transactionNo != null ? transactionNo : "");

        String primaryRedirect = targetUrl + queryParams;
        String local8080Redirect = "http://localhost:8080/frontend/pages/success.html" + queryParams;

        // Trả về trang HTML trực tiếp từ backend 8080 để KHÔNG BAO GIỜ bị ERR_CONNECTION_REFUSED
        String statusTitle = isSuccess ? "Thanh toán VNPay thành công!" : "Thanh toán VNPay không thành công";
        String statusColor = isSuccess ? "#2e7d32" : "#c62828";
        String iconSvg = isSuccess 
                ? "<svg style='width:64px;height:64px;fill:#2e7d32' viewBox='0 0 24 24'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/></svg>"
                : "<svg style='width:64px;height:64px;fill:#c62828' viewBox='0 0 24 24'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/></svg>";

        String html = "<!DOCTYPE html>\n" +
                "<html lang=\"vi\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>" + statusTitle + " - AuraCraft</title>\n" +
                "    <style>\n" +
                "        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #faf6f4; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }\n" +
                "        .card { background: #fff; max-width: 520px; width: 100%; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; border: 1px solid #ebdcd3; }\n" +
                "        h1 { font-size: 24px; color: " + statusColor + "; margin: 16px 0 8px; }\n" +
                "        p { color: #666; font-size: 15px; line-height: 1.5; margin: 8px 0; }\n" +
                "        .meta-box { background: #f8f9fa; border: 1px dashed #dcdcdc; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 14px; text-align: left; }\n" +
                "        .meta-row { display: flex; justify-content: space-between; padding: 4px 0; }\n" +
                "        .meta-label { color: #888; }\n" +
                "        .meta-value { font-weight: 600; color: #333; }\n" +
                "        .btn { display: block; width: 100%; box-sizing: border-box; padding: 14px; margin: 10px 0; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; cursor: pointer; transition: 0.2s; }\n" +
                "        .btn-primary { background: #7b5144; color: #fff; border: none; }\n" +
                "        .btn-primary:hover { background: #5e3b31; }\n" +
                "        .btn-outline { background: transparent; color: #7b5144; border: 1px solid #7b5144; }\n" +
                "        .btn-outline:hover { background: #f3eae6; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"card\">\n" +
                "        " + iconSvg + "\n" +
                "        <h1>" + statusTitle + "</h1>\n" +
                "        <p>Đơn hàng của bạn đã được ghi nhận vào hệ thống AuraCraft.</p>\n" +
                "        <div class=\"meta-box\">\n" +
                "            <div class=\"meta-row\"><span class=\"meta-label\">Mã đơn hàng:</span><span class=\"meta-value\">#" + (orderCode != null ? orderCode : "---") + "</span></div>\n" +
                "            <div class=\"meta-row\"><span class=\"meta-label\">Trạng thái:</span><span class=\"meta-value\" style=\"color:" + statusColor + "\">" + (isSuccess ? "ĐÃ THANH TOÁN (PAID)" : "CHƯA THANH TOÁN") + "</span></div>\n" +
                (transactionNo != null ? "            <div class=\"meta-row\"><span class=\"meta-label\">Mã giao dịch VNPay:</span><span class=\"meta-value\">" + transactionNo + "</span></div>\n" : "") +
                "        </div>\n" +
                "        <p style=\"font-size:13px;color:#999;\">Đang tự động chuyển hướng về trang đơn hàng trong 1.5 giây...</p>\n" +
                "        <a href=\"" + primaryRedirect + "\" class=\"btn btn-primary\" id=\"btnRedirect\">Xem chi tiết đơn hàng (Cổng 5500)</a>\n" +
                "        <a href=\"" + local8080Redirect + "\" class=\"btn btn-outline\">Xem chi tiết đơn hàng (Cổng 8080)</a>\n" +
                "        <a href=\"/frontend/index.html\" style=\"display:inline-block;margin-top:10px;color:#888;text-decoration:none;font-size:14px;\">← Về trang chủ AuraCraft</a>\n" +
                "    </div>\n" +
                "    <script>\n" +
                "        setTimeout(function() {\n" +
                "            window.location.href = \"" + primaryRedirect + "\";\n" +
                "        }, 1500);\n" +
                "    </script>\n" +
                "</body>\n" +
                "</html>";

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress != null ? ipAddress : "127.0.0.1";
    }
}
