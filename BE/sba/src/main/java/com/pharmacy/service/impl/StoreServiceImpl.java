package com.pharmacy.service.impl;

import com.pharmacy.dto.store.StoreResponse;
import com.pharmacy.entity.Account;
import com.pharmacy.entity.Store;
import com.pharmacy.repository.AccountRepository;
import com.pharmacy.repository.StoreRepository;
import com.pharmacy.security.CustomUserDetails;
import com.pharmacy.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StoreResponse> getAuthorizedRetailStores(CustomUserDetails currentUser) {
        // Only retail stores: type = 1 (STORE), status = 1 (ACTIVE)
        // Excludes HQ (type = 0) and Central Warehouse (type = 2)
        List<Store> allRetailStores = storeRepository.findByTypeAndStatus((short) 1, (short) 1);

        if (allRetailStores == null || allRetailStores.isEmpty()) {
            return Collections.emptyList();
        }

        // If unauthenticated or no user context (e.g. dev mode or public access), return all active retail stores
        if (currentUser == null || currentUser.getId() == null) {
            return allRetailStores.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        Account account = accountRepository.findById(currentUser.getId()).orElse(null);
        if (account == null) {
            return allRetailStores.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        String roleCode = "";
        if (account.getRole() != null && account.getRole().getCode() != null) {
            roleCode = account.getRole().getCode().toUpperCase().replace("ROLE_", "").trim();
        }

        // General Manager and Admin have chain-wide visibility across all active retail branches
        if ("GENERAL_MANAGER".equals(roleCode) || "ADMIN".equals(roleCode) || roleCode.isEmpty()) {
            return allRetailStores.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        // Store Manager and Pharmacist are restricted strictly to their assigned branch
        if ("STORE_MANAGER".equals(roleCode) || "PHARMACIST".equals(roleCode)) {
            if (account.getStore() != null && account.getStore().getId() != null) {
                Long assignedStoreId = account.getStore().getId();
                List<StoreResponse> matched = allRetailStores.stream()
                        .filter(s -> s.getId().equals(assignedStoreId))
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
                if (!matched.isEmpty()) {
                    return matched;
                }
            }
            // Fallback if account store_id is not yet set: return first active retail store
            return List.of(mapToResponse(allRetailStores.get(0)));
        }

        // Warehouse Staff / Warehouse Manager and Purchasing Staff default to available retail branches for transfer/reference
        return allRetailStores.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StoreResponse mapToResponse(Store s) {
        return StoreResponse.builder()
                .id(s.getId())
                .code(s.getCode())
                .name(s.getName())
                .type(s.getType())
                .typeName("Nhà thuốc chi nhánh")
                .address(s.getAddress())
                .phone(s.getPhone())
                .status(s.getStatus())
                .build();
    }
}

