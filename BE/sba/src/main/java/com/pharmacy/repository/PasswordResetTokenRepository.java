package com.pharmacy.repository;

import com.pharmacy.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    @Query("SELECT t FROM PasswordResetToken t JOIN FETCH t.account a LEFT JOIN FETCH a.role WHERE t.tokenHash = :token")
    Optional<PasswordResetToken> findByTokenHash(@Param("token") String token);

    Optional<PasswordResetToken> findTopByAccount_IdOrderByCreatedAtDesc(Long accountId);
}

