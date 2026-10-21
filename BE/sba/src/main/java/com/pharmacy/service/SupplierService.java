package com.pharmacy.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.dto.supplier.UpdateSupplierRequest;
import com.pharmacy.entity.enums.SupplierStatus;


public interface SupplierService {
    SupplierResponse createSupplier(CreateSupplierRequest request);

    Page<SupplierResponse> viewSupplierList(String keyword, SupplierStatus status ,Pageable pageable);
    SupplierResponse viewSupplierDetail(Long id);
    SupplierResponse updateSupplierInformation(Long id, UpdateSupplierRequest request);
    SupplierResponse deleteSupplier(Long id); 
}
