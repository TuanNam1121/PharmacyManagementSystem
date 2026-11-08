package com.pharmacy.service;

import com.pharmacy.dto.auth.*;

public interface AuthService {
    LoginResult login(LoginRequest request, String ipAddress);
    LoginResult refreshToken(String refreshToken, String ipAddress);
    void logout(String authHeader, String refreshToken, String clientIp);
    void changePassword(Long accountId, ChangePasswordRequest request, String clientIp);
    void processForgotPassword(ForgotPasswordRequest request, String clientIp);
    void resetPassword(ResetPasswordRequest request, String clientIp);
}
