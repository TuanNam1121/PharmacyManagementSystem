package com.pharmacy.dto.account;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignRequest {
    @NotNull(message = "Role ID is required")
    private Integer roleId;
}
