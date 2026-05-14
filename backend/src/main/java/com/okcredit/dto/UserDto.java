package com.okcredit.dto;

import com.okcredit.entity.User;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private User.Role role;
    private Boolean active;
    private Long shopId;
    private String shopName;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(Long id, String email, String name, String phone, User.Role role, Boolean active, Long shopId, String shopName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.active = active;
        this.shopId = shopId;
        this.shopName = shopName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "UserDto{id=" + id + ", email='" + email + "', name='" + name + "', phone='" + phone + "', role=" + role + ", active=" + active + ", shopId=" + shopId + ", shopName='" + shopName + "', createdAt=" + createdAt + "}";
    }

    public static Builder builder() { return new Builder(); }

    private UserDto(Builder builder) {
        this.id = builder.id;
        this.email = builder.email;
        this.name = builder.name;
        this.phone = builder.phone;
        this.role = builder.role;
        this.active = builder.active;
        this.shopId = builder.shopId;
        this.shopName = builder.shopName;
        this.createdAt = builder.createdAt;
    }

    public static class Builder {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private User.Role role;
        private Boolean active;
        private Long shopId;
        private String shopName;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder role(User.Role role) { this.role = role; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder shopId(Long shopId) { this.shopId = shopId; return this; }
        public Builder shopName(String shopName) { this.shopName = shopName; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public UserDto build() { return new UserDto(this); }
    }

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .shopId(user.getShop() != null ? user.getShop().getId() : null)
                .shopName(user.getShop() != null ? user.getShop().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
