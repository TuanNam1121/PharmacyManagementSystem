package com.pharmacy.service;

import com.pharmacy.dto.store.StoreResponse;
import com.pharmacy.security.CustomUserDetails;

import java.util.List;

public interface StoreService {
    List<StoreResponse> getAuthorizedRetailStores(CustomUserDetails currentUser);
}

