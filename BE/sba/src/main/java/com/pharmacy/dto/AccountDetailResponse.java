package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDetailResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private Short status;
    private LocalDateTime lastLoginAt;
    private Integer failedLoginCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Profile info
    private String fullName;
    private LocalDate dateOfBirth;
    private Short gender;
    private String address;
    private String avatarUrl;

    // RBAC
    private RoleDto role;
    private List<String> permissions;
}
