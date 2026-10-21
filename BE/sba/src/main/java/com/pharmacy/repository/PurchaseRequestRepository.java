package com.pharmacy.repository;

import com.pharmacy.entity.PurchaseRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {

    Optional<PurchaseRequest> findByCode(String code);

    @Query(value = "SELECT pr FROM PurchaseRequest pr " +
            "LEFT JOIN FETCH pr.createdBy cb " +
            "WHERE (:search IS NULL OR :search = '' OR " +
            "       LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "       LOWER(pr.reason) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:status IS NULL OR pr.status = :status)",
            countQuery = "SELECT count(pr) FROM PurchaseRequest pr " +
                    "WHERE (:search IS NULL OR :search = '' OR " +
                    "       LOWER(pr.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "       LOWER(pr.reason) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND (:status IS NULL OR pr.status = :status)")
    Page<PurchaseRequest> findAllWithFilters(@Param("search") String search,
                                            @Param("status") Short status,
                                            Pageable pageable);
}
