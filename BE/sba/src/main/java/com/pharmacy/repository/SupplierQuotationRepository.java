package com.pharmacy.repository;

import com.pharmacy.entity.SupplierQuotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierQuotationRepository extends JpaRepository<SupplierQuotation, Long> {

    Optional<SupplierQuotation> findByRfqId(Long rfqId);

    @Query("SELECT DISTINCT sq FROM SupplierQuotation sq JOIN FETCH sq.details d JOIN FETCH d.product WHERE sq.rfq.id = :rfqId")
    Optional<SupplierQuotation> findByRfqIdWithDetails(@Param("rfqId") Long rfqId);

    List<SupplierQuotation> findBySupplierId(Long supplierId);

    @Query("SELECT sq FROM SupplierQuotation sq JOIN sq.rfq r WHERE r.purchaseRequest.id = :purchaseRequestId")
    List<SupplierQuotation> findByPurchaseRequestId(@Param("purchaseRequestId") Long purchaseRequestId);

    // Trong SupplierQuotationRepository
    @Query("SELECT sq FROM SupplierQuotation sq " +
            "LEFT JOIN FETCH sq.details d " +
            "LEFT JOIN FETCH d.product " +
            "WHERE sq.rfq.id IN :rfqIds")
    List<SupplierQuotation> findByRfqIdInWithDetails(@Param("rfqIds") List<Long> rfqIds);
}