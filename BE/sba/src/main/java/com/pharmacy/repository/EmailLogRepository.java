package com.pharmacy.repository;

import com.pharmacy.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByToEmailOrderByCreatedAtDesc(String toEmail);
}
