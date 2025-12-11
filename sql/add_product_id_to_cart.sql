-- Add product_id column to cart table for stock management
USE emoweb;

-- Add product_id column (run only if column doesn't exist)
ALTER TABLE cart 
ADD COLUMN product_id BIGINT UNSIGNED AFTER user_id;

-- Add index
ALTER TABLE cart 
ADD INDEX idx_product_id (product_id);

-- Add foreign key constraint (optional)
-- ALTER TABLE cart 
-- ADD CONSTRAINT fk_cart_product 
-- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
