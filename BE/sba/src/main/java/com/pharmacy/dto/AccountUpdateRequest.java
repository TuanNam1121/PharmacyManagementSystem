package com.pharmacy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AccountUpdateRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email maximum 150 characters")
    private String email;

    @Size(max = 20, message = "Phone number maximum 20 characters")
    private String phone;

    private Short status;

    @NotNull(message = "Role ID is required")
    private Integer roleId;

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name maximum 150 characters")
    private String fullName;

    private LocalDate dateOfBirth;

    private Short gender;

    @Size(max = 500, message = "Address maximum 500 characters")
    private String address;

    @Size(max = 500, message = "Avatar URL maximum 500 characters")
    private String avatarUrl;
}
