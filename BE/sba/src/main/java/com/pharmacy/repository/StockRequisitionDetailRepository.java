package com.pharmacy.repository;

import com.pharmacy.entity.StockRequisitionDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockRequisitionDetailRepository extends JpaRepository<StockRequisitionDetail, Long> {
    List<StockRequisitionDetail> findByStockRequisitionId(Long requisitionId);

    @Query("SELECT srd FROM StockRequisitionDetail srd JOIN FETCH srd.product p WHERE srd.stockRequisition.id = :requisitionId")
    List<StockRequisitionDetail> findByStockRequisitionIdWithProduct(@Param("requisitionId") Long requisitionId);
}
