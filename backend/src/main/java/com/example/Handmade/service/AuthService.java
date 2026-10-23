package com.example.Handmade.service;

import com.example.Handmade.dto.request.*;
import com.example.Handmade.dto.response.AuthenticationResponse;

public interface AuthService {
    AuthenticationResponse register(RegisterRequest request);

    AuthenticationResponse login(LoginRequest request);

    void requestPasswordReset(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);

    AuthenticationResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);
}
