package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseProposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseProposalRepository extends JpaRepository<PurchaseProposal, Long> {

        @Query("SELECT p FROM PurchaseProposal p " +
                        "JOIN FETCH p.purchaseRequest pr " +
                        "JOIN FETCH p.supplierQuotation sq " +
                        "JOIN FETCH sq.supplier s " +
                        "JOIN FETCH p.createdBy cb " +
                        "LEFT JOIN FETCH p.approvedBy ab " +
                        "WHERE (:status IS NULL OR p.status = :status) " +
                        "AND (:keyword IS NULL OR :keyword = '' OR " +
                        "     LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "     LOWER(pr.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "     LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        Page<PurchaseProposal> findWithFilters(
                        @Param("keyword") String keyword,
                        @Param("status") Short status,
                        Pageable pageable);

        @Query("SELECT p FROM PurchaseProposal p " +
                        "JOIN FETCH p.purchaseRequest pr " +
                        "JOIN FETCH p.supplierQuotation sq " +
                        "JOIN FETCH sq.supplier s " +
                        "JOIN FETCH p.createdBy cb " +
                        "LEFT JOIN FETCH p.approvedBy ab " +
                        "WHERE p.id = :id")
        Optional<PurchaseProposal> findByIdWithDetails(@Param("id") Long id);

        boolean existsByCode(String code);
}
