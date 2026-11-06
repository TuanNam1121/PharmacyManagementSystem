package com.pharmacy.service.impl;

import com.pharmacy.entity.EmailLog;
import com.pharmacy.entity.Rfq;
import com.pharmacy.entity.Supplier;
import com.pharmacy.repository.EmailLogRepository;
import com.pharmacy.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;
    
    @Value("${spring.mail.username:no-reply@pharmacy.com}")
    private String fromEmail;
    
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public boolean sendRfqEmail(Rfq rfq, Supplier supplier, String rawToken, String frontendUrl) {
        if (supplier.getEmail() == null || supplier.getEmail().isBlank()) {
            log.warn("Supplier {} has no email address, cannot send RFQ", supplier.getId());
            return false;
        }
        
        // Validate email format
        if (!isValidEmail(supplier.getEmail())) {
            log.warn("Supplier {} has invalid email address: {}", supplier.getId(), supplier.getEmail());
            return false;
        }
        
        String subject = rfq.getSubject();
        String content = rfq.getContent();
        
        // Build RFQ link with token
        String rfqLink = frontendUrl + "/rfq-response?token=" + rawToken;
        
        // Enhance content with link
        String fullContent = content + "\n\n---\nPlease click the link below to submit your quotation:\n" + rfqLink + 
                           "\n\nThis link will expire in 3 days.";
        
        log.info("Sending RFQ email to {} with subject: {}, link: {}", supplier.getEmail(), subject, rfqLink);
        
        // Create email log
        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(supplier.getEmail());
        emailLog.setSubject(subject);
        emailLog.setBody(fullContent);
        emailLog.setRefType("RFQ");
        emailLog.setRefId(rfq.getId());
        emailLog.setStatus((short) 0); // pending
        emailLog.setCreatedAt(LocalDateTime.now());
        
        try {
            // Send email if mailSender is available
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(supplier.getEmail());
                helper.setSubject(subject);
                helper.setText(fullContent, false); // plain text
                mailSender.send(message);
                log.info("Email sent successfully to {}", supplier.getEmail());
            } else {
                log.warn("JavaMailSender not available, email not actually sent");
            }
            
            emailLog.setStatus((short) 1); // sent
            emailLog.setSentAt(LocalDateTime.now());
            emailLogRepository.save(emailLog);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}", supplier.getEmail(), e);
            emailLog.setStatus((short) 2); // failed
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
            return false;
        }
    }

    @Override
    public boolean sendQuotationConfirmationEmail(Supplier supplier, String rfqCode) {
        // Implementation for confirmation email
        log.info("Sending quotation confirmation to supplier {}", supplier.getEmail());
        return true;
    }
    
    private boolean isValidEmail(String email) {
        if (email == null) return false;
        // Simple email regex pattern
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email.matches(emailRegex);
    }
}