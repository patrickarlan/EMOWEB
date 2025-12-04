-- Initialize database and users table for EMOWEB
CREATE DATABASE IF NOT EXISTS emoweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emoweb;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  middle_initial CHAR(1),
  last_name VARCHAR(100),
  contact_number VARCHAR(50),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
