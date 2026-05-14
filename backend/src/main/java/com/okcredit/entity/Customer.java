package com.okcredit.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_shop", columnList = "shop_id"),
    @Index(name = "idx_customer_phone", columnList = "phone")
})
@EntityListeners(AuditingEntityListener.class)
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    private String email;

    private String address;

    private String notes;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalCreditGiven = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalPaymentReceived = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal runningBalance = BigDecimal.ZERO;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    @Column(nullable = false)
    private Boolean active = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Customer() {}

    public Customer(Long id, String name, String phone, String email, String address, String notes, BigDecimal totalCreditGiven, BigDecimal totalPaymentReceived, BigDecimal runningBalance, Long userId, Shop shop, List<Transaction> transactions, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.notes = notes;
        this.totalCreditGiven = totalCreditGiven;
        this.totalPaymentReceived = totalPaymentReceived;
        this.runningBalance = runningBalance;
        this.userId = userId;
        this.shop = shop;
        this.transactions = transactions;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }

    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public String getNotes() { return notes; }

    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getTotalCreditGiven() { return totalCreditGiven; }

    public void setTotalCreditGiven(BigDecimal totalCreditGiven) { this.totalCreditGiven = totalCreditGiven; }

    public BigDecimal getTotalPaymentReceived() { return totalPaymentReceived; }

    public void setTotalPaymentReceived(BigDecimal totalPaymentReceived) { this.totalPaymentReceived = totalPaymentReceived; }

    public BigDecimal getRunningBalance() { return runningBalance; }

    public void setRunningBalance(BigDecimal runningBalance) { this.runningBalance = runningBalance; }

    public Long getUserId() { return userId; }

    public void setUserId(Long userId) { this.userId = userId; }

    public Shop getShop() { return shop; }

    public void setShop(Shop shop) { this.shop = shop; }

    public List<Transaction> getTransactions() { return transactions; }

    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    public Boolean getActive() { return active; }

    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private String address;
        private String notes;
        private BigDecimal totalCreditGiven = BigDecimal.ZERO;
        private BigDecimal totalPaymentReceived = BigDecimal.ZERO;
        private BigDecimal runningBalance = BigDecimal.ZERO;
        private Long userId;
        private Shop shop;
        private List<Transaction> transactions = new ArrayList<>();
        private Boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private Builder() {}

        public Builder id(Long id) { this.id = id; return this; }

        public Builder name(String name) { this.name = name; return this; }

        public Builder phone(String phone) { this.phone = phone; return this; }

        public Builder email(String email) { this.email = email; return this; }

        public Builder address(String address) { this.address = address; return this; }

        public Builder notes(String notes) { this.notes = notes; return this; }

        public Builder totalCreditGiven(BigDecimal totalCreditGiven) { this.totalCreditGiven = totalCreditGiven; return this; }

        public Builder totalPaymentReceived(BigDecimal totalPaymentReceived) { this.totalPaymentReceived = totalPaymentReceived; return this; }

        public Builder runningBalance(BigDecimal runningBalance) { this.runningBalance = runningBalance; return this; }

        public Builder userId(Long userId) { this.userId = userId; return this; }

        public Builder shop(Shop shop) { this.shop = shop; return this; }

        public Builder transactions(List<Transaction> transactions) { this.transactions = transactions; return this; }

        public Builder active(Boolean active) { this.active = active; return this; }

        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Customer build() {
            return new Customer(id, name, phone, email, address, notes, totalCreditGiven, totalPaymentReceived, runningBalance, userId, shop, transactions, active, createdAt, updatedAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Customer)) return false;
        Customer that = (Customer) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                ", notes='" + notes + '\'' +
                ", totalCreditGiven=" + totalCreditGiven +
                ", totalPaymentReceived=" + totalPaymentReceived +
                ", runningBalance=" + runningBalance +
                ", active=" + active +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
