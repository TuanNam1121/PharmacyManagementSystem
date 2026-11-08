package com.pharmacy.service.impl;

import com.pharmacy.dto.auth.*;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.PasswordResetToken;
import com.pharmacy.entity.RefreshToken;
import com.pharmacy.entity.enums.AccountStatus;
import com.pharmacy.exception.AccountLockedException;
import com.pharmacy.exception.BadCredentialsException;
import com.pharmacy.exception.InvalidTokenException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.exception.TokenRefreshException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.PasswordResetTokenRepository;
import com.pharmacy.repository.RefreshTokenRepository;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.AuthService;
import com.pharmacy.service.EmailService;
import com.pharmacy.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProfileService profileService;

    @Override
    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress) {
        String keyword = request.getUsername() != null ? request.getUsername().trim() : "";

        // 1. Tìm kiếm tài khoản theo username hoặc email
        Account account = accountRepository.findByUsernameOrEmailWithDetails(keyword)
                .orElseThrow(() -> {
                    log.warn("Login failed: account '{}' not found from IP {}", keyword, ipAddress);
                    return new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
                });

        // 2. Kiểm tra trạng thái tài khoản (status = 1: Active)
        if (account.getStatus() == null || account.getStatus() != AccountStatus.ACTIVE) {
            log.warn("Login failed: account '{}' is locked/inactive (status={})", keyword, account.getStatus());
            recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "LOGIN_BLOCKED_ACCOUNT_INACTIVE",
                    ipAddress);
            throw new AccountLockedException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên");
        }

        // 3. So sánh mật khẩu bằng BCrypt
        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            int failed = account.getFailedLoginCount() != null ? account.getFailedLoginCount() + 1 : 1;
            account.setFailedLoginCount(failed);
            if (failed >= 5) {
                account.setStatus(AccountStatus.LOCKED); // Khóa tài khoản sau 5 lần thất bại liên tiếp
                log.warn("Account '{}' locked due to 5 consecutive failed login attempts", keyword);
            }
            accountRepository.save(account);

            recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "LOGIN_FAILED", ipAddress);
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        // 4. Reset số lần đăng nhập sai & cập nhật thời điểm đăng nhập gần nhất
        account.setFailedLoginCount(0);
        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        // 5. Sinh cặp Access Token (15 phút) & Refresh Token (8 tiếng)
        String accessToken = jwtTokenProvider.generateAccessToken(account);
        String refreshToken = jwtTokenProvider.generateRefreshToken(account);

        // 6. Lưu Refresh Token vào Database
        LocalDateTime expiryDate = LocalDateTime.now()
                .plusSeconds(jwtTokenProvider.getRefreshTokenExpirationInSeconds());
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .account(account)
                .token(refreshToken)
                .expiryDate(expiryDate)
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // 7. Ghi nhật ký kiểm toán thành công
        recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "LOGIN_SUCCESS", ipAddress);

        // 8. Tạo LoginResponse & trả về LoginResult
        LoginResponse loginResponse = buildLoginResponse(account, accessToken);
        return new LoginResult(loginResponse, refreshToken);
    }

    @Override
    @Transactional
    public LoginResult refreshToken(String requestRefreshToken, String ipAddress) {
        if (requestRefreshToken == null || requestRefreshToken.trim().isEmpty()) {
            throw new TokenRefreshException("Không tìm thấy Refresh Token. Vui lòng đăng nhập lại");
        }

        // 1. Kiểm tra tính hợp lệ về cấu trúc/chữ ký token
        if (!jwtTokenProvider.validateRefreshToken(requestRefreshToken)) {
            throw new TokenRefreshException("Refresh Token không hợp lệ. Vui lòng đăng nhập lại");
        }

        // 2. Tìm kiếm Refresh Token trong Database
        RefreshToken tokenEntity = refreshTokenRepository.findByTokenWithDetails(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException("Refresh Token không tồn tại trên hệ thống"));

        Account account = tokenEntity.getAccount();
        if (account == null || account.getStatus() != AccountStatus.ACTIVE) {
            throw new TokenRefreshException("Tài khoản liên kết không tồn tại hoặc đã bị khóa");
        }

        // 3. Cơ chế phát hiện tấn công tái sử dụng (Token Reuse Detection)
        if (tokenEntity.isRevoked()) {
            refreshTokenRepository.revokeAllByAccountId(account.getId());
            recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "TOKEN_REUSE_DETECTED", ipAddress);
            log.warn("Security Alert: Reused revoked refresh token detected for account ID {}. All tokens revoked.",
                    account.getId());
            throw new TokenRefreshException(
                    "Cảnh báo bảo mật: Phát hiện Token tái sử dụng trái phép. Phiên làm việc đã bị hủy");
        }

        // 4. Kiểm tra thời hạn hết hạn (Expiry)
        if (tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenEntity.setRevoked(true);
            refreshTokenRepository.save(tokenEntity);
            throw new TokenRefreshException("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại");
        }

        // 5. Áp dụng Refresh Token Rotation (RTR): Vô hiệu hóa token cũ, sinh cặp AT +
        // RT mới
        tokenEntity.setRevoked(true);

        String newAccessToken = jwtTokenProvider.generateAccessToken(account);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(account);

        tokenEntity.setReplacedByToken(newRefreshToken);
        refreshTokenRepository.save(tokenEntity);

        LocalDateTime newExpiryDate = LocalDateTime.now()
                .plusSeconds(jwtTokenProvider.getRefreshTokenExpirationInSeconds());
        RefreshToken newRtEntity = RefreshToken.builder()
                .account(account)
                .token(newRefreshToken)
                .expiryDate(newExpiryDate)
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(newRtEntity);

        recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "TOKEN_REFRESH", ipAddress);

        LoginResponse loginResponse = buildLoginResponse(account, newAccessToken);
        return new LoginResult(loginResponse, newRefreshToken);
    }

    @Override
    @Transactional
    public void logout(String authHeader, String requestRefreshToken, String clientIp) {
        Long accountId = null;

        // Vô hiệu hóa Refresh Token trong DB nếu có
        if (requestRefreshToken != null && !requestRefreshToken.trim().isEmpty()) {
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(requestRefreshToken);
            if (tokenOpt.isPresent()) {
                RefreshToken token = tokenOpt.get();
                token.setRevoked(true);
                refreshTokenRepository.save(token);
                if (token.getAccount() != null) {
                    accountId = token.getAccount().getId();
                }
            }
        }

        if (accountId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                accountId = jwtTokenProvider.getAccountIdFromToken(token);
            }
        }

        if (accountId != null) {
            Account account = accountRepository.findById(accountId).orElse(null);
            recordAuditLog(account, (short) 4, "AUTH", accountId, null, "LOGOUT", clientIp);
            log.info("Account ID {} logged out successfully from IP {}", accountId, clientIp);
        }
    }

    @Override
    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest request, String clientIp) {
        profileService.changePassword(accountId, request, clientIp);
    }

    @Override
    @Transactional
    public void processForgotPassword(ForgotPasswordRequest request, String clientIp) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        // Chống user enumeration: luôn hoàn thành âm thầm nếu email không tồn tại hoặc
        // tài khoản bị khóa
        if (accountOpt.isEmpty()) {
            log.info("Forgot password requested for non-existent email '{}' from IP {}", email, clientIp);
            return;
        }

        Account account = accountOpt.get();
        if (account.getStatus() == null || account.getStatus() != AccountStatus.ACTIVE) {
            log.warn("Forgot password requested for inactive account '{}' from IP {}", email, clientIp);
            return;
        }

        // Sinh token ngẫu nhiên bảo mật (UUID 36 ký tự)
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15); // Hết hạn sau 15 phút (BR-01)

        PasswordResetToken tokenEntity = new PasswordResetToken();
        tokenEntity.setAccount(account);
        tokenEntity.setTokenHash(resetToken);
        tokenEntity.setExpiresAt(expiresAt);
        tokenEntity.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(tokenEntity);

        // Gửi email khôi phục mật khẩu thông qua EmailService
        emailService.sendPasswordResetEmail(account.getEmail(), account.getUsername(), resetToken);

        recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "FORGOT_PASSWORD_REQUEST", clientIp);
        log.info("Password reset token generated for account '{}': {}", account.getUsername(), resetToken);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request, String clientIp) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        PasswordResetToken tokenEntity = passwordResetTokenRepository.findByTokenHash(request.getToken().trim())
                .orElseThrow(() -> new InvalidTokenException("Liên kết khôi phục mật khẩu không hợp lệ"));

        if (tokenEntity.getUsedAt() != null) {
            throw new InvalidTokenException("Token này đã được sử dụng trước đó");
        }

        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Liên kết khôi phục mật khẩu đã hết hạn (chỉ có hiệu lực 15 phút)");
        }

        Account account = tokenEntity.getAccount();
        if (account == null) {
            throw new ResourceNotFoundException("Tài khoản liên kết không tồn tại");
        }

        // Cập nhật mật khẩu mới băm BCrypt
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);

        // Đánh dấu token đã được sử dụng
        tokenEntity.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(tokenEntity);

        recordAuditLog(account, (short) 2, "AUTH", account.getId(), null, "RESET_PASSWORD_SUCCESS", clientIp);
        log.info("Password reset completed successfully for account '{}' from IP {}", account.getUsername(), clientIp);
    }

    private LoginResponse buildLoginResponse(Account account, String token) {
        String roleCode = "USER";
        String roleName = "User";
        if (account.getRole() != null) {
            roleCode = account.getRole().getCode();
            roleName = account.getRole().getName();
        }
        if (!roleCode.startsWith("ROLE_")) {
            roleCode = "ROLE_" + roleCode;
        }

        String fullName = account.getUsername();
        String avatarUrl = null;
        if (account.getAccountInformation() != null) {
            if (account.getAccountInformation().getFullName() != null) {
                fullName = account.getAccountInformation().getFullName();
            }
            avatarUrl = account.getAccountInformation().getAvatarUrl();
        }

        Long storeId = null;
        String storeName = null;
        if (account.getStore() != null) {
            storeId = account.getStore().getId();
            storeName = account.getStore().getName();
        }

        UserSummaryDto userSummary = UserSummaryDto.builder()
                .accountId(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(fullName)
                .role(roleCode)
                .roleName(roleName)
                .avatarUrl(avatarUrl)
                .storeId(storeId)
                .storeName(storeName)
                .build();

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationInSeconds())
                .user(userSummary)
                .build();
    }

    private void recordAuditLog(Account account, Short action, String entityName, Long entityId,
            String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAccount(account);
            auditLog.setAction(action);
            auditLog.setEntityName(entityName);
            auditLog.setEntityId(entityId);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress);
            auditLog.setCreatedAt(LocalDateTime.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage());
        }
    }
}
