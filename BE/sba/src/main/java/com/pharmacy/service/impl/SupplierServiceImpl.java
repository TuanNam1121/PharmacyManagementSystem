package com.pharmacy.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.dto.supplier.UpdateSupplierRequest;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.enums.SupplierStatus;
import com.pharmacy.repository.SupplierRepository;
import com.pharmacy.service.SupplierService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierServiceImpl implements SupplierService {
    private final SupplierRepository supplierRepository;

    @Transactional
    @Override
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Invalid request to create supplier");
        }
        Supplier supplier = request.toEntity();
        Supplier savedSupplier = supplierRepository.save(supplier);
        return SupplierResponse.fromEntityToCreate(savedSupplier);
    }

    @Override
    public Page<SupplierResponse> viewSupplierList(String keyword, SupplierStatus status, Pageable pageable) {
        boolean hasKeyword = StringUtils.hasText(keyword);
        boolean hasStatus = (status != null);
        int state = (hasKeyword ? 1 : 0) | (hasStatus ? 2 : 0);

        Page<Supplier> page;

        switch (state) {
            case 1:
                page = supplierRepository.findByNameContainingIgnoreCase(keyword.trim(), pageable);
                break;
            case 2:
                page = supplierRepository.findByStatus(status, pageable);
                break;
            case 3:
                page = supplierRepository.findByNameContainingIgnoreCaseAndStatus(keyword.trim(), status, pageable);
                break;
            default:
                page = supplierRepository.findAll(pageable);
        }

        return page.map(SupplierResponse::fromEntityToList);
    }

    @Override
    public SupplierResponse viewSupplierDetail(Long id) {
        if (id == null)
            throw new IllegalArgumentException("Invalid request to view supplier details");
        return supplierRepository.findById(id)
                .map(SupplierResponse::fromEntityToDetail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Supplier not found with id: " + id));
    }

    @Transactional
    @Override
    public SupplierResponse updateSupplierInformation(Long id, UpdateSupplierRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Invalid request to update supplier");
        }
        
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Supplier not found with id: " + id));
        
        System.out.println("DEBUG - Updating supplier id=" + id + " with request: name=" + request.name() + ", phone=" + request.phone());
        System.out.println("DEBUG - Before update: name=" + supplier.getName() + ", phone=" + supplier.getPhone());
        
        // Update supplier fields
        supplier.setName(request.name());
        supplier.setContactPerson(request.contactPerson());
        supplier.setPhone(request.phone());
        supplier.setEmail(request.email());
        supplier.setAddress(request.address());
        supplier.setTaxCode(request.taxCode());
        supplier.setNote(request.note());
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        System.out.println("DEBUG - After update: name=" + updatedSupplier.getName() + ", phone=" + updatedSupplier.getPhone());
        return SupplierResponse.fromEntityToUpdate(updatedSupplier);
    }

    @Transactional
    @Override
    public SupplierResponse deleteSupplier(Long id) {
        if (id == null)
            throw new IllegalArgumentException("Invalid request to delete supplier");
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        System.out.println("DEBUG - Deleting (soft delete) supplier id=" + id + ", current status=" + supplier.getStatus());
        supplier.setStatus(SupplierStatus.INACTIVE);
        System.out.println("DEBUG - After soft delete, status=" + supplier.getStatus());
        return SupplierResponse.fromEntityToDelete(supplier);
    }

}
