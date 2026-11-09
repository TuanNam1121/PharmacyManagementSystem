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
import java.time.format.DateTimeFormatter;

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

    private static final DateTimeFormatter DEADLINE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public boolean sendRfqEmail(Rfq rfq, Supplier supplier, String rawToken, String frontendUrl) {
        // Validate the recipient up-front (presence and basic format).
        String invalidReason = validateRecipient(supplier.getEmail());
        if (invalidReason != null) {
            log.warn("Supplier {} cannot receive RFQ email: {}", supplier.getId(), invalidReason);
            return false;
        }

        String subject = rfq.getSubject();
        String content = rfq.getContent();
        
        // Build RFQ link with token
        String rfqLink = frontendUrl + "/rfq-response?token=" + rawToken;
        
        // Plain-text fallback (used for clients that don't render HTML and for the email log)
        String plainContent = content + "\n\n---\n"
                + "Xem & phản hồi báo giá tại đường dẫn sau:\n" + rfqLink
                + "\n\nLiên kết có hiệu lực trong 3 ngày.";
        
        log.info("Sending RFQ email to {} with subject: {}, link: {}", supplier.getEmail(), subject, rfqLink);
        
        // Create email log
        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(supplier.getEmail());
        emailLog.setSubject(subject);
        emailLog.setBody(plainContent);
        emailLog.setRefType("RFQ");
        emailLog.setRefId(rfq.getId());
        emailLog.setStatus((short) 0); // pending
        emailLog.setCreatedAt(LocalDateTime.now());
        
        try {
            // Attempt delivery; fail gracefully when SMTP is not configured
            if (mailSender == null) {
                log.warn("JavaMailSender is not configured, RFQ email was not sent");
                emailLog.setStatus((short) 2); // failed
                emailLog.setErrorMessage("JavaMailSender is not configured");
                emailLogRepository.save(emailLog);
                return false;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(supplier.getEmail());
            helper.setSubject(subject);
            // Set both an HTML body and a plain-text fallback
            helper.setText(plainContent, buildRfqHtmlEmail(rfq, content, rfqLink));
            mailSender.send(message);
            log.info("Email sent successfully to {}", supplier.getEmail());
            
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

    @Override
    public boolean sendPasswordResetEmail(String toEmail, String username, String resetToken) {
        if (toEmail == null || toEmail.isBlank() || !isValidEmail(toEmail)) {
            log.warn("Invalid email recipient for password reset: {}", toEmail);
            return false;
        }

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "Khôi phục mật khẩu - PharmaChain Management System";

        String plainText = String.format(
                "Xin chào %s,\n\n"
                        + "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản hệ thống PharmaChain.\n"
                        + "Vui lòng truy cập liên kết bên dưới để tạo mật khẩu mới (Liên kết có hiệu lực trong 15 phút):\n"
                        + "%s\n\n"
                        + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\n"
                        + "---\nPharmaChain Management System",
                username, resetLink);

        String htmlContent = buildPasswordResetHtmlEmail(username, resetLink);

        log.info("Sending password reset email to {}. Reset link: {}", toEmail, resetLink);

        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(toEmail);
        emailLog.setSubject(subject);
        emailLog.setBody(plainText);
        emailLog.setRefType("PASSWORD_RESET");
        emailLog.setStatus((short) 0); // Pending
        emailLog.setCreatedAt(LocalDateTime.now());

        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(plainText, htmlContent);
                mailSender.send(message);
                log.info("Password reset email successfully sent to {}", toEmail);
            } else {
                log.warn("JavaMailSender is null, email not actually sent via SMTP");
            }

            emailLog.setStatus((short) 1); // Sent
            emailLog.setSentAt(LocalDateTime.now());
            emailLogRepository.save(emailLog);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            emailLog.setStatus((short) 2); // Failed
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
            return false;
        }
    }

    private String buildPasswordResetHtmlEmail(String username, String resetLink) {
        final String brand = "#10b981";
        final String brandDark = "#059669";
        final String textPrimary = "#0f172a";
        final String textSecondary = "#64748b";
        final String textMuted = "#94a3b8";
        final String borderColor = "#e2e8f0";
        final String canvas = "#f8fafc";
        final String card = "#ffffff";

        String safeUsername = escapeHtml(username);
        String safeLink = escapeHtml(resetLink);

        StringBuilder sb = new StringBuilder(2048);
        sb.append("<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\">")
          .append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">")
          .append("<title>Khôi phục mật khẩu</title></head>")
          .append("<body style=\"margin:0;padding:0;background-color:").append(canvas)
          .append(";font-family:Arial,Helvetica,sans-serif;color:").append(textPrimary).append(";\">")
          .append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"")
          .append(" style=\"background-color:").append(canvas).append(";\"><tr><td align=\"center\" style=\"padding:24px 12px;\">")
          .append("<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"")
          .append(" style=\"width:600px;max-width:600px;background-color:").append(card)
          .append(";border:1px solid ").append(borderColor).append(";border-radius:12px;overflow:hidden;\">");

        // Branded header
        sb.append("<tr><td style=\"padding:24px 28px;color:#ffffff;background-color:").append(brand)
          .append(";background-image:linear-gradient(135deg,").append(brand).append(",").append(brandDark).append(");\">")
          .append("<div style=\"font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;opacity:0.92;\">PharmaChain Management System</div>")
          .append("<div style=\"font-size:20px;font-weight:bold;margin-top:6px;\">Yêu Cầu Đặt Lại Mật Khẩu</div>")
          .append("</td></tr>");

        // Greeting & instructions
        sb.append("<tr><td style=\"padding:28px 28px 12px;font-size:14px;line-height:1.7;color:").append(textPrimary).append(";\">")
          .append("<p style=\"margin:0 0 16px;\">Xin chào <strong>").append(safeUsername).append("</strong>,</p>")
          .append("<p style=\"margin:0 0 16px;\">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống Quản Lý Chuỗi Nhà Thuốc PharmaChain.</p>")
          .append("<p style=\"margin:0 0 20px;\">Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới. <em>Liên kết này có hiệu lực trong vòng <strong>15 phút</strong></em>.</p>")
          .append("</td></tr>");

        // CTA Button
        sb.append("<tr><td align=\"center\" style=\"padding:12px 28px 20px;\">")
          .append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>")
          .append("<td align=\"center\" bgcolor=\"").append(brand).append("\" style=\"background-color:").append(brand).append(";border-radius:8px;\">")
          .append("<a href=\"").append(safeLink).append("\" target=\"_blank\"")
          .append(" style=\"display:inline-block;padding:14px 32px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;\">")
          .append("Đặt Lại Mật Khẩu</a></td></tr></table></td></tr>");

        // Security notice
        sb.append("<tr><td style=\"padding:0 28px 16px;font-size:13px;line-height:1.6;color:").append(textSecondary).append(";\">")
          .append("<p style=\"margin:0;\">Nếu bạn không gửi yêu cầu này, bạn có thể an tâm bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.</p>")
          .append("</td></tr>");

        // Fallback link
        sb.append("<tr><td style=\"padding:12px 28px 24px;border-top:1px solid ").append(borderColor).append(";font-size:12px;color:").append(textMuted).append(";line-height:1.6;\">")
          .append("Nếu nút trên không hoạt động, hãy sao chép liên kết sau vào trình duyệt:<br>")
          .append("<a href=\"").append(safeLink).append("\" target=\"_blank\" style=\"color:").append(brandDark).append(";word-break:break-all;\">")
          .append(safeLink).append("</a></td></tr>");

        // Footer
        sb.append("<tr><td style=\"padding:16px 28px;background-color:").append(canvas)
          .append(";border-top:1px solid ").append(borderColor).append(";font-size:11px;color:").append(textMuted).append(";line-height:1.6;\">")
          .append("Đây là email tự động từ Hệ thống PharmaChain. Vui lòng không trả lời thư này.<br>")
          .append("&copy; 2026 PharmaChain Inc. Mọi quyền được bảo lưu.")
          .append("</td></tr>");

        sb.append("</table></td></tr></table></body></html>");
        return sb.toString();
    }
    
    /**
     * Build a branded HTML invitation email for the RFQ.
     * Uses a table-based layout with inline styles for maximum email-client compatibility.
     */
    private String buildRfqHtmlEmail(Rfq rfq, String content, String rfqLink) {
        final String brand = "#10b981";
        final String brandDark = "#059669";
        final String textPrimary = "#0f172a";
        final String textSecondary = "#64748b";
        final String textMuted = "#94a3b8";
        final String borderColor = "#e2e8f0";
        final String canvas = "#f8fafc";
        final String card = "#ffffff";

        String rfqCode = escapeHtml(rfq.getCode());
        String proposalCode = rfq.getPurchaseProposal() != null
                ? escapeHtml(rfq.getPurchaseProposal().getCode())
                : "—";
        String deadline = rfq.getExpiredAt() != null
                ? escapeHtml(rfq.getExpiredAt().format(DEADLINE_FORMATTER))
                : "—";
        String safeLink = escapeHtml(rfqLink);
        String letterHtml = toParagraphs(content);

        StringBuilder sb = new StringBuilder(2048);
        sb.append("<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\">")
          .append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">")
          .append("<title>").append(escapeHtml(rfq.getSubject())).append("</title></head>")
          .append("<body style=\"margin:0;padding:0;background-color:").append(canvas)
          .append(";font-family:Arial,Helvetica,sans-serif;color:").append(textPrimary).append(";\">")
          .append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"")
          .append(" style=\"background-color:").append(canvas).append(";\"><tr><td align=\"center\" style=\"padding:24px 12px;\">")
          .append("<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"")
          .append(" style=\"width:600px;max-width:600px;background-color:").append(card)
          .append(";border:1px solid ").append(borderColor).append(";border-radius:12px;overflow:hidden;\">");

        // Branded header
        sb.append("<tr><td style=\"padding:22px 28px;color:#ffffff;background-color:").append(brand)
          .append(";background-image:linear-gradient(135deg,").append(brand).append(",").append(brandDark).append(");\">")
          .append("<div style=\"font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;opacity:0.92;\">PharmaChain</div>")
          .append("<div style=\"font-size:19px;font-weight:bold;margin-top:4px;\">Yêu cầu báo giá (RFQ)</div>")
          .append("</td></tr>");

        // Meta strip
        sb.append("<tr><td style=\"padding:14px 28px;background-color:").append(canvas)
          .append(";border-bottom:1px solid ").append(borderColor).append(";font-size:12px;color:").append(textSecondary).append(";\">")
          .append("<span style=\"color:").append(textMuted).append(";\">Mã RFQ: </span><strong>").append(rfqCode).append("</strong>")
          .append(" &nbsp;•&nbsp; <span style=\"color:").append(textMuted).append(";\">Đề xuất mua hàng: </span><strong>").append(proposalCode).append("</strong>")
          .append(" &nbsp;•&nbsp; <span style=\"color:").append(textMuted).append(";\">Hạn chót: </span><strong>").append(deadline).append("</strong>")
          .append("</td></tr>");

        // Letter body
        sb.append("<tr><td style=\"padding:28px 28px 8px;font-size:14px;line-height:1.7;\">")
          .append(letterHtml)
          .append("</td></tr>");

        // Call-to-action button
        sb.append("<tr><td align=\"center\" style=\"padding:16px 28px 6px;\">")
          .append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>")
          .append("<td align=\"center\" bgcolor=\"").append(brand).append("\" style=\"background-color:").append(brand).append(";border-radius:8px;\">")
          .append("<a href=\"").append(safeLink).append("\" target=\"_blank\"")
          .append(" style=\"display:inline-block;padding:13px 30px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;\">")
          .append("Xem &amp; Phản Hồi Báo Giá</a></td></tr></table></td></tr>");

        // Expiry note
        sb.append("<tr><td align=\"center\" style=\"padding:6px 28px 4px;font-size:12px;color:").append(textSecondary).append(";\">")
          .append("Liên kết có hiệu lực trong 3 ngày (đến ").append(deadline).append(").")
          .append("</td></tr>");

        // Fallback raw link
        sb.append("<tr><td style=\"padding:10px 28px 24px;font-size:12px;color:").append(textMuted).append(";line-height:1.6;\">")
          .append("Nếu nút không hoạt động, vui lòng sao chép liên kết sau vào trình duyệt:<br>")
          .append("<a href=\"").append(safeLink).append("\" target=\"_blank\" style=\"color:").append(brandDark).append(";word-break:break-all;\">")
          .append(safeLink).append("</a></td></tr>");

        // Footer
        sb.append("<tr><td style=\"padding:18px 28px;background-color:").append(canvas)
          .append(";border-top:1px solid ").append(borderColor).append(";font-size:11px;color:").append(textMuted).append(";line-height:1.6;\">")
          .append("Email được gửi tự động từ Hệ thống Dược Phẩm PMS. Vui lòng không trả lời trực tiếp email này.<br>")
          .append("&copy; 2026 PharmaChain. Mọi quyền được bảo lưu.")
          .append("</td></tr>");

        sb.append("</table></td></tr></table></body></html>");
        return sb.toString();
    }

    /** Escape a value for safe inclusion in HTML. */
    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /** Convert a plain-text body into HTML paragraphs, preserving single line breaks. */
    private String toParagraphs(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String normalized = text.replace("\r\n", "\n").replace("\r", "\n");
        StringBuilder sb = new StringBuilder();
        for (String block : normalized.split("\n\\s*\n")) {
            String trimmed = block.strip();
            if (trimmed.isEmpty()) {
                continue;
            }
            sb.append("<p style=\"margin:0 0 14px;\">")
              .append(escapeHtml(trimmed).replace("\n", "<br>"))
              .append("</p>");
        }
        return sb.toString();
    }

    @Override
    public String validateRecipient(String email) {
        if (email == null || email.isBlank()) {
            return "Nhà cung cấp chưa có địa chỉ email.";
        }
        String normalized = email.trim();
        if (!isValidEmail(normalized)) {
            return "Địa chỉ email không đúng định dạng: " + normalized;
        }
        return null;
    }

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        // Simple email regex pattern
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email.matches(emailRegex);
    }
}