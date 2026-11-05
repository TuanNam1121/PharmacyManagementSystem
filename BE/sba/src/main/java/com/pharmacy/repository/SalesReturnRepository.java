package com.pharmacy.repository;

import com.pharmacy.entity.SalesReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesReturnRepository extends JpaRepository<SalesReturn, Long> {

    Optional<SalesReturn> findByCode(String code);

    List<SalesReturn> findBySalesInvoice_Id(Long invoiceId);

    List<SalesReturn> findByShift_Id(Long shiftId);

    @Query("SELECT COALESCE(SUM(r.refundAmount), 0) FROM SalesReturn r WHERE r.shift.id = :shiftId AND r.refundMethod = 1")
    BigDecimal sumCashRefundsByShift(@Param("shiftId") Long shiftId);
}
