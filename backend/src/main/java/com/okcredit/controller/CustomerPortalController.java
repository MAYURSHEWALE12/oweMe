package com.okcredit.controller;

import com.okcredit.dto.CustomerDto;
import com.okcredit.dto.TransactionDto;
import com.okcredit.entity.Customer;
import com.okcredit.entity.Shop;
import com.okcredit.entity.Transaction;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Customer Portal", description = "Public APIs for customers to view their statement")
public class CustomerPortalController {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public CustomerPortalController(CustomerRepository customerRepository,
                                     TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/customer-statement")
    @Operation(summary = "Get customer statement by phone number (no auth required)")
    public ResponseEntity<?> getCustomerStatement(@RequestParam String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElse(null);

        if (customer == null) {
            return ResponseEntity.ok(Map.of(
                "found", false,
                "message", "No customer found with this phone number"
            ));
        }

        List<Transaction> transactions = transactionRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());

        return ResponseEntity.ok(Map.of(
            "found", true,
            "customer", CustomerDto.fromEntity(customer),
            "transactions", transactions.stream()
                .map(TransactionDto::fromEntity)
                .collect(Collectors.toList())
        ));
    }
}