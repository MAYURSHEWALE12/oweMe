package com.okcredit.controller;

import com.okcredit.entity.User;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final CustomerRepository customerRepository;
    private final SecurityUtil securityUtil;

    public AccountController(CustomerRepository customerRepository, SecurityUtil securityUtil) {
        this.customerRepository = customerRepository;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/link")
    @Operation(summary = "Link your account to any existing customer records by email/phone")
    @Transactional
    public ResponseEntity<?> linkAccount() {
        User user = securityUtil.getCurrentUser();
        int linked = 0;

        if (user.getEmail() != null) {
            var customers = customerRepository.findByEmail(user.getEmail());
            if (customers.isPresent() && customers.get().getUserId() == null) {
                customers.get().setUserId(user.getId());
                customerRepository.save(customers.get());
                linked++;
            }
        }
        if (user.getPhone() != null) {
            var customers = customerRepository.findByPhone(user.getPhone());
            if (customers.isPresent() && customers.get().getUserId() == null) {
                customers.get().setUserId(user.getId());
                customerRepository.save(customers.get());
                linked++;
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "linked", linked, "message", linked > 0 ? "Account linked to " + linked + " friend record(s)" : "No new links found"));
    }
}