-- Create deleted_users table for soft delete functionality
-- This table stores users that have been deleted by admins
-- Allows for data recovery and audit trail

CREATE TABLE IF NOT EXISTS deleted_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT NOT NULL COMMENT 'Original user ID from users table',
    first_name VARCHAR(50) NOT NULL,
    middle_initial VARCHAR(5),
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    country_code VARCHAR(5),
    region VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    street_address TEXT,
    postal_code VARCHAR(20),
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    was_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Status when deleted',
    original_created_at DATETIME NOT NULL COMMENT 'Original account creation date',
    deleted_by VARCHAR(50) NOT NULL COMMENT 'Admin ID who deleted the user',
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_original_id (original_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_deleted_by (deleted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
