package com.pharmacy.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long accountId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String roleName;
    private Long storeId;
    private String storeName;
    private String avatarUrl;
}

