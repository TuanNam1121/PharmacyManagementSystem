package com.pharmacy.service.impl;

import com.pharmacy.dto.auth.ChangePasswordRequest;
import com.pharmacy.dto.auth.ProfileUpdateRequest;
import com.pharmacy.dto.auth.UserProfileResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.AuditLog;
import com.pharmacy.exception.BadCredentialsException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountInformationRepository;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.AuditLogRepository;
import com.pharmacy.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AccountRepository accountRepository;
    private final AccountInformationRepository accountInformationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long accountId) {
        Account account = accountRepository.findByIdWithDetails(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));

        return mapToUserProfileResponse(account);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long accountId, ProfileUpdateRequest request, String clientIp) {
        Account account = accountRepository.findByIdWithDetails(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));

        AccountInformation profile = account.getAccountInformation();
        if (profile == null) {
            profile = accountInformationRepository.findByAccountId(accountId)
                    .orElseGet(() -> {
                        AccountInformation newInfo = new AccountInformation();
                        newInfo.setAccount(account);
                        return newInfo;
                    });
        }

        Short genderCode = parseGender(request.getGender());

        String oldVal = String.format("fullName=%s, phone=%s, address=%s",
                profile.getFullName(), account.getPhone(), profile.getAddress());

        profile.setFullName(request.getFullName().trim());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(genderCode);
        profile.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            profile.setAvatarUrl(request.getAvatarUrl().trim());
        }

        accountInformationRepository.save(profile);

        // Update phone and updated_at on Account entity
        account.setPhone(request.getPhone().trim());
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);

        String newVal = String.format("fullName=%s, phone=%s, address=%s",
                profile.getFullName(), account.getPhone(), profile.getAddress());

        recordAuditLog(account, (short) 2, "AUTH", accountId, oldVal, "UPDATE_PROFILE: " + newVal, clientIp);
        log.info("Profile updated successfully for account ID {} from IP {}", accountId, clientIp);

        return mapToUserProfileResponse(account);
    }

    @Override
    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest request, String clientIp) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu mới không khớp");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + accountId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không chính xác");
        }

        if (passwordEncoder.matches(request.getNewPassword(), account.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);

        recordAuditLog(account, (short) 2, "AUTH", accountId, null, "CHANGE_PASSWORD_SUCCESS", clientIp);
        log.info("Password changed successfully for account ID {} from IP {}", accountId, clientIp);
    }

    private UserProfileResponse mapToUserProfileResponse(Account account) {
        String roleCode = "USER";
        String roleName = "Người dùng";
        if (account.getRole() != null) {
            roleCode = account.getRole().getCode();
            roleName = account.getRole().getName();
        }
        if (!roleCode.startsWith("ROLE_")) {
            roleCode = "ROLE_" + roleCode;
        }

        AccountInformation info = account.getAccountInformation();
        String fullName = account.getUsername();
        String address = null;
        String avatarUrl = null;
        Short genderCode = null;
        String genderLabel = "OTHER";

        if (info != null) {
            if (info.getFullName() != null && !info.getFullName().isBlank()) {
                fullName = info.getFullName();
            }
            address = info.getAddress();
            avatarUrl = info.getAvatarUrl();
            genderCode = info.getGender();
            if (genderCode != null) {
                if (genderCode == 1) genderLabel = "MALE";
                else if (genderCode == 0) genderLabel = "FEMALE";
                else genderLabel = "OTHER";
            }
        }

        return UserProfileResponse.builder()
                .accountId(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .phone(account.getPhone())
                .role(roleCode)
                .roleName(roleName)
                .storeId(null)
                .storeName(null)
                .fullName(fullName)
                .dateOfBirth(info != null ? info.getDateOfBirth() : null)
                .gender(genderLabel)
                .genderCode(genderCode)
                .address(address)
                .avatarUrl(avatarUrl)
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .build();
    }

    private Short parseGender(String gender) {
        if (gender == null || gender.isBlank()) return null;
        String normalized = gender.trim().toUpperCase();
        if ("1".equals(normalized) || "MALE".equals(normalized) || "NAM".equals(normalized)) {
            return (short) 1;
        }
        if ("0".equals(normalized) || "FEMALE".equals(normalized) || "NỮ".equals(normalized) || "NU".equals(normalized)) {
            return (short) 0;
        }
        return (short) 2; // OTHER
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

