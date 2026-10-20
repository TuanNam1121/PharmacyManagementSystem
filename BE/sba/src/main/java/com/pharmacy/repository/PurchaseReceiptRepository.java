package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseReceiptRepository extends JpaRepository<PurchaseReceipt, Long> {

    @Query("SELECT pr FROM PurchaseReceipt pr " +
           "WHERE (:search IS NULL OR LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "      OR LOWER(pr.note) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PurchaseReceipt> searchReceipts(@Param("search") String search, Pageable pageable);
}
