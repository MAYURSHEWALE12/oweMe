package com.okcredit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Phone is required")
        private String phone;

        private String shopName;
        private String shopAddress;

        public RegisterRequest() {}

        public RegisterRequest(String name, String email, String password, String phone, String shopName, String shopAddress) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.phone = phone;
            this.shopName = shopName;
            this.shopAddress = shopAddress;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }
        public String getShopAddress() { return shopAddress; }
        public void setShopAddress(String shopAddress) { this.shopAddress = shopAddress; }

        @Override
        public String toString() {
            return "RegisterRequest{name='" + name + "', email='" + email + "', password='" + password + "', phone='" + phone + "', shopName='" + shopName + "', shopAddress='" + shopAddress + "'}";
        }

        public static Builder builder() { return new Builder(); }

        private RegisterRequest(Builder builder) {
            this.name = builder.name;
            this.email = builder.email;
            this.password = builder.password;
            this.phone = builder.phone;
            this.shopName = builder.shopName;
            this.shopAddress = builder.shopAddress;
        }

        public static class Builder {
            private String name;
            private String email;
            private String password;
            private String phone;
            private String shopName;
            private String shopAddress;

            public Builder name(String name) { this.name = name; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder shopName(String shopName) { this.shopName = shopName; return this; }
            public Builder shopAddress(String shopAddress) { this.shopAddress = shopAddress; return this; }

            public RegisterRequest build() { return new RegisterRequest(this); }
        }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        @Override
        public String toString() {
            return "LoginRequest{email='" + email + "', password='" + password + "'}";
        }

        public static Builder builder() { return new Builder(); }

        private LoginRequest(Builder builder) {
            this.email = builder.email;
            this.password = builder.password;
        }

        public static class Builder {
            private String email;
            private String password;

            public Builder email(String email) { this.email = email; return this; }
            public Builder password(String password) { this.password = password; return this; }

            public LoginRequest build() { return new LoginRequest(this); }
        }
    }

    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private Long expiresIn;
        private UserDto user;

        public AuthResponse() {}

        public AuthResponse(String accessToken, String refreshToken, String tokenType, Long expiresIn, UserDto user) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
            this.user = user;
        }

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }

        @Override
        public String toString() {
            return "AuthResponse{accessToken='" + accessToken + "', refreshToken='" + refreshToken + "', tokenType='" + tokenType + "', expiresIn=" + expiresIn + ", user=" + user + "}";
        }

        public static Builder builder() { return new Builder(); }

        private AuthResponse(Builder builder) {
            this.accessToken = builder.accessToken;
            this.refreshToken = builder.refreshToken;
            this.tokenType = builder.tokenType;
            this.expiresIn = builder.expiresIn;
            this.user = builder.user;
        }

        public static class Builder {
            private String accessToken;
            private String refreshToken;
            private String tokenType;
            private Long expiresIn;
            private UserDto user;

            public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
            public Builder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
            public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
            public Builder expiresIn(Long expiresIn) { this.expiresIn = expiresIn; return this; }
            public Builder user(UserDto user) { this.user = user; return this; }

            public AuthResponse build() { return new AuthResponse(this); }
        }
    }

    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public RefreshTokenRequest() {}

        public RefreshTokenRequest(String refreshToken) {
            this.refreshToken = refreshToken;
        }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

        @Override
        public String toString() {
            return "RefreshTokenRequest{refreshToken='" + refreshToken + "'}";
        }

        public static Builder builder() { return new Builder(); }

        private RefreshTokenRequest(Builder builder) {
            this.refreshToken = builder.refreshToken;
        }

        public static class Builder {
            private String refreshToken;

            public Builder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }

            public RefreshTokenRequest build() { return new RefreshTokenRequest(this); }
        }
    }
}
