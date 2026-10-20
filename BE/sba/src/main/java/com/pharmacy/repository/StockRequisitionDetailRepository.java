package com.pharmacy.repository;

import com.pharmacy.entity.StockRequisitionDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRequisitionDetailRepository extends JpaRepository<StockRequisitionDetail, Long> {
    List<StockRequisitionDetail> findByStockRequisitionId(Long requisitionId);
}
