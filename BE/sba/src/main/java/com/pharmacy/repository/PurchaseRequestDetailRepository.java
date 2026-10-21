package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseRequestDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequestDetailRepository extends JpaRepository<PurchaseRequestDetail, Long> {

    @Query("SELECT prd FROM PurchaseRequestDetail prd " +
            "JOIN FETCH prd.product p " +
            "WHERE prd.purchaseRequest.id = :requestId")
    List<PurchaseRequestDetail> findByPurchaseRequestIdWithProduct(@Param("requestId") Long requestId);
}
