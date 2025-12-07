-- Add address fields to users table
USE emoweb;

ALTER TABLE users
ADD COLUMN region VARCHAR(50) AFTER contact_number,
ADD COLUMN country VARCHAR(100) AFTER region,
ADD COLUMN city VARCHAR(100) AFTER country,
ADD COLUMN street_address TEXT AFTER city,
ADD COLUMN postal_code VARCHAR(20) AFTER street_address;
