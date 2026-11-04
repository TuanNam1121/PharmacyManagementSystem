package com.pharmacy.service.impl;

import com.pharmacy.dto.auth.*;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.entity.EmailLog;
import com.pharmacy.entity.PasswordResetToken;
import com.pharmacy.exception.AccountLockedException;
import com.pharmacy.exception.BadCredentialsException;
import com.pharmacy.exception.InvalidTokenException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.repository.EmailLogRepository;
import com.pharmacy.repository.PasswordResetTokenRepository;
import com.pharmacy.security.JwtTokenProvider;
import com.pharmacy.service.AuthService;
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
    private final AuditLogRepository auditLogRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailLogRepository emailLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProfileService profileService;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        String keyword = request.getUsername() != null ? request.getUsername().trim() : "";

        // 1. Tìm kiếm tài khoản theo username hoặc email
        Account account = accountRepository.findByUsernameOrEmailWithDetails(keyword)
                .orElseThrow(() -> {
                    log.warn("Login failed: account '{}' not found from IP {}", keyword, ipAddress);
                    return new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
                });

        // 2. Kiểm tra trạng thái tài khoản (status = 1: Active)
        if (account.getStatus() == null || account.getStatus() != 1) {
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
                account.setStatus((short) 0); // Khóa tài khoản sau 5 lần thất bại liên tiếp
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

        // 5. Sinh JWT Token
        String token = jwtTokenProvider.generateToken(account);

        // 6. Ghi nhật ký kiểm toán thành công
        recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "LOGIN_SUCCESS", ipAddress);

        // 7. Tạo LoginResponse
        return buildLoginResponse(account, token);
    }

    @Override
    @Transactional
    public void logout(String authHeader, String clientIp) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Long accountId = jwtTokenProvider.getAccountIdFromToken(token);
                if (accountId != null) {
                    Account account = accountRepository.findById(accountId).orElse(null);
                    recordAuditLog(account, (short) 4, "AUTH", accountId, null, "LOGOUT", clientIp);
                    log.info("Account ID {} logged out successfully from IP {}", accountId, clientIp);
                }
            }
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
        if (account.getStatus() == null || account.getStatus() != 1) {
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

        // Tạo bản ghi email giả lập (EmailLog)
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        String emailBody = String.format(
                "Xin chào %s,\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản hệ thống PharmaChain.\n" +
                        "Vui lòng nhấn vào liên kết bên dưới để tạo mật khẩu mới (Liên kết có hiệu lực trong 15 phút):\n%s\n\n"
                        +
                        "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.",
                account.getUsername(), resetLink);

        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(account.getEmail());
        emailLog.setSubject("Khôi phục mật khẩu - PharmaChain Management System");
        emailLog.setBody(emailBody);
        emailLog.setRefType("PASSWORD_RESET");
        emailLog.setRefId(tokenEntity.getId());
        emailLog.setStatus((short) 1); // 1: Sent / Queued
        emailLogRepository.save(emailLog);

        recordAuditLog(account, (short) 1, "AUTH", account.getId(), null, "FORGOT_PASSWORD_REQUEST", clientIp);
        log.info("Password reset token generated for account '{}': {} (Link: {})", account.getUsername(), resetToken,
                resetLink);
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

        UserSummaryDto userSummary = UserSummaryDto.builder()
                .accountId(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(fullName)
                .role(roleCode)
                .roleName(roleName)
                .avatarUrl(avatarUrl)
                .storeId(null)
                .storeName(null)
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
