-- Add country_code field for phone numbers
USE emoweb;

ALTER TABLE users
ADD COLUMN country_code VARCHAR(10) DEFAULT '+63' AFTER postal_code;
