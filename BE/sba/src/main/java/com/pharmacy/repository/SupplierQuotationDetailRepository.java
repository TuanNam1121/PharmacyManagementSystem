package com.pharmacy.repository;

import com.pharmacy.entity.SupplierQuotationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierQuotationDetailRepository extends JpaRepository<SupplierQuotationDetail, Long> {

    List<SupplierQuotationDetail> findBySupplierQuotationId(Long supplierQuotationId);
}