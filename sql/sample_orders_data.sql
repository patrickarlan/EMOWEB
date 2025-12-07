-- Sample orders data for testing
-- Replace USER_ID_HERE with an actual user ID from your users table

USE emoweb;

-- Insert sample orders
INSERT INTO orders (user_id, order_number, status, payment_method, subtotal, shipping_fee, total, shipping_address, order_date) VALUES
-- Order 1 - Delivered
(1, 'ORD-2024-001', 'delivered', 'Credit Card', 67.00, 10.00, 77.00, '123 Main St, Manila, Philippines', '2024-11-15 10:30:00'),

-- Order 2 - Shipped
(1, 'ORD-2024-002', 'shipped', 'PayPal', 135.00, 15.00, 150.00, '123 Main St, Manila, Philippines', '2024-11-28 14:20:00'),

-- Order 3 - Processing
(1, 'ORD-2024-003', 'processing', 'Cash on Delivery', 95.00, 10.00, 105.00, '123 Main St, Manila, Philippines', '2024-12-05 09:15:00'),

-- Order 4 - Pending
(1, 'ORD-2024-004', 'pending', 'GCash', 202.00, 15.00, 217.00, '123 Main St, Manila, Philippines', '2024-12-06 16:45:00');

-- Insert order items for Order 1
INSERT INTO order_items (order_id, product_name, product_image, quantity, price, subtotal) VALUES
(1, 'EMO-S AI ROBOT', '/uploads/products/emo-s.jpg', 1, 67.00, 67.00);

-- Insert order items for Order 2
INSERT INTO order_items (order_id, product_name, product_image, quantity, price, subtotal) VALUES
(2, 'EMO AI PRO', '/uploads/products/emo-pro.jpg', 1, 95.00, 95.00),
(2, 'EMO AI PROTOTYPE', '/uploads/products/emo-prototype.jpg', 1, 40.00, 40.00);

-- Insert order items for Order 3
INSERT INTO order_items (order_id, product_name, product_image, quantity, price, subtotal) VALUES
(3, 'EMO AI PRO', '/uploads/products/emo-pro.jpg', 1, 95.00, 95.00);

-- Insert order items for Order 4
INSERT INTO order_items (order_id, product_name, product_image, quantity, price, subtotal) VALUES
(4, 'EMO-S AI ROBOT', '/uploads/products/emo-s.jpg', 2, 67.00, 134.00),
(4, 'EMO AI PROTOTYPE', '/uploads/products/emo-prototype.jpg', 1, 40.00, 40.00),
(4, 'EMO AI PRO', '/uploads/products/emo-pro.jpg', 1, 95.00, 95.00);

-- Note: Make sure to replace the user_id (1) with your actual user ID
-- You can find your user ID by running: SELECT id, username FROM users;
