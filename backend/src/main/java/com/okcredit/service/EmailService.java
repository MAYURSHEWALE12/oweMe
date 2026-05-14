package com.okcredit.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.properties.mail.from}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Async
    public void sendReport(String to, String subject, String body, byte[] pdfData, String pdfName) {
        log.info("Sending email report to: {}", to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildHtml(body, pdfName), true);
            if (pdfData != null && pdfName != null) {
                helper.addAttachment(pdfName, new ByteArrayResource(pdfData));
            }
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send email to {}. Error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String buildHtml(String body, String pdfName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"></head>"
            + "<body style=\"margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;\">"
            + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f6f9;padding:30px 0;\"><tr><td align=\"center\">"
            + "<table width=\"540\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);\">"
            + "<tr><td style=\"background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px 40px;text-align:center;\">"
            + "<table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 auto;\">"
            + "<tr><td style=\"background:rgba(255,255,255,0.2);border-radius:10px;padding:6px 12px;font-size:13px;font-weight:bold;color:#ffffff;\">OM</td>"
            + "<td width=\"10\"></td><td style=\"font-size:20px;font-weight:bold;color:#ffffff;\">OweMe</td></tr></table>"
            + "<p style=\"color:rgba(255,255,255,0.85);font-size:14px;margin-top:12px;\">Your Financial Report</p></td></tr>"
            + "<tr><td style=\"padding:32px 40px;\">"
            + "<p style=\"font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px 0;\">" + body + "</p>"
            + "<table cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;\">"
            + "<tr><td style=\"font-size:12px;color:#9ca3af;line-height:1.5;\">"
            + "This report was generated automatically by OweMe. Amounts are in Indian Rupees (INR).<br>"
            + "If you have any questions, please contact the sender directly.</td></tr></table></td></tr>"
            + "<tr><td style=\"background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;\">"
            + "<p style=\"font-size:12px;color:#9ca3af;margin:0;\">Sent from <strong style=\"color:#6b7280;\">OweMe</strong> &mdash; Track loans with friends</p></td></tr>"
            + "</table><p style=\"font-size:11px;color:#9ca3af;margin-top:16px;\">&copy; 2026 OweMe. All rights reserved.</p>"
            + "</td></tr></table></body></html>";
    }
}