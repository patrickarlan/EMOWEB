-- Add profile_picture column to users table
ALTER TABLE users 
ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL 
AFTER country_code;

-- Optional: Add a comment to describe the column
ALTER TABLE users 
MODIFY COLUMN profile_picture VARCHAR(255) 
COMMENT 'Path to user profile picture stored in uploads folder';
