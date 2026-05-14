package com.okcredit.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_read", columnList = "is_read")
})
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private String title;
    @Column(length = 500) private String message;
    @Column(name = "is_read", nullable = false) private Boolean isRead = false;
    private String type;
    private Long relatedCustomerId;
    @CreatedDate @Column(nullable = false, updatable = false) private LocalDateTime createdAt;

    public Notification() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getRelatedCustomerId() { return relatedCustomerId; }
    public void setRelatedCustomerId(Long relatedCustomerId) { this.relatedCustomerId = relatedCustomerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    @Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof Notification)) return false; Notification that = (Notification) o; return id != null && Objects.equals(id, that.id); }
    @Override public int hashCode() { return getClass().hashCode(); }
}