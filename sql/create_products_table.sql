-- Create products table for EMOWEB
USE emoweb;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  specifications JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert the three EMO AI products
INSERT INTO products (product_name, product_image, description, price, stock_quantity, specifications) VALUES
(
  'EMO-S AI ROBOT',
  '/uploads/products/emo-s.jpg',
  'Lorem Ipsum is simply dummy printing and typesetting industry',
  67.00,
  100,
  JSON_OBJECT(
    'dimensions', '3.2 x 2.6 x 4.6 cm',
    'weight', '100g',
    'camera', 'Raspi Cam',
    'microprocessor', 'Raspi 4 8GB R',
    'batteryLife', '4 hrs',
    'warranty', '1 Year'
  )
),
(
  'EMO AI PROTOTYPE',
  '/uploads/products/emo-prototype.jpg',
  'Lorem Ipsum is simply dummy printing and typesetting industry',
  40.00,
  100,
  JSON_OBJECT(
    'dimensions', '3.2 x 2.6 x 4.6 cm',
    'weight', '100g',
    'camera', 'Raspi Cam',
    'microprocessor', 'Raspi 4 8GB R',
    'batteryLife', '4 hrs',
    'warranty', '1 Year'
  )
),
(
  'EMO AI PRO',
  '/uploads/products/emo-pro.jpg',
  'Lorem Ipsum is simply dummy printing and typesetting industry',
  95.00,
  100,
  JSON_OBJECT(
    'dimensions', '3.2 x 2.6 x 4.6 cm',
    'weight', '100g',
    'camera', 'Raspi Cam',
    'microprocessor', 'Raspi 4 8GB R',
    'batteryLife', '4 hrs',
    'warranty', '1 Year'
  )
);
