package com.pharmacy.service;

import com.pharmacy.dto.PageResponse;
import com.pharmacy.dto.customer.CustomerCreateRequest;
import com.pharmacy.dto.customer.CustomerDetailResponse;
import com.pharmacy.dto.customer.CustomerResponse;
import com.pharmacy.dto.customer.CustomerUpdateRequest;

public interface CustomerService {
    PageResponse<CustomerResponse> getCustomers(String keyword, String membershipTier, Short status,
                                                int page, int size, String sortBy, String sortDir);

    CustomerDetailResponse getCustomerDetail(Long customerId);

    CustomerDetailResponse registerCustomer(CustomerCreateRequest request);

    CustomerDetailResponse updateCustomer(Long customerId, CustomerUpdateRequest request);

    void deleteCustomer(Long customerId, String reason);

    void reactivateCustomer(Long customerId);
}
