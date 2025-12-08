-- Add role column to users table
-- Role can be 'user' or 'admin'
-- Default is 'user' for all existing and new users

ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
AFTER email;

-- Add index for faster role-based queries
CREATE INDEX idx_user_role ON users(role);
