package com.pharmacy.repository;

import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.enums.RfqStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, Long> {

    Optional<Rfq> findByTokenHash(String tokenHash);
    
    boolean existsBySupplierIdAndPurchaseProposalId(Long supplierId, Long purchaseProposalId);

    List<Rfq> findBySupplierIdAndPurchaseProposalId(Long supplierId, Long purchaseProposalId);

    /** All RFQs raised for a single purchase proposal (candidate set for the selection cascade). */
    List<Rfq> findByPurchaseProposalId(Long purchaseProposalId);
    
    @Query("SELECT r FROM Rfq r WHERE r.tokenHash = :tokenHash AND r.expiredAt > :now AND r.status = com.pharmacy.entity.enums.RfqStatus.SENT")
    Optional<Rfq> findValidRfqByTokenHash(@Param("tokenHash") String tokenHash, @Param("now") LocalDateTime now);
    
    List<Rfq> findByPurchaseRequestIdAndStatus(Long purchaseRequestId, RfqStatus status);
    
    List<Rfq> findBySupplierId(Long supplierId);
    
    Page<Rfq> findBySupplierId(Long supplierId, Pageable pageable);
    
    @Query("""
        SELECT DISTINCT r FROM Rfq r 
        LEFT JOIN r.supplier s 
        LEFT JOIN r.purchaseProposal pp 
        WHERE (:search IS NULL OR LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%')) 
            OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) 
            OR LOWER(pp.code) LIKE LOWER(CONCAT('%', :search, '%'))) 
        AND (:status IS NULL OR r.status = :status) 
        AND (:supplierId IS NULL OR s.id = :supplierId) 
        AND (:purchaseProposalId IS NULL OR pp.id = :purchaseProposalId)
        """)
    Page<Rfq> findAllWithFilters(
            @Param("search") String search,
            @Param("status") RfqStatus status,
            @Param("supplierId") Long supplierId,
            @Param("purchaseProposalId") Long purchaseProposalId,
            Pageable pageable
    );
    
    @Query("SELECT DISTINCT r FROM Rfq r " +
           "JOIN FETCH r.purchaseProposal pp " +
           "JOIN FETCH r.supplier s " +
           "WHERE r.id IN :ids")
    List<Rfq> findAllByIdWithRelations(@Param("ids") List<Long> ids);
}