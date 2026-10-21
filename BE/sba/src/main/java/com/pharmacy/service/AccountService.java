package com.pharmacy.service;

import com.pharmacy.dto.*;
import com.pharmacy.dto.account.AccountCreateRequest;
import com.pharmacy.dto.account.AccountDetailResponse;
import com.pharmacy.dto.account.AccountResponse;
import com.pharmacy.dto.account.AccountUpdateRequest;

public interface AccountService {

    AccountResponse createAccount(AccountCreateRequest request);

    AccountResponse updateAccount(Long id, AccountUpdateRequest request);

    AccountDetailResponse getAccountDetail(Long id);

    PageResponse<AccountResponse> getAccounts(String keyword, Short status, Integer roleId, int page, int size, String sortBy, String sortDir);

    void updateAccountStatus(Long id, Short status);
}
