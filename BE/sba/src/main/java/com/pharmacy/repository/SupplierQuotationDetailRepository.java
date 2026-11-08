package com.pharmacy.repository;

import com.pharmacy.entity.SupplierQuotationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SupplierQuotationDetailRepository extends JpaRepository<SupplierQuotationDetail, Long> {

    @Query("SELECT d FROM SupplierQuotationDetail d " +
            "JOIN FETCH d.product p " +
            "WHERE d.supplierQuotation.id = :quotationId")
    List<SupplierQuotationDetail> findBySupplierQuotationIdWithProduct(@Param("quotationId") Long quotationId);

    List<SupplierQuotationDetail> findBySupplierQuotationId(Long supplierQuotationId);

    /**
     * Tổng tiền theo báo giá cho nhiều báo giá trong 1 truy vấn (tránh N+1 khi lấy danh sách PO).
     */
    @Query("SELECT d.supplierQuotation.id, SUM(d.subtotal) FROM SupplierQuotationDetail d " +
            "WHERE d.supplierQuotation.id IN :ids GROUP BY d.supplierQuotation.id")
    List<Object[]> sumSubtotalByQuotationIds(@Param("ids") Collection<Long> ids);
}
