package com.okcredit.dto;

import com.okcredit.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {
    private Long id;

    private Transaction.TransactionType type;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String description;
    private String note;
    private Long customerId;
    private String customerName;
    private BigDecimal balanceAfter;
    private Boolean deleted;
    private LocalDateTime createdAt;
    private String createdByName;

    public TransactionDto() {}

    public TransactionDto(Long id, Transaction.TransactionType type, BigDecimal amount, String description, String note, Long customerId, String customerName, BigDecimal balanceAfter, Boolean deleted, LocalDateTime createdAt, String createdByName) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.note = note;
        this.customerId = customerId;
        this.customerName = customerName;
        this.balanceAfter = balanceAfter;
        this.deleted = deleted;
        this.createdAt = createdAt;
        this.createdByName = createdByName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Transaction.TransactionType getType() { return type; }
    public void setType(Transaction.TransactionType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    @Override
    public String toString() {
        return "TransactionDto{id=" + id + ", type=" + type + ", amount=" + amount + ", description='" + description + "', note='" + note + "', customerId=" + customerId + ", customerName='" + customerName + "', balanceAfter=" + balanceAfter + ", deleted=" + deleted + ", createdAt=" + createdAt + ", createdByName='" + createdByName + "'}";
    }

    public static Builder builder() { return new Builder(); }

    private TransactionDto(Builder builder) {
        this.id = builder.id;
        this.type = builder.type;
        this.amount = builder.amount;
        this.description = builder.description;
        this.note = builder.note;
        this.customerId = builder.customerId;
        this.customerName = builder.customerName;
        this.balanceAfter = builder.balanceAfter;
        this.deleted = builder.deleted;
        this.createdAt = builder.createdAt;
        this.createdByName = builder.createdByName;
    }

    public static class Builder {
        private Long id;
        private Transaction.TransactionType type;
        private BigDecimal amount;
        private String description;
        private String note;
        private Long customerId;
        private String customerName;
        private BigDecimal balanceAfter;
        private Boolean deleted;
        private LocalDateTime createdAt;
        private String createdByName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder type(Transaction.TransactionType type) { this.type = type; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder note(String note) { this.note = note; return this; }
        public Builder customerId(Long customerId) { this.customerId = customerId; return this; }
        public Builder customerName(String customerName) { this.customerName = customerName; return this; }
        public Builder balanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; return this; }
        public Builder deleted(Boolean deleted) { this.deleted = deleted; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder createdByName(String createdByName) { this.createdByName = createdByName; return this; }

        public TransactionDto build() { return new TransactionDto(this); }
    }

    public static TransactionDto fromEntity(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .note(transaction.getNote())
                .customerId(transaction.getCustomer().getId())
                .customerName(transaction.getCustomer().getName())
                .balanceAfter(transaction.getBalanceAfter())
                .deleted(transaction.getDeleted())
                .createdAt(transaction.getCreatedAt())
                .createdByName(transaction.getCreatedBy() != null ? transaction.getCreatedBy().getName() : null)
                .build();
    }
}
