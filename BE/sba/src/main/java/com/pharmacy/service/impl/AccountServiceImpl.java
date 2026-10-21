package com.pharmacy.service.impl;

import com.pharmacy.dto.*;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.AccountInformation;
import com.pharmacy.entity.Role;
import com.pharmacy.entity.RolePermission;
import com.pharmacy.exception.DuplicateResourceException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.AccountInformationRepository;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.RolePermissionRepository;
import com.pharmacy.repository.RoleRepository;
import com.pharmacy.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountInformationRepository accountInformationRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreateRequest request) {
        if (accountRepository.existsByUsername(request.getUsername().trim())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' already exists");
        }

        if (accountRepository.existsByEmail(request.getEmail().trim())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' already exists");
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()
                && accountRepository.existsByPhone(request.getPhone().trim())) {
            throw new DuplicateResourceException("Phone number '" + request.getPhone() + "' already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));

        Account account = new Account();
        account.setUsername(request.getUsername().trim());
        account.setEmail(request.getEmail().trim());
        account.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setStatus(request.getStatus() != null ? request.getStatus() : com.pharmacy.entity.enums.AccountStatus.ACTIVE.getCode());
        account.setFailedLoginCount(0);
        account.setCreatedAt(LocalDateTime.now());
        account.setRole(role);

        Account savedAccount = accountRepository.save(account);

        AccountInformation accountInfo = new AccountInformation();
        accountInfo.setAccount(savedAccount);
        accountInfo.setFullName(request.getFullName().trim());
        accountInfo.setDateOfBirth(request.getDateOfBirth());
        accountInfo.setGender(request.getGender());
        accountInfo.setAddress(request.getAddress());
        accountInfo.setAvatarUrl(request.getAvatarUrl());

        accountInformationRepository.save(accountInfo);
        savedAccount.setAccountInformation(accountInfo);

        return mapToAccountResponse(savedAccount);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(Long id, AccountUpdateRequest request) {
        Account account = accountRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));

        String email = request.getEmail().trim();
        if (accountRepository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateResourceException("Email '" + email + "' already exists for another account");
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (accountRepository.existsByPhoneAndIdNot(phone, id)) {
                throw new DuplicateResourceException("Phone number '" + phone + "' already exists for another account");
            }
            account.setPhone(phone);
        } else {
            account.setPhone(null);
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));

        account.setEmail(email);
        account.setRole(role);
        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }
        account.setUpdatedAt(LocalDateTime.now());

        AccountInformation accountInfo = account.getAccountInformation();
        if (accountInfo == null) {
            accountInfo = new AccountInformation();
            accountInfo.setAccount(account);
        }
        accountInfo.setFullName(request.getFullName().trim());
        accountInfo.setDateOfBirth(request.getDateOfBirth());
        accountInfo.setGender(request.getGender());
        accountInfo.setAddress(request.getAddress());
        accountInfo.setAvatarUrl(request.getAvatarUrl());

        accountInformationRepository.save(accountInfo);
        account.setAccountInformation(accountInfo);
        Account savedAccount = accountRepository.save(account);

        return mapToAccountResponse(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountDetailResponse getAccountDetail(Long id) {
        Account account = accountRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));

        AccountInformation info = account.getAccountInformation();
        Role role = account.getRole();

        List<String> permissionCodes = Collections.emptyList();
        RoleDto roleDto = null;
        if (role != null) {
            roleDto = RoleDto.builder()
                    .id(role.getId())
                    .code(role.getCode())
                    .name(role.getName())
                    .description(role.getDescription())
                    .build();

            List<RolePermission> rolePermissions = rolePermissionRepository.findAllByRoleIdWithPermission(role.getId());
            permissionCodes = rolePermissions.stream()
                    .map(rp -> rp.getPermission().getCode())
                    .collect(Collectors.toList());
        }

        return AccountDetailResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .phone(account.getPhone())
                .status(account.getStatus())
                .lastLoginAt(account.getLastLoginAt())
                .failedLoginCount(account.getFailedLoginCount())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .fullName(info != null ? info.getFullName() : null)
                .dateOfBirth(info != null ? info.getDateOfBirth() : null)
                .gender(info != null ? info.getGender() : null)
                .address(info != null ? info.getAddress() : null)
                .avatarUrl(info != null ? info.getAvatarUrl() : null)
                .role(roleDto)
                .permissions(permissionCodes)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAccounts(String keyword, Short status, Integer roleId,
                                                    int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = ("username".equalsIgnoreCase(sortBy) || "email".equalsIgnoreCase(sortBy) || "createdAt".equalsIgnoreCase(sortBy))
                ? sortBy : "createdAt";

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, property));
        Page<Account> accountPage = accountRepository.findAccountsWithFilters(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                status,
                roleId,
                pageable
        );

        List<AccountResponse> items = accountPage.getContent().stream()
                .map(this::mapToAccountResponse)
                .collect(Collectors.toList());

        return PageResponse.<AccountResponse>builder()
                .content(items)
                .pageNumber(accountPage.getNumber())
                .pageSize(accountPage.getSize())
                .totalElements(accountPage.getTotalElements())
                .totalPages(accountPage.getTotalPages())
                .last(accountPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void updateAccountStatus(Long id, Short status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
        account.setStatus(status);
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    private AccountResponse mapToAccountResponse(Account account) {
        AccountInformation info = account.getAccountInformation();
        Role role = account.getRole();

        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .phone(account.getPhone())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .fullName(info != null ? info.getFullName() : null)
                .avatarUrl(info != null ? info.getAvatarUrl() : null)
                .roleId(role != null ? role.getId() : null)
                .roleCode(role != null ? role.getCode() : null)
                .roleName(role != null ? role.getName() : null)
                .build();
    }
}
