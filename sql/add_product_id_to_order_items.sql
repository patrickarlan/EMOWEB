-- Add product_id column to order_items table for stock management
USE emoweb;

-- Add product_id column (run only if column doesn't exist)
ALTER TABLE order_items 
ADD COLUMN product_id BIGINT UNSIGNED AFTER order_id;

-- Add index
ALTER TABLE order_items 
ADD INDEX idx_product_id (product_id);

-- Add foreign key constraint (optional, but recommended)
-- ALTER TABLE order_items 
-- ADD CONSTRAINT fk_order_items_product 
-- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
