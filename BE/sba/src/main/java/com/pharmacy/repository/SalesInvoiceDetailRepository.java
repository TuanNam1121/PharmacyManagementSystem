package com.pharmacy.repository;

import com.pharmacy.entity.SalesInvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesInvoiceDetailRepository extends JpaRepository<SalesInvoiceDetail, Long> {

    @Query("SELECT d FROM SalesInvoiceDetail d " +
            "JOIN FETCH d.salesInvoice i " +
            "JOIN FETCH d.product p " +
            "JOIN FETCH i.store s " +
            "WHERE i.status = :status " +
            "AND i.createdAt >= :startDate " +
            "AND i.createdAt <= :endDate " +
            "AND (:storeId IS NULL OR i.store.id = :storeId)")
    List<SalesInvoiceDetail> findDetailsForProfitReport(
            @Param("status") Short status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("storeId") Long storeId);
}
