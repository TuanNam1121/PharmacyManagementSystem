package com.pharmacy.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private Short status;
    private String statusLabel;
    private LocalDateTime createdAt;
    private String fullName;
    private String avatarUrl;
    private Integer roleId;
    private String roleCode;
    private String roleName;
}
