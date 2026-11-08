package com.pharmacy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập hoặc email không được để trống")
    @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 32, message = "Mật khẩu phải từ 6 đến 32 ký tự")
    private String password;
}

