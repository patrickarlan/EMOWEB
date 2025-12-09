-- Clean up duplicate products and keep only the first 3
USE emoweb;

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Keep only the first occurrence of each product (lowest ID)
-- Delete all products except the first 3
DELETE FROM products WHERE id NOT IN (
    SELECT id FROM (
        SELECT MIN(id) as id FROM products GROUP BY product_name
    ) as keep_products
);

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the remaining products
SELECT id, product_name, price, stock_quantity FROM products ORDER BY id;
