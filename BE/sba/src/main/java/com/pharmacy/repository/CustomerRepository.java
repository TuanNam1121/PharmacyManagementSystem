package com.pharmacy.repository;

import com.pharmacy.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    @Query("SELECT c FROM Customer c " +
           "LEFT JOIN FETCH c.healthProfile " +
           "LEFT JOIN FETCH c.createdBy " +
           "WHERE c.id = :id")
    Optional<Customer> findByIdWithDetails(@Param("id") Long id);

    @Query(value = "SELECT c FROM Customer c " +
                   "LEFT JOIN FETCH c.healthProfile " +
                   "WHERE (:keyword IS NULL OR :keyword = '' " +
                   "   OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                   "AND (:status IS NULL OR c.status = :status)",
           countQuery = "SELECT count(c) FROM Customer c " +
                        "WHERE (:keyword IS NULL OR :keyword = '' " +
                        "   OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                        "AND (:status IS NULL OR c.status = :status)")
    Page<Customer> findCustomersWithFilters(@Param("keyword") String keyword,
                                           @Param("status") Short status,
                                           Pageable pageable);
}

