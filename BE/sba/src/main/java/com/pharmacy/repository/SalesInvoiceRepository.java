package com.pharmacy.repository;

import com.pharmacy.entity.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

    @Query("SELECT i FROM SalesInvoice i WHERE i.createdAt >= :startDate AND i.createdAt <= :endDate ORDER BY i.createdAt DESC")
    List<SalesInvoice> findInvoicesByDateRange(@Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM SalesInvoice i WHERE i.createdAt >= :startDate AND i.createdAt <= :endDate ORDER BY i.createdAt DESC")
    Page<SalesInvoice> findInvoicesByDateRangePaged(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate,
                                                    Pageable pageable);
}