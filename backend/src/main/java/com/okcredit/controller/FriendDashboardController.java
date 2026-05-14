package com.okcredit.controller;

import com.okcredit.entity.Customer;
import com.okcredit.entity.Transaction;
import com.okcredit.entity.User;
import com.okcredit.repository.CustomerRepository;
import com.okcredit.repository.TransactionRepository;
import com.okcredit.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friend")
@Tag(name = "Friend Dashboard", description = "APIs for friends to see their transactions")
public class FriendDashboardController {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityUtil securityUtil;

    public FriendDashboardController(CustomerRepository customerRepository,
                                      TransactionRepository transactionRepository,
                                      SecurityUtil securityUtil) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get friend's dashboard showing who they owe and who owes them")
    public ResponseEntity<?> getFriendDashboard() {
        User currentUser = securityUtil.getCurrentUser();
        List<Customer> linkedCustomers = customerRepository.findByUserId(currentUser.getId());

        if (linkedCustomers.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "friends", Collections.emptyList(),
                "totalIowe", BigDecimal.ZERO,
                "totalOwedToMe", BigDecimal.ZERO
            ));
        }

        List<Map<String, Object>> friendsList = new ArrayList<>();
        BigDecimal totalIowe = BigDecimal.ZERO;
        BigDecimal totalOwedToMe = BigDecimal.ZERO;

        for (Customer c : linkedCustomers) {
            if (!c.getActive()) continue;

            List<Transaction> txns = transactionRepository
                    .findByCustomerIdOrderByCreatedAtDesc(c.getId());

            BigDecimal iowe = c.getRunningBalance().compareTo(BigDecimal.ZERO) > 0
                    ? c.getRunningBalance() : BigDecimal.ZERO;
            BigDecimal owedToMe = c.getRunningBalance().compareTo(BigDecimal.ZERO) < 0
                    ? c.getRunningBalance().abs() : BigDecimal.ZERO;

            totalIowe = totalIowe.add(iowe);
            totalOwedToMe = totalOwedToMe.add(owedToMe);

            Map<String, Object> friendInfo = new LinkedHashMap<>();
            friendInfo.put("id", c.getId());
            friendInfo.put("name", c.getName());
            friendInfo.put("phone", c.getPhone());
            friendInfo.put("addedBy", c.getShop().getName());
            friendInfo.put("iowe", iowe);
            friendInfo.put("owedToMe", owedToMe);
            friendInfo.put("runningBalance", c.getRunningBalance());
            friendInfo.put("transactions", txns.stream().map(t -> {
                Map<String, Object> txn = new LinkedHashMap<>();
                txn.put("id", t.getId());
                txn.put("type", t.getType().name());
                txn.put("amount", t.getAmount());
                txn.put("description", t.getDescription());
                txn.put("note", t.getNote());
                txn.put("createdAt", t.getCreatedAt());
                txn.put("balanceAfter", t.getBalanceAfter());
                txn.put("deleted", t.getDeleted());
                return txn;
            }).collect(Collectors.toList()));

            friendsList.add(friendInfo);
        }

        return ResponseEntity.ok(Map.of(
            "friends", friendsList,
            "totalIowe", totalIowe,
            "totalOwedToMe", totalOwedToMe
        ));
    }
}