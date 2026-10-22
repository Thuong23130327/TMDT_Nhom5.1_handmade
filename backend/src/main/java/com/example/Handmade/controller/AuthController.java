package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.request.*;
import com.example.Handmade.dto.response.AuthenticationResponse;
import com.example.Handmade.dto.response.MessageResponse;
import com.example.Handmade.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Đăng ký tài khoản thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ApiResponse.ok("Mã OTP đã được gửi nếu email tồn tại trong hệ thống",
                new MessageResponse("Mã OTP đã được gửi nếu email tồn tại trong hệ thống"));
    }

    @PostMapping("/verify-otp")
    public ApiResponse<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ApiResponse.ok("Mã OTP hợp lệ", new MessageResponse("Mã OTP hợp lệ"));
    }

    @PostMapping("/reset-password")
    public ApiResponse<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok("Đổi mật khẩu thành công. Vui lòng đăng nhập lại",
                new MessageResponse("Đổi mật khẩu thành công. Vui lòng đăng nhập lại"));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthenticationResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok("Làm mới phiên đăng nhập thành công", authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ApiResponse<MessageResponse> logout(@RequestBody(required = false) LogoutRequest request) {
        authService.logout(request == null ? null : request.getRefreshToken());
        return ApiResponse.ok("Đăng xuất thành công", new MessageResponse("Đăng xuất thành công"));
    }
}
