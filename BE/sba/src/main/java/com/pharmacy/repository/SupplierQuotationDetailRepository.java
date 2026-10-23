package com.pharmacy.repository;

import com.pharmacy.entity.SupplierQuotationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierQuotationDetailRepository extends JpaRepository<SupplierQuotationDetail, Long> {

    @Query("SELECT d FROM SupplierQuotationDetail d " +
            "JOIN FETCH d.product p " +
            "WHERE d.supplierQuotation.id = :quotationId")
    List<SupplierQuotationDetail> findBySupplierQuotationIdWithProduct(@Param("quotationId") Long quotationId);
}
