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
        List<Customer> customers = customerRepository.findByPhone(phone);

        if (customers == null || customers.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "found", false,
                "message", "No customer found with this phone number"
            ));
        }

        Customer primaryCustomer = customers.get(0);
        CustomerDto combinedCustomer = CustomerDto.fromEntity(primaryCustomer);
        
        java.math.BigDecimal totalBalance = customers.stream()
            .map(c -> c.getRunningBalance() != null ? c.getRunningBalance() : java.math.BigDecimal.ZERO)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        combinedCustomer.setRunningBalance(totalBalance);

        List<TransactionDto> allTransactions = new java.util.ArrayList<>();
        for (Customer c : customers) {
            List<Transaction> txns = transactionRepository.findByCustomerIdOrderByCreatedAtDesc(c.getId());
            for (Transaction t : txns) {
                TransactionDto dto = TransactionDto.fromEntity(t);
                String shopName = c.getShop() != null ? c.getShop().getName() : "Unknown Shop";
                String origDesc = dto.getDescription() != null ? dto.getDescription() : "";
                dto.setDescription(origDesc + (origDesc.isEmpty() ? "" : " ") + "(via " + shopName + ")");
                allTransactions.add(dto);
            }
        }

        allTransactions.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));

        return ResponseEntity.ok(Map.of(
            "found", true,
            "customer", combinedCustomer,
            "transactions", allTransactions
        ));
    }
}