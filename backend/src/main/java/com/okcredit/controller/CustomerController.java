package com.okcredit.controller;

import com.okcredit.dto.CustomerDto;
import com.okcredit.security.SecurityUtil;
import com.okcredit.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Customer management APIs")
public class CustomerController {

    private final CustomerService customerService;
    private final SecurityUtil securityUtil;

    public CustomerController(CustomerService customerService, SecurityUtil securityUtil) {
        this.customerService = customerService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    @Operation(summary = "Get all customers with search and pagination")
    public ResponseEntity<Page<CustomerDto>> getCustomers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.getCustomers(securityUtil.getCurrentShopId(), search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomer(id, securityUtil.getCurrentShopId()));
    }

    @PostMapping
    @Operation(summary = "Create new customer")
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createCustomer(dto, securityUtil.getCurrentShopId(), securityUtil.getCurrentUser()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDto dto) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto, securityUtil.getCurrentShopId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id, securityUtil.getCurrentShopId());
        return ResponseEntity.noContent().build();
    }
}