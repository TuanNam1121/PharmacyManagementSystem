package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseReceiptRepository extends JpaRepository<PurchaseReceipt, Long> {

    @Query(value = "SELECT pr FROM PurchaseReceipt pr " +
                   "LEFT JOIN FETCH pr.supplier s " +
                   "LEFT JOIN FETCH pr.purchaseProposal pp " +
                   "LEFT JOIN FETCH pr.createdBy cb " +
                   "LEFT JOIN FETCH pr.confirmedBy cf " +
                   "WHERE (:search IS NULL OR LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "      OR LOWER(pp.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "      OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "      OR LOWER(pr.note) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT count(pr) FROM PurchaseReceipt pr " +
                        "LEFT JOIN pr.supplier s " +
                        "LEFT JOIN pr.purchaseProposal pp " +
                        "WHERE (:search IS NULL OR LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "      OR LOWER(pp.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "      OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "      OR LOWER(pr.note) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PurchaseReceipt> searchReceipts(@Param("search") String search, Pageable pageable);
}
