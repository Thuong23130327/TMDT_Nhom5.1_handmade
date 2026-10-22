package com.example.Handmade.service;

import com.example.Handmade.config.JwtTokenProvider;
import com.example.Handmade.dto.request.RegisterRequest;
import com.example.Handmade.dto.request.ResetPasswordRequest;
import com.example.Handmade.dto.request.VerifyOtpRequest;
import com.example.Handmade.dto.response.AuthenticationResponse;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.User;
import com.example.Handmade.repository.UserRefreshTokenRepository;
import com.example.Handmade.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserRefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private JavaMailSender mailSender;
    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerHashesPasswordAndIssuesCustomerTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("handmade_user");
        request.setEmail("user@example.com");
        request.setPassword("StrongPass1!");
        request.setFullName("Handmade User");
        request.setPhone("0912345678");
        when(userRepository.existsByUsernameIgnoreCase(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(7L);
            return user;
        });
        when(tokenProvider.createAccessToken(any(User.class))).thenReturn("access-token");
        when(tokenProvider.createRefreshToken(any(User.class))).thenReturn("refresh-token");

        AuthenticationResponse response = authService.register(request);

        assertEquals("ROLE_CUSTOMER", response.getUserSummary().getRole());
        org.mockito.ArgumentCaptor<User> savedUser = forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("bcrypt-hash", savedUser.getValue().getPassword());
        assertEquals(User.Role.ROLE_CUSTOMER, savedUser.getValue().getRole());
        verify(refreshTokenRepository).save(any());
    }

    @Test
    void rejectsIncorrectOtpAndIncrementsAttempts() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setResetToken("otp-hash");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(3));
        user.setOtpAttempts(0);
        when(userRepository.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "otp-hash")).thenReturn(false);
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtpCode("123456");

        AppException exception = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(ErrorCode.INVALID_OTP, exception.getErrorCode());
        assertEquals(1, user.getOtpAttempts());
        verify(userRepository).save(user);
    }

    @Test
    void invalidatesOtpAfterFiveIncorrectAttempts() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setResetToken("otp-hash");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(3));
        user.setOtpAttempts(4);
        when(userRepository.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "otp-hash")).thenReturn(false);
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.com");
        request.setOtpCode("123456");

        AppException exception = assertThrows(AppException.class, () -> authService.verifyOtp(request));

        assertEquals(ErrorCode.TOO_MANY_OTP_ATTEMPTS, exception.getErrorCode());
        assertNull(user.getResetToken());
        assertNull(user.getResetTokenExpiry());
        assertEquals(0, user.getOtpAttempts());
    }

    @Test
    void resetsPasswordAndRevokesExistingRefreshTokens() {
        User user = new User();
        user.setId(7L);
        user.setEmail("user@example.com");
        user.setPassword("old-password-hash");
        user.setResetToken("otp-hash");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(3));
        user.setOtpAttempts(0);
        when(userRepository.findByEmailForUpdate("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "otp-hash")).thenReturn(true);
        when(passwordEncoder.matches("NewStrong1!", "old-password-hash")).thenReturn(false);
        when(passwordEncoder.encode("NewStrong1!")).thenReturn("new-password-hash");
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("user@example.com");
        request.setOtpCode("123456");
        request.setNewPassword("NewStrong1!");
        request.setConfirmPassword("NewStrong1!");

        authService.resetPassword(request);

        assertEquals("new-password-hash", user.getPassword());
        assertNull(user.getResetToken());
        verify(userRepository).save(user);
        verify(refreshTokenRepository).deleteAllByUser_Id(7L);
    }

    @Test
    void logoutRevokesRefreshTokenByItsHash() throws Exception {
        String refreshToken = "refresh-token";
        byte[] hash = MessageDigest.getInstance("SHA-256")
                .digest(refreshToken.getBytes(StandardCharsets.UTF_8));
        StringBuilder expectedHash = new StringBuilder();
        for (byte value : hash) {
            expectedHash.append(String.format("%02x", value & 0xff));
        }

        authService.logout(refreshToken);

        verify(refreshTokenRepository).deleteByTokenHash(expectedHash.toString());
    }

    @Test
    void logoutWithoutRefreshTokenIsSafe() {
        authService.logout(null);

        verifyNoInteractions(refreshTokenRepository);
    }
}
