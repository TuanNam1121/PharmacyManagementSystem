package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseProposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseProposalRepository extends JpaRepository<PurchaseProposal, Long> {

    Optional<PurchaseProposal> findByCode(String code);

    List<PurchaseProposal> findByStatusIn(List<Short> statuses);

    @Query(value = """
        SELECT pp FROM PurchaseProposal pp
        LEFT JOIN FETCH pp.createdBy cb
        LEFT JOIN FETCH pp.approvedBy ab
        WHERE (:search IS NULL OR :search = '' OR
              LOWER(pp.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
              EXISTS (SELECT 1 FROM PurchaseProposalRequest ppr JOIN ppr.purchaseRequest r
                      WHERE ppr.purchaseProposal = pp
                      AND LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%'))))
        AND (:status IS NULL OR pp.status = :status)
        """, countQuery = """
        SELECT count(pp) FROM PurchaseProposal pp
        WHERE (:search IS NULL OR :search = '' OR
              LOWER(pp.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
              EXISTS (SELECT 1 FROM PurchaseProposalRequest ppr JOIN ppr.purchaseRequest r
                      WHERE ppr.purchaseProposal = pp
                      AND LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%'))))
        AND (:status IS NULL OR pp.status = :status)
        """)
    Page<PurchaseProposal> findAllWithFilters(
            @Param("search") String search,
            @Param("status") Short status,
            Pageable pageable);

    @Query("""
        SELECT pp FROM PurchaseProposal pp
        LEFT JOIN FETCH pp.createdBy cb
        LEFT JOIN FETCH pp.approvedBy ab
        WHERE pp.id = :id
        """)
    Optional<PurchaseProposal> findByIdWithRelations(@Param("id") Long id);
}
