package com.okcredit.controller;

import com.okcredit.security.SecurityUtil;
import com.okcredit.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@Tag(name = "Email", description = "Email report sharing API")
public class EmailController {

    private final EmailService emailService;
    private final SecurityUtil securityUtil;

    public EmailController(EmailService emailService, SecurityUtil securityUtil) {
        this.emailService = emailService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/send-report")
    @Operation(summary = "Send PDF report via email")
    public ResponseEntity<?> sendReport(@RequestBody Map<String, Object> request) {
        String to = (String) request.get("to");
        String subject = (String) request.getOrDefault("subject", "OweMe Report");
        String body = (String) request.getOrDefault("body", "Please find attached your OweMe report.");
        String pdfBase64 = (String) request.get("pdfBase64");
        String pdfName = (String) request.getOrDefault("pdfName", "report.pdf");

        if (to == null || to.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient email is required"));
        }

        byte[] pdfData = null;
        if (pdfBase64 != null) {
            pdfData = Base64.getDecoder().decode(pdfBase64);
        }

        try {
            emailService.sendReport(to, subject, body, pdfData, pdfName);
            return ResponseEntity.ok(Map.of("success", true, "message", "Report sent to " + to));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }
}