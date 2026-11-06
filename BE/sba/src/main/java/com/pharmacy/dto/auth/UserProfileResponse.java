package com.pharmacy.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long accountId;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String roleName;
    private Long storeId;
    private String storeName;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private Short genderCode;
    private String address;
    private String avatarUrl;
    private Short status;
    private LocalDateTime createdAt;
}

