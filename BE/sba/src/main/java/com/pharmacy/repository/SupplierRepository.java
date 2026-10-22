package com.pharmacy.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmacy.entity.Supplier;
import com.pharmacy.entity.enums.SupplierStatus;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Page<Supplier> findByNameContainingIgnoreCaseAndStatus(String name, SupplierStatus status, Pageable pageable);
    Page<Supplier> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Supplier> findByStatus(SupplierStatus status, Pageable pageable);
}
