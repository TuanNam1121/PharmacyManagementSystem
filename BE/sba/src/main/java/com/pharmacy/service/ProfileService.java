package com.pharmacy.service;

import com.pharmacy.dto.auth.ChangePasswordRequest;
import com.pharmacy.dto.auth.ProfileUpdateRequest;
import com.pharmacy.dto.auth.UserProfileResponse;

public interface ProfileService {
    UserProfileResponse getProfile(Long accountId);
    UserProfileResponse updateProfile(Long accountId, ProfileUpdateRequest request, String clientIp);
    void changePassword(Long accountId, ChangePasswordRequest request, String clientIp);
}

