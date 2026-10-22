package com.example.Handmade.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    VALIDATION_ERROR(1001, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED(1015, "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    USER_EXISTED(1002, "Tên đăng nhập đã được sử dụng", HttpStatus.CONFLICT),
    EMAIL_EXISTED(1003, "Email này đã được đăng ký", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS(1004, "Tên đăng nhập/email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    ACCOUNT_BLOCKED(1005, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin", HttpStatus.FORBIDDEN),
    DATA_CONFLICT(1006, "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc", HttpStatus.CONFLICT),
    OTP_EXPIRED(1007, "Mã OTP đã hết hiệu lực", HttpStatus.BAD_REQUEST),
    INVALID_OTP(1008, "Mã OTP không chính xác", HttpStatus.BAD_REQUEST),
    TOO_MANY_OTP_ATTEMPTS(1009, "Bạn đã nhập sai OTP quá số lần cho phép. Vui lòng yêu cầu mã mới", HttpStatus.TOO_MANY_REQUESTS),
    TOO_MANY_REQUESTS(1010, "Vui lòng đợi 60 giây trước khi yêu cầu mã mới", HttpStatus.TOO_MANY_REQUESTS),
    PASSWORD_MISMATCH(1011, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    PASSWORD_REUSED(1012, "Mật khẩu mới không được trùng mật khẩu hiện tại", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(1013, "Refresh token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    PASSWORD_TOO_LONG(1014, "Mật khẩu không được vượt quá 72 byte UTF-8", HttpStatus.BAD_REQUEST),
    SYSTEM_ERROR(9999, "Hệ thống gặp sự cố, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
