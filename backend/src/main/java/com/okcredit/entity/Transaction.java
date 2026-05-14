package com.okcredit.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_customer", columnList = "customer_id"),
    @Index(name = "idx_transaction_shop", columnList = "shop_id"),
    @Index(name = "idx_transaction_date", columnList = "created_at"),
    @Index(name = "idx_transaction_type", columnList = "type")
})
@EntityListeners(AuditingEntityListener.class)
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    private String description;

    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false)
    private BigDecimal balanceAfter = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean deleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum TransactionType {
        CREDIT_GIVEN, PAYMENT_RECEIVED
    }

    public Transaction() {}

    public Transaction(Long id, TransactionType type, BigDecimal amount, String description, String note, Customer customer, Shop shop, User createdBy, BigDecimal balanceAfter, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.note = note;
        this.customer = customer;
        this.shop = shop;
        this.createdBy = createdBy;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public TransactionType getType() { return type; }

    public void setType(TransactionType type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }

    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getNote() { return note; }

    public void setNote(String note) { this.note = note; }

    public Customer getCustomer() { return customer; }

    public void setCustomer(Customer customer) { this.customer = customer; }

    public Shop getShop() { return shop; }

    public void setShop(Shop shop) { this.shop = shop; }

    public User getCreatedBy() { return createdBy; }

    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public BigDecimal getBalanceAfter() { return balanceAfter; }

    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }

    public Boolean getDeleted() { return deleted; }

    public void setDeleted(Boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Long id;
        private TransactionType type;
        private BigDecimal amount;
        private String description;
        private String note;
        private Customer customer;
        private Shop shop;
        private User createdBy;
        private BigDecimal balanceAfter = BigDecimal.ZERO;
        private Boolean deleted = false;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private Builder() {}

        public Builder id(Long id) { this.id = id; return this; }

        public Builder type(TransactionType type) { this.type = type; return this; }

        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }

        public Builder description(String description) { this.description = description; return this; }

        public Builder note(String note) { this.note = note; return this; }

        public Builder customer(Customer customer) { this.customer = customer; return this; }

        public Builder shop(Shop shop) { this.shop = shop; return this; }

        public Builder createdBy(User createdBy) { this.createdBy = createdBy; return this; }

        public Builder balanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; return this; }

        public Builder deleted(Boolean deleted) { this.deleted = deleted; return this; }

        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Transaction build() {
            return new Transaction(id, type, amount, description, note, customer, shop, createdBy, balanceAfter, createdAt, updatedAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction)) return false;
        Transaction that = (Transaction) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", type=" + type +
                ", amount=" + amount +
                ", description='" + description + '\'' +
                ", note='" + note + '\'' +
                ", balanceAfter=" + balanceAfter +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
