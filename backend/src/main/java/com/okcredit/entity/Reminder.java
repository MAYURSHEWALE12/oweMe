package com.okcredit.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "reminders", indexes = {
    @Index(name = "idx_reminder_customer", columnList = "customer_id"),
    @Index(name = "idx_reminder_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    private String message;

    @Column(nullable = false)
    private LocalDateTime scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderStatus status = ReminderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ReminderType type;

    private LocalDateTime sentAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ReminderStatus {
        PENDING, SENT, FAILED, CANCELLED
    }

    public enum ReminderType {
        SMS, WHATSAPP, NOTIFICATION
    }

    public Reminder() {}

    public Reminder(Long id, Customer customer, Shop shop, String message, LocalDateTime scheduledDate, ReminderStatus status, ReminderType type, LocalDateTime sentAt, LocalDateTime createdAt) {
        this.id = id;
        this.customer = customer;
        this.shop = shop;
        this.message = message;
        this.scheduledDate = scheduledDate;
        this.status = status;
        this.type = type;
        this.sentAt = sentAt;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }

    public void setCustomer(Customer customer) { this.customer = customer; }

    public Shop getShop() { return shop; }

    public void setShop(Shop shop) { this.shop = shop; }

    public String getMessage() { return message; }

    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getScheduledDate() { return scheduledDate; }

    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }

    public ReminderStatus getStatus() { return status; }

    public void setStatus(ReminderStatus status) { this.status = status; }

    public ReminderType getType() { return type; }

    public void setType(ReminderType type) { this.type = type; }

    public LocalDateTime getSentAt() { return sentAt; }

    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private Long id;
        private Customer customer;
        private Shop shop;
        private String message;
        private LocalDateTime scheduledDate;
        private ReminderStatus status = ReminderStatus.PENDING;
        private ReminderType type;
        private LocalDateTime sentAt;
        private LocalDateTime createdAt;

        private Builder() {}

        public Builder id(Long id) { this.id = id; return this; }

        public Builder customer(Customer customer) { this.customer = customer; return this; }

        public Builder shop(Shop shop) { this.shop = shop; return this; }

        public Builder message(String message) { this.message = message; return this; }

        public Builder scheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; return this; }

        public Builder status(ReminderStatus status) { this.status = status; return this; }

        public Builder type(ReminderType type) { this.type = type; return this; }

        public Builder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }

        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Reminder build() {
            return new Reminder(id, customer, shop, message, scheduledDate, status, type, sentAt, createdAt);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Reminder)) return false;
        Reminder that = (Reminder) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Reminder{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", scheduledDate=" + scheduledDate +
                ", status=" + status +
                ", type=" + type +
                ", sentAt=" + sentAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
