package com.okcredit.controller;

import com.okcredit.security.SecurityUtil;
import com.okcredit.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Report generation APIs")
public class ReportController {

    private final ReportService reportService;
    private final SecurityUtil securityUtil;

    public ReportController(ReportService reportService, SecurityUtil securityUtil) {
        this.reportService = reportService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/monthly")
    @Operation(summary = "Generate monthly report as Excel")
    public ResponseEntity<byte[]> generateMonthlyReport(
            @RequestParam int month,
            @RequestParam int year) {
        byte[] data = reportService.generateMonthlyReportExcel(securityUtil.getCurrentShopId(), month, year);

        String filename = String.format("monthly_report_%02d_%d.xlsx", month, year);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/customer-statement/{customerId}")
    @Operation(summary = "Generate customer statement as Excel")
    public ResponseEntity<byte[]> generateCustomerStatement(@PathVariable Long customerId) {
        byte[] data = reportService.generateCustomerStatement(customerId, securityUtil.getCurrentShopId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=customer_statement.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }
}