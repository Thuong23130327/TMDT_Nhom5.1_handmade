package com.example.Handmade.service;

import com.example.Handmade.config.JwtTokenProvider;
import com.example.Handmade.dto.request.*;
import com.example.Handmade.dto.response.AuthenticationResponse;
import com.example.Handmade.exception.AppException;
import com.example.Handmade.exception.ErrorCode;
import com.example.Handmade.model.User;
import com.example.Handmade.model.UserRefreshToken;
import com.example.Handmade.repository.UserRefreshTokenRepository;
import com.example.Handmade.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final int OTP_LIFETIME_MINUTES = 5;
    private static final int OTP_RESEND_SECONDS = 60;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final UserRefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${auracraft.mail.from:}")
    private String mailFrom;

    @Override
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        validateBcryptPasswordLength(request.getPassword());
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(StringUtils.hasText(request.getPhone()) ? request.getPhone().trim() : null);
        user.setRole(User.Role.ROLE_CUSTOMER);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setOtpAttempts(0);
        return issueTokens(userRepository.save(user));
    }

    @Override
    @Transactional
    public AuthenticationResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        Optional<User> foundUser = identifier.contains("@")
                ? userRepository.findByEmailIgnoreCase(identifier)
                : userRepository.findByUsernameIgnoreCase(identifier);
        User user = foundUser.orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_BLOCKED);
        }
        return issueTokens(user);
    }

    @Override
    @Transactional(noRollbackFor = AppException.class)
    public void requestPasswordReset(ForgotPasswordRequest request) {
        Optional<User> found = userRepository.findByEmailForUpdate(request.getEmail().trim());
        if (found.isEmpty()) {
            return;
        }
        User user = found.get();
        LocalDateTime now = LocalDateTime.now();
        if (user.getResetToken() != null && user.getResetTokenExpiry() != null) {
            LocalDateTime issuedAt = user.getResetTokenExpiry().minusMinutes(OTP_LIFETIME_MINUTES);
            if (issuedAt.plusSeconds(OTP_RESEND_SECONDS).isAfter(now)) {
                throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
            }
        }

        String otp = String.format(Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
        user.setResetToken(passwordEncoder.encode(otp));
        user.setResetTokenExpiry(now.plusMinutes(OTP_LIFETIME_MINUTES));
        user.setOtpAttempts(0);
        userRepository.save(user);
        sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional(noRollbackFor = AppException.class)
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmailForUpdate(request.getEmail().trim())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED));
        verifyOtpForUser(user, request.getOtpCode());
    }

    @Override
    @Transactional(noRollbackFor = AppException.class)
    public void resetPassword(ResetPasswordRequest request) {
        validateBcryptPasswordLength(request.getNewPassword());
        User user = userRepository.findByEmailForUpdate(request.getEmail().trim())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED));
        verifyOtpForUser(user, request.getOtpCode());
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_REUSED);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        clearResetOtp(user);
        userRepository.save(user);
        refreshTokenRepository.deleteAllByUser_Id(user.getId());
    }

    @Override
    @Transactional
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String rawToken = request.getRefreshToken().trim();
        Claims claims;
        try {
            claims = tokenProvider.parseClaims(rawToken);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        if (!tokenProvider.isRefreshToken(rawToken)) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String tokenHash = tokenFingerprint(rawToken);
        UserRefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REFRESH_TOKEN));
        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        User user = storedToken.getUser();
        if (user.getStatus() != User.UserStatus.ACTIVE
                || !user.getUsername().equalsIgnoreCase(claims.getSubject())) {
            refreshTokenRepository.delete(storedToken);
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        refreshTokenRepository.delete(storedToken);
        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (StringUtils.hasText(refreshToken)) {
            refreshTokenRepository.deleteByTokenHash(tokenFingerprint(refreshToken.trim()));
        }
    }

    private void verifyOtpForUser(User user, String suppliedOtp) {
        if (!StringUtils.hasText(user.getResetToken()) || user.getResetTokenExpiry() == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            clearResetOtp(user);
            userRepository.save(user);
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        if (!passwordEncoder.matches(suppliedOtp, user.getResetToken())) {
            int attempts = user.getOtpAttempts() == null ? 1 : user.getOtpAttempts() + 1;
            user.setOtpAttempts(attempts);
            if (attempts >= MAX_OTP_ATTEMPTS) {
                clearResetOtp(user);
                userRepository.save(user);
                throw new AppException(ErrorCode.TOO_MANY_OTP_ATTEMPTS);
            }
            userRepository.save(user);
            throw new AppException(ErrorCode.INVALID_OTP);
        }
    }

    private void clearResetOtp(User user) {
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setOtpAttempts(0);
    }

    private void validateBcryptPasswordLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new AppException(ErrorCode.PASSWORD_TOO_LONG);
        }
    }

    private AuthenticationResponse issueTokens(User user) {
        String accessToken = tokenProvider.createAccessToken(user);
        String refreshToken = tokenProvider.createRefreshToken(user);
        UserRefreshToken storedToken = new UserRefreshToken();
        storedToken.setUser(user);
        storedToken.setTokenHash(tokenFingerprint(refreshToken));
        storedToken.setExpiresAt(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshExpirationMs() / 1000));
        refreshTokenRepository.save(storedToken);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userSummary(AuthenticationResponse.UserSummary.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(JwtTokenProvider.toAuthority(user.getRole()))
                        .build())
                .build();
    }

    private void sendOtpEmail(String email, String otp) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            if (StringUtils.hasText(mailFrom)) {
                helper.setFrom(mailFrom);
            }
            helper.setTo(email);
            helper.setSubject("Mã xác thực khôi phục mật khẩu AuraCraft");
            helper.setText("<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#493a36\">"
                    + "<div style=\"background:#7b5144;padding:22px;text-align:center;color:#fff;font-size:24px;font-weight:bold\">AuraCraft</div>"
                    + "<div style=\"padding:28px;border:1px solid #eee\"><h2>Khôi phục mật khẩu</h2>"
                    + "<p>Nhập mã xác thực dưới đây để tiếp tục. Mã chỉ có hiệu lực trong 5 phút.</p>"
                    + "<div style=\"font-size:32px;font-weight:bold;letter-spacing:8px;color:#a85d48;padding:18px 0\">"
                    + otp + "</div><p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p></div></div>", true);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Không thể tạo email xác thực", exception);
        }
        mailSender.send(message);
    }

    private String tokenFingerprint(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexadecimal = new StringBuilder(hash.length * 2);
            for (byte item : hash) {
                hexadecimal.append(String.format(Locale.ROOT, "%02x", item & 0xff));
            }
            return hexadecimal.toString();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Không thể tạo dấu vân tay refresh token", exception);
        }
    }
}
