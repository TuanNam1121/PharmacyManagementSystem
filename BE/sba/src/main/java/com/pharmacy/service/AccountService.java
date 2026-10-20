package com.pharmacy.service;

import com.pharmacy.dto.*;

public interface AccountService {

    AccountResponse createAccount(AccountCreateRequest request);

    AccountResponse updateAccount(Long id, AccountUpdateRequest request);

    AccountDetailResponse getAccountDetail(Long id);

    PageResponse<AccountResponse> getAccounts(String keyword, Short status, Integer roleId, int page, int size, String sortBy, String sortDir);

    void updateAccountStatus(Long id, Short status);
}
