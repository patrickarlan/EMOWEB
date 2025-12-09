CREATE TABLE IF NOT EXISTS deleted_products (
    id BIGINT UNSIGNED PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_image VARCHAR(500),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    specifications JSON,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    original_created_at TIMESTAMP,
    original_updated_at TIMESTAMP,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_by VARCHAR(255) NOT NULL COMMENT 'Admin username who deleted the product',
    deletion_reason VARCHAR(500) COMMENT 'Optional reason for deletion'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_deleted_at ON deleted_products(deleted_at);
CREATE INDEX idx_deleted_by ON deleted_products(deleted_by);
