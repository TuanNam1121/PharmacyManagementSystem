package com.pharmacy.repository;

import com.pharmacy.entity.CustomerHealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerHealthProfileRepository extends JpaRepository<CustomerHealthProfile, Long> {
    Optional<CustomerHealthProfile> findByCustomer_Id(Long customerId);
}

