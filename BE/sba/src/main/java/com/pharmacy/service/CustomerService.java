package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerDetailResponse;
import com.pharmacy.dto.customer.CustomerResponse;

public interface CustomerService {
    PageResponse<CustomerResponse> getCustomers(String keyword, String membershipTier, Short status,
                                                int page, int size, String sortBy, String sortDir);

    CustomerDetailResponse getCustomerDetail(Long customerId);
}
