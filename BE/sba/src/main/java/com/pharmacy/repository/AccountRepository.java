package com.pharmacy.repository;

import com.pharmacy.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    @Query("SELECT a FROM Account a " +
           "LEFT JOIN FETCH a.role " +
           "LEFT JOIN FETCH a.accountInformation " +
           "WHERE a.id = :id")
    Optional<Account> findByIdWithDetails(@Param("id") Long id);

    @Query(value = "SELECT a FROM Account a " +
                   "LEFT JOIN FETCH a.role r " +
                   "LEFT JOIN FETCH a.accountInformation ai " +
                   "WHERE (:keyword IS NULL OR :keyword = '' " +
                   "   OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(a.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(ai.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                   "AND (:status IS NULL OR a.status = :status) " +
                   "AND (:roleId IS NULL OR r.id = :roleId)",
           countQuery = "SELECT count(a) FROM Account a " +
                        "LEFT JOIN a.role r " +
                        "LEFT JOIN a.accountInformation ai " +
                        "WHERE (:keyword IS NULL OR :keyword = '' " +
                        "   OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(a.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(ai.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                        "AND (:status IS NULL OR a.status = :status) " +
                        "AND (:roleId IS NULL OR r.id = :roleId)")
    Page<Account> findAccountsWithFilters(@Param("keyword") String keyword,
                                         @Param("status") Short status,
                                         @Param("roleId") Integer roleId,
                                         Pageable pageable);
}
