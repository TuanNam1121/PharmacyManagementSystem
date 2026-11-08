package com.pharmacy.repository;

import com.pharmacy.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.account a LEFT JOIN FETCH a.role LEFT JOIN FETCH a.accountInformation LEFT JOIN FETCH a.store WHERE r.token = :token")
    Optional<RefreshToken> findByTokenWithDetails(@Param("token") String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.account.id = :accountId AND r.revoked = false")
    void revokeAllByAccountId(@Param("accountId") Long accountId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.account.id = :accountId")
    void deleteAllByAccountId(@Param("accountId") Long accountId);
}

