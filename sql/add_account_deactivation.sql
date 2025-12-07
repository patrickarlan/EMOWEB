-- Add account deactivation columns to users table
ALTER TABLE users 
ADD COLUMN is_active TINYINT(1) DEFAULT 1 
AFTER profile_picture;

ALTER TABLE users 
ADD COLUMN deactivated_until DATETIME DEFAULT NULL 
AFTER is_active;

-- Add comments to describe the columns
ALTER TABLE users 
MODIFY COLUMN is_active TINYINT(1) DEFAULT 1 
COMMENT 'User account status: 1 = active, 0 = deactivated';

ALTER TABLE users 
MODIFY COLUMN deactivated_until DATETIME DEFAULT NULL 
COMMENT 'Date until which the account is deactivated';
