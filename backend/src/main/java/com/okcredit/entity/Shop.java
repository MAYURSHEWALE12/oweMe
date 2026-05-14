package com.okcredit.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "shops")
@EntityListeners(AuditingEntityListener.class)
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String phone;

    private String email;

    private String gstNumber;

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Customer> customers = new ArrayList<>();

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Shop() {}

    public Shop(Long id, String name, String address, String phone, String email, String gstNumber, List<User> users, List<Customer> customers, List<Transaction> transactions, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.gstNumber = gstNumber;
        this.users = users;
        this.customers = customers;
        this.transactions = transactions;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }

    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getGstNumber() { return gstNumber; }

    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public List<User> getUsers() { return users; }

    public void setUsers(List<User> users) { this.users = users; }

    public List<Customer> getCustomers() { return customers; }

    public void setCustomers(List<Customer> customers) { this.customers = customers; }

    public List<Transaction> getTransactions() { return transactions; }

    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Long id;
        private String name;
        private String address;
        private String phone;
        private String email;
        private String gstNumber;
        private List<User> users = new ArrayList<>();
        private List<Customer> customers = new ArrayList<>();
        private List<Transaction> transactions = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private Builder() {}

        public Builder id(Long id) { this.id = id; return this; }

        public Builder name(String name) { this.name = name; return this; }

        public Builder address(String address) { this.address = address; return this; }

        public Builder phone(String phone) { this.phone = phone; return this; }

        public Builder email(String email) { this.email = email; return this; }

        public Builder gstNumber(String gstNumber) { this.gstNumber = gstNumber; return this; }

        public Builder users(List<User> users) { this.users = users; return this; }

        public Builder customers(List<Customer> customers) { this.customers = customers; return this; }

        public Builder transactions(List<Transaction> transactions) { this.transactions = transactions; return this; }

        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Shop build() {
            return new Shop(id, name, address, phone, email, gstNumber, users, customers, transactions, createdAt, updatedAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Shop)) return false;
        Shop that = (Shop) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Shop{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", gstNumber='" + gstNumber + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
