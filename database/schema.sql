-- OkCredit Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS okcredit;
USE okcredit;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'SHOP_OWNER', 'STAFF') NOT NULL DEFAULT 'SHOP_OWNER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    shop_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_shop (shop_id)
);

-- Shops table
CREATE TABLE shops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    address VARCHAR(500),
    notes TEXT,
    total_credit_given DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_payment_received DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    running_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    shop_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_shop (shop_id),
    INDEX idx_customer_phone (phone),
    CONSTRAINT fk_customer_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- Transactions table
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('CREDIT_GIVEN', 'PAYMENT_RECEIVED') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    note TEXT,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    created_by BIGINT,
    balance_after DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transaction_customer (customer_id),
    INDEX idx_transaction_shop (shop_id),
    INDEX idx_transaction_date (created_at),
    INDEX idx_transaction_type (type),
    CONSTRAINT fk_transaction_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_transaction_shop FOREIGN KEY (shop_id) REFERENCES shops(id),
    CONSTRAINT fk_transaction_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Reminders table
CREATE TABLE reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    message TEXT,
    scheduled_date DATETIME NOT NULL,
    status ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    type ENUM('SMS', 'WHATSAPP', 'NOTIFICATION'),
    sent_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reminder_customer (customer_id),
    INDEX idx_reminder_status (status),
    CONSTRAINT fk_reminder_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_reminder_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- Foreign key for users (after shops table exists)
ALTER TABLE users ADD CONSTRAINT fk_user_shop FOREIGN KEY (shop_id) REFERENCES shops(id);
