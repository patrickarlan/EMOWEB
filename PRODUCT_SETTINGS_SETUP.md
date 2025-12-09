# Product Settings Setup Guide

## Overview
This guide helps you set up the Product Management system in the Admin Dashboard.

## Database Setup

### Step 1: Create deleted_products Table
Run the following SQL file in MySQL Workbench or your preferred MySQL client:

```
sql/create_deleted_products_table.sql
```

Or execute this SQL directly:

```sql
USE emoweb;

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
```

## Features

### Product Management
Access via Admin Dashboard → Product M panel

#### Stock Management
- View all products with current stock levels
- Edit stock quantities for each product
- Low stock warning (< 10 units) displayed in orange

#### Product Editing
- Click "Edit" button on any product
- Update: Product name, Description, Price, Stock quantity
- Toggle product availability (Active/Inactive)

#### Sold Out Feature
- "Mark Sold Out" button sets product to inactive
- "Activate" button reactivates sold-out products
- Sold-out products shown with reduced opacity

#### Product Deletion
- Soft delete: Moves product to `deleted_products` table
- Tracks who deleted it and when
- Original data preserved for recovery

#### Order Management
- Switch to "User Orders" tab
- View all customer orders with product details
- Update order status: Pending → Processing → Shipped → Delivered
- Mark orders as Cancelled

## API Endpoints

### Product Routes (Admin Only)
- `GET /api/admin/products` - List all products
- `GET /api/admin/products/:id` - Get single product
- `PUT /api/admin/products/:id` - Update product
- `PATCH /api/admin/products/:id/toggle-active` - Toggle active status
- `DELETE /api/admin/products/:id` - Soft delete product
- `GET /api/admin/deleted-products` - View deleted products

### Order Routes (Admin Only)
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/products/:id/orders` - Get orders for specific product

## Authentication
- Requires admin authentication (Database Admin or Super Admin)
- Super Admin credentials from `.env` file
- Database Admins have `role='admin'` in users table

## File Structure
```
src/backend/dashboards/admindash/
├── components/
│   ├── ProductSettings.jsx       # Main component
│   └── styles/
│       └── ProductSettings.css    # Component styling
server/src/routes/
└── admin.js                       # Backend routes (extended)
sql/
└── create_deleted_products_table.sql  # Database migration
```

## Usage Instructions

1. **Login as Admin**
   - Use super admin credentials from `.env`, OR
   - Login with a database user where `role='admin'`

2. **Navigate to Admin Dashboard**
   - After login, you'll be redirected to `/admindash`

3. **Open Product Management**
   - Click "Product M" panel (default active)
   - View product grid with all EMO products

4. **Manage Stock**
   - View current stock levels
   - Click "Edit" to modify quantities
   - Save changes

5. **Handle Sold Out Products**
   - Click "Mark Sold Out" to deactivate
   - Product becomes unavailable to customers
   - Click "Activate" to restore

6. **Delete Products**
   - Click "Delete" button
   - Confirm deletion in modal
   - Product moves to deleted_products table

7. **Manage Orders**
   - Switch to "User Orders" tab
   - View all customer orders
   - Update order statuses as needed

## Styling
- Orange/Red gradient theme (admin color scheme)
- Glassmorphic cards with backdrop blur
- Responsive grid layout (auto-fill columns)
- Hover effects and animations
- Status badges with color coding

## Notes
- All product deletions are soft deletes (recoverable)
- Super admin actions logged as "Super Admin"
- Database admin actions logged with their username
- Low stock threshold: 10 units
- Orders grouped by order number with product list
