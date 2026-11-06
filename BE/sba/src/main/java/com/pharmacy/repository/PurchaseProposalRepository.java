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

    @Query(value = """
        SELECT p FROM PurchaseProposal p
        LEFT JOIN FETCH p.supplierQuotation sq
        LEFT JOIN FETCH sq.supplier s
        LEFT JOIN FETCH p.createdBy cb
        LEFT JOIN FETCH p.approvedBy ab
        WHERE (:status IS NULL OR p.status = :status)
        AND (:keyword IS NULL OR :keyword = '' OR
             LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             EXISTS (SELECT 1 FROM PurchaseProposalRequest ppr JOIN ppr.purchaseRequest pr
                     WHERE ppr.purchaseProposal = p
                     AND LOWER(pr.code) LIKE LOWER(CONCAT('%', :keyword, '%'))))
        """, countQuery = """
        SELECT count(p) FROM PurchaseProposal p
        LEFT JOIN p.supplierQuotation sq
        LEFT JOIN sq.supplier s
        WHERE (:status IS NULL OR p.status = :status)
        AND (:keyword IS NULL OR :keyword = '' OR
             LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             EXISTS (SELECT 1 FROM PurchaseProposalRequest ppr JOIN ppr.purchaseRequest pr
                     WHERE ppr.purchaseProposal = p
                     AND LOWER(pr.code) LIKE LOWER(CONCAT('%', :keyword, '%'))))
        """)
    Page<PurchaseProposal> findWithFilters(
            @Param("keyword") String keyword,
            @Param("status") Short status,
            Pageable pageable);

    @Query("""
        SELECT p FROM PurchaseProposal p
        LEFT JOIN FETCH p.supplierQuotation sq
        LEFT JOIN FETCH sq.supplier s
        LEFT JOIN FETCH p.createdBy cb
        LEFT JOIN FETCH p.approvedBy ab
        WHERE p.id = :id
        """)
    Optional<PurchaseProposal> findByIdWithDetails(@Param("id") Long id);

    boolean existsByCode(String code);
}
