package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseProposalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseProposalRequestRepository extends JpaRepository<PurchaseProposalRequest, Long> {

    boolean existsByPurchaseRequestId(Long purchaseRequestId);

    List<PurchaseProposalRequest> findByPurchaseRequestId(Long purchaseRequestId);

    List<PurchaseProposalRequest> findByPurchaseProposalId(Long purchaseProposalId);
}