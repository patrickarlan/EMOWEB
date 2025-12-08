-- Fix deleted_users table column name from address to street_address
-- This ensures consistency with the users table

-- Check if the column exists and rename it
ALTER TABLE deleted_users 
CHANGE COLUMN address street_address TEXT;

-- Verify the change
DESCRIBE deleted_users;
