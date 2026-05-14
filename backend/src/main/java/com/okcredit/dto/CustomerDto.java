package com.okcredit.dto;

import com.okcredit.entity.Customer;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerDto {
    private Long id;

    @NotBlank(message = "Customer name is required")
    private String name;

    private String phone;
    private String email;
    private String address;
    private String notes;
    private BigDecimal totalCreditGiven;
    private BigDecimal totalPaymentReceived;
    private BigDecimal runningBalance;
    private Long userId;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CustomerDto() {}

    public CustomerDto(Long id, String name, String phone, String email, String address, String notes, BigDecimal totalCreditGiven, BigDecimal totalPaymentReceived, BigDecimal runningBalance, Long userId, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
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
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "CustomerDto{id=" + id + ", name='" + name + "', phone='" + phone + "', email='" + email + "', address='" + address + "', notes='" + notes + "', totalCreditGiven=" + totalCreditGiven + ", totalPaymentReceived=" + totalPaymentReceived + ", runningBalance=" + runningBalance + ", userId=" + userId + ", active=" + active + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt + "}";
    }

    public static Builder builder() { return new Builder(); }

    private CustomerDto(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.phone = builder.phone;
        this.email = builder.email;
        this.address = builder.address;
        this.notes = builder.notes;
        this.totalCreditGiven = builder.totalCreditGiven;
        this.totalPaymentReceived = builder.totalPaymentReceived;
        this.runningBalance = builder.runningBalance;
        this.userId = builder.userId;
        this.active = builder.active;
        this.createdAt = builder.createdAt;
        this.updatedAt = builder.updatedAt;
    }

    public static class Builder {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private String address;
        private String notes;
        private BigDecimal totalCreditGiven;
        private BigDecimal totalPaymentReceived;
        private BigDecimal runningBalance;
        private Long userId;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

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
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public CustomerDto build() { return new CustomerDto(this); }
    }

    public static CustomerDto fromEntity(Customer customer) {
        return CustomerDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .notes(customer.getNotes())
                .totalCreditGiven(customer.getTotalCreditGiven())
                .totalPaymentReceived(customer.getTotalPaymentReceived())
                .runningBalance(customer.getRunningBalance())
                .userId(customer.getUserId())
                .active(customer.getActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public Customer toEntity() {
        return Customer.builder()
                .id(this.id)
                .name(this.name)
                .phone(this.phone)
                .email(this.email)
                .address(this.address)
                .notes(this.notes)
                .userId(this.userId)
                .build();
    }
}
