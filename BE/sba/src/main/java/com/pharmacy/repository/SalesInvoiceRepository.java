package com.pharmacy.repository;

import com.pharmacy.entity.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long>, JpaSpecificationExecutor<SalesInvoice> {

    Optional<SalesInvoice> findByCode(String code);

    @Query("SELECT i FROM SalesInvoice i WHERE i.store.id = :storeId AND i.createdAt >= :startDate AND i.createdAt <= :endDate ORDER BY i.createdAt DESC")
    List<SalesInvoice> findInvoicesByDateRange(@Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM SalesInvoice i WHERE (:storeId IS NULL OR i.store.id = :storeId) AND i.createdAt >= :startDate AND i.createdAt <= :endDate")
    Page<SalesInvoice> findInvoicesByDateRangePaged(@Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    List<SalesInvoice> findTop5ByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    List<SalesInvoice> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    List<SalesInvoice> findByShift_IdOrderByCreatedAtDesc(Long shiftId);

    long countByShift_Id(Long shiftId);

    @Query("SELECT COUNT(i) FROM SalesInvoice i WHERE i.customer.id = :customerId")
    long countByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM SalesInvoice i WHERE i.customer.id = :customerId AND i.status = 1")
    BigDecimal sumFinalAmountByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT i.customer.id, COALESCE(SUM(i.finalAmount), 0) FROM SalesInvoice i WHERE i.customer.id IN :customerIds AND i.status = 1 GROUP BY i.customer.id")
    List<Object[]> sumFinalAmountByCustomerIds(@Param("customerIds") Collection<Long> customerIds);
}
