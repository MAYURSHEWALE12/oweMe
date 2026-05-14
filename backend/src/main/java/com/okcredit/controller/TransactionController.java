package com.okcredit.controller;

import com.okcredit.dto.TransactionDto;
import com.okcredit.security.SecurityUtil;
import com.okcredit.service.TransactionService;
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
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Transaction management APIs")
public class TransactionController {

    private final TransactionService transactionService;
    private final SecurityUtil securityUtil;

    public TransactionController(TransactionService transactionService, SecurityUtil securityUtil) {
        this.transactionService = transactionService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get transactions for a customer")
    public ResponseEntity<Page<TransactionDto>> getCustomerTransactions(
            @PathVariable Long customerId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
                transactionService.getCustomerTransactions(customerId, securityUtil.getCurrentUser(), pageable));
    }

    @PostMapping("/credit")
    @Operation(summary = "Give credit to a customer")
    public ResponseEntity<TransactionDto> giveCredit(@Valid @RequestBody TransactionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.giveCredit(dto, securityUtil.getCurrentUser()));
    }

    @PostMapping("/payment")
    @Operation(summary = "Receive payment from a customer")
    public ResponseEntity<TransactionDto> receivePayment(@Valid @RequestBody TransactionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.receivePayment(dto, securityUtil.getCurrentUser()));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent transactions for the shop")
    public ResponseEntity<Page<TransactionDto>> getRecentTransactions(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                transactionService.getRecentTransactions(securityUtil.getCurrentShopId(), pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a transaction (amount, description, note)")
    public ResponseEntity<TransactionDto> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto dto) {
        return ResponseEntity.ok(
                transactionService.updateTransaction(id, dto, securityUtil.getCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction and reverse balance effect")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id, securityUtil.getCurrentUser());
        return ResponseEntity.noContent().build();
    }
}