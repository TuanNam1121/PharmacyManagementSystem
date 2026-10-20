package com.pharmacy.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;


public interface SupplierService {
    SupplierResponse createSupplier(CreateSupplierRequest request);
    Page<SupplierResponse> viewSupplierList(Pageable pageable);
    SupplierResponse viewSupplierDetail(Long id);
    SupplierResponse deleteSupplier(Long id);
}
