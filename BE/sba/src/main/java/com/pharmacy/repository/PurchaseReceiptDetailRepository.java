package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PurchaseReceiptDetailRepository extends JpaRepository<PurchaseReceiptDetail, Long> {

    @Query("SELECT prd FROM PurchaseReceiptDetail prd " +
           "JOIN FETCH prd.product p " +
           "LEFT JOIN FETCH prd.location l " +
           "WHERE prd.purchaseReceipt.id = :receiptId")
    List<PurchaseReceiptDetail> findByPurchaseReceiptIdWithDetails(@Param("receiptId") Long receiptId);
}
