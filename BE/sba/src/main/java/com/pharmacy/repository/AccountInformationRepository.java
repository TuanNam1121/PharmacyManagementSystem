package com.pharmacy.repository;

import com.pharmacy.entity.AccountInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountInformationRepository extends JpaRepository<AccountInformation, Long> {
    Optional<AccountInformation> findByAccountId(Long accountId);
}
