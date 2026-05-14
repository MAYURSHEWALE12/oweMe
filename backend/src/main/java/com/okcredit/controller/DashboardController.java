package com.okcredit.controller;

import com.okcredit.dto.DashboardDto;
import com.okcredit.security.SecurityUtil;
import com.okcredit.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard and analytics APIs")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    public DashboardController(DashboardService dashboardService, SecurityUtil securityUtil) {
        this.dashboardService = dashboardService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats(securityUtil.getCurrentShopId()));
    }
}