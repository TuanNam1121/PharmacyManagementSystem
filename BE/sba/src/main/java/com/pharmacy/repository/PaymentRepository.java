package com.pharmacy.repository;

import com.pharmacy.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findBySalesInvoice_Id(Long invoiceId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.salesInvoice.shift.id = :shiftId AND p.method = :method AND p.status = 1")
    BigDecimal sumAmountByShiftAndMethod(@Param("shiftId") Long shiftId, @Param("method") Short method);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.salesInvoice.shift.id = :shiftId AND p.status = 1")
    BigDecimal sumTotalPaidByShift(@Param("shiftId") Long shiftId);
}
