package com.pharmacy.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.supplier.CreateSupplierRequest;
import com.pharmacy.dto.supplier.SupplierResponse;
import com.pharmacy.entity.Supplier;
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
            throw new IllegalArgumentException("Yêu cầu tạo nhà cung cấp không hợp lệ");
        }
        Supplier supplier = request.toEntity();
        Supplier savedSupplier = supplierRepository.save(supplier);
        return SupplierResponse.fromEntityToCreate(savedSupplier);
    }

    @Override
    public Page<SupplierResponse> viewSupplierList(Pageable pageable) {
        return supplierRepository.findAll(pageable).map(SupplierResponse::fromEntityToList);
    }

    @Override
    public SupplierResponse viewSupplierDetail(Long id) {
        if(id == null) throw new IllegalArgumentException("Yêu cầu xem chi tiết nhà cung cấp không hợp lệ");
        return supplierRepository.findById(id)
                .map(SupplierResponse::fromEntityToDetail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy nhà cung cấp với id: " + id));
    }

    @Transactional 
	@Override
	public SupplierResponse deleteSupplier(Long id) {
		if(id == null) throw new IllegalArgumentException("Yêu cầu xóa nhà cung cấp không hợp lệ");
		Supplier supplier = supplierRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp"));
        supplier.setStatus((short) 0);
        return SupplierResponse.fromEntityToDelete(supplier);
	}

}
